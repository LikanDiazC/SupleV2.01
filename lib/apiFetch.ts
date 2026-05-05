import { getAccessToken, clearSession } from './auth';

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  return fetch(url, { ...options, headers }).then(res => {
    if (res.status === 401) {
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return res;
  });
}
