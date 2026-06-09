import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Action area on the right (e.g. buttons, filters) */
  actions?: React.ReactNode;
  /** Optional breadcrumb-like eyebrow */
  eyebrow?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title, description, actions, eyebrow, className = '',
}) => (
  <header className={`page-header ${className}`}>
    <div className="min-w-0">
      {eyebrow && (
        <div className="text-xs font-medium text-leaf uppercase tracking-wider mb-1.5">
          {eyebrow}
        </div>
      )}
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-subtitle">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </header>
);

export default PageHeader;
