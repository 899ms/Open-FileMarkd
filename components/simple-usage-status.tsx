'use client';

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check, FileUp } from 'lucide-react';
import { useSession } from "next-auth/react";
import { cn } from '@/lib/utils';
import { useLanguage } from "@/components/language-provider";

// 使用次数数据接口
interface UsageData {
  success?: boolean;
  canUse?: boolean;
  usageCount: number;
  hasActiveSubscription: boolean;
  usageLimit?: number | string;
  usageResetDate: string | null;
  unlimited?: boolean;
  remainingUses?: number;
  lastSynced?: number; // 添加上次同步时间戳
}

// 简化版组件，用于在上传框内嵌入
export function SimpleUsageStatus() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasTriedRefresh = useRef(false); // 记录是否尝试过自动刷新
  
  // 如果会话中的订阅状态为true，则强制使用这个状态
  const hasActiveSubscription = 
    session?.user?.hasActiveSubscription === true || (usageData?.hasActiveSubscription === true);
  
  const maxUsage = 5;
  const usageCount = usageData?.usageCount || 0;
  const remainingUsage = hasActiveSubscription ? t('usage.limit.unlimited') : (
    typeof usageData?.remainingUses === 'number' ? usageData.remainingUses : Math.max(0, maxUsage - usageCount)
  );
  const usagePercentage = hasActiveSubscription ? 100 : Math.min(100, (usageCount / maxUsage) * 100);
  const maxFileSizeMB = hasActiveSubscription ? 30 : 5;

  // 带节流功能的数据获取函数
  const fetchUsageData = async (forceSync = false) => {
    // 如果用户未登录，不需要同步
    if (!session?.user) return;
    
    // 检查上次同步时间，除非强制同步，否则10分钟内不重复请求
    const now = Date.now();
    if (!forceSync && usageData?.lastSynced && (now - usageData.lastSynced < 10 * 60 * 1000)) {
      console.log('跳过使用次数同步，距上次同步时间不足10分钟');
      return;
    }
    
    try {
      setLoading(true);
      
      // 使用会话数据作为备选数据源
      const fallbackData = {
        success: true,
        canUse: true,
        usageCount: 0,
        hasActiveSubscription: session?.user?.hasActiveSubscription === true,
        usageLimit: session?.user?.hasActiveSubscription === true ? '无限制' : 5,
        usageResetDate: null,
        unlimited: session?.user?.hasActiveSubscription === true,
        lastSynced: now
      };
      
      try {
        const res = await fetch('/api/check-usage-limit');
        
        // 处理API不存在的情况
        if (res.status === 404) {
          console.warn('使用次数API未找到，使用会话数据');
          setUsageData(fallbackData);
          return;
        }
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || t('usage.limit.fetchError'));
        }
        
        const data = await res.json();
        console.log('简化组件 - 使用次数API响应:', data);
        
        if (data.success) {
          setUsageData({
            ...data,
            lastSynced: now
          });
        } else {
          throw new Error(data.error || t('usage.limit.dataError'));
        }
      } catch (err: any) {
        if (err.message.includes('fetch') || err.message.includes('网络') || err.message.includes('404')) {
          console.warn('使用次数API请求失败，使用会话数据:', err);
          setUsageData(fallbackData);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error('获取使用次数数据失败:', err);
      setError(err.message || t('usage.limit.fetchError'));
      
      // 出错时也使用会话数据
      if (session?.user) {
        setUsageData({
          usageCount: 0,
          hasActiveSubscription: session.user.hasActiveSubscription === true,
          usageResetDate: null,
          lastSynced: now
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 首次加载获取数据 - 带条件判断
  useEffect(() => {
    const needSync = !usageData?.lastSynced; // 只有首次加载时同步
    if (session?.user && needSync) {
      fetchUsageData(true);
    }
  }, [session?.user]);
  
  // 仅当会话中的订阅状态发生变化时同步
  useEffect(() => {
    if (!session?.user) return;
    
    const sessionHasSubscription = session.user.hasActiveSubscription === true;
    const apiHasSubscription = usageData?.hasActiveSubscription === true;
    
    // 只有当订阅状态不一致时才强制同步
    if (sessionHasSubscription !== apiHasSubscription) {
      console.log('订阅状态变化，强制同步使用次数');
      fetchUsageData(true);
    }
  }, [session?.user?.hasActiveSubscription]);

  // 如果首次数据加载后发现状态不一致，仅尝试一次刷新
  useEffect(() => {
    const autoRefreshIfNeeded = async () => {
      if (
        usageData && 
        !loading && 
        !hasTriedRefresh.current && 
        !usageData.hasActiveSubscription &&
        session?.user?.stripeSubscriptionId
      ) {
        console.log('简化版组件检测到用户有订阅但使用次数未更新，尝试自动刷新');
        hasTriedRefresh.current = true;
        await fetchUsageData(true); // 强制同步
      }
    };
    
    autoRefreshIfNeeded();
  }, [usageData, loading, session?.user?.stripeSubscriptionId]);

  // 打印订阅状态信息，用于调试（减少频率）
  useEffect(() => {
    if (!usageData) return;
    
    console.log('SimpleUsageStatus - 订阅状态:', {
      sessionSubscription: session?.user?.hasActiveSubscription,
      apiSubscription: usageData?.hasActiveSubscription,
      finalSubscription: hasActiveSubscription,
      lastSynced: usageData.lastSynced ? new Date(usageData.lastSynced).toLocaleString() : 'never'
    });
  }, [session?.user?.hasActiveSubscription, usageData?.hasActiveSubscription]);

  if (loading && !usageData) {
    return <div className="text-xs text-center text-muted-foreground py-1">{t('common.loading')}</div>;
  }

  if (error && !usageData) {
    return (
      <div className="text-xs text-destructive flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />
        <span>{t('usage.limit.dataError')}</span>
      </div>
    );
  }

  if (!usageData) {
    return <div className="text-xs text-center text-muted-foreground py-1">{t('usage.limit.dataError')}</div>;
  }

  return (
    <div className="w-full space-y-2 pb-1">
      <div className="w-full">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          {hasActiveSubscription ? (
            <div className="w-full flex justify-center items-center">
              <span className="font-medium text-primary flex items-center">
                <Check className="h-3.5 w-3.5 mr-1" />
                {t('usage.limit.paidUser')}
              </span>
            </div>
          ) : (
            <>
              <span>{t('usage.limit.countStatus')}: {usageCount}/{maxUsage}</span>
              <span>{t('usage.limit.remaining')}: {remainingUsage}</span>
            </>
          )}
        </div>
        {!hasActiveSubscription && <Progress value={usagePercentage} className="h-1" />}
      </div>
      
      <div className={cn(
        "text-xs text-center rounded-md py-1.5 px-2 border",
        hasActiveSubscription 
          ? "bg-primary/10 border-primary/20 text-primary" 
          : "bg-muted/30 border-muted/30 text-muted-foreground"
      )}>
        <div className="flex items-center justify-center gap-1.5">
          <FileUp className="h-3 w-3 mt-0.5" />
          <span className="font-medium">
            {hasActiveSubscription
              ? t('usage.limit.fileSizePremium')
              : t('usage.limit.fileSizeFree')}
          </span>
        </div>
      </div>
    </div>
  );
} 