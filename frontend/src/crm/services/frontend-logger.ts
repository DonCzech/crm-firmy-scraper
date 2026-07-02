export type FrontendLogLevel = 'info' | 'warn' | 'error';

export const FRONTEND_LOG_STORAGE_KEY = 'crm-frontend-logs-v1';
export const FRONTEND_LOG_REFRESH_EVENT = 'crm:frontend-logs:refresh';

export type FrontendLogPayload = {
  area: string;
  message: string;
  correlationId?: string;
  meta?: Record<string, unknown>;
};

export type FrontendLogEntry = FrontendLogPayload & {
  ts: string;
  level: FrontendLogLevel;
  correlationId: string;
};

function readLogs(): FrontendLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FRONTEND_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FrontendLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogs(items: FrontendLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FRONTEND_LOG_STORAGE_KEY, JSON.stringify(items.slice(0, 1000)));
    window.dispatchEvent(new CustomEvent(FRONTEND_LOG_REFRESH_EVENT));
  } catch {
    // ignore storage errors
  }
}

function createFrontendCorrelationId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `crmfe-log-${ts}-${rnd}`;
}

function normalizeCorrelationId(value: string | undefined): string {
  const normalized = String(value || '').trim();
  return normalized || createFrontendCorrelationId();
}

export function logFrontendEvent(level: FrontendLogLevel, payload: FrontendLogPayload): void {
  const entry: FrontendLogEntry = {
    ts: new Date().toISOString(),
    level,
    ...payload,
    correlationId: normalizeCorrelationId(payload.correlationId),
  };
  writeLogs([entry, ...readLogs()]);

  if (level === 'error') {
    console.error('[CRM_FE]', entry);
    return;
  }
  if (level === 'warn') {
    console.warn('[CRM_FE]', entry);
    return;
  }
  console.info('[CRM_FE]', entry);
}

export function logFrontendError(payload: FrontendLogPayload): void {
  logFrontendEvent('error', payload);
}

export function getFrontendLogs(limit = 200): FrontendLogEntry[] {
  return readLogs().slice(0, Math.max(1, limit));
}

export function clearFrontendLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(FRONTEND_LOG_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(FRONTEND_LOG_REFRESH_EVENT));
  } catch {
    // ignore storage errors
  }
}
