'use client';

const VTEX_BASE = 'https://easycl.vteximg.com.br/api/checkout/pub';

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

async function resolveVtexSkuId(sku: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.easy.cl/api/catalog_system/pub/products/search?fq=referenceId:${sku}`,
      { headers: { Accept: 'application/json' } },
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.items?.[0]?.itemId) {
        return data[0].items[0].itemId;
      }
    }
  } catch {
    // fallback: use SKU directly
  }
  return sku;
}

export async function runVtexCheckout(items: EasyItem[]): Promise<VtexCheckoutResult> {
  try {
    const formRes = await fetch(`${VTEX_BASE}/orderForm`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!formRes.ok) {
      return { status: 'error', error: `VTEX no respondió (${formRes.status})` };
    }

    const { orderFormId } = await formRes.json();

    const orderItems = await Promise.all(
      items.map(async (item) => ({
        id: await resolveVtexSkuId(item.sku),
        quantity: item.quantity,
        seller: '1',
      })),
    );

    const addRes = await fetch(`${VTEX_BASE}/orderForm/${orderFormId}/items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ orderItems }),
    });

    if (!addRes.ok) {
      return { status: 'error', error: `No se pudieron agregar los items a Easy (${addRes.status})` };
    }

    const cartUrl = `https://www.easy.cl/checkout?orderFormId=${orderFormId}#/cart`;
    return { status: 'success', cartUrl };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido al conectar con Easy';
    return { status: 'error', error: msg };
  }
}
