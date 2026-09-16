import React from 'react';
import { useTranslations } from 'next-intl';

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    quote: '"FileMarkd drastically improved our documentation workflow. The table recognition and multi-language support are magic. It handles even the most complex DOCX layouts without breaking a sweat."',
    name: 'Alex Zhang',
    role: 'Senior Developer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKseWUUVY3BoVW_8XrlCi0O2NfKtCx5UkAWTNViZ8mSqFAl91bRARtTGJNthz0yfqnGBW1aJWah_NCnYkWWVLI3oNp3BgM0xMYDlvgVm7Yv8Ae-U75cl0HZZJKKiVce0htfqQ6PSdjR7LZC6HQXSmB4es25VYl8SD4akOVLQwYezo4g_MSWafOeoKJxO1GcmIm76lPIJVuBh_mnShcWXKokN-rTZRM6i4Gwure1MTancVL1wq-t_mZIqmBsmxbMzzmjROXiKOYWm4'
  },
  {
    id: 't2',
    quote: '"作为研究人员，我需要处理大量的学术论文。FileMarkd 提供的置信度评分和智能提取极大提升了效率，对复杂排版和公式的还原程度令人惊讶。"',
    name: 'Dr. Sarah Li',
    role: 'Academic Researcher',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnFkY3ch4V8UImsOOrrFPHBtQwImV9xpnNjSi3UrokyVDy69nsbgXhq_A1k_nzYxhK1GzTjAjRU3bnLRdlajhvOcgL2r78DMVcdB_bXt7BaG7EcM9Xty7jovJKVmLdHUD3dqiL1Pncc4B9igeicWP7D3gt2mDCDY_59hsQFKkAstMiOoMFDYGLJJq76CNmWFvlfn4BvCDMmFMHSJP4nKdzwlJ9lfjy7jAz116yClAP6Pcc13TZqjO8g6dgBtJP6v1w-6xq7WKpBvU'
  },
  {
    id: 't3',
    quote: '"Transitioning our legacy archives, spanning PDFs and PPTXs, to our internal CMS was a nightmare until we found FileMarkd. The block-level precision is unparalleled."',
    name: 'Michael Chen',
    role: 'Content Operations Manager',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0KXpvBtKnBRrPcq0RuWQcGHqY4zdaj1UJc3c5DqLuPR5t6YTx0ZaLRqksHAj7YsBcs5vXh1_mPQD-AZIlBkE_YPi654YSd4CIbZvxDlY2eEXLmDyRWWu4G7-GL1TMPhwf5JodUZD8ksfeZJJNH1aM9MpiK1s7dnjCdd8ndIQM416zs-41JMp0R05OjzKltpdSrA8GAgTC2pBZ8_we77NnUS0IWZq-xpFsUUeAh5P3TzkDbdPC_E1tDNxptMAdGhX8VWfW7f6_2Lo'
  }
];

export const Testimonials: React.FC = () => {
  const t = useTranslations('testimonials');

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 sm:mt-40" id="testimonials">

      <div className="text-center mb-16 sm:mb-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
          {t('sectionTitle')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto opacity-90">
          {t('sectionSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {TESTIMONIALS.map((item, idx) => (
          <div key={item.id} className={`relative group ${idx === 1 ? 'md:mt-8 lg:mt-6' : ''}`}>
            <div className="glass bg-white/70 dark:bg-slate-900/70 p-8 rounded-[2rem] shadow-lg hover:shadow-2xl hover:shadow-emerald-700/10 transition-all duration-500 group-hover:-translate-y-2 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between min-h-[300px]">

              {/* Decorative quotation mark */}
              <div className="absolute -top-4 -left-2 opacity-10 text-emerald-700 font-serif text-8xl pointer-events-none select-none">
                “
              </div>

              <div>
                {/* 5-Star Rating */}
                <div className="flex gap-1 mb-6 text-emerald-600 dark:text-emerald-400">
                  {[...Array(5)].map((_, starIdx) => (
                    <span
                      key={starIdx}
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-8 leading-relaxed font-normal">
                  {item.quote}
                </p>
              </div>

              {/* Author & Avatar */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-600/30 p-0.5 flex-shrink-0">
                  <img
                    alt={item.name}
                    src={item.avatar}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold">
                    {item.role}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </section>
  );
};