import { type ProductionOrder } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchOrders(): Promise<ProductionOrder[]> {
  const res = await apiFetch(`${API_BASE}/orders`);
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
  const res = await apiFetch(`${API_BASE}/orders/${orderId}/${action}`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Error al avanzar la orden');
  }
  const data = await res.json();
  return data.status as string;
}
