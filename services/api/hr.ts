import { type TeamMember, type HrTask, type CreateTaskPayload, type TaskStatus } from '@/types';
import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAccessToken() ?? ''}`,
  };
}

export async function fetchTeam(): Promise<{ team: TeamMember[]; notRegistered?: boolean; isEmployee?: boolean }> {
  const res = await fetch(`${API_BASE}/hr/team`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function fetchEmployeeTasks(employeeId: string): Promise<HrTask[]> {
  const res = await fetch(`${API_BASE}/hr/employees/${employeeId}/tasks`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createTask(payload: CreateTaskPayload): Promise<HrTask> {
  const res = await fetch(`${API_BASE}/hr/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status}`);
  }
  return res.json();
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const res = await fetch(`${API_BASE}/hr/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function sendHeartbeat(): Promise<void> {
  await fetch(`${API_BASE}/hr/heartbeat`, {
    method: 'POST',
    headers: authHeaders(),
  });
}
