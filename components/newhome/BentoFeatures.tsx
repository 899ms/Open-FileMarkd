import React from 'react';
import { useTranslations } from 'next-intl';

export const BentoFeatures: React.FC = () => {
  const t = useTranslations('bentoFeatures');

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32" id="features">
      <div className="text-center mb-16 sm:mb-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
          {t('sectionTitle')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t('sectionSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: 文本提取与层级保留 (Left: spans 2 columns and 2 rows) */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bento-card glass bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 rounded-3xl flex flex-col justify-between group overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 text-white">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                dataset
              </span>
            </div>
            <h3 className="text-2xl font-bold font-headline text-slate-900 dark:text-slate-100">
              {t('card1Title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t('card1Desc')}
            </p>
          </div>

          {/* Interactive terminal code preview snippet */}
          <div className="mt-8 relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold">
                {t('terminalTab')}
              </div>
            </div>
            <div className="p-5 space-y-3 font-mono text-xs overflow-y-auto max-h-56 select-none">
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">#</span>
                <span className="text-white font-bold">Annual Strategic Analysis 2024</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                This document outlines the <span className="text-emerald-300">core operational metrics</span> and fiscal projections for the upcoming quarter, utilizing AI-driven extraction for structural integrity.
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-emerald-400 font-bold">##</span>
                <span className="text-slate-200">1. Market Penetration Matrix</span>
              </div>
              <div className="text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-nowrap border border-slate-800 p-2 rounded bg-slate-900/80">
                | Segment | Growth | ROI | Status |<br/>
                | :--- | :--- | :--- | :--- |<br/>
                | **Enterprise** | +24.5% | 3.2x | <span className="text-emerald-400">[Stable]</span> |<br/>
                | **SME** | +12.8% | 1.8x | <span className="text-emerald-400">[Growth]</span> |
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-emerald-400 font-bold">##</span>
                <span className="text-slate-200">2. Technical Architecture</span>
              </div>
              <ul className="space-y-1 pl-3 text-slate-300">
                <li className="flex gap-2"><span className="text-emerald-400">-</span> <span>OCR Engine:</span> <span className="text-emerald-300 font-medium">AI Engine</span></li>
                <li className="flex gap-2"><span className="text-emerald-400">-</span> <span>Layout Analysis:</span> <span className="text-emerald-300 font-medium">Semantic-Block-v2</span></li>
              </ul>
              <div className="py-2.5 px-3 bg-slate-900/90 rounded border border-slate-800 text-center font-mono text-xs">
                <span className="text-emerald-400">$$</span>
                <span className="text-slate-100 mx-2">\eta = \sum_{`{i=1}`}^{`{n}`} \frac{`{\\text{Precision}_i}`}{`{\\text{Latency}_i}`}</span>
                <span className="text-emerald-400">$$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 高级表格格式化 (Top Right: spans 2 columns) */}
        <div className="md:col-span-2 lg:col-span-2 bento-card glass bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 rounded-3xl flex items-center justify-between gap-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex-1 space-y-3">
            <h3 className="text-2xl font-bold font-headline text-slate-900 dark:text-slate-100">
              {t('card2Title')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('card2Desc')}
            </p>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-emerald-100/60 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center border border-emerald-300/40 dark:border-emerald-800/40">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-4xl sm:text-5xl">
              table_chart
            </span>
          </div>
        </div>

        {/* Card 3: 置信度评分 (Directly below Advanced Table Formatting - col 1 of right side) */}
        <div className="md:col-span-1 lg:col-span-1 bento-card bg-emerald-700 text-white p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-lg shadow-emerald-800/20">
          <span className="material-symbols-outlined text-4xl mb-6 opacity-90">
            fact_check
          </span>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-white">
              {t('card3Title')}
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {t('card3Desc')}
            </p>
          </div>
        </div>

        {/* Card 4: 多语言精通 (Directly below Advanced Table Formatting - col 2 of right side) */}
        <div className="md:col-span-1 lg:col-span-1 bento-card bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col justify-between border border-slate-800 shadow-lg">
          <span className="material-symbols-outlined text-4xl mb-6 text-emerald-400">
            translate
          </span>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-slate-50">
              {t('card4Title')}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('card4Desc')}
            </p>
          </div>
        </div>

        {/* Card 5: 智能页眉页脚与元数据提取 (Bottom full width: spans 4 columns) */}
        <div className="md:col-span-2 lg:col-span-4 bento-card glass bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex-1 space-y-3">
            <h3 className="text-2xl font-bold font-headline text-slate-900 dark:text-slate-100">
              {t('card5Title')}
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('card5Desc')}
            </p>
          </div>
          <div className="w-full md:w-64 h-24 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40 px-4">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-4xl">
              vertical_align_top
            </span>
            <span className="material-symbols-outlined text-emerald-400/60 text-2xl mx-4">
              more_horiz
            </span>
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-4xl">
              vertical_align_bottom
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
