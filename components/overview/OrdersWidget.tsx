import { ClipboardList, Hammer } from 'lucide-react';
import { type ProductionOrder } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import WidgetCard from './WidgetCard';
import EmptyState from '@/components/ui/EmptyState';

function OrderRow({ order }: { order: ProductionOrder }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
        <Hammer className="h-4 w-4 text-amber-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-800">
          {order.productName ?? `Orden #${order.id.slice(-6)}`}
        </p>
        {order.quantity !== undefined && (
          <p className="text-[10px] text-slate-400">{order.quantity} unidades</p>
        )}
      </div>
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
        En producción
      </span>
    </div>
  );
}

function CounterDisplay({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <span className="text-5xl font-bold text-slate-900">{count}</span>
      <span className="mt-1 text-sm text-slate-400">órdenes activas</span>
      <div className="mt-3 flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        <span className="text-[11px] font-medium text-amber-600">En producción ahora</span>
      </div>
    </div>
  );
}

export default function OrdersWidget({
  orders,
  loading,
}: {
  orders: ProductionOrder[];
  loading: boolean;
}) {
  return (
    <WidgetCard
      title="Órdenes Activas"
      icon={ClipboardList}
      iconColor="text-amber-600"
      iconBg="bg-amber-50"
      href="/scm/orders"
      loading={loading}
    >
      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin órdenes activas"
          description="Las órdenes en producción aparecerán aquí."
        />
      ) : orders.length <= 2 ? (
        <div className="-mx-2.5 space-y-0.5">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      ) : (
        <CounterDisplay count={orders.length} />
      )}
    </WidgetCard>
  );
}
