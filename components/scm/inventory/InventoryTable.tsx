'use client';

import { useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import { type Material } from '@/types';
import { formatCurrency } from '@/lib/utils';
import ActionMenu from '@/components/ui/ActionMenu';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  SHEET: 'Plancha',
  HARDWARE: 'Herraje',
  CONSUMABLE: 'Consumible',
};

function TypeBadge({ type }: { type: Material['materialType'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        type === 'SHEET'
          ? 'bg-brand-50 text-brand-600'
          : type === 'HARDWARE'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-100 text-slate-600'
      )}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

interface InventoryTableProps {
  items: Material[];
  loading: boolean;
  onNewItem: () => void;
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
    {children}
  </th>
);

export default function InventoryTable({ items, loading, onNewItem }: InventoryTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.sku.toLowerCase().includes(q)
        )
      : items;
  }, [items, search]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      {items.length > 0 && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre o SKU..."
          />
          <span className="text-xs text-slate-400">
            {filtered.length} de {items.length} material{items.length !== 1 ? 'es' : ''}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <TH>Nombre</TH>
              <TH>SKU</TH>
              <TH>Tipo</TH>
              <TH>Stock</TH>
              <TH>Costo unitario</TH>
              <TH>Unidad</TH>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-2">
                  <EmptyState
                    icon={Package}
                    title={search ? 'Sin resultados' : 'Inventario vacío'}
                    description={
                      search
                        ? `No hay materiales que coincidan con "${search}".`
                        : 'Agrega tu primer material al inventario.'
                    }
                    action={
                      !search ? (
                        <button
                          onClick={onNewItem}
                          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                        >
                          + Nuevo Material
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="group transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    {item.sheetWidthMm && item.sheetHeightMm && (
                      <p className="text-[11px] text-slate-400">
                        {item.sheetWidthMm} × {item.sheetHeightMm} mm
                        {item.thicknessMm ? ` · ${item.thicknessMm} mm` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-500">{item.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={item.materialType} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        item.stock <= 0 ? 'text-red-600' : 'text-slate-900'
                      )}
                    >
                      {item.stock.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatCurrency(item.unitCost)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {item.unitOfMeasure}
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
