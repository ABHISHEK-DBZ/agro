import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Inbox } from 'lucide-react';

type AlertTone = 'info' | 'success' | 'warn' | 'danger';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
}

const toneClass: Record<AlertTone, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warn: 'alert-warn',
  danger: 'alert-danger',
};

const toneIcon: Record<AlertTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warn: AlertTriangle,
  danger: AlertCircle,
};

export const Alert: React.FC<AlertProps> = ({
  tone = 'info', title, children, onClose, className = '', ...rest
}) => {
  const Icon = toneIcon[tone];
  return (
    <div className={`alert ${toneClass[tone]} ${className}`} role="alert" {...rest}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium leading-snug">{title}</div>}
        {children && <div className={title ? 'mt-0.5 text-sm opacity-90' : 'text-sm'}>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 text-sm leading-none -mt-0.5"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon, title, description, action, className = '',
}) => (
  <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
    <div className="w-12 h-12 rounded-full bg-sunken text-ink-400 flex items-center justify-center mb-3">
      {icon || <Inbox className="w-6 h-6" />}
    </div>
    <h3 className="text-base font-semibold text-strong">{title}</h3>
    {description && <p className="text-sm text-muted mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number | string;
  width?: number | string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = 16, width = '100%', rounded = 'md', className = '', style, ...rest
}) => {
  const radiusMap = { sm: 4, md: 6, lg: 8, full: 999 };
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, borderRadius: radiusMap[rounded], ...style }}
      aria-hidden
      {...rest}
    />
  );
};

export default Alert;
