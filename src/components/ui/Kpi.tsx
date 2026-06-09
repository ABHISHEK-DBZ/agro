import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Optional helper/sub-line under the value */
  hint?: React.ReactNode;
  /** Optional trend line: { direction: 'up' | 'down' | 'flat', value: '8%' } */
  trend?: { direction: 'up' | 'down' | 'flat'; value: React.ReactNode };
  /** Optional icon (e.g. Lucide) rendered in the top-right */
  icon?: React.ReactNode;
  className?: string;
}

export const Kpi: React.FC<KpiProps> = ({ label, value, hint, trend, icon, className = '' }) => {
  const trendCls = trend?.direction === 'up'
    ? 'kpi-trend-up'
    : trend?.direction === 'down'
    ? 'kpi-trend-down'
    : '';

  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : trend?.direction === 'down' ? ArrowDownRight : Minus;

  return (
    <div className={`kpi ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="kpi-label">{label}</span>
        {icon && <span className="text-ink-400">{icon}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {(hint || trend) && (
        <div className="flex items-center justify-between gap-2 mt-0.5">
          {hint && <span className="kpi-trend">{hint}</span>}
          {trend && (
            <span className={`kpi-trend ${trendCls}`}>
              <TrendIcon className="w-3 h-3" />
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Kpi;
