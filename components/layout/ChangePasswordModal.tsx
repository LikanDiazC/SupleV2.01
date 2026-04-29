'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getAccessToken, getStoredUser, saveSession } from '@/lib/auth';
import { API_BASE } from '@/lib/utils';

export default function ChangePasswordModal() {
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPwd, setConfirmPwd]     = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim())        return setError('La nueva contraseña es requerida.');
    if (newPassword.length < 8)     return setError('Debe tener al menos 8 caracteres.');
    if (newPassword !== confirmPwd) return setError('Las contraseñas no coinciden.');

    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
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

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">Elige tu contraseña</h2>
          <p className="mt-1 text-sm text-slate-500">Debes cambiar tu contraseña antes de continuar</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="newPwd" className="mb-1.5 block text-xs font-medium text-slate-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="newPwd"
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
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
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
