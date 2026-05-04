'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useCart } from '@/hooks/useCart';
import { type MarketplaceProduct } from '@/types';
import ProductCard from './ProductCard';

const TIENDAS = [
  { value: 'all',     label: 'Todas'   },
  { value: 'sodimac', label: 'Sodimac' },
  { value: 'easy',    label: 'Easy'    },
];

export default function CatalogoView() {
  const [search, setSearch] = useState('');
  const [tienda, setTienda] = useState('all');
  const [page, setPage]     = useState(1);
  const [query, setQuery]   = useState({ search: '', tienda: 'all', page: 1 });

  const { items, total, loading } = useMarketplace(query);
  const { addItem } = useCart();

  const totalPages = Math.ceil(total / 50);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery({ search, tienda, page: 1 });
  }

  function handleTiendaChange(t: string) {
    setTienda(t);
    setPage(1);
    setQuery({ search, tienda: t, page: 1 });
  }

  function handlePageChange(next: number) {
    setPage(next);
    setQuery({ search, tienda, page: next });
  }

  async function handleAddToCart(product: MarketplaceProduct) {
    await addItem(product.id, 1);
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-56 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </form>

        <div className="flex gap-1">
          {TIENDAS.map(t => (
            <button
              key={t.value}
              onClick={() => handleTiendaChange(t.value)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                tienda === t.value
                  ? 'bg-brand-500 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="ml-auto text-xs text-slate-400">
          {loading ? 'Cargando...' : `${total} productos`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-slate-400">Sin resultados para tu búsqueda.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-slate-600">{page} / {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
