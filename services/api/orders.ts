import { type ProductionOrder } from '@/types';
import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAccessToken() ?? ''}`,
  };
}

export async function fetchOrders(): Promise<ProductionOrder[]> {
  const res = await fetch(`${API_BASE}/orders`, { headers: authHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchActiveOrders(): Promise<ProductionOrder[]> {
  const all = await fetchOrders();
  return all.filter((o) => o.status === 'IN_PRODUCTION');
}

export type OrderAction =
  | 'check-stock'
  | 'start-production'
  | 'complete-production'
  | 'ship'
  | 'deliver';

export async function advanceOrder(orderId: string, action: OrderAction): Promise<string> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/${action}`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Error al avanzar la orden');
  }
  const data = await res.json();
  return data.status as string;
}
