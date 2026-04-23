import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  loading?: boolean;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-brand-500',
  iconBg = 'bg-brand-50',
  trend,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="h-7 w-24 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-slate-100 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-emerald-600' : 'text-red-500')}>
          {trend.value >= 0 ? '+' : ''}
          {trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
