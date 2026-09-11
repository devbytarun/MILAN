import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left font-body">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[#41454d]"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#9297a0] pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm font-normal text-[#181d26] bg-white border rounded-md transition-colors duration-150 outline-none placeholder:text-[#9297a0] disabled:bg-[#f8fafc] disabled:text-[#9297a0] disabled:cursor-not-allowed ${
            leftIcon ? '!pl-10' : ''
          } ${
            rightIcon ? '!pr-10' : ''
          } ${
            error
              ? 'border-rose-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
              : 'border-[#dddddd] hover:border-[#9297a0] focus:border-[#458fff] focus:ring-2 focus:ring-[#458fff]/20'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-[#9297a0] flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#9297a0]">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
