'use client';

import { ShoppingCart, Bot, Building2, User } from 'lucide-react';
import { type Deal } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
  onClick?: (deal: Deal) => void;
}

export default function DealCard({ deal, onClick }: DealCardProps) {
  const hasItems = deal.items && deal.items.length > 0;
  const totalQty = deal.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div
      onClick={() => onClick?.(deal)}
      className="group cursor-pointer rounded-xl border border-slate-100 bg-white p-4 shadow-card transition-all duration-150 hover:border-slate-200 hover:shadow-card-hover active:scale-[0.99]"
    >
      {/* Name + Amount */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{deal.name}</p>
        <span className="shrink-0 text-sm font-bold text-slate-900">
          {formatCurrency(deal.amount)}
        </span>
      </div>

      {/* Contact / Company */}
      <div className="mb-3 space-y-1">
        {deal.contactId && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="h-3 w-3 text-slate-400" />
            <span className="truncate font-mono text-[10px] text-slate-400">{deal.contactId}</span>
          </div>
        )}
        {deal.companyId && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="h-3 w-3 text-slate-400" />
            <span className="truncate font-mono text-[10px] text-slate-400">{deal.companyId}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {hasItems && (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
            <ShoppingCart className="h-2.5 w-2.5" />
            {deal.items!.length} producto{deal.items!.length !== 1 ? 's' : ''} · {totalQty} u.
          </span>
        )}
        {deal.lastAiActivity && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
            <Bot className="h-2.5 w-2.5" />
            IA
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-slate-50 pt-2.5">
        {deal.lastAiActivity ? (
          <p className="truncate text-[10px] text-slate-400">
            <span className="font-medium text-emerald-600">IA:</span> {deal.lastAiActivity}
          </p>
        ) : (
          <p className="text-[10px] text-slate-300">
            {deal.createdAt ? formatRelativeTime(deal.createdAt) : 'Sin actividad'}
          </p>
        )}
      </div>
    </div>
  );
}
