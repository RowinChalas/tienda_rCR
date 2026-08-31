import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant =
  | 'draft'
  | 'review'
  | 'published'
  | 'soldout'
  | 'softlock'
  | 'dispatch'
  | 'gold'
  | 'default'
  | 'success'
  | 'warning'
  | 'danger';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  pulse = false,
  className,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    draft: 'bg-slate-800 text-slate-300 border-slate-700',
    review: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    soldout: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    softlock: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-950',
    dispatch: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    gold: 'bg-amber-400/20 text-amber-200 border-amber-400/40',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    default: 'bg-surface-800 text-slate-300 border-white/10',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border select-none transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
