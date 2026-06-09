import React from 'react';

interface Tab<T extends string> {
  /** Unique id used by `value`/`active` to determine which tab is selected. */
  value?: T;
  /** Alias of `value` — accepted for ergonomics. */
  id?: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string> {
  /** Use either `tabs` (with items that have value/id) or pass children. */
  tabs?: Tab<T>[];
  /** Currently active tab id. */
  value?: T;
  /** Alias of `value` for backward compatibility. */
  active?: T;
  onChange: (value: T) => void;
  className?: string;
  /** "underline" (default) | "pill" */
  variant?: 'underline' | 'pill';
  scrollable?: boolean;
}

function getTabId<T extends string>(t: Tab<T>, fallback: string, index: number): T {
  return (t.value ?? t.id ?? (fallback as T) ?? String(index)) as T;
}

export function Tabs<T extends string>({
  tabs, value, active, onChange, className = '', variant = 'underline', scrollable = false,
}: TabsProps<T>) {
  const baseBtn = 'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap focus-ring';
  const current = value ?? active;

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-1 p-1 bg-sunken rounded-md ${className}`} role="tablist">
        {(tabs ?? []).map((t, i) => {
          const tabId = getTabId(t, current ?? '', i);
          const isActive = tabId === current;
          return (
            <button
              key={String(tabId)}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tabId)}
              className={`${baseBtn} rounded ${
                isActive
                  ? 'bg-surface text-strong shadow-sm'
                  : 'text-muted hover:text-strong'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge != null && <span className="text-xs">{t.badge}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex border-b border-subtle ${scrollable ? 'overflow-x-auto scrollbar-hide' : ''} ${className}`}
      role="tablist"
    >
      {(tabs ?? []).map((t, i) => {
        const tabId = getTabId(t, current ?? '', i);
        const isActive = tabId === current;
        return (
          <button
            key={String(tabId)}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tabId)}
            className={`${baseBtn} -mb-px border-b-2 ${
              isActive
                ? 'border-leaf-600 text-strong'
                : 'border-transparent text-muted hover:text-strong'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge != null && <span className="text-xs opacity-80">{t.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
