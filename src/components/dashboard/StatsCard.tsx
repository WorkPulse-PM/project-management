import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-elevation-level1 p-6 transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-fg-secondary">{title}</p>
          <h3 className="text-3xl font-bold text-fg-primary">{value}</h3>
          {description && (
            <p className="text-xs text-fg-tertiary mt-1">{description}</p>
          )}
        </div>
        <div className="rounded-lg bg-fill2 p-3">
          <Icon className="size-6 text-fg-secondary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-success-text' : 'text-error-text'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-fg-tertiary">from last month</span>
        </div>
      )}
    </div>
  );
}
