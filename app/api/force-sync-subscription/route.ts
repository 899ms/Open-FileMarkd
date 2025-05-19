import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * 紧急强制同步用户订阅状态API
 */
export async function GET(request: NextRequest) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }
    
    // 从数据库获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        hasActiveSubscription: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 });
    }
    
    // 如果用户有订阅ID但没有激活订阅，强制激活
    if (user.stripeSubscriptionId && !user.hasActiveSubscription) {
      // 更新数据库中的订阅状态
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { 
          hasActiveSubscription: true,
          // 如果没有结束日期，设置为当前日期+30天
          stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        select: {
          id: true,
          email: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          stripePriceId: true,
          stripeCurrentPeriodEnd: true,
          hasActiveSubscription: true
        }
      });
      
      return NextResponse.json({
        success: true,
        message: '已强制激活订阅状态',
        user: updatedUser
      });
    } else if (user.hasActiveSubscription) {
      return NextResponse.json({
        success: true,
        message: '订阅已是激活状态',
        user
      });
    } else {
      // 用户没有订阅
      return NextResponse.json({
        success: false,
        message: '用户没有订阅信息',
        user
      });
    }
  } catch (error: any) {
    console.error('强制同步订阅状态失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '强制同步订阅状态失败' 
    }, { status: 500 });
  }
} 