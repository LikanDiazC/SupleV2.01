'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRemnants } from '@/hooks/useRemnants';
import RemnantsTable from './RemnantsTable';

export default function RemnantsView() {
  const { remnants, loading, refresh } = useRemnants();
  const [refreshing, setRefreshing]    = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Retazos de Plancha</h2>
          <p className="text-xs text-slate-400">
            {loading
              ? 'Cargando...'
              : `${remnants.length} retazo${remnants.length !== 1 ? 's' : ''} disponible${remnants.length !== 1 ? 's' : ''}`}
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

      <RemnantsTable remnants={remnants} loading={loading} />
    </>
  );
}
