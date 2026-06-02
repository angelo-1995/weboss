'use client';

import { Check } from 'lucide-react';
import { cn } from '@community-os/ui';

interface Step {
  key: string;
  label: string;
  shortLabel: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  const percentage = Math.round((currentStep / (steps.length - 1)) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Paso {currentStep + 1} de {steps.length}</span>
        <span>{percentage}% completado</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep;

          return (
            <button
              key={step.key}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-150',
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
              )}
            >
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium hidden sm:block',
                  isCurrent ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
