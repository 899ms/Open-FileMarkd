"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Hero } from '@/components/newhome/Hero';
import { BentoFeatures } from '@/components/newhome/BentoFeatures';
import { ConversionZone } from '@/components/newhome/ConversionZone';
import { ConversionWorkspace } from '@/components/newhome/ConversionWorkspace';
import { PricingPlans } from '@/components/newhome/PricingPlans';
import { Testimonials } from '@/components/newhome/Testimonials';
import { FAQSection } from '@/components/newhome/FAQSection';
import { DemoVideoModal } from '@/components/newhome/DemoVideoModal';
import type { ConversionResult } from '@/components/newhome/ConversionWorkspace';
import type { PlanItem } from '@/components/newhome/PricingPlans';

interface ShowToastFn {
  (text: string, type?: 'success' | 'info' | 'error'): void;
}

interface NewHomePageClientProps {
  /**
   * Optional external toast handler. When omitted, a built-in minimal toast
   * stack renders at the bottom-right of the viewport. Useful when this
   * client is rendered directly from a Server Component (RSC) — props cannot
   * be event functions across the RSC boundary.
   */
  onShowToast?: ShowToastFn;
}

const NAVBAR_OFFSET = 80;

const scrollToHash = (hash: string) => {
  if (typeof window === 'undefined') return;
  const element = document.getElementById(hash);
  if (element) {
    const y = element.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

export const NewHomePageClient: React.FC<NewHomePageClientProps> = ({ onShowToast: externalShowToast }) => {
  const t = useTranslations('homeClient');

  // Internal toast fallback (only used when no external handler is provided).
  const [internalToasts, setInternalToasts] = useState<Array<{ id: number; text: string; type: 'success' | 'info' | 'error' }>>([]);

  const onShowToast: ShowToastFn = useCallback((text, type = 'info') => {
    if (externalShowToast) {
      externalShowToast(text, type);
      return;
    }
    const id = Date.now() + Math.random();
    setInternalToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setInternalToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, [externalShowToast]);

  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string | null>(null);

  // Modals
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => scrollToHash(hash), 100);
    }
  }, []);

  const handleConversionComplete = useCallback((result: ConversionResult) => {
    setConversionResult(result);
    setTimeout(() => {
      const el = document.getElementById('workspace-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  }, []);

  const handleResetConversion = useCallback(() => {
    setConversionResult(null);
    const el = document.getElementById('conversion');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleStartConvertClick = useCallback(() => {
    const el = document.getElementById('conversion');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handlePlanSelect = useCallback((plan: PlanItem) => {
    onShowToast(t('planSelectedToast', { plan: plan.name }), 'success');
  }, [onShowToast, t]);

  const handleSelectFormatFilter = useCallback((fmt: string) => {
    setSelectedFormatFilter(fmt);
    handleStartConvertClick();
    onShowToast(t('formatFilterToast', { fmt }), 'info');
  }, [handleStartConvertClick, onShowToast, t]);

  return (
    <>
      {/* Hero Section */}
      <Hero
        onStartConvert={handleStartConvertClick}
        onOpenVideoDemo={() => setIsVideoModalOpen(true)}
        onSelectFormatFilter={handleSelectFormatFilter}
      />

      {/* Bento Grid Features */}
      <BentoFeatures />

      {/* Conversion Drop Zone */}
      <ConversionZone
        onConversionComplete={handleConversionComplete}
        onShowToast={onShowToast}
        filterFormat={selectedFormatFilter}
      />

      {/* Interactive Workspace (Split View & Markdown Editor) */}
      {conversionResult && (
        <div id="workspace-section">
          <ConversionWorkspace
            result={conversionResult}
            onReset={handleResetConversion}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* Subscription & Pricing Plans */}
      <PricingPlans onSelectPlan={handlePlanSelect} />

      {/* Real Testimonials */}
      <Testimonials />

      {/* FAQ Accordions */}
      <FAQSection
        onContactSupport={() => onShowToast(t('supportContactToast'), 'info')}
      />

      {/* Modals */}
      <DemoVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onStartConvert={() => {
          setIsVideoModalOpen(false);
          handleStartConvertClick();
        }}
      />

      {/* Built-in toast stack (only rendered when no external handler is provided) */}
      {!externalShowToast && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
          {internalToasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={
                `pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium backdrop-blur ` +
                (t.type === 'success'
                  ? 'bg-emerald-500/90 text-white'
                  : t.type === 'error'
                    ? 'bg-rose-500/90 text-white'
                    : 'bg-slate-900/90 text-white')
              }
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
