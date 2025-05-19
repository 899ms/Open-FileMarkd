import { loadStripe } from '@stripe/stripe-js';

// 确保使用环境变量中的测试密钥
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// 创建商品定价ID常量
export const PRICING = {
  MONTHLY: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_placeholder_monthly',
  YEARLY: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_placeholder_yearly',
}; 