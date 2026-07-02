import { useCallback, useEffect, useRef, useState } from 'react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
  Phone,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import {
  BackendActivity,
  createNote,
  createTask,
  createActivity,
  deleteActivity,
  fetchActivities,
  updateActivity,
} from '@/crm/services/backend';
import {
  CRM_ACTIVITIES_REFRESH_EVENT,
  CRM_NOTES_REFRESH_EVENT,
  CRM_TASKS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ── type config ──────────────────────────────────────────────────────────────

type ActivityType = 'call' | 'meeting' | 'email' | 'note' | 'task';
const VISIBLE_ACTIVITY_TYPES: ActivityType[] = ['call', 'meeting', 'email', 'note', 'task'];

const TYPE_CONFIG: Record<
  ActivityType,
  { label: string; Icon: React.ElementType; color: string; bg: string }
> = {
  call:    { label: 'Hovor',   Icon: Phone,       color: 'text-green-600',  bg: 'bg-green-100'  },
  meeting: { label: 'Schůzka', Icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-100'   },
  email:   { label: 'Email',   Icon: Mail,        color: 'text-orange-500', bg: 'bg-orange-100' },
  note:    { label: 'Poznámka',Icon: FileText,    color: 'text-purple-600', bg: 'bg-purple-100' },
  task:    { label: 'Úkol',    Icon: CheckSquare, color: 'text-teal-600',   bg: 'bg-teal-100'   },
};

function isVisibleActivityType(type?: string | null): type is ActivityType {
  if (!type) return false;
  return (VISIBLE_ACTIVITY_TYPES as string[]).includes(type);
}

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function withActivityTypePrefix(type: ActivityType, subject: string): string {
  const label = TYPE_CONFIG[type].label;
  const normalized = subject.trim();
  const prefixedPattern = new RegExp(`^${escapeRegExp(label)}\\s*:\\s*`, 'i');
  if (prefixedPattern.test(normalized)) return normalized;
  return `${label}: ${normalized}`;
}

// ── sub-components ────────────────────────────────────────────────────────────

function TypeButton({
  type,
  active,
  onClick,
}: {
  type: ActivityType;
  active: boolean;
  onClick: () => void;
}) {
  const { label, Icon, color, bg } = TYPE_CONFIG[type];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? `${bg} ${color} border-current`
          : 'border-border bg-background text-muted-foreground hover:bg-muted',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function ActivityItem({
  activity,
  onToggleDone,
  onDelete,
  canDelete,
}: {
  activity: BackendActivity;
  onToggleDone: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const type = (activity.type ?? 'note') as ActivityType;
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.note;
  const done = activity.isCompleted ?? false;

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-opacity',
        done && 'opacity-60',
      )}
    >
      {/* Done toggle */}
      <button
        type="button"
        onClick={() => onToggleDone(activity.id, !done)}
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          done
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-border hover:border-green-400',
        )}
        title={done ? 'Označit jako nedokončeno' : 'Označit jako hotovo'}
      >
        {done && <RiCheckboxCircleFill className="size-3" />}
      </button>

      {/* Icon */}
      <span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full', cfg.bg)}>
        <cfg.Icon className={cn('size-3.5', cfg.color)} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium text-foreground', done && 'line-through')}>
          {activity.subject}
        </p>
        {activity.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {activity.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(activity.startDate)}
            </span>
          )}
          {activity.outcome && (
            <span className="italic">"{activity.outcome}"</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(activity.id)}
        disabled={!canDelete}
        className="mt-0.5 hidden shrink-0 text-muted-foreground hover:text-destructive group-hover:flex disabled:cursor-not-allowed disabled:opacity-40"
        title="Smazat aktivitu"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface ActivitiesTabProps {
  contactId: string;
}

export function ActivitiesTab({ contactId }: ActivitiesTabProps) {
  const { userId: myUserId, role, canDelete } = useCurrentUserRole();
  const latestLoadRequestRef = useRef(0);
  const [activities, setActivities] = useState<BackendActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  // New activity form state
  const [selectedType, setSelectedType] = useState<ActivityType>('call');
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadActivities = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const res = await fetchActivities({ contactId, limit: 500 });
      if (requestId !== latestLoadRequestRef.current) return;
      setActivities(res?.data ?? []);
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-lead-activities-tab',
        message: error instanceof Error ? error.message : 'Failed to load lead activities',
        meta: { contactId, operation: 'fetch_activities_lead_tab' },
      });
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  const handleAdd = async () => {
    const normalizedSubject = coerceTrimmedString(subject);
    const normalizedDescription = coerceTrimmedString(description);
    if (!normalizedSubject) {
      toast.error('Zadejte předmět aktivity');
      return;
    }
    const subjectWithType = withActivityTypePrefix(selectedType, normalizedSubject);
    try {
      setSubmitting(true);
      const created = await createActivity({
        type: selectedType,
        subject: subjectWithType,
        description: normalizedDescription || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        contactId,
        isCompleted: false,
        userId: myUserId || undefined,
      });

      if (selectedType === 'note') {
        await createNote({
          content: normalizedDescription || subjectWithType,
          contactId,
          userId: myUserId || undefined,
        });
        dispatchCrmEvent(CRM_NOTES_REFRESH_EVENT);
      }

      if (selectedType === 'task') {
        await createTask({
          title: subjectWithType,
          description: normalizedDescription || undefined,
          dueDate: startDate ? new Date(startDate).toISOString() : undefined,
          contactId,
          creatorId: myUserId || undefined,
          priority: 'medium',
          status: 'todo',
        });
        dispatchCrmEvent(CRM_TASKS_REFRESH_EVENT);
      }

      setActivities((prev) => [created, ...prev]);
      setSubject('');
      setDescription('');
      setStartDate('');
      dispatchCrmEvent(CRM_ACTIVITIES_REFRESH_EVENT);
      toast.custom((t) => (
        <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
          <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
          <AlertTitle>Aktivita přidána</AlertTitle>
        </Alert>
      ));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nepodařilo se přidat aktivitu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDone = async (id: string, done: boolean) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isCompleted: done } : a)),
    );
    try {
      await updateActivity(id, { isCompleted: done });
      dispatchCrmEvent(CRM_ACTIVITIES_REFRESH_EVENT);
    } catch (error) {
      logFrontendError({
        area: 'crm-lead-activities-tab',
        message: error instanceof Error ? error.message : 'Failed to toggle lead activity completion',
        meta: { contactId, activityId: id, done, operation: 'update_activity_completion_lead_tab' },
      });
      // revert
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isCompleted: !done } : a)),
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast.error('Mazání aktivit je dostupné pouze pro role admin/manager.');
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_activity',
        result: 'denied',
        actorRole: role,
        actorUserId: myUserId || undefined,
        message: 'Mazání aktivit je dostupné pouze pro role admin/manager.',
        meta: { contactId, activityId: id },
      });
      return;
    }
    const prev = activities;
    setActivities((a) => a.filter((x) => x.id !== id));
    try {
      await deleteActivity(id);
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_activity',
        result: 'success',
        actorRole: role,
        actorUserId: myUserId || undefined,
        meta: { contactId, activityId: id },
      });
      dispatchCrmEvent(CRM_ACTIVITIES_REFRESH_EVENT);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nepodařilo se smazat aktivitu';
      logFrontendError({
        area: 'crm-lead-activities-tab',
        message,
        meta: { contactId, activityId: id, operation: 'delete_activity_lead_tab' },
      });
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_activity',
        result: 'error',
        actorRole: role,
        actorUserId: myUserId || undefined,
        message,
        meta: { contactId, activityId: id },
      });
      setActivities(prev);
      toast.error('Nepodařilo se smazat aktivitu');
    }
  };

  const visibleActivities = activities.filter((a) => isVisibleActivityType(a.type));
  const pending = visibleActivities.filter((a) => !a.isCompleted);
  const completed = visibleActivities.filter((a) => a.isCompleted);

  return (
    <div className="space-y-5">
      {/* ── Add activity panel ── */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Přidat aktivitu
        </p>
        {/* Type selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_CONFIG) as ActivityType[]).map((t) => (
            <TypeButton
              key={t}
              type={t}
              active={selectedType === t}
              onClick={() => setSelectedType(t)}
            />
          ))}
        </div>

        {/* Form */}
        <Input
          placeholder={`Předmět — ${TYPE_CONFIG[selectedType].label.toLowerCase()}`}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd(); }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Datum a čas</label>
            <Input
              type="datetime-local"
              value={startDate || formatDateInput(new Date().toISOString())}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="mono"
              className="w-full"
              disabled={submitting || !subject.trim()}
              onClick={() => void handleAdd()}
            >
              Přidat aktivitu
            </Button>
          </div>
        </div>

        <Textarea
          placeholder="Popis (volitelné)…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[60px] resize-none"
        />
      </div>

      {/* ── Pending activities ── */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám aktivity…</p>
      ) : pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">Žádné plánované aktivity.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Naplánováno ({pending.length})
          </p>
          {pending.map((a) => (
            <ActivityItem
              key={a.id}
              activity={a}
              onToggleDone={handleToggleDone}
              onDelete={handleDelete}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {/* ── Completed activities ── */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
            onClick={() => setShowCompleted((v) => !v)}
          >
            {showCompleted ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            Dokončeno ({completed.length})
          </button>
          {showCompleted &&
            completed.map((a) => (
              <ActivityItem
                key={a.id}
                activity={a}
                onToggleDone={handleToggleDone}
                onDelete={handleDelete}
                canDelete={canDelete}
              />
            ))}
        </div>
      )}
    </div>
  );
}
