import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  Search,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import {
  BackendFirmyCzListing,
  FirmyListingFilters,
  fetchFirmyListings,
  downloadFirmyCsv,
  createContact,
  createDeal,
} from '../../services/backend';
import { FirmyImportDialog } from './import-dialog';
import {
  loadFirmyScrapeSession,
  type FirmyScrapeSession,
  loadFullSession,
  type FullFirmySession,
} from './import-dialog';

const PAGE_SIZE = 50;

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Datum přidání' },
  { value: 'name', label: 'Název' },
  { value: 'city', label: 'Město' },
  { value: 'rating', label: 'Hodnocení' },
  { value: 'reviewCount', label: 'Počet recenzí' },
];

export function FirmyPage() {
  const { role, userId, canManageSensitiveActions } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('firmy');
  const navigate = useNavigate();
  const [listings, setListings] = useState<BackendFirmyCzListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [importingLeadId, setImportingLeadId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FirmyListingFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');
  const latestLoadRequestRef = useRef(0);

  // ── Auto-resume ──────────────────────────────────────────────────────
  const [resumeSession, setResumeSession] = useState<FirmyScrapeSession | FullFirmySession | null>(null);
  // On mount: check for unfinished scrape session — always auto-resume
  useEffect(() => {
    const fullSession = loadFullSession();
    const catSession = loadFirmyScrapeSession();
    const session = (fullSession && fullSession.status !== 'completed') ? fullSession
      : (catSession && catSession.status !== 'completed') ? catSession
      : null;
    if (session) {
      setResumeSession(session);
      setImportOpen(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchInput(searchInput), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    try {
      const res = await fetchFirmyListings({
        ...filters,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearchInput || undefined,
      });
      if (requestId !== latestLoadRequestRef.current) return;
      setListings(res?.data ?? []);
      setTotal(res?.meta?.total ?? 0);
      setTotalPages(res?.meta?.totalPages ?? 0);
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-firmy-list',
        message: error instanceof Error ? error.message : 'Failed to load firmy list',
        meta: { operation: 'load_firmy_list' },
      });
      // keep current state
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, [filters, page, debouncedSearchInput]);

  useEffect(() => { void loadData(); }, [loadData]);

  const updateFilter = useCallback((key: keyof FirmyListingFilters, value: unknown) => {
    setPage(1);
    setFilters((prev) => {
      const next = { ...prev };
      if (value === undefined || value === '' || value === null) {
        delete (next as Record<string, unknown>)[key];
      } else {
        (next as Record<string, unknown>)[key] = value;
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setPage(1);
    setFilters({ sortBy: 'createdAt', sortOrder: 'desc' });
    setSearchInput('');
  }, []);

  const activeFilterCount = Object.keys(filters).filter(
    (k) => k !== 'sortBy' && k !== 'sortOrder' && (filters as Record<string, unknown>)[k] !== undefined,
  ).length + (searchInput ? 1 : 0);

  const startItem = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const handleImportAsLead = useCallback(async (row: BackendFirmyCzListing) => {
    if (!canManageSensitiveActions) {
      const message = 'Import jako lead je dostupný pouze pro role admin/manager.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'firmy',
        action: 'import_as_lead',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta: { listingId: row.id },
      });
      return;
    }
    setImportingLeadId(row.id);
    try {
      const normalizedName = coerceTrimmedString(row.name) || 'Neznámá firma';
      const nameParts = normalizedName.split(/\s+/).filter(Boolean);
      const normalizedEmail = coerceTrimmedString(row.email);
      const normalizedPhone = coerceTrimmedString(row.phone);
      const normalizedCity = coerceTrimmedString(row.city);
      const normalizedWebsite = coerceTrimmedString(row.website);
      const firstName = nameParts[0] ?? 'Neznámá';
      const lastName = nameParts.slice(1).join(' ') || 'Firma';
      const contact = await createContact({
        firstName,
        lastName,
        contactType: 'lead',
        source: 'firmy',
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
        city: normalizedCity || undefined,
      });
      await createDeal({
        title: normalizedName || 'Firma z firmy.cz',
        stage: 'new',
        contactId: contact.id,
        description: `[zdroj:firmy] ${normalizedWebsite}`.trim(),
      });
      toast.success(`Lead "${row.name}" přidán do pipeline.`);
      appendSensitiveActionAudit({
        area: 'firmy',
        action: 'import_as_lead',
        result: 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        meta: { listingId: row.id },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import jako lead selhal.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'firmy',
        action: 'import_as_lead',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta: { listingId: row.id },
      });
    } finally {
      setImportingLeadId(null);
    }
  }, [canManageSensitiveActions, role, userId]);

  return (
    <>
      <ContentHeader>
        <div className="w-full flex flex-col gap-2 py-2">

          {/* Stats row */}
          {total > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <StatCard label="Firem v databázi" value={total.toLocaleString('cs-CZ')} icon={<Building2 className="size-4" />} />
              <StatCard
                label="Kategorie"
                value={filters.category ?? 'Vše'}
                icon={<Filter className="size-4" />}
              />
              <StatCard
                label="Strana"
                value={`${page} / ${totalPages || 1}`}
                icon={<ChevronRight className="size-4" />}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 min-w-0 w-full flex-wrap">
            <div className="inline-flex items-center gap-2 shrink-0 pe-1">
              <Building2 className="size-4 text-primary" />
              <span className="text-sm font-semibold">Firmy.cz</span>
            </div>

            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="size-4 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2" />
              <Input
                variant="sm"
                placeholder="Hledat firmu..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                className="ps-9 w-56 h-10 rounded-lg"
              />
              {searchInput.length > 0 && (
                <button
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => { setSearchInput(''); setPage(1); }}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filters toggle */}
            <button
              className={`flex items-center gap-1.5 h-10 px-4 rounded-lg border text-sm font-medium transition-colors shrink-0 ${filtersOpen ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Filter className="size-3.5" />
              Filtry
              {activeFilterCount > 0 && (
                <span className={`inline-flex items-center justify-center rounded-full size-4 text-[10px] font-bold ${filtersOpen ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'}`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm text-muted-foreground hidden sm:inline">Řadit:</span>
              <ChipSelect
                label="Řazení"
                value={SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label}
                options={SORT_OPTIONS.map((o) => o.label)}
                onChange={(v) => {
                  const opt = SORT_OPTIONS.find((o) => o.label === v);
                  updateFilter('sortBy', opt?.value);
                }}
                showLabel={false}
              />
              <button
                className="flex items-center justify-center size-10 rounded-lg border border-border hover:bg-muted transition-colors"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                title={filters.sortOrder === 'asc' ? 'Vzestupně' : 'Sestupně'}
              >
                {filters.sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
              </button>
            </div>

            {activeFilterCount > 0 && (
              <button className="text-xs text-muted-foreground hover:text-foreground shrink-0" onClick={clearFilters}>
                Vymazat
              </button>
            )}

            <div className="flex items-center gap-2 ms-auto shrink-0">
              <ObservabilityBadges
                frontendErrorCount24h={frontendErrorCount24h}
                sensitiveActions24hSummary={sensitiveActions24hSummary}
                compact
              />
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-lg"
                onClick={() => {
                  if (!canManageSensitiveActions) {
                    const message = 'Export CSV je dostupný pouze pro role admin/manager.';
                    toast.error(message);
                    appendSensitiveActionAudit({
                      area: 'firmy',
                      action: 'export_csv',
                      result: 'denied',
                      actorRole: role,
        actorUserId: userId || undefined,
                      message,
                    });
                    return;
                  }
                  downloadFirmyCsv()
                    .then(() => {
                      appendSensitiveActionAudit({
                        area: 'firmy',
                        action: 'export_csv',
                        result: 'success',
                        actorRole: role,
        actorUserId: userId || undefined,
                      });
                    })
                    .catch((error) => {
                      const message = error instanceof Error ? error.message : 'Export CSV selhal.';
                    logFrontendError({
                      area: 'crm-firmy-list',
                      message,
                      meta: { operation: 'export_firmy_csv' },
                    });
                    appendSensitiveActionAudit({
                      area: 'firmy',
                      action: 'export_csv',
                      result: 'error',
                      actorRole: role,
        actorUserId: userId || undefined,
                      message,
                    });
                    toast.error(message);
                  });
                }}
                title="Stáhnout všechna data jako CSV"
              >
                <Download className="size-4" /> Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-lg"
                disabled={!canManageSensitiveActions}
                onClick={() => {
                  if (!canManageSensitiveActions) {
                    const message = 'Scrape/import je dostupný pouze pro role admin/manager.';
                    toast.error(message);
                    appendSensitiveActionAudit({
                      area: 'firmy',
                      action: 'open_scrape_import',
                      result: 'denied',
                      actorRole: role,
        actorUserId: userId || undefined,
                      message,
                    });
                    return;
                  }
                  appendSensitiveActionAudit({
                    area: 'firmy',
                    action: 'open_scrape_import',
                    result: 'success',
                    actorRole: role,
        actorUserId: userId || undefined,
                  });
                  setImportOpen(true);
                }}
              >
                <Download className="size-4" /> Scrape Firmy.cz
              </Button>
            </div>
          </div>
        </div>
      </ContentHeader>

      <Content className="py-0">
        {/* Expanded filters panel */}
        {filtersOpen && (
          <div className="px-4 py-3 border-b border-border space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Kategorie</label>
                <Input
                  placeholder="např. Architekti"
                  value={filters.category ?? ''}
                  onChange={(e) => updateFilter('category', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Město</label>
                <Input
                  placeholder="např. Praha"
                  value={filters.city ?? ''}
                  onChange={(e) => updateFilter('city', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Min. hodnocení</label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  placeholder="0 – 5"
                  value={filters.minRating ?? ''}
                  onChange={(e) => updateFilter('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex grow min-w-0 pb-4">
          <Card className="w-full border-y border-border border-x-0 shadow-none rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full text-sm border-collapse border-spacing-0">
                <thead className="bg-muted/40 text-secondary-foreground/80">
                  <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:text-left [&>th]:font-medium [&>th:first-child]:pl-4 border-b border-border">
                    <th>Název</th>
                    <th>Kategorie</th>
                    <th>Město</th>
                    <th>Telefon</th>
                    <th>Email</th>
                    <th>Hodnocení</th>
                    <th>IČO</th>
                    <th>CRM</th>
                  </tr>
                </thead>
                <tbody className="[&>tr]:border-b [&>tr]:border-border/70 [&>tr:last-child]:border-b-0">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          Načítám data...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    listings.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => navigate(`../firmy/${row.id}`)}
                      >
                        <td className="px-3 py-2.5 pl-4 max-w-[280px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-medium text-foreground truncate">{row.name}</span>
                            {row.sourceUrl && (
                              <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground hover:text-primary" title="Otevřít na Firmy.cz" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink className="size-3.5" />
                              </a>
                            )}
                            {row.website && (
                              <a href={row.website} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground hover:text-primary" title="Firemní web" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink className="size-3 text-blue-400" />
                              </a>
                            )}
                          </div>
                          {row.address && (
                            <p className="text-[11px] text-muted-foreground truncate">{row.address}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{row.category ?? '-'}</td>
                        <td className="px-3 py-2.5">{row.city ?? '-'}</td>
                        <td className="px-3 py-2.5">
                          {row.phone ? (
                            <a href={`tel:${row.phone}`} className="text-primary hover:underline text-xs">{row.phone}</a>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.email ? (
                            <a href={`mailto:${row.email}`} className="text-primary hover:underline text-xs truncate block max-w-[180px]">{row.email}</a>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.rating != null ? (
                            <div className="flex items-center gap-1">
                              <Star className="size-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-medium">{row.rating.toFixed(1)}</span>
                              {row.reviewCount != null && (
                                <span className="text-[10px] text-muted-foreground">({row.reviewCount})</span>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{row.ic ?? '-'}</td>
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2 whitespace-nowrap"
                            disabled={importingLeadId === row.id}
                            onClick={() => void handleImportAsLead(row)}
                          >
                            {importingLeadId === row.id ? <Loader2 className="size-3 animate-spin" /> : '+ Lead'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && listings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                        Žádné záznamy. Použijte tlačítko "Scrape Firmy.cz" pro stažení dat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <CardFooter className="px-4 py-2">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-muted-foreground">
                  {total > 0
                    ? `${startItem.toLocaleString('cs-CZ')} – ${endItem.toLocaleString('cs-CZ')} z ${total.toLocaleString('cs-CZ')}`
                    : 'Žádné záznamy'}
                </span>
                <div className="flex items-center gap-1">
                  <button className="flex items-center justify-center size-7 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none" disabled={page <= 1} onClick={() => setPage(1)}>
                    <ChevronsLeft className="size-3.5" />
                  </button>
                  <button className="flex items-center justify-center size-7 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <span className="text-xs px-2 tabular-nums">
                    {page} / {totalPages || 1}
                  </span>
                  <button className="flex items-center justify-center size-7 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="size-3.5" />
                  </button>
                  <button className="flex items-center justify-center size-7 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
                    <ChevronsRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </Content>

      <FirmyImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={loadData}
        resumeSession={resumeSession}
        onResumeHandled={() => setResumeSession(null)}
      />
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-center size-8 rounded-md bg-muted text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ChipSelect({
  label,
  value,
  options,
  onChange,
  showLabel = true,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (val: string | undefined) => void;
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = !!value;

  return (
    <div className="relative flex-shrink-0">
      <button
        className={`flex items-center gap-1.5 h-10 px-4 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${active ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background border-border hover:bg-muted text-foreground'}`}
        onClick={() => setOpen(!open)}
      >
        {showLabel && !active && <span className="text-muted-foreground">{label}</span>}
        {active && <span>{value}</span>}
        {!active && !showLabel && <span>{label}</span>}
        {active && (
          <span className="ml-0.5 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onChange(undefined); setOpen(false); }}>
            <X className="size-3" />
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px] max-h-64 overflow-y-auto">
            {value && (
              <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted" onClick={() => { onChange(undefined); setOpen(false); }}>
                Vše ({label})
              </button>
            )}
            {options.map((opt) => (
              <button key={opt} className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${opt === value ? 'font-semibold text-primary' : 'text-foreground'}`} onClick={() => { onChange(opt); setOpen(false); }}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
