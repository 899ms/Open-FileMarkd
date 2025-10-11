// 为window对象添加gtag函数
interface Window {
  gtag: (
    command: 'config' | 'event' | 'set' | 'js',
    targetId: string,
    config?: {
      [key: string]: any;
    }
  ) => void;
  dataLayer: any[];
}

// 事件跟踪类型
type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value?: number;
}; 