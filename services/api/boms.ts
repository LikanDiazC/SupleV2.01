import { type Bom, type CreateBomPayload, type MaterialCuttingPreview } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchBoms(): Promise<Bom[]> {
  const res = await apiFetch(`${API_BASE}/boms`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createBom(payload: CreateBomPayload): Promise<void> {
  const res = await apiFetch(`${API_BASE}/boms/with-components`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status}`);
  }
}

export async function fetchBomCuttingPreview(bomId: string, quantity = 1): Promise<MaterialCuttingPreview[]> {
  const res = await apiFetch(`${API_BASE}/boms/${bomId}/cutting-preview?quantity=${quantity}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function deleteBom(id: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/boms/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}
