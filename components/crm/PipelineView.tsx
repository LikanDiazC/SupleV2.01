'use client';

import { useState } from 'react';
import { Plus, BarChart3, DollarSign, TrendingUp, Bot, RefreshCw } from 'lucide-react';
import { type KanbanColumn } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useDeals } from '@/hooks/useDeals';
import { usePipelineMetrics } from '@/hooks/usePipelineMetrics';
import MetricCard from '@/components/ui/MetricCard';
import KanbanColumnComponent from './KanbanColumn';
import CreateDealModal from './CreateDealModal';

const COLUMNS: KanbanColumn[] = [
  { stage: 'NUEVO',            label: 'Nuevo',            color: 'border-slate-200',  dotColor: 'bg-slate-400'   },
  { stage: 'REUNION_AGENDADA', label: 'Reunión Agendada', color: 'border-blue-200',   dotColor: 'bg-blue-400'    },
  { stage: 'PROPUESTA_ENVIADA',label: 'Propuesta Enviada',color: 'border-amber-200',  dotColor: 'bg-amber-400'   },
  { stage: 'GANADO',           label: 'Ganado',           color: 'border-emerald-200',dotColor: 'bg-emerald-500' },
  { stage: 'PERDIDO',          label: 'Perdido',          color: 'border-red-200',    dotColor: 'bg-red-400'     },
];

export default function PipelineView() {
  const { deals, loading, refreshing, refresh } = useDeals();
  const metrics = usePipelineMetrics(deals);
  const [modalOpen, setModalOpen] = useState(false);

  const dealsByStage = COLUMNS.reduce<Record<string, typeof deals>>(
    (acc, col) => ({ ...acc, [col.stage]: deals.filter((d) => d.stage === col.stage) }),
    {}
  );

  return (
    <>
      {/* ── Top bar ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Pipeline de Negocios</h2>
          <p className="text-xs text-slate-400">
            {deals.length === 0
              ? 'Sin negocios aún'
              : `${deals.length} negocio${deals.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            aria-label="Refrescar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nuevo Negocio
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <MetricCard label="Negocios Activos"  value={loading ? '—' : metrics.activeDeals}              icon={BarChart3}   iconColor="text-brand-500"   iconBg="bg-brand-50"   loading={loading} />
        <MetricCard label="Valor del Pipeline" value={loading ? '—' : formatCurrency(metrics.pipelineValue)} icon={DollarSign}  iconColor="text-emerald-600" iconBg="bg-emerald-50" loading={loading} />
        <MetricCard label="Tasa de Cierre"    value={loading ? '—' : `${metrics.closeRate}%`}           icon={TrendingUp}  iconColor="text-amber-600"   iconBg="bg-amber-50"   loading={loading} />
        <MetricCard label="Correos IA"        value={loading ? '—' : metrics.aiEmails}                  icon={Bot}         iconColor="text-indigo-600"  iconBg="bg-indigo-50"  loading={loading} />
      </div>

      {/* ── Kanban ── */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumnComponent
            key={col.stage}
            column={col}
            deals={dealsByStage[col.stage] ?? []}
          />
        ))}
      </div>

      <CreateDealModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refresh}
      />
    </>
  );
}
