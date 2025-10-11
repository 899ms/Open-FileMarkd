import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';
import { PRICING } from '@/lib/stripe';

/**
 * 检查用户订阅状态API
 * 返回用户的订阅信息，包括文件大小限制
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: '未登录',
        hasActiveSubscription: false,
        maxFileSizeMB: 5
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 从数据库获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        hasActiveSubscription: true,
        subscriptionPlan: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在',
        hasActiveSubscription: false,
        maxFileSizeMB: 5
      }, { status: 404 });
    }

    // 尝试从Stripe同步订阅状态 - 仅当用户有订阅ID时
    let syncedUser = user;
    
    if (user.stripeSubscriptionId && !user.hasActiveSubscription) {
      try {
        // 检查订阅在Stripe中是否有效
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        if (subscription && subscription.status === 'active') {
          // 获取价格ID
          const priceId = subscription.items.data[0]?.price.id;
          
          // 确定订阅计划类型
          const subscriptionPlan = priceId === PRICING.YEARLY ? 'yearly' : 'monthly';
          
          // 生成一个有效的结束日期
          const endDate = subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
          // 更新数据库中的状态
          syncedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              hasActiveSubscription: true,
              stripeCurrentPeriodEnd: endDate,
              stripePriceId: priceId,
              subscriptionPlan: subscriptionPlan
            },
            select: {
              id: true,
              email: true,
              stripeCustomerId: true,
              stripeSubscriptionId: true,
              stripePriceId: true,
              stripeCurrentPeriodEnd: true,
              hasActiveSubscription: true,
              subscriptionPlan: true
            }
          });
        }
      } catch (err) {
        console.error(`检查用户 ${userId} 的Stripe订阅状态失败:`, err);
        // 错误处理时仍使用原始用户数据继续
      }
    }
    
    // 确定用户当前是否有有效订阅
    let hasActiveSubscription = !!syncedUser.hasActiveSubscription;
    
    // 检查订阅是否已过期
    if (hasActiveSubscription && syncedUser.stripeCurrentPeriodEnd && syncedUser.stripeCurrentPeriodEnd <= new Date()) {
      // 订阅已过期，更新状态
      syncedUser = await prisma.user.update({
        where: { id: userId },
        data: { hasActiveSubscription: false },
        select: {
          id: true,
          email: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          stripePriceId: true,
          stripeCurrentPeriodEnd: true,
          hasActiveSubscription: true,
          subscriptionPlan: true
        }
      });
      hasActiveSubscription = false;
      console.log(`用户 ${userId} 的订阅已过期，已更新状态`);
    }
    
    // 确定用户的文件大小限制
    const maxFileSizeMB = hasActiveSubscription ? 30 : 5;

    // 计算订阅剩余天数
    const now = new Date();
    const expiryDate = syncedUser.stripeCurrentPeriodEnd;
    let remainingDays = null;
    
    if (expiryDate && hasActiveSubscription) {
      const timeDiff = expiryDate.getTime() - now.getTime();
      remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      remainingDays = remainingDays < 0 ? 0 : remainingDays;
    }
    
    // 确定订阅计划类型，如果没有从数据库中获取
    let subscriptionPlanType = syncedUser.subscriptionPlan;
    
    // 如果没有明确的计划类型，根据价格ID推断
    if (!subscriptionPlanType && syncedUser.stripePriceId) {
      if (syncedUser.stripePriceId === PRICING.YEARLY) {
        subscriptionPlanType = 'yearly';
      } else if (syncedUser.stripePriceId === PRICING.MONTHLY) {
        subscriptionPlanType = 'monthly';
      }
    }
    
    // 返回订阅信息
    return NextResponse.json({
      success: true,
      hasActiveSubscription,
      maxFileSizeMB,
      subscriptionId: syncedUser.stripeSubscriptionId,
      customerID: syncedUser.stripeCustomerId,
      expirationDate: expiryDate,
      remainingDays,
      subscriptionPlan: subscriptionPlanType,
      priceId: syncedUser.stripePriceId
    });
    
  } catch (error: any) {
    console.error('检查订阅状态失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '检查订阅状态失败',
      hasActiveSubscription: false,
      maxFileSizeMB: 5
    }, { status: 500 });
  }
}