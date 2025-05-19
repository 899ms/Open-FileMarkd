import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * 强制重置用户使用次数限制API
 */
export async function GET(request: NextRequest) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }
    
    // 直接从数据库获取最新的用户信息，并更新hasActiveSubscription和usageCount
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        hasActiveSubscription: true,
        usageCount: 0, // 重置使用次数为0
      },
      select: {
        id: true,
        email: true,
        usageCount: true,
        usageResetDate: true,
        hasActiveSubscription: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: '已成功重置使用次数限制',
      data: {
        usageCount: user.usageCount,
        usageResetDate: user.usageResetDate,
        hasActiveSubscription: user.hasActiveSubscription,
      }
    });
  } catch (error: any) {
    console.error('重置使用次数失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '重置使用次数失败' 
    }, { status: 500 });
  }
} 