import { prisma } from "@/lib/prisma";

// 免费用户每月的最大使用次数
export const FREE_USER_MONTHLY_LIMIT = 5;

/**
 * 检查用户是否达到使用次数限制
 * @param userId 用户ID
 * @returns 包含用户使用情况的对象
 */
export async function checkUserUsageLimit(userId: string) {
  // 获取用户
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      usageCount: true,
      usageResetDate: true,
      hasActiveSubscription: true,
      stripeCurrentPeriodEnd: true
    }
  });

  if (!user) {
    throw new Error("用户不存在");
  }

  // 如果是付费用户且订阅未过期，不受限制
  if (user.hasActiveSubscription && user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date()) {
    return {
      canUse: true,
      usageCount: user.usageCount,
      usageLimit: "无限制",
      usageResetDate: user.usageResetDate,
      unlimited: true
    };
  }

  // 如果订阅已过期但hasActiveSubscription仍为true，需要更新状态
  if (user.hasActiveSubscription && (!user.stripeCurrentPeriodEnd || user.stripeCurrentPeriodEnd <= new Date())) {
    // 更新过期订阅状态
    await prisma.user.update({
      where: { id: userId },
      data: { hasActiveSubscription: false }
    });
    console.log(`用户 ${userId} 的订阅已过期，已更新状态`);
  }

  const now = new Date();
  
  // 检查是否需要重置使用次数（每月1日重置）
  if (!user.usageResetDate || shouldResetUsage(user.usageResetDate)) {
    // 重置使用次数
    await resetUserUsage(userId);
    return {
      canUse: true,
      usageCount: 0,
      usageLimit: FREE_USER_MONTHLY_LIMIT,
      usageResetDate: getNextResetDate(),
      unlimited: false
    };
  }

  // 检查是否达到使用次数限制
  const canUse = user.usageCount < FREE_USER_MONTHLY_LIMIT;
  
  return {
    canUse,
    usageCount: user.usageCount,
    usageLimit: FREE_USER_MONTHLY_LIMIT,
    usageResetDate: user.usageResetDate,
    unlimited: false,
    remainingUses: FREE_USER_MONTHLY_LIMIT - user.usageCount
  };
}

/**
 * 增加用户的使用次数
 * @param userId 用户ID
 */
export async function incrementUserUsage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      usageCount: true,
      usageResetDate: true,
      hasActiveSubscription: true,
      stripeCurrentPeriodEnd: true
    }
  });

  if (!user) {
    throw new Error("用户不存在");
  }

  // 检查订阅是否过期并更新状态
  if (user.hasActiveSubscription && (!user.stripeCurrentPeriodEnd || user.stripeCurrentPeriodEnd <= new Date())) {
    await prisma.user.update({
      where: { id: userId },
      data: { hasActiveSubscription: false }
    });
    console.log(`用户 ${userId} 的订阅已过期，已更新状态`);
  }

  // 如果是付费用户，仍然记录使用次数，但不限制使用
  // 如果需要重置，先重置
  if (!user.usageResetDate || shouldResetUsage(user.usageResetDate)) {
    await resetUserUsage(userId);
    await prisma.user.update({
      where: { id: userId },
      data: { usageCount: 1 }
    });
  } else {
    // 增加使用次数
    await prisma.user.update({
      where: { id: userId },
      data: { usageCount: user.usageCount + 1 }
    });
  }
}

/**
 * 重置用户的使用次数
 * @param userId 用户ID
 */
export async function resetUserUsage(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      usageCount: 0,
      usageResetDate: getNextResetDate()
    }
  });
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