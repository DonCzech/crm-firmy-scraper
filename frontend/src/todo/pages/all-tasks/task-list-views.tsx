import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TodoTaskRecord } from '@/todo/services/tasks';

interface TaskListViewsProps {
  tasks: TodoTaskRecord[];
  onEdit: (task: TodoTaskRecord) => void;
  onDelete: (taskId: string) => void;
}

function formatDue(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: TodoTaskRecord['status']) {
  if (status === 'in_progress') return 'In progress';
  if (status === 'done') return 'Done';
  if (status === 'cancelled') return 'Cancelled';
  return 'To do';
}

export function TaskRowsView({ tasks, onEdit, onDelete }: TaskListViewsProps) {
  return (
    <div className="rounded-lg border border-input bg-card">
      {tasks.length === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">No tasks.</div>
      ) : (
        <div className="divide-y divide-border">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{task.title}</div>
                <div className="truncate text-xs text-muted-foreground">{task.description || '-'}</div>
              </div>
              <Badge variant="outline" className="capitalize">{task.priority}</Badge>
              <Badge variant="secondary">{statusLabel(task.status)}</Badge>
              <div className="w-36 text-right text-xs text-muted-foreground">{formatDue(task.dueDate)}</div>
              <Button type="button" mode="icon" variant="ghost" size="sm" onClick={() => onEdit(task)}>
                <Pencil className="size-4" />
              </Button>
              <Button type="button" mode="icon" variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskTableView({ tasks, onEdit, onDelete }: TaskListViewsProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-input bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-input text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Due</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={5}>No tasks.</td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="border-b border-input/70">
                <td className="px-4 py-3 align-top">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-muted-foreground">{task.description || '-'}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                </td>
                <td className="px-4 py-3 align-top">
                  <Badge variant="secondary">{statusLabel(task.status)}</Badge>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">{formatDue(task.dueDate)}</td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-1">
                    <Button type="button" mode="icon" variant="ghost" size="sm" onClick={() => onEdit(task)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" mode="icon" variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
