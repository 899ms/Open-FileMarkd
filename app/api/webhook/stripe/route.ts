import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { findUserByStripeCustomerId, updateUserSubscription, convertTimestampToDate } from '@/lib/stripe-helpers';
import { PRICING } from '@/lib/stripe';

// Webhook处理器需要原始请求体
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log('Stripe webhook 接收到请求');
    const body = await req.text();
    const headersList = req.headers;
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      console.error('Stripe webhook 错误: 缺少stripe-signature头');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }
    
    // 验证webhook签名
    let event: Stripe.Event;
    try {
      console.log('Stripe webhook 验证签名...');
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log(`Stripe webhook 签名验证成功，事件类型: ${event.type}`);
    } catch (err: any) {
      console.error(`Stripe webhook 签名验证失败:`, err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }
    
    // 处理不同的事件类型
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          console.log('Stripe webhook 处理 checkout.session.completed 事件');
          await handleCheckoutSessionCompleted(event);
          break;
        }
        case 'invoice.payment_succeeded': {
          console.log('Stripe webhook 处理 invoice.payment_succeeded 事件');
          await handleInvoicePaymentSucceeded(event);
          break;
        }
        case 'customer.subscription.deleted': {
          console.log('Stripe webhook 处理 customer.subscription.deleted 事件');
          await handleSubscriptionDeleted(event);
          break;
        }
        default: {
          console.log(`Stripe webhook 未处理的事件类型: ${event.type}`);
        }
      }
    
      // 返回成功响应
      console.log('Stripe webhook 处理成功');
      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error(`处理 ${event.type} 事件错误:`, error);
      // 即使我们遇到错误，也返回200给Stripe
      // 这样Stripe不会重试，因为这可能是数据库的问题
      return NextResponse.json({ 
        received: true,
        warning: `处理事件时出错: ${error.message}`
      });
    }
  } catch (error: any) {
    console.error('Stripe webhook 处理错误:', error);
    return NextResponse.json(
      { error: `Webhook处理错误: ${error.message}` },
      { status: 500 }
    );
  }
}

// 处理结账会话完成事件
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  try {
    // 提取用户ID
    const userId = session.metadata?.userId || session.client_reference_id;
    
    if (!userId) {
      console.error('找不到用户ID:', session);
      throw new Error('找不到用户ID');
    }
    
    // 获取用户信息以验证邮箱
    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true,
        hasActiveSubscription: true,
        stripeCurrentPeriodEnd: true
      }
    });
    
    if (!userDetails) {
      console.error('找不到用户:', userId);
      throw new Error('找不到用户');
    }
    
    // 检查用户是否已有活跃订阅且尚未到期
    if (userDetails.hasActiveSubscription && 
        userDetails.stripeCurrentPeriodEnd && 
        userDetails.stripeCurrentPeriodEnd > new Date()) {
      console.log(`用户 ${userId} 已有活跃订阅且尚未到期，不处理此次结账会话`);
      return NextResponse.json({ 
        received: true,
        message: '用户已有活跃订阅，本次结账将被忽略' 
      });
    }
    
    // 验证支付邮箱与注册邮箱是否一致
    const paymentEmail = session.customer_email;
    if (paymentEmail && userDetails.email !== paymentEmail) {
      console.error('支付邮箱与注册邮箱不匹配:', { 
        userId, 
        registeredEmail: userDetails.email, 
        paymentEmail 
      });
      // 记录错误但继续处理，因为我们仍然有正确的userId
    }
    
    // 获取订阅详情
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    
    // 从subscription对象获取价格ID和结束时间
    const newPriceId = subscription.items.data[0].price.id;
    
    // 获取订阅的结束时间
    let periodEndTimestamp;
    if (typeof subscription.current_period_end === 'number') {
      periodEndTimestamp = subscription.current_period_end;
    } else {
      // 根据订阅类型设置不同的有效期
      console.warn('找不到current_period_end，根据订阅类型设置备选有效期');
      const isYearly = newPriceId === PRICING.YEARLY;
      const endDate = new Date();
      
      if (isYearly) {
        // 年度订阅：增加365天
        endDate.setDate(endDate.getDate() + 365);
        console.log('设置年度订阅有效期：365天');
      } else {
        // 月度订阅：增加30天
        endDate.setDate(endDate.getDate() + 30);
        console.log('设置月度订阅有效期：30天');
      }
      
      // 更新用户订阅状态
      await updateUserSubscription(userId, {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        stripePriceId: newPriceId,
        stripeCurrentPeriodEnd: endDate,
        hasActiveSubscription: true,
        subscriptionPlan: newPriceId === PRICING.YEARLY ? 'yearly' : 'monthly',
        subscriptionExpiresAt: endDate
      });
      
      console.log(`用户 ${userId} 订阅成功(使用${isYearly ? '365' : '30'}天后到期日期)`);
      return;
    }
    
    // 转换为JavaScript Date对象
    const newPeriodEndDate = new Date(periodEndTimestamp * 1000);
    
    // 验证日期有效性
    if (isNaN(newPeriodEndDate.getTime())) {
      console.error('转换后的日期无效，根据订阅类型设置备选有效期');
      const isYearly = newPriceId === PRICING.YEARLY;
      const endDate = new Date();
      
      if (isYearly) {
        // 年度订阅：增加365天
        endDate.setDate(endDate.getDate() + 365);
        console.log('设置年度订阅有效期：365天');
      } else {
        // 月度订阅：增加30天
        endDate.setDate(endDate.getDate() + 30);
        console.log('设置月度订阅有效期：30天');
      }
      
      // 更新用户订阅状态
      await updateUserSubscription(userId, {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        stripePriceId: newPriceId,
        stripeCurrentPeriodEnd: endDate,
        hasActiveSubscription: true,
        subscriptionPlan: newPriceId === PRICING.YEARLY ? 'yearly' : 'monthly',
        subscriptionExpiresAt: endDate
      });
      
      console.log(`用户 ${userId} 订阅成功(使用${isYearly ? '365' : '30'}天后到期日期)`);
      return;
    }
    
    // 简化处理：使用Stripe返回的标准到期日期
    const subscriptionPlan = newPriceId === PRICING.YEARLY ? 'yearly' : 'monthly';
    
    console.log('订阅详情:', {
      userId,
      subscriptionId: session.subscription,
      priceId: newPriceId,
      plan: subscriptionPlan,
      periodEnd: periodEndTimestamp,
      periodEndDate: newPeriodEndDate
    });
    
    // 更新用户订阅状态，使用Stripe提供的标准到期日期
    try {
      const directUpdate = await prisma.$executeRaw`
        UPDATE "User" 
        SET 
          "stripeCustomerId" = ${session.customer as string},
          "stripeSubscriptionId" = ${session.subscription as string}, 
          "stripePriceId" = ${newPriceId},
          "stripeCurrentPeriodEnd" = ${newPeriodEndDate},
          "hasActiveSubscription" = true,
          "subscriptionPlan" = ${subscriptionPlan},
          "subscriptionExpiresAt" = ${newPeriodEndDate},
          "updatedAt" = NOW()
        WHERE "id" = ${userId}
      `;
      
      console.log(`直接更新数据库结果: ${directUpdate}`);
      
    } catch (dbError) {
      console.error(`直接更新数据库失败: ${dbError}`);
      
      // 如果直接更新失败，使用helper函数
      await updateUserSubscription(userId, {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string, 
        stripePriceId: newPriceId,
        stripeCurrentPeriodEnd: newPeriodEndDate,
        hasActiveSubscription: true,
        subscriptionPlan: subscriptionPlan,
        subscriptionExpiresAt: newPeriodEndDate
      });
    }
    
    console.log(`用户 ${userId} 订阅成功，到期日期: ${newPeriodEndDate}`);
  } catch (error) {
    console.error('处理checkout.session.completed事件时出错:', error);
    throw error;
  }
}

// 处理发票支付成功事件
async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log('处理发票支付成功事件:', invoice.id);
  
  try {
    if (!invoice.subscription) {
      console.log(`发票 ${invoice.id} 没有关联的订阅`);
      return;
    }
    
    if (!invoice.customer) {
      console.log(`发票 ${invoice.id} 没有关联的顾客`);
      return;
    }
    
    // 获取用户信息
    const dbUser = await findUserByStripeCustomerId(invoice.customer as string);
    
    if (!dbUser) {
      console.error(`找不到与发票 ${invoice.id} 关联的用户`);
      return;
    }
    
    // 检查用户是否已有活跃订阅且尚未到期
    // 对于自动续费事件，我们仍然需要处理，因为这是合法的续期
    // 但如果用户ID与当前订阅ID不匹配，则说明是一个新的订阅，此时检查现有订阅是否有效
    const subscriptionDetails = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const isRenewal = dbUser.stripeSubscriptionId === invoice.subscription;
    
    if (!isRenewal && dbUser.hasActiveSubscription && 
        dbUser.stripeCurrentPeriodEnd && dbUser.stripeCurrentPeriodEnd > new Date()) {
      console.log(`用户 ${dbUser.id} 已有活跃订阅且尚未到期，不处理此次支付成功事件`);
      return NextResponse.json({ 
        received: true,
        message: '用户已有活跃订阅，本次支付将被忽略' 
      });
    }
    
    // 获取订阅的结束时间
    let periodEndTimestamp;
    if (typeof subscriptionDetails.current_period_end === 'number') {
      periodEndTimestamp = subscriptionDetails.current_period_end;
    } else {
      // 根据订阅类型设置不同的有效期
      console.warn('找不到current_period_end，根据订阅类型设置备选有效期');
      const isYearly = subscriptionDetails.items.data[0].price.id === PRICING.YEARLY;
      const endDate = new Date();
      
      if (isYearly) {
        // 年度订阅：增加365天
        endDate.setDate(endDate.getDate() + 365);
        console.log('设置年度订阅有效期：365天');
      } else {
        // 月度订阅：增加30天
        endDate.setDate(endDate.getDate() + 30);
        console.log('设置月度订阅有效期：30天');
      }
      
      // 更新用户订阅状态
      await updateUserSubscription(dbUser.id, {
        stripePriceId: subscriptionDetails.items.data[0].price.id,
        stripeCurrentPeriodEnd: endDate,
        hasActiveSubscription: true,
        subscriptionPlan: subscriptionDetails.items.data[0].price.id === PRICING.YEARLY ? 'yearly' : 'monthly',
        subscriptionExpiresAt: endDate
      });
      
      console.log(`客户 ${invoice.customer} 订阅续费成功(使用${isYearly ? '365' : '30'}天后到期日期)`);
      return;
    }
    
    // 转换为JavaScript Date对象
    const newPeriodEndDate = new Date(periodEndTimestamp * 1000);
    
    // 验证日期有效性
    if (isNaN(newPeriodEndDate.getTime())) {
      console.error('转换后的日期无效，根据订阅类型设置备选有效期');
      const isYearly = subscriptionDetails.items.data[0].price.id === PRICING.YEARLY;
      const endDate = new Date();
      
      if (isYearly) {
        // 年度订阅：增加365天
        endDate.setDate(endDate.getDate() + 365);
        console.log('设置年度订阅有效期：365天');
      } else {
        // 月度订阅：增加30天
        endDate.setDate(endDate.getDate() + 30);
        console.log('设置月度订阅有效期：30天');
      }
      
      // 更新用户订阅状态
      await updateUserSubscription(dbUser.id, {
        stripePriceId: subscriptionDetails.items.data[0].price.id,
        stripeCurrentPeriodEnd: endDate,
        hasActiveSubscription: true,
        subscriptionPlan: subscriptionDetails.items.data[0].price.id === PRICING.YEARLY ? 'yearly' : 'monthly',
        subscriptionExpiresAt: endDate
      });
      
      console.log(`客户 ${invoice.customer} 订阅续费成功(使用${isYearly ? '365' : '30'}天后到期日期)`);
      return;
    }
    
    // 简化处理：使用Stripe返回的标准到期日期
    const priceId = subscriptionDetails.items.data[0].price.id;
    const subscriptionPlan = priceId === PRICING.YEARLY ? 'yearly' : 'monthly';
    
    console.log('订阅续费详情:', {
      userId: dbUser.id,
      customer: invoice.customer,
      subscription: invoice.subscription,
      priceId: priceId,
      plan: subscriptionPlan,
      periodEnd: periodEndTimestamp,
      periodEndDate: newPeriodEndDate
    });
    
    // 更新用户订阅状态，直接使用Stripe提供的标准到期日期
    try {
      const directUpdate = await prisma.$executeRaw`
        UPDATE "User" 
        SET 
          "stripePriceId" = ${priceId},
          "stripeSubscriptionId" = ${invoice.subscription as string},
          "stripeCurrentPeriodEnd" = ${newPeriodEndDate},
          "hasActiveSubscription" = true,
          "subscriptionPlan" = ${subscriptionPlan},
          "subscriptionExpiresAt" = ${newPeriodEndDate},
          "updatedAt" = NOW()
        WHERE "id" = ${dbUser.id}
      `;
      
      console.log(`直接更新数据库结果: ${directUpdate}`);
      
    } catch (dbError) {
      console.error(`直接更新数据库失败: ${dbError}`);
      
      // 如果直接更新失败，使用helper函数
      await updateUserSubscription(dbUser.id, {
        stripePriceId: priceId,
        stripeSubscriptionId: invoice.subscription as string,
        stripeCurrentPeriodEnd: newPeriodEndDate,
        hasActiveSubscription: true,
        subscriptionPlan: subscriptionPlan,
        subscriptionExpiresAt: newPeriodEndDate
      });
    }
    
    console.log(`客户 ${invoice.customer} 订阅续费成功，到期日期: ${newPeriodEndDate.toISOString()}`);
  } catch (error) {
    console.error('处理invoice.payment_succeeded事件时出错:', error);
    throw error;
  }
}

// 处理订阅删除事件
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  // 获取客户ID
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : (subscription.customer as any).id;
  
  // 查找用户
  const user = await findUserByStripeCustomerId(customerId);
  
  if (user) {
    // 更新用户订阅信息，清除订阅相关字段
    await updateUserSubscription(user.id, {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      hasActiveSubscription: false,
      subscriptionPlan: undefined,
      subscriptionExpiresAt: undefined
    });
    
    console.log(`客户 ${customerId} 订阅已取消`);
  }
}