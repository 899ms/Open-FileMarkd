'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import { useSubscriptionSync } from '@/components/subscription-sync-provider';

export function SessionRefresher() {
  const { lastSynced, error, subscriptionData } = useSubscriptionSync();

  // 如果没有订阅数据，不显示组件
  if (!subscriptionData) return null;

  return (
    <Card className="w-full max-w-md mt-6">
      <CardHeader>
        <CardTitle className="text-lg">订阅信息</CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptionData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">订阅状态:</span>
              {subscriptionData.hasActiveSubscription ? (
                <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  已激活
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400 text-sm font-medium">
                  未激活
                </span>
              )}
            </div>
            
            {subscriptionData.stripeCurrentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">到期时间:</span>
                <span className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  {new Date(subscriptionData.stripeCurrentPeriodEnd).toLocaleDateString('zh-CN')}
                </span>
              </div>
            )}
            
            {lastSynced && (
              <div className="text-xs text-muted-foreground text-right mt-3">
                最后更新: {lastSynced.toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-xs text-red-500 dark:text-red-400">
            同步状态时出错，将在稍后自动重试
          </div>
        )}
      </CardContent>
    </Card>
  );
} 