import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'brand'
  | 'secondary'
  | 'tertiary'
  | 'secondary-on-dark'
  | 'outline-dark'
  | 'outline-light'
  | 'coral'
  | 'forest'
  | 'aloe'
  | 'rescue'
  | 'critical'
  | 'ghost'
  | 'ghost-dark'
  | 'pill';

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
  // Production grade: restrained typography, crisp boundary, subtle micro-scale on active
  const baseStyles = 'inline-flex items-center justify-center font-body font-medium transition-all duration-150 ease-out select-none whitespace-nowrap cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantStyles: Record<ButtonVariant, string> = {
    // Primary Action: Deep Slate/Ink with white text and clean hover
    'primary': 'bg-[#0f172a] text-white hover:bg-[#1e293b] active:bg-[#020617] shadow-sm focus-visible:ring-[#0f172a]',
    // Brand Action: Warm Orange Accent with white text
    'brand': 'bg-[#ea580c] text-white hover:bg-[#c2410c] active:bg-[#9a3412] shadow-sm focus-visible:ring-[#ea580c]',
    // Secondary Action: Clean white background with crisp 1px slate-200 border
    'secondary': 'bg-white text-[#0f172a] border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100 shadow-sm focus-visible:ring-slate-400',
    // Tertiary Action: Minimal, transparent with subtle hover pill
    'tertiary': 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
    // Secondary on dark surfaces
    'secondary-on-dark': 'bg-white text-[#0f172a] hover:bg-slate-100 active:bg-slate-200 shadow-sm focus-visible:ring-white',
    'outline-dark': 'bg-white text-[#0f172a] hover:bg-slate-100 active:bg-slate-200 shadow-sm focus-visible:ring-white',
    'outline-light': 'bg-white text-[#0f172a] border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 shadow-sm focus-visible:ring-slate-400',
    // Danger / Critical Action: Rose-600
    'critical': 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus-visible:ring-rose-500',
    'coral': 'bg-[#ea580c] text-white hover:bg-[#c2410c] active:bg-[#9a3412] shadow-sm focus-visible:ring-[#ea580c]',
    // Legacy aliases mapped to primary ink
    'forest': 'bg-[#0f172a] text-white hover:bg-[#1e293b] active:bg-[#020617] shadow-sm focus-visible:ring-[#0f172a]',
    'aloe': 'bg-[#0f172a] text-white hover:bg-[#1e293b] active:bg-[#020617] shadow-sm focus-visible:ring-[#0f172a]',
    'rescue': 'bg-[#0f172a] text-white hover:bg-[#1e293b] active:bg-[#020617] shadow-sm focus-visible:ring-[#0f172a]',
    'ghost': 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
    'ghost-dark': 'bg-transparent text-white hover:bg-white/10 active:bg-white/20 focus-visible:ring-white',
    'pill': 'bg-white text-[#0f172a] border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 shadow-sm focus-visible:ring-slate-400',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    'sm': 'text-xs h-9 px-3.5 gap-1.5 rounded-lg',
    'md': 'text-sm h-10 px-4 gap-2 rounded-lg',
    'lg': 'text-base h-12 px-6 gap-2.5 rounded-xl',
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
