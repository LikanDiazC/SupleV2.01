'use client';

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Users, AlertCircle, CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { type TeamMember, type HrRole, type HrTask, type TaskStatus } from '@/types';
import { useTeam } from '@/hooks/useTeam';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { fetchMyTasks, updateTaskStatus } from '@/services/api/hr';
import TaskDrawer from './TaskDrawer';

const ROLE_LABELS: Record<HrRole, string> = {
  OWNER:    'Propietario',
  MANAGER:  'Gerente',
  EMPLOYEE: 'Empleado',
};

const ROLE_COLORS: Record<HrRole, string> = {
  OWNER:    'bg-violet-50 text-violet-700 border-violet-200',
  MANAGER:  'bg-blue-50 text-blue-700 border-blue-200',
  EMPLOYEE: 'bg-slate-50 text-slate-600 border-slate-200',
};

function MemberCard({
  member,
  onClick,
}: {
  member: TeamMember;
  onClick: () => void;
}) {
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-start gap-4">
        {/* Avatar + online dot */}
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand-600 group-hover:bg-brand-200 transition-colors">
            {initials}
          </div>
          <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${member.isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {member.firstName} {member.lastName}
          </p>
          <p className="truncate text-xs text-slate-400">{member.email}</p>
          {member.position && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{member.position}</p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[member.hrRole]}`}>
              {ROLE_LABELS[member.hrRole]}
            </span>

            {member.pendingTasks > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {member.pendingTasks} pendiente{member.pendingTasks !== 1 ? 's' : ''}
              </span>
            )}
            {member.pendingTasks === 0 && member.totalTasks > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Al día ✓
              </span>
            )}
          </div>
        </div>

        {/* Task count */}
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold text-slate-800">{member.totalTasks}</p>
          <p className="text-[10px] text-slate-400">tarea{member.totalTasks !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </button>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'COMPLETED')   return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === 'IN_PROGRESS') return <Clock className="h-4 w-4 text-blue-500" />;
  return <Circle className="h-4 w-4 text-slate-300" />;
}

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

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TeamPanel() {
  useHeartbeat();
  const { team, loading, error, notRegistered, isEmployee, refresh } = useTeam();
  const { user } = useCurrentUser();
  const [tab, setTab]                     = useState<'my-tasks' | 'team'>('my-tasks');
  const [selected, setSelected]           = useState<TeamMember | null>(null);
  const [refreshing, setRefreshing]       = useState(false);
  const [myTasks, setMyTasks]             = useState<HrTask[]>([]);
  const [myTasksLoading, setMyTasksLoading] = useState(false);
  const [myTasksUpdating, setMyTasksUpdating] = useState<string | null>(null);

  const loadMyTasks = useCallback(async () => {
    if (!user) return;
    setMyTasksLoading(true);
    try {
      setMyTasks(await fetchMyTasks());
    } catch {
      setMyTasks([]);
    } finally {
      setMyTasksLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'my-tasks') {
      loadMyTasks();
    }
  }, [tab, loadMyTasks]);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    if (tab === 'my-tasks') {
      await loadMyTasks();
    }
    setRefreshing(false);
  }

  async function handleCycleStatus(task: HrTask) {
    setMyTasksUpdating(task.id);
    try {
      const next = STATUS_CYCLE[task.status];
      await updateTaskStatus(task.id, next);
      setMyTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t));
    } finally {
      setMyTasksUpdating(null);
    }
  }

  const myTasksPending = myTasks.filter(t => t.status !== 'COMPLETED').length;

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-8">
          <button
            onClick={() => setTab('my-tasks')}
            className={`pb-4 px-1 text-sm font-semibold transition ${
              tab === 'my-tasks'
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mis Tareas
            {myTasksPending > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {myTasksPending} pendiente{myTasksPending !== 1 ? 's' : ''}
              </span>
            )}
          </button>
          {!isEmployee && (
            <button
              onClick={() => setTab('team')}
              className={`pb-4 px-1 text-sm font-semibold transition ${
                tab === 'team'
                  ? 'border-b-2 border-brand-500 text-brand-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mi Equipo
            </button>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refrescar"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* My Tasks Tab */}
      {tab === 'my-tasks' && (
        <>
          {myTasksLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <CheckCircle2 className="h-8 w-8 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">Sin tareas asignadas</p>
              <p className="text-xs text-slate-400">Estás al día ✓</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.map(task => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleCycleStatus(task)}
                      disabled={myTasksUpdating === task.id}
                      className="mt-0.5 shrink-0 transition hover:scale-110 disabled:opacity-50"
                    >
                      {myTasksUpdating === task.id
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
              ))}
            </div>
          )}
        </>
      )}

      {/* Team Tab */}
      {tab === 'team' && (
        <>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : notRegistered ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-amber-200 bg-amber-50 py-20 text-center">
              <Users className="h-8 w-8 text-amber-300" />
              <p className="text-sm font-semibold text-amber-700">Tu usuario no está registrado como empleado</p>
              <p className="text-xs text-amber-600 max-w-sm">
                Para usar este módulo, inserta un registro en la tabla <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">employees</code> con tu <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">userId</code>, <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">tenantId</code> y <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">hrRole = 'OWNER'</code>.
              </p>
            </div>
          ) : isEmployee ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <Users className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">Solo los propietarios y gerentes tienen equipo a cargo</p>
              <p className="text-xs text-slate-400">Tu rol actual es EMPLOYEE.</p>
            </div>
          ) : team.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <Users className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">Sin equipo registrado todavía</p>
              <p className="text-xs text-slate-400">Agrega empleados a la tabla <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">employees</code> con tu ID como <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">managerId</code>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onClick={() => setSelected(member)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Task drawer */}
      {selected && (
        <TaskDrawer
          member={selected}
          onClose={() => setSelected(null)}
          canCreate={true}
        />
      )}
    </>
  );
}
