import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export interface AiChatPayload {
  message: string;
  history?: { role: string; content: string }[];
}

export interface AiChatResponse {
  reply: string;
}

export async function sendAiMessage(payload: AiChatPayload): Promise<AiChatResponse> {
  const res = await apiFetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`AI chat error: HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    reply: data.response || data.reply || 'Sin respuesta',
  };
}
