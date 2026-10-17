import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

export const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Delivery Address' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Review Order' },
    { number: 4, label: 'Order Placed' },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-100 py-3 sm:py-4 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background connecting line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
          {/* Active green connecting line */}
          <div
            className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-emerald-600 z-0 transition-all duration-300"
            style={{
              width:
                currentStep === 1
                  ? '0%'
                  : currentStep === 2
                  ? '33.33%'
                  : currentStep === 3
                  ? '66.66%'
                  : '100%',
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;

            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                      : isActive
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[11px] sm:text-xs font-semibold mt-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-900 font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
