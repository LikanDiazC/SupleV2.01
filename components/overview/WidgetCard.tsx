import Link from 'next/link';
import { type LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  href: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function WidgetCard({
  title,
  icon: Icon,
  iconColor = 'text-brand-500',
  iconBg = 'bg-brand-50',
  href,
  loading = false,
  children,
  className,
}: WidgetCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-brand-500"
        >
          Ver todo
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? <WidgetSkeleton /> : children}
      </div>
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
