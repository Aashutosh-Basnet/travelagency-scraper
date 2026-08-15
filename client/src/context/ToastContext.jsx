import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-md animate-fade-in transition-all duration-200 ${
              t.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-emerald-950 shadow-emerald-950/5'
                : t.type === 'error'
                ? 'bg-white/95 border-rose-200 text-rose-950 shadow-rose-950/5'
                : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-neutral-950/5'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <Info className="w-4 h-4 text-neutral-600" />
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium leading-snug flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
