import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'brand' | 'gold' | 'purple';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--admin-card)',
      borderColor: 'var(--admin-border)',
    },
    brand: {
      backgroundColor: 'var(--admin-card-alt)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    gold: {
      backgroundColor: 'var(--admin-card-alt)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    purple: {
      backgroundColor: 'var(--admin-card-alt)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
    },
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={clsx(
        'rounded-2xl p-5 shadow-card transition-all relative overflow-hidden border',
        className,
      )}
      style={{
        ...variantStyles[variant],
        boxShadow: 'var(--admin-shadow)',
        backdropFilter: 'var(--admin-backdrop)',
        WebkitBackdropFilter: 'var(--admin-backdrop)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-editorial tracking-tight" style={{ color: 'var(--admin-text-primary)' }}>
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--admin-badge-bg)', borderColor: 'var(--admin-border)' }}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: 'var(--admin-border-strong)' }}>
          {subtitle && <span style={{ color: 'var(--admin-text-secondary)' }}>{subtitle}</span>}
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 font-semibold',
                trend.isPositive ? 'text-emerald-500' : 'text-rose-500',
              )}
            >
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
