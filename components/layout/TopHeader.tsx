'use client';

import { useState } from 'react';
import { Search, Bell, Command, ShoppingCart } from 'lucide-react';
import UserMenu from './UserMenu';
import { useCartContext } from '@/context/CartContext';
import CartDrawer from '@/components/scm/catalogo/CartDrawer';
import CheckoutConfirmModal, { type CheckoutResults } from '@/components/scm/catalogo/CheckoutConfirmModal';

const IDLE_RESULTS: CheckoutResults = {
  easy: 'idle', sodimac: 'idle',
  hasEasyItems: false, hasSodimacItems: false,
};

interface TopHeaderProps { title: string; subtitle?: string; }

export default function TopHeader({ title, subtitle }: TopHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartOpen, setCartOpen]           = useState(false);
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [results, setResults]             = useState<CheckoutResults>(IDLE_RESULTS);

  const { cart, itemCount, clearByStore, clearAll } = useCartContext();

  function handleCheckout() {
    if (!cart || cart.items.length === 0) return;

    const easyItems    = cart.items.filter(i => i.product.tienda === 'easy');
    const sodimacItems = cart.items.filter(i => i.product.tienda === 'sodimac');

    const toLinks = (items: typeof easyItems) =>
      items.filter(i => i.product.urlProducto).map(i => ({ titulo: i.product.titulo, url: i.product.urlProducto! }));

    setResults({
      easy:    easyItems.length > 0 ? 'success' : 'skipped',
      sodimac: sodimacItems.length > 0 ? 'success' : 'skipped',
      hasEasyItems:    easyItems.length > 0,
      hasSodimacItems: sodimacItems.length > 0,
      easyProductLinks:    easyItems.length > 0 ? toLinks(easyItems) : undefined,
      sodimacProductLinks: sodimacItems.length > 0 ? toLinks(sodimacItems) : undefined,
    });
    setCartOpen(false);
    setConfirmOpen(true);
  }

  function handleConfirmAll()     { void clearAll();              setConfirmOpen(false); }
  function handleConfirmEasy()    { void clearByStore('easy');    setConfirmOpen(false); }
  function handleConfirmSodimac() { void clearByStore('sodimac'); setConfirmOpen(false); }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-150 ${searchFocused ? 'border-brand-300 bg-white shadow-sm ring-2 ring-brand-100' : 'border-slate-200 bg-slate-50'}`}>
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-44 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
            <div className="flex items-center gap-0.5 rounded border border-slate-200 px-1 py-0.5">
              <Command className="h-2.5 w-2.5 text-slate-400" />
              <span className="text-[10px] text-slate-400">K</span>
            </div>
          </div>

          <button aria-label="Notificaciones" className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:bg-slate-50">
            <Bell className="h-4 w-4 text-slate-500" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
          </button>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Carrito"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ShoppingCart className="h-4 w-4 text-slate-500" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          <UserMenu />
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />

      <CheckoutConfirmModal
        open={confirmOpen}
        results={results}
        onConfirmAll={handleConfirmAll}
        onConfirmEasy={handleConfirmEasy}
        onConfirmSodimac={handleConfirmSodimac}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
