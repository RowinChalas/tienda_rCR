import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className,
  maxWidth = 'max-w-xs',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={clsx('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={clsx(
            'absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface-800 text-slate-100 text-xs rounded-lg shadow-xl border border-white/10 pointer-events-none whitespace-normal break-words text-center transition-opacity duration-150',
            maxWidth,
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-800" />
        </div>
      )}
    </div>
  );
};
