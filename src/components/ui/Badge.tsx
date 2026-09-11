import React from 'react';

export type BadgeVariant = 'mint' | 'shade' | 'dark' | 'outline' | 'verified' | 'pending';

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
    'mint': 'bg-aloe text-ink border border-aloe/40',
    'shade': 'bg-shade-30 text-ink border border-shade-40/30',
    'dark': 'bg-shade-70 text-on-dark border border-shade-60',
    'outline': 'bg-transparent text-ink border border-hairline-light',
    'verified': 'bg-aloe text-ink border border-aloe/60 font-semibold',
    'pending': 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-semibold',
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
