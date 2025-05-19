'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Rocket, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from "@/components/language-provider";
import { useSession } from "next-auth/react";

// 使用次数数据接口
interface UsageData {
  success: boolean;
  canUse: boolean;
  usageCount: number;
  hasActiveSubscription: boolean;
  usageLimit: number | string;
  usageResetDate?: string;
  unlimited?: boolean;
  remainingUses?: number;
  stripeChecked?: boolean;
}

export function UsageLimitStatus() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const hasTriedRefresh = useRef(false); // 记录是否尝试过自动刷新

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 检查是否已登录
      if (!session?.user) {
        // 未登录时显示默认数据
        setUsageData({
          success: true,
          canUse: false,
          usageCount: 0,
          hasActiveSubscription: false,
          usageLimit: 5
        });
        return;
      }
      
      // 使用会话数据作为备选数据源
      const fallbackData = {
        success: true,
        canUse: true,
        usageCount: 0,
        hasActiveSubscription: session.user.hasActiveSubscription === true,
        usageLimit: session.user.hasActiveSubscription === true ? '无限制' : 5,
        unlimited: session.user.hasActiveSubscription === true
      };
      
      try {
        // 调用优化后的check-usage-limit API
        const res = await fetch('/api/check-usage-limit');
        
        if (res.status === 404) {
          console.warn('API未找到，使用会话数据作为备选');
          setUsageData(fallbackData);
          return;
        }
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || t('usage.limit.fetchError'));
        }
        
        const data = await res.json();
        console.log('使用次数API响应:', data);
        
        if (data.success) {
          setUsageData(data);
          setLastRefresh(new Date());
        } else {
          throw new Error(data.error || t('usage.limit.dataError'));
        }
      } catch (err: any) {
        if (err.message.includes('fetch') || err.message.includes('网络') || err.message.includes('404')) {
          console.warn('API请求失败，使用会话数据作为备选:', err);
          setUsageData(fallbackData);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error('获取使用次数数据失败:', err);
      setError(err.message || t('usage.limit.fetchError'));
      
      // 使用会话数据作为备选数据源
      if (session?.user) {
        setUsageData({
          success: true,
          canUse: true,
          usageCount: 0,
          hasActiveSubscription: session.user.hasActiveSubscription === true,
          usageLimit: session.user.hasActiveSubscription === true ? '无限制' : 5,
          unlimited: session.user.hasActiveSubscription === true
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    if (session?.user) {
      fetchUsageData();
    }
  }, [session?.user]);
  
  // 监听session变化，当subscription状态变化时刷新使用次数
  useEffect(() => {
    if (session?.user?.hasActiveSubscription !== undefined && lastRefresh) {
      // 仅当上次刷新时间超过5分钟，或者session中的订阅状态与显示的不一致时才刷新
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (
        lastRefresh < fiveMinutesAgo || 
        session.user.hasActiveSubscription !== usageData?.hasActiveSubscription
      ) {
        fetchUsageData();
      }
    }
  }, [session?.user?.hasActiveSubscription]);
  
  // 如果首次数据加载后发现用户有订阅ID但使用次数未更新，自动尝试刷新
  useEffect(() => {
    const autoRefreshIfNeeded = async () => {
      if (
        usageData && 
        !loading && 
        !hasTriedRefresh.current && 
        !usageData.hasActiveSubscription &&
        session?.user?.stripeSubscriptionId
      ) {
        console.log('检测到用户有订阅但使用次数未更新，尝试自动刷新');
        hasTriedRefresh.current = true;
        
        try {
          // 调用check-usage-limit API来尝试同步用户状态
          await fetchUsageData();
        } catch (err) {
          console.error('自动刷新使用次数失败:', err);
        }
      }
    };
    
    autoRefreshIfNeeded();
  }, [usageData, loading, session?.user?.stripeSubscriptionId]);

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('usage.limit.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (error && !usageData) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('usage.limit.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive mb-2">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button onClick={fetchUsageData} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-3 w-3 mr-2" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('usage.limit.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">{t('usage.limit.dataError')}</div>
        </CardContent>
      </Card>
    );
  }
  
  const hasActiveSubscription = usageData.hasActiveSubscription;
  const { usageCount, usageResetDate } = usageData;
  const maxUsage = typeof usageData.usageLimit === 'number' ? usageData.usageLimit : 5;
  const remainingUsage = hasActiveSubscription ? 
    t('usage.limit.unlimited') : 
    (typeof usageData.remainingUses === 'number' ? 
      usageData.remainingUses : 
      Math.max(0, maxUsage - usageCount));
  
  const usagePercentage = hasActiveSubscription ? 100 : Math.min(100, (usageCount / maxUsage) * 100);
  
  // 根据当前语言格式化日期
  const formattedResetDate = usageResetDate
    ? new Date(usageResetDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')
    : 'N/A';

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('usage.limit.title')}</CardTitle>
          <Button 
            onClick={fetchUsageData} 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">{t('common.refresh')}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {usageData.stripeChecked && (
          <div className="mb-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              {t('usage.limit.syncedWithStripe')}
            </Badge>
          </div>
        )}
        
        {hasActiveSubscription ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>{t('usage.limit.paidUser')}</span>
              <span className="font-semibold text-primary">{t('usage.limit.unlimited')}</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>{t('usage.limit.freeUser')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>
                <span className="text-muted-foreground">{t('usage.limit.used')}:</span> {usageCount}
              </span>
              <span>
                <span className="text-muted-foreground">{t('usage.limit.remaining')}:</span> {remainingUsage}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            
            {usageResetDate && (
              <div className="text-sm text-muted-foreground">
                <span>{t('usage.limit.resetDate')}:</span> {formattedResetDate}
              </div>
            )}
            
            {!usageData.canUse && (
              <div className="mt-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 inline-block mr-1" />
                {t('usage.limit.limitReached')}
              </div>
            )}
            
            {(usageCount >= 3 || !usageData.canUse) && (
              <Button 
                variant={usageData.canUse ? "outline" : "default"}
                size="sm" 
                className="w-full mt-2" 
                onClick={() => router.push('/#pricing')}
              >
                <Rocket className="h-3 w-3 mr-2" />
                {t('usage.limit.upgradePrompt')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 