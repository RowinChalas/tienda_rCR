import React from 'react';
import { Button } from '../atoms/Button';
import { PackageOpen } from 'lucide-react';
import { clsx } from 'clsx';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <div
      className={clsx(
        'glass-panel rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 border-dashed border-white/15',
        className,
      )}
    >
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-brand-400 mb-4 shadow-inner">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h4 className="text-base font-bold text-white mb-1.5">{title}</h4>
      <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-surface-800/80 rounded-xl border border-white/5',
        className,
      )}
    />
  );
};
