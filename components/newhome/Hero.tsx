import React from 'react';
import { useTranslations } from 'next-intl';

interface HeroProps {
  onStartConvert: () => void;
  onOpenVideoDemo: () => void;
  onSelectFormatFilter?: (format: string) => void;
}

type FormatItem = { label: string; ext: string; hot?: boolean };

export const Hero: React.FC<HeroProps> = ({
  onStartConvert,
  onOpenVideoDemo,
  onSelectFormatFilter
}) => {
  const t = useTranslations('hero');

  const documentFormats: FormatItem[] = [
    { label: 'PDF', ext: '.pdf', hot: true },
    { label: 'Word (.docx, .doc)', ext: '.docx', hot: true },
    { label: 'PowerPoint (.pptx, .ppt)', ext: '.pptx', hot: true },
    { label: 'Excel (.xlsx, .csv)', ext: '.xlsx', hot: true },
    { label: 'Text Files (.txt)', ext: '.txt' },
    { label: 'EPUB', ext: '.epub' },
    { label: 'XML/DocBook', ext: '.xml' },
    { label: 'RTF', ext: '.rtf' },
    { label: 'OpenDocument (.odt)', ext: '.odt' },
    { label: 'BibTeX (.bib)', ext: '.bib' },
    { label: 'FictionBook (.fb2)', ext: '.fb2' },
    { label: 'Jupyter Notebooks (.ipynb)', ext: '.ipynb', hot: true },
    { label: 'JATS XML', ext: '.jats' },
    { label: 'LaTeX (.tex)', ext: '.tex', hot: true },
    { label: 'OPML', ext: '.opml' },
    { label: 'Troff', ext: '.troff' }
  ];

  const imageFormats: FormatItem[] = [
    { label: 'JPEG', ext: '.jpg' },
    { label: 'PNG', ext: '.png', hot: true },
    { label: 'AVIF', ext: '.avif' },
    { label: 'TIFF', ext: '.tiff' },
    { label: 'GIF', ext: '.gif' },
    { label: 'HEIC/HEIF', ext: '.heic' },
    { label: 'BMP', ext: '.bmp' },
    { label: 'WebP', ext: '.webp' }
  ];

  return (
    <section className="relative z-10 pt-36 sm:pt-44 pb-20 sm:pb-28 w-full overflow-hidden">
      {/* Background ambient lighting and pattern */}
      <div className="absolute inset-0 hero-pattern opacity-40 pointer-events-none"></div>
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-emerald-600/10 dark:bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10">

          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-700/60 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {t('badge')}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-[72px] lg:leading-[82px] font-bold font-headline tracking-tight text-slate-900 dark:text-slate-50 max-w-5xl">
            {t('titleBefore')}<span className="text-gradient">{t('titleHighlight')}</span>{t('titleAfter')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
            {t('subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <a
              href="#conversion"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 rounded-xl font-headline text-lg font-semibold flex items-center gap-2 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 border border-emerald-600/50"
            >
              {t('primaryCta')}
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </a>
            <button
              onClick={onOpenVideoDemo}
              className="bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl font-headline text-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-200 backdrop-blur-sm cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl text-emerald-600 dark:text-emerald-400">touch_app</span>
              {t('secondaryCta')}
            </button>
          </div>

          {/* Visual Showcase Card with Document and Image Chips */}
          <div className="w-full max-w-4xl mt-12 sm:mt-16 text-left">
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-10 backdrop-blur-md shadow-[0_10px_40px_rgba(4,120,87,0.08)] transition-all hover:shadow-[0_15px_50px_rgba(4,120,87,0.12)]">

              {/* Documents Block */}
              <div className="mb-8">
                <h3 className="text-xl font-bold font-headline text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    description
                  </span>
                  {t('documentsTitle')}
                </h3>
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {documentFormats.map((item, idx) => (
                    <a
                      key={idx}
                      href="#conversion"
                      onClick={() => onSelectFormatFilter && onSelectFormatFilter(item.ext)}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-emerald-600/20 dark:border-emerald-400/20 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-mono hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:scale-105 hover:border-emerald-600/40 transition-all shadow-xs"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Images Block */}
              <div>
                <h3 className="text-xl font-bold font-headline text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    image
                  </span>
                  {t('imagesTitle')}
                </h3>
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {imageFormats.map((item, idx) => (
                    <a
                      key={idx}
                      href="#conversion"
                      onClick={() => onSelectFormatFilter && onSelectFormatFilter(item.ext)}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-emerald-600/20 dark:border-emerald-400/20 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-mono hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:scale-105 hover:border-emerald-600/40 transition-all shadow-xs"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
