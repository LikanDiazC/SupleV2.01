import { type InboxEmail } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchInboxEmails(limit?: number): Promise<InboxEmail[]> {
  const url = limit ? `${API_BASE}/comms/emails?limit=${limit}` : `${API_BASE}/comms/emails`;
  const res = await apiFetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  if (Array.isArray(data)) {
    return data.map((email: any) => ({
      id:         email.id,
      from:       email.sender       || 'Desconocido',
      subject:    email.subject      || '(Sin Asunto)',
      preview:    email.bodySnippet  || '',
      bodyHtml:   email.bodyHtml     || '',
      read:       email.isProcessed  ?? true,
      receivedAt: email.receivedAt   || new Date().toISOString(),
    }));
  }
  return [];
}
