import { type Material, type CreateMaterialPayload, type Remnant } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchInventory(type?: string): Promise<Material[]> {
  const url = type ? `${API_BASE}/materials?type=${type}` : `${API_BASE}/materials`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}: No se pudo cargar el inventario`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createInventoryItem(payload: CreateMaterialPayload): Promise<Material> {
  const res = await apiFetch(`${API_BASE}/materials`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status}`);
  }
  return res.json();
}

export async function receiveMaterialStock(
  id: string,
  payload: { quantity: number; reason: string },
): Promise<void> {
  const res = await apiFetch(`${API_BASE}/materials/${id}/receive`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function consumeMaterialStock(
  id: string,
  payload: { quantity: number; reason: string },
): Promise<void> {
  const res = await apiFetch(`${API_BASE}/materials/${id}/consume`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function fetchRemnants(): Promise<Remnant[]> {
  const res = await apiFetch(`${API_BASE}/materials/remnants`);
  if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron cargar los retazos`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
