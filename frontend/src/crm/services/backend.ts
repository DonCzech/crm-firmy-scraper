import { logFrontendError } from './frontend-logger';

const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const LOCAL_API_URL = 'http://localhost:3001/api';
const LOCAL_API_FALLBACK_URLS = [LOCAL_API_URL, 'http://127.0.0.1:3001/api', 'http://[::1]:3001/api'];
const SAME_ORIGIN_API_URL = '/api';
const REMOTE_API_URL = 'https://online-odhad-api.vercel.app/api';
const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname.toLowerCase());

const API_BASE_CANDIDATES = Array.from(
  new Set(
    (isLocalHost
      ? [
          LOCAL_API_URL,
          envApiUrl && envApiUrl.length > 0 ? envApiUrl : null,
          REMOTE_API_URL,
        ]
      : [
          SAME_ORIGIN_API_URL,
          envApiUrl && envApiUrl.length > 0 ? envApiUrl : null,
          REMOTE_API_URL,
          LOCAL_API_URL,
        ])
      .filter((v): v is string => Boolean(v))
      .map((v) => v.replace(/\/+$/, '')),
  ),
);
let ACTIVE_API_BASE_URL = API_BASE_CANDIDATES[0] ?? LOCAL_API_URL;

const TOKEN_KEYS = ['crm_access_token', 'accessToken', 'token', 'auth_token'];

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ListResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface BackendUserRef {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string | null;
}

export interface BackendContact {
  id: string;
  firstName: string;
  lastName: string;
  contactType?: string;
  email?: string;
  phone?: string;
  title?: string;
  city?: string;
  state?: string;
  country?: string;
  companyId?: string;
  company?: { id: string; name: string } | null;
  owner?: BackendUserRef | null;
  createdAt: string;
  updatedAt: string;
}

type ContactPayload = {
  firstName: string;
  lastName: string;
  contactType?: 'lead' | 'customer' | 'partner' | 'vendor';
  source?: string;
  status?: 'active' | 'inactive' | 'archived';
  email?: string;
  phone?: string;
  title?: string;
  companyId?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

export interface BackendCompany {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  contacts?: Array<{ id: string; firstName?: string; lastName?: string }>;
  deals?: Array<{ id: string; title?: string; value?: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface BackendDeal {
  id: string;
  title: string;
  value?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  description?: string;
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  company?: {
    id: string;
    name?: string;
  } | null;
  owner?: BackendUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendDealsForecast {
  period: string;
  days: number;
  summary: {
    openDealsCount: number;
    wonDealsInPeriodCount: number;
    totalOpenValue: number;
    weightedForecast: number;
    wonValueInPeriod: number;
  };
  goals: {
    monthlyTarget: number;
    quarterlyTarget: number;
  };
  progress: {
    monthlyPct: number;
    quarterlyPct: number;
  };
  byOwner: Array<{
    ownerId: string;
    openValue: number;
    weighted: number;
    wonValue: number;
  }>;
}

export interface BackendDealNextAction {
  dealId: string;
  dealTitle: string;
  stage?: string | null;
  code: string;
  priority: 'low' | 'medium' | 'high';
  label: string;
  reason: string;
  daysSinceUpdate: number;
}

export interface BackendTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  assignee?: BackendUserRef | null;
  creator?: BackendUserRef | null;
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendOrderItem {
  id: string;
  orderId: string;
  productName: string;
  sku?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  trendLabel?: string;
  trendVariant?: string;
  stock?: number;
  reserved?: number;
  thresholdLevel?: number;
  supplierName?: string;
  supplierLogo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderDate: string;
  currency: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: string;
  deliveryStatus: string;
  carrierName?: string;
  carrierLogo?: string;
  category?: string;
  notes?: string;
  items: BackendOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendInvoiceItem {
  productName: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string | null;
}

export interface BackendInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'issued' | 'paid' | 'overdue' | 'cancelled';
  items: BackendInvoiceItem[];
  createdAt: string;
  updatedAt: string;
  createdNew?: boolean;
}

export interface BackendProduct {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  barcode?: string | null;
  price: number;
  status: string;
  featured?: boolean;
  image?: string | null;
  images?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendNote {
  id: string;
  content: string;
  isPinned?: boolean;
  user?: BackendUserRef | null;
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
  } | null;
  company?: {
    id: string;
    name?: string;
  } | null;
  deal?: {
    id: string;
    title?: string;
    stage?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendActivity {
  id: string;
  type?: string;
  subject: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  outcome?: string;
  isCompleted?: boolean;
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  deal?: {
    id: string;
    title?: string;
    stage?: string;
  } | null;
  user?: BackendUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: string | null;
  userId: string;
  createdAt: string;
}

export interface BackendChatRoom {
  id: string;
  name: string;
  description?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  membersCount?: number;
}

export interface BackendChatMessage {
  id: string;
  roomId: string;
  userId?: string | null;
  content: string;
  createdAt: string;
  user?: BackendUserRef | null;
}

export interface CalendarSyncStatus {
  connected: boolean;
  provider: string;
  appleId?: string;
  calendarName?: string | null;
  calendarUrl?: string | null;
  lastSyncAt?: string | null;
  lastError?: string | null;
  trackedEvents?: number;
}

export interface AppleCalendarOption {
  name: string;
  url: string;
}

export interface BackendDashboard {
  totalContacts: number;
  totalDeals: number;
  dealsByStage: Record<string, number>;
  recentActivities: Array<{ id: string; type?: string; subject?: string; createdAt: string }>;
  upcomingTasks: Array<{ id: string; title?: string; dueDate?: string; status?: string }>;
  revenue: number;
}

export interface BackendMe {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatar?: string | null;
  isActive?: boolean;
  company?: {
    id: string;
    name: string;
    slug?: string;
    logo?: string | null;
    plan?: string;
  } | null;
}

export interface BackendModuleOverviewModel {
  model: string;
  status: 'ok' | 'error';
  count: number | null;
  error?: string | null;
}

export interface BackendModuleOverviewItem {
  id: string;
  name: string;
  description: string;
  path: string;
  isEnabled: boolean;
  runtimeStatus: 'bezi' | 'vypnuto' | 'chyba';
  checkedAt: string;
  health?: {
    api?: { status: 'ok' | 'error'; detail: string };
    db?: { status: 'ok' | 'error'; detail: string };
    lastError?: {
      path: string;
      message: string;
      status: number | null;
      createdAt: string;
    } | null;
  };
  models: BackendModuleOverviewModel[];
}

export interface BackendModulesOverview {
  tenantId: string;
  checkedAt: string;
  totals: {
    modules: number;
    enabled: number;
    running: number;
    errors: number;
    disabled: number;
    prismaModels: number;
    prismaModelErrors: number;
  };
  modules: BackendModuleOverviewItem[];
  models: BackendModuleOverviewModel[];
}

export interface BackendSharedDashboard {
  id: string;
  name: string;
  ownerUserId: string;
  isOwner: boolean;
  sharedUserIds: string[];
  sharedRoles: string[];
  widgetsOrder: string[];
  widgetsHidden: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCustomField {
  id: string;
  entityType: string;
  fieldName: string;
  fieldType: string;
  fieldLabel: string;
  placeholder?: string;
  options?: string;
  required?: boolean;
  sortOrder?: number;
  moduleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCustomFieldValue {
  id: string;
  fieldId: string;
  value: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  createdAt: string;
  updatedAt: string;
  field?: BackendCustomField;
}

let cachedToken: string | null = null;

function createCorrelationId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `crmfe-${ts}-${rnd}`;
}

function withCommonHeaders(
  headers: Record<string, string>,
  correlationId: string,
): Record<string, string> {
  return {
    ...headers,
    'x-correlation-id': correlationId,
  };
}

async function readErrorDetails(response: Response): Promise<string> {
  try {
    const errorPayload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(errorPayload?.message)) {
      return errorPayload.message.join(', ');
    }
    if (typeof errorPayload?.message === 'string') {
      return errorPayload.message;
    }
    if (typeof errorPayload?.error === 'string') {
      return errorPayload.error;
    }
  } catch {
    // noop
  }
  return '';
}

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed.length > 0) return trimmed;
      }
    }
  }
  return undefined;
}

function normalizeEnumString<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  const candidate = firstString(value);
  if (!candidate) return undefined;
  return allowed.includes(candidate as T) ? (candidate as T) : undefined;
}

function optionalString(value: unknown): string | undefined {
  return firstString(value);
}

function normalizeOptionalId(value: unknown): string | undefined {
  const normalized = firstString(value);
  if (!normalized) return undefined;
  const lower = normalized.toLowerCase();
  if (
    lower === '__none__' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === '__unassigned__'
  ) {
    return undefined;
  }
  return normalized;
}

function optionalIsoDateString(value: unknown): string | undefined {
  const normalized = firstString(value);
  if (!normalized) return undefined;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function normalizeNullableId(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = normalizeOptionalId(value);
  return normalized ?? null;
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (Array.isArray(value) && value.length === 0) return null;
  const normalized = firstString(value);
  if (!normalized) return undefined;
  const lower = normalized.toLowerCase();
  if (lower === '__none__' || lower === 'none') return null;
  if (lower === 'null') return null;
  if (lower === 'undefined' || lower === '__unassigned__') return null;
  return normalized;
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    if (!normalized) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizePositiveInteger(value: unknown, fallback: number, min = 1): number {
  const parsed = optionalNumber(value);
  if (parsed === undefined) return fallback;
  const normalized = Math.floor(parsed);
  return normalized >= min ? normalized : fallback;
}

function optionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  const normalized = firstString(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return undefined;
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .map((item) => firstString(item))
    .filter((item): item is string => Boolean(item));
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeTaskStatus(
  value: unknown,
): 'todo' | 'in_progress' | 'done' | 'cancelled' | undefined {
  const normalized = firstString(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized === 'in_progress') return 'in_progress';
  if (normalized === 'done' || normalized === 'completed') return 'done';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';
  if (normalized === 'todo' || normalized === 'pending') return 'todo';
  return undefined;
}

function normalizeTaskPriority(
  value: unknown,
): 'low' | 'medium' | 'high' | 'urgent' | undefined {
  const normalized = firstString(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized === 'low' || normalized === 'medium' || normalized === 'high' || normalized === 'urgent') {
    return normalized;
  }
  return undefined;
}

function normalizeTaskTitle(value: unknown, required = false): string | undefined {
  const normalized = firstString(value)?.slice(0, 160);
  if (required && !normalized) {
    throw new Error('Název úkolu je povinný.');
  }
  return normalized;
}

function normalizeTaskMutationPayload(
  payload: {
    title?: string | string[];
    description?: string | string[];
    dueDate?: string | string[];
    dueAt?: string | string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'todo' | 'in_progress' | 'done' | 'cancelled' | 'pending' | 'completed';
    assigneeId?: string | string[] | null;
    creatorId?: string | string[] | null;
    contactId?: string | string[] | null;
    dealId?: string | string[] | null;
  },
  options?: {
    requireTitle?: boolean;
    includeCreatorId?: boolean;
  },
): {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'done' | 'cancelled';
  assigneeId?: string | null;
  creatorId?: string;
  contactId?: string | null;
  dealId?: string | null;
} {
  const requireTitle = options?.requireTitle === true;
  const includeCreatorId = options?.includeCreatorId === true;
  return {
    title: normalizeTaskTitle(payload.title, requireTitle),
    description: optionalString(payload.description),
    dueDate: optionalIsoDateString(payload.dueDate ?? payload.dueAt),
    priority: normalizeTaskPriority(payload.priority),
    status: normalizeTaskStatus(payload.status),
    assigneeId: normalizeNullableId(payload.assigneeId),
    creatorId: includeCreatorId ? normalizeOptionalId(payload.creatorId) : undefined,
    contactId: normalizeNullableId(payload.contactId),
    dealId: normalizeNullableId(payload.dealId),
  };
}

function normalizeDealTitle(value: unknown, required = false): string | undefined {
  const normalized = firstString(value)?.slice(0, 160);
  if (required && !normalized) {
    throw new Error('Název obchodu je povinný.');
  }
  return normalized;
}

function normalizeDealMutationPayload(
  payload: {
    title?: string | string[];
    value?: number | string;
    currency?: string | string[];
    stage?: string | string[];
    probability?: number | string;
    expectedCloseDate?: string | string[];
    actualCloseDate?: string | string[];
    description?: string | string[];
    contactId?: string | string[] | null;
    companyId?: string | string[] | null;
    ownerId?: string | string[] | null;
  },
  options?: { requireTitle?: boolean },
): {
  title?: string;
  value?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  description?: string;
  contactId?: string | null;
  companyId?: string | null;
  ownerId?: string | null;
} {
  return {
    title: normalizeDealTitle(payload.title, options?.requireTitle === true),
    value: optionalNumber(payload.value),
    currency: optionalString(payload.currency),
    stage: optionalString(payload.stage),
    probability: optionalNumber(payload.probability),
    expectedCloseDate: optionalIsoDateString(payload.expectedCloseDate),
    actualCloseDate: optionalIsoDateString(payload.actualCloseDate),
    description: optionalString(payload.description),
    contactId: normalizeNullableId(payload.contactId),
    companyId: normalizeNullableId(payload.companyId),
    ownerId: normalizeNullableId(payload.ownerId),
  };
}

function normalizeHelpdeskTitle(value: unknown, required = false): string | undefined {
  const normalized = firstString(value)?.slice(0, 200);
  if (required && !normalized) {
    throw new Error('Název ticketu je povinný.');
  }
  return normalized;
}

function normalizeHelpdeskClientName(value: unknown, required = false): string | undefined {
  const normalized = firstString(value)?.slice(0, 200);
  if (required && !normalized) {
    throw new Error('Název klienta je povinný.');
  }
  return normalized;
}

function normalizeHelpdeskTicketPayload(
  payload: {
    title?: string | string[];
    clientName?: string | string[];
    clientEmail?: string | string[] | null;
    clientPhone?: string | string[] | null;
    category?: string | string[];
    priority?: string | string[];
    description?: string | string[];
    assigneeUserId?: string | string[] | null;
    slaMinutes?: number | string;
    status?: string | string[];
  },
  options?: { requireClient?: boolean; requireTitle?: boolean },
): {
  title?: string;
  clientName?: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  category?: string;
  priority?: string;
  description?: string;
  assigneeUserId?: string | null;
  slaMinutes?: number;
  status?: string;
} {
  return {
    title: normalizeHelpdeskTitle(payload.title, options?.requireTitle === true),
    clientName: normalizeHelpdeskClientName(payload.clientName, options?.requireClient === true),
    clientEmail: nullableString(payload.clientEmail),
    clientPhone: nullableString(payload.clientPhone),
    category: optionalString(payload.category),
    priority: optionalString(payload.priority),
    description: optionalString(payload.description),
    assigneeUserId: normalizeNullableId(payload.assigneeUserId),
    slaMinutes: optionalNumber(payload.slaMinutes),
    status: optionalString(payload.status),
  };
}

function normalizeActivityType(value: unknown, required = false): string | undefined {
  const normalized = firstString(value);
  if (required && !normalized) return 'other';
  return normalized;
}

function normalizeActivitySubject(value: unknown, required = false): string | undefined {
  const normalized = firstString(value);
  if (required && !normalized) return 'Aktivita';
  return normalized;
}

function normalizeActivityMutationPayload(
  payload: {
    type?: string | string[];
    subject?: string | string[];
    description?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
    location?: string | string[];
    outcome?: string | string[];
    isCompleted?: boolean;
    contactId?: string | string[] | null;
    dealId?: string | string[] | null;
    userId?: string | string[] | null;
  },
  options?: { requireType?: boolean; requireSubject?: boolean },
): {
  type?: string;
  subject?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  outcome?: string;
  isCompleted?: boolean;
  contactId?: string | null;
  dealId?: string | null;
  userId?: string | null;
} {
  return {
    type: normalizeActivityType(payload.type, options?.requireType === true),
    subject: normalizeActivitySubject(payload.subject, options?.requireSubject === true),
    description: optionalString(payload.description),
    startDate: optionalIsoDateString(payload.startDate),
    endDate: optionalIsoDateString(payload.endDate),
    location: optionalString(payload.location),
    outcome: optionalString(payload.outcome),
    isCompleted: optionalBoolean(payload.isCompleted),
    contactId: normalizeNullableId(payload.contactId),
    dealId: normalizeNullableId(payload.dealId),
    userId: normalizeNullableId(payload.userId),
  };
}

function normalizeOrderCustomerName(value: unknown, required = false): string | undefined {
  const normalized = firstString(value)?.slice(0, 200);
  if (required && !normalized) {
    throw new Error('Jméno zákazníka je povinné.');
  }
  return normalized;
}

function normalizeOrderItems(
  value: unknown,
  mode: 'create' | 'update',
):
  | Array<{
      productName?: string;
      sku?: string;
      category?: string;
      quantity?: number;
      unitPrice?: number;
      image?: string;
      trendLabel?: string;
      trendVariant?: string;
      stock?: number;
      reserved?: number;
      thresholdLevel?: number;
      supplierName?: string;
      supplierLogo?: string;
    }>
  | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .map((item) => ({
      productName: mode === 'create' ? firstString((item as { productName?: unknown })?.productName) ?? 'Item' : optionalString((item as { productName?: unknown })?.productName),
      sku: optionalString((item as { sku?: unknown })?.sku),
      category: optionalString((item as { category?: unknown })?.category),
      quantity: optionalNumber((item as { quantity?: unknown })?.quantity),
      unitPrice: optionalNumber((item as { unitPrice?: unknown })?.unitPrice),
      image: optionalString((item as { image?: unknown })?.image),
      trendLabel: optionalString((item as { trendLabel?: unknown })?.trendLabel),
      trendVariant: optionalString((item as { trendVariant?: unknown })?.trendVariant),
      stock: optionalNumber((item as { stock?: unknown })?.stock),
      reserved: optionalNumber((item as { reserved?: unknown })?.reserved),
      thresholdLevel: optionalNumber((item as { thresholdLevel?: unknown })?.thresholdLevel),
      supplierName: optionalString((item as { supplierName?: unknown })?.supplierName),
      supplierLogo: optionalString((item as { supplierLogo?: unknown })?.supplierLogo),
    }))
    .filter((item) =>
      mode === 'create'
        ? Boolean(item.productName && item.productName.length > 0)
        : Object.values(item).some((field) => field !== undefined),
    );
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOrderMutationPayload(
  payload: {
    orderNumber?: string | string[];
    customerName?: string | string[];
    customerEmail?: string | string[] | null;
    customerPhone?: string | string[] | null;
    orderDate?: string | string[];
    currency?: string | string[];
    shippingCost?: number | string;
    tax?: number | string;
    discount?: number | string;
    paymentStatus?: string | string[];
    deliveryStatus?: string | string[];
    carrierName?: string | string[];
    carrierLogo?: string | string[];
    category?: string | string[];
    notes?: string | string[];
    items?: unknown;
  },
  options?: { requireCustomerName?: boolean; mode?: 'create' | 'update' },
): {
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  orderDate?: string;
  currency?: string;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  paymentStatus?: string;
  deliveryStatus?: string;
  carrierName?: string;
  carrierLogo?: string;
  category?: string;
  notes?: string;
  items?: Array<Record<string, unknown>>;
} {
  const mode = options?.mode ?? 'update';
  return {
    orderNumber: optionalString(payload.orderNumber),
    customerName: normalizeOrderCustomerName(payload.customerName, options?.requireCustomerName === true),
    customerEmail: nullableString(payload.customerEmail),
    customerPhone: nullableString(payload.customerPhone),
    orderDate: optionalString(payload.orderDate),
    currency: optionalString(payload.currency),
    shippingCost: optionalNumber(payload.shippingCost),
    tax: optionalNumber(payload.tax),
    discount: optionalNumber(payload.discount),
    paymentStatus: optionalString(payload.paymentStatus),
    deliveryStatus: optionalString(payload.deliveryStatus),
    carrierName: optionalString(payload.carrierName),
    carrierLogo: optionalString(payload.carrierLogo),
    category: optionalString(payload.category),
    notes: optionalString(payload.notes),
    items: normalizeOrderItems(payload.items, mode) as Array<Record<string, unknown>> | undefined,
  };
}

function normalizeProductName(value: unknown, required = false): string | undefined {
  const normalized = firstString(value)?.slice(0, 200);
  if (required && !normalized) {
    throw new Error('Název produktu je povinný.');
  }
  return normalized;
}

function normalizeProductMutationPayload(
  payload: {
    name?: string | string[];
    description?: string | string[];
    category?: string | string[];
    brand?: string | string[];
    sku?: string | string[];
    barcode?: string | string[];
    price?: number | string;
    status?: 'draft' | 'published' | 'archived' | string | string[];
    featured?: boolean;
    image?: string | string[];
    images?: string[] | string;
    tags?: string[] | string;
  },
  options?: { requireName?: boolean },
): {
  name?: string;
  description?: string;
  category?: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  status?: string;
  featured?: boolean;
  image?: string;
  images?: string[];
  tags?: string[];
} {
  return {
    name: normalizeProductName(payload.name, options?.requireName === true),
    description: optionalString(payload.description),
    category: optionalString(payload.category),
    brand: optionalString(payload.brand),
    sku: optionalString(payload.sku),
    barcode: optionalString(payload.barcode),
    price: optionalNumber(payload.price),
    status: optionalString(payload.status),
    featured: payload.featured === undefined ? undefined : Boolean(payload.featured),
    image: optionalString(payload.image),
    images: optionalStringArray(Array.isArray(payload.images) ? payload.images : [payload.images]),
    tags: optionalStringArray(Array.isArray(payload.tags) ? payload.tags : [payload.tags]),
  };
}

function normalizeContactMutationPayload(
  payload: {
    firstName?: string | string[];
    lastName?: string | string[];
    contactType?: 'lead' | 'customer' | 'partner' | 'vendor' | string | string[];
    source?: string | string[];
    status?: 'active' | 'inactive' | 'archived' | string | string[];
    email?: string | string[];
    phone?: string | string[];
    title?: string | string[];
    companyId?: string | string[];
    street?: string | string[];
    city?: string | string[];
    state?: string | string[];
    zip?: string | string[];
    country?: string | string[];
  },
  options?: { requireName?: boolean },
): {
  firstName?: string;
  lastName?: string;
  contactType?: 'lead' | 'customer' | 'partner' | 'vendor';
  source?: string;
  status?: 'active' | 'inactive' | 'archived';
  email?: string;
  phone?: string;
  title?: string;
  companyId?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
} {
  const requireName = options?.requireName === true;
  const firstName = firstString(payload.firstName);
  const lastName = firstString(payload.lastName);
  const contactType = normalizeEnumString(payload.contactType, ['lead', 'customer', 'partner', 'vendor'] as const);
  const status = normalizeEnumString(payload.status, ['active', 'inactive', 'archived'] as const);
  return {
    firstName: requireName ? firstName ?? 'Unknown' : firstName,
    lastName: requireName ? lastName ?? '-' : lastName,
    contactType,
    source: optionalString(payload.source),
    status,
    email: optionalString(payload.email),
    phone: optionalString(payload.phone),
    title: optionalString(payload.title),
    companyId: normalizeOptionalId(payload.companyId),
    street: optionalString(payload.street),
    city: optionalString(payload.city),
    state: optionalString(payload.state),
    zip: optionalString(payload.zip),
    country: optionalString(payload.country),
  };
}

function normalizeNoteContent(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    const lines = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    return lines.join('\n').trim();
  }
  return '';
}

function normalizeNoteMutationPayload(
  payload: {
    content?: string | string[];
    contactId?: string | string[];
    dealId?: string | string[];
    companyId?: string | string[];
    userId?: string | string[];
    isPinned?: boolean;
  },
  options?: {
    requireContent?: boolean;
    includeRelationIds?: boolean;
  },
): {
  content?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  userId?: string;
  isPinned?: boolean;
} {
  const requireContent = options?.requireContent === true;
  const includeRelationIds = options?.includeRelationIds !== false;
  const normalizedContent =
    payload.content === undefined ? undefined : normalizeNoteContent(payload.content);
  if (requireContent && !normalizedContent) {
    throw new Error('Obsah poznámky je povinný.');
  }
  return {
    content: normalizedContent,
    contactId: includeRelationIds ? normalizeOptionalId(payload.contactId) : undefined,
    dealId: includeRelationIds ? normalizeOptionalId(payload.dealId) : undefined,
    companyId: includeRelationIds ? normalizeOptionalId(payload.companyId) : undefined,
    userId: includeRelationIds ? normalizeOptionalId(payload.userId) : undefined,
    isPinned: optionalBoolean(payload.isPinned),
  };
}

async function fetchWithFallback(path: string, init?: RequestInit): Promise<Response> {
  for (const baseUrl of [ACTIVE_API_BASE_URL, ...API_BASE_CANDIDATES.filter((u) => u !== ACTIVE_API_BASE_URL)]) {
    try {
      const response = await fetch(`${baseUrl}${path}`, init);
      ACTIVE_API_BASE_URL = baseUrl;
      return response;
    } catch (error) {
      void error;
    }
  }

  const targets = API_BASE_CANDIDATES.join(', ');
  throw new Error(`Backend API is not reachable. Tried: ${targets}`);
}

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

function persistToken(token: string): void {
  if (typeof window === 'undefined') return;

  try {
    for (const key of TOKEN_KEYS) {
      window.localStorage.setItem(key, token);
    }
  } catch {
    // Storage can be blocked by browser policy; keep token in-memory only.
  }
}

function clearPersistedToken(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of TOKEN_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage clear failures.
  }
}

async function ensureToken(): Promise<string | null> {
  const stored = cachedToken ?? readTokenFromStorage();
  cachedToken = stored;
  return stored;
}

function shouldTriggerUnauthorizedLogout(response: Response): boolean {
  if (!isLocalHost) return true;
  const responseUrl = response.url || '';
  return responseUrl.startsWith(LOCAL_API_URL);
}

async function request<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: unknown,
): Promise<T> {
  const correlationId = createCorrelationId();
  const doFetch = async (token: string | null) =>
    fetchWithFallback(path, {
      method,
      headers: withCommonHeaders(
        {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        correlationId,
      ),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

  const token = await ensureToken();
  const response = await doFetch(token);

  if (response.status === 401 && shouldTriggerUnauthorizedLogout(response)) {
    cachedToken = null;
    clearPersistedToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('crm-auth:unauthorized'));
    }
  }

  if (!response.ok) {
    const details = await readErrorDetails(response);
    const responseCorrelationId = response.headers.get('x-correlation-id') || correlationId;
    logFrontendError({
      area: 'crm-api',
      message: `HTTP ${method} ${path} failed`,
      correlationId: responseCorrelationId,
      meta: {
        status: response.status,
        details,
      },
    });
    throw new Error(
      `API ${method} ${path} failed (${response.status}) [cid:${responseCorrelationId}]${details ? `: ${details}` : ''}`,
    );
  }

  return (await response.json()) as T;
}

async function requestLocalPreferred<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: unknown,
): Promise<T> {
  if (!isLocalHost) {
    return request<T>(path, method, body);
  }

  const correlationId = createCorrelationId();
  const doFetch = async (baseUrl: string, token: string | null) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: withCommonHeaders(
        {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        correlationId,
      ),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

  const token = await ensureToken();
  let response: Response | null = null;
  let lastError: unknown = null;
  for (const baseUrl of LOCAL_API_FALLBACK_URLS) {
    try {
      response = await doFetch(baseUrl, token);
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    throw lastError instanceof Error ? lastError : new Error(`API ${method} ${path} failed: local backend unreachable`);
  }

  if (response.status === 401 && shouldTriggerUnauthorizedLogout(response)) {
    cachedToken = null;
    clearPersistedToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('crm-auth:unauthorized'));
    }
  }

  if (!response.ok) {
    const details = await readErrorDetails(response);
    const responseCorrelationId = response.headers.get('x-correlation-id') || correlationId;
    logFrontendError({
      area: 'crm-api-local',
      message: `HTTP ${method} ${path} failed`,
      correlationId: responseCorrelationId,
      meta: {
        status: response.status,
        details,
      },
    });
    throw new Error(
      `API ${method} ${path} failed (${response.status}) [cid:${responseCorrelationId}]${details ? `: ${details}` : ''}`,
    );
  }

  return (await response.json()) as T;
}

async function requestLocalPreferredWithTimeout<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: unknown,
  timeoutMs = 15000,
): Promise<T> {
  if (!isLocalHost) {
    return request<T>(path, method, body);
  }

  const correlationId = createCorrelationId();
  try {
    const token = await ensureToken();
    let response: Response | null = null;
    let lastError: unknown = null;

    for (const baseUrl of LOCAL_API_FALLBACK_URLS) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
      try {
        response = await fetch(`${baseUrl}${path}`, {
          method,
          signal: controller.signal,
          headers: withCommonHeaders(
            {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            correlationId,
          ),
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        window.clearTimeout(timeout);
        break;
      } catch (error) {
        window.clearTimeout(timeout);
        lastError = error;
      }
    }

    if (!response) {
      if (lastError instanceof DOMException && lastError.name === 'AbortError') {
        throw new Error(`API ${method} ${path} timeout after ${timeoutMs}ms`);
      }
      throw lastError instanceof Error ? lastError : new Error(`API ${method} ${path} failed: local backend unreachable`);
    }

    if (response.status === 401 && shouldTriggerUnauthorizedLogout(response)) {
      cachedToken = null;
      clearPersistedToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('crm-auth:unauthorized'));
      }
    }

    if (!response.ok) {
      const details = await readErrorDetails(response);
      const responseCorrelationId = response.headers.get('x-correlation-id') || correlationId;
      throw new Error(
        `API ${method} ${path} failed (${response.status}) [cid:${responseCorrelationId}]${details ? `: ${details}` : ''}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`API ${method} ${path} timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

async function authenticatedFetch(path: string): Promise<Response> {
  const correlationId = createCorrelationId();
  const doFetch = async (token: string | null) =>
    fetchWithFallback(path, {
      headers: withCommonHeaders(token ? { Authorization: `Bearer ${token}` } : {}, correlationId),
    });

  const token = await ensureToken();
  const response = await doFetch(token);

  if (response.status === 401 && shouldTriggerUnauthorizedLogout(response)) {
    cachedToken = null;
    clearPersistedToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('crm-auth:unauthorized'));
    }
  }

  return response;
}

async function authenticatedFetchLocalPreferred(path: string, timeoutMs = 20000): Promise<Response> {
  if (!isLocalHost) {
    return authenticatedFetch(path);
  }

  const correlationId = createCorrelationId();
  const token = await ensureToken();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${LOCAL_API_URL}${path}`, {
      signal: controller.signal,
      headers: withCommonHeaders(token ? { Authorization: `Bearer ${token}` } : {}, correlationId),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`API GET ${path} timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (response.status === 401 && shouldTriggerUnauthorizedLogout(response)) {
    cachedToken = null;
    clearPersistedToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('crm-auth:unauthorized'));
    }
  }

  return response;
}

// ─── Google Analytics 4 ───────────────────────────────────────────────────────

export async function fetchGaDashboard(range = '30d') {
  return request<unknown[]>(`/ga/dashboard?range=${range}`);
}

export async function fetchGaAnalytics(slug: string, period = '30d') {
  return request<unknown>(`/ga/${slug}/analytics?period=${period}`);
}

export async function fetchGaProperties() {
  return request<GaPropertyMeta[]>('/ga/properties');
}

export interface GaRealtimeEntry {
  slug: string;
  name: string;
  url: string;
  color: string;
  activeUsers: number;
}

export async function fetchGaRealtime() {
  return request<GaRealtimeEntry[]>('/ga/realtime');
}

export interface GaPropertyMeta {
  slug: string;
  measurementId: string;
  name: string;
  url: string;
  color: string;
  configured: boolean;
}

// ─── Projects Analytics (legacy — custom tracking) ────────────────────────────

export async function fetchProjectsDashboard(range = '7d') {
  return request<unknown[]>(`/dashboard/projects?range=${range}`);
}

export async function fetchProjectByKey(key: string) {
  return request<unknown>(`/projects/${key}`);
}

export async function fetchProjectPeriodAnalytics(key: string, period = '30d') {
  return request<unknown>(`/projects/${key}/period-analytics?period=${period}`);
}

export async function fetchProjectLive(key: string) {
  return request<unknown[]>(`/projects/${key}/live`);
}

export async function fetchProjectTips(key: string) {
  return request<unknown[]>(`/projects/${key}/tips`);
}

export async function createProjectTip(key: string, body: unknown) {
  return request<unknown>(`/projects/${key}/tips`, 'POST', body);
}

export async function updateProjectTip(tipId: string, body: unknown) {
  return request<unknown>(`/projects/tips/${tipId}`, 'PATCH', body);
}

export async function fetchProjectPages(key: string, from: string) {
  return request<unknown[]>(`/projects/${key}/pages?from=${from}`);
}

export async function fetchProjectSessions(key: string) {
  return request<unknown[]>(`/projects/${key}/sessions`);
}

export async function fetchProjectVisitorJourney(key: string, visitorId: string) {
  return request<unknown>(`/projects/${key}/visitors/${visitorId}/journey`);
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export async function fetchContacts(params?: { limit?: number; search?: string; contactType?: string }) {
  const limit = params?.limit ?? 100;
  const searchValue = optionalString(params?.search);
  const contactTypeValue = optionalString(params?.contactType);
  const search = searchValue ? `&search=${encodeURIComponent(searchValue)}` : '';
  const contactType = contactTypeValue ? `&contactType=${encodeURIComponent(contactTypeValue)}` : '';
  return request<ListResponse<BackendContact>>(`/contacts?page=1&limit=${limit}${search}${contactType}`);
}

export async function fetchCompanies(params?: { limit?: number; search?: string }) {
  const limit = params?.limit ?? 100;
  const searchValue = optionalString(params?.search);
  const search = searchValue ? `&search=${encodeURIComponent(searchValue)}` : '';
  return request<ListResponse<BackendCompany>>(`/companies?page=1&limit=${limit}${search}`);
}

export async function fetchDeals(params?: { limit?: number; stage?: string; contactId?: string }) {
  const limit = params?.limit ?? 100;
  const qs = new URLSearchParams({ page: '1', limit: String(limit) });
  const stageValue = optionalString(params?.stage);
  const contactIdValue = optionalString(params?.contactId);
  if (stageValue) qs.set('stage', stageValue);
  if (contactIdValue) qs.set('contactId', contactIdValue);
  return request<ListResponse<BackendDeal>>(`/deals?${qs.toString()}`);
}

export async function fetchDealsMissingFollowUp() {
  return requestLocalPreferred<ListResponse<BackendDeal>>('/deals/follow-up/missing');
}

export async function fetchDealsForecast(period: '7d' | '30d' | '90d' = '30d') {
  return requestLocalPreferred<BackendDealsForecast>(`/deals/forecast?period=${period}`);
}

export async function fetchDealNextActions(limit = 200) {
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 200));
  return requestLocalPreferred<ListResponse<BackendDealNextAction>>(
    `/deals/next-actions?limit=${safeLimit}`,
  );
}

export async function fetchDealsForecastGoals() {
  return requestLocalPreferred<{ monthlyTarget: number; quarterlyTarget: number }>('/deals/forecast/goals');
}

export async function saveDealsForecastGoals(payload: { monthlyTarget?: number; quarterlyTarget?: number }) {
  return requestLocalPreferred<{ monthlyTarget: number; quarterlyTarget: number }>(
    '/deals/forecast/goals',
    'POST',
    payload,
  );
}

export async function createDeal(payload: {
  title: string | string[];
  value?: number | string;
  currency?: string | string[];
  stage?: string | string[];
  contactId?: string | string[];
  companyId?: string | string[];
  description?: string | string[];
}) {
  const normalizedPayload = normalizeDealMutationPayload(payload, { requireTitle: true });
  return request<BackendDeal>('/deals', 'POST', normalizedPayload);
}

export async function deleteDeal(id: string) {
  return request<void>(`/deals/${id}`, 'DELETE');
}

export async function updateDeal(
  id: string,
  payload: {
    title?: string | string[];
    value?: number | string;
    currency?: string | string[];
    stage?: string | string[];
    probability?: number | string;
    expectedCloseDate?: string | string[];
    actualCloseDate?: string | string[];
    description?: string | string[];
    contactId?: string | string[] | null;
    companyId?: string | string[] | null;
    ownerId?: string | string[] | null;
  },
) {
  const normalizedPayload = normalizeDealMutationPayload(payload, { requireTitle: false });
  return request<BackendDeal>(`/deals/${id}`, 'PATCH', normalizedPayload);
}

export async function fetchTasks(params?: { limit?: number; contactId?: string }) {
  const limit = params?.limit ?? 100;
  const qs = new URLSearchParams({ page: '1', limit: String(limit) });
  const contactIdValue = optionalString(params?.contactId);
  if (contactIdValue) qs.set('contactId', contactIdValue);
  return request<ListResponse<BackendTask>>(`/tasks?${qs.toString()}`);
}

export async function fetchOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
}) {
  const page = normalizePositiveInteger(params?.page, 1);
  const limit = normalizePositiveInteger(params?.limit, 200);
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const searchValue = optionalString(params?.search);
  const paymentStatusValue = optionalString(params?.paymentStatus);
  const deliveryStatusValue = optionalString(params?.deliveryStatus);
  if (searchValue) query.set('search', searchValue);
  if (paymentStatusValue) query.set('paymentStatus', paymentStatusValue);
  if (deliveryStatusValue) query.set('deliveryStatus', deliveryStatusValue);

  return request<ListResponse<BackendOrder>>(`/orders?${query.toString()}`);
}

export async function fetchOrder(id: string) {
  return request<BackendOrder>(`/orders/${id}`);
}

export async function createOrder(payload: {
  orderNumber?: string | string[];
  customerName: string | string[];
  customerEmail?: string | string[] | null;
  customerPhone?: string | string[] | null;
  orderDate?: string | string[];
  currency?: string | string[];
  shippingCost?: number | string;
  tax?: number | string;
  discount?: number | string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  deliveryStatus?: 'processing' | 'shipped' | 'delivered' | 'on_hold' | 'canceled' | 'returned';
  carrierName?: string | string[];
  carrierLogo?: string | string[];
  category?: string | string[];
  notes?: string | string[];
  items?: Array<{
    productName: string;
    sku?: string;
    category?: string;
    quantity?: number;
    unitPrice?: number;
    image?: string;
    trendLabel?: string;
    trendVariant?: string;
    stock?: number;
    reserved?: number;
    thresholdLevel?: number;
    supplierName?: string;
    supplierLogo?: string;
  }>;
}) {
  const normalizedPayload = normalizeOrderMutationPayload(
    { ...payload, items: payload.items },
    { requireCustomerName: true, mode: 'create' },
  );
  return request<BackendOrder>('/orders', 'POST', normalizedPayload);
}

export async function updateOrder(
  id: string,
  payload: {
    orderNumber?: string | string[];
    customerName?: string | string[];
    customerEmail?: string | string[] | null;
    customerPhone?: string | string[] | null;
    orderDate?: string | string[];
    currency?: string | string[];
    shippingCost?: number | string;
    tax?: number | string;
    discount?: number | string;
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
    deliveryStatus?: 'processing' | 'shipped' | 'delivered' | 'on_hold' | 'canceled' | 'returned';
    carrierName?: string | string[];
    carrierLogo?: string | string[];
    category?: string | string[];
    notes?: string | string[];
    items?: Array<{
      productName: string;
      sku?: string;
      category?: string;
      quantity?: number;
      unitPrice?: number;
      image?: string;
      trendLabel?: string;
      trendVariant?: string;
      stock?: number;
      reserved?: number;
      thresholdLevel?: number;
      supplierName?: string;
      supplierLogo?: string;
    }>;
  },
) {
  const normalizedPayload = normalizeOrderMutationPayload(
    { ...payload, items: payload.items },
    { requireCustomerName: false, mode: 'update' },
  );
  return request<BackendOrder>(`/orders/${id}`, 'PATCH', normalizedPayload);
}

export async function deleteOrder(id: string) {
  return request<BackendOrder>(`/orders/${id}`, 'DELETE');
}

export async function fetchInvoices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  orderId?: string;
}) {
  const page = normalizePositiveInteger(params?.page, 1);
  const limit = normalizePositiveInteger(params?.limit, 200);
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const searchValue = optionalString(params?.search);
  const orderIdValue = optionalString(params?.orderId);
  if (searchValue) query.set('search', searchValue);
  if (orderIdValue) query.set('orderId', orderIdValue);
  return request<ListResponse<BackendInvoice>>(`/invoices?${query.toString()}`);
}

export async function createInvoiceFromOrder(orderId: string) {
  return request<BackendInvoice>(`/invoices/from-order/${orderId}`, 'POST');
}

export async function downloadInvoicePdf(invoiceId: string): Promise<Blob> {
  const response = await authenticatedFetch(`/invoices/${encodeURIComponent(invoiceId)}/pdf`);
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
      `API GET /invoices/${invoiceId}/pdf failed (${response.status})${details ? `: ${details}` : ''}`,
    );
  }
  return response.blob();
}

export type DatabaseConnectionHealth = {
  key: string;
  project: string;
  module: string;
  status: 'ok' | 'unstable' | 'down' | 'missing';
  sourceEnv: string | null;
  checkedAt: string;
  latencyMs: number | null;
  connection: {
    host: string | null;
    database: string | null;
    schema: string | null;
    sslMode: string | null;
    maskedUrl: string | null;
  };
  error: string | null;
};

export type DatabaseConnectionsHealthResponse = {
  checkedAt: string;
  total: number;
  okCount: number;
  unstableCount?: number;
  downCount: number;
  items: DatabaseConnectionHealth[];
};

export async function fetchDatabaseConnectionsHealth() {
  return requestLocalPreferred<DatabaseConnectionsHealthResponse>('/tools/database-connections');
}

export type DomainMonitorTarget = {
  id: string;
  domain: string;
  project: string | null;
  isActive: boolean;
  checkIntervalSec: number;
  lastStatus: 'up' | 'down' | 'unknown';
  lastCheckedAt: string | null;
  lastLatencyMs: number | null;
  lastHttpStatus: number | null;
  lastError: string | null;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
};

export type DomainMonitorIncident = {
  id: string;
  targetId: string;
  domain: string;
  project: string | null;
  eventType: 'outage' | 'recovery';
  status: 'down' | 'up';
  checkedAt: string;
  latencyMs: number | null;
  httpStatus: number | null;
  error: string | null;
  previousStatus: 'up' | 'down' | 'unknown';
};

export async function fetchDomainMonitorTargets() {
  return requestLocalPreferred<DomainMonitorTarget[]>('/tools/domain-monitor/targets');
}

export async function createDomainMonitorTarget(payload: {
  domain: string;
  project?: string;
  checkIntervalSec?: number;
}) {
  return requestLocalPreferred<DomainMonitorTarget>('/tools/domain-monitor/targets', 'POST', payload);
}

export async function updateDomainMonitorTarget(
  id: string,
  payload: { domain?: string; project?: string; isActive?: boolean; checkIntervalSec?: number },
) {
  return requestLocalPreferred<DomainMonitorTarget>(
    `/tools/domain-monitor/targets/${encodeURIComponent(id)}`,
    'POST',
    payload,
  );
}

export async function runDomainMonitorCheckNow() {
  return requestLocalPreferred<any[]>('/tools/domain-monitor/check-now', 'POST');
}

export async function runDomainMonitorCheckOne(id: string) {
  return requestLocalPreferred<any>('/tools/domain-monitor/check-one', 'POST', { id });
}

export async function fetchDomainMonitorIncidents(limit = 100) {
  return requestLocalPreferred<DomainMonitorIncident[]>(
    `/tools/domain-monitor/incidents?limit=${Math.max(1, Math.min(500, limit))}`,
  );
}

export type CzDomainAvailability = {
  domain: string;
  tld: string;
  status: 'available' | 'taken' | 'unknown' | 'error';
  available: boolean;
  message: string;
  source: string;
  checkedAt: string;
  owner: string | null;
  expiresAt: string | null;
  registrar: string | null;
  registeredAt: string | null;
  changedAt: string | null;
  registrantId: string | null;
  statuses: string[];
  nameServers: string[];
  details: Record<string, string | string[]>;
  rawSnippet: string;
};

export async function checkCzDomainAvailability(domain: string) {
  const query = new URLSearchParams({ domain });
  return request<CzDomainAvailability>(`/tools/cz-domain?${query.toString()}`);
}

export type DomainBulkResponse = {
  batchId: string | null;
  total: number;
  available: number;
  taken: number;
  unknown: number;
  error: number;
  results: CzDomainAvailability[];
};

export async function checkDomainsBulk(payload: {
  domains: string[];
  tlds?: string[];
  concurrency?: number;
}) {
  return request<DomainBulkResponse>('/tools/domains/bulk', 'POST', payload);
}

export type DomainAiSuggestion = {
  name: string;
  availableCount: number;
  availableDomains: string[];
  checks: CzDomainAvailability[];
};

export type DomainAiResponse = {
  prompt: string;
  tlds: string[];
  ideas: string[];
  intent?: 'electronics' | 'real-estate' | 'generic';
  marketLeaders?: string[];
  summary: {
    totalDomains: number;
    available: number;
    taken: number;
    unknown: number;
    error: number;
  };
  ranked: DomainAiSuggestion[];
};

export async function aiSuggestDomains(payload: {
  prompt: string;
  tlds?: string[];
  ideasCount?: number;
  concurrency?: number;
}) {
  return request<DomainAiResponse>('/tools/domains/ai-suggest', 'POST', payload);
}

export type DomainSimilarResponse = {
  inputDomain: string;
  category: 'auto' | 'real-estate' | 'electronics' | 'generic';
  checkedTlds: string[];
  totalChecked: number;
  suggestions: CzDomainAvailability[];
};

export async function suggestSimilarDomains(payload: {
  domain: string;
  limit?: number;
  tlds?: string[];
  concurrency?: number;
}) {
  return request<DomainSimilarResponse>('/tools/domains/similar', 'POST', payload);
}

export type DomainHistoryItem = {
  id: string;
  domain: string;
  tld: string;
  status: 'available' | 'taken' | 'unknown' | 'error';
  available: boolean;
  source: string;
  checkedAt: string;
  owner: string | null;
  expiresAt: string | null;
};

export type RegisteredCzDomainItem = {
  id: string;
  domain: string;
  status?: 'available' | 'taken' | 'unknown' | 'error';
  owner: string | null;
  expiresAt: string | null;
  source: string;
  checkedAt: string;
};

export async function fetchRegisteredCzDomains(params?: { limit?: number; search?: string }) {
  const query = new URLSearchParams({
    limit: String(params?.limit ?? 500),
  });
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return request<RegisteredCzDomainItem[]>(`/tools/domains/registry?${query.toString()}`);
}

export async function fetchRegisteredCzDomainsStats() {
  return request<{ total: number }>('/tools/domains/registry/stats');
}

export async function importRegisteredCzDomains(payload: {
  domains?: string[];
  sourceLabel?: string;
  maxDomains?: number;
  intervalMs?: number;
  batchSize?: number;
}) {
  return request<{ imported: number; scanned: number; sourceLabel: string; totalInRegistry: number }>(
    '/tools/domains/registry/import',
    'POST',
    payload,
  );
}

export type RegistryScrapeProgress = {
  running: boolean;
  sourceUrl: string;
  sourceLabel: string;
  targetTotal: number;
  batchSize: number;
  intervalMs: number;
  pagesScanned: number;
  scannedDomains: number;
  importedDomains: number;
  duplicatesSkipped: number;
  status: 'idle' | 'running' | 'completed' | 'stopped' | 'error';
  message: string | null;
  startedAt: string | null;
  updatedAt: string | null;
};

export async function startRegisteredCzScraper(payload?: {
  domains?: string[];
  targetTotal?: number;
  batchSize?: number;
  intervalMs?: number;
  sourceLabel?: string;
}) {
  return request<RegistryScrapeProgress>('/tools/domains/registry/scrape/start', 'POST', payload ?? {});
}

export async function stopRegisteredCzScraper() {
  return request<RegistryScrapeProgress>('/tools/domains/registry/scrape/stop', 'POST');
}

export async function fetchRegisteredCzScraperProgress() {
  return request<RegistryScrapeProgress>('/tools/domains/registry/scrape/progress');
}

export type SmartcheckStatus = {
  running: boolean;
  jobId: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
  error: string | null;
  outFile: string | null;
  wordsFile: string | null;
  logTail: string;
};

export type SmartcheckResultRow = {
  domain: string;
  status: 'available' | 'taken' | 'unknown' | 'error';
  source: string;
  checked_at: string;
  http_status: number;
  detail: string;
};

export async function startDomainSmartcheck(payload: {
  words: string[];
  maxlen?: number;
  limit?: number;
  rps?: number;
  concurrency?: number;
  retries?: number;
  timeout?: number;
  ttlDays?: number;
}) {
  return requestLocalPreferred<SmartcheckStatus>('/tools/domains/smartcheck/start', 'POST', payload);
}

export async function fetchDomainSmartcheckStatus() {
  return requestLocalPreferred<SmartcheckStatus>('/tools/domains/smartcheck/status');
}

export async function fetchDomainSmartcheckResults(limit = 200) {
  return requestLocalPreferred<SmartcheckResultRow[]>(`/tools/domains/smartcheck/results?limit=${Math.max(1, limit)}`);
}

export type TopCzDomainRow = {
  domain: string;
  rank: number;
  globalRank: number | null;
};

export async function fetchTopCzDomainsModel(params?: { limit?: number; refresh?: boolean }) {
  const limit = Math.max(100, Math.min(10000, Number(params?.limit ?? 1000)));
  const refresh = params?.refresh ? '&refresh=1' : '';
  return requestLocalPreferred<TopCzDomainRow[]>(`/tools/domains/model/cz-top?limit=${limit}${refresh}`);
}

export type Top100ScanStatus = {
  job: 'domains-top100-scan';
  running: boolean;
  trigger: 'manual' | 'schedule' | null;
  refreshTop: boolean;
  totalBases: number;
  currentBaseDomain: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  lastError: string | null;
  processedBases: number;
  checkedTotal: number;
  available: number;
  taken: number;
  unknown: number;
  error: number;
  failedBases: number;
  progressPct: number;
  etaSeconds: number | null;
  etaAt: string | null;
};

export async function startTop100DomainScan(payload?: { refreshTop?: boolean; wait?: boolean }) {
  return requestLocalPreferred<{
    ok: boolean;
    job: 'domains-top100-scan';
    running?: boolean;
    started?: boolean;
    trigger?: 'manual' | 'schedule';
    refreshTop?: boolean;
    startedAt?: string | null;
    message?: string;
    status?: Top100ScanStatus;
  }>('/tools/domains/top-scan/start', 'POST', payload ?? {});
}

export async function fetchTop100DomainScanStatus() {
  return requestLocalPreferred<Top100ScanStatus>('/tools/domains/top-scan/status');
}

export type BackendCronLog = {
  id: string;
  job: string;
  status: string;
  durationMs: number;
  scraped: number;
  created: number;
  updated: number;
  errors: number;
  detail: string | null;
  createdAt: string;
};

export async function fetchCronLogs(limit = 100) {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  return requestLocalPreferred<BackendCronLog[]>(`/cron/logs?limit=${safeLimit}`);
}

function normalizeHistoryRow(row: unknown): DomainHistoryItem | null {
  if (!row || typeof row !== 'object') return null;
  const obj = row as Record<string, unknown>;
  const domain = typeof obj.domain === 'string' ? obj.domain.trim().toLowerCase() : '';
  if (!domain) return null;
  const status = typeof obj.status === 'string' ? obj.status : 'unknown';
  const checkedAt =
    typeof obj.checkedAt === 'string'
      ? obj.checkedAt
      : typeof obj.createdAt === 'string'
      ? obj.createdAt
      : new Date().toISOString();
  return {
    id: typeof obj.id === 'string' ? obj.id : `${domain}-${checkedAt}`,
    domain,
    tld: typeof obj.tld === 'string' ? obj.tld : (domain.split('.').pop() || ''),
    status: status as DomainHistoryItem['status'],
    available: Boolean(obj.available),
    source: typeof obj.source === 'string' ? obj.source : 'unknown',
    checkedAt,
    owner: typeof obj.owner === 'string' ? obj.owner : null,
    expiresAt: typeof obj.expiresAt === 'string' ? obj.expiresAt : null,
  };
}

export async function fetchDomainHistory(limit = 20) {
  const query = new URLSearchParams({ limit: String(limit) });
  const payload = await request<unknown>(`/tools/domains/history?${query.toString()}`);
  if (!Array.isArray(payload)) return [];

  // New API format: direct list of domain rows.
  if (payload.every((item) => item && typeof item === 'object' && 'domain' in (item as Record<string, unknown>))) {
    return payload
      .map((item) => normalizeHistoryRow(item))
      .filter((item): item is DomainHistoryItem => Boolean(item))
      .filter((item) => item.tld !== 'io')
      .slice(0, limit);
  }

  // Backward compatibility: old batch format with nested results.
  const byDomain = new Map<string, DomainHistoryItem>();
  for (const batch of payload) {
    if (!batch || typeof batch !== 'object') continue;
    const rows = (batch as { results?: unknown[] }).results;
    if (!Array.isArray(rows)) continue;
    for (const rawRow of rows) {
      const row = normalizeHistoryRow(rawRow);
      if (!row) continue;
      const key = row.domain;
      const existing = byDomain.get(key);
      const rowTime = Date.parse(row.checkedAt);
      const existingTime = existing ? Date.parse(existing.checkedAt) : 0;
      if (!existing || rowTime >= existingTime) {
        byDomain.set(key, row);
      }
    }
  }

  return Array.from(byDomain.values())
    .filter((item) => item.tld !== 'io')
    .sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))
    .slice(0, limit);
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const page = normalizePositiveInteger(params?.page, 1);
  const limit = normalizePositiveInteger(params?.limit, 200);
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const searchValue = optionalString(params?.search);
  const statusValue = optionalString(params?.status);
  if (searchValue) query.set('search', searchValue);
  if (statusValue) query.set('status', statusValue);

  return request<ListResponse<BackendProduct>>(`/products?${query.toString()}`);
}

export async function createProduct(payload: {
  name: string | string[];
  description?: string | string[];
  category?: string | string[];
  brand?: string | string[];
  sku?: string | string[];
  barcode?: string | string[];
  price?: number | string;
  status?: 'draft' | 'published' | 'archived' | string | string[];
  featured?: boolean;
  image?: string | string[];
  images?: string[] | string;
  tags?: string[] | string;
}) {
  const normalizedPayload = normalizeProductMutationPayload(payload, { requireName: true });
  return request<BackendProduct>('/products', 'POST', normalizedPayload);
}

export async function updateProduct(
  id: string,
  payload: {
    name?: string | string[];
    description?: string | string[];
    category?: string | string[];
    brand?: string | string[];
    sku?: string | string[];
    barcode?: string | string[];
    price?: number | string;
    status?: 'draft' | 'published' | 'archived' | string | string[];
    featured?: boolean;
    image?: string | string[];
    images?: string[] | string;
    tags?: string[] | string;
  },
) {
  const normalizedPayload = normalizeProductMutationPayload(payload, { requireName: false });
  return request<BackendProduct>(`/products/${id}`, 'PATCH', normalizedPayload);
}

export async function deleteProduct(id: string) {
  return request<BackendProduct>(`/products/${id}`, 'DELETE');
}

export async function fetchMe() {
  return requestLocalPreferred<BackendMe>('/auth/me');
}

export type BackendAuthLoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    avatar?: string | null;
  };
};

export type BackendAuthRegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
};

export type BackendUpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
};

function normalizeAvatarForBackend(avatar?: string): string | undefined {
  const value = avatar?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${value}`;
    }
  }
  return value;
}

export async function loginWithCredentials(email: string, password: string) {
  const response = await fetchWithFallback('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let message = 'Invalid credentials';
    try {
      const payload = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };
      if (Array.isArray(payload?.message)) message = payload.message.join(', ');
      else if (typeof payload?.message === 'string') message = payload.message;
      else if (typeof payload?.error === 'string') message = payload.error;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as BackendAuthLoginResponse;
  if (!payload?.accessToken) {
    throw new Error('Backend did not return access token');
  }

  persistToken(payload.accessToken);
  cachedToken = payload.accessToken;
  return payload;
}

export async function registerWithCredentials(payload: BackendAuthRegisterPayload) {
  const response = await fetchWithFallback('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'User registration failed';
    try {
      const err = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };
      if (Array.isArray(err?.message)) message = err.message.join(', ');
      else if (typeof err?.message === 'string') message = err.message;
      else if (typeof err?.error === 'string') message = err.error;
    } catch {
      // keep fallback message
    }
    throw new Error(message);
  }

  return (await response.json()) as BackendAuthLoginResponse;
}

export async function updateMyProfile(payload: BackendUpdateProfilePayload) {
  const normalizedPayload: BackendUpdateProfilePayload = {
    ...payload,
    avatar: normalizeAvatarForBackend(payload.avatar),
  };

  try {
    return await requestLocalPreferred<BackendMe>('/auth/me', 'POST', normalizedPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('(404)')) throw error;
  }

  try {
    return await requestLocalPreferred<BackendMe>('/auth/me', 'PATCH', normalizedPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('(404)')) throw error;
  }

  return requestLocalPreferred<BackendMe>('/auth/me', 'PUT', normalizedPayload);
}

export function logoutAuthSession(): void {
  cachedToken = null;
  clearPersistedToken();
}

export function hasStoredAuthToken(): boolean {
  return Boolean(cachedToken ?? readTokenFromStorage());
}

export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  isRead?: boolean;
  type?: string;
}) {
  const query = new URLSearchParams();
  query.set('page', String(params?.page ?? 1));
  query.set('limit', String(params?.limit ?? 20));
  const userIdValue = optionalString(params?.userId);
  if (userIdValue) query.set('userId', userIdValue);
  if (params?.isRead !== undefined) query.set('isRead', String(params.isRead));
  const typeValue = optionalString(params?.type);
  if (typeValue) query.set('type', typeValue);
  return requestLocalPreferred<ListResponse<BackendNotification>>(`/notifications?${query.toString()}`);
}

export async function markNotificationAsRead(id: string) {
  return requestLocalPreferred<BackendNotification>(`/notifications/${id}/read`, 'PATCH');
}

export async function markAllNotificationsAsRead(userId: string) {
  return requestLocalPreferred<{ count: number }>('/notifications/read-all', 'PATCH', { userId });
}

export async function fetchModulesOverview() {
  return requestLocalPreferred<BackendModulesOverview>('/modules/overview');
}

export async function toggleModuleEnabled(moduleId: string, isEnabled: boolean) {
  return requestLocalPreferred<{ isEnabled: boolean }>(
    `/modules/${encodeURIComponent(moduleId)}/toggle`,
    'POST',
    { isEnabled },
  );
}

export async function toggleAllModulesEnabled(isEnabled: boolean) {
  return requestLocalPreferred<{ isEnabled: boolean; updated: number }>(
    '/modules/toggle-all',
    'POST',
    { isEnabled },
  );
}

export async function fetchSharedDashboards() {
  return requestLocalPreferred<{ data: BackendSharedDashboard[] }>('/modules/dashboards');
}

export async function createSharedDashboard(payload: {
  name: string;
  widgetsOrder?: string[];
  widgetsHidden?: string[];
  sharedUserIds?: string[];
  sharedRoles?: string[];
}) {
  return requestLocalPreferred<BackendSharedDashboard>('/modules/dashboards', 'POST', payload);
}

export async function updateSharedDashboard(
  boardId: string,
  payload: {
    name?: string;
    widgetsOrder?: string[];
    widgetsHidden?: string[];
    sharedUserIds?: string[];
    sharedRoles?: string[];
  },
) {
  return requestLocalPreferred<BackendSharedDashboard>(
    `/modules/dashboards/${encodeURIComponent(boardId)}`,
    'PATCH',
    payload,
  );
}

export async function deleteSharedDashboard(boardId: string) {
  return requestLocalPreferred<{ deleted: boolean }>(
    `/modules/dashboards/${encodeURIComponent(boardId)}/delete`,
    'POST',
  );
}

export async function exportSharedDashboards() {
  return requestLocalPreferred<{
    exportedAt: string;
    actor: { id: string; role?: string; email?: string };
    dashboards: BackendSharedDashboard[];
  }>('/modules/dashboards/export');
}

export async function importSharedDashboards(payload: {
  dashboards: Array<{
    name?: string;
    widgetsOrder?: string[];
    widgetsHidden?: string[];
    sharedUserIds?: string[];
    sharedRoles?: string[];
  }>;
  replaceOwned?: boolean;
}) {
  return requestLocalPreferred<{ imported: number }>('/modules/dashboards/import', 'POST', payload);
}

export interface PlatformContractTemplate {
  id: string;
  name: string;
  category?: string | null;
  body: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface PlatformContractVersion {
  id: string;
  contract_id: string;
  version: number;
  body: string;
  note?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface PlatformContractSignature {
  id: string;
  contract_id: string;
  signer_name: string;
  signer_email: string;
  signature_hash: string;
  signed_at?: string;
}

export interface PlatformContractDocument {
  id: string;
  template_id?: string | null;
  title: string;
  status: string;
  current_version: number;
  metadata: Record<string, unknown>;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  versions: PlatformContractVersion[];
  signatures: PlatformContractSignature[];
}

export interface PlatformContractListItem {
  id: string;
  template_id?: string | null;
  title: string;
  status: string;
  current_version: number;
  metadata?: string | Record<string, unknown> | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function fetchPlatformContractTemplates() {
  return requestLocalPreferred<PlatformContractTemplate[]>('/platform/contracts/templates');
}

export async function fetchPlatformContracts(limit = 100) {
  return requestLocalPreferred<PlatformContractListItem[]>(`/platform/contracts?limit=${limit}`);
}

export async function createPlatformContractTemplate(payload: {
  name: string;
  category?: string;
  body: string;
}) {
  return requestLocalPreferred<PlatformContractTemplate>('/platform/contracts/templates', 'POST', payload);
}

export async function createPlatformContract(payload: {
  templateId?: string;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}) {
  return requestLocalPreferred<PlatformContractDocument>('/platform/contracts', 'POST', payload);
}

export async function addPlatformContractVersion(
  contractId: string,
  payload: { body: string; note?: string },
) {
  return requestLocalPreferred<PlatformContractDocument>(
    `/platform/contracts/${encodeURIComponent(contractId)}/version`,
    'POST',
    payload,
  );
}

export async function signPlatformContract(
  contractId: string,
  payload: { signerName: string; signerEmail: string; signatureHash: string },
) {
  return requestLocalPreferred<PlatformContractDocument>(
    `/platform/contracts/${encodeURIComponent(contractId)}/sign`,
    'POST',
    payload,
  );
}

export async function updatePlatformContractStatus(contractId: string, payload: { status: string }) {
  return requestLocalPreferred<PlatformContractDocument>(
    `/platform/contracts/${encodeURIComponent(contractId)}/status`,
    'PATCH',
    payload,
  );
}

export interface PlatformHelpdeskTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  category?: string | null;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  assignee_user_id?: string | null;
  sla_minutes?: number | null;
  slaDeadline?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchPlatformHelpdeskTickets(limit = 100) {
  return requestLocalPreferred<PlatformHelpdeskTicket[]>(`/platform/helpdesk/tickets?limit=${limit}`);
}

export async function createPlatformHelpdeskTicket(payload: {
  title: string | string[];
  clientName: string | string[];
  clientEmail?: string | string[] | null;
  clientPhone?: string | string[] | null;
  category?: string | string[];
  priority?: string | string[];
  description?: string | string[];
  assigneeUserId?: string | string[] | null;
  slaMinutes?: number | string;
}) {
  const normalizedPayload = normalizeHelpdeskTicketPayload(payload, {
    requireTitle: true,
    requireClient: true,
  });
  return requestLocalPreferred<PlatformHelpdeskTicket>('/platform/helpdesk/tickets', 'POST', normalizedPayload);
}

export async function updatePlatformHelpdeskTicket(
  ticketId: string,
  payload: {
    title?: string | string[];
    description?: string | string[];
    status?: string | string[];
    priority?: string | string[];
    category?: string | string[];
    assigneeUserId?: string | string[] | null;
    slaMinutes?: number | string;
  },
) {
  const normalizedPayload = normalizeHelpdeskTicketPayload(payload, {
    requireTitle: false,
    requireClient: false,
  });
  return requestLocalPreferred<PlatformHelpdeskTicket>(
    `/platform/helpdesk/tickets/${encodeURIComponent(ticketId)}`,
    'PATCH',
    normalizedPayload,
  );
}

export interface PlatformAutomationRule {
  id: string;
  name: string;
  event_type: string;
  is_active: boolean | number;
  conditions_json?: unknown;
  actions_json?: unknown;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function fetchPlatformAutomationRules() {
  return requestLocalPreferred<PlatformAutomationRule[]>('/platform/automation/rules');
}

export async function upsertPlatformAutomationRule(payload: {
  id?: string;
  name: string;
  eventType: string;
  isActive?: boolean;
  conditions?: unknown[];
  actions?: unknown[];
}) {
  return requestLocalPreferred<PlatformAutomationRule>('/platform/automation/rules', 'POST', payload);
}

export async function runPlatformAutomationTest(payload: {
  eventType: string;
  payload?: Record<string, unknown>;
}) {
  return requestLocalPreferred<{
    eventType: string;
    matchedRules: number;
    executedRules: number;
    failedRules: number;
    runs: Array<{ ruleId: string; status: string; result: unknown }>;
  }>('/platform/automation/test-run', 'POST', payload);
}

export interface PlatformAuditLog {
  id: string;
  actor_user_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  path?: string | null;
  method?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  origin?: string | null;
  request_body?: string | null;
  response_status?: number | null;
  success?: boolean | number;
  error_message?: string | null;
  created_at?: string;
}

export async function fetchPlatformAuditLogs(limit = 200) {
  return requestLocalPreferred<PlatformAuditLog[]>(`/platform/audit-logs?limit=${limit}`);
}

export async function downloadPlatformEntityCsv(
  entity: 'orders' | 'deals' | 'contacts' | 'companies' | 'tickets' | 'workflows',
): Promise<Blob> {
  const response = await authenticatedFetch(`/platform/data/export/${encodeURIComponent(entity)}`);
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
      `API GET /platform/data/export/${entity} failed (${response.status})${details ? `: ${details}` : ''}`,
    );
  }
  return response.blob();
}

export async function fetchChatRooms(params?: { userId?: string }) {
  const query = new URLSearchParams();
  const userIdValue = optionalString(params?.userId);
  if (userIdValue) query.set('userId', userIdValue);
  const suffix = query.toString();
  return requestLocalPreferred<BackendChatRoom[]>(`/chat/rooms${suffix ? `?${suffix}` : ''}`);
}

export async function fetchChatMessages(roomId: string, limit = 80) {
  const normalizedLimit = normalizePositiveInteger(limit, 80);
  const query = new URLSearchParams({ limit: String(normalizedLimit) });
  return requestLocalPreferred<BackendChatMessage[]>(`/chat/rooms/${encodeURIComponent(roomId)}/messages?${query.toString()}`);
}

export async function sendChatMessage(roomId: string, payload: { userId: string; content: string }) {
  return requestLocalPreferred<BackendChatMessage>(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, 'POST', payload);
}

export async function createTask(payload: {
  title: string | string[];
  description?: string | string[];
  dueDate?: string | string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'done' | 'cancelled' | 'pending' | 'completed';
  assigneeId?: string | string[];
  creatorId?: string | string[];
  contactId?: string | string[];
  dealId?: string | string[];
}) {
  const normalizedPayload = normalizeTaskMutationPayload(payload, {
    requireTitle: true,
    includeCreatorId: true,
  });
  return request<BackendTask>('/tasks', 'POST', normalizedPayload);
}

export async function updateTask(
  id: string,
  payload: {
    title?: string | string[];
    description?: string | string[];
    dueDate?: string | string[];
    dueAt?: string | string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'todo' | 'in_progress' | 'done' | 'cancelled' | 'pending' | 'completed';
    assigneeId?: string | string[] | null;
    contactId?: string | string[] | null;
    dealId?: string | string[] | null;
  },
) {
  const normalizedPayload = normalizeTaskMutationPayload(payload, {
    requireTitle: false,
    includeCreatorId: false,
  });
  return request<BackendTask>(`/tasks/${id}`, 'PATCH', normalizedPayload);
}

export async function deleteTask(id: string) {
  return request<BackendTask>(`/tasks/${id}`, 'DELETE');
}

export async function fetchNotes(params?: { limit?: number; contactId?: string }) {
  const limit = params?.limit ?? 100;
  const qs = new URLSearchParams({ page: '1', limit: String(limit) });
  const contactIdValue = optionalString(params?.contactId);
  if (contactIdValue) qs.set('contactId', contactIdValue);
  return request<ListResponse<BackendNote>>(`/notes?${qs.toString()}`);
}

export async function createNote(payload: {
  content: string | string[];
  contactId?: string | string[];
  dealId?: string | string[];
  companyId?: string | string[];
  isPinned?: boolean;
  userId?: string | string[];
}) {
  const normalizedPayload = normalizeNoteMutationPayload(payload, {
    requireContent: true,
    includeRelationIds: true,
  });
  return request<BackendNote>('/notes', 'POST', normalizedPayload);
}

export async function deleteNote(id: string) {
  return request<BackendNote>(`/notes/${id}`, 'DELETE');
}

export async function updateNote(id: string, payload: { content?: string | string[]; isPinned?: boolean }) {
  const normalizedPayload = normalizeNoteMutationPayload(payload, {
    requireContent: false,
    includeRelationIds: false,
  });
  return request<BackendNote>(`/notes/${id}`, 'PATCH', normalizedPayload);
}

export async function fetchActivities(params?: { limit?: number; contactId?: string }) {
  const limit = params?.limit ?? 200;
  const qs = new URLSearchParams({ page: '1', limit: String(limit) });
  const contactIdValue = optionalString(params?.contactId);
  if (contactIdValue) qs.set('contactId', contactIdValue);
  return request<ListResponse<BackendActivity>>(`/activities?${qs.toString()}`);
}

export async function createActivity(payload: {
  type: string | string[];
  subject: string | string[];
  description?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
  location?: string | string[];
  outcome?: string | string[];
  isCompleted?: boolean;
  contactId?: string | string[];
  dealId?: string | string[];
  userId?: string | string[];
}) {
  const normalizedPayload = normalizeActivityMutationPayload(payload, {
    requireType: true,
    requireSubject: true,
  });
  if (normalizedPayload.isCompleted === undefined) {
    normalizedPayload.isCompleted = false;
  }
  return request<BackendActivity>('/activities', 'POST', normalizedPayload);
}

export async function updateActivity(
  id: string,
  payload: {
    type?: string | string[];
    subject?: string | string[];
    description?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
    location?: string | string[];
    outcome?: string | string[];
    isCompleted?: boolean;
    contactId?: string | string[] | null;
    dealId?: string | string[] | null;
    userId?: string | string[] | null;
  },
) {
  const normalizedPayload = normalizeActivityMutationPayload(payload, {
    requireType: false,
    requireSubject: false,
  });
  return request<BackendActivity>(`/activities/${id}`, 'PATCH', normalizedPayload);
}

export async function deleteActivity(id: string) {
  return request<BackendActivity>(`/activities/${id}`, 'DELETE');
}

export async function fetchCalendarSyncStatus() {
  return request<CalendarSyncStatus>('/calendar-sync/status');
}

export async function connectAppleCalendar(payload: {
  appleId: string;
  appSpecificPassword: string;
  calendarUrl?: string;
}) {
  return request<{
    ok: boolean;
    connected: boolean;
    calendar?: { name?: string; url?: string };
    availableCalendars?: Array<{ name: string; url: string }>;
    summary?: Record<string, number>;
  }>('/calendar-sync/apple/connect', 'POST', payload);
}

export async function runCalendarSync() {
  return request<{ ok: boolean; summary?: Record<string, number> }>('/calendar-sync/run', 'POST');
}

export async function fetchAppleCalendars() {
  return request<{
    ok: boolean;
    selectedCalendarUrl?: string | null;
    calendars: AppleCalendarOption[];
  }>('/calendar-sync/calendars');
}

export async function setAppleCalendar(calendarUrl: string) {
  return request<{
    ok: boolean;
    calendarUrl: string;
    calendarName: string;
    summary?: Record<string, number>;
  }>('/calendar-sync/calendar', 'PATCH', { calendarUrl });
}

export async function disconnectAppleCalendar() {
  return request<{ ok: boolean; connected: boolean }>('/calendar-sync/disconnect', 'DELETE');
}

export async function fetchDashboard() {
  return request<BackendDashboard>('/dashboard');
}

export async function createContact(payload: {
  firstName: string | string[];
  lastName: string | string[];
  contactType?: 'lead' | 'customer' | 'partner' | 'vendor' | string | string[];
  source?: string | string[];
  status?: 'active' | 'inactive' | 'archived' | string | string[];
  email?: string | string[];
  phone?: string | string[];
  title?: string | string[];
  companyId?: string | string[];
  street?: string | string[];
  city?: string | string[];
  state?: string | string[];
  zip?: string | string[];
  country?: string | string[];
}) {
  const normalizedPayload = normalizeContactMutationPayload(payload, {
    requireName: true,
  });
  return request<BackendContact>('/contacts', 'POST', normalizedPayload);
}

export async function fetchContactById(id: string) {
  return request<BackendContact>(`/contacts/${id}`);
}

export async function updateContact(id: string, payload: Partial<ContactPayload>) {
  const normalizedPayload: Partial<ContactPayload> = normalizeContactMutationPayload(
    payload as {
      firstName?: string | string[];
      lastName?: string | string[];
      contactType?: 'lead' | 'customer' | 'partner' | 'vendor' | string | string[];
      source?: string | string[];
      status?: 'active' | 'inactive' | 'archived' | string | string[];
      email?: string | string[];
      phone?: string | string[];
      title?: string | string[];
      companyId?: string | string[];
      street?: string | string[];
      city?: string | string[];
      state?: string | string[];
      zip?: string | string[];
      country?: string | string[];
    },
    { requireName: false },
  );
  return request<BackendContact>(`/contacts/${id}`, 'PATCH', normalizedPayload);
}

export async function deleteContact(id: string) {
  return request<void>(`/contacts/${id}`, 'DELETE');
}

export async function fetchCustomFields(params?: {
  entityType?: string;
  moduleId?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;
  const entityType = params?.entityType
    ? `&entityType=${encodeURIComponent(params.entityType)}`
    : '';
  const moduleId = params?.moduleId
    ? `&moduleId=${encodeURIComponent(params.moduleId)}`
    : '';

  return request<ListResponse<BackendCustomField>>(
    `/custom-fields?page=${page}&limit=${limit}${entityType}${moduleId}`,
  );
}

export async function createCustomField(payload: {
  entityType: string;
  fieldName: string;
  fieldType: string;
  fieldLabel: string;
  placeholder?: string;
  options?: string;
  required?: boolean;
  sortOrder?: number;
  moduleId?: string;
}) {
  const normalizedPayload = {
    entityType: firstString(payload.entityType) ?? 'contact',
    fieldName: firstString(payload.fieldName) ?? 'custom_field',
    fieldType: firstString(payload.fieldType) ?? 'text',
    fieldLabel: firstString(payload.fieldLabel) ?? 'Custom field',
    placeholder: optionalString(payload.placeholder),
    options: optionalString(payload.options),
    required: payload.required === undefined ? undefined : Boolean(payload.required),
    sortOrder: optionalNumber(payload.sortOrder),
    moduleId: optionalString(payload.moduleId),
  };
  return request<BackendCustomField>('/custom-fields', 'POST', normalizedPayload);
}

export async function setCustomFieldValue(payload: {
  fieldId: string;
  value: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}) {
  const normalizedPayload = {
    fieldId: firstString(payload.fieldId) ?? '',
    value: firstString(payload.value) ?? '',
    contactId: optionalString(payload.contactId),
    companyId: optionalString(payload.companyId),
    dealId: optionalString(payload.dealId),
  };
  return request<BackendCustomFieldValue>('/custom-fields/values', 'POST', normalizedPayload);
}

export async function getCustomFieldValue(params: {
  fieldId: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}) {
  const contactIdValue = optionalString(params.contactId);
  const companyIdValue = optionalString(params.companyId);
  const dealIdValue = optionalString(params.dealId);
  const contactId = contactIdValue
    ? `&contactId=${encodeURIComponent(contactIdValue)}`
    : '';
  const companyId = companyIdValue
    ? `&companyId=${encodeURIComponent(companyIdValue)}`
    : '';
  const dealId = dealIdValue ? `&dealId=${encodeURIComponent(dealIdValue)}` : '';

  return request<BackendCustomFieldValue | null>(
    `/custom-fields/values/get?fieldId=${encodeURIComponent(params.fieldId)}${contactId}${companyId}${dealId}`,
  );
}

// ==========================================
// REALITY (External Listings)
// ==========================================

export interface BackendExternalListing {
  id: string;
  srealityId: string;
  title: string;
  description?: string | null;
  originalPrice: number;
  currentPrice: number;
  pricePerM2?: number | null;
  usableArea?: number | null;
  disposition?: string | null;
  locality?: string | null;
  gpsLat?: number | null;
  gpsLon?: number | null;
  companyName?: string | null;
  listingState: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalPriceChanges: number;
  finalPrice?: number | null;
  soldAt?: string | null;
  sourceUrl?: string | null;
  // Category & region
  categoryMain?: string | null;
  categoryType?: string | null;
  region?: string | null;
  // Property features
  garage: boolean;
  elevator: boolean;
  balcony: boolean;
  cellar: boolean;
  loggia: boolean;
  parkingLot: boolean;
  terrace: boolean;
  furnished: boolean;
  partlyFurnished: boolean;
  unfurnished: boolean;
  // Building type
  panel: boolean;
  brick: boolean;
  newBuilding: boolean;
  afterReconstruction: boolean;
  inReconstruction: boolean;
  // Ownership
  personalOwnership: boolean;
  stateOwnership: boolean;
  cooperativeOwnership: boolean;
  // Extra features
  wooden: boolean;
  lowEnergy: boolean;
  basin: boolean;
  landArea?: number | null;
  // Agency
  exclusiveAgency: boolean;
  // Seller/contact
  contactId?: number | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  // Company
  companyId?: number | null;
  companyUrl?: string | null;
  // Meta
  rus: boolean;
  longUnsold: boolean;
  auction: boolean;
  shareProperty: boolean;
  createdAt: string;
  updatedAt: string;
  changes?: BackendListingChange[];
  priceHistory?: BackendListingPriceHistory[];
  leadSignals?: BackendLeadSignals;
  scores?: BackendLeadScores;
}

export interface BackendLeadSignals {
  daysOnMarket: number;
  marketAvgPricePerM2: number;
  overpricePct: number;
  urgencyHit: boolean;
  urgencyHitCount?: number;
  urgencyKeywords?: string[];
  weakPresentationScore: number;
  competitionCount?: number;
  approxPriceChanges30d?: number;
  leadBand?: string;
  reasonCodes?: string[];
  guardrails?: Array<{ id: string; blocked: boolean; message: string }>;
  blockedForEnqueue?: boolean;
}

export interface BackendLeadScores {
  ageScore: number;
  overpriceScore: number;
  noAgencyScore: number;
  urgencyScore?: number;
  presentationScore?: number;
  competitionDensityScore?: number;
  priceChangeVelocityScore?: number;
  callPriorityScore: number;
}

export interface BackendListingChange {
  id: string;
  listingId: string;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt: string;
}

export interface BackendListingPriceHistory {
  id: string;
  listingId: string;
  price: number;
  pricePerM2?: number | null;
  recordedAt: string;
}

export interface BackendRealityAnalytics {
  count: number;
  avgPricePerM2: number | null;
  medianPricePerM2: number | null;
  avgDaysOnMarket: number | null;
  avgPriceDropPercent: number | null;
  avgPriceChangesBeforeSold: number | null;
  byState: Record<string, number>;
}

export interface RealityListingFilters {
  page?: number;
  limit?: number;
  search?: string;
  locality?: string;
  listingState?: string;
  disposition?: string;
  minPrice?: number;
  maxPrice?: number;
  minPricePerM2?: number;
  maxPricePerM2?: number;
  categoryMain?: string;
  categoryType?: string;
  region?: string;
  minArea?: number;
  maxArea?: number;
  companyName?: string;
  // Boolean filters
  garage?: boolean;
  elevator?: boolean;
  balcony?: boolean;
  cellar?: boolean;
  loggia?: boolean;
  parkingLot?: boolean;
  terrace?: boolean;
  furnished?: boolean;
  partlyFurnished?: boolean;
  unfurnished?: boolean;
  panel?: boolean;
  brick?: boolean;
  newBuilding?: boolean;
  afterReconstruction?: boolean;
  inReconstruction?: boolean;
  personalOwnership?: boolean;
  stateOwnership?: boolean;
  cooperativeOwnership?: boolean;
  exclusiveAgency?: boolean;
  longUnsold?: boolean;
  rus?: boolean;
  auction?: boolean;
  shareProperty?: boolean;
  minDaysOnMarket?: number;
  maxDaysOnMarket?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  source?: 'bezrealitky' | 'sreality';
}

export interface RealityLeadCandidateFilters {
  page?: number;
  limit?: number;
  locality?: string;
  minDaysOnMarket?: number;
  onlyNoAgency?: boolean;
  urgencyOnly?: boolean;
  weakPresentationOnly?: boolean;
  minOverpricePct?: number;
  minCallPriorityScore?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface RealityLeadEnqueuePayload extends RealityLeadCandidateFilters {
  templateId?: string;
  autoTemplateByBand?: boolean;
}

export interface RealityLeadEnqueueResult {
  ok: boolean;
  templateId: string | null;
  autoTemplateByBand: boolean;
  processed: number;
  queued: number;
  skippedNoContact: number;
  skippedBlocked: number;
  failed: number;
  templateUsage?: Record<string, number>;
}

export interface RealityOutreachDraftPayload {
  limit?: number;
  fromName?: string;
  fromEmail?: string;
}

export interface RealityOutreachDraftResult {
  ok: boolean;
  drafted: number;
  failed: number;
  processed: number;
}

export interface RealityOutreachSyncSentPayload {
  lookbackDays?: number;
  limit?: number;
}

export interface RealityOutreachSyncSentResult {
  ok: boolean;
  synced: number;
  scannedSent: number;
  scannedQueue?: number;
  lookbackDays?: number;
}

export interface BackendRealityOutreachMetrics {
  periodDays: number;
  funnel: {
    total: number;
    queued: number;
    drafted: number;
    sent: number;
    failed: number;
    draftedRatePct: number;
    sentRatePct: number;
    failRatePct: number;
  };
  templates: Array<{
    templateId: string;
    total: number;
    drafted: number;
    sent: number;
    failed: number;
    avgScore: number;
    sentRatePct: number;
    failRatePct: number;
  }>;
}

export interface BackendRealityOutreachHealth {
  ok: boolean;
  generatedAt: string;
  queue: {
    total: number;
    queued: number;
    drafted: number;
    sent: number;
    failed: number;
    staleQueued: number;
  };
  reliability: {
    recentWindowDays: number;
    recentTotal: number;
    recentFailed: number;
    recentFailRatePct: number;
  };
  snapshot?: {
    fileName?: string;
    modifiedAt?: string;
  } | null;
  warnings: string[];
}

export interface RealityOutreachStatusSnapshotResult {
  ok: boolean;
  fileName: string;
  filePath: string;
  generatedAt: string;
}

export interface RealityOutreachStatusSnapshotFile {
  fileName: string;
  filePath: string;
  sizeBytes: number;
  modifiedAt: string;
}

export interface RealityOutreachStatusSnapshotList {
  data: RealityOutreachStatusSnapshotFile[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface RealityOutreachStatusSnapshotCleanupResult {
  ok: boolean;
  dryRun: boolean;
  scanned: number;
  candidates: number;
  deleted: number;
  olderThanDays: number;
  keepLatest: number;
  deletedFiles?: Array<{ fileName: string; reason: string }>;
}

export interface RealityOutreachDailyDigestSnapshotFile {
  fileName: string;
  filePath: string;
  sizeBytes: number;
  modifiedAt: string;
}

export interface RealityOutreachDailyDigestSnapshotList {
  data: RealityOutreachDailyDigestSnapshotFile[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface RealityOutreachDailyDigestCleanupResult {
  ok: boolean;
  scanned: number;
  deleted: number;
  keepLatest: number;
  olderThanDays: number;
  deletedFiles?: Array<{ fileName: string; reason: string }>;
}

export interface RealityOutreachMaintenanceLogFile {
  fileName: string;
  filePath: string;
  sizeBytes: number;
  modifiedAt: string;
}

export interface RealityOutreachMaintenanceLogList {
  data: RealityOutreachMaintenanceLogFile[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface RealityOutreachMaintenanceCleanupResult {
  ok: boolean;
  dryRun: boolean;
  scanned: number;
  candidates: number;
  deleted: number;
  olderThanDays: number;
  keepLatest: number;
  deletedFiles?: Array<{ fileName: string; reason: string }>;
}

export interface BackendRealityOutreachTopPriorityItem {
  id: string;
  listing_id: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  template_id: string;
  subject: string;
  body: string;
  call_priority_score: number;
  status: 'queued' | 'drafted' | 'sent' | 'failed';
  draft_mail_id?: string | null;
  last_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendRealityOutreachTopPriority {
  data: BackendRealityOutreachTopPriorityItem[];
  meta: {
    totalInStatus: number;
    percent: number;
    selected: number;
    status: 'queued' | 'drafted' | 'sent' | 'failed';
  };
}

export interface RealityOutreachAutoCyclePayload {
  enqueue?: {
    limit?: number;
    locality?: string;
    minDaysOnMarket?: number;
    onlyNoAgency?: boolean;
    urgencyOnly?: boolean;
    weakPresentationOnly?: boolean;
    minOverpricePct?: number;
    minCallPriorityScore?: number;
    templateId?: string;
    autoTemplateByBand?: boolean;
  };
  draftLimit?: number;
  syncLookbackDays?: number;
  syncLimit?: number;
  metricsPeriodDays?: number;
  saveSnapshot?: boolean;
  snapshotPrefix?: string;
}

export interface RealityOutreachAutoCycleResult {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  enqueue?: {
    ok: boolean;
    processed: number;
    queued: number;
    skippedNoContact: number;
    skippedBlocked?: number;
    failed: number;
  };
  draft?: {
    ok: boolean;
    drafted: number;
    failed: number;
    processed: number;
  };
  syncSent?: {
    ok: boolean;
    synced: number;
    scannedSent: number;
  };
  metrics?: BackendRealityOutreachMetrics;
}

export interface RealityOutreachScoringSpecResponse {
  generatedAt: string;
  sourceGeneratedAt?: string | null;
  version?: string;
  scoringSpec?: unknown;
  explainableReasons?: unknown[];
  abStrategyMatrix?: unknown[];
  guards?: unknown[];
}

export interface RealityOutreachScoringSqlPackResponse {
  generatedAt: string;
  sourceGeneratedAt?: string | null;
  version?: string;
  sqlBlocks?: unknown[];
}

export interface RealityOutreachTemplateCatalogResponse {
  generatedAt: string;
  templates: Array<{
    templateId: string;
    label?: string;
    description?: string;
    defaultFilters?: Record<string, unknown>;
  }>;
}

export interface RealityOutreachTemplateOverridesResponse {
  data: Array<{
    id?: string;
    template_id: string;
    subject: string;
    body: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }>;
  meta: {
    total: number;
    activeOnly: boolean;
  };
}

export interface RealityOutreachTemplateOverrideUpsertPayload {
  templateId: string;
  subject: string;
  body: string;
  isActive?: boolean;
}

export interface RealityOutreachTemplateOverrideUpsertResponse {
  ok: boolean;
  override?: Record<string, unknown> | null;
}

export interface RealityOutreachTemplateOverrideValidateResponse {
  ok: boolean;
  total: number;
  valid: number;
  errors: Array<{ index: number; templateId?: string; error: string }>;
  warnings: Array<{ index: number; templateId?: string; warning: string }>;
  note?: string;
}

export interface RealityOutreachTemplateOverrideImportResponse {
  ok?: boolean;
  total?: number;
  imported?: number;
  failed?: number;
  errors?: Array<{ index: number; templateId?: string; error: string }>;
  activateSet?: {
    enabled: boolean;
    deactivatedOutsideSet: number;
    importedTemplateIds: string[];
    note?: string;
  };
  dryRun?: boolean;
}

export async function fetchRealityListings(params?: RealityListingFilters) {
  const p = params ?? {};
  const query = new URLSearchParams();
  query.set('page', String(p.page ?? 1));
  query.set('limit', String(p.limit ?? 50));

  // String filters
  const stringKeys: (keyof RealityListingFilters)[] = [
    'search', 'locality', 'listingState', 'disposition',
    'categoryMain', 'categoryType', 'region', 'companyName',
    'sortBy', 'sortOrder', 'source',
  ];
  for (const key of stringKeys) {
    const val = p[key];
    if (val !== undefined && val !== '') query.set(key, String(val));
  }

  // Numeric filters
  const numericKeys: (keyof RealityListingFilters)[] = [
    'minPrice', 'maxPrice', 'minPricePerM2', 'maxPricePerM2',
    'minArea', 'maxArea', 'minDaysOnMarket', 'maxDaysOnMarket',
  ];
  for (const key of numericKeys) {
    const val = p[key];
    if (val !== undefined) query.set(key, String(val));
  }

  // Boolean filters
  const boolKeys: (keyof RealityListingFilters)[] = [
    'garage', 'elevator', 'balcony', 'cellar', 'loggia', 'parkingLot',
    'terrace', 'furnished', 'partlyFurnished', 'unfurnished',
    'panel', 'brick', 'newBuilding', 'afterReconstruction', 'inReconstruction',
    'personalOwnership', 'stateOwnership', 'cooperativeOwnership',
    'exclusiveAgency', 'longUnsold', 'rus', 'auction', 'shareProperty',
  ];
  for (const key of boolKeys) {
    const val = p[key];
    if (val !== undefined) query.set(key, String(val));
  }

  return request<ListResponse<BackendExternalListing>>(`/reality?${query.toString()}`);
}

export async function fetchRealityLeadCandidates(params?: RealityLeadCandidateFilters) {
  const p = params ?? {};
  const query = new URLSearchParams();
  query.set('page', String(p.page ?? 1));
  query.set('limit', String(p.limit ?? 50));

  const stringKeys: (keyof RealityLeadCandidateFilters)[] = ['locality', 'sortOrder'];
  for (const key of stringKeys) {
    const val = p[key];
    if (val !== undefined && val !== '') query.set(key, String(val));
  }

  const numericKeys: (keyof RealityLeadCandidateFilters)[] = [
    'minDaysOnMarket',
    'minOverpricePct',
    'minCallPriorityScore',
  ];
  for (const key of numericKeys) {
    const val = p[key];
    if (val !== undefined) query.set(key, String(val));
  }

  const boolKeys: (keyof RealityLeadCandidateFilters)[] = [
    'onlyNoAgency',
    'urgencyOnly',
    'weakPresentationOnly',
  ];
  for (const key of boolKeys) {
    const val = p[key];
    if (val !== undefined) query.set(key, String(val));
  }

  return request<ListResponse<BackendExternalListing>>(`/reality/lead-candidates?${query.toString()}`);
}

export async function enqueueRealityLeadCandidates(payload?: RealityLeadEnqueuePayload) {
  return request<RealityLeadEnqueueResult>('/reality/lead-candidates/enqueue', 'POST', payload ?? {});
}

export async function createRealityOutreachDrafts(payload?: RealityOutreachDraftPayload) {
  return request<RealityOutreachDraftResult>('/reality/outreach/draft', 'POST', payload ?? {});
}

export async function syncRealityOutreachSent(payload?: RealityOutreachSyncSentPayload) {
  return request<RealityOutreachSyncSentResult>('/reality/outreach/sync-sent', 'POST', payload ?? {});
}

export async function fetchRealityOutreachMetrics(periodDays = 30) {
  const q = new URLSearchParams({ periodDays: String(periodDays) });
  return request<BackendRealityOutreachMetrics>(`/reality/outreach/metrics?${q.toString()}`);
}

export async function fetchRealityOutreachHealth(params?: {
  staleHours?: number;
  failWarnPct?: number;
}) {
  const p = params ?? {};
  const q = new URLSearchParams();
  q.set('staleHours', String(p.staleHours ?? 24));
  q.set('failWarnPct', String(p.failWarnPct ?? 20));
  return request<BackendRealityOutreachHealth>(`/reality/outreach/health?${q.toString()}`);
}

export async function saveRealityOutreachStatusSnapshot(payload?: {
  healthStaleHours?: number;
  healthFailWarnPct?: number;
  recentPeriodDays?: number;
  prefix?: string;
}) {
  return request<RealityOutreachStatusSnapshotResult>(
    '/reality/outreach/status-report/snapshot',
    'POST',
    payload ?? {},
  );
}

export async function fetchRealityOutreachStatusSnapshots(limit = 30) {
  const q = new URLSearchParams({ limit: String(limit) });
  return request<RealityOutreachStatusSnapshotList>(
    `/reality/outreach/status-report/snapshots?${q.toString()}`,
  );
}

export async function downloadRealityOutreachStatusSnapshot(fileName: string): Promise<void> {
  const safeName = (fileName ?? '').trim();
  if (!safeName) throw new Error('Chybí fileName snapshotu');
  const response = await authenticatedFetch(
    `/reality/outreach/status-report/snapshots/${encodeURIComponent(safeName)}`,
  );
  if (!response.ok) throw new Error(`Download status snapshot selhal: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  a.click();
  URL.revokeObjectURL(url);
}

export async function cleanupRealityOutreachStatusSnapshots(payload?: {
  olderThanDays?: number;
  keepLatest?: number;
  dryRun?: boolean;
}) {
  return request<RealityOutreachStatusSnapshotCleanupResult>(
    '/reality/outreach/status-report/snapshots/cleanup',
    'POST',
    payload ?? {},
  );
}

export async function fetchRealityOutreachDailyDigestSnapshots(limit = 30) {
  const q = new URLSearchParams({ limit: String(limit) });
  return request<RealityOutreachDailyDigestSnapshotList>(
    `/reality/outreach/daily-digest/snapshots?${q.toString()}`,
  );
}

export async function cleanupRealityOutreachDailyDigestSnapshots(payload?: {
  olderThanDays?: number;
  keepLatest?: number;
}) {
  return request<RealityOutreachDailyDigestCleanupResult>(
    '/reality/outreach/daily-digest/snapshots/cleanup',
    'POST',
    payload ?? {},
  );
}

export async function fetchRealityOutreachMaintenanceLogs(limit = 30) {
  const q = new URLSearchParams({ limit: String(limit) });
  return request<RealityOutreachMaintenanceLogList>(
    `/reality/outreach/maintenance-cycle/logs?${q.toString()}`,
  );
}

export async function cleanupRealityOutreachMaintenanceLogs(payload?: {
  olderThanDays?: number;
  keepLatest?: number;
  dryRun?: boolean;
}) {
  return request<RealityOutreachMaintenanceCleanupResult>(
    '/reality/outreach/maintenance-cycle/logs/cleanup',
    'POST',
    payload ?? {},
  );
}

export async function fetchRealityOutreachTopPriority(params?: {
  percent?: number;
  status?: 'queued' | 'drafted' | 'sent' | 'failed';
  limit?: number;
}) {
  const p = params ?? {};
  const q = new URLSearchParams();
  q.set('percent', String(p.percent ?? 10));
  q.set('status', p.status ?? 'queued');
  q.set('limit', String(p.limit ?? 200));
  return request<BackendRealityOutreachTopPriority>(`/reality/outreach/top-priority?${q.toString()}`);
}

export async function runRealityOutreachAutoCycle(payload?: RealityOutreachAutoCyclePayload) {
  return request<RealityOutreachAutoCycleResult>('/reality/outreach/auto-cycle', 'POST', payload ?? {});
}

export async function runRealityOutreachAutoCycleDryRun(payload?: RealityOutreachAutoCyclePayload) {
  return request<{
    ok: boolean;
    dryRun: boolean;
    startedAt: string;
    finishedAt: string;
    assumptions?: {
      templateId?: string;
      draftLimit?: number;
      syncLookbackDays?: number;
      syncLimit?: number;
    };
    projections?: {
      enqueue?: {
        processedCandidates?: number;
        wouldQueue?: number;
        skippedNoContact?: number;
      };
      draft?: {
        currentlyQueuedWithEmail?: number;
        wouldDraftNow?: number;
      };
      syncSent?: {
        sentMessagesInWindow?: number;
        note?: string;
      };
    };
  }>('/reality/outreach/auto-cycle/dry-run', 'POST', payload ?? {});
}

export async function fetchRealityOutreachScoringSpec() {
  return request<RealityOutreachScoringSpecResponse>('/reality/outreach/scoring/spec');
}

export async function fetchRealityOutreachScoringSqlPack() {
  return request<RealityOutreachScoringSqlPackResponse>('/reality/outreach/scoring/sql-pack');
}

export async function fetchRealityOutreachTemplateCatalog() {
  return request<RealityOutreachTemplateCatalogResponse>('/reality/outreach/templates/catalog');
}

export async function fetchRealityOutreachTemplateOverrides(activeOnly = false) {
  const q = new URLSearchParams({ activeOnly: String(activeOnly) });
  return request<RealityOutreachTemplateOverridesResponse>(
    `/reality/outreach/templates/overrides?${q.toString()}`,
  );
}

export async function upsertRealityOutreachTemplateOverride(
  payload: RealityOutreachTemplateOverrideUpsertPayload,
) {
  return request<RealityOutreachTemplateOverrideUpsertResponse>(
    '/reality/outreach/templates/overrides',
    'POST',
    payload,
  );
}

export async function setRealityOutreachTemplateOverrideActiveState(
  templateId: string,
  isActive: boolean,
) {
  const safeId = (templateId ?? '').trim();
  if (!safeId) throw new Error('Chybí templateId');
  return request<RealityOutreachTemplateOverrideUpsertResponse>(
    `/reality/outreach/templates/overrides/${encodeURIComponent(safeId)}/active`,
    'PATCH',
    { isActive },
  );
}

export async function validateRealityOutreachTemplateOverrides(payload: {
  overrides: Array<{
    templateId: string;
    subject: string;
    body: string;
    isActive?: boolean;
  }>;
}) {
  return request<RealityOutreachTemplateOverrideValidateResponse>(
    '/reality/outreach/templates/overrides/validate/json',
    'POST',
    payload,
  );
}

export async function importRealityOutreachTemplateOverrides(
  payload: {
    overrides: Array<{
      templateId: string;
      subject: string;
      body: string;
      isActive?: boolean;
    }>;
  },
  params?: { dryRun?: boolean; activateSet?: boolean },
) {
  const q = new URLSearchParams();
  if (params?.dryRun !== undefined) q.set('dryRun', String(params.dryRun));
  if (params?.activateSet !== undefined) q.set('activateSet', String(params.activateSet));
  const path = q.size
    ? `/reality/outreach/templates/overrides/import/json?${q.toString()}`
    : '/reality/outreach/templates/overrides/import/json';
  return request<RealityOutreachTemplateOverrideImportResponse>(path, 'POST', payload);
}

export async function resetRealityOutreachTemplateOverridesToDefaults() {
  return request<{ ok: boolean; deactivated: number; mode: string }>(
    '/reality/outreach/templates/overrides/reset-defaults',
    'POST',
  );
}

export async function fetchRealityListing(id: string) {
  return request<BackendExternalListing>(`/reality/${id}`);
}

export async function fetchRealityHistory(id: string) {
  return request<{ changes: BackendListingChange[]; priceHistory: BackendListingPriceHistory[] }>(
    `/reality/${id}/history`,
  );
}

export async function fetchRealityAnalytics(locality?: string) {
  const query = locality ? `?locality=${encodeURIComponent(locality)}` : '';
  return request<BackendRealityAnalytics>(`/reality/analytics${query}`);
}

export interface RadiusSearchResult {
  count: number;
  radiusKm: number;
  center: { lat: number; lon: number };
  items: Array<{
    id: string;
    title: string;
    currentPrice: number;
    pricePerM2: number | null;
    usableArea: number | null;
    locality: string | null;
    disposition: string | null;
    categoryMain: string | null;
    categoryType: string | null;
    distanceKm: number;
    sourceUrl: string | null;
  }>;
}

export async function fetchRadiusSearch(params: {
  lat: number;
  lon: number;
  radiusKm: number;
  categoryMain?: string;
  categoryType?: string;
  disposition?: string;
  limit?: number;
}): Promise<RadiusSearchResult | null> {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lon: String(params.lon),
    radiusKm: String(params.radiusKm),
  });
  if (params.categoryMain) q.set('categoryMain', params.categoryMain);
  if (params.categoryType) q.set('categoryType', params.categoryType);
  if (params.disposition) q.set('disposition', params.disposition);
  if (params.limit) q.set('limit', String(params.limit));
  return request<RadiusSearchResult>(`/reality/radius-search?${q}`);
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const q = new URLSearchParams({ address });
  try {
    const res = await request<{ lat: number; lon: number; error?: string }>(`/reality/geocode?${q}`);
    if (!res || (res as { error?: string }).error) return null;
    return res as { lat: number; lon: number };
  } catch {
    return null;
  }
}

export async function importRealityListings(payload: {
  items: Array<{
    srealityId: string;
    title: string;
    price: number;
    usableArea?: number;
    disposition?: string;
    locality?: string;
    gpsLat?: number;
    gpsLon?: number;
    companyName?: string;
    sourceUrl?: string;
    listingState?: string;
  }>;
  syncType: 'full' | 'delta';
}) {
  return request<{ created: number; updated: number; unchanged: number; errors: number }>(
    '/reality/import',
    'POST',
    payload,
  );
}

export interface ScrapeProgress {
  categoryMain: string;
  categoryType: string;
  count: number;
}

export async function getScrapeProgress(): Promise<ScrapeProgress[]> {
  return request<ScrapeProgress[]>('/reality/scrape-progress');
}

export interface ScrapeResult {
  scrape: {
    totalFound: number;
    pagesScraped: number;
    itemsScraped: number;
    scrapeErrors: number;
    skipped?: number;
  };
  import: {
    created: number;
    updated: number;
    unchanged: number;
    errors: number;
  };
  touched?: number;
}

export async function scrapeReality(params?: {
  categoryMain?: number;
  categoryType?: number;
  maxPages?: number;
  startPage?: number;
  quick?: boolean;
  syncType?: 'full' | 'delta';
}) {
  const p = params ?? {};
  const query = new URLSearchParams();
  if (p.categoryMain !== undefined) query.set('categoryMain', String(p.categoryMain));
  if (p.categoryType !== undefined) query.set('categoryType', String(p.categoryType));
  if (p.maxPages !== undefined) query.set('maxPages', String(p.maxPages));
  if (p.startPage !== undefined) query.set('startPage', String(p.startPage));
  if (p.quick) query.set('quick', 'true');
  return request<ScrapeResult>(
    `/reality/scrape?${query.toString()}`,
    'POST',
    { syncType: p.syncType ?? 'delta' },
  );
}

// ── CSV Export ──────────────────────────────────────────────────────────

export async function downloadRealityCsv(): Promise<void> {
  const response = await authenticatedFetch('/reality/export/csv');
  if (!response.ok) throw new Error(`Export selhal: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `sreality-export-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadRealityOutreachQueueCsv(params?: {
  status?: 'queued' | 'drafted' | 'sent' | 'failed';
  limit?: number;
}): Promise<void> {
  const p = params ?? {};
  const q = new URLSearchParams();
  q.set('status', p.status ?? 'queued');
  q.set('limit', String(p.limit ?? 20000));
  const response = await authenticatedFetch(`/reality/outreach/queue/export/csv?${q.toString()}`);
  if (!response.ok) throw new Error(`Outreach export selhal: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `outreach-queue-${p.status ?? 'queued'}-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================================
// APIFY SREALITY STATISTICS
// ==========================================

export interface ApifyRunStatus {
  runId: string;
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED' | 'TIMED-OUT';
  stats?: { durationMillis?: number };
  startedAt?: string;
  finishedAt?: string;
  defaultDatasetId?: string;
}

export interface ApifyStatRow {
  id: string;
  region?: string | null;
  district?: string | null;
  locality?: string | null;
  lat?: number | null;
  lon?: number | null;
  categoryMain: string;
  categoryType: string;
  disposition?: string | null;
  count: number;
  avgPrice?: number | null;
  medianPrice?: number | null;
  avgPricePerM2?: number | null;
  medianPricePerM2?: number | null;
  avgArea?: number | null;
  scrapedAt: string;
}

export interface ApifyInfo {
  runId: string | null;
  scrapedAt: Date | null;
  count: number;
}

export interface PriceEstimateParams {
  address: string;
  area: number;
  categoryMain?: string;
  categoryType?: string;
  disposition?: string;
  features?: {
    terrace?: boolean;
    balcony?: boolean;
    garage?: boolean;
    elevator?: boolean;
    cellar?: boolean;
    parkingLot?: boolean;
    loggia?: boolean;
    brick?: boolean;
    panel?: boolean;
    newBuilding?: boolean;
    afterReconstruction?: boolean;
    inReconstruction?: boolean;
    personalOwnership?: boolean;
    cooperativeOwnership?: boolean;
    furnished?: boolean;
    partlyFurnished?: boolean;
  };
  lat?: number;
  lon?: number;
}

export interface PriceEstimateResult {
  low: number;
  mid: number;
  high: number;
  basePricePerM2: number;
  adjustedPricePerM2: number;
  comparablesCount: number;
  radiusKm: number;
  geocoded: { lat: number; lon: number } | null;
  comparables: Array<{
    id: string;
    title: string;
    currentPrice: number;
    pricePerM2: number;
    usableArea: number;
    locality: string;
    distanceKm: number;
    disposition?: string;
  }>;
  featureCoefficients: Record<string, number>;
  error?: string;
}

export async function runApifyScrape(token: string, input?: object): Promise<{ runId: string }> {
  return request<{ runId: string }>('/reality/apify/run', 'POST', { token, input });
}

export async function getApifyRunStatus(runId: string, token: string): Promise<ApifyRunStatus> {
  return request<ApifyRunStatus>(`/reality/apify/status/${runId}?token=${encodeURIComponent(token)}`);
}

export async function importApifyResults(
  runId: string,
  body: { token: string; datasetId: string; clearOld?: boolean },
): Promise<{ imported: number; errors: number }> {
  return request<{ imported: number; errors: number }>(`/reality/apify/import/${runId}`, 'POST', body);
}

export async function getApifyInfo(): Promise<ApifyInfo> {
  return request<ApifyInfo>('/reality/apify/info');
}

export async function clearApifyStats(): Promise<{ deleted: number }> {
  return request<{ deleted: number }>('/reality/apify/stats', 'DELETE');
}

export async function getApifyStats(params?: {
  region?: string;
  district?: string;
  locality?: string;
  categoryMain?: string;
  categoryType?: string;
  disposition?: string;
  page?: number;
  limit?: number;
}): Promise<ListResponse<ApifyStatRow>> {
  const q = new URLSearchParams();
  if (params?.region)       q.set('region',       params.region);
  if (params?.district)     q.set('district',     params.district);
  if (params?.locality)     q.set('locality',     params.locality);
  if (params?.categoryMain) q.set('categoryMain', params.categoryMain);
  if (params?.categoryType) q.set('categoryType', params.categoryType);
  if (params?.disposition)  q.set('disposition',  params.disposition);
  if (params?.page)         q.set('page',         String(params.page));
  if (params?.limit)        q.set('limit',        String(params.limit));
  return request<ListResponse<ApifyStatRow>>(`/reality/apify/stats?${q.toString()}`);
}

export async function estimatePrice(params: PriceEstimateParams): Promise<PriceEstimateResult> {
  return request<PriceEstimateResult>('/reality/price-estimate', 'POST', params);
}

export async function getFeatureCoefficients(
  categoryMain = 'Byty',
  categoryType = 'Prodej',
): Promise<Record<string, number>> {
  const q = new URLSearchParams({ categoryMain, categoryType });
  return request<Record<string, number>>(`/reality/feature-coefficients?${q.toString()}`);
}

// ==========================================
// BEZREALITKY LISTINGS — own table
// ==========================================

export interface BezrealitkyListingItem {
  id: string;
  bzrId: string;
  title: string;
  description?: string | null;
  originalPrice: number;
  currentPrice: number;
  pricePerM2?: number | null;
  usableArea?: number | null;
  disposition?: string | null;
  locality?: string | null;
  gpsLat?: number | null;
  gpsLon?: number | null;
  listingState: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalPriceChanges: number;
  finalPrice?: number | null;
  soldAt?: string | null;
  sourceUrl?: string | null;
  categoryMain?: string | null;
  categoryType?: string | null;
  region?: string | null;
  garage: boolean;
  elevator: boolean;
  balcony: boolean;
  cellar: boolean;
  loggia: boolean;
  parkingLot: boolean;
  terrace: boolean;
  furnished: boolean;
  partlyFurnished: boolean;
  unfurnished: boolean;
  panel: boolean;
  brick: boolean;
  newBuilding: boolean;
  afterReconstruction: boolean;
  inReconstruction: boolean;
  lowEnergy: boolean;
  landArea?: number | null;
  personalOwnership: boolean;
  stateOwnership: boolean;
  cooperativeOwnership: boolean;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchBezrealitkyListings(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const p = params ?? {};
  const q = new URLSearchParams();
  q.set('page', String(p.page ?? 1));
  q.set('limit', String(p.limit ?? 50));
  if (p.search) q.set('search', p.search);
  if (p.sortBy) q.set('sortBy', p.sortBy);
  if (p.sortOrder) q.set('sortOrder', p.sortOrder);
  return request<ListResponse<BezrealitkyListingItem>>(`/reality/bezrealitky-listings?${q.toString()}`);
}

export async function fetchBezrealitkyListingById(id: string): Promise<BezrealitkyListingItem> {
  return request<BezrealitkyListingItem>(`/reality/bezrealitky-listings/${id}`);
}

// ==========================================
// STATS SCRAPER (vlastní scraper statistik)
// ==========================================

export interface StatsScrapeStatus {
  running: boolean;
  phase: 'idle' | 'scraping' | 'saving' | 'done' | 'error';
  current: string;
  combosTotal: number;
  combosDone: number;
  itemsCollected: number;
  rowsSaved: number;
  errors: number;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage?: string;
}

export async function startStatsScrape(params?: {
  clearOld?: boolean;
  categoryMains?: number[];
  categoryTypes?: number[];
  regionIds?: number[];
}): Promise<{ started: boolean; error?: string }> {
  return request<{ started: boolean; error?: string }>('/reality/stats-scrape/start', 'POST', params ?? {});
}

export async function getStatsScrapeStatus(): Promise<StatsScrapeStatus> {
  return request<StatsScrapeStatus>('/reality/stats-scrape/status');
}

export interface SrealityStatEntry {
  id: string;
  region: string;
  categoryMain: string;
  categoryType: string;
  disposition?: string | null;
  sampleCount: number;
  totalCount: number;
  avgPricePerM2?: number | null;
  medianPricePerM2?: number | null;
  avgPrice?: number | null;
  medianPrice?: number | null;
  avgArea?: number | null;
  scrapedAt: string;
}

export async function getStatsScrapeData(params?: {
  region?: string;
  categoryMain?: string;
  categoryType?: string;
  disposition?: string;
  page?: number;
  limit?: number;
}): Promise<ListResponse<SrealityStatEntry>> {
  const q = new URLSearchParams();
  if (params?.region)       q.set('region',       params.region);
  if (params?.categoryMain) q.set('categoryMain', params.categoryMain);
  if (params?.categoryType) q.set('categoryType', params.categoryType);
  if (params?.disposition)  q.set('disposition',  params.disposition);
  if (params?.page)         q.set('page',         String(params.page));
  if (params?.limit)        q.set('limit',        String(params.limit));
  return request<ListResponse<SrealityStatEntry>>(`/reality/stats-scrape/data?${q.toString()}`);
}

// ==========================================
// BEZREALITKY.CZ SCRAPER
// ==========================================

export interface BzrScrapeResult {
  scrape: {
    totalFound: number;
    pagesScraped: number;
    itemsScraped: number;
    scrapeErrors: number;
  };
  import: {
    created: number;
    updated: number;
    unchanged: number;
    errors: number;
  };
  error?: string;
}

export async function scrapeBezrealitky(params?: {
  offerType?: string;
  estateType?: string;
  maxPages?: number;
  startPage?: number;
  syncType?: 'full' | 'delta';
}): Promise<BzrScrapeResult> {
  const query = new URLSearchParams();
  if (params?.offerType) query.set('offerType', params.offerType);
  if (params?.estateType) query.set('estateType', params.estateType);
  if (params?.maxPages !== undefined) query.set('maxPages', String(params.maxPages));
  if (params?.startPage !== undefined) query.set('startPage', String(params.startPage));
  const syncType = params?.syncType ?? 'delta';
  return request<BzrScrapeResult>(
    `/reality/bezrealitky-scrape?${query.toString()}`,
    'POST',
    { syncType },
  );
}

// ==========================================
// FIRMY.CZ (Company Directory)
// ==========================================

export interface BackendFirmyCzListing {
  id: string;
  firmyId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  gpsLat?: number | null;
  gpsLon?: number | null;
  phone?: string | null;
  phones?: string | null;      // JSON array string
  email?: string | null;
  emails?: string | null;      // JSON array string
  website?: string | null;
  websites?: string | null;    // JSON array string
  sourceUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  ic?: string | null;
  openingHours?: string | null; // JSON object string { mo: "09:00-17:00", ... }
  facebook?: string | null;
  instagram?: string | null;
  logoUrl?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirmyListingFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  city?: string;
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FirmyScrapeProgress {
  category: string;
  count: number;
}

export interface FirmyCategoryInfo {
  path: string;
  label: string;
  hasCompanies: boolean;
}

export async function discoverFirmyCategories(path?: string): Promise<FirmyCategoryInfo[]> {
  const query = new URLSearchParams();
  if (path) query.set('path', path);
  return request<FirmyCategoryInfo[]>(`/firmy/categories?${query.toString()}`);
}

export async function fetchFirmyListings(params?: FirmyListingFilters) {
  const p = params ?? {};
  const query = new URLSearchParams();
  query.set('page', String(p.page ?? 1));
  query.set('limit', String(p.limit ?? 50));
  if (p.search) query.set('search', p.search);
  if (p.category) query.set('category', p.category);
  if (p.city) query.set('city', p.city);
  if (p.minRating !== undefined) query.set('minRating', String(p.minRating));
  if (p.sortBy) query.set('sortBy', p.sortBy);
  if (p.sortOrder) query.set('sortOrder', p.sortOrder);
  return request<ListResponse<BackendFirmyCzListing>>(`/firmy?${query.toString()}`);
}

export async function getFirmyScrapeProgress(): Promise<FirmyScrapeProgress[]> {
  return request<FirmyScrapeProgress[]>('/firmy/scrape-progress');
}

export async function fetchFirmyListing(id: string): Promise<BackendFirmyCzListing> {
  return request<BackendFirmyCzListing>(`/firmy/${id}`);
}

export async function scrapeFirmy(params: {
  categoryPath: string;
  maxPages?: number;
  startPage?: number;
  quick?: boolean;
}): Promise<ScrapeResult> {
  const query = new URLSearchParams();
  query.set('categoryPath', params.categoryPath);
  if (params.maxPages !== undefined) query.set('maxPages', String(params.maxPages));
  if (params.startPage !== undefined) query.set('startPage', String(params.startPage));
  if (params.quick) query.set('quick', 'true');
  return request<ScrapeResult>(`/firmy/scrape?${query.toString()}`, 'POST');
}

export async function downloadFirmyCsv(): Promise<void> {
  const response = await authenticatedFetch('/firmy/export/csv');
  if (!response.ok) throw new Error(`Export selhal: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `firmy-export-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Backup API ──────────────────────────────────────────────────────────

export interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

export async function listBackups(): Promise<BackupFile[]> {
  return requestLocalPreferredWithTimeout<BackupFile[]>('/backup', 'GET', undefined, 15000);
}

export async function createBackup(): Promise<{ success: boolean; filename?: string; error?: string }> {
  return requestLocalPreferredWithTimeout('/backup', 'POST', undefined, 45000);
}

export async function downloadBackup(filename: string): Promise<void> {
  const response = await authenticatedFetchLocalPreferred(`/backup/${encodeURIComponent(filename)}`);
  if (!response.ok) throw new Error(`Stažení selhalo: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatPersonName(person?: {
  firstName?: string;
  lastName?: string;
  email?: string;
} | null): string {
  const first = person?.firstName ?? '';
  const last = person?.lastName ?? '';
  const full = `${first} ${last}`.trim();

  if (full) return full;
  if (person?.email) return person.email;

  return 'Unknown';
}

// ============================================================
// PROJECT MANAGEMENT MODULE (PM)
// ============================================================

export async function pmFetchProjects(params?: {
  search?: string; status?: string; priority?: string;
  activeWave?: boolean; category?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.status) q.set('status', params.status);
  if (params?.priority) q.set('priority', params.priority);
  if (params?.activeWave !== undefined) q.set('activeWave', String(params.activeWave));
  if (params?.category) q.set('category', params.category);
  if (params?.sortBy) q.set('sortBy', params.sortBy);
  if (params?.sortOrder) q.set('sortOrder', params.sortOrder);
  const qs = q.toString();
  return requestLocalPreferred<any[]>(`/pm/projects${qs ? `?${qs}` : ''}`);
}

export async function pmFetchProject(id: string) {
  return requestLocalPreferred<any>(`/pm/projects/${id}`);
}

export async function pmFetchDashboard() {
  return requestLocalPreferred<any>('/pm/projects/dashboard');
}

export async function pmCreateProject(data: any) {
  return requestLocalPreferred<any>('/pm/projects', 'POST', data);
}

export async function pmUpdateProject(id: string, data: any) {
  return requestLocalPreferred<any>(`/pm/projects/${id}`, 'PATCH', data);
}

export async function pmDeleteProject(id: string) {
  return requestLocalPreferred<any>(`/pm/projects/${id}`, 'DELETE');
}

export async function pmFetchTasks(params?: {
  projectId?: string; areaId?: string; milestoneId?: string;
  status?: string; priority?: string; search?: string;
  sortBy?: string; sortOrder?: 'asc' | 'desc';
}) {
  const q = new URLSearchParams();
  if (params?.projectId) q.set('projectId', params.projectId);
  if (params?.areaId) q.set('areaId', params.areaId);
  if (params?.milestoneId) q.set('milestoneId', params.milestoneId);
  if (params?.status) q.set('status', params.status);
  if (params?.priority) q.set('priority', params.priority);
  if (params?.search) q.set('search', params.search);
  if (params?.sortBy) q.set('sortBy', params.sortBy);
  if (params?.sortOrder) q.set('sortOrder', params.sortOrder);
  const qs = q.toString();
  return requestLocalPreferred<any[]>(`/pm/tasks${qs ? `?${qs}` : ''}`);
}

export async function pmFetchTask(id: string) {
  return requestLocalPreferred<any>(`/pm/tasks/${id}`);
}

export async function pmCreateTask(data: any) {
  return requestLocalPreferred<any>('/pm/tasks', 'POST', data);
}

export async function pmUpdateTask(id: string, data: any) {
  return requestLocalPreferred<any>(`/pm/tasks/${id}`, 'PATCH', data);
}

export async function pmDeleteTask(id: string) {
  return requestLocalPreferred<any>(`/pm/tasks/${id}`, 'DELETE');
}

export async function pmReorderTasks(tasks: { id: string; order: number }[]) {
  return requestLocalPreferred<any>('/pm/tasks/reorder', 'PATCH', { tasks });
}

export async function pmFetchAreas(projectId: string) {
  return requestLocalPreferred<any[]>(`/pm/projects/${projectId}/areas`);
}

export async function pmCreateArea(data: any) {
  return requestLocalPreferred<any>('/pm/areas', 'POST', data);
}

export async function pmUpdateArea(id: string, data: any) {
  return requestLocalPreferred<any>(`/pm/areas/${id}`, 'PATCH', data);
}

export async function pmDeleteArea(id: string) {
  return requestLocalPreferred<any>(`/pm/areas/${id}`, 'DELETE');
}

export async function pmFetchMilestones(projectId: string) {
  return requestLocalPreferred<any[]>(`/pm/projects/${projectId}/milestones`);
}

export async function pmCreateMilestone(data: any) {
  return requestLocalPreferred<any>('/pm/milestones', 'POST', data);
}

export async function pmUpdateMilestone(id: string, data: any) {
  return requestLocalPreferred<any>(`/pm/milestones/${id}`, 'PATCH', data);
}

export async function pmDeleteMilestone(id: string) {
  return requestLocalPreferred<any>(`/pm/milestones/${id}`, 'DELETE');
}

export async function pmFetchDay(date: string) {
  return requestLocalPreferred<any>(`/pm/planner/day/${date}`);
}

export async function pmFetchWeekSlots(weekStart: string) {
  return requestLocalPreferred<any[]>(`/pm/planner/week/${weekStart}`);
}

export async function pmCreateSlot(data: any) {
  return requestLocalPreferred<any>('/pm/planner/slots', 'POST', data);
}

export async function pmUpdateSlot(id: string, data: any) {
  return requestLocalPreferred<any>(`/pm/planner/slots/${id}`, 'PATCH', data);
}

export async function pmDeleteSlot(id: string) {
  return requestLocalPreferred<any>(`/pm/planner/slots/${id}`, 'DELETE');
}

export async function pmApplyDayTemplate(date: string) {
  return requestLocalPreferred<any[]>(`/pm/planner/template/${date}/apply`, 'POST');
}

export async function pmFetchWeeklyCapacity(week: string) {
  return requestLocalPreferred<any[]>(`/pm/planner/weekly/${week}`);
}

export async function pmUpsertWeeklyCapacity(data: {
  week: string; projectId: string; plannedHours?: number; actualHours?: number;
}) {
  return requestLocalPreferred<any>('/pm/planner/weekly', 'POST', data);
}

export async function pmFetchWorklog(params?: {
  projectId?: string; taskId?: string; dateFrom?: string; dateTo?: string;
}) {
  const q = new URLSearchParams();
  if (params?.projectId) q.set('projectId', params.projectId);
  if (params?.taskId) q.set('taskId', params.taskId);
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
  if (params?.dateTo) q.set('dateTo', params.dateTo);
  const qs = q.toString();
  return requestLocalPreferred<any[]>(`/pm/worklog${qs ? `?${qs}` : ''}`);
}

export async function pmFetchWorklogSummary(params?: { dateFrom?: string; dateTo?: string }) {
  const q = new URLSearchParams();
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
  if (params?.dateTo) q.set('dateTo', params.dateTo);
  const qs = q.toString();
  return requestLocalPreferred<any>(`/pm/worklog/summary${qs ? `?${qs}` : ''}`);
}

export async function pmCreateWorklog(data: {
  date: string; duration: number; note?: string; projectId: string; taskId?: string;
}) {
  return requestLocalPreferred<any>('/pm/worklog', 'POST', data);
}

export async function pmDeleteWorklog(id: string) {
  return requestLocalPreferred<any>(`/pm/worklog/${id}`, 'DELETE');
}

export async function pmFetchDailyReview(date: string) {
  return requestLocalPreferred<any>(`/pm/planner/review/daily/${date}`);
}

export async function pmFetchWeeklyReview(week: string) {
  return requestLocalPreferred<any>(`/pm/planner/review/weekly/${week}`);
}

export async function pmSeed() {
  return requestLocalPreferred<any>('/pm/seed', 'POST');
}

export async function pmReset() {
  return requestLocalPreferred<any>('/pm/seed', 'DELETE');
}

// ============================================================
// PROBLEM DOMAINS MODULE
// ============================================================

export interface ProblemDomainsCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  detailedDescription?: string | null;
  serviceTypeDescription?: string | null;
  typicalLandingPage?: string | null;
  typicalAcquisition?: string | null;
  typicalFunnel?: string | null;
  typicalMonetization?: string | null;
  typicalDarkPatterns?: string | null;
  typicalComplaints?: string | null;
  riskSignals?: string | null;
  businessModelTags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemDomainsSubcategory extends ProblemDomainsCategory {
  categoryId: string;
  category?: ProblemDomainsCategory;
}

export interface ProblemDomainRow {
  id: string;
  domain: string;
  categoryId: string;
  subcategoryId?: string | null;
  businessModelTags: string[];
  trustpilotUrl?: string | null;
  trustScore?: number | null;
  reviewCountTotal?: number | null;
  rating1Count?: number | null;
  rating2Count?: number | null;
  rating3Count?: number | null;
  rating4Count?: number | null;
  rating5Count?: number | null;
  negativeReviewsCount?: number | null;
  negativeRatio?: number | null;
  negativeReviewsOverride?: number | null;
  lastSyncedAt?: string | null;
  syncStatus: string;
  sourceType?: string | null;
  sourceOrigin: string;
  notes?: string | null;
  internalNote?: string | null;
  tags: string[];
  isSeed: boolean;
  trackActive: boolean;
  lastSyncError?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: ProblemDomainsCategory;
  subcategory?: ProblemDomainsSubcategory | null;
  _ranking?: {
    worstByTrustScore: number;
    worstByNegativeReviewsCount: number;
    worstByNegativeRatio: number;
    worstComposite: number;
  };
}

export interface ProblemDomainSnapshot {
  id: string;
  runId?: string | null;
  trustScore?: number | null;
  reviewCountTotal?: number | null;
  negativeReviewsCount?: number | null;
  negativeRatio?: number | null;
  capturedAt: string;
}

export interface ProblemDomainChange {
  id: string;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  changeSource?: string | null;
  createdAt: string;
}

export interface ProblemDomainNegativeReview {
  id: string;
  rating: number;
  title?: string | null;
  text: string;
  authorName?: string | null;
  publishedAt?: string | null;
  sourceUrl?: string | null;
  sourceType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemDomainImportRun {
  id: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt?: string | null;
  totalDomains: number;
  syncedCount: number;
  skippedCount: number;
  errorCount: number;
  createdAt: string;
}

export interface ProblemDomainImportLog {
  id: string;
  runId: string;
  domainId?: string | null;
  domain?: string | null;
  status: string;
  message: string;
  errorCode?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface ProblemDomainListQuery {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  businessModel?: string;
  syncStatus?: string;
  sourceOrigin?: string;
  isSeed?: 'true' | 'false';
  minTrustScore?: number;
  maxTrustScore?: number;
  minReviews?: number;
  maxReviews?: number;
  minNegativeReviews?: number;
  maxNegativeReviews?: number;
  lastUpdatedFrom?: string;
  lastUpdatedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function appendQuery(params: URLSearchParams, value?: string | number | boolean | null, key?: string) {
  if (!key) return;
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

export async function fetchProblemDomainsDashboard() {
  return requestLocalPreferred<any>('/problem-domains/dashboard');
}

export async function fetchProblemDomainsOptions() {
  return requestLocalPreferred<{
    categories: ProblemDomainsCategory[];
    subcategories: ProblemDomainsSubcategory[];
    businessModelTags: string[];
    syncStatuses: string[];
    negativeDefinition: 'rating1' | 'rating1_2';
  }>('/problem-domains/options');
}

export async function fetchProblemDomainsCategories(params?: ProblemDomainListQuery) {
  const q = new URLSearchParams();
  appendQuery(q, params?.search, 'search');
  appendQuery(q, params?.page, 'page');
  appendQuery(q, params?.limit, 'limit');
  return requestLocalPreferred<ListResponse<ProblemDomainsCategory>>(`/problem-domains/categories?${q.toString()}`);
}

export async function fetchProblemDomainsCategoryDetail(id: string, params?: ProblemDomainListQuery) {
  const q = new URLSearchParams();
  appendQuery(q, params?.search, 'search');
  appendQuery(q, params?.subcategoryId, 'subcategoryId');
  appendQuery(q, params?.syncStatus, 'syncStatus');
  appendQuery(q, params?.minTrustScore, 'minTrustScore');
  appendQuery(q, params?.maxTrustScore, 'maxTrustScore');
  appendQuery(q, params?.minReviews, 'minReviews');
  appendQuery(q, params?.maxReviews, 'maxReviews');
  appendQuery(q, params?.minNegativeReviews, 'minNegativeReviews');
  appendQuery(q, params?.maxNegativeReviews, 'maxNegativeReviews');
  appendQuery(q, params?.page, 'page');
  appendQuery(q, params?.limit, 'limit');
  appendQuery(q, params?.sortBy, 'sortBy');
  appendQuery(q, params?.sortOrder, 'sortOrder');
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return requestLocalPreferred<any>(`/problem-domains/categories/${encodeURIComponent(id)}${suffix}`);
}

export async function fetchProblemDomainsSubcategoryDetail(id: string, params?: ProblemDomainListQuery) {
  const q = new URLSearchParams();
  appendQuery(q, params?.search, 'search');
  appendQuery(q, params?.syncStatus, 'syncStatus');
  appendQuery(q, params?.minTrustScore, 'minTrustScore');
  appendQuery(q, params?.maxTrustScore, 'maxTrustScore');
  appendQuery(q, params?.minReviews, 'minReviews');
  appendQuery(q, params?.maxReviews, 'maxReviews');
  appendQuery(q, params?.minNegativeReviews, 'minNegativeReviews');
  appendQuery(q, params?.maxNegativeReviews, 'maxNegativeReviews');
  appendQuery(q, params?.page, 'page');
  appendQuery(q, params?.limit, 'limit');
  appendQuery(q, params?.sortBy, 'sortBy');
  appendQuery(q, params?.sortOrder, 'sortOrder');
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return requestLocalPreferred<any>(`/problem-domains/subcategories/${encodeURIComponent(id)}${suffix}`);
}

export async function fetchProblemDomainsList(params?: ProblemDomainListQuery) {
  const q = new URLSearchParams();
  appendQuery(q, params?.search, 'search');
  appendQuery(q, params?.categoryId, 'categoryId');
  appendQuery(q, params?.subcategoryId, 'subcategoryId');
  appendQuery(q, params?.businessModel, 'businessModel');
  appendQuery(q, params?.syncStatus, 'syncStatus');
  appendQuery(q, params?.sourceOrigin, 'sourceOrigin');
  appendQuery(q, params?.isSeed, 'isSeed');
  appendQuery(q, params?.minTrustScore, 'minTrustScore');
  appendQuery(q, params?.maxTrustScore, 'maxTrustScore');
  appendQuery(q, params?.minReviews, 'minReviews');
  appendQuery(q, params?.maxReviews, 'maxReviews');
  appendQuery(q, params?.minNegativeReviews, 'minNegativeReviews');
  appendQuery(q, params?.maxNegativeReviews, 'maxNegativeReviews');
  appendQuery(q, params?.lastUpdatedFrom, 'lastUpdatedFrom');
  appendQuery(q, params?.lastUpdatedTo, 'lastUpdatedTo');
  appendQuery(q, params?.page, 'page');
  appendQuery(q, params?.limit, 'limit');
  appendQuery(q, params?.sortBy, 'sortBy');
  appendQuery(q, params?.sortOrder, 'sortOrder');
  return requestLocalPreferred<ListResponse<ProblemDomainRow>>(`/problem-domains/domains?${q.toString()}`);
}

export async function fetchProblemDomainDetail(id: string) {
  return requestLocalPreferred<ProblemDomainRow & {
    snapshots: ProblemDomainSnapshot[];
    changes: ProblemDomainChange[];
    negativeReviews: ProblemDomainNegativeReview[];
  }>(`/problem-domains/domains/${encodeURIComponent(id)}`);
}

export async function createProblemDomain(payload: {
  domain: string;
  categoryId: string;
  subcategoryId?: string;
  businessModelTags?: string[];
  trustpilotUrl?: string;
  notes?: string;
  isSeed?: boolean;
}) {
  return requestLocalPreferred<ProblemDomainRow>('/problem-domains/domains', 'POST', payload);
}

export async function updateProblemDomain(id: string, payload: Record<string, unknown>) {
  return requestLocalPreferred<ProblemDomainRow>(`/problem-domains/domains/${encodeURIComponent(id)}`, 'PATCH', payload);
}

export async function refreshProblemDomain(id: string) {
  return requestLocalPreferred<any>(`/problem-domains/domains/${encodeURIComponent(id)}/refresh`, 'POST');
}

export async function bulkRefreshProblemDomains(payload?: { domainIds?: string[]; limit?: number }) {
  return requestLocalPreferred<any>('/problem-domains/domains/bulk-refresh', 'POST', payload ?? {});
}

export async function fetchProblemDomainsRankings(params?: {
  metric?: 'worstByTrustScore' | 'worstByNegativeReviewsCount' | 'worstByNegativeRatio' | 'worstComposite';
  categoryId?: string;
  subcategoryId?: string;
  limit?: number;
}) {
  const q = new URLSearchParams();
  appendQuery(q, params?.metric, 'metric');
  appendQuery(q, params?.categoryId, 'categoryId');
  appendQuery(q, params?.subcategoryId, 'subcategoryId');
  appendQuery(q, params?.limit, 'limit');
  return requestLocalPreferred<{ metric: string; rows: ProblemDomainRow[] }>(`/problem-domains/rankings?${q.toString()}`);
}

export async function syncProblemDomains(payload?: {
  domainIds?: string[];
  onlyPending?: boolean;
  limit?: number;
}) {
  return requestLocalPreferred<any>('/problem-domains/sync', 'POST', payload ?? {});
}

export async function importProblemDomains(payload: {
  csvText?: string;
  jsonRows?: Array<Record<string, unknown>>;
  defaultCategoryId?: string;
  defaultSubcategoryId?: string;
  defaultBusinessModelTags?: string[];
}) {
  return requestLocalPreferred<any>('/problem-domains/import/csv-json', 'POST', payload);
}

export async function fetchProblemDomainImportRuns(page = 1, limit = 20) {
  return requestLocalPreferred<ListResponse<ProblemDomainImportRun>>(
    `/problem-domains/import-runs?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
  );
}

export async function fetchProblemDomainImportLogs(runId: string, page = 1, limit = 200) {
  return requestLocalPreferred<ListResponse<ProblemDomainImportLog>>(
    `/problem-domains/import-runs/${encodeURIComponent(runId)}/logs?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
  );
}

export async function updateProblemDomainNegativeDefinition(mode: 'rating1' | 'rating1_2') {
  return requestLocalPreferred<any>('/problem-domains/settings/negative-definition', 'PATCH', { mode });
}

export async function exportProblemDomainsCsv(params?: ProblemDomainListQuery): Promise<void> {
  const q = new URLSearchParams();
  appendQuery(q, params?.search, 'search');
  appendQuery(q, params?.categoryId, 'categoryId');
  appendQuery(q, params?.subcategoryId, 'subcategoryId');
  appendQuery(q, params?.businessModel, 'businessModel');
  appendQuery(q, params?.syncStatus, 'syncStatus');
  appendQuery(q, params?.sourceOrigin, 'sourceOrigin');
  appendQuery(q, params?.isSeed, 'isSeed');
  appendQuery(q, params?.minTrustScore, 'minTrustScore');
  appendQuery(q, params?.maxTrustScore, 'maxTrustScore');
  appendQuery(q, params?.minReviews, 'minReviews');
  appendQuery(q, params?.maxReviews, 'maxReviews');
  appendQuery(q, params?.minNegativeReviews, 'minNegativeReviews');
  appendQuery(q, params?.maxNegativeReviews, 'maxNegativeReviews');
  appendQuery(q, params?.lastUpdatedFrom, 'lastUpdatedFrom');
  appendQuery(q, params?.lastUpdatedTo, 'lastUpdatedTo');

  const response = await authenticatedFetchLocalPreferred(
    `/problem-domains/domains/export/csv${q.toString() ? `?${q.toString()}` : ''}`,
  );
  if (!response.ok) {
    throw new Error(`Export failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `problem-domains-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface MarketingArticleRecord {
  slug: string;
  sourceUrl: string;
  title: string;
  excerpt: string;
  categories: string[];
  author: string | null;
  lastUpdatedLabel: string | null;
  readTimeLabel: string | null;
  publishedAt: string | null;
  scrapedAt: string;
  bodyHtml: string;
  bodyText: string;
  coverImageUrl: string | null;
  coverImageLocalPath: string | null;
  imageUrls: string[];
  imageLocalPaths: string[];
  styleUrls: string[];
  rewrittenBody: string | null;
  rewrittenAt: string | null;
}

export interface MarketingScrapeStatus {
  running: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  processedArticles: number;
  totalDiscoveredUrls: number;
  downloadedImages: number;
  errorCount: number;
  message: string;
}

export interface MarketingScrapeResult {
  source: string;
  scannedArticleUrls: number;
  processedArticles: number;
  createdArticles: number;
  updatedArticles: number;
  downloadedImages: number;
  errors: Array<{ url: string; message: string }>;
  finishedAt: string;
}

export async function fetchMarketingStatus() {
  return requestLocalPreferred<MarketingScrapeStatus>('/marketing/status');
}

export async function fetchMarketingArticles() {
  return requestLocalPreferred<{
    total: number;
    updatedAt: string | null;
    data: MarketingArticleRecord[];
  }>('/marketing/articles');
}

export async function fetchMarketingArticle(slug: string) {
  return requestLocalPreferred<MarketingArticleRecord>(`/marketing/articles/${encodeURIComponent(slug)}`);
}

export async function importMarketingArticle(slug: string) {
  return requestLocalPreferred<{ ok: boolean; blogPostId: string; message: string }>(
    `/marketing/articles/${encodeURIComponent(slug)}/import`, 'POST',
  );
}

export async function fetchMarketingNextBatch(size = 1) {
  return requestLocalPreferred<{ total: number; data: MarketingArticleRecord[] }>(
    `/marketing/articles/next-batch?size=${size}`,
  );
}

export async function runMarketingScrape(payload?: { force?: boolean; maxArticles?: number }) {
  const query = new URLSearchParams();
  if (typeof payload?.force === 'boolean') query.set('force', String(payload.force));
  if (typeof payload?.maxArticles === 'number' && Number.isFinite(payload.maxArticles)) {
    query.set('maxArticles', String(Math.max(1, Math.floor(payload.maxArticles))));
  }
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestLocalPreferred<MarketingScrapeResult>(`/marketing/scrape${suffix}`, 'POST');
}

export async function runMarketingScrapeOne(payload?: { url?: string; force?: boolean }) {
  const query = new URLSearchParams();
  if (typeof payload?.force === 'boolean') query.set('force', String(payload.force));
  if (payload?.url && payload.url.trim().length > 0) query.set('url', payload.url.trim());
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestLocalPreferred<MarketingScrapeResult>(`/marketing/scrape-one${suffix}`, 'POST');
}

export async function runMarketingRewriteOne(slug: string) {
  const query = new URLSearchParams({ slug });
  return requestLocalPreferred<MarketingArticleRecord>(`/marketing/rewrite-one?${query.toString()}`, 'POST');
}

export async function saveMarketingRewrite(slug: string, rewrittenBody: string) {
  const query = new URLSearchParams({ slug });
  return requestLocalPreferred<MarketingArticleRecord>(
    `/marketing/save-rewrite?${query.toString()}`,
    'POST',
    { rewrittenBody },
  );
}

export interface MarketingRewriteStatus {
  running: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  processed: number;
  total: number;
  errors: number;
  message: string;
  currentSlug: string | null;
}

export async function fetchMarketingRewriteStatus() {
  return requestLocalPreferred<MarketingRewriteStatus>('/marketing/rewrite-status');
}

export async function runMarketingRewriteNext() {
  return requestLocalPreferred<{ ok: boolean; slug?: string; message: string }>(
    '/marketing/rewrite-next',
    'POST',
  );
}

export async function runMarketingRewriteAll(force = false) {
  const query = new URLSearchParams({ force: String(force) });
  return requestLocalPreferred<{ started: boolean; message: string }>(
    `/marketing/rewrite-all?${query.toString()}`,
    'POST',
  );
}

export interface GoogleAdsStatus {
  configured: boolean;
  missingEnv: string[];
  loginCustomerId?: string | null;
}

export interface GoogleAdsCustomer {
  id: string;
  descriptiveName: string;
  currencyCode?: string | null;
  timeZone?: string | null;
  resourceName?: string;
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
}

export interface GoogleAdsAdGroup {
  id: string;
  name: string;
  status: string;
}

export interface PublishGoogleAdsPayload {
  customerId: string;
  campaignId: string;
  adGroupId: string;
  type: 'search' | 'display_image';
  finalUrl: string;
  headline1?: string;
  headline2?: string;
  headline3?: string;
  description1?: string;
  description2?: string;
  path1?: string;
  path2?: string;
  businessName?: string;
  longHeadline?: string;
  callToActionText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  imageFileName?: string;
  status?: 'PAUSED' | 'ENABLED';
}

export interface GoogleAdsGenerateCopyPayload {
  adType: 'search' | 'display_image';
  campaignName: string;
  brief: string;
  domainName?: string;
  finalUrl?: string;
}

export interface GoogleAdsGeneratedCopy {
  campaignName: string;
  adType: 'search' | 'display_image';
  keywords: string[];
  headlines: string[];
  descriptions: string[];
  longHeadline: string;
  businessName: string;
  callToActionText: string;
}

export interface GoogleAdsActiveAd {
  adId: string;
  adType: string;
  status: string;
  campaign: { id: string; name: string; status: string };
  adGroup: { id: string; name: string; status: string };
  finalUrls: string[];
  headlines: string[];
  descriptions: string[];
  longHeadline: string | null;
  businessName: string | null;
  callToActionText: string | null;
  imageUrls: string[];
}

export interface GoogleAdsCompetitorAd {
  adId: string;
  advertiserName: string;
  adType: 'IMAGE' | 'VIDEO' | 'TEXT' | 'UNKNOWN';
  headlines: string[];
  descriptions: string[];
  imageUrls: string[];
  videoUrls: string[];
  landingPageUrls: string[];
  placements: string[];
  regions: string[];
  firstSeen: string | null;
  lastSeen: string | null;
  sourceUrl: string;
  isActive?: boolean;
  sourceRegion?: string;
}

export interface GoogleAdsCompetitorAdsResult {
  domain: string;
  region: string;
  fetchedAt: string;
  source: 'google-ads-transparency';
  cached: boolean;
  total: number;
  limitations: string[];
  ads: GoogleAdsCompetitorAd[];
  scannedRegions?: string[];
  refreshStatus?: {
    running: boolean;
    startedAt: string | null;
    finishedAt: string | null;
    lastError: string | null;
    processedRegions: number;
    totalRegions: number;
  };
  sync?: {
    inserted: number;
    updated: number;
    unchanged: number;
    deactivated: number;
    source: 'scrape' | 'database-fallback' | 'database-cache' | 'background-started' | 'manual-import';
  };
}

export interface BackendProjectListItem {
  id: string;
  key: string;
  name: string;
  url?: string | null;
  domains: string[];
  isActive: boolean;
}

export async function fetchGoogleAdsStatus() {
  return requestLocalPreferred<GoogleAdsStatus>('/google-ads/status');
}

export async function fetchProjectsList() {
  return requestLocalPreferred<BackendProjectListItem[]>('/projects');
}

export async function fetchGoogleAdsCustomers() {
  return requestLocalPreferred<GoogleAdsCustomer[]>('/google-ads/customers');
}

export async function fetchGoogleAdsCampaigns(customerId: string) {
  return requestLocalPreferred<GoogleAdsCampaign[]>(`/google-ads/${encodeURIComponent(customerId)}/campaigns`);
}

export async function fetchGoogleAdsAdGroups(customerId: string, campaignId: string) {
  return requestLocalPreferred<GoogleAdsAdGroup[]>(
    `/google-ads/${encodeURIComponent(customerId)}/campaigns/${encodeURIComponent(campaignId)}/ad-groups`,
  );
}

export async function fetchGoogleAdsActiveAds(customerId: string, domainUrl: string) {
  const query = new URLSearchParams({ domainUrl: domainUrl || '' });
  return requestLocalPreferred<GoogleAdsActiveAd[]>(
    `/google-ads/${encodeURIComponent(customerId)}/active-ads?${query.toString()}`,
  );
}

export async function fetchGoogleAdsCompetitorAds(payload: {
  domain: string;
  region?: string;
  limit?: number;
  refresh?: boolean;
}) {
  const query = new URLSearchParams({ domain: payload.domain || '' });
  if (payload.region && payload.region.trim().length > 0) query.set('region', payload.region.trim());
  if (typeof payload.limit === 'number' && Number.isFinite(payload.limit)) {
    query.set('limit', String(Math.max(1, Math.floor(payload.limit))));
  }
  if (payload.refresh === true) query.set('refresh', 'true');
  return requestLocalPreferred<GoogleAdsCompetitorAdsResult>(`/google-ads/competitor-ads?${query.toString()}`);
}

export async function importGoogleAdsCompetitorUrls(payload: {
  domain: string;
  region?: string;
  urls?: string[];
  rawText?: string;
  limit?: number;
}) {
  return requestLocalPreferred<GoogleAdsCompetitorAdsResult>('/google-ads/competitor-ads/import-urls', 'POST', payload);
}

export async function publishGoogleAdsCreative(payload: PublishGoogleAdsPayload) {
  return requestLocalPreferred<{ ok: boolean; type: string; resourceName: string; imageAsset?: string | null }>(
    '/google-ads/publish',
    'POST',
    payload,
  );
}

export async function generateGoogleAdsCopy(payload: GoogleAdsGenerateCopyPayload) {
  return requestLocalPreferred<GoogleAdsGeneratedCopy>(
    '/google-ads/generate-copy',
    'POST',
    payload,
  );
}

// ── Administration ────────────────────────────────────────────────────────────

export interface AdminProjectConfig {
  id: string;
  name: string;
  domain: string;
  color: string;
  icon: string;
  category: 'saas' | 'tool' | 'platform';
}

export interface AdminProjectStats {
  projectId: string;
  name: string;
  domain: string;
  color: string;
  icon: string;
  category: string;
  online: boolean;
  stats: {
    totalUsers?: number;
    activeSubscriptions?: number;
    mrr?: number;
    lastSignup?: string | null;
    totalTenants?: number;
    activeTenants?: number;
    paidTenants?: number;
    totalResumes?: number;
    totalTests?: number;
    newUsersMonth?: number;
    [key: string]: unknown;
  } | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  plan: string;
  createdAt: string;
  emailVerified?: string | null;
  subscription?: { plan: string; status: string; stripeCurrentPeriodEnd?: string } | null;
  testCount?: number;
  resumeCount?: number;
  feedCount?: number;
  tenantCount?: number;
  projectId?: string;
  projectName?: string;
  projectIcon?: string;
  projectColor?: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchAdminProjects(): Promise<AdminProjectConfig[]> {
  return request<AdminProjectConfig[]>('/administration/projects');
}

export async function fetchAdminAllStats(): Promise<AdminProjectStats[]> {
  return request<AdminProjectStats[]>('/administration/stats');
}

export async function fetchAdminProjectStats(projectId: string): Promise<AdminProjectStats> {
  return request<AdminProjectStats>(`/administration/projects/${projectId}/stats`);
}

export async function fetchAdminProjectUsers(
  projectId: string,
  params: { page?: number; limit?: number; search?: string; role?: string }
): Promise<AdminUsersResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  return request<AdminUsersResponse>(`/administration/projects/${projectId}/users?${q}`);
}

export async function fetchAdminUser(projectId: string, userId: string): Promise<AdminUser> {
  return request<AdminUser>(`/administration/projects/${projectId}/users/${userId}`);
}

export async function adminSearchAllUsers(q: string): Promise<AdminUser[]> {
  return request<AdminUser[]>(`/administration/search?q=${encodeURIComponent(q)}`);
}

export async function adminBlockUser(projectId: string, userId: string): Promise<{ success: boolean }> {
  return request(`/administration/projects/${projectId}/users/${userId}/block`, 'POST');
}

export async function adminUnblockUser(projectId: string, userId: string): Promise<{ success: boolean }> {
  return request(`/administration/projects/${projectId}/users/${userId}/unblock`, 'POST');
}

export async function adminUpdateUser(
  projectId: string,
  userId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean }> {
  return request(`/administration/projects/${projectId}/users/${userId}`, 'PUT', { data });
}

export async function adminSetSubscription(
  projectId: string,
  userId: string,
  data: { plan: string; status: string }
): Promise<{ success: boolean }> {
  return request(`/administration/projects/${projectId}/users/${userId}/subscription`, 'POST', data);
}

export async function adminCancelSubscription(projectId: string, userId: string): Promise<{ success: boolean }> {
  return request(`/administration/projects/${projectId}/users/${userId}/subscription`, 'DELETE');
}

export async function adminDeleteUser(projectId: string, userId: string): Promise<{ success: boolean }> {
  return request(`/administration/projects/${projectId}/users/${userId}`, 'DELETE');
}

export async function fetchVenomTenants(
  params: { page?: number; limit?: number; search?: string }
): Promise<{ tenants: Record<string, unknown>[]; total: number; page: number; limit: number }> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  return request(`/administration/venom/tenants?${q}`);
}

export async function updateVenomTenant(
  tenantId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean }> {
  return request(`/administration/venom/tenants/${tenantId}`, 'PUT', data);
}

export async function blockVenomTenant(tenantId: string): Promise<{ success: boolean }> {
  return request(`/administration/venom/tenants/${tenantId}/block`, 'POST');
}

export async function activateVenomTenant(tenantId: string): Promise<{ success: boolean }> {
  return request(`/administration/venom/tenants/${tenantId}/activate`, 'POST');
}
