'use client';

export type VtexCheckoutStatus = 'idle' | 'loading' | 'success' | 'error';

export interface EasyItem {
  sku: string;
  quantity: number;
  titulo: string;
}

export interface VtexCheckoutResult {
  status: VtexCheckoutStatus;
  cartUrl?: string;
  error?: string;
}

export async function runVtexCheckout(items: EasyItem[]): Promise<VtexCheckoutResult> {
  try {
    const res = await fetch('/api/vtex-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(i => ({ sku: i.sku, quantity: i.quantity })) }),
    });

    const data = await res.json() as { cartUrl?: string; error?: string };

    if (!res.ok || data.error) {
      return { status: 'error', error: data.error ?? `Error ${res.status} al crear carrito en Easy` };
    }

    return { status: 'success', cartUrl: data.cartUrl };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido al conectar con Easy';
    return { status: 'error', error: msg };
  }
}
