/**
 * 服务端分析工具函数
 * 
 * 这个文件包含可在服务器端使用的分析功能
 */

// 记录GA4事件（服务端）
export async function serverTrackEvent({
  measurementId,
  apiSecret,
  clientId,
  userId,
  events,
}: {
  measurementId: string; // Google Analytics 4 测量ID
  apiSecret: string; // GA4 API秘钥
  clientId: string; // 客户端ID
  userId?: string; // 用户ID (可选)
  events: {
    name: string; // 事件名称
    params?: Record<string, any>; // 事件参数
  }[];
}) {
  // 如果没有有效的测量ID或API密钥，则不跟踪
  if (!measurementId || !apiSecret) {
    console.warn('GA4 measurement ID or API secret not provided');
    return;
  }

  try {
    // GA4 测量协议API
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          user_id: userId,
          events,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GA4 API error: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Error sending server-side GA4 event:', error);
    return null;
  }
}

// 跟踪转换完成事件（服务端）
export async function trackConversionCompleted({
  userId,
  clientId,
  fileId,
  fileSize,
  pageCount,
  conversionTime,
}: {
  userId?: string;
  clientId: string;
  fileId: string;
  fileSize: number;
  pageCount: number;
  conversionTime: number;
}) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) return null;

  return serverTrackEvent({
    measurementId,
    apiSecret,
    clientId,
    userId,
    events: [
      {
        name: 'conversion_completed',
        params: {
          file_id: fileId,
          file_size: fileSize,
          page_count: pageCount,
          conversion_time: conversionTime,
          user_type: userId ? 'registered' : 'anonymous',
        },
      },
    ],
  });
}

// 生成随机客户端ID (用于匿名用户)
export function generateClientId() {
  return `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
} 