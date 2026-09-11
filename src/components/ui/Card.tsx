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
  | 'sunlight';

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
  const baseStyles = 'rounded-lg transition-all duration-150';

  const variantStyles: Record<CardVariant, string> = {
    'default': 'bg-white text-slate-900 border border-slate-200 shadow-elevation-1 p-6 sm:p-8',
    'elevated': 'bg-white text-slate-900 border border-slate-200 shadow-elevation-3 p-6 sm:p-8',
    'featured-aloe': 'bg-emerald-50 text-slate-900 border border-emerald-200 shadow-elevation-2 p-6 sm:p-8',
    'pistachio': 'bg-teal-50 text-slate-900 border border-teal-200 p-6 sm:p-8',
    'cinematic': 'bg-slate-900 text-white border border-slate-800 shadow-elevation-2 p-6 sm:p-8',
    'flat': 'bg-white text-slate-900 border border-slate-200 p-6 sm:p-8',
    'emergency': 'bg-rose-50 border border-rose-200 text-slate-900 p-6 sm:p-8',
    'informational': 'bg-blue-50 border border-blue-200 text-slate-900 p-6 sm:p-8',
    'sunlight': 'bg-white border-2 border-slate-900 text-slate-950 shadow-elevation-2 p-6 sm:p-8',
  };

  const interactiveStyles = interactive ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
