'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import GoogleAnalytics from './google-analytics';

export function AnalyticsProvider() {
  return (
    <>
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      {/* Vercel Analytics */}
      <VercelAnalytics />
    </>
  );
}

// 用于发送自定义事件的辅助函数
export function trackEvent(
  action: string,
  category: string,
  label: string,
  value?: number
) {
  // 如果window对象可用并且gtag函数存在
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
} 