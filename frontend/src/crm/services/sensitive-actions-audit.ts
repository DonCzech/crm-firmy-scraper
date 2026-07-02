export const SENSITIVE_ACTIONS_AUDIT_KEY = 'crm-sensitive-actions-audit-v1';
export const SENSITIVE_ACTIONS_AUDIT_REFRESH_EVENT = 'crm:sensitive-actions:audit:refresh';

export type SensitiveActionResult = 'success' | 'error' | 'denied';

export interface SensitiveActionAuditEntry {
  id: string;
  createdAt: string;
  area: string;
  action: string;
  result: SensitiveActionResult;
  actorRole?: string;
  actorUserId?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

function readAll(): SensitiveActionAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SENSITIVE_ACTIONS_AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SensitiveActionAuditEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeAll(items: SensitiveActionAuditEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SENSITIVE_ACTIONS_AUDIT_KEY, JSON.stringify(items.slice(0, 1000)));
    window.dispatchEvent(new CustomEvent(SENSITIVE_ACTIONS_AUDIT_REFRESH_EVENT));
  } catch {
    // ignore localStorage issues
  }
}

export function appendSensitiveActionAudit(
  input: Omit<SensitiveActionAuditEntry, 'id' | 'createdAt'>,
): void {
  const entry: SensitiveActionAuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    area: input.area,
    action: input.action,
    result: input.result,
    actorRole: input.actorRole,
    actorUserId: input.actorUserId,
    message: input.message,
    meta: input.meta,
  };
  writeAll([entry, ...readAll()]);
}

export function getSensitiveActionsAudit(limit = 200): SensitiveActionAuditEntry[] {
  return readAll().slice(0, Math.max(1, limit));
}
