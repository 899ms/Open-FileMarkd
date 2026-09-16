import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  onContactSupport: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onContactSupport }) => {
  const t = useTranslations('faq');
  const tItems = useTranslations('faq.items');
  const itemCount = 5;
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs: FAQItem[] = Array.from({ length: itemCount }).map((_, idx) => ({
    question: tItems(`${idx}.question`),
    answer: tItems(`${idx}.answer`)
  }));

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 sm:mt-40 pb-32 sm:pb-40" id="faq">
      <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">

        {/* Left Column Header */}
        <div className="lg:col-span-1">
          <h2 className="text-3xl sm:text-4xl font-bold font-headline text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
            {t('sectionTitle')}
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            {t('sectionSubtitle')}
          </p>
          <div className="mt-8">
            <button
              onClick={onContactSupport}
              className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono text-sm font-semibold hover:underline cursor-pointer"
            >
              <span>{t('contactSupport')}</span>
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Right Column Accordions */}
        <div className="lg:col-span-2 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            return (
              <div
                key={idx}
                className="glass bg-white/70 dark:bg-slate-900/70 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-all hover:border-emerald-600/50"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex justify-between items-center p-6 text-left cursor-pointer select-none group"
                >
                  <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {faq.question}
                  </h3>
                  <span
                    className={`material-symbols-outlined text-slate-500 group-hover:text-emerald-600 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 whitespace-pre-line animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};