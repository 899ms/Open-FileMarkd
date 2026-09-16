"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, ChevronDown, Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { SignInDialog } from '@/components/auth/signin-dialog';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const LOCALES = [
  { code: 'en', name: 'English', shortName: 'EN' },
  { code: 'zh-CN', name: '简体中文', shortName: '中' },
  { code: 'zh-TW', name: '繁體中文', shortName: '繁' },
  { code: 'ja', name: '日本語', shortName: 'JP' },
  { code: 'ko', name: '한국어', shortName: '한' },
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = useTranslations('navbar');

  const getLocalizedPath = (path: string) =>
    locale === 'en' ? path : `/${locale}${path}`;

  // Same-page hash navigation: smooth scroll to the anchor with navbar offset.
  // If we're not on the homepage, navigate to the locale-prefixed home + hash.
  const handleHashNav = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const targetHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const homePath = getLocalizedPath('/');
    const isOnHome =
      window.location.pathname === homePath ||
      window.location.pathname === '/';
    if (isOnHome) {
      const el = document.getElementById(targetHash);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', `${window.location.pathname}#${targetHash}`);
        return;
      }
    }
    window.location.href = `${homePath}#${targetHash}`;
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleLocaleChange = (newLocale: string) => {
    const currentPath = window.location.pathname;
    // 移除当前语言前缀（包括 /en, /zh-CN, /zh-TW, /ja, /ko）
    const pathWithoutLocale = currentPath.replace(/^\/(en|zh-CN|zh-TW|ja|ko)/, '');
    const newPath = newLocale === 'en' ? (pathWithoutLocale || '/') : `/${newLocale}${pathWithoutLocale || ''}`;
    window.location.href = newPath;
  };

  const currentLocale = LOCALES.find(l => l.code === locale) || LOCALES[0];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9ff]/80 dark:bg-[#121c2a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
        <nav className="flex justify-between items-center w-full px-4 sm:px-6 md:px-8 h-16 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href={getLocalizedPath('/')} className="flex items-center gap-2.5 group select-none">
            <Image
              src="/logo.png"
              alt="FileMarkd Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
            <span className="text-2xl font-bold font-headline text-emerald-800 dark:text-emerald-400 tracking-tight">
              FileMarkd
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href={getLocalizedPath('/#features')}
              onClick={handleHashNav('features')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t('features')}
            </a>
            <a
              href={getLocalizedPath('/#subscription-plans')}
              onClick={handleHashNav('subscription-plans')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t('pricing')}
            </a>
            <a
              href={getLocalizedPath('/#faq')}
              onClick={handleHashNav('faq')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t('faq')}
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative group">
              <button
                onClick={onToggleDarkMode}
                aria-label={darkMode ? t('switchToLight') : t('switchToDark')}
                title={darkMode ? t('switchToLight') : t('switchToDark')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {darkMode ? t('themeLight') : t('themeDark')}
                </span>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-36 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => { if (darkMode) onToggleDarkMode(); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    !darkMode
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    {t('themeLight')}
                  </span>
                </button>
                <button
                  onClick={() => { if (!darkMode) onToggleDarkMode(); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    darkMode
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    {t('themeDark')}
                  </span>
                </button>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title={t('switchLanguage')}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{currentLocale.shortName}</span>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-40 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => handleLocaleChange(loc.code)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      locale === loc.code
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span className="text-xs opacity-60">{loc.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href={getLocalizedPath('/profile')} className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors">
                    {t('profile')}
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    {t('signOut')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsSignInDialogOpen(true)}
                  className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium text-sm px-3 py-2 transition-colors cursor-pointer"
                >
                  {t('signIn')}
                </button>
                <Link
                  href={getLocalizedPath('/auth/signup')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-sm font-medium px-5 py-2 rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-700/20 active:scale-95 transition-all inline-flex items-center justify-center"
                >
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              aria-label={darkMode ? t('switchToLight') : t('switchToDark')}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span className="text-xs font-medium uppercase tracking-wider">
                {darkMode ? t('themeLight') : t('themeDark')}
              </span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2">
            <a
              href={getLocalizedPath('/#features')}
              onClick={(e) => { handleHashNav('features')(e); }}
              className="block py-2 px-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t('features')}
            </a>
            <a
              href={getLocalizedPath('/#subscription-plans')}
              onClick={(e) => { handleHashNav('subscription-plans')(e); setMobileMenuOpen(false); }}
              className="block py-2 px-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t('pricing')}
            </a>
            <a
              href={getLocalizedPath('/#faq')}
              onClick={(e) => { handleHashNav('faq')(e); setMobileMenuOpen(false); }}
              className="block py-2 px-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t('faq')}
            </a>
            
            {/* Theme toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="px-3 py-1 text-xs text-slate-400">{t('theme')}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <button
                  onClick={() => { if (darkMode) onToggleDarkMode(); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${
                    !darkMode
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  {t('themeLight')}
                </button>
                <button
                  onClick={() => { if (!darkMode) onToggleDarkMode(); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${
                    darkMode
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  {t('themeDark')}
                </button>
              </div>
            </div>

            {/* Language options */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="px-3 py-1 text-xs text-slate-400">{t('language')}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => {
                      handleLocaleChange(loc.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      locale === loc.code
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              {session ? (
                <>
                  <Link href={getLocalizedPath('/profile')} onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    {t('profile')}
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} className="block py-2 px-3 text-left text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    {t('signOut')}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); setIsSignInDialogOpen(true); }} className="block py-2 px-3 text-left text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    {t('signIn')}
                  </button>
                  <Link href={getLocalizedPath('/auth/signup')} onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-center bg-emerald-700 text-white rounded-lg font-medium">
                    {t('signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <SignInDialog open={isSignInDialogOpen} onOpenChange={setIsSignInDialogOpen} />
    </>
  );
};
