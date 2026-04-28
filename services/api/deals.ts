import { type Deal, type CreateDealPayload } from '@/types';
import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth'; // 👈 Importante para sacar el token

// Función auxiliar para centralizar la seguridad
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken() ?? ''}`,
  };
}

export async function fetchDeals(): Promise<Deal[]> {
  const res = await fetch(`${API_BASE}/crm/deals`, { 
    headers: authHeaders() // 👈 Agregamos el token aquí
  });
  if (!res.ok) {
    console.error("❌ Error al obtener negocios:", res.status);
    return [];
  }
  return res.json();
}

export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  const res = await fetch(`${API_BASE}/crm/deals`, {
    method: 'POST',
    headers: authHeaders(), // 👈 Agregamos el token aquí
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status} al crear negocio`);
  }
  return res.json();
}

export async function updateDealStage(id: string, stage: string): Promise<void> {
  const res = await fetch(`${API_BASE}/crm/deals/${id}/stage`, {
    method: 'PATCH',
    headers: authHeaders(), // 👈 Agregamos el token aquí
    body: JSON.stringify({ stage }),
  });
  
  if (!res.ok) throw new Error(`Error ${res.status} al mover el negocio`);
}

export async function deleteDeal(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/crm/deals/${id}`, {
    method: 'DELETE',
    headers: authHeaders(), // 👈 Agregamos el token aquí
  });
  
  if (!res.ok) throw new Error(`Error ${res.status} al eliminar el negocio`);
}