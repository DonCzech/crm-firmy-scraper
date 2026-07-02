import {
  createTask,
  deleteTask,
  fetchMe,
  fetchTasks,
  type BackendTask,
  updateTask,
} from '@/crm/services/backend';

export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TodoColumn = 'review' | 'inProgress' | 'done';

export interface TodoTaskRecord {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TodoPriority;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

const columnToStatus: Record<TodoColumn, TodoStatus> = {
  review: 'todo',
  inProgress: 'in_progress',
  done: 'done',
};

const statusToColumn: Record<TodoStatus, TodoColumn> = {
  todo: 'review',
  in_progress: 'inProgress',
  done: 'done',
  cancelled: 'review',
};

function normalizePriority(priority?: string): TodoPriority {
  if (priority === 'high' || priority === 'urgent') return 'high';
  if (priority === 'low') return 'low';
  return 'medium';
}

function normalizeStatus(status?: string): TodoStatus {
  if (status === 'in_progress' || status === 'done' || status === 'cancelled') {
    return status;
  }
  return 'todo';
}

function toRecord(item: BackendTask): TodoTaskRecord {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? '',
    dueDate: item.dueDate,
    priority: normalizePriority(item.priority),
    status: normalizeStatus(item.status),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function getColumnByStatus(status: TodoStatus): TodoColumn {
  return statusToColumn[status] ?? 'review';
}

export function getStatusByColumn(column: TodoColumn): TodoStatus {
  return columnToStatus[column] ?? 'todo';
}

export function formatDueDateLabel(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTimeLabel(value?: string): string {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeDayLabel(value?: string): string {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';
  const now = new Date();
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startDate.getTime() - startNow.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: 'short' });
}

export function formatCompletedAtLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function listTodoTasks() {
  const response = await fetchTasks({ limit: 500 });
  return response.data.map(toRecord);
}

async function resolveCreatorId(fallbackCreatorId?: string): Promise<string> {
  if (fallbackCreatorId) return fallbackCreatorId;

  const me = await fetchMe();
  if (!me?.id) {
    throw new Error('Nepodařilo se načíst aktuálního uživatele pro vytvoření úkolu.');
  }

  return me.id;
}

export async function createTodoTask(payload: {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TodoPriority;
  creatorId?: string;
  status?: TodoStatus;
}) {
  const creatorId = await resolveCreatorId(payload.creatorId);
  const created = await createTask({
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    priority: payload.priority ?? 'medium',
    status: payload.status ?? 'todo',
    creatorId,
  });
  return toRecord(created);
}

export async function updateTodoTaskStatus(id: string, status: TodoStatus) {
  const updated = await updateTask(id, { status });
  return toRecord(updated);
}

export async function updateTodoTask(
  id: string,
  payload: {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: TodoPriority;
    status?: TodoStatus;
  },
) {
  const updated = await updateTask(id, payload);
  return toRecord(updated);
}

export async function toggleTodoTask(id: string, completed: boolean) {
  const updated = await updateTask(id, { status: completed ? 'done' : 'todo' });
  return toRecord(updated);
}

export async function removeTodoTask(id: string) {
  await deleteTask(id);
}
