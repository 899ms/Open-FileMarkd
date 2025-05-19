import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 对于所有用户，更新使用次数，但只对免费用户进行限制
    try {
      // 如果需要重置（新月份），先重置计数
      if (!user.usageResetDate || new Date() >= user.usageResetDate) {
        // 设置新的重置日期并将计数设为1
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            usageCount: 1,
            usageResetDate: nextMonth
          }
        });
        
        return NextResponse.json({
          success: true,
          usageCount: 1,
          message: "使用次数已更新"
        });
      } else {
        // 否则只增加计数
        const usageCount = (user.usageCount || 0) + 1;
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            usageCount: usageCount
          }
        });
        
        return NextResponse.json({
          success: true,
          usageCount: usageCount,
          message: "使用次数已更新"
        });
      }
    } catch (error: any) {
      console.error("更新使用次数失败:", error);
      return NextResponse.json(
        { error: error.message || "更新使用次数失败" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("更新使用次数失败:", error);
    return NextResponse.json(
      { error: error.message || "更新使用次数失败" },
      { status: 500 }
    );
  }
} 