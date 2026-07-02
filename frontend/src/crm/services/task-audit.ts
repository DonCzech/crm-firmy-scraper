export const TASK_AUDIT_STORAGE_KEY = 'crm-task-audit-v1';
export const TASK_AUDIT_REFRESH_EVENT = 'crm:tasks:audit:refresh';

export type TaskAuditAction =
  | 'created'
  | 'updated'
  | 'completed'
  | 'reopened'
  | 'duplicated'
  | 'deleted';

export interface TaskAuditEntry {
  id: string;
  taskId: string;
  action: TaskAuditAction;
  note?: string;
  actor: string;
  createdAt: string;
}

function readAll(): TaskAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(TASK_AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TaskAuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: TaskAuditEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TASK_AUDIT_STORAGE_KEY, JSON.stringify(items.slice(0, 1000)));
    window.dispatchEvent(new CustomEvent(TASK_AUDIT_REFRESH_EVENT));
  } catch {
    // ignore localStorage write errors
  }
}

export function appendTaskAudit(taskId: string, action: TaskAuditAction, note?: string, actor = 'Uživatel') {
  if (!taskId) return;
  const current = readAll();
  const next: TaskAuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    taskId,
    action,
    note: note || undefined,
    actor,
    createdAt: new Date().toISOString(),
  };
  writeAll([next, ...current]);
}

export function getTaskAudit(taskId: string): TaskAuditEntry[] {
  if (!taskId) return [];
  return readAll()
    .filter((item) => item.taskId === taskId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getTaskAuditUpdatedCounts(taskIds?: string[]): Map<string, number> {
  const allowed = Array.isArray(taskIds) && taskIds.length > 0 ? new Set(taskIds) : null;
  const counts = new Map<string, number>();
  for (const item of readAll()) {
    if (item.action !== 'updated') continue;
    if (allowed && !allowed.has(item.taskId)) continue;
    counts.set(item.taskId, (counts.get(item.taskId) || 0) + 1);
  }
  return counts;
}
