import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface FooterProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onOpenBlog?: () => void;
}

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error';

export const Footer: React.FC<FooterProps> = ({
  onShowToast,
  onOpenBlog
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscribeStatus>('idle');
  const [message, setMessage] = useState('');
  const locale = useLocale();
  const t = useTranslations('footer');

  const getLocalizedPath = (path: string) =>
    locale === 'en' ? path : `/${locale}${path}`;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || t('subscribeError'));
        onShowToast(data.error || t('subscribeError'), 'error');
        return;
      }

      setStatus('success');
      setMessage(data.message || t('subscribeSuccess'));
      onShowToast(data.message || t('subscribeSuccess'), 'success');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(t('networkError'));
      onShowToast(t('networkError'), 'error');
    }
  };

  return (
    <footer className="relative z-10 bg-slate-100/70 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Left Column: Brand & Newsletter */}
          <div className="lg:col-span-5 space-y-6">
            <Link href={getLocalizedPath('/')} className="flex items-center gap-2.5 inline-flex">
              <Image
                src="/logo.png"
                alt="FileMarkd Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold font-headline text-emerald-800 dark:text-emerald-400 tracking-tight">
                FileMarkd
              </span>
            </Link>

            <div className="space-y-3">
              <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-slate-100">
                {t('newsletterTitle')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {t('newsletterDesc')}
              </p>
              
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md pt-1">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-xs disabled:opacity-60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-mono text-sm font-semibold hover:shadow-md hover:shadow-emerald-700/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('subscribing')}
                    </>
                  ) : status === 'success' ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('subscribed')}
                    </>
                  ) : (
                    t('subscribe')
                  )}
                </button>
              </form>
              {status === 'success' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {message}
                </p>
              )}
              {status === 'error' && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8 lg:pl-16">
            
            {/* Products */}
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-slate-100">
                {t('products')}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href={getLocalizedPath('/#features')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {t('features')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/#subscription-plans')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {t('pricing')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedPath('/#conversion')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {t('conversionExamples')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Friendly Links */}
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-slate-100">
                {t('resources')}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="https://filemarkd.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {t('linkFileMarkd')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://getmoney.wang/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {t('linkGetMoneyWang')}
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright and Socials */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-slate-500 dark:text-slate-400">
            <span>© {new Date().getFullYear()} FileMarkd. {t('allRightsReserved')}</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span>{t('copyrightNote')}</span>
            <div className="flex gap-4 mt-2 md:mt-0">
              <Link href={getLocalizedPath('/privacy')} className="hover:text-emerald-600 transition-colors">
                {t('privacy')}
              </Link>
              <Link href={getLocalizedPath('/terms')} className="hover:text-emerald-600 transition-colors">
                {t('terms')}
              </Link>
              <Link href={getLocalizedPath('/cookies')} className="hover:text-emerald-600 transition-colors">
                {t('cookies')}
              </Link>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex gap-3">
            <a
              href="https://x.com/zyailive"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (formerly Twitter)"
              className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 hover:bg-emerald-700 hover:text-white transition-all shadow-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/ItusiAI"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 hover:bg-emerald-700 hover:text-white transition-all shadow-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
