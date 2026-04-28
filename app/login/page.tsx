'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { saveSession, decodeJwtPayload, type StoredUser } from '@/lib/auth';
import { API_BASE } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim())    return setError('El correo electrónico es requerido.');
    if (!password.trim()) return setError('La contraseña es requerida.');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? `Error ${res.status}: credenciales inválidas.`);
      }

      const data = await res.json();
      const token: string = data.accessToken ?? data.access_token ?? data.token ?? '';

      if (!token) throw new Error('La API no devolvió un token de acceso.');

      // Build stored user — prefer explicit "user" field, fallback to JWT claims
      const claims = decodeJwtPayload(token) ?? {};
      const apiUser = data.user ?? {};

      const storedUser: StoredUser = {
        id:         apiUser.id         ?? String(claims.sub ?? ''),
        name:       apiUser.name       ?? String(claims.name  ?? ''),
        email:      apiUser.email      ?? String(claims.email ?? email.trim()),
        tenantName: apiUser.tenantName ?? String(claims.tenantName ?? claims.tenant ?? ''),
      };

      saveSession(token, storedUser);

      try {
        if (data.hasGoogleLinked) {
          // Tokens guardados en BD — restaurar sesión Google en memoria
          await fetch(`${API_BASE}/comms/auth/restore-session`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          router.replace('/overview');
        } else {
          // Primera vez o tokens expirados — pedir permisos Google
          const urlRes = await fetch(`${API_BASE}/comms/auth/google-url`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (urlRes.ok) {
            const { url } = await urlRes.json();
            window.location.href = url;
            return;
          }
          router.replace('/overview');
        }
      } catch {
        router.replace('/overview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-card">

        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suple</h1>
          <p className="mt-1 text-sm text-slate-500">Inicia sesión en tu cuenta</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@empresa.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Suple ERP · Cercha Studio &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
