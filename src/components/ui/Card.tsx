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
  const baseStyles = 'rounded-xl transition-all duration-200 ease-out font-body';

  const variantStyles: Record<CardVariant, string> = {
    'default': 'bg-white text-slate-900 border border-slate-200/90 shadow-card p-6 sm:p-8',
    'elevated': 'bg-white text-slate-900 border border-slate-200/90 shadow-card-hover p-6 sm:p-8',
    'featured-aloe': 'bg-slate-900 text-white p-6 sm:p-8',
    'pistachio': 'bg-orange-50/50 text-slate-900 border border-orange-200 p-6 sm:p-8',
    'cinematic': 'bg-slate-900 text-white p-6 sm:p-8',
    'flat': 'bg-white text-slate-900 border border-slate-200 p-6 sm:p-8',
    'emergency': 'bg-rose-50/60 border border-rose-200 text-rose-800 p-6 sm:p-8',
    'informational': 'bg-slate-50/60 border border-slate-200 text-slate-900 p-6 sm:p-8',
    'sunlight': 'bg-white border border-slate-900 text-slate-900 p-6 sm:p-8',

    // Signature brand surface cards
    'signature-coral': 'bg-[#ea580c] text-white p-8 sm:p-12',
    'signature-forest': 'bg-slate-900 text-white p-8 sm:p-12',
    'signature-cream': 'bg-amber-50 text-slate-900 border border-amber-200 p-6 sm:p-8 rounded-xl',
    'signature-dark': 'bg-slate-900 text-white p-8 sm:p-12',
    'demo-grid': 'bg-white text-slate-900 border border-slate-200 rounded-lg p-4 sm:p-6 shadow-sm',
    'tabbed': 'bg-slate-50/70 text-slate-900 border border-slate-200 p-6 sm:p-8',
  };

  const interactiveStyles = interactive ? 'hover:border-slate-300 hover:shadow-card-hover cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
