export const LEAD_MERGE_AUDIT_KEY = 'crm-lead-merge-audit-v1';
export const LEAD_MERGE_AUDIT_REFRESH_EVENT = 'crm:leads:merge-audit:refresh';

export interface LeadMergeAuditEntry {
  id: string;
  createdAt: string;
  primaryLeadId: string;
  primaryLeadName: string;
  mergedLeadIds: string[];
  mergedLeadNames: string[];
  ruleKey: string;
  actor: string;
}

interface AppendLeadMergeAuditInput {
  primaryLeadId: string;
  primaryLeadName: string;
  mergedLeadIds: string[];
  mergedLeadNames: string[];
  ruleKey: string;
  actor?: string;
}

function readAll(): LeadMergeAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LEAD_MERGE_AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeadMergeAuditEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeAll(items: LeadMergeAuditEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEAD_MERGE_AUDIT_KEY, JSON.stringify(items.slice(0, 500)));
    window.dispatchEvent(new CustomEvent(LEAD_MERGE_AUDIT_REFRESH_EVENT));
  } catch {
    // ignore localStorage errors
  }
}

export function appendLeadMergeAudit(input: AppendLeadMergeAuditInput) {
  const current = readAll();
  const entry: LeadMergeAuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    primaryLeadId: input.primaryLeadId,
    primaryLeadName: input.primaryLeadName,
    mergedLeadIds: input.mergedLeadIds,
    mergedLeadNames: input.mergedLeadNames,
    ruleKey: input.ruleKey,
    actor: input.actor ?? 'Uživatel',
  };
  writeAll([entry, ...current]);
}

export function getLeadMergeAuditForContact(contactId: string): LeadMergeAuditEntry[] {
  if (!contactId) return [];
  return readAll()
    .filter((entry) => entry.primaryLeadId === contactId || entry.mergedLeadIds.includes(contactId))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function clearLeadMergeAuditForContact(contactId: string) {
  if (!contactId) return;
  const next = readAll().filter(
    (entry) => entry.primaryLeadId !== contactId && !entry.mergedLeadIds.includes(contactId),
  );
  writeAll(next);
}
