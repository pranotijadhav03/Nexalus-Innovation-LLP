import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { playNotificationChime } from '../utils/notificationHelpers';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  url?: string;
}

export interface ToastOptions {
  duration?: number;
  action?: ToastAction;
  playSound?: boolean;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, options?: ToastOptions) => void;
  success: (title: string, message?: string, options?: ToastOptions) => void;
  error: (title: string, message?: string, options?: ToastOptions) => void;
  info: (title: string, message?: string, options?: ToastOptions) => void;
  warning: (title: string, message?: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastToastRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, options?: ToastOptions) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message, action: options?.action }]);

    if (options?.playSound !== false) {
      playNotificationChime();
    }

    const duration = options?.duration ?? (options?.action ? 8000 : 4500);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback(
    (title: string, message?: string, options?: ToastOptions) => showToast('success', title, message, options),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string, options?: ToastOptions) => showToast('error', title, message, options),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string, options?: ToastOptions) => showToast('info', title, message, options),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string, options?: ToastOptions) => showToast('warning', title, message, options),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Heads-up Top Notification Container (Highest z-index: z-[10000]) */}
      <div className="fixed top-4 right-4 sm:right-6 z-[10000] flex flex-col items-end gap-2.5 max-w-sm sm:max-w-md w-[95%] sm:w-full px-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'bg-white/98 border-emerald-300 text-emerald-950 shadow-emerald-900/15'
                : toast.type === 'error'
                ? 'bg-white/98 border-rose-300 text-rose-950 shadow-rose-900/15'
                : toast.type === 'warning'
                ? 'bg-white/98 border-amber-300 text-amber-950 shadow-amber-900/15'
                : 'bg-white/98 border-blue-300 text-blue-950 shadow-blue-900/15'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'warning' && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <Info className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Notification
                </span>
              </div>
              <h4 className="font-bold text-sm leading-snug text-slate-900">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs mt-1 text-slate-600 leading-relaxed font-medium">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <div className="mt-2.5 flex items-center gap-2">
                  {toast.action.url ? (
                    <a
                      href={toast.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      <span>{toast.action.label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        toast.action?.onClick?.();
                        removeToast(toast.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
