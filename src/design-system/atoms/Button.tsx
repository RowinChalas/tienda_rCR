import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-950 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'text-xs px-2.5 py-1.5 gap-1.5',
    sm: 'text-sm px-3.5 py-2 gap-2',
    md: 'text-sm px-4 py-2.5 gap-2.5',
    lg: 'text-base px-6 py-3.5 gap-3 font-semibold',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-900/30 focus:ring-brand-500 border border-brand-400/20 active:scale-[0.98]',
    secondary:
      'bg-surface-800 hover:bg-surface-700 text-slate-200 border border-white/10 focus:ring-slate-400 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-white/5 text-slate-200 border border-white/20 hover:border-white/30 focus:ring-brand-500 active:scale-[0.98]',
    danger:
      'bg-red-600/90 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 focus:ring-red-500 border border-red-400/20 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white focus:ring-slate-400',
    gold:
      'bg-gradient-to-r from-amber-500 to-accent-gold hover:from-amber-400 hover:to-yellow-300 text-surface-950 font-bold shadow-lg shadow-amber-950/30 focus:ring-amber-400 active:scale-[0.98]',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
