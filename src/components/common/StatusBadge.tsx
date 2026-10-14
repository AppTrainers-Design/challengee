import React from 'react';
import { useCompetition } from '../../context/CompetitionContext';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const { t } = useCompetition();

  const getStyle = (s: string) => {
    switch (s) {
      case 'approved':
      case 'completed':
      case 'published':
      case 'submitted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10';
      case 'pending':
      case 'internal_review':
      case 'evaluation':
      case 'results_pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10';
      case 'registration_open':
      case 'training':
      case 'development':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10';
      case 'changes_requested':
      case 'resubmitted':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/10';
      case 'rejected':
      case 'withdrawn':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10';
      case 'locked':
      case 'submission_closed':
      case 'registration_closed':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/10';
      case 'draft':
      case 'not_started':
      case 'hidden':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10';
    }
  };

  const label = (t.status as Record<string, string>)[status] || status.replace('_', ' ').toUpperCase();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ring-1 ring-inset ${getStyle(
        status
      )} ${sizeClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};
