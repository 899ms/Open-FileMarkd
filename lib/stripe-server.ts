import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // 使用正确的API版本
  appInfo: {
    name: 'PDF to Markdown Converter',
    version: '1.0.0',
  },
});