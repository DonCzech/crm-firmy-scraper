import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CheckSquare,
  FileText,
  Mail,
  Phone,
  UserCheck,
  Users,
} from 'lucide-react';
import { BackendActivity, fetchActivities } from '@/crm/services/backend';
import { LeadMergeAuditPanel } from '@/crm/components/lead-merge-audit-panel';
import { CRM_ACTIVITIES_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { cn } from '@/lib/utils';

type ActivityType = 'call' | 'meeting' | 'email' | 'note' | 'task';

const TYPE_CONFIG: Record<
  ActivityType | string,
  { label: string; Icon: React.ElementType; color: string; bg: string }
> = {
  call:    { label: 'Hovor',    Icon: Phone,       color: 'text-green-600',  bg: 'bg-green-100'  },
  meeting: { label: 'Schůzka',  Icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-100'   },
  email:   { label: 'Email',    Icon: Mail,        color: 'text-orange-500', bg: 'bg-orange-100' },
  note:    { label: 'Poznámka', Icon: FileText,    color: 'text-purple-600', bg: 'bg-purple-100' },
  task:    { label: 'Úkol',     Icon: CheckSquare, color: 'text-teal-600',   bg: 'bg-teal-100'   },
  created: { label: 'Vytvoření',Icon: UserCheck,   color: 'text-gray-500',   bg: 'bg-gray-100'   },
  updated: { label: 'Změna',    Icon: Calendar,    color: 'text-gray-500',   bg: 'bg-gray-100'   },
};

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface HistoryEntry {
  id: string;
  type: string;
  subject: string;
  description?: string | null;
  outcome?: string | null;
  isCompleted?: boolean;
  createdAt: string;
  user?: BackendActivity['user'];
}

interface HistoryTabProps {
  contactId: string;
  contactCreatedAt?: string;
}

function getAccountLabel(user?: BackendActivity['user']): string {
  if (!user) return '';
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (fullName) return fullName;
  return user.email ?? '';
}

function stripLegacyActorPrefix(description?: string | null): string {
  if (!description) return '';
  return description
    .replace(/^Upravil:\s.*(?:\r?\n|$)/, '')
    .replace(/^Upravil účet:\s.*(?:\r?\n|$)/, '')
    .trim();
}

function getActorLabelPrefix(type: string): string {
  if (type === 'created') return 'Vytvořil';
  if (type === 'updated') return 'Upravil';
  return 'Přidal';
}

export function HistoryTab({ contactId, contactCreatedAt }: HistoryTabProps) {
  const latestLoadRequestRef = useRef(0);
  const [activities, setActivities] = useState<BackendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const res = await fetchActivities({ contactId, limit: 500 });
      if (requestId !== latestLoadRequestRef.current) return;
      setActivities(res?.data ?? []);
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-lead-history-tab',
        message: error instanceof Error ? error.message : 'Failed to load lead history activities',
        meta: { contactId, operation: 'fetch_activities_history_tab' },
      });
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    void load();
    const onRefresh = () => { void load(); };
    window.addEventListener(CRM_ACTIVITIES_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_ACTIVITIES_REFRESH_EVENT, onRefresh);
    };
  }, [load]);

  // Build combined timeline
  const entries: HistoryEntry[] = [
    // Activities
    ...activities.map((a) => ({
      id: a.id,
      type: a.type ?? 'note',
      subject: a.subject,
      description: a.description,
      outcome: a.outcome,
      isCompleted: a.isCompleted,
      createdAt: a.startDate ?? a.createdAt ?? new Date().toISOString(),
      user: a.user,
    })),
    // Lead created event
    ...(contactCreatedAt
      ? [{
          id: 'created',
          type: 'created',
          subject: 'Lead vytvořil',
          description: null,
          outcome: null,
          isCompleted: true,
          createdAt: contactCreatedAt,
        }]
      : []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return <p className="text-sm text-muted-foreground">Načítám historii…</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-3">
        <LeadMergeAuditPanel contactId={contactId} />
        <p className="text-sm text-muted-foreground">
          Historie je prázdná. Přidejte první aktivitu v záložce Aktivity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <LeadMergeAuditPanel contactId={contactId} />
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-0">
          {entries.map((entry, idx) => {
            const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.note;
            const isLast = idx === entries.length - 1;
            const accountLabel = getAccountLabel(entry.user);
            const actorLabelPrefix = getActorLabelPrefix(entry.type);
            const normalizedDescription = stripLegacyActorPrefix(entry.description);

            return (
              <div key={entry.id} className={cn('relative flex gap-4', !isLast && 'pb-5')}>
                {/* Icon bubble */}
                <span
                  className={cn(
                    'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-background',
                    cfg.bg,
                  )}
                >
                  <cfg.Icon className={cn('size-4', cfg.color)} />
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium text-foreground',
                          entry.isCompleted && entry.type !== 'created' && 'line-through opacity-70',
                        )}
                      >
                        {entry.subject}
                      </p>
                      {accountLabel && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {actorLabelPrefix}: {accountLabel}
                        </p>
                      )}
                      {normalizedDescription && (
                        <p className="mt-0.5 text-xs text-muted-foreground whitespace-pre-line">{normalizedDescription}</p>
                      )}
                      {entry.outcome && (
                        <p className="mt-0.5 text-xs italic text-muted-foreground">
                          Výsledek: {entry.outcome}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </span>
                      {entry.isCompleted && entry.type !== 'created' && (
                        <p className="text-[10px] text-green-600 font-medium">Dokončeno</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
