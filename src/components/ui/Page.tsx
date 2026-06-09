import React from 'react';

interface PageProps {
  children: React.ReactNode;
  /** Removes vertical padding when page handles its own spacing. */
  flush?: boolean;
  className?: string;
}

/**
 * Standard page wrapper. Provides:
 *  - Full-width sticky nav-friendly layout
 *  - Centered max-width container
 *  - Responsive horizontal + vertical padding
 */
export const Page: React.FC<PageProps> = ({ children, flush = false, className = '' }) => (
  <div className={`min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] bg-canvas ${className}`}>
    <div className={`container-app ${flush ? '' : 'py-5 md:py-8'}`}>{children}</div>
  </div>
);

export default Page;
