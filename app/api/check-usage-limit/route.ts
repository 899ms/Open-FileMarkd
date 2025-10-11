import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { stripe } from '@/lib/stripe-server';
import Stripe from 'stripe';

// 免费用户每月的最大使用次数
export const FREE_USER_MONTHLY_LIMIT = 5;

export async function GET(req: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: "未授权",
        hasActiveSubscription: false,
        usageLimit: FREE_USER_MONTHLY_LIMIT,
        canUse: false
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        usageCount: true,
        usageResetDate: true,
        hasActiveSubscription: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true
      }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "用户不存在",
        hasActiveSubscription: false,
        usageLimit: FREE_USER_MONTHLY_LIMIT,
        canUse: false
      }, { status: 404 });
    }
    
    // 自动同步订阅状态 - 仅当有明显不一致时才检查Stripe
    let updatedUser = user;
    let stripeChecked = false;
    
    // 如果用户有订阅ID但hasActiveSubscription为false，检查Stripe并自动修正
    if (user.stripeSubscriptionId && !user.hasActiveSubscription) {
      try {
        // 设置超时，避免长时间等待Stripe响应
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stripe请求超时')), 3000)
        );
        
        // 检查订阅在Stripe中是否有效
        const subscriptionPromise = stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // 使用Promise.race确保不会等待太久
        const subscription = await Promise.race([
          subscriptionPromise,
          timeoutPromise
        ]) as Stripe.Subscription;
        
        stripeChecked = true;
        
        if (subscription && subscription.status === 'active') {
          // 生成一个有效的结束日期
          const endDate = subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
          // 更新数据库中的状态
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              hasActiveSubscription: true,
              stripeCurrentPeriodEnd: endDate,
              usageCount: 0 // 重置使用次数
            },
            select: {
              id: true,
              email: true,
              usageCount: true,
              usageResetDate: true,
              hasActiveSubscription: true,
              stripeCurrentPeriodEnd: true,
              stripeSubscriptionId: true
            }
          });
        }
      } catch (err) {
        console.error(`检查用户 ${userId} 的Stripe订阅状态失败:`, err);
        // 错误处理时仍使用原始用户数据继续
      }
    }
    
    // 如果是付费用户，不受限制
    if (updatedUser.hasActiveSubscription) {
      // 但首先检查订阅是否已过期
      if (updatedUser.stripeCurrentPeriodEnd && updatedUser.stripeCurrentPeriodEnd <= new Date()) {
        // 订阅已过期，更新状态
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { hasActiveSubscription: false },
          select: {
            id: true,
            email: true,
            usageCount: true,
            usageResetDate: true,
            hasActiveSubscription: true,
            stripeCurrentPeriodEnd: true,
            stripeSubscriptionId: true
          }
        });
        console.log(`用户 ${userId} 的订阅已过期，已更新状态`);
      } else {
        // 订阅仍然有效
        return NextResponse.json({
          success: true,
          canUse: true,
          usageCount: 0, // 付费用户显示0使用次数
          hasActiveSubscription: true,
          usageLimit: "无限制",
          usageResetDate: updatedUser.usageResetDate,
          unlimited: true,
          stripeChecked
        });
      }
    }
    
    const now = new Date();
    
    // 检查是否需要重置使用次数（每月1日重置）
    if (!updatedUser.usageResetDate || shouldResetUsage(updatedUser.usageResetDate)) {
      // 重置使用次数
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          usageCount: 0,
          usageResetDate: getNextResetDate()
        },
        select: {
          id: true,
          email: true,
          usageCount: true,
          usageResetDate: true,
          hasActiveSubscription: true,
          stripeCurrentPeriodEnd: true,
          stripeSubscriptionId: true
        }
      });
      
      return NextResponse.json({
        success: true,
        canUse: true,
        usageCount: 0,
        hasActiveSubscription: false,
        usageLimit: FREE_USER_MONTHLY_LIMIT,
        usageResetDate: getNextResetDate(),
        unlimited: false,
        remainingUses: FREE_USER_MONTHLY_LIMIT,
        stripeChecked
      });
    }
    
    // 检查是否达到使用次数限制
    const usageCount = updatedUser.usageCount || 0;
    const canUse = usageCount < FREE_USER_MONTHLY_LIMIT;
    
    return NextResponse.json({
      success: true,
      canUse,
      usageCount,
      hasActiveSubscription: false,
      usageLimit: FREE_USER_MONTHLY_LIMIT,
      usageResetDate: updatedUser.usageResetDate,
      unlimited: false,
      remainingUses: FREE_USER_MONTHLY_LIMIT - usageCount,
      stripeChecked
    });
  } catch (error: any) {
    console.error("检查使用次数失败:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "检查使用次数失败",
      hasActiveSubscription: false,
      usageLimit: FREE_USER_MONTHLY_LIMIT,
      canUse: false
    }, { status: 500 });
  }
}

/**
 * 检查是否应该重置使用次数
 * @param resetDate 上次重置日期
 * @returns 是否应该重置
 */
function shouldResetUsage(resetDate: Date): boolean {
  const now = new Date();
  return now >= resetDate;
}

/**
 * 获取下一个重置日期（下个月1日）
 * @returns 下一个重置日期
 */
function getNextResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
} 