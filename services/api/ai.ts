import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth'; // 👈 Importamos la función que saca el token del localStorage

export interface AiChatPayload {
  message: string;
  history?: { role: string; content: string }[];
}

export interface AiChatResponse {
  reply: string;
}

export async function sendAiMessage(payload: AiChatPayload): Promise<AiChatResponse> {
  const token = getAccessToken(); // 👈 1. Sacamos tu gafete de seguridad

  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // 👈 2. ¡Se lo pegamos en la frente a la petición HTTP!
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`AI chat error: HTTP ${res.status}`);
  }

  const data = await res.json();
  
  // 3. Acomodamos la respuesta. Si el backend manda 'response', lo pasamos como 'reply' para que la UI de Claude no se rompa.
  return {
    reply: data.response || data.reply || 'Sin respuesta'
  };
}