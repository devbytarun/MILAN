import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline-dark'
  | 'outline-light'
  | 'aloe'
  | 'rescue'
  | 'critical'
  | 'ghost'
  | 'ghost-dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-body rounded-pill transition-all duration-150 select-none whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  const variantStyles: Record<ButtonVariant, string> = {
    'primary': 'bg-humanitarian-blue text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm font-semibold',
    'secondary': 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm font-semibold',
    'outline-dark': 'bg-transparent text-white border border-slate-600 hover:bg-white/10 active:bg-white/15 font-medium',
    'outline-light': 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 font-medium shadow-sm',
    'aloe': 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm font-semibold',
    'rescue': 'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-sm font-semibold',
    'critical': 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm font-semibold',
    'ghost': 'bg-transparent text-slate-800 hover:bg-slate-100 active:bg-slate-200 font-medium',
    'ghost-dark': 'bg-transparent text-white hover:bg-white/10 active:bg-white/15 font-medium',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    'sm': 'text-xs py-2 px-4 gap-1.5 min-h-[36px]',
    'md': 'text-sm py-3 px-6 gap-2 min-h-[44px]',
    'lg': 'text-base py-3.5 px-8 gap-2.5 min-h-[48px]',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
