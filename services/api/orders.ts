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
