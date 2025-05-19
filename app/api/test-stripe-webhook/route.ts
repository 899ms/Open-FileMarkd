import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { PRICING } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // 首先验证用户身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    
    // 获取请求数据，包含要模拟的订阅类型
    const data = await req.json();
    const { plan = 'yearly' } = data; // 默认使用年度计划
    
    // 确定价格ID
    const priceId = plan === 'monthly' ? PRICING.MONTHLY : PRICING.YEARLY;
    
    // 计算订阅结束时间
    const currentPeriodEnd = new Date();
    if (plan === 'monthly') {
      // 月度订阅，增加30天
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
    } else {
      // 年度订阅，增加365天
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 365);
    }
    
    // 直接更新用户的订阅信息
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: currentPeriodEnd,
        stripeCustomerId: 'cus_test_' + Math.random().toString(36).substring(2, 15),
        stripeSubscriptionId: 'sub_test_' + Math.random().toString(36).substring(2, 15),
        hasActiveSubscription: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: '已成功模拟订阅激活',
      subscription: {
        type: plan,
        priceId,
        currentPeriodEnd,
        hasActiveSubscription: true
      }
    });
  } catch (error: any) {
    console.error('模拟订阅失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '模拟订阅失败'
    }, { status: 500 });
  }
} 