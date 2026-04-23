import { API_BASE } from '@/lib/utils';

export interface AiChatPayload {
  message: string;
  history?: { role: string; content: string }[];
}

export interface AiChatResponse {
  reply: string;
}

export async function sendAiMessage(payload: AiChatPayload): Promise<AiChatResponse> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`AI chat error: HTTP ${res.status}`);
  return res.json();
}
