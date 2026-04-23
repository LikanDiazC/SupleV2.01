'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { type OrderStatus } from '@/types';
import StatusBadge from '@/components/scm/StatusBadge';
import OrdersTable from './OrdersTable';

const ALL_STATUSES: OrderStatus[] = [
  'ORDER_RECEIVED',
  'CHECKING_STOCK',
  'IN_PRODUCTION',
  'MANUFACTURED',
  'SHIPPED',
  'CANCELLED',
];

export default function OrdersView() {
  const { orders, loading, refresh }      = useOrders();
  const [activeStatus, setActiveStatus]   = useState<OrderStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing]       = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const filtered =
    activeStatus === 'ALL'
      ? orders
      : orders.filter((o) => o.status === activeStatus);

  const countByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;

  return (
    <>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Órdenes de Producción</h2>
          <p className="text-xs text-slate-400">
            {loading
              ? 'Cargando...'
              : `${orders.length} orden${orders.length !== 1 ? 'es' : ''} en total`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refrescar"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveStatus('ALL')}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            activeStatus === 'ALL'
              ? 'border-brand-300 bg-brand-50 text-brand-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          Todas
          <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
            {orders.length}
          </span>
        </button>

        {ALL_STATUSES.map((status) => {
          const count = countByStatus(status);
          if (!loading && count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                activeStatus === status
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <StatusBadge status={status} showDot={false} />
              {!loading && (
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <OrdersTable orders={filtered} loading={loading} />
    </>
  );
}
