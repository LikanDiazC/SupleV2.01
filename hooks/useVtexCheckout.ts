'use client';

import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';

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
    const res = await fetch(`${API_BASE}/marketplace/checkout/easy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAccessToken() ?? ''}`,
      },
      body: JSON.stringify({ items: items.map(i => ({ sku: i.sku, quantity: i.quantity })) }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      return { status: 'error', error: err.message ?? `Error ${res.status} al crear carrito en Easy` };
    }

    const { cartUrl } = await res.json() as { cartUrl: string };
    return { status: 'success', cartUrl };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido al conectar con Easy';
    return { status: 'error', error: msg };
  }
}
