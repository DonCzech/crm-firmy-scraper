import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckSquare, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import {
  BackendTask,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from '@/crm/services/backend';
import { CRM_TASKS_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const DONE_STATUS = 'done';
const PENDING_STATUS = 'todo';

function isDone(task: BackendTask) {
  return task.status === DONE_STATUS;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDueDate(iso: string | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isOverdue(dueDate: string | undefined, taskDone: boolean) {
  if (!dueDate || taskDone) return false;
  return new Date(dueDate) < new Date();
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Nízká', className: 'text-muted-foreground' },
  medium: { label: 'Normální', className: 'text-blue-600' },
  high: { label: 'Vysoká', className: 'text-amber-600' },
  urgent: { label: 'Urgentní', className: 'text-destructive' },
};

function sortTasks(tasks: BackendTask[]) {
  return [...tasks].sort((a, b) => {
    const aDone = isDone(a);
    const bDone = isDone(b);
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function TaskItem({
  task,
  onToggleDone,
  onDelete,
  canDelete,
}: {
  task: BackendTask;
  onToggleDone: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const done = isDone(task);
  const overdue = isOverdue(task.dueDate, done);
  const priority = PRIORITY_CONFIG[task.priority ?? 'medium'] ?? PRIORITY_CONFIG.medium;

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-3 transition-colors',
        done ? 'border-border bg-muted/30 opacity-60' : 'border-border bg-card',
        overdue && 'border-destructive/30 bg-destructive/5',
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggleDone(task.id, !done)}
        className={cn(
          'mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          done
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-muted-foreground/40 hover:border-emerald-500',
        )}
        title={done ? 'Označit jako nedokončené' : 'Označit jako dokončené'}
      >
        {done && <CheckSquare className="size-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>
            {task.title}
          </span>
          <span className={cn('text-xs font-medium', priority.className)}>
            {priority.label}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Vytvořeno: {formatDate(task.createdAt)}
          </span>
          {task.dueDate && (
            <span className={cn('text-xs font-medium', overdue ? 'text-destructive' : 'text-muted-foreground')}>
              • Termín: {formatDueDate(task.dueDate)}
              {overdue && ' (Prošlé!)'}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        disabled={!canDelete}
        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
        title="Smazat úkol"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function TasksTab({ contactId }: { contactId: string }) {
  const { userId: myUserId, role, canDelete } = useCurrentUserRole();
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const titleRef = useRef<HTMLInputElement>(null);
  const latestLoadRequestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const res = await fetchTasks({ contactId, limit: 200 });
      if (requestId !== latestLoadRequestRef.current) return;
      setTasks(sortTasks(res?.data ?? []));
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-lead-tasks-tab',
        message: error instanceof Error ? error.message : 'Failed to load lead tasks',
        meta: { contactId, operation: 'fetch_tasks_lead_tab' },
      });
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onRefresh = () => { void load(); };
    window.addEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    };
  }, [load]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  };

  const handleAdd = async () => {
    const trimmed = coerceTrimmedString(title);
    const normalizedDescription = coerceTrimmedString(description);
    if (!trimmed) return;
    try {
      setSubmitting(true);
      const created = await createTask({
        title: trimmed,
        description: normalizedDescription || undefined,
        dueDate: dueDate || undefined,
        priority,
        status: PENDING_STATUS,
        contactId,
        creatorId: myUserId || undefined,
      });
      setTasks((prev) => sortTasks([created, ...prev]));
      dispatchCrmEvent(CRM_TASKS_REFRESH_EVENT);
      resetForm();
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nepodařilo se přidat úkol');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDone = async (id: string, markDone: boolean) => {
    setTasks((prev) =>
      sortTasks(prev.map((t) => (t.id === id ? { ...t, status: markDone ? DONE_STATUS : PENDING_STATUS } : t))),
    );
    try {
      await updateTask(id, { status: markDone ? DONE_STATUS : PENDING_STATUS });
      dispatchCrmEvent(CRM_TASKS_REFRESH_EVENT);
    } catch (error) {
      logFrontendError({
        area: 'crm-lead-tasks-tab',
        message: error instanceof Error ? error.message : 'Failed to toggle lead task status',
        meta: { contactId, taskId: id, markDone, operation: 'update_task_status_lead_tab' },
      });
      await load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast.error('Mazání úkolů je dostupné pouze pro role admin/manager.');
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_task',
        result: 'denied',
        actorRole: role,
        actorUserId: myUserId || undefined,
        message: 'Mazání úkolů je dostupné pouze pro role admin/manager.',
        meta: { contactId, taskId: id },
      });
      return;
    }
    const prev = tasks;
    setTasks((t) => t.filter((x) => x.id !== id));
    try {
      await deleteTask(id);
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_task',
        result: 'success',
        actorRole: role,
        actorUserId: myUserId || undefined,
        meta: { contactId, taskId: id },
      });
      dispatchCrmEvent(CRM_TASKS_REFRESH_EVENT);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nepodařilo se smazat úkol';
      logFrontendError({
        area: 'crm-lead-tasks-tab',
        message,
        meta: { contactId, taskId: id, operation: 'delete_task_lead_tab' },
      });
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_task',
        result: 'error',
        actorRole: role,
        actorUserId: myUserId || undefined,
        message,
        meta: { contactId, taskId: id },
      });
      setTasks(prev);
      toast.error('Nepodařilo se smazat úkol');
    }
  };

  const pending = tasks.filter((t) => !isDone(t));
  const done = tasks.filter((t) => isDone(t));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Úkoly
          {pending.length > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">({pending.length} aktivní)</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowForm((v) => !v);
              if (!showForm) setTimeout(() => titleRef.current?.focus(), 50);
            }}
          >
            <Plus className="size-3.5 me-1" />
            Přidat úkol
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          <Input
            ref={titleRef}
            placeholder="Název úkolu…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
          <Textarea
            placeholder="Popis (volitelný)…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px] resize-none bg-background"
          />
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Nízká</SelectItem>
                <SelectItem value="medium">Normální</SelectItem>
                <SelectItem value="high">Vysoká</SelectItem>
                <SelectItem value="urgent">Urgentní</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">⌘ + Enter pro uložení</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                Zrušit
              </Button>
              <Button size="sm" variant="mono" disabled={submitting || !title.trim()} onClick={() => void handleAdd()}>
                Přidat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám úkoly…</p>
      ) : (
        <>
          {/* Pending tasks */}
          {pending.length === 0 && !showForm ? (
            <p className="text-sm text-muted-foreground">Žádné aktivní úkoly. Přidejte první výše.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleDone={handleToggleDone}
              onDelete={handleDelete}
              canDelete={canDelete}
            />
              ))}
            </div>
          )}

          {/* Done tasks collapsible */}
          {done.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowDone((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDone ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                Dokončeno ({done.length})
              </button>
              {showDone && (
                <div className="space-y-2">
                  {done.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleDone={handleToggleDone}
                  onDelete={handleDelete}
                  canDelete={canDelete}
                />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
