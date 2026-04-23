'use client';

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useBoms } from '@/hooks/useBoms';
import { deleteBom } from '@/services/api/boms';
import BomsTable from './BomsTable';
import CreateBomSlideOver from './CreateBomSlideOver';

export default function BomsView() {
  const { boms, loading, refresh } = useBoms();
  const [slideOpen, setSlideOpen]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta receta?')) return;
    try {
      await deleteBom(id);
      await refresh();
    } catch {
      alert('No se pudo eliminar la receta.');
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Recetas de Producción</h2>
          <p className="text-xs text-slate-400">
            {loading ? 'Cargando...' : `${boms.length} receta${boms.length !== 1 ? 's' : ''} registradas`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refrescar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setSlideOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nueva Receta
          </button>
        </div>
      </div>

      <BomsTable
        boms={boms}
        loading={loading}
        onDelete={handleDelete}
        onNewBom={() => setSlideOpen(true)}
      />

      <CreateBomSlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        onCreated={refresh}
      />
    </>
  );
}
