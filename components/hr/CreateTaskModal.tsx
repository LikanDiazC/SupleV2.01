'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { type TeamMember } from '@/types';
import { createTask } from '@/services/api/hr';

interface Props {
  member: TeamMember;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({ member, onClose, onCreated }: Props) {
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate]         = useState('');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createTask({
        title:        title.trim(),
        description:  description.trim() || undefined,
        assignedToId: member.id,
        dueDate:      dueDate || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Error al crear la tarea');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Nueva tarea</h3>
            <p className="text-xs text-slate-400">Para {member.firstName} {member.lastName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Título *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Revisar informe semanal"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles opcionales..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Fecha límite</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
