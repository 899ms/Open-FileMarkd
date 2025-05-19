import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe-server';
import { PRICING } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await getServerSession(authOptions);
    
    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录后再订阅' },
        { status: 401 }
      );
    }
    
    // 确保有用户邮箱
    if (!session.user.email) {
      return NextResponse.json(
        { error: '用户邮箱不存在，无法创建订阅' },
        { status: 400 }
      );
    }
    
    // 解析请求数据
    const data = await request.json();
    const { plan } = data; // plan应该是'monthly'或'yearly'
    
    // 确定价格ID
    let priceId: string;
    if (plan === 'monthly') {
      priceId = PRICING.MONTHLY;
    } else if (plan === 'yearly') {
      priceId = PRICING.YEARLY;
    } else {
      return NextResponse.json(
        { error: '无效的订阅计划' },
        { status: 400 }
      );
    }
    
    // 检查用户当前的订阅状态
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      },
      select: {
        id: true,
        hasActiveSubscription: true,
        stripeCurrentPeriodEnd: true,
        subscriptionPlan: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '找不到用户' },
        { status: 404 }
      );
    }
    
    // 判断用户是否已有活跃的订阅，且尚未到期
    if (user.hasActiveSubscription && user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date()) {
      // 用户有活跃订阅且未到期，不允许再次订阅
      return NextResponse.json({
        error: 'subscription.activeSubscriptionError',
        currentPlan: user.subscriptionPlan,
        expiresAt: user.stripeCurrentPeriodEnd,
        remainingDays: Math.ceil((user.stripeCurrentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }, { status: 400 });
    }
    
    // 创建Stripe结账会话
    // 强制使用用户注册时的邮箱，不允许用户在Stripe界面修改
    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/`,
      customer_email: session.user.email, // 强制使用注册邮箱
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email, // 在元数据中也存储用户邮箱
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required', // 收集账单地址
      payment_method_types: ['card'],
    });
    
    // 返回结账URL
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('创建支付会话失败:', error);
    return NextResponse.json(
      { error: error.message || '创建支付会话失败' },
      { status: 500 }
    );
  }
} 