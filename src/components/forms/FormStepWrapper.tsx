import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';

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
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLast) {
      onSubmit?.();
    } else if (canNext) {
      onNext();
    }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-body">
      {/* Header & Step Tracker Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
          <div>
            {badgeText && (
              <Badge variant="coral" size="sm">
                {badgeText}
              </Badge>
            )}
            <h2 className="font-display text-2xl font-semibold text-slate-900 tracking-tight mt-2">
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].subtitle && (
              <p className="text-xs text-slate-600 mt-1">
                {steps[currentStep].subtitle}
              </p>
            )}
          </div>
          <div className="text-xs font-semibold text-slate-500 font-mono">
            Step <span className="text-slate-900 font-bold">{currentStep + 1}</span> of {steps.length}
          </div>
        </div>

        {/* Progress Bar & Step Pills */}
        <div className="space-y-3">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="hidden sm:flex justify-between text-xs font-medium text-slate-500 pt-1">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 ${
                  idx === currentStep
                    ? 'text-orange-700 font-semibold'
                    : idx < currentStep
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className={`w-4 h-4 rounded-full border text-[10px] flex items-center justify-center font-mono ${
                    idx === currentStep ? 'border-orange-600 text-orange-600 font-bold' : 'border-slate-300 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                )}
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Step Body Card */}
      <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card">
        {children}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onPrev}
            disabled={isFirst}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {!isLast ? (
            <Button
              type="submit"
              variant="brand"
              size="md"
              disabled={!canNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="brand"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Submit Official Report
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
