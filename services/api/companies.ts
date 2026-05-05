import { type Company } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchCompanies(): Promise<Company[]> {
  const res = await apiFetch(`${API_BASE}/crm/companies`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
