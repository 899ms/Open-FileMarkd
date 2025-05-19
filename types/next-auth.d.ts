import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * 扩展Session类型，添加用户ID和订阅信息
   */
  interface Session {
    user: {
      id: string
      stripeCustomerId?: string | null
      stripeSubscriptionId?: string | null
      stripePriceId?: string | null
      stripeCurrentPeriodEnd?: Date | null
      hasActiveSubscription?: boolean
      subscriptionPlan?: string | null
    } & DefaultSession["user"]
  }
  
  /**
   * 扩展User类型，包含ID和订阅信息
   */
  interface User {
    id: string
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripePriceId?: string | null
    stripeCurrentPeriodEnd?: Date | null
    subscriptionPlan?: string | null
  }
}

declare module "next-auth/jwt" {
  /** 扩展JWT类型，包含ID和订阅信息 */
  interface JWT {
    id?: string
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripePriceId?: string | null
    stripeCurrentPeriodEnd?: string | null
    hasActiveSubscription?: boolean
    subscriptionPlan?: string | null
  }
} 