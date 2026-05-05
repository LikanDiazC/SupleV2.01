import { type Deal, type CreateDealPayload } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchDeals(): Promise<Deal[]> {
  const res = await apiFetch(`${API_BASE}/crm/deals`);
  if (!res.ok) return [];
  return res.json();
}

export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  const res = await apiFetch(`${API_BASE}/crm/deals`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status} al crear negocio`);
  }
  return res.json();
}

export async function updateDealStage(id: string, stage: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/crm/deals/${id}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error(`Error ${res.status} al mover el negocio`);
}

export async function deleteDeal(id: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/crm/deals/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Error ${res.status} al eliminar el negocio`);
}
