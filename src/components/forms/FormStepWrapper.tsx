import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface FormStep {
  id: string;
  title: string;
  subtitle?: string;
}

interface FormStepWrapperProps {
  steps: FormStep[];
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canNext?: boolean;
  children: React.ReactNode;
  badgeText?: string;
  badgeColor?: 'emerald' | 'blue' | 'purple';
}

export const FormStepWrapper: React.FC<FormStepWrapperProps> = ({
  steps,
  currentStep,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting = false,
  canNext = true,
  children,
  badgeText,
  badgeColor = 'blue',
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLast) {
      onSubmit?.();
    } else {
      onNext();
    }
  };

  const badgeStyles = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Step Tracker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            {badgeText && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${badgeStyles[badgeColor]}`}>
                {badgeText}
              </span>
            )}
            <h2 className="text-xl font-bold text-slate-900 mt-1.5">
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {steps[currentStep].subtitle}
              </p>
            )}
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Step <span className="text-slate-900 font-bold">{currentStep + 1}</span> of {steps.length}
          </div>
        </div>

        {/* Progress Bar & Dots */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                badgeColor === 'emerald'
                  ? 'bg-emerald-500'
                  : badgeColor === 'purple'
                  ? 'bg-purple-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          <div className="hidden sm:flex justify-between text-[11px] font-medium text-slate-400 pt-1">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center gap-1 ${
                  idx === currentStep
                    ? 'text-slate-900 font-bold'
                    : idx < currentStep
                    ? 'text-emerald-600 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                )}
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Step Body */}
      <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {children}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isFirst
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {!isLast ? (
            <button
              type="submit"
              disabled={!canNext}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-white transition shadow-sm ${
                canNext
                  ? badgeColor === 'emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                    : badgeColor === 'purple'
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                  : 'opacity-50 cursor-not-allowed bg-slate-400'
              }`}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white transition shadow-md ${
                badgeColor === 'emerald'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : badgeColor === 'purple'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
              } disabled:opacity-50`}
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Registering Report...' : 'Submit Official Report'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
