import { useCallback, useEffect, useRef, useState } from 'react';
import { Pin, PinOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import {
  BackendNote,
  createNote,
  deleteNote,
  fetchNotes,
  updateNote,
} from '@/crm/services/backend';
import { CRM_NOTES_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NoteCard({
  note,
  onDelete,
  onTogglePin,
  canDelete,
}: {
  note: BackendNote;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  canDelete: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative rounded-lg border p-3 space-y-1.5 transition-colors',
        note.isPinned ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'border-border bg-card',
      )}
    >
      {note.isPinned && (
        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
          <Pin className="size-2.5" /> Připnuto
        </div>
      )}
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onTogglePin(note.id, !note.isPinned)}
            className="p-1 rounded text-muted-foreground hover:text-amber-600"
            title={note.isPinned ? 'Odepnout' : 'Připnout'}
          >
            {note.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            disabled={!canDelete}
            className="p-1 rounded text-muted-foreground hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
            title="Smazat"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotesTab({ contactId }: { contactId: string }) {
  const { userId: myUserId, role, canDelete } = useCurrentUserRole();
  const [notes, setNotes] = useState<BackendNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestLoadRequestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const res = await fetchNotes({ contactId, limit: 200 });
      const all = res?.data ?? [];
      // Pinned first, then newest
      all.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      if (requestId !== latestLoadRequestRef.current) return;
      setNotes(all);
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-lead-notes-tab',
        message: error instanceof Error ? error.message : 'Failed to load lead notes',
        meta: { contactId, operation: 'fetch_notes_lead_tab' },
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
    window.addEventListener(CRM_NOTES_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_NOTES_REFRESH_EVENT, onRefresh);
    };
  }, [load]);

  const handleAdd = async () => {
    const trimmed = coerceTrimmedString(content);
    if (!trimmed) return;
    try {
      setSubmitting(true);
      const created = await createNote({
        content: trimmed,
        contactId,
        userId: myUserId || undefined,
      });
      setNotes((prev) => [created, ...prev]);
      dispatchCrmEvent(CRM_NOTES_REFRESH_EVENT);
      setContent('');
      textareaRef.current?.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nepodařilo se přidat poznámku');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast.error('Mazání poznámek je dostupné pouze pro role admin/manager.');
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_note',
        result: 'denied',
        actorRole: role,
        actorUserId: myUserId || undefined,
        message: 'Mazání poznámek je dostupné pouze pro role admin/manager.',
        meta: { contactId, noteId: id },
      });
      return;
    }
    const prev = notes;
    setNotes((n) => n.filter((x) => x.id !== id));
    try {
      await deleteNote(id);
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_note',
        result: 'success',
        actorRole: role,
        actorUserId: myUserId || undefined,
        meta: { contactId, noteId: id },
      });
      dispatchCrmEvent(CRM_NOTES_REFRESH_EVENT);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nepodařilo se smazat poznámku';
      logFrontendError({
        area: 'crm-lead-notes-tab',
        message,
        meta: { contactId, noteId: id, operation: 'delete_note_lead_tab' },
      });
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_note',
        result: 'error',
        actorRole: role,
        actorUserId: myUserId || undefined,
        message,
        meta: { contactId, noteId: id },
      });
      setNotes(prev);
      toast.error('Nepodařilo se smazat poznámku');
    }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, isPinned: pinned } : n))
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
    );
    try {
      await updateNote(id, { isPinned: pinned });
      dispatchCrmEvent(CRM_NOTES_REFRESH_EVENT);
    } catch (error) {
      logFrontendError({
        area: 'crm-lead-notes-tab',
        message: error instanceof Error ? error.message : 'Failed to toggle pin on lead note',
        meta: { contactId, noteId: id, pinned, operation: 'update_note_pin_lead_tab' },
      });
      await load();
    }
  };

  return (
    <div className="space-y-4">
      {/* Compose */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Napište poznámku k tomuto leadu…"
          className="min-h-[80px] resize-none bg-background"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void handleAdd();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">⌘ + Enter pro uložení</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="mono"
              disabled={submitting || !content.trim()}
              onClick={() => void handleAdd()}
            >
              Přidat poznámku
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám poznámky…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Žádné poznámky. Napište první výše.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
