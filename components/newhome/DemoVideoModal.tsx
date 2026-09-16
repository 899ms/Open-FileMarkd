import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConvert?: () => void;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({
  isOpen,
  onClose,
  onStartConvert
}) => {
  const t = useTranslations('demoVideoModal');
  const tSteps = useTranslations('demoVideoModal.steps');
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const stepCount = 3;
  const stepIconKeys = ['document_scanner', 'functions', 'download_for_offline'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">smart_display</span>
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline text-slate-900 dark:text-slate-100">
              {t('title')}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Interactive Step Switcher */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {Array.from({ length: stepCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                activeStep === idx
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`material-symbols-outlined text-base ${activeStep === idx ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {stepIconKeys[idx]}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('stepLabel', { n: idx + 1 })}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {tSteps(`${idx}.title`).split(' ').slice(1).join(' ') || tSteps(`${idx}.title`)}
              </p>
            </button>
          ))}
        </div>

        {/* Step Visual Detail */}
        <div className="space-y-4 mb-8">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              {tSteps(`${activeStep}.title`)}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tSteps(`${activeStep}.desc`)}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 space-y-2 border border-slate-800">
            <div className="text-slate-400">{tSteps(`${activeStep}.phaseLabel`)}</div>
            <div>{tSteps(`${activeStep}.line1`)}</div>
            <div>{tSteps(`${activeStep}.line2`)}</div>
            <div className="text-emerald-300">{tSteps(`${activeStep}.line3`)}</div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveStep((prev) => (prev + 1) % stepCount)}
            className="text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {t('nextStep')}
          </button>
          <a
            href="#conversion"
            onClick={() => {
              onClose();
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-mono text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <span>{t('cta')}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

      </div>
    </div>
  );
};