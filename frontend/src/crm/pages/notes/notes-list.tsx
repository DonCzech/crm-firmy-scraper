import { Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useManagedAssigneeMap } from '@/crm/hooks/use-managed-assignee-map';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useGridSearch } from '@/crm/hooks/use-grid-search';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { DataGridLoadingRows } from '@/crm/components/data-grid-loading-rows';
import { DataGridLoadingFooter } from '@/crm/components/data-grid-loading-footer';
import { Notes } from '@/crm/types/notes';
import { Contact } from '@/crm/types/contact';
import { deleteNote, fetchContacts, fetchNotes, updateNote } from '@/crm/services/backend';
import { CRM_NOTES_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { mapContactToUI, mapNoteToUI } from '@/crm/services/mappers';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { sanitizeHumanLabel } from '@/crm/utils/identity-label';
import { getNoteCategoryVariant } from './category-config';
import {
  NOTE_PRIORITY_OPTIONS,
  NOTE_STATUS_OPTIONS,
  getNotePriorityBadgeVariant,
  getNoteStatusBadgeVariant,
  type NotePriorityValue,
  type NoteStatusValue,
} from './meta-config';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle,
  Ellipsis,
  Filter,
  Search,
  Settings2,
  Star,
  Tag,
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
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardToolbar,
} from '@/components/ui/card';
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
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const NOTES_FILTERS_STORAGE_KEY = 'crm-notes-filters-v1';
const ALLOWED_NOTE_STATUS_FILTERS = new Set(NOTE_STATUS_OPTIONS.map((status) => status.value));
const ALLOWED_NOTE_PRIORITY_FILTERS = new Set(NOTE_PRIORITY_OPTIONS.map((priority) => priority.value));

type NotesFiltersStorage = {
  searchQuery?: string;
  selectedStatuses?: string[];
  selectedCategories?: string[];
  selectedPriorities?: string[];
};

function readNotesFiltersFromStorage(): NotesFiltersStorage {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(NOTES_FILTERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NotesFiltersStorage;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeNotesFiltersToStorage(value: NotesFiltersStorage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NOTES_FILTERS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // noop
  }
}

// Extended Notes interface with tags, category, priority, and isFavorite
export interface ExtendedNotes extends Omit<Notes, 'content'> {
  category: string[];
  priority: 'high' | 'medium' | 'low';
  isFavorite?: boolean;
  isClickable?: boolean;
}

function sanitizeAssigneeLabel(value: string): string {
  return sanitizeHumanLabel(value, 'Uživatel');
}

function appendUnique(prev: string[], value: string): string[] {
  return prev.includes(value) ? prev : [...prev, value];
}

function uniqueFiltered(values: string[]): string[] {
  return Array.from(new Set(values));
}

interface NoteListProps {
  filter?: 'today' | 'week' | 'completed';
}

export function NoteList({ filter }: NoteListProps) {
  const initialFiltersRef = useRef<NotesFiltersStorage | null>(null);
  if (!initialFiltersRef.current) initialFiltersRef.current = readNotesFiltersFromStorage();
  const initialFilters = initialFiltersRef.current;
  const invalidStatusPriorityCleanupNoticeShownRef = useRef(false);
  const invalidCategoryCleanupNoticeShownRef = useRef(false);
  const { role, canDelete, userId } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('notes');
  const managedUserByAssigneeId = useManagedAssigneeMap();
  const latestNotesLoadRequestRef = useRef(0);
  const {
    searchQuery,
    debouncedSearchQuery,
    searchInputRef,
    setSearchQuery,
    clearSearchQuery,
    handleSearchInputKeyDown,
  } = useGridSearch({
    initialQuery: initialFilters.searchQuery ?? '',
    debounceMs: 180,
  });
  const [notes, setNotes] = useState<ExtendedNotes[]>([]);
  const [notesHydrated, setNotesHydrated] = useState(false);
  const [contactsLookup, setContactsLookup] = useState<Contact[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    Array.isArray(initialFilters.selectedStatuses)
      ? uniqueFiltered(
          initialFilters.selectedStatuses.filter((status) => ALLOWED_NOTE_STATUS_FILTERS.has(status)),
        )
      : [],
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(initialFilters.selectedCategories)
      ? uniqueFiltered(
          initialFilters.selectedCategories.filter(
            (category): category is string => typeof category === 'string' && category.trim().length > 0,
          ),
        )
      : [],
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    Array.isArray(initialFilters.selectedPriorities)
      ? uniqueFiltered(
          initialFilters.selectedPriorities.filter((priority) => ALLOWED_NOTE_PRIORITY_FILTERS.has(priority)),
        )
      : [],
  );
  const [recentlyCompleted] = useState<Set<string>>(new Set());

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'dueAt', desc: false },
  ]);

  const loadData = useCallback(async () => {
    const requestId = latestNotesLoadRequestRef.current + 1;
    latestNotesLoadRequestRef.current = requestId;
    try {
      const [notesResponse, contactsResponse] = await Promise.all([
        fetchNotes({ limit: 400 }),
        fetchContacts({ limit: 500 }),
      ]);

      const mappedNotes = (notesResponse?.data ?? []).map((item) => {
        const mapped = mapNoteToUI(item);
        const categorySeed = item.deal?.stage ?? item.company?.name ?? 'general';

        return {
          ...mapped,
          category: [categorySeed.toLowerCase().replace(/\\s+/g, '-')],
          priority: item.isPinned ? 'high' : 'medium',
          isFavorite: item.isPinned ?? false,
          isClickable: true,
        } as ExtendedNotes;
      });
      const mappedContacts = (contactsResponse?.data ?? []).map(mapContactToUI);

      if (requestId !== latestNotesLoadRequestRef.current) return;
      setNotes(mappedNotes);
      setContactsLookup(mappedContacts);
    } catch (error) {
      logFrontendError({
        area: 'crm-notes',
        message: error instanceof Error ? error.message : 'Failed to load notes list',
        meta: { operation: 'load_notes_list' },
      });
      if (requestId !== latestNotesLoadRequestRef.current) return;
      setNotes([]);
      setContactsLookup([]);
    } finally {
      if (requestId !== latestNotesLoadRequestRef.current) return;
      setNotesHydrated(true);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const onRefresh = () => void loadData();
    window.addEventListener(CRM_NOTES_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_NOTES_REFRESH_EVENT, onRefresh);
    };
  }, [loadData]);

  useEffect(() => {
    writeNotesFiltersToStorage({
      searchQuery,
      selectedStatuses,
      selectedCategories,
      selectedPriorities,
    });
  }, [searchQuery, selectedStatuses, selectedCategories, selectedPriorities]);

  const contactById = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const contact of contactsLookup) {
      map.set(contact.id, contact);
    }
    return map;
  }, [contactsLookup]);

  // Dinamik kategoriyalar ro‘yxati
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    notes.forEach((note) => {
      note.category.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories).map((id) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
    }));
  }, [notes]);

  useEffect(() => {
    const allowed = new Set(uniqueCategories.map((category) => category.id));
    setSelectedCategories((prev) => {
      const sanitized = uniqueFiltered(prev.filter((category) => allowed.has(category)));
      if (
        !invalidCategoryCleanupNoticeShownRef.current &&
        sanitized.length !== prev.length &&
        prev.length > 0
      ) {
        invalidCategoryCleanupNoticeShownRef.current = true;
        toast.info('Některé neplatné kategorie ve filtrech byly odebrány.');
      }
      return sanitized.length === prev.length ? prev : sanitized;
    });
  }, [uniqueCategories]);

  useEffect(() => {
    setSelectedStatuses((prev) => {
      const sanitized = uniqueFiltered(prev.filter((status) => ALLOWED_NOTE_STATUS_FILTERS.has(status)));
      if (
        !invalidStatusPriorityCleanupNoticeShownRef.current &&
        sanitized.length !== prev.length &&
        prev.length > 0
      ) {
        invalidStatusPriorityCleanupNoticeShownRef.current = true;
        toast.info('Některé neplatné status/priority filtry byly odebrány.');
      }
      return sanitized.length === prev.length ? prev : sanitized;
    });
    setSelectedPriorities((prev) => {
      const sanitized = uniqueFiltered(prev.filter((priority) => ALLOWED_NOTE_PRIORITY_FILTERS.has(priority)));
      if (
        !invalidStatusPriorityCleanupNoticeShownRef.current &&
        sanitized.length !== prev.length &&
        prev.length > 0
      ) {
        invalidStatusPriorityCleanupNoticeShownRef.current = true;
        toast.info('Některé neplatné status/priority filtry byly odebrány.');
      }
      return sanitized.length === prev.length ? prev : sanitized;
    });
  }, []);

  // Filter notes based on the active tab filter
  const filteredByTab = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return notes.filter((note) => {
      switch (filter) {
        case 'today':
          const noteDueDate = new Date(note.dueAt);
          const noteDate = new Date(
            noteDueDate.getFullYear(),
            noteDueDate.getMonth(),
            noteDueDate.getDate(),
          );
          return (
            noteDate.getTime() === today.getTime() &&
            (note.status !== 'completed' || recentlyCompleted.has(note.id))
          );
        case 'week':
          return (
            new Date(note.dueAt) <= weekFromNow &&
            (note.status !== 'completed' || recentlyCompleted.has(note.id))
          );
        case 'completed':
          return note.status === 'completed';
        default:
          return true;
      }
    });
  }, [notes, filter, recentlyCompleted]);

  // Apply all filters (status, priority, category, search)
  const filteredData = useMemo(() => {
    return filteredByTab.filter((note) => {
      const matchesStatus =
        !selectedStatuses.length ||
        selectedStatuses.includes(note.status || 'pending');
      const matchesPriority =
        !selectedPriorities.length ||
        selectedPriorities.includes(note.priority);
      const matchesCategory =
        !selectedCategories.length ||
        selectedCategories.some((category) => note.category.includes(category));
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch =
        !debouncedSearchQuery ||
        note.title.toLowerCase().includes(searchLower) ||
        note.category.some((cat) => cat.toLowerCase().includes(searchLower));

      return (
        matchesStatus && matchesPriority && matchesCategory && matchesSearch
      );
    });
  }, [
    filteredByTab,
    debouncedSearchQuery,
    selectedStatuses,
    selectedPriorities,
    selectedCategories,
  ]);

  // Calculate counts for statuses, categories, and priorities
  const statusCounts = useMemo(() => {
    return filteredByTab.reduce(
      (acc, note) => {
        const status = note.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [filteredByTab]);

  const categoryCounts = useMemo(() => {
    return filteredByTab.reduce(
      (acc, note) => {
        const category = note.category;
        category.forEach((c) => {
          acc[c] = (acc[c] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [filteredByTab]);

  const priorityCounts = useMemo(() => {
    return filteredByTab.reduce(
      (acc, note) => {
        if (note.priority) {
          acc[note.priority] = (acc[note.priority] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [filteredByTab]);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      if (!canDelete) {
        appendSensitiveActionAudit({
          area: 'notes',
          action: 'delete_note',
          result: 'denied',
          actorRole: role,
          actorUserId: userId || undefined,
          message: 'Blocked by role policy',
          meta: { noteId },
        });
        toast.error('Mazání poznámek je dostupné pouze pro role admin/manager.');
        return;
      }
      const previousNotes = notes;
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      try {
        await deleteNote(noteId);
        appendSensitiveActionAudit({
          area: 'notes',
          action: 'delete_note',
          result: 'success',
          actorRole: role,
          actorUserId: userId || undefined,
          meta: { noteId },
        });
        dispatchCrmEvent(CRM_NOTES_REFRESH_EVENT);
        toast.custom(
          (t) => (
            <Alert variant="mono" icon="warning" onClose={() => toast.dismiss(t)}>
              <AlertIcon>
                <Trash />
              </AlertIcon>
              <AlertTitle>Note deleted successfully!</AlertTitle>
            </Alert>
          ),
          { duration: 3000, position: 'top-center' },
        );
      } catch (error) {
        logFrontendError({
          area: 'crm-notes',
          message: error instanceof Error ? error.message : 'Delete note failed',
          meta: { operation: 'delete_note', noteId },
        });
        setNotes(previousNotes);
        appendSensitiveActionAudit({
          area: 'notes',
          action: 'delete_note',
          result: 'error',
          actorRole: role,
          actorUserId: userId || undefined,
          message: error instanceof Error ? error.message : 'Delete note failed',
          meta: { noteId },
        });
        toast.error(error instanceof Error ? error.message : 'Delete note failed');
      }
    },
    [canDelete, notes, role, userId],
  );

  const handleStarClick = useCallback(
    async (noteId: string) => {
      const noteToToggle = notes.find((note) => note.id === noteId);
      if (!noteToToggle) return;
      const previousNotes = notes;

      const updatedNotes = notes.map((note) =>
        note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note,
      );

      setNotes(updatedNotes);

      const updatedNote = updatedNotes.find((note) => note.id === noteId) ?? null;
      try {
        await updateNote(noteId, { isPinned: Boolean(updatedNote?.isFavorite) });
        appendSensitiveActionAudit({
          area: 'notes',
          action: 'toggle_note_favorite',
          result: 'success',
          actorRole: role,
          actorUserId: userId || undefined,
          meta: {
            noteId,
            isFavorite: Boolean(updatedNote?.isFavorite),
          },
        });
        dispatchCrmEvent(CRM_NOTES_REFRESH_EVENT);
        if (updatedNote) {
          toast.custom(
            (t) => (
              <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
                <AlertIcon>
                  <CheckCircle />
                </AlertIcon>
                <AlertTitle>
                  {updatedNote.isFavorite
                    ? 'Added to favorites'
                    : 'Removed from favorites'}
                </AlertTitle>
              </Alert>
            ),
            { duration: 5000, position: 'bottom-right' },
          );
        }
      } catch (error) {
        logFrontendError({
          area: 'crm-notes',
          message: error instanceof Error ? error.message : 'Update note failed',
          meta: { operation: 'toggle_note_favorite', noteId },
        });
        setNotes(previousNotes);
        appendSensitiveActionAudit({
          area: 'notes',
          action: 'toggle_note_favorite',
          result: 'error',
          actorRole: role,
          actorUserId: userId || undefined,
          message: error instanceof Error ? error.message : 'Update note failed',
          meta: { noteId },
        });
        toast.error(error instanceof Error ? error.message : 'Update note failed');
      }
    },
    [notes, role, userId],
  );

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses((prev) =>
      checked ? appendUnique(prev, value) : prev.filter((v) => v !== value),
    );
  };

  const handleCategoryChange = (checked: boolean, value: string) => {
    setSelectedCategories((prev) =>
      checked ? appendUnique(prev, value) : prev.filter((v) => v !== value),
    );
  };

  const handlePriorityChange = (checked: boolean, value: string) => {
    setSelectedPriorities((prev) =>
      checked ? appendUnique(prev, value) : prev.filter((v) => v !== value),
    );
  };
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedStatuses.length > 0 ||
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setSelectedPriorities([]);
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
    const normalizedStatus: NoteStatusValue =
      status === 'completed' || status === 'in_progress' || status === 'pending'
        ? status
        : 'pending';
    const option = NOTE_STATUS_OPTIONS.find((item) => item.value === normalizedStatus);
    return (
      <Badge variant={getNoteStatusBadgeVariant(normalizedStatus)} appearance="light">
        {option?.label ?? 'Pending'}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const normalizedPriority: NotePriorityValue =
      priority === 'high' || priority === 'medium' || priority === 'low'
        ? priority
        : 'low';
    const option = NOTE_PRIORITY_OPTIONS.find(
      (item) => item.value === normalizedPriority,
    );
    return (
      <Badge variant={getNotePriorityBadgeVariant(normalizedPriority)} appearance="light">
        {option?.label ?? 'Low'}
      </Badge>
    );
  };

  const columns = useMemo<ColumnDef<ExtendedNotes>[]>(
    () => [
      {
        accessorKey: 'title',
        id: 'title',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Note"
            visibility={true}
            column={column}
            className="-ms-px"
          />
        ),
        cell: ({ row }) => {
          const note = row.original;
          return (
            <div className="inline-flex items-center gap-2 ps-1.5 pe-2.5">
              <div className={cn('font-medium')}>{note.title}</div>
            </div>
          );
        },
        size: 250,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'category',
        id: 'category',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Category"
            visibility={false}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <div className="flex gap-1 flex-wrap">
            {row.original.category.map((category) => (
              <Badge
                key={category}
                variant={getNoteCategoryVariant(category)}
                appearance="light"
              >
                {category}
              </Badge>
            ))}
          </div>
        ),
        size: 150,
        enableSorting: true,
        enableHiding: true,
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
              {contactIds
                .slice(0, 3)
                .map((contactId: Key | null | undefined) => {
                  const normalizedId = String(contactId || '');
                  const managedUser = managedUserByAssigneeId.get(normalizedId);
                  const contact = contactById.get(normalizedId);
                  const displayName = sanitizeAssigneeLabel(
                    managedUser?.name || contact?.name || normalizedId,
                  );
                  if (!displayName) return null;
                  return (
                    <div
                      key={normalizedId}
                      className="group cursor-pointer flex items-center gap-1 px-1 border border-border rounded-full bg-accent/50"
                    >
                      <Avatar className="size-4 my-1">
                        <AvatarImage
                          src={toAbsoluteUrl(contact?.avatar || '')}
                          alt={displayName}
                        />
                        <AvatarFallback className="border-0 text-[11px] font-semibold bg-blue-500 text-white">
                          {displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[80px] text-xs group-hover:text-blue-600">
                        {displayName}
                      </span>
                    </div>
                  );
                })}
              {contactIds.length > 3 && (
                <Badge variant="secondary" appearance="light">
                  +{contactIds.length - 3}
                </Badge>
              )}
            </div>
          );
        },
        size: 200,
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
        cell: ({ row }) => getPriorityBadge(row.original.priority),
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
          const note = row.original;
          const isOverdue =
            new Date(note.dueAt) < new Date() && note.status !== 'completed';
          return (
            <div className="flex items-center gap-1">
              <span className={cn(isOverdue && 'text-destructive text-xs')}>
                {formatDate(note.dueAt)}
              </span>
              {isOverdue && <AlertCircle className="size-3 text-destructive" />}
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
          <div className="flex gap-2">
            <Button
              variant="dim"
              size="sm"
              onClick={() => handleStarClick(row.original.id)}
            >
              <Star
                className={`text-gray-200 ${row.original.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'fill-gray-200'}`}
              />
            </Button>
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
                <DropdownMenuItem
                  variant="destructive"
                  disabled={!canDelete}
                  onClick={() => handleDeleteNote(row.original.id)}
                >
                  <Trash />
                  {canDelete ? 'Delete' : 'Delete (admin/manager)'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 80,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true,
      },
    ],
    [canDelete, contactById, handleDeleteNote, handleStarClick, managedUserByAssigneeId],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string),
  );

  const table = useReactTable({
    columns,
    data: filteredData,
    getRowId: (row: ExtendedNotes) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        category: false,
      },
    },
  });

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
          <CardHeading>
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <ObservabilityBadges
                role={role}
                frontendErrorCount24h={frontendErrorCount24h}
                sensitiveActions24hSummary={sensitiveActions24hSummary}
              />
              {/* Search */}
              <div className="relative min-w-0 w-full sm:w-auto">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  ref={searchInputRef}
                  variant="sm"
                  placeholder="Search notes or category... (/)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  className="ps-9 w-full sm:w-48 rounded-lg border-gray-300 focus:border-blue-500"
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
                      <Badge size="sm" appearance="outline">
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      <CommandEmpty>No status found.</CommandEmpty>
                      <CommandGroup>
                        {NOTE_STATUS_OPTIONS.map((status) => {
                          const count = statusCounts[status.value] || 0;
                          return (
                            <CommandItem
                              key={status.value}
                              value={status.value}
                              className="flex items-center gap-2.5 bg-transparent!"
                            >
                              <Checkbox
                                id={status.value}
                                checked={selectedStatuses.includes(status.value)}
                                onCheckedChange={(checked) =>
                                  handleStatusChange(
                                    checked === true,
                                    status.value,
                                  )
                                }
                                size="sm"
                              />
                              <Label
                                htmlFor={status.value}
                                className="grow flex items-center justify-between font-normal gap-1.5"
                              >
                                <Badge
                                  variant={getNoteStatusBadgeVariant(status.value)}
                                  appearance="light"
                                  className="px-1.5 py-0.5 text-xs"
                                >
                                  {status.label}
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

              {/* Category Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Tag className="size-3.5" />
                    Category
                    {selectedCategories.length > 0 && (
                      <Badge size="sm" appearance="outline" className="ml-2">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {uniqueCategories.map((category) => {
                          const count = categoryCounts[category.id] || 0;
                          return (
                            <CommandItem
                              key={category.id}
                              value={category.id}
                              className="flex items-center gap-2.5 bg-transparent!"
                            >
                              <Checkbox
                                id={category.id}
                                checked={selectedCategories.includes(
                                  category.id,
                                )}
                                onCheckedChange={(checked) =>
                                  handleCategoryChange(
                                    checked === true,
                                    category.id,
                                  )
                                }
                                size="sm"
                              />
                              <Label
                                htmlFor={category.id}
                                className="grow flex items-center justify-between font-normal gap-1.5"
                              >
                                <Badge
                                        variant={getNoteCategoryVariant(category.id)}
                                  appearance="light"
                                  className="px-1.5 py-0.5 text-xs"
                                >
                                  {category.name}
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

              {/* Priority Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <AlertCircle className="size-3.5" />
                    Priority
                    {selectedPriorities.length > 0 && (
                      <Badge size="sm" appearance="outline" className="ml-2">
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
                        {NOTE_PRIORITY_OPTIONS.map((priority) => {
                          const count = priorityCounts[priority.value] || 0;
                          return (
                            <CommandItem
                              key={priority.value}
                              value={priority.value}
                              className="flex items-center gap-2.5 bg-transparent!"
                            >
                              <Checkbox
                                id={priority.value}
                                checked={selectedPriorities.includes(
                                  priority.value,
                                )}
                                onCheckedChange={(checked) =>
                                  handlePriorityChange(
                                    checked === true,
                                    priority.value,
                                  )
                                }
                                size="sm"
                              />
                              <Label
                                htmlFor={priority.value}
                                className="grow flex items-center justify-between font-normal gap-1.5"
                              >
                                <Badge
                                  size="sm"
                                  variant={getNotePriorityBadgeVariant(priority.value)}
                                  appearance="light"
                                  className="px-1.5 py-0.5 text-xs"
                                >
                                  {priority.label}
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
              <Button
                size="sm"
                variant="ghost"
                disabled={!hasActiveFilters}
                onClick={resetFilters}
              >
                Reset filtrů
              </Button>
            </div>
          </CardHeading>
          <CardToolbar>
            <DataGridColumnVisibility
              table={table}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-gray-300"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  View Settings
                </Button>
              }
            />
          </CardToolbar>
        </CardHeader>

        <CardTable>
          {notesHydrated ? (
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <DataGridLoadingRows idPrefix="notes-table-skeleton" />
          )}
        </CardTable>

        <CardFooter className="px-4 py-0">
          {notesHydrated ? (
            <DataGridPagination className="py-1" />
          ) : (
            <DataGridLoadingFooter />
          )}
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
