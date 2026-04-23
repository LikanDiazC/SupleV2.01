import { type Contact } from '@/types';
import { API_BASE } from '@/lib/utils';

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch(`${API_BASE}/contacts`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
