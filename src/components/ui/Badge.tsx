import React from 'react';

type BadgeTone = 'default' | 'leaf' | 'soil' | 'harvest' | 'sky' | 'danger' | 'success';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const toneClass: Record<BadgeTone, string> = {
  default: 'badge-default',
  leaf: 'badge-leaf',
  soil: 'badge-soil',
  harvest: 'badge-harvest',
  sky: 'badge-sky',
  danger: 'badge-danger',
  success: 'badge-success',
};

const dotColor: Record<BadgeTone, string> = {
  default: 'bg-ink-300',
  leaf: 'bg-leaf-600',
  soil: 'bg-soil-600',
  harvest: 'bg-harvest-500',
  sky: 'bg-sky-500',
  danger: 'bg-danger-500',
  success: 'bg-success-500',
};

export const Badge: React.FC<BadgeProps> = ({ tone = 'default', dot = false, className = '', children, ...rest }) => (
  <span className={`badge ${toneClass[tone]} ${className}`} {...rest}>
    {dot && <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor[tone]} animate-pulse-dot`} />}
    {children}
  </span>
);

interface StatusDotProps {
  tone?: 'success' | 'warn' | 'danger' | 'neutral';
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ tone = 'neutral', className = '' }) => {
  const toneClass = {
    success: 'status-dot-success',
    warn: 'status-dot-warn',
    danger: 'status-dot-danger',
    neutral: 'status-dot',
  }[tone];
  return <span className={`${toneClass} ${className}`} aria-hidden />;
};

export default Badge;
