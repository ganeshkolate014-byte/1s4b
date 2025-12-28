import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div 
        className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none flex flex-col items-center gap-2 px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 5000); // Auto dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto w-full max-w-[360px] bg-white dark:bg-[#2c2c2e] p-4 rounded-[1.2rem] shadow-lg flex items-start gap-3.5 border border-zinc-200 dark:border-zinc-800"
        >
            <div className={`
                mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm
                ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
                ${toast.type === 'warning' ? 'bg-amber-500 text-white' : ''}
                ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
                ${toast.type === 'error' ? 'bg-rose-500 text-white' : ''}
            `}>
                {toast.type === 'info' && <Info size={18} />}
                {toast.type === 'warning' && <AlertCircle size={18} />}
                {toast.type === 'success' && <CheckCircle size={18} />}
                {toast.type === 'error' && <AlertTriangle size={18} />}
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-[15px] font-bold text-zinc-900 dark:text-white leading-tight mb-1">{toast.title}</h4>
                <p className="text-[13px] text-zinc-500 dark:text-white/60 leading-snug font-medium">{toast.message}</p>
            </div>
            
            <button 
                onClick={() => onRemove(toast.id)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-white/20 dark:hover:text-white transition-colors p-1 -mr-1"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
};