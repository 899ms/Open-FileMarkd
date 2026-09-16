"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { StripeCheckoutButton } from '@/components/stripe-checkout-button';
import { SUBSCRIPTION_PRICE_IDS } from '@/lib/stripe';

export interface PlanItem {
  id: 'trial' | 'annual' | 'monthly';
  name: string;
  subtitle: string;
  price: string;
  period?: string;
  badge?: string;
  saveBadge?: string;
  effectiveMonthly?: string;
  validity: string;
  credits: string;
  features: string[];
  maxDaily: string;
  maxFileSize: string;
  popular?: boolean;
}

const PRICE_TABLE: Record<'trial' | 'annual' | 'monthly', Pick<PlanItem, 'price'>> = {
  trial: { price: '$2.99' },
  annual: { price: '$99' },
  monthly: { price: '$14.99' }
};

interface PricingPlansProps {
  onSelectPlan: (plan: PlanItem) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, onShowToast }) => {
  const { data: session } = useSession();
  const t = useTranslations('pricingNewHome');
  const tFeatures = useTranslations('pricingNewHome');
  const [hasTrialSubscription, setHasTrialSubscription] = useState(false);
  const [hasActiveProSubscription, setHasActiveProSubscription] = useState(false);
  const [hasActiveAnnualSubscription, setHasActiveAnnualSubscription] = useState(false);
  const [currentSubscriptionPlan, setCurrentSubscriptionPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setHasTrialSubscription(data.hasTrialSubscription || false);
          setCurrentSubscriptionPlan(data.subscriptionPlan || null);

          const now = new Date();
          const isActivePro =
            data.subscriptionStatus === 'active' &&
            data.subscriptionPlan === 'pro' &&
            data.subscriptionCurrentPeriodEnd &&
            new Date(data.subscriptionCurrentPeriodEnd) > now;

          setHasActiveProSubscription(isActivePro || false);

          const isActiveAnnual =
            data.subscriptionStatus === 'active' &&
            data.subscriptionPlan === 'annual' &&
            data.subscriptionCurrentPeriodEnd &&
            new Date(data.subscriptionCurrentPeriodEnd) > now;

          setHasActiveAnnualSubscription(isActiveAnnual || false);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [session]);

  const trialFeatures = Array.from({ length: 6 }).map((_, idx) =>
    tFeatures(`trial.features.${idx}`)
  );
  const annualFeatures = Array.from({ length: 6 }).map((_, idx) =>
    tFeatures(`annual.features.${idx}`)
  );
  const monthlyFeatures = Array.from({ length: 6 }).map((_, idx) =>
    tFeatures(`monthly.features.${idx}`)
  );

  const SUBSCRIPTION_PLANS: PlanItem[] = [
    {
      id: 'trial',
      name: tFeatures('trial.name'),
      subtitle: tFeatures('trial.subtitle'),
      price: PRICE_TABLE.trial.price,
      validity: tFeatures('trial.validity'),
      credits: tFeatures('trial.credits'),
      maxDaily: tFeatures('trial.maxDaily'),
      maxFileSize: tFeatures('trial.maxFileSize'),
      features: trialFeatures
    },
    {
      id: 'annual',
      name: tFeatures('annual.name'),
      subtitle: tFeatures('annual.subtitle'),
      price: PRICE_TABLE.annual.price,
      period: tFeatures('annual.period'),
      popular: true,
      badge: tFeatures('annual.popularBadge'),
      saveBadge: tFeatures('annual.saveBadge'),
      effectiveMonthly: tFeatures('annual.effectiveMonthly'),
      validity: tFeatures('annual.validity'),
      credits: tFeatures('annual.credits'),
      maxDaily: tFeatures('annual.maxDaily'),
      maxFileSize: tFeatures('annual.maxFileSize'),
      features: annualFeatures
    },
    {
      id: 'monthly',
      name: tFeatures('monthly.name'),
      subtitle: tFeatures('monthly.subtitle'),
      price: PRICE_TABLE.monthly.price,
      period: tFeatures('monthly.period'),
      validity: tFeatures('monthly.validity'),
      credits: tFeatures('monthly.credits'),
      maxDaily: tFeatures('monthly.maxDaily'),
      maxFileSize: tFeatures('monthly.maxFileSize'),
      features: monthlyFeatures
    }
  ];

  const handleSelectPlan = (plan: PlanItem) => {
    if (!session) {
      onShowToast?.(t('loginFirst'), 'error');
      return;
    }
    onSelectPlan(plan);
  };

  const renderPlanButton = (plan: PlanItem) => {
    const isAnnual = plan.id === 'annual';
    const isTrial = plan.id === 'trial';

    // Already has active annual subscription
    if (hasActiveAnnualSubscription && isAnnual) {
      return (
        <button
          disabled
          className="w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 opacity-60 cursor-not-allowed border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
        >
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{t('alreadySubscribedAnnual')}</span>
        </button>
      );
    }

    // Annual subscriber on Trial / Monthly (Pro) cards
    if (hasActiveAnnualSubscription && (isTrial || !isAnnual)) {
      return (
        <button
          disabled
          className="w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 opacity-60 cursor-not-allowed border-2 border-emerald-600 text-emerald-600"
        >
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{t('annualMemberAlready')}</span>
        </button>
      );
    }

    // Already has active pro subscription
    if (hasActiveProSubscription) {
      if (isTrial) {
        return (
          <button
            disabled
            className="w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 opacity-60 cursor-not-allowed border-2 border-emerald-600 text-emerald-600"
          >
            <span>{t('isProMember')}</span>
          </button>
        );
      }
      if (isAnnual) {
        return (
          <StripeCheckoutButton
            priceId={SUBSCRIPTION_PRICE_IDS.annual}
            planType="annual"
            className="w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-emerald-700/30"
          >
            <span>{t('upgradeToAnnual')}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </StripeCheckoutButton>
        );
      }
      return (
        <button
          disabled
          className="w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 opacity-60 cursor-not-allowed border-2 border-emerald-600 text-emerald-600"
        >
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{t('isProMember')}</span>
        </button>
      );
    }

    // Already has trial subscription
    if (hasTrialSubscription) {
      if (isTrial) {
        return (
          <button
            disabled
            className="w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 opacity-60 cursor-not-allowed border-2 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
          >
            <span>{t('trialOnlyOnce')}</span>
          </button>
        );
      }
    }

    // Default: show Stripe checkout button
    const priceIdMap: Record<string, string | null> = {
      trial: SUBSCRIPTION_PRICE_IDS.trial,
      annual: SUBSCRIPTION_PRICE_IDS.annual,
      monthly: SUBSCRIPTION_PRICE_IDS.pro, // monthly uses pro price ID
    };

    return (
      <StripeCheckoutButton
        priceId={priceIdMap[plan.id]}
        planType={plan.id}
        className={`w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
          isAnnual
            ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-emerald-700/30'
            : isTrial
            ? 'border-2 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
        }`}
      >
        <span>{isTrial ? t('startTrial') : t('subscribeNow')}</span>
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </StripeCheckoutButton>
    );
  };

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 sm:mt-40 scroll-mt-20" id="subscription-plans">

      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
          {t('sectionTitle')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto opacity-90">
          {t('sectionSubtitle')}
        </p>
      </div>

      {/* Grid of 3 Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isAnnual = plan.id === 'annual';
          return (
            <div
              key={plan.id}
              className={`glass rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 relative ${
                isAnnual
                  ? 'border-2 border-emerald-600 dark:border-emerald-500 shadow-2xl shadow-emerald-700/15 md:scale-105 z-10 bg-white/90 dark:bg-slate-900/90'
                  : 'border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {isAnnual && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-4 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-widest shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-headline text-slate-900 dark:text-slate-100 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {plan.subtitle}
                  </p>

                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl sm:text-5xl font-bold font-headline text-slate-900 dark:text-slate-50">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        {plan.period}
                      </span>
                    )}
                    {plan.saveBadge && (
                      <span className="ml-2 px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-full animate-pulse">
                        {plan.saveBadge}
                      </span>
                    )}
                  </div>

                  {plan.effectiveMonthly ? (
                    <p className="text-emerald-700 dark:text-emerald-400 text-xs font-mono mt-2 font-bold">
                      {plan.effectiveMonthly}
                    </p>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                      {plan.validity}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold font-mono flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">toll</span>
                      {plan.credits}
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-auto pt-4">
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 text-center mb-3">
                  {t('creditNote')}
                </p>
                {isLoading ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 opacity-60 cursor-not-allowed bg-emerald-700 text-white"
                  >
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>{t('loading')}</span>
                  </button>
                ) : renderPlanButton(plan)}
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};