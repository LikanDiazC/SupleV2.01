'use client';

import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import CartItemComponent from './CartItem';
import { useExtensionStatus } from '@/hooks/useExtensionCheckout';

function formatCLP(v: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v);
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { cart, loading } = useCart();
  const items = cart?.items ?? [];
  const extensionStatus = useExtensionStatus();
  const hasSodimacItems = items.some(i => i.product.tienda === 'sodimac');

  const easyTotal = items
    .filter(i => i.product.tienda === 'easy')
    .reduce((s, i) => s + (i.product.precioCLP ?? 0) * i.quantity, 0);

  const sodimacTotal = items
    .filter(i => i.product.tienda === 'sodimac')
    .reduce((s, i) => s + (i.product.precioCLP ?? 0) * i.quantity, 0);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Carrito de Compras</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-slate-100">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">Cargando...</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <ShoppingCart className="h-10 w-10" />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(item => <CartItemComponent key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3">
            <div className="space-y-1 text-xs text-slate-500">
              {easyTotal > 0 && (
                <div className="flex justify-between">
                  <span>Easy</span><span className="font-semibold text-slate-700">{formatCLP(easyTotal)}</span>
                </div>
              )}
              {sodimacTotal > 0 && (
                <div className="flex justify-between">
                  <span>Sodimac</span><span className="font-semibold text-slate-700">{formatCLP(sodimacTotal)}</span>
                </div>
              )}
            </div>
            {hasSodimacItems && extensionStatus === 'not_installed' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Para automatizar Sodimac, instala la extensión Suplev. Sin ella los productos de Sodimac deberán agregarse manualmente.
              </div>
            )}
            <button
              onClick={onCheckout}
              className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
            >
              Comprar
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
