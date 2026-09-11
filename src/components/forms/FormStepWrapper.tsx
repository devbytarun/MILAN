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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Step Tracker Card */}
      <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline-light pb-5">
          <div>
            {badgeText && (
              <Badge variant="mint" size="sm">
                {badgeText}
              </Badge>
            )}
            <h2 className="type-heading-xl text-ink mt-2">
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].subtitle && (
              <p className="type-caption text-shade-50 mt-1">
                {steps[currentStep].subtitle}
              </p>
            )}
          </div>
          <div className="type-caption font-semibold text-shade-60">
            Step <span className="text-ink font-bold">{currentStep + 1}</span> of {steps.length}
          </div>
        </div>

        {/* Progress Bar & Step Pills */}
        <div className="space-y-3">
          <div className="w-full bg-shade-30/40 h-2 rounded-pill overflow-hidden">
            <div
              className="h-full bg-ink transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="hidden sm:flex justify-between text-xs font-medium text-shade-50 pt-1">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 ${
                  idx === currentStep
                    ? 'text-ink font-semibold'
                    : idx < currentStep
                    ? 'text-shade-70'
                    : 'text-shade-40'
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-ink" />
                ) : (
                  <span className={`w-4 h-4 rounded-pill border text-[10px] flex items-center justify-center ${
                    idx === currentStep ? 'border-ink text-ink font-bold' : 'border-shade-40 text-shade-40'
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
      <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3">
        {children}

        {/* Navigation Buttons using canonical Pill Buttons */}
        <div className="mt-8 pt-6 border-t border-hairline-light flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline-light"
            size="md"
            onClick={onPrev}
            disabled={isFirst}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {!isLast ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onNext}
              disabled={!canNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="aloe"
              size="md"
              onClick={onSubmit}
              isLoading={isSubmitting}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Submit Official Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
