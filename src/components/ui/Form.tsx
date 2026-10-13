import type { ReactNode } from 'react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
}

export function Select({ value, onChange, options, label, className = '' }: SelectProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input focus-ring cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: string;
  className?: string;
}

export function Input({ value, onChange, placeholder, label, type = 'text', className = '' }: InputProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input focus-ring"
      />
    </div>
  );
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  rows?: number;
}

export function Textarea({ value, onChange, placeholder, label, className = '', rows = 3 }: TextareaProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="textarea focus-ring"
      />
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    accent: 'accent-bg accent-text',
    success: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`badge ${variants[variant]}`}>{children}</span>
  );
}

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className = '', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`relative w-full ${className}`}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: 'var(--accent-primary)',
          }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
