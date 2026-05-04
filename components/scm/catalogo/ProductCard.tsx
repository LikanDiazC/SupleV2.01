'use client';

import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { type MarketplaceProduct } from '@/types';

function formatCLP(value?: number) {
  if (!value) return '—';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
}

interface ProductCardProps {
  product: MarketplaceProduct;
  onAddToCart: (product: MarketplaceProduct) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Tienda label */}
      <div className="px-3 pt-2 pb-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {product.tienda === 'sodimac' ? 'Sodimac' : 'Easy'}
        </span>
      </div>

      {/* Imagen */}
      <div className="relative mx-3 mt-1 h-36 rounded-lg overflow-hidden bg-slate-50">
        {product.urlImagen ? (
          <Image
            src={product.urlImagen}
            alt={product.titulo}
            fill
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-300 text-xs">Sin imagen</div>
        )}
        {product.descuentoPct && product.descuentoPct > 0 && (
          <span className="absolute top-2 right-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{Math.round(product.descuentoPct)}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.marca && (
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{product.marca}</p>
        )}
        <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{product.titulo}</p>
        <p className="mt-auto pt-2 text-base font-bold text-slate-900">{formatCLP(product.precioCLP)}</p>
      </div>

      {/* Botón */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onAddToCart(product)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
