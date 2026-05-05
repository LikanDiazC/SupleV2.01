import { type Contact } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchContacts(): Promise<Contact[]> {
  const res = await apiFetch(`${API_BASE}/crm/contacts`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
