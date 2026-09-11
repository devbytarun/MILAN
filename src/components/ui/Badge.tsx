import React from 'react';

export type BadgeVariant =
  | 'brand'
  | 'mint'
  | 'shade'
  | 'dark'
  | 'outline'
  | 'verified'
  | 'pending'
  | 'critical'
  | 'info'
  | 'offline'
  | 'rescue'
  | 'hospital'
  | 'coral'
  | 'forest'
  | 'cream'
  | 'peach';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'shade',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider rounded-md select-none transition-colors';

  const variantStyles: Record<BadgeVariant, string> = {
    'brand': 'bg-orange-50 text-orange-700 border border-orange-200',
    'mint': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'verified': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'pending': 'bg-amber-50 text-amber-800 border border-amber-200',
    'critical': 'bg-rose-50 text-rose-700 border border-rose-200',
    'coral': 'bg-orange-50 text-orange-700 border border-orange-200',
    'info': 'bg-blue-50 text-blue-700 border border-blue-200',
    'offline': 'bg-slate-100 text-slate-600 border border-slate-200',
    'shade': 'bg-slate-50 text-slate-700 border border-slate-200',
    'outline': 'bg-transparent text-slate-700 border border-slate-200',
    'dark': 'bg-slate-900 text-white border border-slate-900',
    'rescue': 'bg-orange-50 text-orange-800 border border-orange-200',
    'hospital': 'bg-blue-50 text-blue-800 border border-blue-200',
    'forest': 'bg-slate-900 text-white border border-slate-900',
    'cream': 'bg-amber-50 text-amber-900 border border-amber-200',
    'peach': 'bg-orange-50 text-orange-800 border border-orange-200',
  };

  const sizeStyles = {
    'sm': 'text-[10px] py-0.5 px-2 rounded',
    'md': 'text-[11px] py-0.5 px-2.5 rounded-md',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
