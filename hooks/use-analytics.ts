'use client';

import { useCallback } from 'react';

// Google Analytics 事件跟踪
export function useAnalytics() {
  // 跟踪页面事件
  const trackPageView = useCallback((url: string) => {
    if (!window.gtag) return;
    
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }, []);

  // 跟踪一般事件
  const trackEvent = useCallback((action: string, category: string, label: string, value?: number) => {
    if (!window.gtag) return;
    
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }, []);

  // 跟踪转换事件 (如注册、订阅等)
  const trackConversion = useCallback((action: string, label?: string, value?: number) => {
    trackEvent(action, 'conversion', label || '', value);
  }, [trackEvent]);

  // 跟踪文件操作 (如上传、转换等)
  const trackFileOperation = useCallback((action: string, fileType: string, fileSize?: number) => {
    trackEvent(action, 'file_operation', fileType, fileSize);
  }, [trackEvent]);

  // 跟踪订阅相关事件
  const trackSubscription = useCallback((action: string, plan: string, price?: number) => {
    trackEvent(action, 'subscription', plan, price);
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackConversion,
    trackFileOperation,
    trackSubscription
  };
} 