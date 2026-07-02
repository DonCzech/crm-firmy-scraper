const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const LOCAL_API_URL = 'http://localhost:3001/api';
const LOCAL_API_FALLBACK_URLS = [LOCAL_API_URL, 'http://127.0.0.1:3001/api', 'http://[::1]:3001/api'];
const SAME_ORIGIN_API_URL = '/api';
const fallbackApiUrl = 'https://online-odhad-api.vercel.app/api';
const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname.toLowerCase());

const API_BASE_URL = (
  isLocalHost
    ? LOCAL_API_URL
    : SAME_ORIGIN_API_URL || (envApiUrl && envApiUrl.length > 0 ? envApiUrl : fallbackApiUrl)
).replace(/\/+$/, '');

const TOKEN_KEYS = ['crm_access_token', 'accessToken', 'token', 'auth_token'];

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ListResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    syncWarning?: string;
    syncProtocol?: 'imap' | 'pop3';
    syncWarningUpdatedAt?: string;
  };
}

export interface BackendMailMessage {
  id: string;
  userId?: string | null;
  folder: string;
  subject: string;
  body: string;
  fromName?: string | null;
  fromEmail: string;
  toEmail: string;
  cc?: string | null;
  bcc?: string | null;
  isRead: boolean;
  isStarred: boolean;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedMailDraft {
  subject: string;
  content: string;
}

export interface BackendMailAccount {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatar?: string | null;
  imapHost?: string | null;
  imapPort?: number | null;
  imapSecure?: boolean;
  imapUsername?: string | null;
  imapPassword?: string | null;
  pop3Host?: string | null;
  pop3Port?: number | null;
  pop3Secure?: boolean;
  pop3Username?: string | null;
  pop3Password?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUsername?: string | null;
  smtpPassword?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendMailAccountConnectionTest {
  accountId: string;
  email: string;
  inbound: {
    protocol: 'imap' | 'pop3';
    ok: boolean;
    message: string;
  };
  smtp: {
    ok: boolean;
    message: string;
  };
  ok: boolean;
}

let cachedToken: string | null = null;
let authPromise: Promise<string | null> | null = null;

function readTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    for (const key of TOKEN_KEYS) {
      const token = window.localStorage.getItem(key);
      if (token) return token;
    }
  } catch {
    return null;
  }
  return null;
}

function clearPersistedToken(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of TOKEN_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore storage failures
  }
}

async function autoLogin(): Promise<string | null> {
  return null;
}

async function ensureToken(): Promise<string | null> {
  const stored = cachedToken ?? readTokenFromStorage();
  if (stored) {
    cachedToken = stored;
    return stored;
  }

  if (!authPromise) {
    authPromise = autoLogin().finally(() => {
      authPromise = null;
    });
  }
  return authPromise;
}

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const doFetch = async (token: string | null) => {
    const targets = isLocalHost ? LOCAL_API_FALLBACK_URLS : [API_BASE_URL];
    let lastError: unknown = null;

    for (const baseUrl of targets) {
      try {
        return await fetch(`${baseUrl}${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
      } catch (error) {
        lastError = error;
      }
    }

    if (isLocalHost) {
      throw new Error(`Backend API is not reachable. Tried: ${LOCAL_API_FALLBACK_URLS.join(', ')}`);
    }
    throw new Error(
      lastError instanceof Error ? lastError.message : `Backend API is not reachable on ${API_BASE_URL}`,
    );
  };

  const token = await ensureToken();
  const response = await doFetch(token);

  if (response.status === 401) {
    cachedToken = null;
    clearPersistedToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('crm-auth:unauthorized'));
    }
  }

  if (!response.ok) {
    let details = '';
    try {
      const payload = (await response.json()) as { message?: string | string[]; error?: string };
      if (Array.isArray(payload?.message)) details = payload.message.join(', ');
      else if (typeof payload?.message === 'string') details = payload.message;
      else if (typeof payload?.error === 'string') details = payload.error;
    } catch {
      details = '';
    }
    throw new Error(
      `API ${method} ${path} failed (${response.status})${details ? `: ${details}` : ''}`,
    );
  }

  return (await response.json()) as T;
}

async function requestWithTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

export async function fetchMailMessages(params?: {
  folder?: string;
  page?: number;
  limit?: number;
  search?: string;
  accountEmail?: string;
}) {
  const folder = params?.folder ?? 'inbox';
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;
  const search = params?.search ? `&search=${encodeURIComponent(params.search)}` : '';
  const accountEmail = params?.accountEmail ? `&accountEmail=${encodeURIComponent(params.accountEmail)}` : '';
  return request<ListResponse<BackendMailMessage>>(
    `/mail/messages?folder=${encodeURIComponent(folder)}&page=${page}&limit=${limit}${search}${accountEmail}`,
  );
}

export async function fetchMailMessageById(id: string) {
  return request<BackendMailMessage>(`/mail/messages/${id}`);
}

export async function createMailMessage(payload: {
  folder?: string;
  subject?: string;
  body?: string;
  fromName?: string;
  fromEmail?: string;
  toEmail?: string;
  cc?: string;
  bcc?: string;
  priority?: string;
  isRead?: boolean;
  isStarred?: boolean;
}) {
  return request<BackendMailMessage>('/mail/messages', 'POST', payload);
}

export async function updateMailMessage(
  id: string,
  payload: {
    folder?: string;
    subject?: string;
    body?: string;
    toEmail?: string;
    cc?: string;
    bcc?: string;
    priority?: string;
    isRead?: boolean;
    isStarred?: boolean;
  },
) {
  return request<BackendMailMessage>(`/mail/messages/${id}`, 'PATCH', payload);
}

export async function deleteMailMessage(id: string) {
  return request<{ success: boolean }>(`/mail/messages/${id}`, 'DELETE');
}

export async function generateMailDraft(payload: {
  toEmail?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
}) {
  return request<GeneratedMailDraft>('/mail/generate', 'POST', payload);
}

export async function fetchMailAccounts() {
  return request<BackendMailAccount[]>('/mail/accounts');
}

export async function addMailAccount(payload: {
  email: string;
  name?: string;
  avatar?: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  imapUsername?: string;
  imapPassword?: string;
  pop3Host?: string;
  pop3Port?: number;
  pop3Secure?: boolean;
  pop3Username?: string;
  pop3Password?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
}) {
  return request<BackendMailAccount>('/mail/accounts', 'POST', payload);
}

export async function updateMailAccount(
  id: string,
  payload: {
    email?: string;
    name?: string;
    avatar?: string;
    imapHost?: string;
    imapPort?: number;
    imapSecure?: boolean;
    imapUsername?: string;
    imapPassword?: string;
    pop3Host?: string;
    pop3Port?: number;
    pop3Secure?: boolean;
    pop3Username?: string;
    pop3Password?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUsername?: string;
    smtpPassword?: string;
  },
) {
  return request<BackendMailAccount>(`/mail/accounts/${encodeURIComponent(id)}`, 'PATCH', payload);
}

export async function deleteMailAccount(id: string) {
  return request<{ success: boolean }>(`/mail/accounts/${encodeURIComponent(id)}`, 'DELETE');
}

export async function testMailAccountConnection(id: string) {
  return requestWithTimeout(
    request<BackendMailAccountConnectionTest>(`/mail/accounts/${encodeURIComponent(id)}/test`, 'POST'),
    20000,
    'Test spojení vypršel (timeout). Zkontroluj host/port/secure a zkus znovu.',
  );
}
