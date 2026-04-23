import { type CreateDealPayload, type Deal } from '@/types';
import { API_BASE } from '@/lib/utils';

export async function fetchDeals(): Promise<Deal[]> {
  const res = await fetch(`${API_BASE}/deals`);
  if (!res.ok) throw new Error(`fetchDeals: HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  const res = await fetch(`${API_BASE}/deals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `createDeal: HTTP ${res.status}`);
  }
  return res.json();
}
