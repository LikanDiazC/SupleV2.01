import { type Contact } from '@/types';
import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken() ?? ''}`,
  };
}

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch(`${API_BASE}/crm/contacts`, { headers: authHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
