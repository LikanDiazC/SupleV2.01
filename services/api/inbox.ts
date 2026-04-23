import { type InboxEmail } from '@/types';
import { API_BASE } from '@/lib/utils';

export async function fetchInboxEmails(limit?: number): Promise<InboxEmail[]> {
  const url = limit ? `${API_BASE}/inbox?limit=${limit}` : `${API_BASE}/inbox`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
