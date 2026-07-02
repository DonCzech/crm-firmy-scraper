/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useManagedAssigneeOptions, useManagedCoreUsers } from '@/crm/hooks/use-managed-core-users';
import { useManagedAssigneeMap } from '@/crm/hooks/use-managed-assignee-map';
import { useGridSearch } from '@/crm/hooks/use-grid-search';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { Task } from '@/crm/types/task';
import { Contact } from '@/crm/types/contact';
import { createTask, deleteTask, fetchContacts, fetchTasks, updateTask } from '@/crm/services/backend';
import { CRM_TASKS_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { resolveManagedUserAssigneeId } from '@/crm/services/managed-users';
import {
  appendTaskAudit,
  getTaskAudit,
  getTaskAuditUpdatedCounts,
  TASK_AUDIT_REFRESH_EVENT,
} from '@/crm/services/task-audit';
import {
  appendSensitiveActionAudit,
} from '@/crm/services/sensitive-actions-audit';
import { sanitizeHumanLabel } from '@/crm/utils/identity-label';
import { DataGridLoadingRows } from '@/crm/components/data-grid-loading-rows';
import { DataGridLoadingFooter } from '@/crm/components/data-grid-loading-footer';
import { ManagedAssigneeSelect } from '@/crm/components/managed-assignee-select';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { mapContactToUI, mapTaskToUI } from '@/crm/services/mappers';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  Bell,
  CircleCheck,
  Copy,
  Eye,
  CalendarClock,
  LayoutGrid,
  List,
  Pencil,
  Ellipsis,
  Filter,
  Search,
  Trash,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const TASK_FILTERS_STORAGE_KEY = 'crm-tasks-filters-v1';
const TASK_VIEWS_STORAGE_KEY = 'crm-tasks-views-v1';
const UNASSIGNED_FILTER_ID = '__unassigned__';
const TASK_EXPORT_TEMPLATES_STORAGE_KEY = 'crm-tasks-export-templates-v1';
const TASK_REMINDERS_STORAGE_KEY = 'crm-task-reminders-fired-v1';
const TASK_UI_PREFS_STORAGE_KEY = 'crm-tasks-ui-prefs-v1';
const TASK_STORAGE_ERROR_AREA = 'crm-tasks-storage';
const loggedStorageIssues = new Set<string>();

type ViewMode = 'table' | 'kanban';
type KanbanSort = 'due_asc' | 'due_desc' | 'priority_desc' | 'priority_asc' | 'updated_desc';
type ReminderMode = 'today' | '24h' | '3d';

type ExportColumnKey =
  | 'title'
  | 'description'
  | 'status'
  | 'priority'
  | 'dueAt'
  | 'assigned'
  | 'recommendedPriority';

type ExportTemplate = {
  id: string;
  name: string;
  columns: ExportColumnKey[];
  includeOverdueSheet: boolean;
  format?: 'csv' | 'xlsx';
};

type TaskFilterView = {
  id: string;
  name: string;
  searchQuery: string;
  selectedStatuses: string[];
  selectedPriorities: string[];
  selectedAssigneeIds: string[];
  dueWindow: 'all' | 'today' | 'next_3_days' | 'next_7_days' | 'overdue';
  showOverdueOnly: boolean;
  disabledReason?: string;
};

let initialTaskUiPrefsCache:
  | {
      viewMode?: ViewMode;
      slaEnabled?: boolean;
      slaThresholdDays?: number;
      kanbanWipLimit?: number;
      kanbanSort?: KanbanSort;
      reminderModes?: Partial<Record<ReminderMode, boolean>>;
      detailAuditActionFilter?:
        | 'all'
        | 'created'
        | 'updated'
        | 'completed'
        | 'reopened'
        | 'duplicated'
        | 'deleted';
      selectedRule?:
        | 'overdue_low_to_high'
        | 'unassigned_to_pending'
        | 'in_progress_due_soon_to_high'
        | 'assigned_to_selected_plus_2d';
    }
  | null = null;
let initialTaskFiltersCache:
  | {
      searchQuery?: string;
      selectedStatuses?: string[];
      selectedPriorities?: string[];
      selectedAssigneeIds?: string[];
      dueWindow?: 'all' | 'today' | 'next_3_days' | 'next_7_days' | 'overdue';
      showOverdueOnly?: boolean;
    }
  | null = null;

function logStorageIssueOnce(operation: string, key: string, error: unknown): void {
  const dedupeKey = `${operation}:${key}`;
  if (loggedStorageIssues.has(dedupeKey)) return;
  loggedStorageIssues.add(dedupeKey);
  logFrontendError({
    area: TASK_STORAGE_ERROR_AREA,
    message: error instanceof Error ? error.message : 'Storage operation failed',
    meta: { operation, key },
  });
}

function readStoredJson<T>(key: string, fallback: T, operation: string): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    logStorageIssueOnce(operation, key, error);
    return fallback;
  }
}

function writeStoredJson(key: string, value: unknown, operation: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logStorageIssueOnce(operation, key, error);
  }
}

function removeStoredKey(key: string, operation: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    logStorageIssueOnce(operation, key, error);
    return false;
  }
}

function readInitialTaskUiPrefs() {
  if (initialTaskUiPrefsCache) return initialTaskUiPrefsCache;
  initialTaskUiPrefsCache = readStoredJson<{
    viewMode?: ViewMode;
    slaEnabled?: boolean;
    slaThresholdDays?: number;
    kanbanWipLimit?: number;
    kanbanSort?: KanbanSort;
    reminderModes?: Partial<Record<ReminderMode, boolean>>;
    detailAuditActionFilter?:
      | 'all'
      | 'created'
      | 'updated'
      | 'completed'
      | 'reopened'
      | 'duplicated'
      | 'deleted';
    selectedRule?:
      | 'overdue_low_to_high'
      | 'unassigned_to_pending'
      | 'in_progress_due_soon_to_high'
      | 'assigned_to_selected_plus_2d';
  }>(TASK_UI_PREFS_STORAGE_KEY, {}, 'read_ui_prefs_initial');
  return initialTaskUiPrefsCache;
}

function readInitialTaskFilters() {
  if (initialTaskFiltersCache) return initialTaskFiltersCache;
  initialTaskFiltersCache = readStoredJson<{
    searchQuery?: string;
    selectedStatuses?: string[];
    selectedPriorities?: string[];
    selectedAssigneeIds?: string[];
    dueWindow?: 'all' | 'today' | 'next_3_days' | 'next_7_days' | 'overdue';
    showOverdueOnly?: boolean;
  }>(TASK_FILTERS_STORAGE_KEY, {}, 'read_filters_initial');
  return initialTaskFiltersCache;
}

function sanitizeAssigneeLabel(value: string | undefined): string {
  return sanitizeHumanLabel(value, 'Neznámý uživatel');
}

function isOpaqueAssigneeLabel(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized);
}

function appendUnique(prev: string[], value: string): string[] {
  return prev.includes(value) ? prev : [...prev, value];
}

function toLocalDateTimeValue(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hour = `${d.getHours()}`.padStart(2, '0');
  const minute = `${d.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getDueDayDelta(dueAt: Date, now = new Date()): number {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(dueAt.getFullYear(), dueAt.getMonth(), dueAt.getDate());
  return Math.floor((dueDay.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));
}

function normalizeStatusForUI(status: string): 'pending' | 'in_progress' | 'completed' {
  if (status === 'done' || status === 'completed') return 'completed';
  if (status === 'in_progress') return 'in_progress';
  return 'pending';
}

const ALLOWED_FILTER_STATUSES = new Set(['pending', 'in_progress', 'completed']);
const ALLOWED_FILTER_PRIORITIES = new Set(['low', 'medium', 'high']);
const ALLOWED_DUE_WINDOWS = new Set(['all', 'today', 'next_3_days', 'next_7_days', 'overdue']);
const ALLOWED_EXPORT_COLUMNS = new Set<ExportColumnKey>([
  'title',
  'description',
  'status',
  'priority',
  'dueAt',
  'assigned',
  'recommendedPriority',
]);

function sanitizeDueWindowValue(value: unknown): 'all' | 'today' | 'next_3_days' | 'next_7_days' | 'overdue' {
  return typeof value === 'string' && ALLOWED_DUE_WINDOWS.has(value)
    ? (value as 'all' | 'today' | 'next_3_days' | 'next_7_days' | 'overdue')
    : 'all';
}

function toUniqueNonEmptyStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function sanitizeExportTemplate(value: unknown): ExportTemplate | null {
  if (!value || typeof value !== 'object') return null;
  const tpl = value as Record<string, unknown>;
  const id = typeof tpl.id === 'string' ? tpl.id.trim() : '';
  const name = typeof tpl.name === 'string' ? tpl.name.trim() : '';
  if (!id || !name) return null;
  const rawColumns = toUniqueNonEmptyStringArray(tpl.columns);
  const columns = rawColumns.filter(
    (col): col is ExportColumnKey => ALLOWED_EXPORT_COLUMNS.has(col as ExportColumnKey),
  );
  if (columns.length === 0) return null;
  const format = tpl.format === 'xlsx' ? 'xlsx' : tpl.format === 'csv' ? 'csv' : undefined;
  return {
    id,
    name,
    columns,
    includeOverdueSheet: tpl.includeOverdueSheet === true,
    format,
  };
}

function sanitizeTaskFilterView(value: unknown): TaskFilterView | null {
  if (!value || typeof value !== 'object') return null;
  const view = value as Record<string, unknown>;
  const id = typeof view.id === 'string' ? view.id.trim() : '';
  const name = typeof view.name === 'string' ? view.name.trim() : '';
  if (!id || !name) return null;
  const disabledReason =
    typeof view.disabledReason === 'string' && view.disabledReason.trim().length > 0
      ? view.disabledReason.trim()
      : undefined;
  return {
    id,
    name,
    searchQuery: typeof view.searchQuery === 'string' ? view.searchQuery : '',
    selectedStatuses: toUniqueNonEmptyStringArray(view.selectedStatuses),
    selectedPriorities: toUniqueNonEmptyStringArray(view.selectedPriorities),
    selectedAssigneeIds: toUniqueNonEmptyStringArray(view.selectedAssigneeIds),
    dueWindow: sanitizeDueWindowValue(view.dueWindow),
    showOverdueOnly: view.showOverdueOnly === true,
    disabledReason,
  };
}

function priorityRank(priority?: string): number {
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

interface TaskListProps {
  filter?: 'today' | 'week' | 'completed';
}

export function TaskList({ filter }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksHydrated, setTasksHydrated] = useState(false);
  const latestTasksLoadRequestRef = useRef(0);
  const [contactsLookup, setContactsLookup] = useState<Contact[]>([]);
  const managedUsers = useManagedCoreUsers();
  const managedAssigneeOptionsRaw = useManagedAssigneeOptions();
  const { role: currentUserRole, userId: currentUserId } = useCurrentUserRole();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const parsed = readInitialTaskUiPrefs();
    return parsed.viewMode || 'table';
  });
  const [slaEnabled, setSlaEnabled] = useState(() => {
    const parsed = readInitialTaskUiPrefs();
    return parsed.slaEnabled ?? true;
  });
  const [slaThresholdDays, setSlaThresholdDays] = useState(() => {
    const parsed = readInitialTaskUiPrefs();
    return parsed.slaThresholdDays ?? 3;
  });
  const [kanbanWipLimit, setKanbanWipLimit] = useState(() => {
    const parsed = readInitialTaskUiPrefs();
    return parsed.kanbanWipLimit ?? 6;
  });
  const [kanbanSort, setKanbanSort] = useState<KanbanSort>(() => {
    const parsed = readInitialTaskUiPrefs();
    return parsed.kanbanSort ?? 'due_asc';
  });
  const [reminderBadgeCount, setReminderBadgeCount] = useState(0);
  const [reminderModes, setReminderModes] = useState<Record<ReminderMode, boolean>>(() => {
    const parsed = readInitialTaskUiPrefs();
    return {
      today: parsed.reminderModes?.today ?? true,
      '24h': parsed.reminderModes?.['24h'] ?? true,
      '3d': parsed.reminderModes?.['3d'] ?? true,
    };
  });
  const [detailAuditActionFilter, setDetailAuditActionFilter] = useState<
    'all' | 'created' | 'updated' | 'completed' | 'reopened' | 'duplicated' | 'deleted'
  >(() => {
    const parsed = readInitialTaskUiPrefs();
    return parsed.detailAuditActionFilter || 'all';
  });
  const [detailAuditActorFilter, setDetailAuditActorFilter] = useState('all');
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('tasks');
  const [selectedRule, setSelectedRule] = useState<
    | 'overdue_low_to_high'
    | 'unassigned_to_pending'
    | 'in_progress_due_soon_to_high'
    | 'assigned_to_selected_plus_2d'
  >(() => {
    const parsed = readInitialTaskUiPrefs();
    return parsed.selectedRule || 'overdue_low_to_high';
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [bulkStatusTargetCompleted, setBulkStatusTargetCompleted] = useState(true);
  const [bulkStatusPreviewDialogOpen, setBulkStatusPreviewDialogOpen] = useState(false);
  const [bulkShiftDays, setBulkShiftDays] = useState<1 | 7>(1);
  const [bulkShiftPreviewDialogOpen, setBulkShiftPreviewDialogOpen] = useState(false);
  const [bulkAssignPreviewDialogOpen, setBulkAssignPreviewDialogOpen] = useState(false);
  const [bulkRecommendedPreviewDialogOpen, setBulkRecommendedPreviewDialogOpen] = useState(false);
  const [overdueElevatePreviewDialogOpen, setOverdueElevatePreviewDialogOpen] = useState(false);
  const [slaApplyPreviewDialogOpen, setSlaApplyPreviewDialogOpen] = useState(false);
  const [slaNotifyPreviewDialogOpen, setSlaNotifyPreviewDialogOpen] = useState(false);
  const [rulePreviewDialogOpen, setRulePreviewDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const [exportTemplateName, setExportTemplateName] = useState('');
  const [exportIncludeOverdueSheet, setExportIncludeOverdueSheet] = useState(false);
  const [exportColumns, setExportColumns] = useState<Record<ExportColumnKey, boolean>>({
    title: true,
    description: true,
    status: true,
    priority: true,
    dueAt: true,
    assigned: true,
    recommendedPriority: true,
  });
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>(() => {
    const parsed = readStoredJson<unknown>(
      TASK_EXPORT_TEMPLATES_STORAGE_KEY,
      [],
      'read_export_templates',
    );
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeExportTemplate)
      .filter((tpl): tpl is ExportTemplate => tpl !== null);
  });
  const {
    searchQuery,
    debouncedSearchQuery,
    searchInputRef,
    setSearchQuery,
    clearSearchQuery,
    handleSearchInputKeyDown,
  } = useGridSearch({
    initialQuery: readInitialTaskFilters().searchQuery ?? '',
    debounceMs: 180,
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
    const parsed = readInitialTaskFilters();
    return Array.isArray(parsed.selectedStatuses) ? parsed.selectedStatuses : [];
  });
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(() => {
    const parsed = readInitialTaskFilters();
    return Array.isArray(parsed.selectedPriorities) ? parsed.selectedPriorities : [];
  });
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(() => {
    const parsed = readInitialTaskFilters();
    return Array.isArray(parsed.selectedAssigneeIds) ? parsed.selectedAssigneeIds : [];
  });
  const [dueWindow, setDueWindow] = useState<
    'all' | 'today' | 'next_3_days' | 'next_7_days' | 'overdue'
  >(() => {
    const parsed = readInitialTaskFilters();
    return sanitizeDueWindowValue(parsed.dueWindow);
  });
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(
    new Set(),
  );
  const [showOverdueOnly, setShowOverdueOnly] = useState(() => {
    const parsed = readInitialTaskFilters();
    return parsed.showOverdueOnly === true;
  });
  const [savedViews, setSavedViews] = useState<TaskFilterView[]>(() => {
    const parsed = readStoredJson<unknown>(TASK_VIEWS_STORAGE_KEY, [], 'read_saved_views');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeTaskFilterView)
      .filter((view): view is TaskFilterView => view !== null);
  });
  const [newViewName, setNewViewName] = useState('');
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkAssigneeId, setBulkAssigneeId] = useState('');
  const [ruleAssigneeId, setRuleAssigneeId] = useState('');
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [duplicatingTaskId, setDuplicatingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editStatus, setEditStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [editDueAt, setEditDueAt] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [detailAudit, setDetailAudit] = useState<ReturnType<typeof getTaskAudit>>([]);
  const [taskAuditRefreshTick, setTaskAuditRefreshTick] = useState(0);
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingFromColumnKey, setDraggingFromColumnKey] = useState<
    'pending' | 'in_progress' | 'completed' | null
  >(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState<'pending' | 'in_progress' | 'completed' | null>(null);
  const invalidAssigneeCleanupNoticeShownRef = useRef(false);
  const normalizedCurrentRole = (currentUserRole || 'agent').toLowerCase();
  const canUseSensitiveActions = normalizedCurrentRole === 'admin' || normalizedCurrentRole === 'manager';
  const canDeleteTask = canUseSensitiveActions;
  const canUseAdvancedExport = canUseSensitiveActions;
  const denySensitiveAction = (actionLabel: string) => {
    appendSensitiveActionAudit({
      area: 'tasks',
      action: actionLabel,
      result: 'denied',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      message: 'Blocked by role policy',
    });
    toast.error(`Akce "${actionLabel}" je dostupná pouze pro role admin/manager.`);
  };
  const detailTask = useMemo(
    () => tasks.find((task) => task.id === detailTaskId) ?? null,
    [tasks, detailTaskId],
  );
  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );
  const editDuplicateCandidates = useMemo(() => {
    if (!editingTaskId || !editTitle.trim()) return [] as Task[];
    const normalizedTitle = editTitle.trim().toLowerCase();
    const targetDueDay = editDueAt ? new Date(editDueAt).toDateString() : '';
    return tasks.filter((task) => {
      if (task.id === editingTaskId) return false;
      const sameAssignee = (task.assignedContactIds?.[0] || '') === (editAssigneeId || '');
      const sameDueDay = targetDueDay ? new Date(task.dueAt).toDateString() === targetDueDay : false;
      const similarTitle = task.title.toLowerCase().includes(normalizedTitle) || normalizedTitle.includes(task.title.toLowerCase());
      return similarTitle || (sameAssignee && sameDueDay);
    }).slice(0, 4);
  }, [editingTaskId, editTitle, editAssigneeId, editDueAt, tasks]);
  const managedUserByAssigneeId = useManagedAssigneeMap();
  const managedAssigneeOptions = useMemo(
    () =>
      managedAssigneeOptionsRaw.map((option) => ({
        assigneeId: option.id,
        displayName: option.name,
        email: option.email,
      })),
    [managedAssigneeOptionsRaw],
  );
  const validManagedAssigneeIds = useMemo(
    () => new Set(managedAssigneeOptions.map((option) => option.assigneeId)),
    [managedAssigneeOptions],
  );
  const sanitizeAssigneeFilterIds = useCallback(
    (ids: string[] | undefined) =>
      (Array.isArray(ids) ? ids : []).filter(
        (id) => id === UNASSIGNED_FILTER_ID || validManagedAssigneeIds.has(id),
      ),
    [validManagedAssigneeIds],
  );
  const sanitizeStatusFilterIds = useCallback(
    (ids: string[] | undefined) =>
      (Array.isArray(ids) ? ids : []).filter((id) => ALLOWED_FILTER_STATUSES.has(id)),
    [],
  );
  const sanitizePriorityFilterIds = useCallback(
    (ids: string[] | undefined) =>
      (Array.isArray(ids) ? ids : []).filter((id) => ALLOWED_FILTER_PRIORITIES.has(id)),
    [],
  );
  const contactById = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const contact of contactsLookup) {
      map.set(contact.id, contact);
    }
    return map;
  }, [contactsLookup]);
  const resolveAssigneeLabel = useCallback((assigneeId: string) =>
    sanitizeAssigneeLabel(
      managedUserByAssigneeId.get(assigneeId)?.name ||
        contactById.get(assigneeId)?.name ||
        'Neznámý uživatel',
    ), [managedUserByAssigneeId, contactById]);
  const getAssigneeDisplayName = useCallback(
    (assigneeId: string) => resolveAssigneeLabel(assigneeId),
    [resolveAssigneeLabel],
  );

  const taskAuditUpdatedCounts = useMemo(
    () => getTaskAuditUpdatedCounts(tasks.map((task) => task.id)),
    [tasks, taskAuditRefreshTick],
  );

  const recommendPriority = (task: Task): 'high' | 'medium' | 'low' => {
    const delta = getDueDayDelta(new Date(task.dueAt));
    const updates = taskAuditUpdatedCounts.get(task.id) || 0;
    if (task.status === 'completed') return task.priority || 'low';
    if (delta < 0) return 'high';
    if (delta <= 1) return 'high';
    if (delta <= 3 || updates >= 3) return 'medium';
    return 'low';
  };

  const getRecommendationReason = (task: Task): string => {
    const delta = getDueDayDelta(new Date(task.dueAt));
    const updates = taskAuditUpdatedCounts.get(task.id) || 0;
    if (task.status === 'completed') return 'Úkol je dokončený.';
    if (delta < 0) return `Po termínu ${Math.abs(delta)} dní.`;
    if (delta === 0) return 'Termín je dnes.';
    if (delta === 1) return 'Termín je do 24 hodin.';
    if (delta <= 3) return `Termín je za ${delta} dny.`;
    if (updates >= 3) return `Časté změny (${updates}x), vyžaduje pozornost.`;
    return 'Dostatečná časová rezerva a nízká změnovost.';
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'dueAt', desc: false },
  ]);

  useEffect(() => {
    setSelectedStatuses((prev) => {
      const sanitized = sanitizeStatusFilterIds(prev);
      return sanitized.length === prev.length ? prev : sanitized;
    });
    setSelectedPriorities((prev) => {
      const sanitized = sanitizePriorityFilterIds(prev);
      return sanitized.length === prev.length ? prev : sanitized;
    });
    setSelectedAssigneeIds((prev) => {
      const sanitized = sanitizeAssigneeFilterIds(prev);
      if (
        !invalidAssigneeCleanupNoticeShownRef.current &&
        sanitized.length !== prev.length &&
        prev.length > 0
      ) {
        invalidAssigneeCleanupNoticeShownRef.current = true;
        toast.info('Některé neplatné filtry přiřazení byly odebrány (uživatel už neexistuje).');
      }
      return sanitized.length === prev.length ? prev : sanitized;
    });
    setBulkAssigneeId((prev) => (prev && !validManagedAssigneeIds.has(prev) ? '' : prev));
    setRuleAssigneeId((prev) => (prev && !validManagedAssigneeIds.has(prev) ? '' : prev));
    setEditAssigneeId((prev) => (prev && !validManagedAssigneeIds.has(prev) ? '' : prev));
  }, [
    validManagedAssigneeIds,
    sanitizeAssigneeFilterIds,
    sanitizeStatusFilterIds,
    sanitizePriorityFilterIds,
  ]);

  useEffect(() => {
    setSavedViews((prev) => {
      let changed = false;
      const next = prev.map((view) => {
        const originalAssignees = Array.isArray(view.selectedAssigneeIds) ? view.selectedAssigneeIds : [];
        const originalStatuses = Array.isArray(view.selectedStatuses) ? view.selectedStatuses : [];
        const originalPriorities = Array.isArray(view.selectedPriorities) ? view.selectedPriorities : [];
        const sanitizedAssignees = sanitizeAssigneeFilterIds(originalAssignees);
        const sanitizedStatuses = sanitizeStatusFilterIds(originalStatuses);
        const sanitizedPriorities = sanitizePriorityFilterIds(originalPriorities);
        const sanitizedDueWindow = sanitizeDueWindowValue(view.dueWindow);
        const sanitizedShowOverdueOnly = view.showOverdueOnly === true;
        if (
          sanitizedAssignees.length !== originalAssignees.length ||
          sanitizedStatuses.length !== originalStatuses.length ||
          sanitizedPriorities.length !== originalPriorities.length ||
          sanitizedDueWindow !== view.dueWindow ||
          sanitizedShowOverdueOnly !== view.showOverdueOnly
        ) {
          changed = true;
          return {
            ...view,
            selectedAssigneeIds: sanitizedAssignees,
            selectedStatuses: sanitizedStatuses,
            selectedPriorities: sanitizedPriorities,
            dueWindow: sanitizedDueWindow,
            showOverdueOnly: sanitizedShowOverdueOnly,
          };
        }
        return view;
      });
      return changed ? next : prev;
    });
  }, [sanitizeAssigneeFilterIds, sanitizeStatusFilterIds, sanitizePriorityFilterIds]);

  useEffect(() => {
    writeStoredJson(
      TASK_FILTERS_STORAGE_KEY,
      {
        searchQuery,
        selectedStatuses,
        selectedPriorities,
        selectedAssigneeIds,
        dueWindow,
        showOverdueOnly,
      },
      'write_filters',
    );
  }, [searchQuery, selectedStatuses, selectedPriorities, selectedAssigneeIds, dueWindow, showOverdueOnly]);

  useEffect(() => {
    writeStoredJson(TASK_VIEWS_STORAGE_KEY, savedViews.slice(0, 20), 'write_saved_views');
  }, [savedViews]);

  useEffect(() => {
    writeStoredJson(
      TASK_EXPORT_TEMPLATES_STORAGE_KEY,
      exportTemplates.slice(0, 20),
      'write_export_templates',
    );
  }, [exportTemplates]);

  useEffect(() => {
    writeStoredJson(
      TASK_UI_PREFS_STORAGE_KEY,
      {
        viewMode,
        slaEnabled,
        slaThresholdDays,
        selectedRule,
        detailAuditActionFilter,
        kanbanWipLimit,
        kanbanSort,
        reminderModes,
      },
      'write_ui_prefs',
    );
  }, [
    viewMode,
    slaEnabled,
    slaThresholdDays,
    selectedRule,
    detailAuditActionFilter,
    kanbanWipLimit,
    kanbanSort,
    reminderModes,
  ]);

  useEffect(() => {
    if (!ruleAssigneeId && managedUsers[0]) {
      setRuleAssigneeId(resolveManagedUserAssigneeId(managedUsers[0]));
    }
  }, [managedUsers, ruleAssigneeId]);

  useEffect(() => {
    setDetailAuditActorFilter('all');
  }, [detailTaskId]);

  useEffect(() => {
    const reloadAudit = () => {
      setTaskAuditRefreshTick((prev) => prev + 1);
      setDetailAudit(detailTaskId ? getTaskAudit(detailTaskId).slice(0, 20) : []);
    };
    reloadAudit();
    window.addEventListener(TASK_AUDIT_REFRESH_EVENT, reloadAudit);
    return () => {
      window.removeEventListener(TASK_AUDIT_REFRESH_EVENT, reloadAudit);
    };
  }, [detailTaskId]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const pending = tasks.filter((task) => task.status !== 'completed');
      const getReminderBucket = (task: Task): ReminderMode | null => {
        const delta = getDueDayDelta(new Date(task.dueAt), now);
        if (delta === 0 && reminderModes.today) return 'today';
        if (delta === 1 && reminderModes['24h']) return '24h';
        if ((delta === 2 || delta === 3) && reminderModes['3d']) return '3d';
        return null;
      };
      const dueSoon = pending
        .map((task) => ({ task, bucket: getReminderBucket(task) }))
        .filter((item): item is { task: Task; bucket: ReminderMode } => item.bucket !== null);
      setReminderBadgeCount(dueSoon.length);

      const firedMap = readStoredJson<Record<string, string>>(
        TASK_REMINDERS_STORAGE_KEY,
        {},
        'read_reminders_fired',
      );

      for (const { task, bucket } of dueSoon) {
        const key = `${task.id}:${bucket}`;
        if (firedMap[key]) continue;
        firedMap[key] = now.toISOString();
        const title =
          bucket === 'today'
            ? `Připomínka úkolu (Dnes): ${task.title}`
            : bucket === '24h'
              ? `Připomínka úkolu (24h): ${task.title}`
              : `Připomínka úkolu (3 dny): ${task.title}`;
        toast.info(title);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('CRM Tasks Reminder', { body: title });
        }
      }

      writeStoredJson(TASK_REMINDERS_STORAGE_KEY, firedMap, 'write_reminders_fired');
    };

    checkReminders();
    const timer = window.setInterval(checkReminders, 60_000);
    return () => window.clearInterval(timer);
  }, [tasks, reminderModes]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const requestId = latestTasksLoadRequestRef.current + 1;
      latestTasksLoadRequestRef.current = requestId;
      try {
        const [tasksResponse, contactsResponse] = await Promise.all([
          fetchTasks({ limit: 400 }),
          fetchContacts({ limit: 500 }),
        ]);

        const mappedTasks = (tasksResponse?.data ?? []).map(mapTaskToUI);
        const mappedContacts = (contactsResponse?.data ?? []).map(mapContactToUI);

        if (isMounted && requestId === latestTasksLoadRequestRef.current) {
          setTasks(mappedTasks);
          setContactsLookup(mappedContacts);
        }
      } catch (error) {
        logFrontendError({
          area: 'crm-tasks',
          message: error instanceof Error ? error.message : 'Failed to load tasks list',
          meta: { operation: 'load_tasks_list' },
        });
        if (isMounted && requestId === latestTasksLoadRequestRef.current) {
          setTasks([]);
          setContactsLookup([]);
        }
      } finally {
        if (isMounted && requestId === latestTasksLoadRequestRef.current) setTasksHydrated(true);
      }
    };

    void loadData();
    const handleRefresh = () => {
      void loadData();
    };
    window.addEventListener(CRM_TASKS_REFRESH_EVENT, handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener(CRM_TASKS_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  // Filter tasks based on the active tab filter
  const filteredByTab = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter((task) => {
      switch (filter) {
        case 'today':
          const taskDueDate = new Date(task.dueAt);
          const taskDate = new Date(
            taskDueDate.getFullYear(),
            taskDueDate.getMonth(),
            taskDueDate.getDate(),
          );
          return (
            taskDate.getTime() === today.getTime() &&
            (task.status !== 'completed' || recentlyCompleted.has(task.id))
          );
        case 'week':
          return (
            new Date(task.dueAt) <= weekFromNow &&
            (task.status !== 'completed' || recentlyCompleted.has(task.id))
          );
        case 'completed':
          return task.status === 'completed';
        default:
          return true;
      }
    });
  }, [tasks, filter, recentlyCompleted]);

  const priorityCounts = useMemo(() => {
    return filteredByTab.reduce(
      (acc, task) => {
        if (task.priority) {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [filteredByTab]);

  // Apply additional filters
  const filteredData = useMemo(() => {
    return filteredByTab.filter((task) => {
      const isOverdueOpen =
        new Date(task.dueAt).getTime() < Date.now() && task.status !== 'completed';

      if (showOverdueOnly && !isOverdueOpen) return false;

      // Filter by status
      const matchesStatus =
        !selectedStatuses?.length ||
        selectedStatuses.includes(task.status || 'pending');

      // Filter by priority
      const matchesPriority =
        !selectedPriorities?.length ||
        selectedPriorities.includes(task.priority || '');

      // Filter by assignee
      const taskAssigneeId = task.assignedContactIds?.[0] || '';
      const matchesAssignee =
        !selectedAssigneeIds?.length ||
        selectedAssigneeIds.includes(taskAssigneeId) ||
        (!taskAssigneeId && selectedAssigneeIds.includes(UNASSIGNED_FILTER_ID));

      const dueAt = new Date(task.dueAt);
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const taskDay = new Date(dueAt.getFullYear(), dueAt.getMonth(), dueAt.getDate());
      const diffDays = Math.floor((taskDay.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000));
      const isOverdue = dueAt.getTime() < now.getTime() && task.status !== 'completed';

      let matchesDueWindow = true;
      switch (dueWindow) {
        case 'today':
          matchesDueWindow = diffDays === 0;
          break;
        case 'next_3_days':
          matchesDueWindow = diffDays >= 0 && diffDays <= 3;
          break;
        case 'next_7_days':
          matchesDueWindow = diffDays >= 0 && diffDays <= 7;
          break;
        case 'overdue':
          matchesDueWindow = isOverdue;
          break;
        case 'all':
        default:
          matchesDueWindow = true;
      }

      // Filter by search query
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch =
        !debouncedSearchQuery ||
        task.title.toLowerCase().includes(searchLower) ||
        task.content.toLowerCase().includes(searchLower);

      return matchesStatus && matchesPriority && matchesAssignee && matchesDueWindow && matchesSearch;
    });
  }, [
    filteredByTab,
    debouncedSearchQuery,
    selectedStatuses,
    selectedPriorities,
    selectedAssigneeIds,
    dueWindow,
    showOverdueOnly,
  ]);

  const bulkAssignPreviewTasks = useMemo(
    () =>
      filteredData.filter((task) => {
        const currentAssigneeId = task.assignedContactIds?.[0] || '';
        return currentAssigneeId !== bulkAssigneeId;
      }),
    [filteredData, bulkAssigneeId],
  );
  const bulkStatusPreviewTasks = useMemo(
    () =>
      filteredData.filter((task) =>
        bulkStatusTargetCompleted ? task.status !== 'completed' : task.status === 'completed',
      ),
    [filteredData, bulkStatusTargetCompleted],
  );
  const bulkCompletePreviewCount = useMemo(
    () => filteredData.filter((task) => task.status !== 'completed').length,
    [filteredData],
  );
  const bulkReopenPreviewCount = useMemo(
    () => filteredData.filter((task) => task.status === 'completed').length,
    [filteredData],
  );
  const bulkShiftPreviewTasks = useMemo(() => filteredData, [filteredData]);
  const bulkShiftPreviewCount = bulkShiftPreviewTasks.length;

  const slaBreachedTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (!slaEnabled || task.status === 'completed') return false;
        return getDueDayDelta(new Date(task.dueAt)) < -Math.abs(slaThresholdDays);
      }),
    [tasks, slaEnabled, slaThresholdDays],
  );
  const slaNotifyPreviewTasks = useMemo(
    () => slaBreachedTasks.slice(0, 5),
    [slaBreachedTasks],
  );

  const overdueOpenTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          new Date(task.dueAt).getTime() < Date.now() &&
          task.status !== 'completed',
      ),
    [tasks],
  );
  const overdueElevateCandidates = useMemo(
    () => overdueOpenTasks.filter((task) => task.priority !== 'high'),
    [overdueOpenTasks],
  );
  const slaApplyCandidates = useMemo(
    () => slaBreachedTasks.filter((task) => task.priority !== 'high'),
    [slaBreachedTasks],
  );

  const statusCounts = useMemo(() => {
    return filteredByTab.reduce(
      (acc, task) => {
        const status = task.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [filteredByTab]);

  const assigneeCounts = useMemo(() => {
    return filteredByTab.reduce(
      (acc, task) => {
        const assigneeId = task.assignedContactIds?.[0];
        if (assigneeId) {
          acc[assigneeId] = (acc[assigneeId] || 0) + 1;
        } else {
          acc[UNASSIGNED_FILTER_ID] = (acc[UNASSIGNED_FILTER_ID] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [filteredByTab]);

  const dashboardMetrics = useMemo(() => {
    const totalOpen = tasks.filter((task) => task.status !== 'completed').length;
    const completedThisWeek = tasks.filter((task) => {
      if (task.status !== 'completed' || !task.completedAt) return false;
      return Date.now() - new Date(task.completedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    const overdueOpen = tasks.filter(
      (task) => task.status !== 'completed' && getDueDayDelta(new Date(task.dueAt)) < 0,
    );
    const avgOverdueDays = overdueOpen.length
      ? (
          overdueOpen.reduce(
            (sum, task) => sum + Math.abs(Math.min(getDueDayDelta(new Date(task.dueAt)), 0)),
            0,
          ) / overdueOpen.length
        ).toFixed(1)
      : '0.0';
    const completionRate = tasks.length
      ? `${Math.round((tasks.filter((task) => task.status === 'completed').length / tasks.length) * 100)}%`
      : '0%';
    return { totalOpen, completedThisWeek, avgOverdueDays, completionRate };
  }, [tasks]);

  const assigneeCompletionStats = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>();
    for (const task of tasks) {
      const assigneeId = task.assignedContactIds?.[0] || UNASSIGNED_FILTER_ID;
      const current = map.get(assigneeId) || { done: 0, total: 0 };
      current.total += 1;
      if (task.status === 'completed') current.done += 1;
      map.set(assigneeId, current);
    }
    return Array.from(map.entries())
      .map(([assigneeId, data]) => {
        if (assigneeId !== UNASSIGNED_FILTER_ID && !validManagedAssigneeIds.has(assigneeId)) {
          return null;
        }
        return {
          assigneeId,
          name: (() => {
            if (assigneeId === UNASSIGNED_FILTER_ID) return 'Nepřiřazeno';
            const resolved = getAssigneeDisplayName(assigneeId);
            if (!resolved || resolved === assigneeId || isOpaqueAssigneeLabel(resolved)) {
              return 'Uživatel';
            }
            return sanitizeAssigneeLabel(resolved);
          })(),
          rate: data.total ? Math.round((data.done / data.total) * 100) : 0,
        };
      })
      .filter((item): item is { assigneeId: string; name: string; rate: number } => Boolean(item))
      .filter((item) => item.name !== 'Neznámý uživatel')
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [tasks, validManagedAssigneeIds, getAssigneeDisplayName]);

  const detailAuditFiltered = useMemo(
    () =>
      detailAudit.filter((entry) => {
        const actionMatch =
          detailAuditActionFilter === 'all' ? true : entry.action === detailAuditActionFilter;
        const actor = entry.actor || 'Uživatel';
        const actorMatch = detailAuditActorFilter === 'all' ? true : actor === detailAuditActorFilter;
        return actionMatch && actorMatch;
      }),
    [detailAudit, detailAuditActionFilter, detailAuditActorFilter],
  );

  const detailAuditActors = useMemo(
    () => Array.from(new Set(detailAudit.map((entry) => entry.actor || 'Uživatel'))),
    [detailAudit],
  );
  const systemViews = useMemo<TaskFilterView[]>(() => {
    const currentManagedUser = managedUsers.find(
      (user) => user.backendUserId === currentUserId || user.id === currentUserId,
    );
    const myAssigneeId = currentManagedUser
      ? resolveManagedUserAssigneeId(currentManagedUser)
      : '';
    return [
      {
        id: 'sys-unassigned',
        name: 'Bez přiřazení',
        searchQuery: '',
        selectedStatuses: [],
        selectedPriorities: [],
        selectedAssigneeIds: [UNASSIGNED_FILTER_ID],
        dueWindow: 'all',
        showOverdueOnly: false,
      },
      {
        id: 'sys-due-3d',
        name: 'Do 3 dnů',
        searchQuery: '',
        selectedStatuses: [],
        selectedPriorities: [],
        selectedAssigneeIds: [],
        dueWindow: 'next_3_days',
        showOverdueOnly: false,
      },
      {
        id: 'sys-high-priority',
        name: 'High priority',
        searchQuery: '',
        selectedStatuses: [],
        selectedPriorities: ['high'],
        selectedAssigneeIds: [],
        dueWindow: 'all',
        showOverdueOnly: false,
      },
      {
        id: 'sys-my-overdue',
        name: myAssigneeId ? 'Moje overdue' : 'Moje overdue (nenamapováno)',
        searchQuery: '',
        selectedStatuses: ['pending', 'in_progress'],
        selectedPriorities: [],
        selectedAssigneeIds: myAssigneeId ? [myAssigneeId] : [],
        dueWindow: 'overdue',
        showOverdueOnly: true,
        disabledReason: myAssigneeId
          ? undefined
          : 'Aktuální uživatel není namapovaný v Core User Management.',
      },
    ];
  }, [managedUsers, currentUserId]);

  const recommendedBulkTasks = useMemo(
    () => filteredData.filter((task) => (task.priority || 'medium') !== recommendPriority(task)),
    [filteredData],
  );
  const recommendedBulkCount = recommendedBulkTasks.length;

  const rulePreviewCount = useMemo(() => {
    if (selectedRule === 'overdue_low_to_high') {
      return tasks.filter(
        (task) =>
          task.status !== 'completed' &&
          getDueDayDelta(new Date(task.dueAt)) < 0 &&
          task.priority === 'low',
      ).length;
    }
    if (selectedRule === 'unassigned_to_pending') {
      return tasks.filter(
        (task) => (task.assignedContactIds?.[0] || '') === '' && task.status === 'in_progress',
      ).length;
    }
    if (selectedRule === 'assigned_to_selected_plus_2d') {
      if (!ruleAssigneeId) return 0;
      return tasks.filter((task) => (task.assignedContactIds?.[0] || '') === ruleAssigneeId).length;
    }
    return tasks.filter(
      (task) =>
        task.status === 'in_progress' &&
        getDueDayDelta(new Date(task.dueAt)) <= 1 &&
        task.priority !== 'high',
    ).length;
  }, [selectedRule, tasks, ruleAssigneeId]);

  const rulePreviewTasks = useMemo(() => {
    if (selectedRule === 'overdue_low_to_high') {
      return tasks.filter(
        (task) =>
          task.status !== 'completed' &&
          getDueDayDelta(new Date(task.dueAt)) < 0 &&
          task.priority === 'low',
      );
    }
    if (selectedRule === 'unassigned_to_pending') {
      return tasks.filter(
        (task) => (task.assignedContactIds?.[0] || '') === '' && task.status === 'in_progress',
      );
    }
    if (selectedRule === 'assigned_to_selected_plus_2d') {
      if (!ruleAssigneeId) return [] as Task[];
      return tasks.filter((task) => (task.assignedContactIds?.[0] || '') === ruleAssigneeId);
    }
    return tasks.filter(
      (task) =>
        task.status === 'in_progress' &&
        getDueDayDelta(new Date(task.dueAt)) <= 1 &&
        task.priority !== 'high',
    );
  }, [selectedRule, tasks, ruleAssigneeId]);

  const selectedRuleDescription = useMemo(() => {
    if (selectedRule === 'overdue_low_to_high') {
      return 'Overdue úkoly s LOW prioritou budou přepnuty na HIGH.';
    }
    if (selectedRule === 'unassigned_to_pending') {
      return 'Nepřiřazené úkoly ve stavu In Progress budou vráceny do Pending.';
    }
    if (selectedRule === 'assigned_to_selected_plus_2d') {
      const assigneeName = ruleAssigneeId
        ? getAssigneeDisplayName(ruleAssigneeId)
        : 'bez uživatele';
      return `Všechny úkoly přiřazené uživateli "${assigneeName}" se posunou o 2 dny.`;
    }
    return 'In Progress úkoly s termínem do 1 dne budou přepnuty na HIGH.';
  }, [selectedRule, ruleAssigneeId, getAssigneeDisplayName]);

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses((prev = []) =>
      checked ? appendUnique(prev, value) : prev.filter((v) => v !== value),
    );
  };

  const handlePriorityChange = (checked: boolean, value: string) => {
    setSelectedPriorities((prev = []) =>
      checked ? appendUnique(prev, value) : prev.filter((v) => v !== value),
    );
  };

  const handleAssigneeChange = (checked: boolean, value: string) => {
    setSelectedAssigneeIds((prev = []) =>
      checked ? appendUnique(prev, value) : prev.filter((v) => v !== value),
    );
  };

  const handleTaskComplete = async (taskId: string, checked: boolean) => {
    if (!taskId || updatingTaskIds.has(taskId)) return;
    setUpdatingTaskIds((prev) => new Set(prev).add(taskId));

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: checked ? 'completed' : 'pending',
              completedAt: checked ? new Date() : undefined,
              completedBy: checked ? 'current_user' : undefined,
              updatedAt: new Date(),
            }
          : task,
      ),
    );

    try {
      const updated = await updateTask(taskId, { status: checked ? 'done' : 'todo' });
      const mapped = mapTaskToUI(updated);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? mapped : task)),
      );
      appendTaskAudit(
        taskId,
        checked ? 'completed' : 'reopened',
        checked ? 'Úkol označen jako dokončený' : 'Úkol vrácen do otevřených',
      );

      if (checked) {
        // Keep completed task visible briefly to confirm state change.
        setRecentlyCompleted((prev) => new Set(prev).add(taskId));
        toast.custom(
          (t) => (
            <Alert
              variant="mono"
              icon="success"
              onClose={() => toast.dismiss(t)}
            >
              <AlertIcon>
                <CircleCheck />
              </AlertIcon>
              <AlertTitle>Task completed successfully!</AlertTitle>
            </Alert>
          ),
          {
            duration: 5000,
          },
        );

        setTimeout(() => {
          setRecentlyCompleted((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== taskId),
          );
        }, 2000);
      }
    } catch {
      // Rollback optimistic state on API failure.
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: checked ? 'pending' : 'completed',
                completedAt: checked ? undefined : new Date(),
                completedBy: checked ? undefined : 'current_user',
                updatedAt: new Date(),
              }
            : task,
        ),
      );
      toast.error('Nepodařilo se uložit změnu stavu úkolu');
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const persistTaskStatus = async (taskId: string, completed: boolean) => {
    if (completed) {
      try {
        return mapTaskToUI(await updateTask(taskId, { status: 'done' }));
      } catch {
        return mapTaskToUI(await updateTask(taskId, { status: 'completed' }));
      }
    }

    try {
      return mapTaskToUI(await updateTask(taskId, { status: 'todo' }));
    } catch {
      return mapTaskToUI(await updateTask(taskId, { status: 'pending' }));
    }
  };

  const handleBulkStatusUpdate = async (completed: boolean) => {
    if (!canUseSensitiveActions) {
      denySensitiveAction('Bulk změna stavu');
      return;
    }
    if (bulkUpdating) return;

    const targetTasks = filteredData.filter((task) =>
      completed ? task.status !== 'completed' : task.status === 'completed',
    );

    if (targetTasks.length === 0) {
      toast.info(
        completed
          ? 'Žádné úkoly k dokončení podle aktuálního filtru.'
          : 'Žádné dokončené úkoly k vrácení podle aktuálního filtru.',
      );
      return;
    }

    const targetIds = targetTasks.map((task) => task.id);
    const prevById = new Map(targetTasks.map((task) => [task.id, task]));
    const now = new Date();

    setBulkUpdating(true);
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.add(id));
      return next;
    });

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        targetIds.includes(task.id)
          ? {
              ...task,
              status: completed ? 'completed' : 'pending',
              completedAt: completed ? now : undefined,
              completedBy: completed ? 'current_user' : undefined,
              updatedAt: now,
            }
          : task,
      ),
    );

    const results = await Promise.all(
      targetIds.map(async (taskId) => {
        try {
          const task = await persistTaskStatus(taskId, completed);
          return { ok: true as const, taskId, task };
        } catch {
          return { ok: false as const, taskId };
        }
      }),
    );

    const successful = new Map<string, Task>();
    const failedIds: string[] = [];

    for (const result of results) {
      if (result.ok) {
        successful.set(result.taskId, result.task);
      } else {
        failedIds.push(result.taskId);
      }
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        const fresh = successful.get(task.id);
        if (fresh) return fresh;
        if (failedIds.includes(task.id)) {
          return prevById.get(task.id) ?? task;
        }
        return task;
      }),
    );

    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.delete(id));
      return next;
    });
    setBulkUpdating(false);

    successful.forEach((_task, taskId) => {
      appendTaskAudit(
        taskId,
        completed ? 'completed' : 'reopened',
        completed ? 'Bulk: označeno jako dokončené' : 'Bulk: vráceno mezi otevřené',
        'Bulk',
      );
    });

    if (failedIds.length > 0) {
      appendSensitiveActionAudit({
        area: 'tasks',
        action: completed ? 'bulk_complete' : 'bulk_reopen',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { successCount: successful.size, total: targetIds.length },
      });
      toast.warning(
        `Uloženo ${successful.size}/${targetIds.length}. ${failedIds.length} úkolů se nepodařilo uložit.`,
      );
      return;
    }

    appendSensitiveActionAudit({
      area: 'tasks',
      action: completed ? 'bulk_complete' : 'bulk_reopen',
      result: 'success',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      meta: { count: targetIds.length },
    });
    toast.success(
      completed
        ? `Dokončeno ${targetIds.length} úkolů.`
        : `Vráceno ${targetIds.length} úkolů do otevřených.`,
    );
  };

  const openEditTask = (task: Task) => {
    setActiveTaskId(task.id);
    setEditingTaskId(task.id);
    setEditTitle(task.title || '');
    setEditContent(task.content || '');
    setEditPriority(task.priority || 'medium');
    setEditStatus(task.status || 'pending');
    setEditDueAt(toLocalDateTimeValue(task.dueAt));
    setEditAssigneeId(task.assignedContactIds?.[0] || '');
  };

  const openTaskDetail = (task: Task) => {
    setActiveTaskId(task.id);
    setDetailTaskId(task.id);
  };

  const closeEditDialog = () => {
    if (editSubmitting) return;
    setEditingTaskId(null);
  };

  const openDeleteTask = (task: Task) => {
    if (!canDeleteTask) {
      denySensitiveAction('Smazání úkolu');
      return;
    }
    setDeletingTaskId(task.id);
  };

  const confirmDeleteTask = async () => {
    if (!canDeleteTask) {
      denySensitiveAction('Smazání úkolu');
      return;
    }
    if (!deletingTaskId) return;
    const deletedTaskId = deletingTaskId;
    setDeleteSubmitting(true);
    try {
      await deleteTask(deletedTaskId);
      setTasks((prev) => prev.filter((task) => task.id !== deletedTaskId));
      if (detailTaskId === deletedTaskId) setDetailTaskId(null);
      if (activeTaskId === deletedTaskId) setActiveTaskId(null);
      if (editingTaskId === deletedTaskId) setEditingTaskId(null);
      appendTaskAudit(deletedTaskId, 'deleted', 'Úkol byl smazán');
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'delete_task',
        result: 'success',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { taskId: deletedTaskId },
      });
      toast.success('Úkol byl smazán.');
      setDeletingTaskId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Smazání úkolu selhalo';
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'delete_task',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        message,
        meta: { taskId: deletedTaskId },
      });
      toast.error(message);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const saveTaskEdit = async () => {
    if (!editingTaskId || !editTitle.trim()) return;

    setEditSubmitting(true);
    try {
      const payloadStatus =
        editStatus === 'completed'
          ? 'done'
          : editStatus === 'in_progress'
            ? 'in_progress'
            : 'todo';

      const updated = await updateTask(editingTaskId, {
        title: editTitle.trim(),
        description: editContent.trim() || undefined,
        priority: editPriority,
        status: payloadStatus,
        dueDate: editDueAt ? new Date(editDueAt).toISOString() : undefined,
        assigneeId: editAssigneeId || null,
      });

      const mapped = mapTaskToUI(updated);
      setTasks((prev) => prev.map((task) => (task.id === editingTaskId ? mapped : task)));
      appendTaskAudit(editingTaskId, 'updated', `Upraveno: ${editTitle.trim()}`);
      toast.success('Úkol byl upraven.');
      setEditingTaskId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uložení úprav úkolu selhalo';
      toast.error(message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const duplicateTask = async (task: Task) => {
    if (!task?.id || duplicatingTaskId) return;
    setDuplicatingTaskId(task.id);
    try {
      await createTask({
        title: `${task.title} (kopie)`.slice(0, 160),
        description: task.content || undefined,
        dueDate: task.dueAt?.toISOString?.() ?? undefined,
        priority: task.priority || 'medium',
        status: task.status === 'completed' ? 'todo' : task.status === 'in_progress' ? 'in_progress' : 'todo',
      });
      appendTaskAudit(task.id, 'duplicated', `Vytvořena kopie "${task.title}"`);
      dispatchCrmEvent(CRM_TASKS_REFRESH_EVENT);
      toast.success('Úkol byl duplikován.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Duplikace úkolu selhala';
      toast.error(message);
    } finally {
      setDuplicatingTaskId(null);
    }
  };

  const shiftTaskDueDate = async (task: Task, days: number) => {
    if (!task?.id || updatingTaskIds.has(task.id)) return;

    const nextDueAt = new Date(task.dueAt);
    nextDueAt.setDate(nextDueAt.getDate() + days);

    setUpdatingTaskIds((prev) => new Set(prev).add(task.id));
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, dueAt: nextDueAt, updatedAt: new Date() } : item,
      ),
    );

    try {
      const updated = await updateTask(task.id, { dueDate: nextDueAt.toISOString() });
      const mapped = mapTaskToUI(updated);
      setTasks((prev) => prev.map((item) => (item.id === task.id ? mapped : item)));
      appendTaskAudit(task.id, 'updated', `Termín posunut o ${days} dní`);
      toast.success(`Termín úkolu posunut o ${days} dní.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Posun termínu selhal';
      setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
      toast.error(message);
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const elevateOverduePriority = async () => {
    if (!canUseSensitiveActions) {
      denySensitiveAction('SLA overdue akce');
      return;
    }
    const overdue = overdueOpenTasks.filter((task) => task.priority !== 'high');
    if (overdue.length === 0) {
      toast.info('Žádné overdue úkoly k navýšení priority.');
      return;
    }

    const ids = overdue.map((task) => task.id);
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });

    setTasks((prev) =>
      prev.map((task) => (ids.includes(task.id) ? { ...task, priority: 'high' } : task)),
    );

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const updated = await updateTask(id, { priority: 'high' });
          return { ok: true as const, id, mapped: mapTaskToUI(updated) };
        } catch {
          return { ok: false as const, id };
        }
      }),
    );

    const mapped = new Map<string, Task>();
    const failedIds: string[] = [];
    for (const r of results) {
      if (r.ok) mapped.set(r.id, r.mapped);
      else failedIds.push(r.id);
    }

    setTasks((prev) =>
      prev.map((task) => {
        const fresh = mapped.get(task.id);
        if (fresh) return fresh;
        if (failedIds.includes(task.id)) {
          const original = overdue.find((o) => o.id === task.id);
          return original ?? task;
        }
        return task;
      }),
    );

    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });

    if (failedIds.length > 0) {
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'elevate_overdue_priority',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { successCount: mapped.size, total: ids.length },
      });
      toast.warning(`Priorita nastavena ${mapped.size}/${ids.length}.`);
      return;
    }

    overdue.forEach((task) =>
      appendTaskAudit(task.id, 'updated', 'Priorita automaticky zvýšena na High'),
    );
    appendSensitiveActionAudit({
      area: 'tasks',
      action: 'elevate_overdue_priority',
      result: 'success',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      meta: { count: ids.length },
    });
    toast.success(`Priorita High nastavena pro ${ids.length} overdue úkolů.`);
  };

  const handleBulkAssignFiltered = async () => {
    if (!canUseSensitiveActions) {
      denySensitiveAction('Bulk přiřazení');
      return;
    }
    if (bulkUpdating) return;

    const targetTasks = filteredData.filter((task) => {
      const currentAssigneeId = task.assignedContactIds?.[0] || '';
      return currentAssigneeId !== bulkAssigneeId;
    });

    if (targetTasks.length === 0) {
      toast.info('Filtrované úkoly už mají toto přiřazení.');
      return;
    }

    const targetIds = targetTasks.map((task) => task.id);
    const prevById = new Map(targetTasks.map((task) => [task.id, task]));
    const nextAssignedIds = bulkAssigneeId ? [bulkAssigneeId] : [];
    const nextAssigneeName = bulkAssigneeId ? getAssigneeDisplayName(bulkAssigneeId) : '';

    setBulkUpdating(true);
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.add(id));
      return next;
    });

    setTasks((prev) =>
      prev.map((task) =>
        targetIds.includes(task.id)
          ? {
              ...task,
              assignedContactIds: nextAssignedIds,
              updatedAt: new Date(),
            }
          : task,
      ),
    );

    const results = await Promise.all(
      targetIds.map(async (id) => {
        try {
          const updated = await updateTask(id, { assigneeId: bulkAssigneeId || null });
          return { ok: true as const, id, mapped: mapTaskToUI(updated) };
        } catch {
          return { ok: false as const, id };
        }
      }),
    );

    const mapped = new Map<string, Task>();
    const failedIds: string[] = [];
    for (const r of results) {
      if (r.ok) mapped.set(r.id, r.mapped);
      else failedIds.push(r.id);
    }

    setTasks((prev) =>
      prev.map((task) => {
        const fresh = mapped.get(task.id);
        if (fresh) return fresh;
        if (failedIds.includes(task.id)) {
          return prevById.get(task.id) ?? task;
        }
        return task;
      }),
    );

    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.delete(id));
      return next;
    });
    setBulkUpdating(false);

    if (mapped.size > 0) {
      targetIds
        .filter((id) => mapped.has(id))
        .forEach((id) =>
          appendTaskAudit(
            id,
            'updated',
            bulkAssigneeId ? `Hromadně přiřazeno: ${nextAssigneeName}` : 'Hromadně odebráno přiřazení',
          ),
        );
    }

    if (failedIds.length > 0) {
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'bulk_assign',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { successCount: mapped.size, total: targetIds.length, assigneeId: bulkAssigneeId || null },
      });
      toast.warning(`Přiřazeno ${mapped.size}/${targetIds.length}.`);
      return;
    }

    appendSensitiveActionAudit({
      area: 'tasks',
      action: 'bulk_assign',
      result: 'success',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      meta: { count: targetIds.length, assigneeId: bulkAssigneeId || null },
    });
    toast.success(
      bulkAssigneeId
        ? `Přiřazeno ${targetIds.length} úkolů uživateli ${nextAssigneeName}.`
        : `U ${targetIds.length} úkolů odebráno přiřazení.`,
    );
  };

  const handleBulkShiftFilteredDueDate = async (days: number) => {
    if (!canUseSensitiveActions) {
      denySensitiveAction('Bulk posun termínu');
      return;
    }
    if (bulkUpdating) return;

    const targetTasks = filteredData;
    if (targetTasks.length === 0) {
      toast.info('Žádné filtrované úkoly k posunu termínu.');
      return;
    }

    const targetIds = targetTasks.map((task) => task.id);
    const prevById = new Map(targetTasks.map((task) => [task.id, task]));
    const nextDueById = new Map<string, Date>();
    for (const task of targetTasks) {
      const nextDueAt = new Date(task.dueAt);
      nextDueAt.setDate(nextDueAt.getDate() + days);
      nextDueById.set(task.id, nextDueAt);
    }

    setBulkUpdating(true);
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.add(id));
      return next;
    });

    setTasks((prev) =>
      prev.map((task) =>
        targetIds.includes(task.id)
          ? {
              ...task,
              dueAt: nextDueById.get(task.id) ?? task.dueAt,
              updatedAt: new Date(),
            }
          : task,
      ),
    );

    const results = await Promise.all(
      targetIds.map(async (id) => {
        try {
          const nextDueAt = nextDueById.get(id);
          const updated = await updateTask(id, {
            dueDate: nextDueAt ? nextDueAt.toISOString() : undefined,
          });
          return { ok: true as const, id, mapped: mapTaskToUI(updated) };
        } catch {
          return { ok: false as const, id };
        }
      }),
    );

    const mapped = new Map<string, Task>();
    const failedIds: string[] = [];
    for (const r of results) {
      if (r.ok) mapped.set(r.id, r.mapped);
      else failedIds.push(r.id);
    }

    setTasks((prev) =>
      prev.map((task) => {
        const fresh = mapped.get(task.id);
        if (fresh) return fresh;
        if (failedIds.includes(task.id)) {
          return prevById.get(task.id) ?? task;
        }
        return task;
      }),
    );

    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.delete(id));
      return next;
    });
    setBulkUpdating(false);

    if (mapped.size > 0) {
      targetIds
        .filter((id) => mapped.has(id))
        .forEach((id) => appendTaskAudit(id, 'updated', `Termín hromadně posunut o ${days} dní`));
    }

    if (failedIds.length > 0) {
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'bulk_shift_due_date',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { successCount: mapped.size, total: targetIds.length, days },
      });
      toast.warning(`Posunuto ${mapped.size}/${targetIds.length}.`);
      return;
    }

    appendSensitiveActionAudit({
      area: 'tasks',
      action: 'bulk_shift_due_date',
      result: 'success',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      meta: { count: targetIds.length, days },
    });
    toast.success(`Termín posunut o ${days} dní u ${targetIds.length} úkolů.`);
  };

  const applyRecommendedPriority = async (task: Task) => {
    const recommended = recommendPriority(task);
    if ((task.priority || 'medium') === recommended) {
      toast.info('Priorita už odpovídá doporučení.');
      return;
    }

    setUpdatingTaskIds((prev) => new Set(prev).add(task.id));
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, priority: recommended, updatedAt: new Date() } : item,
      ),
    );

    try {
      const updated = await updateTask(task.id, { priority: recommended });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? mapTaskToUI(updated) : item)));
      appendTaskAudit(task.id, 'updated', `Doporučená priorita nastavena na ${recommended.toUpperCase()}`);
      toast.success('Doporučená priorita byla aplikována.');
    } catch {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
      toast.error('Nepodařilo se aplikovat doporučenou prioritu.');
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const applyRecommendedPriorityFiltered = async () => {
    if (!canUseSensitiveActions) {
      denySensitiveAction('Bulk doporučení priority');
      return;
    }
    if (bulkUpdating) return;
    const candidates = filteredData.filter(
      (task) => (task.priority || 'medium') !== recommendPriority(task),
    );
    if (candidates.length === 0) {
      toast.info('Ve filtrovaném seznamu není co doporučit.');
      return;
    }

    const ids = candidates.map((task) => task.id);
    const prevById = new Map(candidates.map((task) => [task.id, task]));
    setBulkUpdating(true);
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    setTasks((prev) =>
      prev.map((task) =>
        ids.includes(task.id)
          ? { ...task, priority: recommendPriority(task), updatedAt: new Date() }
          : task,
      ),
    );

    const results = await Promise.all(
      candidates.map(async (task) => {
        try {
          const recommended = recommendPriority(task);
          const updated = await updateTask(task.id, { priority: recommended });
          return { ok: true as const, id: task.id, mapped: mapTaskToUI(updated), recommended };
        } catch {
          return { ok: false as const, id: task.id };
        }
      }),
    );

    const mapped = new Map<string, Task>();
    const failedIds: string[] = [];
    results.forEach((result) => {
      if (result.ok) mapped.set(result.id, result.mapped);
      else failedIds.push(result.id);
    });

    setTasks((prev) =>
      prev.map((task) => {
        const fresh = mapped.get(task.id);
        if (fresh) return fresh;
        if (failedIds.includes(task.id)) return prevById.get(task.id) || task;
        return task;
      }),
    );
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setBulkUpdating(false);

    results.forEach((result) => {
      if (result.ok) {
        appendTaskAudit(
          result.id,
          'updated',
          `Bulk doporučení priority => ${result.recommended.toUpperCase()}`,
          'Smart Priority',
        );
      }
    });

    if (failedIds.length > 0) {
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'bulk_recommended_priority',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { successCount: mapped.size, total: ids.length },
      });
      toast.warning(`Doporučení aplikováno ${mapped.size}/${ids.length}.`);
      return;
    }
    appendSensitiveActionAudit({
      area: 'tasks',
      action: 'bulk_recommended_priority',
      result: 'success',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      meta: { count: ids.length },
    });
    toast.success(`Doporučení priority aplikováno na ${ids.length} úkolů.`);
  };

  const applySlaRules = async () => {
    if (!canUseSensitiveActions) {
      denySensitiveAction('SLA batch akce');
      return;
    }
    if (bulkUpdating || !slaEnabled) return;
    const target = slaBreachedTasks.filter((task) => task.priority !== 'high');
    if (target.length === 0) {
      toast.info('Žádné SLA porušení k úpravě priority.');
      return;
    }

    const ids = target.map((task) => task.id);
    setBulkUpdating(true);
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });

    setTasks((prev) =>
      prev.map((task) => (ids.includes(task.id) ? { ...task, priority: 'high', updatedAt: new Date() } : task)),
    );

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const updated = await updateTask(id, { priority: 'high' });
          return { ok: true as const, id, mapped: mapTaskToUI(updated) };
        } catch {
          return { ok: false as const, id };
        }
      }),
    );

    const mapped = new Map<string, Task>();
    const failedIds: string[] = [];
    results.forEach((r) => (r.ok ? mapped.set(r.id, r.mapped) : failedIds.push(r.id)));

    setTasks((prev) =>
      prev.map((task) => {
        const fresh = mapped.get(task.id);
        if (fresh) return fresh;
        if (failedIds.includes(task.id)) return target.find((x) => x.id === task.id) || task;
        return task;
      }),
    );

    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setBulkUpdating(false);

    mapped.forEach((_value, id) =>
      appendTaskAudit(id, 'updated', `SLA: overdue > ${slaThresholdDays} dní => HIGH`, 'SLA'),
    );
    if (failedIds.length > 0) {
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'apply_sla_rules',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { successCount: mapped.size, total: ids.length, thresholdDays: slaThresholdDays },
      });
      toast.warning(`SLA aplikováno ${mapped.size}/${ids.length}.`);
      return;
    }
    appendSensitiveActionAudit({
      area: 'tasks',
      action: 'apply_sla_rules',
      result: 'success',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      meta: { count: ids.length, thresholdDays: slaThresholdDays },
    });
    toast.success(`SLA aplikováno na ${ids.length} úkolů.`);
  };

  const notifySlaBreaches = () => {
    if (!slaEnabled) {
      toast.info('SLA režim je vypnutý.');
      return;
    }
    if (slaBreachedTasks.length === 0) {
      toast.info('Žádné SLA porušení k upozornění.');
      return;
    }

    const top = slaBreachedTasks.slice(0, 5);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      top.forEach((task) => {
        const overdueDays = Math.abs(getDueDayDelta(new Date(task.dueAt)));
        new Notification('CRM SLA Alert', {
          body: `${task.title} je po termínu ${overdueDays} dní`,
        });
      });
    } else {
      const preview = top.map((task) => `• ${task.title}`).join('\n');
      toast.warning(
        `SLA upozornění: ${slaBreachedTasks.length} úkolů je po termínu.\n${preview}`,
        { duration: 5000 },
      );
    }

    slaBreachedTasks.forEach((task) => {
      const overdueDays = Math.abs(getDueDayDelta(new Date(task.dueAt)));
      appendTaskAudit(task.id, 'updated', `SLA upozornění odesláno (${overdueDays} dní overdue)`, 'SLA');
    });
    toast.success(`SLA upozornění zpracováno pro ${slaBreachedTasks.length} úkolů.`);
  };

  const moveTaskToStatus = async (task: Task, nextStatus: 'pending' | 'in_progress' | 'completed') => {
    const currentStatus = normalizeStatusForUI(task.status || 'pending');
    if (currentStatus === nextStatus) return;
    if (updatingTaskIds.has(task.id)) return;
    const prevTask = task;
    const optimisticTask: Task = {
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date() : undefined,
      completedBy: nextStatus === 'completed' ? 'current_user' : undefined,
      updatedAt: new Date(),
    };
    setUpdatingTaskIds((prev) => new Set(prev).add(task.id));
    setTasks((prev) => prev.map((item) => (item.id === task.id ? optimisticTask : item)));
    try {
      const payloadStatus = nextStatus === 'completed' ? 'done' : nextStatus === 'in_progress' ? 'in_progress' : 'todo';
      const updated = await updateTask(task.id, { status: payloadStatus });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? mapTaskToUI(updated) : item)));
      appendTaskAudit(task.id, 'updated', `Kanban přesun: ${nextStatus}`);
    } catch {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? prevTask : item)));
      toast.error('Kanban přesun se nepodařilo uložit.');
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const cycleTaskPriority = async (task: Task) => {
    if (updatingTaskIds.has(task.id)) return;
    const current = task.priority || 'medium';
    const nextPriority: 'low' | 'medium' | 'high' =
      current === 'low' ? 'medium' : current === 'medium' ? 'high' : 'low';
    setUpdatingTaskIds((prev) => new Set(prev).add(task.id));
    setTasks((prev) =>
      prev.map((item) => (item.id === task.id ? { ...item, priority: nextPriority, updatedAt: new Date() } : item)),
    );
    try {
      const updated = await updateTask(task.id, { priority: nextPriority });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? mapTaskToUI(updated) : item)));
      appendTaskAudit(task.id, 'updated', `Zkratka: priorita => ${nextPriority.toUpperCase()}`);
    } catch {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
      toast.error('Nepodařilo se změnit prioritu.');
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const applyRuleBulkAction = async () => {
    if (!canUseSensitiveActions) {
      denySensitiveAction('Pravidla hromadných akcí');
      return;
    }
    if (bulkUpdating) return;
    let targetIds: string[] = [];
    let patch: { priority?: 'high' | 'medium' | 'low'; status?: 'todo' | 'in_progress' | 'done' } = {};
    let auditNote = '';

    if (selectedRule === 'overdue_low_to_high') {
      targetIds = tasks
        .filter((task) => task.status !== 'completed' && getDueDayDelta(new Date(task.dueAt)) < 0 && task.priority === 'low')
        .map((task) => task.id);
      patch = { priority: 'high' };
      auditNote = 'Pravidlo: overdue + low => high';
    } else if (selectedRule === 'unassigned_to_pending') {
      targetIds = tasks
        .filter((task) => (task.assignedContactIds?.[0] || '') === '' && task.status === 'in_progress')
        .map((task) => task.id);
      patch = { status: 'todo' };
      auditNote = 'Pravidlo: bez přiřazení + in_progress => pending';
    } else if (selectedRule === 'assigned_to_selected_plus_2d') {
      if (!ruleAssigneeId) {
        toast.info('Vyber uživatele pro pravidlo "assigned to X -> +2 dny".');
        return;
      }
      const assigneeName = getAssigneeDisplayName(ruleAssigneeId);
      const targets = tasks.filter((task) => (task.assignedContactIds?.[0] || '') === ruleAssigneeId);
      targetIds = targets.map((task) => task.id);
      auditNote = `Pravidlo: assigned to ${assigneeName} => due +2 dny`;
      if (targetIds.length === 0) {
        toast.info('Pro vybrané pravidlo nebyly nalezeny žádné úkoly.');
        return;
      }

      const oldDueById = new Map(targets.map((task) => [task.id, new Date(task.dueAt)]));
      setBulkUpdating(true);
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        targetIds.forEach((id) => next.add(id));
        return next;
      });
      setTasks((prev) =>
        prev.map((task) => {
          if (!targetIds.includes(task.id)) return task;
          const nextDueAt = new Date(task.dueAt);
          nextDueAt.setDate(nextDueAt.getDate() + 2);
          return { ...task, dueAt: nextDueAt, updatedAt: new Date() };
        }),
      );

      const results = await Promise.all(
        targetIds.map(async (id) => {
          const prevDue = oldDueById.get(id);
          if (!prevDue) return { ok: false as const, id };
          const nextDue = new Date(prevDue);
          nextDue.setDate(nextDue.getDate() + 2);
          try {
            const updated = await updateTask(id, { dueAt: nextDue.toISOString() });
            return { ok: true as const, id, mapped: mapTaskToUI(updated) };
          } catch {
            return { ok: false as const, id };
          }
        }),
      );
      const mapped = new Map<string, Task>();
      const failedIds: string[] = [];
      results.forEach((r) => (r.ok ? mapped.set(r.id, r.mapped) : failedIds.push(r.id)));
      setTasks((prev) =>
        prev.map((task) => {
          const fresh = mapped.get(task.id);
          if (fresh) return fresh;
          if (failedIds.includes(task.id)) {
            const oldDue = oldDueById.get(task.id);
            return oldDue ? { ...task, dueAt: oldDue } : task;
          }
          return task;
        }),
      );
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        targetIds.forEach((id) => next.delete(id));
        return next;
      });
      setBulkUpdating(false);
      mapped.forEach((_value, id) => appendTaskAudit(id, 'updated', auditNote, 'Automation'));
      if (failedIds.length > 0) {
        appendSensitiveActionAudit({
          area: 'tasks',
          action: 'apply_rule_bulk_action',
          result: 'error',
          actorRole: normalizedCurrentRole,
          actorUserId: currentUserId || undefined,
          meta: { rule: selectedRule, successCount: mapped.size, total: targetIds.length },
        });
        toast.warning(`Pravidlo provedeno ${mapped.size}/${targetIds.length}.`);
        return;
      }
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'apply_rule_bulk_action',
        result: 'success',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { rule: selectedRule, count: targetIds.length },
      });
      toast.success(`Pravidlo aplikováno na ${targetIds.length} úkolů.`);
      return;
    } else {
      targetIds = tasks
        .filter((task) => task.status === 'in_progress' && getDueDayDelta(new Date(task.dueAt)) <= 1 && task.priority !== 'high')
        .map((task) => task.id);
      patch = { priority: 'high' };
      auditNote = 'Pravidlo: in_progress + termín <= 1 den => high';
    }

    if (targetIds.length === 0) {
      toast.info('Pro vybrané pravidlo nebyly nalezeny žádné úkoly.');
      return;
    }

    setBulkUpdating(true);
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.add(id));
      return next;
    });

    const results = await Promise.all(
      targetIds.map(async (id) => {
        try {
          const updated = await updateTask(id, patch);
          return { ok: true as const, id, mapped: mapTaskToUI(updated) };
        } catch {
          return { ok: false as const, id };
        }
      }),
    );

    const mapped = new Map<string, Task>();
    const failedIds: string[] = [];
    for (const r of results) {
      if (r.ok) mapped.set(r.id, r.mapped);
      else failedIds.push(r.id);
    }
    setTasks((prev) => prev.map((task) => mapped.get(task.id) || task));
    setUpdatingTaskIds((prev) => {
      const next = new Set(prev);
      targetIds.forEach((id) => next.delete(id));
      return next;
    });
    setBulkUpdating(false);
    mapped.forEach((_value, id) => appendTaskAudit(id, 'updated', auditNote, 'Automation'));
    if (failedIds.length > 0) {
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'apply_rule_bulk_action',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { rule: selectedRule, successCount: mapped.size, total: targetIds.length },
      });
      toast.warning(`Pravidlo provedeno ${mapped.size}/${targetIds.length}.`);
      return;
    }
    appendSensitiveActionAudit({
      area: 'tasks',
      action: 'apply_rule_bulk_action',
      result: 'success',
      actorRole: normalizedCurrentRole,
      actorUserId: currentUserId || undefined,
      meta: { rule: selectedRule, count: targetIds.length },
    });
    toast.success(`Pravidlo aplikováno na ${targetIds.length} úkolů.`);
  };

  const buildExportRows = (source: Task[], columns: ExportColumnKey[]) => {
    const header = columns.map((col) => {
      switch (col) {
        case 'title':
          return 'Title';
        case 'description':
          return 'Description';
        case 'status':
          return 'Status';
        case 'priority':
          return 'Priority';
        case 'dueAt':
          return 'DueAt';
        case 'assigned':
          return 'Assigned';
        case 'recommendedPriority':
          return 'RecommendedPriority';
        default:
          return col;
      }
    });
    const rows = source.map((task) => {
      const assigned = (task.assignedContactIds || [])
        .map((id) => getAssigneeDisplayName(id))
        .join('; ');
      const row = {
        title: task.title || '',
        description: task.content || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueAt: task.dueAt ? new Date(task.dueAt).toISOString() : '',
        assigned,
        recommendedPriority: recommendPriority(task),
      } as Record<ExportColumnKey, string>;
      return columns.map((column) => row[column] ?? '');
    });
    return { header, rows };
  };

  const downloadCsv = (filename: string, header: string[], rows: string[][]) => {
    const content = [header, ...rows]
      .map((line) => line.map((cell) => csvEscape(String(cell))).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportFilteredData = () => {
    if (!canUseAdvancedExport) {
      denySensitiveAction('Advanced Export');
      return;
    }
    const selectedColumns = (Object.keys(exportColumns) as ExportColumnKey[]).filter(
      (key) => exportColumns[key],
    );
    if (selectedColumns.length === 0) {
      toast.info('Vyber alespoň jeden export sloupec.');
      return;
    }
    const appendExportAudit = (formatLabel: 'CSV' | 'XLSX', failed = false) => {
      const targets = filteredData.slice(0, 200);
      targets.forEach((task) => {
        appendTaskAudit(
          task.id,
          'updated',
          failed ? `Export ${formatLabel} - FAILED` : `Export ${formatLabel}`,
          'Export',
        );
      });
      if (filteredData.length > 200) {
        toast.info(`Audit exportu zapsán pro prvních 200/${filteredData.length} úkolů.`);
      }
    };
    const main = buildExportRows(filteredData, selectedColumns);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const overdueRows = buildExportRows(
      filteredData.filter(
        (task) => task.status !== 'completed' && getDueDayDelta(new Date(task.dueAt)) < 0,
      ),
      selectedColumns,
    );
    try {
      if (exportFormat === 'xlsx') {
        const wb = XLSX.utils.book_new();
        const mainSheet = XLSX.utils.aoa_to_sheet([main.header, ...main.rows]);
        XLSX.utils.book_append_sheet(wb, mainSheet, 'Tasks');
        if (exportIncludeOverdueSheet) {
          const overdueSheet = XLSX.utils.aoa_to_sheet([overdueRows.header, ...overdueRows.rows]);
          XLSX.utils.book_append_sheet(wb, overdueSheet, 'Overdue');
        }
        XLSX.writeFile(wb, `tasks-export-${stamp}.xlsx`);
        appendExportAudit('XLSX');
        appendSensitiveActionAudit({
          area: 'tasks',
          action: 'export_tasks',
          result: 'success',
          actorRole: normalizedCurrentRole,
          actorUserId: currentUserId || undefined,
          meta: { format: 'xlsx', rowCount: filteredData.length, includeOverdueSheet: exportIncludeOverdueSheet },
        });
        toast.success(`Exportováno ${filteredData.length} úkolů do XLSX.`);
        return;
      }
      downloadCsv(`tasks-export-${stamp}.csv`, main.header, main.rows);
      if (exportIncludeOverdueSheet) {
        downloadCsv(`tasks-overdue-export-${stamp}.csv`, overdueRows.header, overdueRows.rows);
      }
      appendExportAudit('CSV');
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'export_tasks',
        result: 'success',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        meta: { format: 'csv', rowCount: filteredData.length, includeOverdueSheet: exportIncludeOverdueSheet },
      });
      toast.success(`Exportováno ${filteredData.length} úkolů do CSV.`);
    } catch (error) {
      logFrontendError({
        area: 'crm-tasks',
        message: error instanceof Error ? error.message : 'Tasks export failed',
        meta: {
          operation: 'tasks_export',
          format: exportFormat,
          includeOverdueSheet: exportIncludeOverdueSheet,
          rowCount: filteredData.length,
        },
      });
      appendExportAudit(exportFormat === 'xlsx' ? 'XLSX' : 'CSV', true);
      appendSensitiveActionAudit({
        area: 'tasks',
        action: 'export_tasks',
        result: 'error',
        actorRole: normalizedCurrentRole,
        actorUserId: currentUserId || undefined,
        message: error instanceof Error ? error.message : 'Export failed',
        meta: { format: exportFormat, rowCount: filteredData.length, includeOverdueSheet: exportIncludeOverdueSheet },
      });
      toast.error(error instanceof Error ? error.message : 'Export selhal.');
    }
  };

  const saveExportTemplate = () => {
    if (!canUseAdvancedExport) {
      denySensitiveAction('Uložení export šablony');
      return;
    }
    const name = exportTemplateName.trim();
    if (!name) {
      toast.info('Zadej název export šablony.');
      return;
    }
    const selectedColumns = (Object.keys(exportColumns) as ExportColumnKey[]).filter(
      (key) => exportColumns[key],
    );
    const next: ExportTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      columns: selectedColumns,
      includeOverdueSheet: exportIncludeOverdueSheet,
      format: exportFormat,
    };
    setExportTemplates((prev) => [next, ...prev.filter((tpl) => tpl.name !== name)].slice(0, 20));
    setExportTemplateName('');
    toast.success(`Export šablona "${name}" uložena.`);
  };

  const applyExportTemplate = (tpl: ExportTemplate) => {
    if (!canUseAdvancedExport) {
      denySensitiveAction('Použití export šablony');
      return;
    }
    const nextColumns: Record<ExportColumnKey, boolean> = {
      title: false,
      description: false,
      status: false,
      priority: false,
      dueAt: false,
      assigned: false,
      recommendedPriority: false,
    };
    tpl.columns.forEach((col) => {
      nextColumns[col] = true;
    });
    setExportColumns(nextColumns);
    setExportIncludeOverdueSheet(tpl.includeOverdueSheet);
    setExportFormat(tpl.format || 'csv');
  };

  const deleteExportTemplate = (id: string) => {
    if (!canUseAdvancedExport) {
      denySensitiveAction('Smazání export šablony');
      return;
    }
    setExportTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
  };

  const requestBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') {
      toast.info('Tento prohlížeč nepodporuje Notification API.');
      return;
    }
    if (Notification.permission === 'granted') {
      toast.success('Notifikace už jsou povolené.');
      return;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') toast.success('Notifikace povoleny.');
    else toast.warning('Notifikace nebyly povoleny.');
  };

  const resetReminderBuckets = () => {
    const removed = removeStoredKey(TASK_REMINDERS_STORAGE_KEY, 'remove_reminders_fired');
    if (removed) {
      setReminderBadgeCount(0);
      toast.success('Reminder historie byla vymazána.');
    } else {
      toast.error('Nepodařilo se vymazat reminder historii.');
    }
  };

  const saveCurrentView = () => {
    const name = newViewName.trim();
    if (!name) {
      toast.info('Zadej název pohledu.');
      return;
    }

    const next: TaskFilterView = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      searchQuery,
      selectedStatuses: sanitizeStatusFilterIds(selectedStatuses),
      selectedPriorities: sanitizePriorityFilterIds(selectedPriorities),
      selectedAssigneeIds: sanitizeAssigneeFilterIds(selectedAssigneeIds),
      dueWindow: sanitizeDueWindowValue(dueWindow),
      showOverdueOnly: showOverdueOnly === true,
    };
    setSavedViews((prev) => [next, ...prev.filter((item) => item.name !== name)].slice(0, 20));
    setNewViewName('');
    toast.success(`Pohled "${name}" uložen.`);
  };

  const applyView = (view: TaskFilterView) => {
    if (view.id === 'sys-my-overdue' && (!view.selectedAssigneeIds || view.selectedAssigneeIds.length === 0)) {
      toast.info('Pohled "Moje overdue" nemá mapovaného uživatele. Zkontroluj přiřazení v User Management.');
    }
    const sanitizedViewAssignees = sanitizeAssigneeFilterIds(view.selectedAssigneeIds);
    const sanitizedViewStatuses = sanitizeStatusFilterIds(view.selectedStatuses);
    const sanitizedViewPriorities = sanitizePriorityFilterIds(view.selectedPriorities);
    const sanitizedViewDueWindow = sanitizeDueWindowValue(view.dueWindow);
    const sanitizedViewOverdueOnly = view.showOverdueOnly === true;
    if (sanitizedViewAssignees.length !== (view.selectedAssigneeIds || []).length) {
      toast.info('Pohled obsahoval neplatné přiřazení a byl automaticky očištěn.');
    }
    if (
      sanitizedViewStatuses.length !== (view.selectedStatuses || []).length ||
      sanitizedViewPriorities.length !== (view.selectedPriorities || []).length
    ) {
      toast.info('Pohled obsahoval neplatné status/priority filtry a byl automaticky očištěn.');
    }
    if (sanitizedViewDueWindow !== view.dueWindow) {
      toast.info('Pohled obsahoval neplatné nastavení termínu a byl automaticky očištěn.');
    }
    setSearchQuery(view.searchQuery);
    setSelectedStatuses(sanitizedViewStatuses);
    setSelectedPriorities(sanitizedViewPriorities);
    setSelectedAssigneeIds(sanitizedViewAssignees);
    setDueWindow(sanitizedViewDueWindow);
    setShowOverdueOnly(sanitizedViewOverdueOnly);
    toast.success(`Načten pohled: ${view.name}`);
  };

  const deleteView = (id: string) => {
    setSavedViews((prev) => prev.filter((item) => item.id !== id));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" appearance="light">
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="info" appearance="light">
            In Progress
          </Badge>
        );
      case 'pending':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: 'status',
        id: 'status-toggle',
        header: '',
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="flex items-center justify-center ps-2.5">
              <Checkbox
                size="sm"
                id={task.id}
                checked={task.status === 'completed'}
                disabled={updatingTaskIds.has(task.id)}
                onCheckedChange={(checked) =>
                  void handleTaskComplete(task.id, checked === true)
                }
              />
            </div>
          );
        },
        enableSorting: false,
        size: 30,
        enableHiding: false,
        enableResizing: false,
      },
      {
        accessorKey: 'title',
        id: 'title',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Task"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="inline-flex items-center gap-2 pe-2.5">
              <button
                type="button"
                onClick={() => openTaskDetail(task)}
                className={cn(
                  'font-medium text-left hover:text-primary',
                  activeTaskId === task.id && 'text-primary',
                  task.status === 'completed' && 'line-through',
                )}
              >
                {task.title}
              </button>
              <div className="hidden text-muted-foreground line-clamp-2">
                {task.content}
              </div>
            </div>
          );
        },
        size: 225,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'assignedContacts',
        id: 'team',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Assigned"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const contactIds = row.original.assignedContactIds || [];
          return (
            <div className="flex truncate overflow-hidden gap-1.5">
              {contactIds.map((contactId) => {
                const managedUser = managedUserByAssigneeId.get(contactId);
                if (managedUser) {
                  return (
                    <div
                      key={contactId}
                      className="group flex cursor-pointer items-center gap-1 rounded-full border border-border bg-accent/50 px-1"
                    >
                      <Avatar className="my-1 size-4">
                        <AvatarFallback className="border-0 bg-indigo-500 text-[11px] font-semibold text-white">
                          {managedUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="h-full border-r border-border"></div>
                      <span className="max-w-[100px] truncate text-xs group-hover:text-primary">
                        {managedUser.name}
                      </span>
                    </div>
                  );
                }

                const contact = contactById.get(contactId);
                return contact ? (
                  <div
                    key={contactId}
                    className="group cursor-pointer flex items-center gap-1 px-1 border border-border rounded-full bg-accent/50"
                  >
                    <Avatar className="size-4 my-1">
                      <AvatarImage
                        src={toAbsoluteUrl(contact.avatar || '')}
                        alt={contact.name}
                      />
                      <AvatarFallback className="border-0 text-[11px] font-semibold bg-green-500 text-white">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="border-r border-border h-full"></div>

                    <span className="truncate max-w-[100px] text-xs group-hover:text-primary">
                      {contact.name}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          );
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'priority',
        id: 'priority',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Priority"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const task = row.original;
          const recommended = recommendPriority(task);
          const different = (task.priority || 'medium') !== recommended;
          return task ? (
            task.priority ? (
              <div className="flex flex-col gap-1">
                <Badge
                  variant={
                    task.priority === 'high'
                      ? 'destructive'
                      : task.priority === 'medium'
                        ? 'warning'
                        : 'success'
                  }
                  appearance="light"
                  className="px-1.5 py-0.5 text-xs"
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
                {different ? (
                  <span className="text-[11px] text-muted-foreground">
                    Doporučeno: {recommended.toUpperCase()}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="text-muted-foreground">None</span>
            )
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'dueAt',
        id: 'dueAt',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Due Date"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const task = row.original;
          const isOverdue =
            new Date(task.dueAt) < new Date() && task.status !== 'completed';
          const dueDelta = getDueDayDelta(new Date(task.dueAt));
          const dueMeta =
            task.status === 'completed'
              ? null
              : dueDelta < 0
                ? { label: `Overdue ${Math.abs(dueDelta)}d`, className: 'text-destructive' }
                : dueDelta === 0
                  ? { label: 'Dnes', className: 'text-orange-600' }
                  : { label: `Za ${dueDelta}d`, className: 'text-muted-foreground' };

          return (
            <div className="flex flex-col leading-tight">
              <span className={cn(isOverdue && 'text-destructive')}>
                {formatDate(task.dueAt)}
              </span>
              {dueMeta ? (
                <span className={cn('text-[11px]', dueMeta.className)}>{dueMeta.label}</span>
              ) : null}
            </div>
          );
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => getStatusBadge(row.original.status || 'pending'),
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'createdAt',
        id: 'created',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Added"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'actions',
        id: 'actions',
        header: () => <></>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                className="pointer-events-none opacity-0 transition-opacity duration-300 group-hover/row:pointer-events-auto group-hover/row:opacity-100 data-[state=open]:pointer-events-auto data-[state=open]:opacity-100"
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onClick={() => openTaskDetail(row.original)}>
                <Eye />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditTask(row.original)}>
                <Pencil />
                Upravit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={duplicatingTaskId === row.original.id}
                onClick={() => void duplicateTask(row.original)}
              >
                <Copy />
                {duplicatingTaskId === row.original.id ? 'Duplikuji...' : 'Duplikovat'}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={updatingTaskIds.has(row.original.id)}
                onClick={() => void shiftTaskDueDate(row.original, 1)}
              >
                <CalendarClock />
                Posunout +1 den
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={updatingTaskIds.has(row.original.id)}
                onClick={() => void shiftTaskDueDate(row.original, 7)}
              >
                <CalendarClock />
                Posunout +7 dní
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={updatingTaskIds.has(row.original.id)}
                onClick={() => void applyRecommendedPriority(row.original)}
              >
                <AlertCircle />
                Aplikovat doporučenou prioritu
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={!canDeleteTask}
                onClick={() => openDeleteTask(row.original)}
              >
                <Trash />
                {canDeleteTask ? 'Delete' : 'Delete (admin/manager)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 60,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
    ],
    [activeTaskId, canDeleteTask, contactById, managedUserByAssigneeId, tasks],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const kanbanColumns = useMemo(
    () =>
      [
        { key: 'pending', title: 'Pending' },
        { key: 'in_progress', title: 'In Progress' },
        { key: 'completed', title: 'Completed' },
      ] as const,
    [],
  );

  const sortKanbanItems = (items: Task[]): Task[] => {
    const arr = [...items];
    arr.sort((a, b) => {
      if (kanbanSort === 'due_asc') return +new Date(a.dueAt) - +new Date(b.dueAt);
      if (kanbanSort === 'due_desc') return +new Date(b.dueAt) - +new Date(a.dueAt);
      if (kanbanSort === 'priority_desc') return priorityRank(b.priority) - priorityRank(a.priority);
      if (kanbanSort === 'priority_asc') return priorityRank(a.priority) - priorityRank(b.priority);
      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });
    return arr;
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }

      const shortcutTargetTask = detailTask ?? activeTask;
      if (!shortcutTargetTask) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        openEditTask(shortcutTargetTask);
        if (detailTask) setDetailTaskId(null);
        return;
      }
      if (event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        void moveTaskToStatus(
          shortcutTargetTask,
          shortcutTargetTask.status === 'completed' ? 'pending' : 'completed',
        );
        return;
      }
      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        void cycleTaskPriority(shortcutTargetTask);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTask, cycleTaskPriority, detailTask, moveTaskToStatus]);

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableClassNames={{
        bodyRow: 'group/row',
      }}
      tableLayout={{
        dense: true,
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <Card className="min-w-0 border-none shadow-none">
        <CardHeader className="min-w-0 px-4 py-3 -mt-2.5">
          {tasksHydrated ? (
            <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-md border px-2.5 py-1.5">
                <p className="text-[11px] text-muted-foreground">Open</p>
                <p className="text-sm font-semibold">{dashboardMetrics.totalOpen}</p>
              </div>
              <div className="rounded-md border px-2.5 py-1.5">
                <p className="text-[11px] text-muted-foreground">Completion Rate</p>
                <p className="text-sm font-semibold">{dashboardMetrics.completionRate}</p>
              </div>
              <div className="rounded-md border px-2.5 py-1.5">
                <p className="text-[11px] text-muted-foreground">Completed (7d)</p>
                <p className="text-sm font-semibold">{dashboardMetrics.completedThisWeek}</p>
              </div>
              <div className="rounded-md border px-2.5 py-1.5">
                <p className="text-[11px] text-muted-foreground">Avg Overdue (days)</p>
                <p className="text-sm font-semibold">{dashboardMetrics.avgOverdueDays}</p>
              </div>
            </div>
          ) : (
            <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`tasks-metric-skeleton-${index}`} className="rounded-md border px-2.5 py-1.5">
                  <Skeleton className="mb-1 h-3 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          )}
          {tasksHydrated && assigneeCompletionStats.length > 0 ? (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Top completion:</span>
              {assigneeCompletionStats.map((item) => (
                <span
                  key={item.assigneeId}
                  className="inline-flex max-w-[220px] items-center gap-1 rounded border px-2 py-0.5"
                  title={`${item.name}: ${item.rate}%`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0">: {item.rate}%</span>
                </span>
              ))}
            </div>
          ) : null}
          <ObservabilityBadges
            className="mb-2"
            role={normalizedCurrentRole}
            frontendErrorCount24h={frontendErrorCount24h}
            sensitiveActions24hSummary={sensitiveActions24hSummary}
          />
          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
            {systemViews.map((view) => (
              <Button
                key={view.id}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={Boolean(view.disabledReason)}
                title={view.disabledReason || undefined}
                onClick={() => applyView(view)}
              >
                {view.name}
              </Button>
            ))}
            <Input
              variant="sm"
              placeholder="Název pohledu…"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              className="w-44"
            />
            <Button size="sm" variant="outline" onClick={saveCurrentView}>
              Uložit pohled
            </Button>
            {savedViews.map((view) => (
              <div key={view.id} className="inline-flex items-center rounded-md border border-border">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 max-w-[220px] rounded-r-none truncate"
                  onClick={() => applyView(view)}
                >
                  {view.name}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-l-none border-l px-2"
                  onClick={() => deleteView(view.id)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant={viewMode === 'table' ? 'primary' : 'outline'} onClick={() => setViewMode('table')}>
              <List className="size-3.5" />
              Tabulka
            </Button>
            <Button size="sm" variant={viewMode === 'kanban' ? 'primary' : 'outline'} onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="size-3.5" />
              Kanban
            </Button>
            {viewMode === 'kanban' ? (
              <div className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs">
                <span className="text-muted-foreground">WIP limit</span>
                <select
                  className="h-6 rounded border border-input bg-background px-1 text-[11px]"
                  value={kanbanWipLimit}
                  onChange={(e) => setKanbanWipLimit(Number(e.target.value) || 6)}
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                </select>
                <select
                  className="h-6 rounded border border-input bg-background px-1 text-[11px]"
                  value={kanbanSort}
                  onChange={(e) => setKanbanSort(e.target.value as KanbanSort)}
                >
                  <option value="due_asc">Due ↑</option>
                  <option value="due_desc">Due ↓</option>
                  <option value="priority_desc">Priority ↓</option>
                  <option value="priority_asc">Priority ↑</option>
                  <option value="updated_desc">Updated ↓</option>
                </select>
              </div>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => void requestBrowserNotifications()}>
              <Bell className="size-3.5" />
              Připomínky
              <Badge size="sm" variant="outline">
                {reminderBadgeCount}
              </Badge>
            </Button>
            <div className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px]">
              <span className="text-muted-foreground">Reminder</span>
              <label className="inline-flex items-center gap-1">
                <Checkbox
                  id="reminder-mode-today"
                  checked={reminderModes.today}
                  onCheckedChange={(checked) =>
                    setReminderModes((prev) => ({ ...prev, today: checked === true }))
                  }
                />
                Dnes
              </label>
              <label className="inline-flex items-center gap-1">
                <Checkbox
                  id="reminder-mode-24h"
                  checked={reminderModes['24h']}
                  onCheckedChange={(checked) =>
                    setReminderModes((prev) => ({ ...prev, '24h': checked === true }))
                  }
                />
                24h
              </label>
              <label className="inline-flex items-center gap-1">
                <Checkbox
                  id="reminder-mode-3d"
                  checked={reminderModes['3d']}
                  onCheckedChange={(checked) =>
                    setReminderModes((prev) => ({ ...prev, '3d': checked === true }))
                  }
                />
                3 dny
              </label>
            </div>
            <Button size="sm" variant="ghost" onClick={resetReminderBuckets}>
              Reset reminders
            </Button>
          </div>
          <div className="mb-2 min-h-10">
            {!tasksHydrated ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2">
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs">
                <span className="font-medium text-amber-900">
                  Po splatnosti: {overdueOpenTasks.length}
                </span>
                <Button
                  size="sm"
                  variant={showOverdueOnly ? 'primary' : 'outline'}
                  onClick={() => setShowOverdueOnly((v) => !v)}
                  disabled={overdueOpenTasks.length === 0 && !showOverdueOnly}
                >
                  {showOverdueOnly ? 'Zobrazit vše' : 'Filtrovat pouze overdue'}
                </Button>
                {overdueOpenTasks.length > 0 ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canUseSensitiveActions || overdueElevateCandidates.length === 0}
                      onClick={() => setOverdueElevatePreviewDialogOpen(true)}
                    >
                      Nastavit priority High ({overdueElevateCandidates.length})
                    </Button>
                    <div className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-2 py-1">
                      <Label className="text-[11px]">SLA</Label>
                      <Checkbox
                        id="sla-enabled"
                        checked={slaEnabled}
                        onCheckedChange={(checked) => setSlaEnabled(checked === true)}
                      />
                      <select
                        className="h-6 rounded border border-input bg-background px-1 text-[11px]"
                        value={slaThresholdDays}
                        onChange={(e) => setSlaThresholdDays(Number(e.target.value) || 3)}
                      >
                        <option value={1}>{'>'}1d</option>
                        <option value={3}>{'>'}3d</option>
                        <option value={5}>{'>'}5d</option>
                      </select>
                      <span className="text-[11px] text-amber-900">Breach: {slaBreachedTasks.length}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSlaApplyPreviewDialogOpen(true)}
                        disabled={!slaEnabled || bulkUpdating || !canUseSensitiveActions || slaApplyCandidates.length === 0}
                      >
                        Apply SLA ({slaApplyCandidates.length})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSlaNotifyPreviewDialogOpen(true)}
                        disabled={!slaEnabled || slaBreachedTasks.length === 0}
                      >
                        Upozornit SLA ({slaBreachedTasks.length})
                      </Button>
                    </div>
                  </>
                ) : (
                  <span className="text-[11px] text-amber-900/80">Žádné overdue úkoly.</span>
                )}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
              <Input
                ref={searchInputRef}
                variant="sm"
                placeholder="Search tasks... (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                className="ps-9 w-48"
              />
              {searchQuery.length > 0 && (
                <Button
                  mode="icon"
                  variant="ghost"
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={clearSearchQuery}
                >
                  <X />
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <Filter className="size-3.5" />
                  Status
                  {selectedStatuses.length > 0 && (
                    <Badge size="sm" variant="outline">
                      {selectedStatuses.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search status..." />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {[
                        { id: 'pending', name: 'Pending' },
                        { id: 'in_progress', name: 'In Progress' },
                        { id: 'completed', name: 'Completed' },
                      ].map((status) => {
                        const count = statusCounts[status.id] || 0;
                        return (
                          <CommandItem
                            key={status.id}
                            value={status.id}
                            className="flex items-center gap-2.5 bg-transparent!"
                          >
                            <Checkbox
                              id={status.id}
                              checked={selectedStatuses.includes(status.id)}
                              onCheckedChange={(checked) =>
                                handleStatusChange(checked === true, status.id)
                              }
                            />
                            <Label
                              htmlFor={status.id}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              {getStatusBadge(status.id)}
                              <span className="text-muted-foreground font-semibold me-2.5">
                                {count}
                              </span>
                            </Label>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Priority Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <AlertCircle className="size-3.5" />
                  Priority
                  {selectedPriorities.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {selectedPriorities.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search priority..." />
                  <CommandList>
                    <CommandEmpty>No priority found.</CommandEmpty>
                    <CommandGroup>
                      {[
                        { id: 'high', name: 'High' },
                        { id: 'medium', name: 'Medium' },
                        { id: 'low', name: 'Low' },
                      ].map((priority) => {
                        const count = priorityCounts[priority.id] || 0;
                        return (
                          <CommandItem
                            key={priority.id}
                            value={priority.id}
                            className="flex items-center gap-2.5 bg-transparent!"
                          >
                            <Checkbox
                              id={priority.id}
                              checked={selectedPriorities.includes(priority.id)}
                              onCheckedChange={(checked) =>
                                handlePriorityChange(
                                  checked === true,
                                  priority.id,
                                )
                              }
                              size="sm"
                            />
                            <Label
                              htmlFor={priority.id}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              <Badge
                                variant={
                                  priority.id === 'high'
                                    ? 'destructive'
                                    : priority.id === 'medium'
                                      ? 'warning'
                                      : 'success'
                                }
                                appearance="light"
                              >
                                {priority.name}
                              </Badge>
                              <span className="text-muted-foreground font-semibold me-2.5">
                                {count}
                              </span>
                            </Label>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  Assigned
                  {selectedAssigneeIds.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {selectedAssigneeIds.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search assignee..." />
                  <CommandList>
                    <CommandEmpty>No assignee found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key={UNASSIGNED_FILTER_ID}
                        value="Nepřiřazeno unassigned"
                        className="flex items-center gap-2.5 bg-transparent!"
                      >
                        <Checkbox
                          id={`assignee-filter-${UNASSIGNED_FILTER_ID}`}
                          checked={selectedAssigneeIds.includes(UNASSIGNED_FILTER_ID)}
                          onCheckedChange={(checked) =>
                            handleAssigneeChange(checked === true, UNASSIGNED_FILTER_ID)
                          }
                          size="sm"
                        />
                        <Label
                          htmlFor={`assignee-filter-${UNASSIGNED_FILTER_ID}`}
                          className="grow flex items-center justify-between font-normal gap-1.5"
                        >
                          <span className="truncate">Nepřiřazeno</span>
                          <span className="text-muted-foreground font-semibold me-2.5">
                            {assigneeCounts[UNASSIGNED_FILTER_ID] || 0}
                          </span>
                        </Label>
                      </CommandItem>
                      {managedAssigneeOptions.map(({ assigneeId, displayName, email }) => {
                        const count = assigneeCounts[assigneeId] || 0;
                        return (
                          <CommandItem
                            key={assigneeId}
                            value={`${displayName} ${email}`}
                            className="flex items-center gap-2.5 bg-transparent!"
                          >
                            <Checkbox
                              id={`assignee-filter-${assigneeId}`}
                              checked={selectedAssigneeIds.includes(assigneeId)}
                              onCheckedChange={(checked) =>
                                handleAssigneeChange(checked === true, assigneeId)
                              }
                              size="sm"
                            />
                            <Label
                              htmlFor={`assignee-filter-${assigneeId}`}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              <span className="truncate">
                                {displayName}
                              </span>
                              <span className="text-muted-foreground font-semibold me-2.5">
                                {count}
                              </span>
                            </Label>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              variant="outline"
              disabled={bulkUpdating || !canUseSensitiveActions || bulkCompletePreviewCount === 0}
              onClick={() => {
                setBulkStatusTargetCompleted(true);
                setBulkStatusPreviewDialogOpen(true);
              }}
            >
              <CircleCheck className="size-3.5" />
              Dokončit filtrované ({bulkCompletePreviewCount})
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkUpdating || !canUseSensitiveActions || bulkReopenPreviewCount === 0}
              onClick={() => {
                setBulkStatusTargetCompleted(false);
                setBulkStatusPreviewDialogOpen(true);
              }}
            >
              Vrátit dokončené ({bulkReopenPreviewCount})
            </Button>
            <select
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm"
              value={dueWindow}
              onChange={(e) =>
                setDueWindow(
                  e.target.value as 'all' | 'today' | 'next_3_days' | 'next_7_days' | 'overdue',
                )
              }
            >
              <option value="all">Termín: vše</option>
              <option value="today">Termín: dnes</option>
              <option value="next_3_days">Termín: do 3 dnů</option>
              <option value="next_7_days">Termín: do 7 dnů</option>
              <option value="overdue">Termín: overdue</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkUpdating || !canUseSensitiveActions || bulkShiftPreviewCount === 0}
              onClick={() => {
                setBulkShiftDays(1);
                setBulkShiftPreviewDialogOpen(true);
              }}
            >
              Posunout filtrované +1 den ({bulkShiftPreviewCount})
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkUpdating || !canUseSensitiveActions || bulkShiftPreviewCount === 0}
              onClick={() => {
                setBulkShiftDays(7);
                setBulkShiftPreviewDialogOpen(true);
              }}
            >
              Posunout filtrované +7 dní ({bulkShiftPreviewCount})
            </Button>
            <ManagedAssigneeSelect
              value={bulkAssigneeId}
              onValueChange={setBulkAssigneeId}
              placeholder="Nepřiřazeno"
              disabled={bulkUpdating || !canUseSensitiveActions}
              className="h-9 w-[220px]"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={bulkUpdating || !canUseSensitiveActions || bulkAssignPreviewTasks.length === 0}
              onClick={() => setBulkAssignPreviewDialogOpen(true)}
            >
              {bulkAssigneeId
                ? `Přiřadit filtrované (${bulkAssignPreviewTasks.length})`
                : `Odebrat přiřazení (${bulkAssignPreviewTasks.length})`}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkUpdating || !canUseSensitiveActions || recommendedBulkTasks.length === 0}
              onClick={() => setBulkRecommendedPreviewDialogOpen(true)}
            >
              Doporučit prioritu (bulk {recommendedBulkCount})
            </Button>
            <select
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm"
              value={selectedRule}
              onChange={(e) =>
                setSelectedRule(
                  e.target.value as
                    | 'overdue_low_to_high'
                    | 'unassigned_to_pending'
                    | 'in_progress_due_soon_to_high'
                    | 'assigned_to_selected_plus_2d',
                )
              }
              disabled={bulkUpdating || !canUseSensitiveActions}
            >
              <option value="overdue_low_to_high">Rule: overdue + low {'=>'} high</option>
              <option value="unassigned_to_pending">Rule: unassigned + in_progress {'=>'} pending</option>
              <option value="in_progress_due_soon_to_high">Rule: in_progress + due soon {'=>'} high</option>
              <option value="assigned_to_selected_plus_2d">Rule: assigned to X {'=>'} +2 dny</option>
            </select>
            {selectedRule === 'assigned_to_selected_plus_2d' ? (
              <ManagedAssigneeSelect
                value={ruleAssigneeId}
                onValueChange={setRuleAssigneeId}
                placeholder="Vyber uživatele"
                disabled={bulkUpdating || !canUseSensitiveActions}
                className="h-9 w-[220px]"
              />
            ) : null}
            <span className="max-w-[320px] truncate text-xs text-muted-foreground" title={selectedRuleDescription}>
              {selectedRuleDescription}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkUpdating || rulePreviewCount === 0 || !canUseSensitiveActions}
              onClick={() => setRulePreviewDialogOpen(true)}
            >
              Spustit pravidlo ({rulePreviewCount})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatuses([]);
                setSelectedPriorities([]);
                setSelectedAssigneeIds([]);
                setDueWindow('all');
                setShowOverdueOnly(false);
              }}
            >
              Reset filtrů
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!canUseAdvancedExport}
              onClick={() => setExportDialogOpen(true)}
            >
              Advanced Export
            </Button>
          </div>
        </CardHeader>

        <CardTable>
          {!tasksHydrated ? (
            viewMode === 'table' ? (
              <DataGridLoadingRows
                rows={7}
                rowClassName="h-10 w-full"
                containerClassName="space-y-2 px-3 py-2.5 md:px-4"
                idPrefix="tasks-table-skeleton"
              />
            ) : (
              <div className="grid gap-4 px-3 py-2.5 sm:px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-6">
                {Array.from({ length: 3 }).map((_, columnIndex) => (
                  <div
                    key={`tasks-kanban-skeleton-${columnIndex}`}
                    className="min-h-[220px] min-w-0 rounded-md border bg-muted/20 p-2.5"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : viewMode === 'table' ? (
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="grid gap-4 px-3 py-2.5 sm:px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-6">
              {kanbanColumns.map((column) => {
                const items = filteredData.filter(
                  (task) => normalizeStatusForUI(task.status || 'pending') === column.key,
                );
                const sortedItems = sortKanbanItems(items);
                const isWipBreached = column.key === 'in_progress' && sortedItems.length > kanbanWipLimit;
                return (
                  <div
                    key={column.key}
                    className={cn(
                      'min-h-[220px] min-w-0 rounded-md border bg-muted/20 p-2.5 transition-colors',
                      dragOverColumnKey === column.key && 'border-primary/70 bg-primary/5',
                      draggingTaskId && dragOverColumnKey !== column.key && 'border-border/60',
                      isWipBreached && 'border-amber-400 bg-amber-50/60',
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverColumnKey !== column.key) setDragOverColumnKey(column.key);
                    }}
                    onDragEnter={() => setDragOverColumnKey(column.key)}
                    onDragLeave={() =>
                      setDragOverColumnKey((prev) => (prev === column.key ? null : prev))
                    }
                    onDrop={(e) => {
                      const taskId = e.dataTransfer.getData('text/plain');
                      const task = tasks.find((t) => t.id === taskId);
                      setDragOverColumnKey(null);
                      setDraggingTaskId(null);
                      setDraggingFromColumnKey(null);
                      if (!task) return;
                      const sourceStatus = normalizeStatusForUI(task.status || 'pending');
                      if (sourceStatus === column.key) return;
                      void moveTaskToStatus(task, column.key);
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="truncate text-sm font-semibold">{column.title}</p>
                      <div className="flex items-center gap-1.5">
                        {isWipBreached ? (
                          <span className="text-[11px] font-medium text-amber-700">
                            WIP {sortedItems.length}/{kanbanWipLimit}
                          </span>
                        ) : null}
                        <Badge variant="outline">{sortedItems.length}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {dragOverColumnKey === column.key ? (
                        <div className="rounded border border-dashed border-primary/60 bg-primary/5 px-2 py-1.5 text-[11px] text-primary">
                          {draggingFromColumnKey && draggingFromColumnKey !== column.key
                            ? `Pusť pro přesun do ${column.title}`
                            : 'Pusť úkol sem'}
                        </div>
                      ) : null}
                      {sortedItems.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingTaskId(task.id);
                            setDraggingFromColumnKey(
                              normalizeStatusForUI(task.status || 'pending'),
                            );
                          }}
                          onDragEnd={() => {
                            setDraggingTaskId(null);
                            setDraggingFromColumnKey(null);
                            setDragOverColumnKey(null);
                          }}
                          className={cn(
                            'w-full min-w-0 rounded border bg-background p-2 transition',
                            activeTaskId === task.id && 'border-primary/60 ring-1 ring-primary/40',
                            draggingTaskId === task.id && 'opacity-60 ring-1 ring-primary/50',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => openTaskDetail(task)}
                            className="w-full text-left"
                          >
                            <p className="break-words text-sm font-medium">{task.title}</p>
                            <p className="mt-0.5 break-words text-xs text-muted-foreground">
                              {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()}
                            </p>
                          </button>
                          <div className="mt-2 flex items-center gap-1">
                            {task.status !== 'completed' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => void moveTaskToStatus(task, 'completed')}
                                disabled={updatingTaskIds.has(task.id)}
                              >
                                Done
                              </Button>
                            ) : null}
                            {task.status === 'pending' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => void moveTaskToStatus(task, 'in_progress')}
                                disabled={updatingTaskIds.has(task.id)}
                              >
                                Start
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                      {sortedItems.length === 0 && dragOverColumnKey !== column.key ? (
                        <div className="rounded border border-dashed px-2 py-1.5 text-[11px] text-muted-foreground">
                          {draggingTaskId ? `Přetáhni sem do ${column.title}` : 'Prázdný sloupec'}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardTable>

        <CardFooter className="px-4 py-0">
          {tasksHydrated ? (
            <DataGridPagination className="py-1" />
          ) : (
            <DataGridLoadingFooter />
          )}
        </CardFooter>
      </Card>

      <Dialog open={editingTaskId !== null} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upravit úkol</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1">
              <Label>Název</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Název úkolu"
              />
            </div>
            <div className="space-y-1">
              <Label>Popis</Label>
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Popis úkolu"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Priorita</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Stav</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'pending' | 'in_progress' | 'completed')}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Termín</Label>
                <Input
                  type="datetime-local"
                  value={editDueAt}
                  onChange={(e) => setEditDueAt(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Přiřazeno</Label>
              <ManagedAssigneeSelect
                value={editAssigneeId}
                onValueChange={setEditAssigneeId}
                placeholder="Nepřiřazeno"
                searchPlaceholder="Hledat uživatele..."
                emptyText="Žádný uživatel nenalezen."
              />
            </div>
            {editDuplicateCandidates.length > 0 ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
                Možné duplicity:
                <ul className="mt-1 space-y-0.5">
                  {editDuplicateCandidates.map((task) => (
                    <li key={task.id}>
                      {task.title} ({formatDate(task.dueAt)})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={editSubmitting}>
              Zrušit
            </Button>
            <Button onClick={() => void saveTaskEdit()} disabled={editSubmitting || !editTitle.trim()}>
              {editSubmitting ? 'Ukládám...' : 'Uložit změny'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailTask !== null} onOpenChange={(open) => { if (!open) setDetailTaskId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail úkolu</DialogTitle>
          </DialogHeader>
          {detailTask ? (
            <DialogBody className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Název</p>
                <p className="text-sm font-medium">{detailTask.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Zkratky: E upravit, D dokončit/vrátit, P priorita</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Popis</p>
                <p className="text-sm whitespace-pre-wrap">{detailTask.content || '—'}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Stav</p>
                  <div className="mt-1">{getStatusBadge(detailTask.status || 'pending')}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priorita</p>
                  <p className="text-sm mt-1">{(detailTask.priority || 'medium').toUpperCase()}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Smart návrh: {recommendPriority(detailTask).toUpperCase()} - {getRecommendationReason(detailTask)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Termín</p>
                  <p className="text-sm mt-1">{formatDate(detailTask.dueAt)}</p>
                  {detailTask.status !== 'completed' ? (
                    <p
                      className={cn(
                        'text-xs mt-1',
                        getDueDayDelta(new Date(detailTask.dueAt)) < 0
                          ? 'text-destructive'
                          : getDueDayDelta(new Date(detailTask.dueAt)) === 0
                            ? 'text-orange-600'
                            : 'text-muted-foreground',
                      )}
                    >
                      {(() => {
                        const dueDelta = getDueDayDelta(new Date(detailTask.dueAt));
                        if (dueDelta < 0) return `Overdue ${Math.abs(dueDelta)} dní`;
                        if (dueDelta === 0) return 'Splatné dnes';
                        return `Splatné za ${dueDelta} dní`;
                      })()}
                    </p>
                  ) : null}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Přiřazeno</p>
                <p className="text-sm mt-1">
                  {(detailTask.assignedContactIds || [])
                    .map((id) => getAssigneeDisplayName(id))
                    .join(', ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Historie změn</p>
                <div className="mt-1 mb-2 flex flex-wrap items-center gap-2">
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    value={detailAuditActionFilter}
                    onChange={(e) =>
                      setDetailAuditActionFilter(
                        e.target.value as
                          | 'all'
                          | 'created'
                          | 'updated'
                          | 'completed'
                          | 'reopened'
                          | 'duplicated'
                          | 'deleted',
                      )
                    }
                  >
                    <option value="all">Všechny akce</option>
                    <option value="created">created</option>
                    <option value="updated">updated</option>
                    <option value="completed">completed</option>
                    <option value="reopened">reopened</option>
                    <option value="duplicated">duplicated</option>
                    <option value="deleted">deleted</option>
                  </select>
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    value={detailAuditActorFilter}
                    onChange={(e) => setDetailAuditActorFilter(e.target.value)}
                  >
                    <option value="all">Všichni autoři</option>
                    {detailAuditActors.map((actor) => (
                      <option key={actor} value={actor}>
                        {actor}
                      </option>
                    ))}
                  </select>
                </div>
                {detailAuditFiltered.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">Zatím bez záznamu.</p>
                ) : (
                  <div className="mt-1 space-y-2 border-l border-border pl-3">
                    {detailAuditFiltered.map((entry) => (
                      <div key={entry.id} className="relative rounded border border-border px-2 py-1.5 text-xs">
                        <span className="absolute -left-[17px] top-3 h-2 w-2 rounded-full bg-primary"></span>
                        <div className="font-medium">
                          {entry.action}
                          {entry.note ? ` - ${entry.note}` : ''}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Autor: {entry.actor || 'Uživatel'}</div>
                        <div className="text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString('cs-CZ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogBody>
          ) : null}
          <DialogFooter>
            {detailTask ? (
              <span className="mr-auto text-[11px] text-muted-foreground">
                Zkratky: `/` vyhledávání, `E` upravit, `D` dokončit/znovu otevřít, `P` změnit prioritu
              </span>
            ) : null}
            <Button variant="outline" onClick={() => setDetailTaskId(null)}>
              Zavřít
            </Button>
            {detailTask ? (
              <Button
                onClick={() => {
                  openEditTask(detailTask);
                  setDetailTaskId(null);
                }}
              >
                Upravit
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advanced Export</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(exportColumns) as ExportColumnKey[]).map((column) => (
                <label key={column} className="inline-flex items-center gap-2 rounded border px-2 py-1.5 text-xs">
                  <Checkbox
                    id={`export-col-${column}`}
                    checked={exportColumns[column]}
                    disabled={!canUseAdvancedExport}
                    onCheckedChange={(checked) =>
                      setExportColumns((prev) => ({ ...prev, [column]: checked === true }))
                    }
                  />
                  {column}
                </label>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-xs">
              <Checkbox
                id="export-overdue-sheet"
                checked={exportIncludeOverdueSheet}
                disabled={!canUseAdvancedExport}
                onCheckedChange={(checked) => setExportIncludeOverdueSheet(checked === true)}
              />
              Přidat separátní overdue export/sheet
            </label>
            <div className="space-y-1">
              <Label htmlFor="export-format">Formát exportu</Label>
              <select
                id="export-format"
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                value={exportFormat}
                disabled={!canUseAdvancedExport}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
              >
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX (Excel)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Název export šablony…"
                value={exportTemplateName}
                disabled={!canUseAdvancedExport}
                onChange={(e) => setExportTemplateName(e.target.value)}
              />
              <Button size="sm" variant="outline" disabled={!canUseAdvancedExport} onClick={saveExportTemplate}>
                Uložit šablonu
              </Button>
            </div>
            {exportTemplates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {exportTemplates.map((tpl) => (
                  <div key={tpl.id} className="inline-flex items-center rounded border">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-r-none"
                      disabled={!canUseAdvancedExport}
                      onClick={() => applyExportTemplate(tpl)}
                    >
                      {tpl.name}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-l-none border-l px-2"
                      disabled={!canUseAdvancedExport}
                      onClick={() => deleteExportTemplate(tpl.id)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Zavřít
            </Button>
            <Button disabled={!canUseAdvancedExport} onClick={exportFilteredData}>
              Exportovat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkStatusPreviewDialogOpen} onOpenChange={setBulkStatusPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled bulk změny stavu</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {bulkStatusTargetCompleted
                ? 'Vybrané úkoly budou označeny jako dokončené.'
                : 'Vybrané úkoly budou vráceny mezi otevřené.'}
            </p>
            <p className="text-xs text-muted-foreground">Dotčené úkoly: {bulkStatusPreviewTasks.length}</p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {bulkStatusPreviewTasks.slice(0, 30).map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()}
                  </div>
                </div>
              ))}
              {bulkStatusPreviewTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Pro tuto akci nejsou žádné úkoly.</p>
              ) : null}
              {bulkStatusPreviewTasks.length > 30 ? (
                <p className="text-[11px] text-muted-foreground">
                  + {bulkStatusPreviewTasks.length - 30} dalších úkolů
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStatusPreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={bulkUpdating || bulkStatusPreviewTasks.length === 0 || !canUseSensitiveActions}
              onClick={async () => {
                await handleBulkStatusUpdate(bulkStatusTargetCompleted);
                setBulkStatusPreviewDialogOpen(false);
              }}
            >
              Potvrdit a spustit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkShiftPreviewDialogOpen} onOpenChange={setBulkShiftPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled bulk posunu termínu</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vybraným úkolům se posune termín o {bulkShiftDays} {bulkShiftDays === 1 ? 'den' : 'dny'}.
            </p>
            <p className="text-xs text-muted-foreground">Dotčené úkoly: {bulkShiftPreviewTasks.length}</p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {bulkShiftPreviewTasks.slice(0, 30).map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} {'->'}{' '}
                    {formatDate(
                      (() => {
                        const nextDueAt = new Date(task.dueAt);
                        nextDueAt.setDate(nextDueAt.getDate() + bulkShiftDays);
                        return nextDueAt;
                      })(),
                    )}{' '}
                    · {(task.priority || 'medium').toUpperCase()}
                  </div>
                </div>
              ))}
              {bulkShiftPreviewTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Pro tuto akci nejsou žádné úkoly.</p>
              ) : null}
              {bulkShiftPreviewTasks.length > 30 ? (
                <p className="text-[11px] text-muted-foreground">
                  + {bulkShiftPreviewTasks.length - 30} dalších úkolů
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkShiftPreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={bulkUpdating || bulkShiftPreviewTasks.length === 0 || !canUseSensitiveActions}
              onClick={async () => {
                await handleBulkShiftFilteredDueDate(bulkShiftDays);
                setBulkShiftPreviewDialogOpen(false);
              }}
            >
              Potvrdit a spustit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkAssignPreviewDialogOpen} onOpenChange={setBulkAssignPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled bulk přiřazení</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {bulkAssigneeId
                ? `Vybraným úkolům se nastaví přiřazení na "${getAssigneeDisplayName(bulkAssigneeId)}".`
                : 'Vybraným úkolům se odebere přiřazení.'}
            </p>
            <p className="text-xs text-muted-foreground">Dotčené úkoly: {bulkAssignPreviewTasks.length}</p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {bulkAssignPreviewTasks.slice(0, 30).map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()}
                  </div>
                </div>
              ))}
              {bulkAssignPreviewTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Pro bulk přiřazení nejsou žádné úkoly.</p>
              ) : null}
              {bulkAssignPreviewTasks.length > 30 ? (
                <p className="text-[11px] text-muted-foreground">
                  + {bulkAssignPreviewTasks.length - 30} dalších úkolů
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAssignPreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={bulkUpdating || bulkAssignPreviewTasks.length === 0 || !canUseSensitiveActions}
              onClick={async () => {
                await handleBulkAssignFiltered();
                setBulkAssignPreviewDialogOpen(false);
              }}
            >
              Potvrdit a spustit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkRecommendedPreviewDialogOpen} onOpenChange={setBulkRecommendedPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled bulk doporučení priority</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vybraným úkolům bude nastavena doporučená priorita podle termínu, stavu a historie změn.
            </p>
            <p className="text-xs text-muted-foreground">Dotčené úkoly: {recommendedBulkTasks.length}</p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {recommendedBulkTasks.slice(0, 30).map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()} {'->'}{' '}
                    {recommendPriority(task).toUpperCase()}
                  </div>
                </div>
              ))}
              {recommendedBulkTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Pro tuto akci nejsou žádné úkoly.</p>
              ) : null}
              {recommendedBulkTasks.length > 30 ? (
                <p className="text-[11px] text-muted-foreground">
                  + {recommendedBulkTasks.length - 30} dalších úkolů
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRecommendedPreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={bulkUpdating || recommendedBulkTasks.length === 0 || !canUseSensitiveActions}
              onClick={async () => {
                await applyRecommendedPriorityFiltered();
                setBulkRecommendedPreviewDialogOpen(false);
              }}
            >
              Potvrdit a spustit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={overdueElevatePreviewDialogOpen} onOpenChange={setOverdueElevatePreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled SLA overdue akce</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vybraným overdue úkolům bude nastavena priorita HIGH.
            </p>
            <p className="text-xs text-muted-foreground">Dotčené úkoly: {overdueElevateCandidates.length}</p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {overdueElevateCandidates.slice(0, 30).map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()} {'->'} HIGH
                  </div>
                </div>
              ))}
              {overdueElevateCandidates.length === 0 ? (
                <p className="text-xs text-muted-foreground">Žádné overdue úkoly k navýšení priority.</p>
              ) : null}
              {overdueElevateCandidates.length > 30 ? (
                <p className="text-[11px] text-muted-foreground">
                  + {overdueElevateCandidates.length - 30} dalších úkolů
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverdueElevatePreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={bulkUpdating || overdueElevateCandidates.length === 0 || !canUseSensitiveActions}
              onClick={async () => {
                await elevateOverduePriority();
                setOverdueElevatePreviewDialogOpen(false);
              }}
            >
              Potvrdit a spustit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={slaApplyPreviewDialogOpen} onOpenChange={setSlaApplyPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled SLA batch akce</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Úkolům se SLA porušením ({'>'}{slaThresholdDays} dní) bude nastavena priorita HIGH.
            </p>
            <p className="text-xs text-muted-foreground">Dotčené úkoly: {slaApplyCandidates.length}</p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {slaApplyCandidates.slice(0, 30).map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()} {'->'} HIGH
                  </div>
                </div>
              ))}
              {slaApplyCandidates.length === 0 ? (
                <p className="text-xs text-muted-foreground">Žádné SLA porušení k úpravě priority.</p>
              ) : null}
              {slaApplyCandidates.length > 30 ? (
                <p className="text-[11px] text-muted-foreground">
                  + {slaApplyCandidates.length - 30} dalších úkolů
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlaApplyPreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={bulkUpdating || !slaEnabled || !canUseSensitiveActions || slaApplyCandidates.length === 0}
              onClick={async () => {
                await applySlaRules();
                setSlaApplyPreviewDialogOpen(false);
              }}
            >
              Potvrdit a spustit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={slaNotifyPreviewDialogOpen} onOpenChange={setSlaNotifyPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled SLA upozornění</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Odešlou se upozornění pro SLA porušení (max. 5 notifikací v jedné dávce).
            </p>
            <p className="text-xs text-muted-foreground">
              SLA porušení celkem: {slaBreachedTasks.length} · Notifikační dávka: {slaNotifyPreviewTasks.length}
            </p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {slaNotifyPreviewTasks.map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()}
                  </div>
                </div>
              ))}
              {slaNotifyPreviewTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Žádné SLA porušení k upozornění.</p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlaNotifyPreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={!slaEnabled || slaNotifyPreviewTasks.length === 0}
              onClick={() => {
                notifySlaBreaches();
                setSlaNotifyPreviewDialogOpen(false);
              }}
            >
              Potvrdit a odeslat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rulePreviewDialogOpen} onOpenChange={setRulePreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Náhled pravidla</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">{selectedRuleDescription}</p>
            <p className="text-xs text-muted-foreground">Dotčené úkoly: {rulePreviewTasks.length}</p>
            <div className="max-h-56 space-y-1 overflow-auto rounded border p-2">
              {rulePreviewTasks.slice(0, 30).map((task) => (
                <div key={task.id} className="rounded border px-2 py-1.5 text-xs">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">
                    {formatDate(task.dueAt)} · {(task.priority || 'medium').toUpperCase()}
                  </div>
                </div>
              ))}
              {rulePreviewTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Pro pravidlo nebyly nalezeny žádné úkoly.</p>
              ) : null}
              {rulePreviewTasks.length > 30 ? (
                <p className="text-[11px] text-muted-foreground">
                  + {rulePreviewTasks.length - 30} dalších úkolů
                </p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRulePreviewDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              disabled={bulkUpdating || rulePreviewTasks.length === 0 || !canUseSensitiveActions}
              onClick={async () => {
                await applyRuleBulkAction();
                setRulePreviewDialogOpen(false);
              }}
            >
              Potvrdit a spustit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingTaskId !== null}
        onOpenChange={(open) => {
          if (!open && !deleteSubmitting) setDeletingTaskId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat úkol?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-muted-foreground">
              Tato akce je nevratná. Úkol bude trvale odstraněn.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTaskId(null)}
              disabled={deleteSubmitting}
            >
              Zrušit
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDeleteTask()}
              disabled={deleteSubmitting || !canDeleteTask}
            >
              {deleteSubmitting ? 'Mažu...' : 'Smazat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DataGrid>
  );
}
