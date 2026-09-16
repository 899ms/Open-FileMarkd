import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-3 transition-all animate-in slide-in-from-bottom-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-100'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-700/80 text-rose-100'
              : 'bg-slate-900/90 border-slate-700 text-slate-100'
          }`}
        >
          <span className={`material-symbols-outlined text-xl flex-shrink-0 ${
            toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-rose-400' : 'text-slate-300'
          }`}>
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <p className="text-xs sm:text-sm font-medium leading-tight flex-1">
            {toast.text}
          </p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
