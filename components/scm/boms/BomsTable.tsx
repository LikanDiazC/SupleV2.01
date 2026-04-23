'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Trash2, Eye } from 'lucide-react';
import { type Bom } from '@/types';
import ActionMenu from '@/components/ui/ActionMenu';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: `${50 + i * 12}%` }} />
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

interface BomsTableProps {
  boms: Bom[];
  loading: boolean;
  onDelete: (id: string) => void;
  onNewBom: () => void;
}

export default function BomsTable({ boms, loading, onDelete, onNewBom }: BomsTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? boms.filter((b) => b.name.toLowerCase().includes(q)) : boms;
  }, [boms, search]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      {boms.length > 0 && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar receta..."
          />
          <span className="text-xs text-slate-400">
            {filtered.length} de {boms.length} receta{boms.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <TH>Nombre de la receta</TH>
              <TH>Producto final</TH>
              <TH>Componentes</TH>
              <TH>Fecha de creación</TH>
              <TH>Acciones</TH>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-2">
                  <EmptyState
                    icon={BookOpen}
                    title={search ? 'Sin resultados' : 'Sin recetas aún'}
                    description={
                      search
                        ? `No hay recetas que coincidan con "${search}".`
                        : 'Crea tu primera receta (BOM) para definir los materiales de producción.'
                    }
                    action={
                      !search ? (
                        <button
                          onClick={onNewBom}
                          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                        >
                          + Nueva Receta
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              filtered.map((bom) => (
                <tr key={bom.id} className="group transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{bom.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-500">
                      {bom.productId ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                      {bom.components?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(bom.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3">
                    <ActionMenu
                      items={[
                        {
                          label: 'Eliminar',
                          icon: Trash2,
                          danger: true,
                          onClick: () => onDelete(bom.id),
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
