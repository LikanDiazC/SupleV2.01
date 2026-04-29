'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { saveSession, getAccessToken, getStoredUser, decodeJwtPayload, type StoredUser } from '@/lib/auth';
import { API_BASE } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Modal cambio de contraseña
  const [showModal, setShowModal]           = useState(false);
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]         = useState('');
  const [showNewPwd, setShowNewPwd]         = useState(false);
  const [modalLoading, setModalLoading]     = useState(false);
  const [modalError, setModalError]         = useState<string | null>(null);

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

      const claims  = decodeJwtPayload(token) ?? {};
      const apiUser = data.user ?? {};

      const storedUser: StoredUser = {
        id:                apiUser.id         ?? String(claims.sub ?? ''),
        name:              apiUser.name       ?? String(claims.name  ?? ''),
        email:             apiUser.email      ?? String(claims.email ?? email.trim()),
        tenantName:        apiUser.tenantName ?? String(claims.tenantName ?? claims.tenant ?? ''),
        mustChangePassword: data.mustChangePassword ?? false,
        hasGoogleLinked:   data.hasGoogleLinked ?? false,
      };

      saveSession(token, storedUser);

      if (data.mustChangePassword) {
        setShowModal(true);
        return;
      }

      await continueToApp(token, data.hasGoogleLinked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function continueToApp(token: string, hasGoogleLinked: boolean) {
    try {
      if (hasGoogleLinked) {
        await fetch(`${API_BASE}/comms/auth/restore-session`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        router.replace('/overview');
      } else {
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
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setModalError(null);

    if (!newPassword.trim())          return setModalError('La nueva contraseña es requerida.');
    if (newPassword.length < 8)       return setModalError('Debe tener al menos 8 caracteres.');
    if (newPassword !== confirmPwd)   return setModalError('Las contraseñas no coinciden.');

    const token = getAccessToken();
    if (!token) return;

    setModalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Error al cambiar la contraseña.');
      }

      const storedUser = getStoredUser();
      if (storedUser) {
        saveSession(token, { ...storedUser, mustChangePassword: false });
      }

      await continueToApp(token, storedUser?.hasGoogleLinked ?? false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

      {/* Modal cambio de contraseña */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">Elige tu contraseña</h2>
              <p className="mt-1 text-sm text-slate-500">Debes cambiar tu contraseña antes de continuar</p>
            </div>

            {modalError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{modalError}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
              <div>
                <label htmlFor="newPwd" className="mb-1.5 block text-xs font-medium text-slate-700">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="newPwd"
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPwd" className="mb-1.5 block text-xs font-medium text-slate-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPwd"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
              >
                {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {modalLoading ? 'Guardando...' : 'Guardar y continuar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Card login */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-card">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suple</h1>
          <p className="mt-1 text-sm text-slate-500">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-700">
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

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-700">
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Suple ERP · Cercha Studio &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
