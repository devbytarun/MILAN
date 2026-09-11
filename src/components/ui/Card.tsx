import React from 'react';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'featured-aloe'
  | 'pistachio'
  | 'cinematic'
  | 'flat'
  | 'emergency'
  | 'informational'
  | 'sunlight'
  | 'signature-coral'
  | 'signature-forest'
  | 'signature-cream'
  | 'signature-dark'
  | 'demo-grid'
  | 'tabbed';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-colors duration-150';

  const variantStyles: Record<CardVariant, string> = {
    'default': 'bg-white text-[#181d26] border border-[#dddddd] p-6 sm:p-8',
    'elevated': 'bg-white text-[#181d26] border border-[#dddddd] shadow-elevation-2 p-6 sm:p-8',
    'featured-aloe': 'bg-[#0a2e0e] text-white p-6 sm:p-8',
    'pistachio': 'bg-[#a8d8c4]/30 text-[#181d26] border border-[#a8d8c4] p-6 sm:p-8',
    'cinematic': 'bg-[#181d26] text-white p-6 sm:p-8',
    'flat': 'bg-white text-[#181d26] border border-[#dddddd] p-6 sm:p-8',
    'emergency': 'bg-[#aa2d00]/10 border border-[#aa2d00]/30 text-[#aa2d00] p-6 sm:p-8',
    'informational': 'bg-[#f8fafc] border border-[#dddddd] text-[#181d26] p-6 sm:p-8',
    'sunlight': 'bg-white border border-[#181d26] text-[#181d26] p-6 sm:p-8',

    // Airtable signature surface cards
    'signature-coral': 'bg-[#aa2d00] text-white p-8 sm:p-12',
    'signature-forest': 'bg-[#0a2e0e] text-white p-8 sm:p-12',
    'signature-cream': 'bg-[#f5e9d4] text-[#181d26] p-6 sm:p-8 rounded-lg',
    'signature-dark': 'bg-[#181d26] text-white p-8 sm:p-12',
    'demo-grid': 'bg-white text-[#181d26] border border-[#dddddd] rounded-md p-4 sm:p-6',
    'tabbed': 'bg-[#f8fafc] text-[#181d26] border border-[#dddddd] p-6 sm:p-8',
  };

  const interactiveStyles = interactive ? 'hover:border-[#9297a0] cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
