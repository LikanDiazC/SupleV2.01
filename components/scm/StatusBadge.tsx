import { type OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusConfig {
  label: string;
  className: string;
  dot: string;
}

const STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  ORDER_RECEIVED: {
    label: 'Orden Recibida',
    className: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-500',
  },
  CHECKING_STOCK: {
    label: 'Verificando Stock',
    className: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  IN_PRODUCTION: {
    label: 'En Producción',
    className: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  MANUFACTURED: {
    label: 'Fabricada',
    className: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  SHIPPED: {
    label: 'Enviada',
    className: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  showDot?: boolean;
}

export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        config.className
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      )}
      {config.label}
    </span>
  );
}
