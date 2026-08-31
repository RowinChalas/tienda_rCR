import React, { useState, useEffect } from 'react';
import { Badge } from '../atoms/Badge';
import { Clock, AlertTriangle } from 'lucide-react';

export interface SoftLockCountdownProps {
  expiresAt: string | null | undefined;
  onExpire?: () => void;
  className?: string;
}

export const SoftLockCountdown: React.FC<SoftLockCountdownProps> = ({
  expiresAt,
  onExpire,
  className,
}) => {
  const calculateRemaining = () => {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateRemaining);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!expiresAt || secondsLeft === 0) {
    return null;
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft < 300; // Menos de 5 min

  return (
    <Badge
      variant={isUrgent ? 'danger' : 'softlock'}
      pulse={isUrgent}
      icon={isUrgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      className={className}
    >
      Soft Lock: {timeFormatted} min
    </Badge>
  );
};
