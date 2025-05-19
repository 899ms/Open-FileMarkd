import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await getServerSession(authOptions);
    
    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录后再执行此操作' },
        { status: 401 }
      );
    }
    
    // 获取用户ID
    // @ts-ignore - session.user.id在NextAuth扩展的类型中
    const userId = session.user.id;
    
    // 查询当前用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 检查是否有有效的订阅信息
    const hasValidSubscription = !!user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date();
    
    // 如果用户已有订阅信息但hasActiveSubscription为false，则更新它
    if (hasValidSubscription && !user.hasActiveSubscription) {
      // 更新用户订阅状态
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          hasActiveSubscription: true
        }
      });
      
      return NextResponse.json({
        success: true,
        message: '订阅状态已更新',
        before: {
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          stripePriceId: user.stripePriceId,
          stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
          hasActiveSubscription: user.hasActiveSubscription
        },
        after: {
          stripeCustomerId: updatedUser.stripeCustomerId,
          stripeSubscriptionId: updatedUser.stripeSubscriptionId,
          stripePriceId: updatedUser.stripePriceId,
          stripeCurrentPeriodEnd: updatedUser.stripeCurrentPeriodEnd,
          hasActiveSubscription: updatedUser.hasActiveSubscription
        }
      });
    }
    
    // 如果已经是正确状态，则返回当前状态
    return NextResponse.json({
      success: true,
      message: '用户订阅状态已是最新',
      subscriptionInfo: {
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        stripePriceId: user.stripePriceId,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        hasActiveSubscription: user.hasActiveSubscription
      },
      hasValidSubscription: hasValidSubscription
    });
    
  } catch (error: any) {
    console.error('更新订阅状态失败:', error);
    return NextResponse.json(
      { error: error.message || '更新订阅状态失败' },
      { status: 500 }
    );
  }
} 