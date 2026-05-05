import { type TeamMember, type HrTask, type CreateTaskPayload, type TaskStatus } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchTeam(): Promise<{ team: TeamMember[]; notRegistered?: boolean; isEmployee?: boolean }> {
  const res = await apiFetch(`${API_BASE}/hr/team`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function fetchEmployeeTasks(employeeId: string): Promise<HrTask[]> {
  const res = await apiFetch(`${API_BASE}/hr/employees/${employeeId}/tasks`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchMyTasks(): Promise<HrTask[]> {
  const res = await apiFetch(`${API_BASE}/hr/my-tasks`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createTask(payload: CreateTaskPayload): Promise<HrTask> {
  const res = await apiFetch(`${API_BASE}/hr/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status}`);
  }
  return res.json();
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const res = await apiFetch(`${API_BASE}/hr/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function sendHeartbeat(): Promise<void> {
  await apiFetch(`${API_BASE}/hr/heartbeat`, { method: 'POST' });
}
