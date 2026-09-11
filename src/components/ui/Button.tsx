import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
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
  // Production standard: solid dark action, neutral focus ring, clean geometry
  const baseStyles = 'inline-flex items-center justify-center font-body text-base font-medium rounded-xl transition-colors duration-150 select-none whitespace-nowrap active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#181d26]';

  const variantStyles: Record<ButtonVariant, string> = {
    // Primary Action: Solid near-black #181d26 with white text, lighter neutral hover, #3F3F46 pressed
    'primary': 'bg-[#181d26] text-white hover:bg-[#2c333f] active:bg-[#3F3F46] shadow-sm',
    // Secondary Action: White background with 1px neutral hairline border #dddddd and dark text
    'secondary': 'bg-white text-[#181d26] border border-[#dddddd] hover:bg-[#f8fafc] active:bg-[#e0e2e6]',
    // Tertiary Action: No filled background, dark text, clean interaction
    'tertiary': 'bg-transparent text-[#181d26] hover:text-[#0d1218] hover:bg-[#f8fafc] active:bg-[#e0e2e6]',
    // Secondary on dark surfaces: clean solid white with dark text
    'secondary-on-dark': 'bg-white text-[#181d26] hover:bg-[#f8fafc] active:bg-[#e0e2e6] shadow-sm',
    'outline-dark': 'bg-white text-[#181d26] hover:bg-[#f8fafc] active:bg-[#e0e2e6] shadow-sm',
    'outline-light': 'bg-white text-[#181d26] border border-[#dddddd] hover:bg-[#f8fafc] active:bg-[#e0e2e6]',
    // Danger / Critical Action: Solid dark red/coral
    'critical': 'bg-[#aa2d00] text-white hover:bg-[#882400] active:bg-[#701e00]',
    'coral': 'bg-[#181d26] text-white hover:bg-[#2c333f] active:bg-[#3F3F46]',
    // Remap legacy aliases to standard primary dark action (NO green buttons)
    'forest': 'bg-[#181d26] text-white hover:bg-[#2c333f] active:bg-[#3F3F46]',
    'aloe': 'bg-[#181d26] text-white hover:bg-[#2c333f] active:bg-[#3F3F46]',
    'rescue': 'bg-[#181d26] text-white hover:bg-[#2c333f] active:bg-[#3F3F46]',
    'ghost': 'bg-transparent text-[#181d26] hover:bg-[#f8fafc] active:bg-[#e0e2e6]',
    'ghost-dark': 'bg-transparent text-white hover:bg-white/10 active:bg-white/15',
    'pill': 'bg-white text-[#1d1f25] border border-[#dddddd] rounded-pill hover:bg-[#f8fafc]',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    'sm': 'text-xs py-2 px-3.5 gap-1.5 min-h-[36px] rounded-lg',
    'md': 'text-sm py-3 px-5 gap-2 min-h-[44px] rounded-xl',
    'lg': 'text-base py-4 px-6 gap-2.5 min-h-[48px] rounded-xl',
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
