import { BarChart3 } from 'lucide-react';
import { type Deal, type KanbanColumn as KanbanColumnType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import DealCard from './DealCard';
import EmptyState from '@/components/ui/EmptyState';

interface KanbanColumnProps {
  column: KanbanColumnType;
  deals: Deal[];
  onDealClick?: (deal: Deal) => void;
}

export default function KanbanColumn({ column, deals, onDealClick }: KanbanColumnProps) {
  const columnTotal = deals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-slate-100 bg-slate-50/70">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${column.dotColor}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            {column.label}
          </span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-500">
            {deals.length}
          </span>
        </div>
        {deals.length > 0 && (
          <span className="text-[10px] font-semibold text-slate-400">{formatCurrency(columnTotal)}</span>
        )}
      </div>

      {/* Cards */}
      <div className="kanban-column flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
        {deals.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Sin negocios"
            description="Arrastra un negocio aquí o crea uno nuevo."
          />
        ) : (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
          ))
        )}
      </div>
    </div>
  );
}
