import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';
import { PRICING } from '@/lib/stripe';

/**
 * 检查并更新用户订阅的有效性
 * @param userId 用户ID
 * @returns 用户是否有有效的订阅
 */
export async function checkAndUpdateSubscriptionValidity(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      hasActiveSubscription: true,
      stripeCurrentPeriodEnd: true,
      stripeSubscriptionId: true
    }
  });

  if (!user) {
    return false;
  }

  // 如果用户没有激活订阅，直接返回false
  if (!user.hasActiveSubscription) {
    return false;
  }

  // 检查订阅是否已过期
  if (!user.stripeCurrentPeriodEnd || user.stripeCurrentPeriodEnd <= new Date()) {
    // 订阅已过期，更新状态
    await prisma.user.update({
      where: { id: userId },
      data: { hasActiveSubscription: false }
    });
    console.log(`用户 ${userId} 的订阅已过期，已更新状态`);
    return false;
  }

  // 订阅仍然有效
  return true;
}

// 更新用户的Stripe订阅信息
export async function updateUserSubscription(
  userId: string,
  data: {
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    stripeCurrentPeriodEnd?: Date | null;
    hasActiveSubscription?: boolean;
    subscriptionPlan?: string;
    subscriptionExpiresAt?: Date;
  }
) {
  try {
    // 首先获取当前用户数据，用于比较变更前后的状态
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        hasActiveSubscription: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true
      }
    });

    // 如果提供了结束时间且大于当前时间，但未明确设置hasActiveSubscription
    // 则自动将hasActiveSubscription设为true
    if (data.stripeCurrentPeriodEnd && data.stripeCurrentPeriodEnd > new Date() && data.hasActiveSubscription === undefined) {
      data.hasActiveSubscription = true;
    }
    
    // 如果提供了结束时间且小于等于当前时间，自动设置hasActiveSubscription为false
    if (data.stripeCurrentPeriodEnd && data.stripeCurrentPeriodEnd <= new Date() && data.hasActiveSubscription === undefined) {
      data.hasActiveSubscription = false;
    }

    // 如果需要，根据价格ID判断订阅计划类型
    if (data.stripePriceId && !data.subscriptionPlan) {
      // 根据价格ID确定计划类型
      if (data.stripePriceId === PRICING.MONTHLY) {
        data.subscriptionPlan = 'monthly';
      } else if (data.stripePriceId === PRICING.YEARLY) {
        data.subscriptionPlan = 'yearly';
      }
    }
    
    // 如果有过期时间，同时更新明确的订阅到期时间
    if (data.stripeCurrentPeriodEnd && !data.subscriptionExpiresAt) {
      data.subscriptionExpiresAt = data.stripeCurrentPeriodEnd;
    }

    // 详细记录订阅变更信息
    console.log(`更新用户 ${userId} 的订阅信息:`, {
      前状态: currentUser ? {
        订阅ID: currentUser.stripeSubscriptionId,
        价格ID: currentUser.stripePriceId,
        计划类型: currentUser.subscriptionPlan,
        到期日期: currentUser.stripeCurrentPeriodEnd,
        到期时间: currentUser.subscriptionExpiresAt,
        是否激活: currentUser.hasActiveSubscription
      } : '用户不存在',
      变更为: {
        订阅ID: data.stripeSubscriptionId,
        价格ID: data.stripePriceId,
        计划类型: data.subscriptionPlan,
        到期日期: data.stripeCurrentPeriodEnd,
        到期时间: data.subscriptionExpiresAt,
        是否激活: data.hasActiveSubscription
      }
    });

    // 使用Prisma执行更新，但使用as any绕过类型检查
    // @ts-ignore - 我们知道这些字段在数据库中存在
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: data,
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        hasActiveSubscription: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true
      }
    });

    // 记录更新结果
    console.log(`用户 ${userId} 订阅信息更新完成:`, {
      更新后状态: {
        订阅ID: updatedUser.stripeSubscriptionId,
        价格ID: updatedUser.stripePriceId,
        计划类型: updatedUser.subscriptionPlan,
        到期日期: updatedUser.stripeCurrentPeriodEnd,
        到期时间: updatedUser.subscriptionExpiresAt,
        是否激活: updatedUser.hasActiveSubscription
      }
    });

    return updatedUser;
  } catch (error) {
    console.error(`更新用户 ${userId} 的订阅信息时出错:`, error);
    throw error;
  }
}

// 根据Stripe客户ID查找用户
export async function findUserByStripeCustomerId(customerId: string) {
  try {
    // @ts-ignore - 我们知道stripeCustomerId字段在数据库中存在
    return await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });
  } catch (error) {
    console.error('查找用户失败:', error);
    throw error;
  }
}

// 转换Stripe订阅的时间戳为Date对象
export function convertTimestampToDate(timestamp: number | undefined | null): Date | null {
  // 检查timestamp是否有效
  if (!timestamp) {
    console.warn('收到无效的时间戳:', timestamp);
    return null;
  }
  
  try {
    // Stripe的时间戳是秒级Unix时间戳，需要转换为毫秒
    const date = new Date(timestamp * 1000);
    
    // 验证日期是否有效
    if (isNaN(date.getTime())) {
      console.error('时间戳转换为日期失败:', timestamp);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('时间戳转换错误:', error);
    return null;
  }
} 