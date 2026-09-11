import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'featured-aloe' | 'pistachio' | 'cinematic' | 'flat';

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
  const baseStyles = 'rounded-lg transition-all duration-200';

  const variantStyles: Record<CardVariant, string> = {
    'default': 'bg-canvas-light text-ink border border-hairline-light shadow-elevation-3 p-6 sm:p-8',
    'elevated': 'bg-canvas-light text-ink border border-hairline-light shadow-elevation-3 p-6 sm:p-8',
    'featured-aloe': 'bg-aloe text-ink border border-aloe/20 shadow-elevation-3 p-6 sm:p-8',
    'pistachio': 'bg-pistachio text-ink border border-pistachio/20 p-6 sm:p-8',
    'cinematic': 'bg-canvas-night-elevated text-on-dark border border-hairline-dark shadow-elevation-1 p-6 sm:p-8',
    'flat': 'bg-canvas-light text-ink border border-hairline-light p-6 sm:p-8',
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
