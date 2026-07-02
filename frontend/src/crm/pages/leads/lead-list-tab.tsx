import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDot,
  RadioTower,
  Search,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useGridSearch } from '@/crm/hooks/use-grid-search';
import { fetchContacts, updateContact, type BackendContact } from '@/crm/services/backend';
import {
  CRM_COMPANIES_REFRESH_EVENT,
  CRM_CONTACTS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendLeadMergeAudit } from '@/crm/services/lead-merge-audit';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SOURCE_LABELS: Record<string, string> = {
  web: 'Web',
  referral: 'Doporučení',
  cold_call: 'Cold call',
  campaign: 'Kampaň',
  reality: 'Reality',
  firmy: 'Firmy.cz',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktivní',
  inactive: 'Neaktivní',
  archived: 'Archiv',
};
export const LEADS_DUPLICATES_OPEN_STORAGE_KEY = 'crm-leads-duplicates-open-v1';
export const LEADS_DUPLICATES_COUNT_STORAGE_KEY = 'crm-leads-duplicates-count-v1';
const LEADS_DUPLICATES_IGNORED_STORAGE_KEY = 'crm-leads-duplicates-ignored-v1';
const LEADS_COLUMN_VISIBILITY_STORAGE_KEY = 'crm-leads-column-visibility-v1';
export const CRM_LEADS_DUPLICATES_COUNT_EVENT = 'crm-leads:duplicates-count';
export const CRM_LEADS_DUPLICATES_OPEN_EVENT = 'crm-leads:duplicates-open';

type LeadColumnKey = 'name' | 'email' | 'phone' | 'city' | 'source' | 'status' | 'createdAt';

const DEFAULT_LEAD_COLUMN_VISIBILITY: Record<LeadColumnKey, boolean> = {
  name: true,
  email: true,
  phone: true,
  city: true,
  source: true,
  status: true,
  createdAt: true,
};

const LEAD_COLUMN_WIDTHS: Record<LeadColumnKey, number> = {
  name: 200,
  email: 200,
  phone: 150,
  city: 200,
  source: 150,
  status: 100,
  createdAt: 150,
};

function sanitizeLeadText(value?: string | null): string {
  if (!value) return '';
  return value.replace(/[\[\]\"]/g, '').trim();
}

function normalizeEmail(value?: string | null): string {
  return sanitizeLeadText(value).toLowerCase();
}

function normalizePhone(value?: string | null): string {
  return sanitizeLeadText(value).replace(/[^\d+]/g, '');
}

function normalizeName(value?: string | null): string {
  return sanitizeLeadText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}...`;
}

function filledScore(lead: BackendContact): number {
  let score = 0;
  if (sanitizeLeadText(lead.firstName)) score += 1;
  if (sanitizeLeadText(lead.lastName)) score += 1;
  if (sanitizeLeadText(lead.email)) score += 2;
  if (sanitizeLeadText(lead.phone)) score += 2;
  if (sanitizeLeadText(lead.city)) score += 1;
  if (sanitizeLeadText(lead.title)) score += 1;
  if (sanitizeLeadText(lead.source)) score += 1;
  return score;
}

function pickPrimary(leads: BackendContact[]): BackendContact {
  return [...leads].sort((a, b) => {
    const aActive = (a.status ?? 'active') === 'active' ? 1 : 0;
    const bActive = (b.status ?? 'active') === 'active' ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;

    const aScore = filledScore(a);
    const bScore = filledScore(b);
    if (aScore !== bScore) return bScore - aScore;

    const aUpdated = new Date(a.updatedAt).getTime();
    const bUpdated = new Date(b.updatedAt).getTime();
    return bUpdated - aUpdated;
  })[0];
}

function getInitials(contact: BackendContact) {
  const firstName = sanitizeLeadText(contact.firstName);
  const lastName = sanitizeLeadText(contact.lastName);
  const f = firstName[0] ?? '';
  const l = lastName[0] ?? '';
  return (f + l).toUpperCase() || 'L';
}

export function LeadListTab() {
  const pageSizeOptions = [10, 25, 50, 100];
  const paginationMoreLimit = 5;
  const { role, userId, canManageSensitiveActions } = useCurrentUserRole();
  const [leads, setLeads] = useState<BackendContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [mergingKey, setMergingKey] = useState<string | null>(null);
  const [duplicatesOpen, setDuplicatesOpen] = useState(() => {
    try {
      return localStorage.getItem(LEADS_DUPLICATES_OPEN_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [ignoredDuplicateKeys, setIgnoredDuplicateKeys] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LEADS_DUPLICATES_IGNORED_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const {
    searchQuery: search,
    debouncedSearchQuery: debouncedSearch,
    searchInputRef,
    setSearchQuery: setSearch,
    clearSearchQuery,
    handleSearchInputKeyDown,
  } = useGridSearch({ debounceMs: 180 });
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [columnVisibility, setColumnVisibility] = useState<Record<LeadColumnKey, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LEADS_COLUMN_VISIBILITY_STORAGE_KEY);
      if (!raw) return DEFAULT_LEAD_COLUMN_VISIBILITY;
      const parsed = JSON.parse(raw) as Partial<Record<LeadColumnKey, boolean>>;
      return {
        ...DEFAULT_LEAD_COLUMN_VISIBILITY,
        ...parsed,
      };
    } catch {
      return DEFAULT_LEAD_COLUMN_VISIBILITY;
    }
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const latestLeadsLoadRequestRef = useRef(0);

  const loadLeads = useCallback(async () => {
    const requestId = latestLeadsLoadRequestRef.current + 1;
    latestLeadsLoadRequestRef.current = requestId;
    try {
      const res = await fetchContacts({ limit: 500, contactType: 'lead' });
      if (requestId !== latestLeadsLoadRequestRef.current) return;
      setLeads(res?.data ?? []);
    } catch (error) {
      logFrontendError({
        area: 'crm-leads-list',
        message: error instanceof Error ? error.message : 'Failed to load leads list',
        meta: { operation: 'load_leads_list' },
      });
    } finally {
      if (requestId !== latestLeadsLoadRequestRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
    const handleRefresh = () => { void loadLeads(); };
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, handleRefresh);
    };
  }, [loadLeads]);

  // Count by source and status for badge counts
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads) {
      const s = l.source ?? 'web';
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads) {
      const s = l.status ?? 'active';
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  const filtered = useMemo(() => {
    let result = leads;
    if (sourceFilter !== 'all') result = result.filter((l) => (l.source ?? 'web') === sourceFilter);
    if (statusFilter !== 'all') result = result.filter((l) => (l.status ?? 'active') === statusFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (l) =>
          `${sanitizeLeadText(l.firstName)} ${sanitizeLeadText(l.lastName)}`.toLowerCase().includes(q) ||
          sanitizeLeadText(l.email).toLowerCase().includes(q) ||
          sanitizeLeadText(l.phone).includes(q) ||
          sanitizeLeadText(l.city).toLowerCase().includes(q),
      );
    }
    return [...result].sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return bt - at;
    });
  }, [leads, sourceFilter, statusFilter, debouncedSearch]);

  const availableSources = useMemo(
    () => Object.keys(sourceCounts).filter((s) => SOURCE_LABELS[s] || s),
    [sourceCounts],
  );

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, sourceFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePageIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const tableMinWidth = useMemo(() => {
    const total = (Object.keys(LEAD_COLUMN_WIDTHS) as LeadColumnKey[]).reduce((sum, key) => {
      return columnVisibility[key] ? sum + LEAD_COLUMN_WIDTHS[key] : sum;
    }, 0);
    return Math.max(total, 320);
  }, [columnVisibility]);

  useEffect(() => {
    if (safePageIndex !== pageIndex) {
      setPageIndex(safePageIndex);
    }
  }, [pageIndex, safePageIndex]);

  const paginatedLeads = useMemo(() => {
    const start = safePageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePageIndex]);

  const from = filtered.length === 0 ? 0 : safePageIndex * pageSize + 1;
  const to = Math.min((safePageIndex + 1) * pageSize, filtered.length);
  const currentGroupStart = Math.floor(safePageIndex / paginationMoreLimit) * paginationMoreLimit;
  const currentGroupEnd = Math.min(currentGroupStart + paginationMoreLimit, pageCount);

  const duplicateGroups = useMemo(() => {
    const byKey = new Map<string, BackendContact[]>();

    const push = (key: string, lead: BackendContact) => {
      const current = byKey.get(key) ?? [];
      current.push(lead);
      byKey.set(key, current);
    };

    for (const lead of leads) {
      const email = normalizeEmail(lead.email);
      const phone = normalizePhone(lead.phone);
      const name = normalizeName(`${lead.firstName || ''} ${lead.lastName || ''}`);
      const city = normalizeName(lead.city);

      if (email) push(`email:${email}`, lead);
      if (phone && phone.length >= 8) push(`phone:${phone}`, lead);
      if (name && city) push(`name-city:${name}|${city}`, lead);
    }

    const groups = Array.from(byKey.entries())
      .map(([key, items]) => ({
        key,
        items: Array.from(new Map(items.map((item) => [item.id, item])).values()),
      }))
      .filter((group) => group.items.length > 1)
      .sort((a, b) => b.items.length - a.items.length)
      .slice(0, 12);

    return groups;
  }, [leads]);

  const effectiveDuplicateGroups = useMemo(
    () => duplicateGroups.filter((group) => !ignoredDuplicateKeys.includes(group.key)),
    [duplicateGroups, ignoredDuplicateKeys],
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        LEADS_DUPLICATES_OPEN_STORAGE_KEY,
        duplicatesOpen ? '1' : '0',
      );
      window.dispatchEvent(
        new CustomEvent(CRM_LEADS_DUPLICATES_OPEN_EVENT, {
          detail: duplicatesOpen,
        }),
      );
    } catch {
      // ignore
    }
  }, [duplicatesOpen]);

  useEffect(() => {
    const onOpenChange = (event: Event) => {
      const nextOpen = Boolean((event as CustomEvent<boolean>).detail);
      setDuplicatesOpen(nextOpen);
    };
    window.addEventListener(CRM_LEADS_DUPLICATES_OPEN_EVENT, onOpenChange);
    return () => {
      window.removeEventListener(CRM_LEADS_DUPLICATES_OPEN_EVENT, onOpenChange);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LEADS_DUPLICATES_IGNORED_STORAGE_KEY,
        JSON.stringify(ignoredDuplicateKeys),
      );
    } catch {
      // ignore
    }
  }, [ignoredDuplicateKeys]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LEADS_COLUMN_VISIBILITY_STORAGE_KEY,
        JSON.stringify(columnVisibility),
      );
    } catch {
      // ignore
    }
  }, [columnVisibility]);

  useEffect(() => {
    try {
      const current = effectiveDuplicateGroups.length;
      localStorage.setItem(LEADS_DUPLICATES_COUNT_STORAGE_KEY, String(current));
      window.dispatchEvent(
        new CustomEvent(CRM_LEADS_DUPLICATES_COUNT_EVENT, {
          detail: current,
        }),
      );
    } catch {
      // ignore
    }
  }, [effectiveDuplicateGroups.length]);

  const mergeGroup = async (groupKey: string) => {
    if (!canManageSensitiveActions) {
      const message = 'Sloučení duplicit je dostupné pouze pro role admin/manager.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'merge_duplicates',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta: { groupKey },
      });
      return;
    }
    const group = duplicateGroups.find((item) => item.key === groupKey);
    if (!group || group.items.length < 2) return;

    const primary = pickPrimary(group.items);
    const duplicates = group.items.filter((item) => item.id !== primary.id);

    setMergingKey(groupKey);
    try {
      let nextPrimary = { ...primary };

      for (const dup of duplicates) {
        const patch: Record<string, unknown> = {};
        if (!sanitizeLeadText(nextPrimary.email) && sanitizeLeadText(dup.email)) patch.email = dup.email;
        if (!sanitizeLeadText(nextPrimary.phone) && sanitizeLeadText(dup.phone)) patch.phone = dup.phone;
        if (!sanitizeLeadText(nextPrimary.city) && sanitizeLeadText(dup.city)) patch.city = dup.city;
        if (!sanitizeLeadText(nextPrimary.title) && sanitizeLeadText(dup.title)) patch.title = dup.title;
        if (!sanitizeLeadText(nextPrimary.source) && sanitizeLeadText(dup.source)) patch.source = dup.source;
        if (!sanitizeLeadText(nextPrimary.country) && sanitizeLeadText(dup.country)) patch.country = dup.country;
        if (!sanitizeLeadText(nextPrimary.state) && sanitizeLeadText(dup.state)) patch.state = dup.state;
        if (!sanitizeLeadText(nextPrimary.zip) && sanitizeLeadText(dup.zip)) patch.zip = dup.zip;
        if (!sanitizeLeadText(nextPrimary.street) && sanitizeLeadText(dup.street)) patch.street = dup.street;

        if (Object.keys(patch).length > 0) {
          nextPrimary = await updateContact(nextPrimary.id, patch);
        }

        await updateContact(dup.id, { status: 'archived' });
      }

      appendLeadMergeAudit({
        primaryLeadId: nextPrimary.id,
        primaryLeadName: `${sanitizeLeadText(nextPrimary.firstName)} ${sanitizeLeadText(nextPrimary.lastName)}`.trim() || 'Lead',
        mergedLeadIds: duplicates.map((d) => d.id),
        mergedLeadNames: duplicates.map((d) => `${sanitizeLeadText(d.firstName)} ${sanitizeLeadText(d.lastName)}`.trim() || 'Lead'),
        ruleKey: group.key,
      });

      toast.success(`Sloučeno ${duplicates.length + 1} leadů. Primární záznam: ${sanitizeLeadText(nextPrimary.firstName)} ${sanitizeLeadText(nextPrimary.lastName)}`.trim());
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'merge_duplicates',
        result: 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        meta: { groupKey, mergedCount: duplicates.length + 1 },
      });
      await loadLeads();
      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);
      dispatchCrmEvent(CRM_COMPANIES_REFRESH_EVENT);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sloučení duplicit selhalo.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'merge_duplicates',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta: { groupKey },
      });
    } finally {
      setMergingKey(null);
    }
  };

  return (
    <div className="space-y-4 px-5 pb-6 min-w-0 overflow-x-hidden md:overflow-x-visible">
      {duplicateGroups.length > 0 && (
        <div className="space-y-2">
          {duplicatesOpen && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-amber-900">
                  Detekované duplicity leadů ({effectiveDuplicateGroups.length})
                </div>
                <div className="flex items-center gap-2">
                  {ignoredDuplicateKeys.length > 0 ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-amber-800"
                      onClick={() => setIgnoredDuplicateKeys([])}
                    >
                      Obnovit ignorované ({ignoredDuplicateKeys.length})
                    </Button>
                  ) : null}
                  <span className="text-xs text-amber-700">email / telefon / jméno+město</span>
                </div>
              </div>
              {effectiveDuplicateGroups.length === 0 ? (
                <p className="text-xs text-amber-800">Všechny detekované duplicity jsou aktuálně ignorované.</p>
              ) : (
                <div className="space-y-2">
                  {effectiveDuplicateGroups.map((group) => {
                    const primary = pickPrimary(group.items);
                    return (
                      <div key={group.key} className="rounded-md border border-amber-200 bg-white p-2.5">
                        <div className="mb-1 text-xs text-muted-foreground">{group.key}</div>
                        <div className="mb-2 text-xs">
                          Primární:{' '}
                          <span className="font-medium">
                            {sanitizeLeadText(primary.firstName)} {sanitizeLeadText(primary.lastName)} (
                            {sanitizeLeadText(primary.email) || 'bez emailu'})
                          </span>
                        </div>
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          {group.items.map((lead) => (
                            <Badge key={lead.id} variant={lead.id === primary.id ? 'default' : 'outline'} size="sm">
                              {sanitizeLeadText(lead.firstName)} {sanitizeLeadText(lead.lastName)}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mergingKey !== null || !canManageSensitiveActions}
                          onClick={() => void mergeGroup(group.key)}
                        >
                          {mergingKey === group.key ? 'Slučuji...' : `Sloučit (${group.items.length})`}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ms-2"
                          onClick={() =>
                            setIgnoredDuplicateKeys((prev) =>
                              prev.includes(group.key) ? prev : [...prev, group.key],
                            )
                          }
                        >
                          Ignorovat
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="size-3.5 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2" />
          <Input
            ref={searchInputRef}
            variant="sm"
            placeholder="Hledat lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchInputKeyDown}
            className="ps-8 w-48"
          />
          {search && (
            <Button
              mode="icon"
              variant="ghost"
              className="absolute end-1 top-1/2 -translate-y-1/2 h-5 w-5"
              onClick={clearSearchQuery}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        {/* Source/status popovers */}
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                mode="icon"
                className="relative"
                aria-label="Filtr zdroje"
              >
                <RadioTower className="size-4" />
                {sourceFilter !== 'all' && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2" align="start">
              <div className="mb-1 text-xs font-medium text-muted-foreground">Zdroj</div>
              <div className="space-y-1">
                <Button
                  variant={sourceFilter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSourceFilter('all')}
                >
                  Vše
                </Button>
                {availableSources.map((src) => (
                  <Button
                    key={src}
                    variant={sourceFilter === src ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSourceFilter(src === sourceFilter ? 'all' : src)}
                  >
                    {SOURCE_LABELS[src] ?? src}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                mode="icon"
                className="relative"
                aria-label="Filtr stavu"
              >
                <CircleDot className="size-4" />
                {statusFilter !== 'all' && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2" align="start">
              <div className="mb-1 text-xs font-medium text-muted-foreground">Stav</div>
              <div className="space-y-1">
                <Button
                  variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setStatusFilter('all')}
                >
                  Vše
                </Button>
                {Object.keys(statusCounts).map((st) => (
                  <Button
                    key={st}
                    variant={statusFilter === st ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setStatusFilter(st === statusFilter ? 'all' : st)}
                  >
                    {STATUS_LABELS[st] ?? st}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="ms-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-2">
                {[
                  { key: 'name' as const, label: 'Jméno', disabled: true },
                  { key: 'email' as const, label: 'Email' },
                  { key: 'phone' as const, label: 'Telefon' },
                  { key: 'city' as const, label: 'Město' },
                  { key: 'source' as const, label: 'Zdroj' },
                  { key: 'status' as const, label: 'Stav' },
                  { key: 'createdAt' as const, label: 'Přidáno' },
                ].map((column) => (
                  <label
                    key={column.key}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      column.disabled ? 'opacity-60' : 'cursor-pointer',
                    )}
                  >
                    <Checkbox
                      checked={columnVisibility[column.key]}
                      disabled={column.disabled}
                      onCheckedChange={(checked) => {
                        if (column.disabled) return;
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [column.key]: !!checked,
                        }));
                      }}
                      size="sm"
                    />
                    <span>{column.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám leady...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Žádné leady neodpovídají filtru.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden w-full min-w-0 max-w-full md:max-w-full">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-2.5rem)] md:max-w-full">
            <table className="w-max text-sm md:table-fixed" style={{ minWidth: `${tableMinWidth}px` }}>
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {columnVisibility.name && (
                    <th
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      style={{ width: `${LEAD_COLUMN_WIDTHS.name}px`, minWidth: `${LEAD_COLUMN_WIDTHS.name}px` }}
                    >
                      Jméno
                    </th>
                  )}
                  {columnVisibility.email && (
                    <th
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      style={{ width: `${LEAD_COLUMN_WIDTHS.email}px`, minWidth: `${LEAD_COLUMN_WIDTHS.email}px` }}
                    >
                      Email
                    </th>
                  )}
                  {columnVisibility.phone && (
                    <th
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      style={{ width: `${LEAD_COLUMN_WIDTHS.phone}px`, minWidth: `${LEAD_COLUMN_WIDTHS.phone}px` }}
                    >
                      Telefon
                    </th>
                  )}
                  {columnVisibility.city && (
                    <th
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      style={{ width: `${LEAD_COLUMN_WIDTHS.city}px`, minWidth: `${LEAD_COLUMN_WIDTHS.city}px` }}
                    >
                      Město
                    </th>
                  )}
                  {columnVisibility.source && (
                    <th
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      style={{ width: `${LEAD_COLUMN_WIDTHS.source}px`, minWidth: `${LEAD_COLUMN_WIDTHS.source}px` }}
                    >
                      Zdroj
                    </th>
                  )}
                  {columnVisibility.status && (
                    <th
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      style={{ width: `${LEAD_COLUMN_WIDTHS.status}px`, minWidth: `${LEAD_COLUMN_WIDTHS.status}px` }}
                    >
                      Stav
                    </th>
                  )}
                  {columnVisibility.createdAt && (
                    <th
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      style={{ width: `${LEAD_COLUMN_WIDTHS.createdAt}px`, minWidth: `${LEAD_COLUMN_WIDTHS.createdAt}px` }}
                    >
                      Přidáno
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    {columnVisibility.name && (
                      <td
                        className="px-4 py-2.5"
                        style={{ width: `${LEAD_COLUMN_WIDTHS.name}px`, minWidth: `${LEAD_COLUMN_WIDTHS.name}px` }}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="hidden sm:flex size-6">
                            <AvatarFallback className="text-[10px]">{getInitials(lead)}</AvatarFallback>
                          </Avatar>
                          {(() => {
                            const fullName = `${sanitizeLeadText(lead.firstName)} ${sanitizeLeadText(lead.lastName)}`.trim() || 'Lead';
                            return (
                              <Link
                                to={`/core/crm/leads/${lead.id}`}
                                className="inline-block max-w-[180px] truncate font-medium text-foreground transition-colors hover:text-primary"
                                title={fullName}
                              >
                                {fullName}
                              </Link>
                            );
                          })()}
                        </div>
                      </td>
                    )}
                    {columnVisibility.email && (
                      <td
                        className="px-4 py-2.5 text-muted-foreground"
                        style={{ width: `${LEAD_COLUMN_WIDTHS.email}px`, minWidth: `${LEAD_COLUMN_WIDTHS.email}px` }}
                      >
                        <span className="inline-block max-w-[160px] truncate align-bottom" title={sanitizeLeadText(lead.email) || ''}>
                          {truncateText(sanitizeLeadText(lead.email) || '—', 26)}
                        </span>
                      </td>
                    )}
                    {columnVisibility.phone && (
                      <td
                        className="px-4 py-2.5 text-muted-foreground"
                        style={{ width: `${LEAD_COLUMN_WIDTHS.phone}px`, minWidth: `${LEAD_COLUMN_WIDTHS.phone}px` }}
                      >
                        <span className="inline-block max-w-[120px] truncate align-bottom whitespace-nowrap" title={sanitizeLeadText(lead.phone) || ''}>
                          {truncateText(sanitizeLeadText(lead.phone) || '—', 16)}
                        </span>
                      </td>
                    )}
                    {columnVisibility.city && (
                      <td
                        className="px-4 py-2.5 text-muted-foreground"
                        style={{ width: `${LEAD_COLUMN_WIDTHS.city}px`, minWidth: `${LEAD_COLUMN_WIDTHS.city}px` }}
                      >
                        <span className="inline-block max-w-[140px] truncate align-bottom" title={sanitizeLeadText(lead.city) || ''}>
                          {truncateText(sanitizeLeadText(lead.city) || '—', 20)}
                        </span>
                      </td>
                    )}
                    {columnVisibility.source && (
                      <td
                        className="px-4 py-2.5"
                        style={{ width: `${LEAD_COLUMN_WIDTHS.source}px`, minWidth: `${LEAD_COLUMN_WIDTHS.source}px` }}
                      >
                        {lead.source ? (
                          <Badge
                            variant="outline"
                            size="sm"
                            className={cn(
                              'text-[10px] whitespace-nowrap',
                            lead.source === 'reality' && 'text-amber-700 border-amber-300 bg-amber-50',
                            lead.source === 'firmy' && 'text-blue-700 border-blue-300 bg-blue-50',
                          )}
                          title={SOURCE_LABELS[lead.source] ?? lead.source}
                        >
                          {truncateText(SOURCE_LABELS[lead.source] ?? lead.source, 12)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    )}
                    {columnVisibility.status && (
                      <td
                        className="px-4 py-2.5"
                        style={{ width: `${LEAD_COLUMN_WIDTHS.status}px`, minWidth: `${LEAD_COLUMN_WIDTHS.status}px` }}
                      >
                        <Badge
                          size="sm"
                          variant={
                            lead.status === 'active' ? 'success' :
                          lead.status === 'inactive' ? 'warning' : 'secondary'
                        }
                        appearance="light"
                        title={STATUS_LABELS[lead.status ?? 'active'] ?? lead.status}
                      >
                        {truncateText(STATUS_LABELS[lead.status ?? 'active'] ?? lead.status, 12)}
                      </Badge>
                    </td>
                    )}
                    {columnVisibility.createdAt && (
                      <td
                        className="px-4 py-2.5 text-muted-foreground text-xs"
                        style={{ width: `${LEAD_COLUMN_WIDTHS.createdAt}px`, minWidth: `${LEAD_COLUMN_WIDTHS.createdAt}px` }}
                      >
                        <span className="inline-block max-w-[86px] truncate align-bottom whitespace-nowrap" title={new Date(lead.createdAt).toLocaleDateString('cs-CZ')}>
                          {truncateText(new Date(lead.createdAt).toLocaleDateString('cs-CZ'), 10)}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border bg-muted/20 px-4 py-2">
            <div className="flex flex-wrap flex-col sm:flex-row justify-between items-center gap-2.5 py-2.5 sm:py-0 grow">
              <div className="flex flex-wrap items-center space-x-2.5 pb-2.5 sm:pb-0 order-2 sm:order-1">
                <div className="text-sm text-muted-foreground">Rows per page</div>
                <Select
                  value={`${pageSize}`}
                  indicatorPosition="right"
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="w-fit" size="sm">
                    <SelectValue placeholder={`${pageSize}`} />
                  </SelectTrigger>
                  <SelectContent side="top" className="min-w-[50px]">
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2.5 pt-2.5 sm:pt-0 order-1 sm:order-2">
                <div className="text-sm text-muted-foreground text-nowrap order-2 sm:order-1">
                  {from} - {to} of {filtered.length}
                </div>
                {pageCount > 1 && (
                  <div className="flex items-center space-x-1 order-1 sm:order-2">
                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="size-7 p-0 text-sm rtl:transform rtl:rotate-180"
                      onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={safePageIndex <= 0}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeftIcon className="size-4" />
                    </Button>

                    {currentGroupStart > 0 && (
                      <Button
                        size="sm"
                        mode="icon"
                        className="size-7 p-0 text-sm"
                        variant="ghost"
                        onClick={() => setPageIndex(currentGroupStart - 1)}
                      >
                        ...
                      </Button>
                    )}

                    {Array.from(
                      { length: Math.max(0, currentGroupEnd - currentGroupStart) },
                      (_, idx) => currentGroupStart + idx,
                    ).map((idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        mode="icon"
                        variant="ghost"
                        className={cn('size-7 p-0 text-sm text-muted-foreground', {
                          'bg-accent text-accent-foreground': safePageIndex === idx,
                        })}
                        onClick={() => setPageIndex(idx)}
                      >
                        {idx + 1}
                      </Button>
                    ))}

                    {currentGroupEnd < pageCount && (
                      <Button
                        className="size-7 p-0 text-sm"
                        variant="ghost"
                        size="sm"
                        mode="icon"
                        onClick={() => setPageIndex(currentGroupEnd)}
                      >
                        ...
                      </Button>
                    )}

                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="size-7 p-0 text-sm rtl:transform rtl:rotate-180"
                      onClick={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
                      disabled={safePageIndex >= pageCount - 1}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRightIcon className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Zobrazeno {from} - {to} z {filtered.length} filtrovaných (celkem {leads.length}) leadů
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
