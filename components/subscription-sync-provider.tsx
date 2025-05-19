'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// 定义上下文类型
type SubscriptionSyncContextType = {
  syncSubscription: () => void;
  lastSynced: Date | null;
  syncing: boolean;
  error: string | null;
  subscriptionData: any;
};

// 创建上下文
const SubscriptionSyncContext = createContext<SubscriptionSyncContextType>({
  syncSubscription: () => {},
  lastSynced: null,
  syncing: false,
  error: null,
  subscriptionData: null,
});

// 提供者组件
export function SubscriptionSyncProvider({ 
  children,
}: { 
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  
  // 使用ref来跟踪是否已经同步过
  const hasBeenSynced = useRef(false);
  // 跟踪最后一次同步的时间戳
  const lastSyncedTimestamp = useRef(0);

  // 包装同步函数，使用防抖，避免过于频繁调用
  const syncSubscription = useCallback(() => {
    const now = Date.now();
    // 防抖：10秒内不重复同步
    if (now - lastSyncedTimestamp.current < 10000) {
      console.log('同步请求被忽略：距离上次同步不足10秒');
      return;
    }
    
    // 避免并发同步请求
    if (syncing) {
      console.log('同步请求被忽略：同步正在进行中');
      return;
    }
    
    // 检查用户是否有订阅相关信息或是首次访问
    const hasSubscriptionInfo = !!session?.user?.stripeSubscriptionId || 
                                !!session?.user?.stripePriceId || 
                                !!session?.user?.stripeCustomerId ||
                                !!session?.user?.stripeCurrentPeriodEnd;
    const isFirstVisit = !hasBeenSynced.current;
    
    // 只有当用户有订阅信息或首次访问时才同步
    if (!hasSubscriptionInfo && !isFirstVisit) {
      console.log('同步请求被忽略：用户没有订阅信息且不是首次访问');
      return;
    }
    
    console.log('开始同步订阅信息', { hasSubscriptionInfo, isFirstVisit });
    
    // 更新最后同步时间戳
    lastSyncedTimestamp.current = now;
    
    // 执行实际同步
    const doSync = async () => {
      if (status !== 'authenticated') {
        console.log('同步请求被忽略：用户未登录');
        return;
      }
      
      try {
        setSyncing(true);
        setError(null);
        
        // 调用订阅检查API
        const response = await fetch('/api/check-subscription', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || '同步失败');
        }
        
        // 更新本地状态
        setSubscriptionData(data);
        setLastSynced(new Date());
        hasBeenSynced.current = true;
        
        // 更新会话中的订阅信息
        const hasActiveSubscription = data.hasSubscription === true;
        await update({
          ...session,
          user: {
            ...session?.user,
            hasActiveSubscription: hasActiveSubscription,
            stripeCurrentPeriodEnd: data.expirationDate ? 
              new Date(data.expirationDate) : null,
            stripePriceId: session?.user?.stripePriceId,
            stripeCustomerId: data.customerID || session?.user?.stripeCustomerId,
            stripeSubscriptionId: data.subscriptionId || session?.user?.stripeSubscriptionId,
          }
        });
        
        console.log('同步完成，会话已更新');
        
      } catch (err: any) {
        console.error('同步订阅状态失败:', err);
        setError(err.message || '同步失败');
      } finally {
        setSyncing(false);
      }
    };
    
    doSync();
  }, [session, status, update, syncing]);

  // 初始化时同步一次
  useEffect(() => {
    if (status === 'authenticated' && !hasBeenSynced.current) {
      syncSubscription();
    }
  }, [status, syncSubscription]);

  // 移除定期自动同步
  // useEffect(() => {
  //   if (status !== 'authenticated') return;
  //   
  //   const intervalId = setInterval(() => {
  //     syncSubscription();
  //   }, syncInterval);
  //   
  //   return () => clearInterval(intervalId);
  // }, [status, syncInterval]);

  return (
    <SubscriptionSyncContext.Provider
      value={{
        syncSubscription,
        lastSynced,
        syncing,
        error,
        subscriptionData,
      }}
    >
      {children}
    </SubscriptionSyncContext.Provider>
  );
}

// 使用上下文的钩子
export const useSubscriptionSync = () => useContext(SubscriptionSyncContext); 