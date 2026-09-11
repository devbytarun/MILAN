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
  const baseStyles = 'inline-flex items-center gap-1.5 font-body font-medium uppercase tracking-wider rounded-md select-none';

  const variantStyles: Record<BadgeVariant, string> = {
    // Airtable signature surfaces
    'mint': 'bg-[#a8d8c4]/30 text-[#006400] border border-[#a8d8c4] font-semibold',
    'shade': 'bg-[#f8fafc] text-[#333840] border border-[#dddddd]',
    'dark': 'bg-[#181d26] text-white border border-[#181d26] font-semibold',
    'outline': 'bg-transparent text-[#181d26] border border-[#dddddd]',
    'verified': 'bg-[#a8d8c4]/30 text-[#006400] border border-[#a8d8c4] font-semibold',
    'pending': 'bg-[#f5e9d4] text-[#181d26] border border-[#e0d0b5] font-semibold',
    'critical': 'bg-[#aa2d00]/10 text-[#aa2d00] border border-[#aa2d00]/30 font-semibold',
    'info': 'bg-[#254fad]/10 text-[#254fad] border border-[#458fff]/40 font-semibold',
    'offline': 'bg-[#e0e2e6] text-[#41454d] border border-[#dddddd] font-semibold',
    'rescue': 'bg-[#0a2e0e]/10 text-[#0a2e0e] border border-[#0a2e0e]/30 font-semibold',
    'hospital': 'bg-[#f5e9d4] text-[#181d26] border border-[#e0d0b5] font-semibold',
    'coral': 'bg-[#aa2d00]/10 text-[#aa2d00] border border-[#aa2d00]/30 font-semibold',
    'forest': 'bg-[#0a2e0e]/10 text-[#0a2e0e] border border-[#0a2e0e]/30 font-semibold',
    'cream': 'bg-[#f5e9d4] text-[#181d26] border border-[#e0d0b5] font-semibold',
    'peach': 'bg-[#fcab79]/30 text-[#aa2d00] border border-[#fcab79] font-semibold',
  };

  const sizeStyles = {
    'sm': 'text-[10px] py-0.5 px-2 rounded-xs',
    'md': 'text-xs py-1 px-2.5 rounded-sm',
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
