import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Removes default padding when set. Use when child handles its own padding. */
  flush?: boolean;
  /** Adds hover lift + cursor pointer */
  interactive?: boolean;
  /** Slightly muted background */
  sunken?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  flush = false,
  interactive = false,
  sunken = false,
  padded = true,
  className = '',
  children,
  ...rest
}) => {
  const cls = [
    sunken ? 'surface-sunken' : 'card',
    interactive ? 'card-interactive' : '',
    !flush && padded ? 'card-padded' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-strong leading-snug">{title}</h3>
      {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

interface SectionTitleProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, description, action, className = '' }) => (
  <div className={`flex items-end justify-between gap-4 mb-4 ${className}`}>
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-strong">{title}</h2>
      {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
    </div>
    {action}
  </div>
);

export default Card;
