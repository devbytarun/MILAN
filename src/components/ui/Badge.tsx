import React from 'react';

export type BadgeVariant =
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
  | 'hospital';

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
  const baseStyles = 'inline-flex items-center gap-1.5 font-body font-medium uppercase tracking-wider rounded-pill select-none';

  const variantStyles: Record<BadgeVariant, string> = {
    'mint': 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    'shade': 'bg-slate-100 text-slate-800 border border-slate-200',
    'dark': 'bg-slate-900 text-white border border-slate-700',
    'outline': 'bg-transparent text-slate-800 border border-slate-200',
    'verified': 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    'pending': 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    'critical': 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold',
    'info': 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold',
    'offline': 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold',
    'rescue': 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold',
    'hospital': 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold',
  };

  const sizeStyles = {
    'sm': 'text-[10px] py-0.5 px-2',
    'md': 'text-xs py-1 px-3',
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
