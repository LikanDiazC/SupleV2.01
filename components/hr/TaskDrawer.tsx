'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { type TeamMember, type HrTask, type TaskStatus } from '@/types';
import { fetchEmployeeTasks, updateTaskStatus } from '@/services/api/hr';
import CreateTaskModal from './CreateTaskModal';

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING:     'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED:   'Completada',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING:     'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED:   'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  PENDING:     'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED:   'PENDING',
};

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'COMPLETED')   return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === 'IN_PROGRESS') return <Clock className="h-4 w-4 text-blue-500" />;
  return <Circle className="h-4 w-4 text-slate-300" />;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props {
  member:   TeamMember;
  onClose:  () => void;
  canCreate: boolean;
}

export default function TaskDrawer({ member, onClose, canCreate }: Props) {
  const [tasks, setTasks]           = useState<HrTask[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [updating, setUpdating]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await fetchEmployeeTasks(member.id));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [member.id]);

  useEffect(() => { load(); }, [load]);

  async function handleCycleStatus(task: HrTask) {
    setUpdating(task.id);
    try {
      const next = STATUS_CYCLE[task.status];
      await updateTaskStatus(task.id, next);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t));
    } finally {
      setUpdating(null);
    }
  }

  const pending   = tasks.filter(t => t.status !== 'COMPLETED').length;
  const initials  = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{member.firstName} {member.lastName}</p>
              <p className="text-xs text-slate-400">{member.position ?? member.hrRole} · {pending} pendiente{pending !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canCreate && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva tarea
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-400">
              <CheckCircle2 className="h-8 w-8 text-slate-200" />
              <p className="text-sm font-medium">Sin tareas asignadas</p>
              {canCreate && (
                <p className="text-xs">Usa "Nueva tarea" para asignar una.</p>
              )}
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleCycleStatus(task)}
                    disabled={updating === task.id}
                    className="mt-0.5 shrink-0 transition hover:scale-110 disabled:opacity-50"
                  >
                    {updating === task.id
                      ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      : <StatusIcon status={task.status} />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-slate-800 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      {task.dueDate && (
                        <span className="text-[10px] text-slate-400">
                          Límite: {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {showModal && (
        <CreateTaskModal
          member={member}
          onClose={() => setShowModal(false)}
          onCreated={load}
        />
      )}
    </>
  );
}
