import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="text-slate-300 dark:text-slate-600">
        {icon || <Sparkles size={40} />}
      </div>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{message}</p>
      {action}
    </div>
  );
}

interface ToastProps {
  message: string;
  show: boolean;
}

export function Toast({ message, show }: ToastProps) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className="card px-4 py-3 text-sm font-medium shadow-lg">
        {message}
      </div>
    </div>
  );
}
