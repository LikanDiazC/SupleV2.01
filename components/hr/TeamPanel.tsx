'use client';

import { useState } from 'react';
import { RefreshCw, Users, AlertCircle } from 'lucide-react';
import { type TeamMember, type HrRole } from '@/types';
import { useTeam } from '@/hooks/useTeam';
import { useHeartbeat } from '@/hooks/useHeartbeat';
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

export default function TeamPanel() {
  useHeartbeat();
  const { team, loading, error, notRegistered, isEmployee, refresh } = useTeam();
  const [selected, setSelected]           = useState<TeamMember | null>(null);
  const [refreshing, setRefreshing]       = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  return (
    <>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Mi Equipo</h2>
          <p className="text-xs text-slate-400">
            {loading ? 'Cargando...' : `${team.length} persona${team.length !== 1 ? 's' : ''} a cargo`}
          </p>
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

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
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
