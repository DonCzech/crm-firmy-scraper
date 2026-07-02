import { useCallback, useEffect, useState } from 'react';
import { GitMerge } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import {
  clearLeadMergeAuditForContact,
  getLeadMergeAuditForContact,
  LEAD_MERGE_AUDIT_REFRESH_EVENT,
  type LeadMergeAuditEntry,
} from '@/crm/services/lead-merge-audit';
import { Button } from '@/components/ui/button';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LeadMergeAuditPanel({ contactId }: { contactId: string }) {
  const { role, canManageSensitiveActions } = useCurrentUserRole();
  const [items, setItems] = useState<LeadMergeAuditEntry[]>([]);

  const load = useCallback(() => {
    setItems(getLeadMergeAuditForContact(contactId).slice(0, 20));
  }, [contactId]);

  useEffect(() => {
    load();
    window.addEventListener(LEAD_MERGE_AUDIT_REFRESH_EVENT, load);
    return () => {
      window.removeEventListener(LEAD_MERGE_AUDIT_REFRESH_EVENT, load);
    };
  }, [load]);

  if (items.length === 0) return null;

  return (
    <div className="rounded-sm border border-[#d7dde7] bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitMerge className="size-4 text-[#0ea5e9]" />
          <h3 className="text-sm font-semibold text-foreground">Audit log sloučení leadů</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex rounded border px-2 py-0.5 text-[11px] text-muted-foreground">
            Role: {role}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!canManageSensitiveActions}
            onClick={async () => {
              if (!canManageSensitiveActions) {
                toast.error('Export auditu je dostupný pouze pro role admin/manager.');
                return;
              }
              try {
                await navigator.clipboard.writeText(JSON.stringify(items, null, 2));
                toast.success('Audit byl zkopírován do schránky (JSON).');
              } catch {
                toast.error('Export do schránky selhal.');
              }
            }}
          >
            Export JSON
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!canManageSensitiveActions}
            onClick={() => {
              if (!canManageSensitiveActions) {
                toast.error('Mazání auditu je dostupné pouze pro role admin/manager.');
                return;
              }
              clearLeadMergeAuditForContact(contactId);
              toast.success('Audit pro tento kontakt byl vymazán.');
            }}
          >
            Vymazat audit
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((entry) => (
          <div key={entry.id} className="rounded-md border border-border p-2">
            <div className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</div>
            <p className="text-sm">
              Primární: <span className="font-medium">{entry.primaryLeadName || 'Lead'}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Sloučeno: {entry.mergedLeadNames.length > 0 ? entry.mergedLeadNames.join(', ') : `${entry.mergedLeadIds.length} záznamů`}
            </p>
            <p className="text-xs text-muted-foreground">Pravidlo: {entry.ruleKey}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
