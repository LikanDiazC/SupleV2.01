'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Cart } from '@/types';
import {
  fetchCart, addCartItem, updateCartItem,
  removeCartItem, clearCartByStore, clearCart,
} from '@/services/api/marketplace';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearByStore: (tienda: 'easy' | 'sodimac') => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setCart(await fetchCart());
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  async function addItem(productId: string, quantity: number) {
    await addCartItem(productId, quantity);
    await refresh();
  }

  async function updateItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeCartItem(itemId);
    } else {
      await updateCartItem(itemId, quantity);
    }
    await refresh();
  }

  async function removeItem(itemId: string) {
    await removeCartItem(itemId);
    await refresh();
  }

  async function clearByStore(tienda: 'easy' | 'sodimac') {
    await clearCartByStore(tienda);
    await refresh();
  }

  async function clearAll() {
    await clearCart();
    await refresh();
  }

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addItem, updateItem, removeItem, clearByStore, clearAll, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used inside CartProvider');
  return ctx;
}
