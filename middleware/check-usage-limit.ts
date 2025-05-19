import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 免费用户每月最大使用次数
const FREE_USER_MONTHLY_LIMIT = 5;

/**
 * 中间件函数，用于检查用户使用次数限制
 * @param req 请求对象
 * @param userId 用户ID
 * @returns 如果用户可以使用，返回true；否则返回包含错误信息的响应对象
 */
export async function checkUserUsageLimitMiddleware(userId: string) {
  try {
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "用户不存在" },
          { status: 404 }
        )
      };
    }

    // 如果是付费用户，不受限制
    if (user.hasActiveSubscription) {
      return { allowed: true };
    }

    // 检查是否需要重置使用次数
    const now = new Date();
    if (!user.usageResetDate || now >= user.usageResetDate) {
      // 不需要立即重置，因为这将在增加使用次数时处理
      // 这里只检查是否允许使用
      return { allowed: true };
    }

    // 检查是否达到使用次数限制
    if ((user.usageCount || 0) >= FREE_USER_MONTHLY_LIMIT) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: "已达到本月免费使用次数限制",
            limit: FREE_USER_MONTHLY_LIMIT,
            usageCount: user.usageCount,
            resetDate: user.usageResetDate,
            upgradeUrl: "/#pricing"
          },
          { status: 403 }
        )
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("检查使用次数失败:", error);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "检查使用次数失败" },
        { status: 500 }
      )
    };
  }
} 