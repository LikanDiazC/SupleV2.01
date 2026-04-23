import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { type Deal, type DealStage } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import WidgetCard from './WidgetCard';
import EmptyState from '@/components/ui/EmptyState';

const STAGE_LABELS: Record<DealStage, { label: string; dot: string }> = {
  NUEVO:             { label: 'Nuevo',     dot: 'bg-slate-400'   },
  REUNION_AGENDADA:  { label: 'Reunión',   dot: 'bg-blue-400'    },
  PROPUESTA_ENVIADA: { label: 'Propuesta', dot: 'bg-amber-400'   },
  GANADO:            { label: 'Ganado',    dot: 'bg-emerald-500' },
  PERDIDO:           { label: 'Perdido',   dot: 'bg-red-400'     },
};

function DealRow({ deal }: { deal: Deal }) {
  const stage = STAGE_LABELS[deal.stage];
  return (
    <Link
      href="/crm/pipeline"
      className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[10px] font-bold text-brand-600">
        {deal.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-800 group-hover:text-brand-600">
          {deal.name}
        </p>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
          <span className="text-[10px] text-slate-400">{stage.label}</span>
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold text-slate-700">
        {formatCurrency(deal.amount)}
      </span>
    </Link>
  );
}

export default function DealsWidget({ deals, loading }: { deals: Deal[]; loading: boolean }) {
  return (
    <WidgetCard
      title="Últimos Negocios"
      icon={BarChart3}
      iconColor="text-brand-500"
      iconBg="bg-brand-50"
      href="/crm/pipeline"
      loading={loading}
    >
      {deals.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Sin negocios aún"
          description="Crea tu primer negocio en el pipeline."
        />
      ) : (
        <div className="-mx-2.5 space-y-0.5">
          {deals.map((deal) => (
            <DealRow key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
