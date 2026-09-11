import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'outline-dark' | 'outline-light' | 'aloe' | 'ghost' | 'ghost-dark';
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
  const baseStyles = 'inline-flex items-center justify-center font-body rounded-pill transition-all duration-200 select-none whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variantStyles: Record<ButtonVariant, string> = {
    'primary': 'bg-primary text-on-primary hover:bg-shade-70 active:bg-shade-70 shadow-sm',
    'outline-dark': 'bg-transparent text-on-dark border-2 border-on-dark hover:bg-white/10 active:bg-white/15',
    'outline-light': 'bg-canvas-light text-ink border border-ink hover:bg-canvas-cream active:bg-shade-30',
    'aloe': 'bg-aloe text-ink hover:bg-[#adf5c4] active:bg-[#97f0b2] shadow-sm font-medium',
    'ghost': 'bg-transparent text-ink hover:bg-black/5 active:bg-black/10',
    'ghost-dark': 'bg-transparent text-on-dark hover:bg-white/10 active:bg-white/15',
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
