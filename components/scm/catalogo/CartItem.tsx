'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { type CartItem as CartItemType } from '@/types';
import { useCart } from '@/hooks/useCart';

function formatCLP(v?: number) {
  if (!v) return '—';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v);
}

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateItem, removeItem } = useCart();
  const p = item.product;

  return (
    <div className="flex gap-3 py-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {p.urlImagen ? (
          <Image src={p.urlImagen} alt={p.titulo} fill className="object-contain p-1" unoptimized />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="text-xs text-slate-400">{p.tienda === 'sodimac' ? 'Sodimac' : 'Easy'}</p>
        <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{p.titulo}</p>
        <p className="text-sm font-bold text-slate-900">{formatCLP(p.precioCLP)}</p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition">
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateItem(item.id, item.quantity - 1)}
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-slate-700">{item.quantity}</span>
          <button
            onClick={() => updateItem(item.id, item.quantity + 1)}
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
