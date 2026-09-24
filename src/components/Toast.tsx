import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  let bgClass = 'bg-stone-900 text-white border-stone-800';
  let icon = <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />;

  if (toast.type === 'error') {
    bgClass = 'bg-rose-950 text-rose-50 border-rose-800';
    icon = <AlertCircle size={18} className="text-rose-400 shrink-0" />;
  } else if (toast.type === 'info') {
    bgClass = 'bg-stone-900 text-white border-stone-800';
    icon = <Info size={18} className="text-sky-400 shrink-0" />;
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl ${bgClass}`}
      >
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          {icon}
          <span>{toast.text}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-stone-400 hover:text-white transition-colors"
          aria-label="關閉通知"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
