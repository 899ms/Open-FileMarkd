export const UPLOAD_LIMITS = {
  registered: 10 * 1024 * 1024,
  trial: 20 * 1024 * 1024,
  subscribed: 50 * 1024 * 1024,
} as const

interface SubscriptionState {
  subscriptionStatus: string | null
  subscriptionPlan: string | null
  subscriptionCurrentPeriodEnd: Date | null
}

export function getUploadLimitBytes(user: SubscriptionState, now = new Date()) {
  const isActive =
    user.subscriptionStatus === 'active' &&
    user.subscriptionCurrentPeriodEnd !== null &&
    user.subscriptionCurrentPeriodEnd > now

  if (!isActive) return UPLOAD_LIMITS.registered
  if (user.subscriptionPlan === 'trial') return UPLOAD_LIMITS.trial
  if (user.subscriptionPlan === 'pro' || user.subscriptionPlan === 'annual') {
    return UPLOAD_LIMITS.subscribed
  }

  return UPLOAD_LIMITS.registered
}
