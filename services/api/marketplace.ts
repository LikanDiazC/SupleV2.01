import { type MarketplaceProduct, type MarketplaceProductsResponse, type Cart, type CartItem } from '@/types';
import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAccessToken() ?? ''}`,
  };
}

export async function fetchMarketplaceProducts(params: {
  search?: string;
  tienda?: string;
  categoria?: string;
  page?: number;
  limit?: number;
}): Promise<MarketplaceProductsResponse> {
  const qs = new URLSearchParams();
  if (params.search)    qs.set('search', params.search);
  if (params.tienda && params.tienda !== 'all') qs.set('tienda', params.tienda);
  if (params.categoria) qs.set('categoria', params.categoria);
  if (params.page)      qs.set('page', String(params.page));
  if (params.limit)     qs.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/marketplace/products?${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron cargar los productos`);
  return res.json();
}

export async function fetchCart(): Promise<Cart | null> {
  const res = await fetch(`${API_BASE}/marketplace/cart`, { headers: authHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function addCartItem(productId: string, quantity: number): Promise<CartItem> {
  const res = await fetch(`${API_BASE}/marketplace/cart/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function updateCartItem(itemId: string, quantity: number): Promise<void> {
  const res = await fetch(`${API_BASE}/marketplace/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function removeCartItem(itemId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/marketplace/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function clearCartByStore(tienda: 'easy' | 'sodimac'): Promise<void> {
  const res = await fetch(`${API_BASE}/marketplace/cart/items?tienda=${tienda}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function clearCart(): Promise<void> {
  const res = await fetch(`${API_BASE}/marketplace/cart`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}
