'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, ExternalLink } from 'lucide-react';
import { type ProductionOrder } from '@/types';
import StatusBadge from '@/components/scm/StatusBadge';
import ActionMenu from '@/components/ui/ActionMenu';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: `${45 + i * 11}%` }} />
        </td>
      ))}
    </tr>
  );
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
    {children}
  </th>
);

interface OrdersTableProps {
  orders: ProductionOrder[];
  loading: boolean;
  onViewFlow?: (id: string) => void;
}

export default function OrdersTable({ orders, loading, onViewFlow }: OrdersTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? orders.filter(
          (o) =>
            (o.reference ?? '').toLowerCase().includes(q) ||
            (o.clientName ?? '').toLowerCase().includes(q) ||
            (o.productName ?? '').toLowerCase().includes(q)
        )
      : orders;
  }, [orders, search]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      {orders.length > 0 && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por referencia o cliente..."
          />
          <span className="text-xs text-slate-400">
            {filtered.length} de {orders.length} orden{orders.length !== 1 ? 'es' : ''}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <TH>Referencia</TH>
              <TH>Producto</TH>
              <TH>Cliente</TH>
              <TH>Estado</TH>
              <TH>Fecha</TH>
              <TH>Acciones</TH>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-2">
                  <EmptyState
                    icon={ClipboardList}
                    title={search ? 'Sin resultados' : 'Sin órdenes de producción'}
                    description={
                      search
                        ? `No hay órdenes que coincidan con "${search}".`
                        : 'Las órdenes se crean automáticamente al ganar un negocio en el CRM.'
                    }
                  />
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr 
                  key={order.id} 
                  className="group transition hover:bg-slate-50 cursor-pointer"
                  onClick={(e) => {
                    // Prevent row click if clicking the action menu
                    if ((e.target as HTMLElement).closest('.action-menu-container')) return;
                    onViewFlow?.(order.id);
                  }}
                >
                  {/* Referencia */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold text-slate-900">
                          {order.reference ?? order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Producto */}
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-slate-700">
                      {order.productName ?? '—'}
                    </p>
                    {order.quantity != null && (
                      <p className="text-[11px] text-slate-400">{order.quantity} unidades</p>
                    )}
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-slate-700">{order.clientName ?? '—'}</p>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3.5 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3.5 action-menu-container">
                    <ActionMenu
                      items={[
                        {
                          label: 'Ver detalle',
                          icon: ExternalLink,
                          onClick: () => {},
                        },
                        {
                          label: 'Ver flujo de orden',
                          icon: ClipboardList,
                          onClick: () => onViewFlow?.(order.id),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
