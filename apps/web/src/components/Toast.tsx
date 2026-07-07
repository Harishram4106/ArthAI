import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={16} className="text-rose-500 shrink-0" />,
    info: <Info size={16} className="text-[#003366] shrink-0" />,
  };

  const colors = {
    success: 'border-emerald-200 bg-white',
    error: 'border-rose-200 bg-white',
    info: 'border-[#003366]/20 bg-white',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed top center, max-w matches app column */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg shadow-black/10 animate-[slide-in_0.2s_ease-out] pointer-events-auto ${colors[t.type]}`}
          >
            {icons[t.type]}
            <p className="text-sm font-semibold text-gray-800 flex-1 leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
