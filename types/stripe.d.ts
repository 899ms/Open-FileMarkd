import Stripe from 'stripe';

// 扩展Stripe订阅类型
declare module 'stripe' {
  namespace Stripe {
    interface Subscription {
      current_period_end: number;
    }
    
    interface Invoice {
      subscription: string | null;
    }
  }
}

// 声明Prisma模型扩展
declare global {
  namespace PrismaJson {
    type UserStripeFields = {
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
      stripePriceId?: string | null;
      stripeCurrentPeriodEnd?: Date | null;
    }
  }
} 