'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from "@/components/language-provider";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

// 订阅数据接口
interface SubscriptionData {
  hasActiveSubscription: boolean;
  subscriptionId: string | null;
  expirationDate: string | null;
  remainingDays: number | null;
  customerID: string | null;
  maxFileSizeMB: number;
  lastSynced?: number; // 添加上次同步时间戳
  subscriptionPlan?: string; // 添加订阅计划类型
}

export function SubscriptionInfo() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // 带节流功能的订阅数据获取函数
  const fetchSubscriptionData = async (forceSync = false) => {
    try {
      // 检查上次同步时间，除非强制同步，否则10分钟内不重复请求
      const now = Date.now();
      if (!forceSync && subscriptionData?.lastSynced && (now - subscriptionData.lastSynced < 10 * 60 * 1000)) {
        console.log('跳过订阅信息同步，距上次同步时间不足10分钟');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // 会话数据作为备选数据源
      const fallbackData: SubscriptionData = {
        hasActiveSubscription: session?.user?.hasActiveSubscription === true,
        subscriptionId: session?.user?.stripeSubscriptionId || null,
        expirationDate: session?.user?.stripeCurrentPeriodEnd ? 
          session.user.stripeCurrentPeriodEnd.toString() : null,
        remainingDays: session?.user?.stripeCurrentPeriodEnd ? 
          Math.ceil((new Date(session.user.stripeCurrentPeriodEnd).getTime() - Date.now()) / (1000 * 3600 * 24)) : null,
        customerID: session?.user?.stripeCustomerId || null,
        maxFileSizeMB: session?.user?.hasActiveSubscription === true ? 30 : 5,
        lastSynced: now,
        subscriptionPlan: (session?.user as any)?.subscriptionPlan || null
      };
      
      try {
        // 调用API获取订阅信息
        const response = await fetch('/api/check-subscription');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || t('subscription.fetchError'));
        }
        
        // 将API返回数据映射到本地状态
        setSubscriptionData({
          hasActiveSubscription: data.hasActiveSubscription,
          subscriptionId: data.subscriptionId,
          expirationDate: data.expirationDate,
          remainingDays: data.remainingDays,
          customerID: data.customerID,
          maxFileSizeMB: data.maxFileSizeMB,
          lastSynced: now,
          subscriptionPlan: data.subscriptionPlan // 添加订阅计划类型
        });
        setLastRefresh(new Date());
      } catch (err: any) {
        console.error('获取订阅信息失败:', err);
        setSubscriptionData(fallbackData);
        setLastRefresh(new Date());
      }
    } catch (err: any) {
      console.error('获取订阅数据失败:', err);
      setError(err.message || t('subscription.fetchError'));
      
      // 使用会话数据作为备选，即使有错误也尝试显示部分信息
      if (session?.user) {
        const nowTs = Date.now();
        setSubscriptionData({
          hasActiveSubscription: session.user.hasActiveSubscription === true,
          subscriptionId: session.user.stripeSubscriptionId || null,
          expirationDate: session.user.stripeCurrentPeriodEnd ? 
            session.user.stripeCurrentPeriodEnd.toString() : null,
          remainingDays: session.user.stripeCurrentPeriodEnd ? 
            Math.ceil((new Date(session.user.stripeCurrentPeriodEnd).getTime() - Date.now()) / (1000 * 3600 * 24)) : null,
          customerID: session.user.stripeCustomerId || null,
          maxFileSizeMB: session.user.hasActiveSubscription === true ? 30 : 5,
          lastSynced: nowTs,
          subscriptionPlan: (session.user as any).subscriptionPlan || null
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    if (session?.user && !subscriptionData?.lastSynced) {
      fetchSubscriptionData(true); // 强制同步
    }
  }, [session?.user]);
  
  // 当用户订阅状态在session中变化时刷新
  useEffect(() => {
    if (!session?.user) return;
    
    const sessionHasSubscription = session.user.hasActiveSubscription === true;
    const apiHasSubscription = subscriptionData?.hasActiveSubscription === true;
    
    // 只有当订阅状态不一致时才强制同步
    if (sessionHasSubscription !== apiHasSubscription) {
      console.log('订阅状态变化，强制同步订阅信息');
      fetchSubscriptionData(true); // 强制同步
    } else if (lastRefresh) {
      // 状态一致但检查刷新时间，如果超过10分钟则刷新
      const fiveMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      if (lastRefresh < fiveMinutesAgo) {
        fetchSubscriptionData(false);
      }
    }
  }, [session?.user?.hasActiveSubscription]);

  // 刷新按钮的点击处理函数
  const handleRefreshClick = () => {
    fetchSubscriptionData(true); // 强制同步
  };

  if (loading && !subscriptionData) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (error && !subscriptionData) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive mb-2">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button onClick={() => handleRefreshClick()} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-3 w-3 mr-2" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">{t('subscription.dataError')}</div>
        </CardContent>
      </Card>
    );
  }

  // 格式化日期
  const formattedExpiryDate = subscriptionData.expirationDate
    ? new Date(subscriptionData.expirationDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')
    : 'N/A';
    
  // 格式化上次同步时间
  const lastSyncTime = subscriptionData.lastSynced 
    ? new Date(subscriptionData.lastSynced).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US')
    : 'N/A';

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('subscription.title')}</CardTitle>
          <Button 
            onClick={handleRefreshClick} 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title={`${t('common.lastSync')}: ${lastSyncTime}`}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">{t('common.refresh')}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 订阅状态 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('subscription.status')}</span>
            {subscriptionData.hasActiveSubscription ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                {t('subscription.active')}
              </Badge>
            ) : (
              <Badge variant="outline">{t('subscription.inactive')}</Badge>
            )}
          </div>
          
          {/* 订阅计划类型 - 仅在有订阅时显示 */}
          {subscriptionData.hasActiveSubscription && subscriptionData.subscriptionPlan && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('subscription.planType')}</span>
              <Badge variant={subscriptionData.subscriptionPlan === 'yearly' ? 'default' : 'outline'}>
                {subscriptionData.subscriptionPlan === 'yearly' 
                  ? t('subscription.yearlyPlan') 
                  : t('subscription.monthlyPlan')}
              </Badge>
            </div>
          )}
          
          {/* 文件大小限制 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('subscription.fileLimit')}</span>
            <span className="font-medium">
              {subscriptionData.maxFileSizeMB} MB
            </span>
          </div>
          
          {/* 到期时间 - 仅在有订阅时显示 */}
          {subscriptionData.hasActiveSubscription && subscriptionData.expirationDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('subscription.expires')}</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">{formattedExpiryDate}</span>
              </div>
            </div>
          )}
          
          {/* 剩余天数 - 仅在有订阅时显示 */}
          {subscriptionData.hasActiveSubscription && subscriptionData.remainingDays !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground"></span>
              <Badge variant="outline" className={subscriptionData.remainingDays < 7 ? "text-red-500 border-red-300" : ""}>
                {subscriptionData.remainingDays === 1 
                  ? t('subscription.remainingDay') 
                  : t('subscription.remainingDays', {days: subscriptionData.remainingDays})}
              </Badge>
            </div>
          )}
          
          {/* 客户ID - 仅在有订阅时显示 */}
          {subscriptionData.hasActiveSubscription && subscriptionData.customerID && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('subscription.customerID')}</span>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium text-xs">
                  {subscriptionData.customerID.substring(0, 8)}...
                </span>
              </div>
            </div>
          )}
          
          {/* 移除升级/续费按钮部分 */}
          <div className="pt-2">
            {!subscriptionData.hasActiveSubscription && (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full" 
                onClick={() => router.push('/#pricing')}
              >
                {t('subscription.upgrade')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 