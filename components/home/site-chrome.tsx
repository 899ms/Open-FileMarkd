"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Navbar } from '@/components/newhome/Navbar';
import { Footer } from '@/components/newhome/Footer';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface ShowToastFn {
  (text: string, type?: 'success' | 'info' | 'error'): void;
}

export const SiteChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Clone children to pass onShowToast prop
  const renderChildren = () => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ onShowToast?: ShowToastFn }>, {
        onShowToast: showToast,
      });
    }
    return children;
  };

  return (
    <div className="font-sans min-h-screen relative">
      <Navbar darkMode={isDark} onToggleDarkMode={toggleTheme} />

      <main className="relative">{renderChildren()}</main>

      <Footer
        onShowToast={showToast}
        onOpenBlog={() => showToast('FileMarkd 官方技术博客即将上线，敬请期待！', 'info')}
      />

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-right-5
                ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : ''}
                ${toast.type === 'error' ? 'bg-rose-500/90 text-white' : ''}
                ${toast.type === 'info' ? 'bg-slate-800/90 dark:bg-slate-200/90 text-white dark:text-slate-800' : ''}
              `}
            >
              <span className="text-sm font-medium flex-1">{toast.text}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
