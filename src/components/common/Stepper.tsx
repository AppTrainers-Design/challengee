import React from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { CompetitionStatus } from '../../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface StepperProps {
  currentStatus: CompetitionStatus;
  interactive?: boolean;
  onSelectPhase?: (phase: CompetitionStatus) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStatus, interactive = false, onSelectPhase }) => {
  const { t, lang } = useCompetition();

  const steps: { key: CompetitionStatus; label: string; number: number }[] = [
    { key: 'registration_open', label: t.stepper.registration, number: 1 },
    { key: 'training', label: t.stepper.training, number: 2 },
    { key: 'development', label: t.stepper.development, number: 3 },
    { key: 'submission_closed', label: t.stepper.submission, number: 4 },
    { key: 'evaluation', label: t.stepper.evaluation, number: 5 },
    { key: 'completed', label: t.stepper.results, number: 6 },
  ];

  // Map status to progress index
  const getStepIndex = (status: CompetitionStatus): number => {
    switch (status) {
      case 'draft':
      case 'upcoming':
        return 0;
      case 'registration_open':
      case 'registration_closed':
        return 1;
      case 'training':
        return 2;
      case 'development':
        return 3;
      case 'submission_closed':
        return 4;
      case 'evaluation':
      case 'results_pending':
        return 5;
      case 'completed':
        return 6;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {lang === 'ar' ? 'رحلة المسابقة الرسمية' : 'Official Competition Journey'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar'
              ? 'تتبع المراحل من التسجيل إلى التقييم وإعلان الفائزين'
              : 'End-to-end lifecycle from school registration to final winner ranking'}
          </p>
        </div>
        {interactive && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
            {lang === 'ar' ? 'انقر لتبديل المرحلة (Admin)' : 'Admin Override Available'}
          </span>
        )}
      </div>

      <div className="relative">
        {/* Step rail */}
        <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
          {steps.map((step) => {
            const isDone = step.number < currentIndex;
            const isCurrent = step.number === currentIndex;

            return (
              <div
                key={step.key}
                onClick={() => interactive && onSelectPhase && onSelectPhase(step.key)}
                className={`flex flex-col items-center text-center p-2 rounded-lg transition-all ${
                  interactive ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all mb-2 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                <span
                  className={`text-xs font-semibold leading-tight line-clamp-2 ${
                    isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>

                {isCurrent && (
                  <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {lang === 'ar' ? 'المرحلة النشطة' : 'Active Phase'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
