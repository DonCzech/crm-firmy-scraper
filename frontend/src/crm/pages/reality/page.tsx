import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Filter,
  Landmark,
  MapPin,
  Minus,
  Navigation2,
  Search,
  Download,
  X,
  Clock,
  RotateCcw,
  Loader2,
  Home,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { Input } from '@/components/ui/input';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import {
  BackendExternalListing,
  fetchRealityListings,
  fetchRealityLeadCandidates,
  enqueueRealityLeadCandidates,
  createRealityOutreachDrafts,
  syncRealityOutreachSent,
  fetchRealityOutreachMetrics,
  BackendRealityOutreachMetrics,
  fetchRealityOutreachHealth,
  BackendRealityOutreachHealth,
  saveRealityOutreachStatusSnapshot,
  fetchRealityOutreachStatusSnapshots,
  downloadRealityOutreachStatusSnapshot,
  cleanupRealityOutreachStatusSnapshots,
  RealityOutreachStatusSnapshotCleanupResult,
  fetchRealityOutreachDailyDigestSnapshots,
  cleanupRealityOutreachDailyDigestSnapshots,
  RealityOutreachDailyDigestSnapshotFile,
  RealityOutreachDailyDigestCleanupResult,
  fetchRealityOutreachMaintenanceLogs,
  cleanupRealityOutreachMaintenanceLogs,
  RealityOutreachMaintenanceLogFile,
  RealityOutreachMaintenanceCleanupResult,
  RealityOutreachStatusSnapshotFile,
  fetchRealityOutreachTopPriority,
  BackendRealityOutreachTopPriorityItem,
  downloadRealityOutreachQueueCsv,
  runRealityOutreachAutoCycle,
  runRealityOutreachAutoCycleDryRun,
  fetchRealityAnalytics,
  BackendRealityAnalytics,
  RealityListingFilters,
  RealityLeadCandidateFilters,
  downloadRealityCsv,
  fetchRadiusSearch,
  geocodeAddress,
  type RadiusSearchResult,
  createContact,
  createDeal,
} from '../../services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { ImportDialog, loadScrapeSession, saveScrapeSession, clearScrapeSession, type ScrapeSession } from './import-dialog';
import { BezrealitkyImportDialog } from './bezrealitky-import-dialog';
import { toast } from 'sonner';
import { coerceTrimmedString } from '@/crm/utils/coerce';

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(price);
}

function priceChangePercent(original: number, current: number): number | null {
  if (original === 0) return null;
  return ((current - original) / original) * 100;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

const CATEGORY_MAIN_OPTIONS = ['Byty', 'Domy', 'Pozemky', 'Komerční', 'Ostatní'];
const CATEGORY_TYPE_OPTIONS = ['Prodej', 'Pronájem'];
const STATE_OPTIONS = ['ACTIVE', 'RESERVED', 'SOLD', 'REMOVED'];
const REGION_OPTIONS = [
  'Praha', 'Středočeský', 'Jihočeský', 'Plzeňský', 'Karlovarský',
  'Ústecký', 'Liberecký', 'Královéhradecký', 'Pardubický', 'Vysočina',
  'Jihomoravský', 'Olomoucký', 'Zlínský', 'Moravskoslezský',
];
const DISPOSITION_OPTIONS = [
  '1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1',
  '4+kk', '4+1', '5+kk', '5+1', '6+', 'atypický',
];
const SORT_OPTIONS = [
  { value: 'lastSeenAt', label: 'Poslední aktualizace' },
  { value: 'firstSeenAt', label: 'Datum přidání' },
  { value: 'currentPrice', label: 'Cena' },
  { value: 'pricePerM2', label: 'Cena/m²' },
  { value: 'usableArea', label: 'Plocha' },
];

type BooleanFilterKey =
  | 'garage' | 'elevator' | 'balcony' | 'cellar' | 'loggia' | 'parkingLot' | 'terrace'
  | 'furnished' | 'partlyFurnished' | 'unfurnished'
  | 'panel' | 'brick' | 'newBuilding' | 'afterReconstruction' | 'inReconstruction'
  | 'personalOwnership' | 'stateOwnership' | 'cooperativeOwnership'
  | 'exclusiveAgency' | 'longUnsold' | 'rus' | 'auction' | 'shareProperty';

interface FilterGroup {
  label: string;
  filters: { key: BooleanFilterKey; label: string }[];
}

const BOOLEAN_FILTER_GROUPS: FilterGroup[] = [
  {
    label: 'Vybavení',
    filters: [
      { key: 'garage', label: 'Garáž' },
      { key: 'elevator', label: 'Výtah' },
      { key: 'balcony', label: 'Balkon' },
      { key: 'cellar', label: 'Sklep' },
      { key: 'loggia', label: 'Lodžie' },
      { key: 'parkingLot', label: 'Parking' },
      { key: 'terrace', label: 'Terasa' },
    ],
  },
  {
    label: 'Zařízení',
    filters: [
      { key: 'furnished', label: 'Zařízené' },
      { key: 'partlyFurnished', label: 'Částečně' },
      { key: 'unfurnished', label: 'Nezařízené' },
    ],
  },
  {
    label: 'Stavba',
    filters: [
      { key: 'panel', label: 'Panel' },
      { key: 'brick', label: 'Cihla' },
      { key: 'newBuilding', label: 'Novostavba' },
      { key: 'afterReconstruction', label: 'Po rekonstrukci' },
      { key: 'inReconstruction', label: 'V rekonstrukci' },
    ],
  },
  {
    label: 'Vlastnictví',
    filters: [
      { key: 'personalOwnership', label: 'Osobní' },
      { key: 'stateOwnership', label: 'Státní' },
      { key: 'cooperativeOwnership', label: 'Družstevní' },
    ],
  },
  {
    label: 'Ostatní',
    filters: [
      { key: 'auction', label: 'Dražba' },
      { key: 'shareProperty', label: 'Podíl' },
      { key: 'exclusiveAgency', label: 'Exkluzivní RK' },
      { key: 'longUnsold', label: 'Dlouho neprodané' },
      { key: 'rus', label: 'RUS' },
    ],
  },
];

const PAGE_SIZE = 50;
const ARTIFACTS_EXEC_AUDIT_KEY = 'reality-artifacts-execute-audit-v1';
const LAST_PANEL_ACTION_KEY = 'reality-last-panel-action-v1';
const LAST_LEAD_PRESET_KEY = 'reality-last-lead-preset-v2';

type LeadPresetKey = 'acquisition_30d' | 'urgent_only' | 'high_score_70';

function getLeadPresetValues(preset: LeadPresetKey): Partial<RealityLeadCandidateFilters> {
  if (preset === 'acquisition_30d') {
    return {
      minDaysOnMarket: 30,
      minOverpricePct: 10,
      minCallPriorityScore: 55,
      onlyNoAgency: true,
      urgencyOnly: false,
      weakPresentationOnly: false,
    };
  }
  if (preset === 'urgent_only') {
    return {
      minDaysOnMarket: 7,
      minOverpricePct: 0,
      minCallPriorityScore: 45,
      onlyNoAgency: true,
      urgencyOnly: true,
      weakPresentationOnly: false,
    };
  }
  return {
    minDaysOnMarket: 14,
    minOverpricePct: 10,
    minCallPriorityScore: 70,
    onlyNoAgency: true,
    urgencyOnly: false,
    weakPresentationOnly: false,
  };
}

export function RealityPage() {
  const { role, userId, canManageSensitiveActions } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('reality');
  const CACHE_KEY = 'reality-last-good-page';
  const [listings, setListings] = useState<BackendExternalListing[]>([]);
  const [analytics, setAnalytics] = useState<BackendRealityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [bezrealitkyImportOpen, setBezrealitkyImportOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importingLeadId, setImportingLeadId] = useState<string | null>(null);
  const [enqueueingLeads, setEnqueueingLeads] = useState(false);
  const [draftingOutreach, setDraftingOutreach] = useState(false);
  const [syncingOutreachSent, setSyncingOutreachSent] = useState(false);
  const [outreachFunnel, setOutreachFunnel] = useState<BackendRealityOutreachMetrics['funnel'] | null>(null);
  const [loadingOutreachFunnel, setLoadingOutreachFunnel] = useState(false);
  const [outreachHealth, setOutreachHealth] = useState<BackendRealityOutreachHealth | null>(null);
  const [loadingOutreachHealth, setLoadingOutreachHealth] = useState(false);
  const [latestStatusSnapshot, setLatestStatusSnapshot] = useState<RealityOutreachStatusSnapshotFile | null>(null);
  const [loadingStatusSnapshot, setLoadingStatusSnapshot] = useState(false);
  const [savingStatusSnapshot, setSavingStatusSnapshot] = useState(false);
  const [downloadingStatusSnapshot, setDownloadingStatusSnapshot] = useState(false);
  const [runningSnapshotCleanup, setRunningSnapshotCleanup] = useState(false);
  const [snapshotCleanupResult, setSnapshotCleanupResult] =
    useState<RealityOutreachStatusSnapshotCleanupResult | null>(null);
  const [latestDailyDigestSnapshot, setLatestDailyDigestSnapshot] =
    useState<RealityOutreachDailyDigestSnapshotFile | null>(null);
  const [latestMaintenanceLog, setLatestMaintenanceLog] =
    useState<RealityOutreachMaintenanceLogFile | null>(null);
  const [runningDailyDigestCleanup, setRunningDailyDigestCleanup] = useState(false);
  const [runningMaintenanceCleanup, setRunningMaintenanceCleanup] = useState(false);
  const [runningArtifactsDryRunAll, setRunningArtifactsDryRunAll] = useState(false);
  const [runningArtifactsExecuteAll, setRunningArtifactsExecuteAll] = useState(false);
  const [confirmArtifactsExecute, setConfirmArtifactsExecute] = useState(false);
  const [dailyDigestCleanupResult, setDailyDigestCleanupResult] =
    useState<RealityOutreachDailyDigestCleanupResult | null>(null);
  const [maintenanceCleanupResult, setMaintenanceCleanupResult] =
    useState<RealityOutreachMaintenanceCleanupResult | null>(null);
  const [artifactsDryRunSummary, setArtifactsDryRunSummary] = useState<{
    statusCandidates: number;
    maintenanceCandidates: number;
    totalCandidates: number;
  } | null>(null);
  const [artifactsExecuteSummary, setArtifactsExecuteSummary] = useState<{
    statusDeleted: number;
    maintenanceDeleted: number;
    digestDeleted: number;
    totalDeleted: number;
  } | null>(null);
  const [artifactsExecuteAudit, setArtifactsExecuteAudit] = useState<
    Array<{
      at: string;
      statusDeleted: number;
      maintenanceDeleted: number;
      digestDeleted: number;
      totalDeleted: number;
    }>
  >([]);
  const [topPriorityItems, setTopPriorityItems] = useState<BackendRealityOutreachTopPriorityItem[]>([]);
  const [loadingTopPriority, setLoadingTopPriority] = useState(false);
  const [topPriorityStatus, setTopPriorityStatus] = useState<'queued' | 'drafted'>('queued');
  const [autoCyclingOutreach, setAutoCyclingOutreach] = useState(false);
  const [autoCycleAndOpenDrafts, setAutoCycleAndOpenDrafts] = useState(false);
  const [dryRunningAutoCycle, setDryRunningAutoCycle] = useState(false);
  const [exportingOutreachQueue, setExportingOutreachQueue] = useState(false);
  const [outreachExportStatus, setOutreachExportStatus] = useState<'queued' | 'drafted' | 'sent' | 'failed'>('queued');
  const [exportFinalizing, setExportFinalizing] = useState(false);
  const [lastPanelAction, setLastPanelAction] = useState<{ at: string; label: string } | null>(null);

  useEffect(() => {
    // Safety default after each hard reload.
    setConfirmArtifactsExecute(false);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ARTIFACTS_EXEC_AUDIT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<{
        at: string;
        statusDeleted: number;
        maintenanceDeleted: number;
        digestDeleted: number;
        totalDeleted: number;
      }>;
      if (!Array.isArray(parsed)) return;
      const sanitized = parsed
        .filter((entry) => !!entry && typeof entry.at === 'string')
        .map((entry) => ({
          at: entry.at,
          statusDeleted: Number(entry.statusDeleted ?? 0),
          maintenanceDeleted: Number(entry.maintenanceDeleted ?? 0),
          digestDeleted: Number(entry.digestDeleted ?? 0),
          totalDeleted: Number(entry.totalDeleted ?? 0),
        }))
        .slice(0, 5);
      if (sanitized.length > 0) setArtifactsExecuteAudit(sanitized);
    } catch {
      // ignore localStorage parse errors
    }
  }, []);

  useEffect(() => {
    try {
      if (artifactsExecuteAudit.length === 0) {
        localStorage.removeItem(ARTIFACTS_EXEC_AUDIT_KEY);
        return;
      }
      localStorage.setItem(
        ARTIFACTS_EXEC_AUDIT_KEY,
        JSON.stringify(artifactsExecuteAudit.slice(0, 5)),
      );
    } catch {
      // ignore localStorage write errors
    }
  }, [artifactsExecuteAudit]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_PANEL_ACTION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { at?: string; label?: string };
      if (!parsed || typeof parsed.at !== 'string' || typeof parsed.label !== 'string') return;
      setLastPanelAction({ at: parsed.at, label: parsed.label });
    } catch {
      // ignore localStorage parse errors
    }
  }, []);

  useEffect(() => {
    try {
      if (!lastPanelAction) {
        localStorage.removeItem(LAST_PANEL_ACTION_KEY);
        return;
      }
      localStorage.setItem(LAST_PANEL_ACTION_KEY, JSON.stringify(lastPanelAction));
    } catch {
      // ignore localStorage write errors
    }
  }, [lastPanelAction]);

  const markLastAction = useCallback((label: string) => {
    setLastPanelAction({ at: new Date().toISOString(), label });
  }, []);

  const auditSensitiveAction = useCallback(
    (
      action: string,
      result: 'success' | 'error' | 'denied',
      message?: string,
      meta?: Record<string, unknown>,
    ) => {
      appendSensitiveActionAudit({
        area: 'reality',
        action,
        result,
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta,
      });
    },
    [role, userId],
  );

  const handleClearLastPanelAction = useCallback(() => {
    setLastPanelAction(null);
    try {
      localStorage.removeItem(LAST_PANEL_ACTION_KEY);
    } catch {
      // ignore localStorage errors
    }
    toast.success('Last action byla vymazána.');
  }, []);

  // Resume scrape session
  const [pendingSession, setPendingSession] = useState<ScrapeSession | null>(null);
  const [resumeSession, setResumeSession] = useState<ScrapeSession | null>(null);
  const [autoResumeEnabled, setAutoResumeEnabled] = useState(() => {
    try { return localStorage.getItem('sreality-auto-resume') !== 'false'; } catch { return true; }
  });

  // ONE-TIME RECOVERY: inject correct resume session based on actual DB state (45 208 items)
  // FLAG b — replaces the old FLAG from Feb 21 which had stale startPage=147
  useEffect(() => {
    const FLAG = 'sreality-recovery-20260221b';
    if (localStorage.getItem(FLAG)) return;
    localStorage.setItem(FLAG, '1');
    saveScrapeSession({
      status: 'in_progress',
      config: { mode: 'both', scrapeMode: 'full', categoryMain: 1, categoryType: 1, maxPages: 0, syncType: 'full' },
      combos: [
        { cat: 1, type: 1 }, { cat: 2, type: 1 }, { cat: 3, type: 1 },
        { cat: 4, type: 1 }, { cat: 5, type: 1 }, { cat: 1, type: 2 },
        { cat: 2, type: 2 }, { cat: 4, type: 2 },
        // Pozemky Pronájem (3,2) a Ostatní Pronájem (5,2) přeskočeny — DB = Sreality
      ],
      comboIndex: 0,
      startPage: 152,
      comboStartPages: { 0: 152, 1: 20, 2: 369, 3: 60, 4: 6, 5: 63, 6: 13, 7: 50 },
      result: { totalFound: 98083, pagesScraped: 0, itemsScraped: 45208, scrapeErrors: 0, created: 45208, updated: 0, unchanged: 0, importErrors: 0 },
      progress: 'Pokračování — Byty Prodej od str. 152 (45 208 v DB)',
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });
   
  }, []);

  // On mount: check for unfinished scrape session in localStorage
  useEffect(() => {
    const session = loadScrapeSession();
    if (session && session.status !== 'completed') {
      if (autoResumeEnabled) {
        // Auto-resume: immediately open dialog and continue
        setResumeSession(session);
        setImportOpen(true);
      } else {
        setPendingSession(session);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResume = useCallback(() => {
    if (!pendingSession) return;
    setResumeSession(pendingSession);
    setPendingSession(null);
    setImportOpen(true);
  }, [pendingSession]);

  const handleDismissSession = useCallback(() => {
    setPendingSession(null);
    clearScrapeSession();
  }, []);

  const toggleAutoResume = useCallback(() => {
    setAutoResumeEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('sreality-auto-resume', String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Server-side pagination & filters
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RealityListingFilters>({
    sortBy: 'lastSeenAt',
    sortOrder: 'desc',
  });
  const [leadMode, setLeadMode] = useState(false);
  const [leadFilters, setLeadFilters] = useState<RealityLeadCandidateFilters>({
    onlyNoAgency: true,
    minDaysOnMarket: 0,
    minOverpricePct: 0,
    minCallPriorityScore: 10,
    urgencyOnly: false,
    weakPresentationOnly: false,
    sortOrder: 'desc',
  });
  const [activeLeadPreset, setActiveLeadPreset] = useState<LeadPresetKey | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [localityInput, setLocalityInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');
  const [debouncedLocalityInput, setDebouncedLocalityInput] = useState('');
  const latestLoadRequestRef = useRef(0);

  // Radius search state
  const [radiusOpen, setRadiusOpen] = useState(false);
  const [radiusAddress, setRadiusAddress] = useState('');
  const [radiusKm, setRadiusKm] = useState(1);
  const [radiusLoading, setRadiusLoading] = useState(false);
  const [radiusResult, setRadiusResult] = useState<RadiusSearchResult | null>(null);
  const [radiusError, setRadiusError] = useState<string | null>(null);

  const restoreCachedPage = useCallback(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      const cached = JSON.parse(raw) as {
        listings?: BackendExternalListing[];
        total?: number;
        totalPages?: number;
        analytics?: BackendRealityAnalytics | null;
      };
      if (!Array.isArray(cached.listings) || cached.listings.length === 0) return false;
      setListings(cached.listings);
      setTotal(cached.total ?? 0);
      setTotalPages(cached.totalPages ?? 0);
      setAnalytics(cached.analytics ?? null);
      return true;
    } catch {
      return false;
    }
  }, [CACHE_KEY]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchInput(searchInput), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedLocalityInput(localityInput), 250);
    return () => window.clearTimeout(timer);
  }, [localityInput]);

  useEffect(() => {
    restoreCachedPage();
  }, [restoreCachedPage]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_LEAD_PRESET_KEY);
      if (!raw) return;
      if (raw !== 'acquisition_30d' && raw !== 'urgent_only' && raw !== 'high_score_70') return;
      const preset = raw as LeadPresetKey;
      setLeadFilters((prev) => ({ ...prev, ...getLeadPresetValues(preset) }));
      setActiveLeadPreset(preset);
    } catch {
      // ignore localStorage parse errors
    }
  }, []);

  const loadData = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    try {
      const [listRes, analyticsRes] = await Promise.all([
        leadMode
          ? fetchRealityLeadCandidates({
              ...leadFilters,
              page,
              limit: PAGE_SIZE,
              locality: debouncedLocalityInput || undefined,
              minDaysOnMarket: leadFilters.minDaysOnMarket ?? filters.minDaysOnMarket,
              sortOrder: leadFilters.sortOrder ?? filters.sortOrder,
            })
          : fetchRealityListings({
              ...filters,
              page,
              limit: PAGE_SIZE,
              search: debouncedSearchInput || undefined,
              locality: debouncedLocalityInput || undefined,
            }),
        fetchRealityAnalytics(debouncedLocalityInput || undefined),
      ]);
      if (requestId !== latestLoadRequestRef.current) return;
      setListings(listRes?.data ?? []);
      setTotal(listRes?.meta?.total ?? 0);
      setTotalPages(listRes?.meta?.totalPages ?? 0);
      setAnalytics(analyticsRes);
      setLoadError(null);
      setLoadWarning(null);

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            listings: listRes?.data ?? [],
            total: listRes?.meta?.total ?? 0,
            totalPages: listRes?.meta?.totalPages ?? 0,
            analytics: analyticsRes ?? null,
          }),
        );
      } catch {
        // ignore cache write errors
      }
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      const message = error instanceof Error ? error.message : 'Nepodařilo se načíst data.';
      const isBackendDown = message.includes('Backend API is not reachable');
      if (isBackendDown && restoreCachedPage()) {
        setLoadError(null);
        setLoadWarning('Backend je dočasně nedostupný. Zobrazuji poslední uložená data.');
      } else {
        setLoadWarning(null);
        setLoadError(message);
      }
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, [
    CACHE_KEY,
    filters,
    leadMode,
    leadFilters,
    page,
    debouncedSearchInput,
    debouncedLocalityInput,
    restoreCachedPage,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilter = useCallback((key: keyof RealityListingFilters, value: unknown) => {
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

  const toggleBoolFilter = useCallback((key: BooleanFilterKey) => {
    setPage(1);
    setFilters((prev) => {
      const next = { ...prev };
      const current = (next as Record<string, unknown>)[key];
      if (current === true) {
        delete (next as Record<string, unknown>)[key];
      } else {
        (next as Record<string, unknown>)[key] = true;
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setPage(1);
    setFilters({ sortBy: 'lastSeenAt', sortOrder: 'desc' });
    setSearchInput('');
    setLocalityInput('');
  }, []);

  const activeFilterCount = Object.keys(filters).filter(
    (k) => k !== 'sortBy' && k !== 'sortOrder' && (filters as Record<string, unknown>)[k] !== undefined,
  ).length + (searchInput ? 1 : 0) + (localityInput ? 1 : 0);

  const startItem = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const handleExportCsv = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Export CSV je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('export_csv', 'denied', 'Export CSV je dostupný pouze pro role admin/manager.');
      return;
    }
    if (exportingCsv) return;

    setExportingCsv(true);
    setExportFinalizing(false);
    setExportProgress(5);

    const interval = window.setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 95) {
          setExportFinalizing(true);
          return 95;
        }
        return prev + Math.max(1, Math.round((100 - prev) / 10));
      });
    }, 350);

    try {
      await downloadRealityCsv();
      setExportProgress(100);
      toast.success('CSV export je stažen.');
      auditSensitiveAction('export_csv', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export CSV selhal.';
      toast.error(message);
      auditSensitiveAction('export_csv', 'error', message);
    } finally {
      window.clearInterval(interval);
      window.setTimeout(() => {
        setExportingCsv(false);
        setExportFinalizing(false);
        setExportProgress(0);
      }, 400);
    }
  }, [canManageSensitiveActions, exportingCsv, auditSensitiveAction]);

  const handleRadiusSearch = useCallback(async () => {
    if (!radiusAddress.trim()) return;
    setRadiusLoading(true);
    setRadiusError(null);
    setRadiusResult(null);
    try {
      const geo = await geocodeAddress(radiusAddress);
      if (!geo) {
        setRadiusError('Adresa nebyla nalezena. Zkuste přesnější zápis (ulice, číslo, město).');
        return;
      }
      const result = await fetchRadiusSearch({
        lat: geo.lat,
        lon: geo.lon,
        radiusKm,
        categoryMain: filters.categoryMain,
        categoryType: filters.categoryType,
        disposition: filters.disposition,
        limit: 100,
      });
      setRadiusResult(result);
    } catch (err) {
      setRadiusError(err instanceof Error ? err.message : 'Chyba při hledání');
    } finally {
      setRadiusLoading(false);
    }
  }, [radiusAddress, radiusKm, filters.categoryMain, filters.categoryType, filters.disposition]);

  const handleImportAsLead = useCallback(async (row: BackendExternalListing) => {
    if (!canManageSensitiveActions) {
      toast.error('Import jako lead je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('import_as_lead', 'denied', 'Import jako lead je dostupný pouze pro role admin/manager.');
      return;
    }
    setImportingLeadId(row.id);
    try {
      const normalizedName = coerceTrimmedString(
        row.contactName ?? row.companyName ?? row.title ?? 'Neznámý',
      ) || 'Neznámý';
      const nameParts = normalizedName.split(/\s+/).filter(Boolean);
      const normalizedEmail = coerceTrimmedString(row.contactEmail);
      const normalizedPhone = coerceTrimmedString(row.contactPhone);
      const normalizedCity = coerceTrimmedString(row.locality);
      const normalizedSourceUrl = coerceTrimmedString(row.sourceUrl);
      const firstName = nameParts[0] ?? 'Neznámý';
      const lastName = nameParts.slice(1).join(' ') || 'Lead';
      const contact = await createContact({
        firstName,
        lastName,
        contactType: 'lead',
        source: 'reality',
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
        city: normalizedCity || undefined,
      });
      await createDeal({
        title: coerceTrimmedString(row.title) || 'Reality lead',
        value: row.currentPrice ?? undefined,
        currency: 'CZK',
        stage: 'new',
        contactId: contact.id,
        description: `[zdroj:reality] ${normalizedSourceUrl}`.trim(),
      });
      toast.success(`Lead "${row.title}" přidán do pipeline.`);
      auditSensitiveAction('import_as_lead', 'success', undefined, { listingId: row.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import jako lead selhal.';
      toast.error(message);
      auditSensitiveAction('import_as_lead', 'error', message, { listingId: row.id });
    } finally {
      setImportingLeadId(null);
    }
  }, [canManageSensitiveActions, auditSensitiveAction]);

  const handleEnqueueLeadCandidates = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Zařazení do outreach queue je dostupné pouze pro role admin/manager.');
      auditSensitiveAction('enqueue_lead_candidates', 'denied', 'Zařazení do outreach queue je dostupné pouze pro role admin/manager.');
      return;
    }
    if (enqueueingLeads) return;
    setEnqueueingLeads(true);
    try {
      const res = await enqueueRealityLeadCandidates({
        page,
        limit: 200,
        locality: localityInput || undefined,
        minDaysOnMarket: leadFilters.minDaysOnMarket,
        onlyNoAgency: leadFilters.onlyNoAgency,
        urgencyOnly: leadFilters.urgencyOnly,
        weakPresentationOnly: leadFilters.weakPresentationOnly,
        minOverpricePct: leadFilters.minOverpricePct,
        minCallPriorityScore: leadFilters.minCallPriorityScore,
        sortOrder: leadFilters.sortOrder,
        autoTemplateByBand: true,
      });
      toast.success(
        `Queue: ${res.queued} | bez kontaktu: ${res.skippedNoContact} | blok: ${res.skippedBlocked} | fail: ${res.failed}`,
      );
      auditSensitiveAction('enqueue_lead_candidates', 'success', undefined, {
        queued: res.queued,
        skippedNoContact: res.skippedNoContact,
        skippedBlocked: res.skippedBlocked,
        failed: res.failed,
      });
      markLastAction(`Enqueue leads (queued ${res.queued})`);
      void (async () => {
        try {
          const [metrics, top, health, snapshots, digests, maintenanceLogs] = await Promise.all([
            fetchRealityOutreachMetrics(30),
            fetchRealityOutreachTopPriority({ percent: 10, status: topPriorityStatus, limit: 20 }),
            fetchRealityOutreachHealth({ staleHours: 24, failWarnPct: 20 }),
            fetchRealityOutreachStatusSnapshots(1),
            fetchRealityOutreachDailyDigestSnapshots(1),
            fetchRealityOutreachMaintenanceLogs(1),
          ]);
          setOutreachFunnel(metrics.funnel);
          setTopPriorityItems(top.data ?? []);
          setOutreachHealth(health);
          setLatestStatusSnapshot(snapshots.data?.[0] ?? null);
          setLatestDailyDigestSnapshot(digests.data?.[0] ?? null);
          setLatestMaintenanceLog(maintenanceLogs.data?.[0] ?? null);
        } catch (refreshError) {
          logFrontendError({
            area: 'crm-reality-page',
            message: refreshError instanceof Error ? refreshError.message : 'Failed to refresh outreach metrics after enqueue',
            meta: { operation: 'refresh_outreach_after_enqueue' },
          });
        }
      })();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Zařazení leadů do queue selhalo.';
      toast.error(message);
      auditSensitiveAction('enqueue_lead_candidates', 'error', message);
    } finally {
      setEnqueueingLeads(false);
    }
  }, [canManageSensitiveActions, enqueueingLeads, leadFilters, localityInput, page, topPriorityStatus, markLastAction, auditSensitiveAction]);

  const handleCreateOutreachDrafts = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Vytváření draftů je dostupné pouze pro role admin/manager.');
      auditSensitiveAction('create_outreach_drafts', 'denied', 'Vytváření draftů je dostupné pouze pro role admin/manager.');
      return;
    }
    if (draftingOutreach) return;
    setDraftingOutreach(true);
    try {
      const res = await createRealityOutreachDrafts({
        limit: 200,
      });
      toast.success(`Drafty: ${res.drafted} | fail: ${res.failed} | processed: ${res.processed}. Otevři /core/mail/draft`);
      auditSensitiveAction('create_outreach_drafts', 'success', undefined, {
        drafted: res.drafted,
        failed: res.failed,
        processed: res.processed,
      });
      markLastAction(`Create drafts (drafted ${res.drafted})`);
      void (async () => {
        try {
          const [metrics, top, health, snapshots, digests, maintenanceLogs] = await Promise.all([
            fetchRealityOutreachMetrics(30),
            fetchRealityOutreachTopPriority({ percent: 10, status: topPriorityStatus, limit: 20 }),
            fetchRealityOutreachHealth({ staleHours: 24, failWarnPct: 20 }),
            fetchRealityOutreachStatusSnapshots(1),
            fetchRealityOutreachDailyDigestSnapshots(1),
            fetchRealityOutreachMaintenanceLogs(1),
          ]);
          setOutreachFunnel(metrics.funnel);
          setTopPriorityItems(top.data ?? []);
          setOutreachHealth(health);
          setLatestStatusSnapshot(snapshots.data?.[0] ?? null);
          setLatestDailyDigestSnapshot(digests.data?.[0] ?? null);
          setLatestMaintenanceLog(maintenanceLogs.data?.[0] ?? null);
        } catch (refreshError) {
          logFrontendError({
            area: 'crm-reality-page',
            message: refreshError instanceof Error ? refreshError.message : 'Failed to refresh outreach metrics after draft creation',
            meta: { operation: 'refresh_outreach_after_create_drafts' },
          });
        }
      })();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vytvoření draftů selhalo.';
      toast.error(message);
      auditSensitiveAction('create_outreach_drafts', 'error', message);
    } finally {
      setDraftingOutreach(false);
    }
  }, [canManageSensitiveActions, draftingOutreach, topPriorityStatus, markLastAction, auditSensitiveAction]);

  const loadOutreachFunnel = useCallback(async () => {
    if (!leadMode) return;
    setLoadingOutreachFunnel(true);
    try {
      const metrics = await fetchRealityOutreachMetrics(30);
      setOutreachFunnel(metrics.funnel);
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-page',
        message: error instanceof Error ? error.message : 'Failed to load outreach funnel',
        meta: { operation: 'load_outreach_funnel' },
      });
      setOutreachFunnel(null);
    } finally {
      setLoadingOutreachFunnel(false);
    }
  }, [leadMode]);

  const loadOutreachHealth = useCallback(async () => {
    if (!leadMode) return;
    setLoadingOutreachHealth(true);
    try {
      const health = await fetchRealityOutreachHealth({ staleHours: 24, failWarnPct: 20 });
      setOutreachHealth(health);
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-page',
        message: error instanceof Error ? error.message : 'Failed to load outreach health',
        meta: { operation: 'load_outreach_health' },
      });
      setOutreachHealth(null);
    } finally {
      setLoadingOutreachHealth(false);
    }
  }, [leadMode]);

  const loadStatusSnapshot = useCallback(async () => {
    if (!leadMode) return;
    setLoadingStatusSnapshot(true);
    try {
      const snapshots = await fetchRealityOutreachStatusSnapshots(1);
      setLatestStatusSnapshot(snapshots.data?.[0] ?? null);
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-page',
        message: error instanceof Error ? error.message : 'Failed to load outreach status snapshot',
        meta: { operation: 'load_outreach_status_snapshot' },
      });
      setLatestStatusSnapshot(null);
    } finally {
      setLoadingStatusSnapshot(false);
    }
  }, [leadMode]);

  const loadDailyDigestSnapshot = useCallback(async () => {
    if (!leadMode) return;
    try {
      const digests = await fetchRealityOutreachDailyDigestSnapshots(1);
      setLatestDailyDigestSnapshot(digests.data?.[0] ?? null);
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-page',
        message: error instanceof Error ? error.message : 'Failed to load outreach daily digest snapshot',
        meta: { operation: 'load_outreach_daily_digest_snapshot' },
      });
      setLatestDailyDigestSnapshot(null);
    }
  }, [leadMode]);

  const loadMaintenanceLog = useCallback(async () => {
    if (!leadMode) return;
    try {
      const logs = await fetchRealityOutreachMaintenanceLogs(1);
      setLatestMaintenanceLog(logs.data?.[0] ?? null);
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-page',
        message: error instanceof Error ? error.message : 'Failed to load outreach maintenance log',
        meta: { operation: 'load_outreach_maintenance_log' },
      });
      setLatestMaintenanceLog(null);
    }
  }, [leadMode]);

  const loadTopPriority = useCallback(async () => {
    if (!leadMode) return;
    setLoadingTopPriority(true);
    try {
      const top = await fetchRealityOutreachTopPriority({
        percent: 10,
        status: topPriorityStatus,
        limit: 20,
      });
      setTopPriorityItems(top.data ?? []);
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-page',
        message: error instanceof Error ? error.message : 'Failed to load outreach top priority',
        meta: { operation: 'load_outreach_top_priority' },
      });
      setTopPriorityItems([]);
    } finally {
      setLoadingTopPriority(false);
    }
  }, [leadMode, topPriorityStatus]);

  useEffect(() => {
    if (leadMode) {
      void loadOutreachFunnel();
      void loadOutreachHealth();
      void loadStatusSnapshot();
      void loadDailyDigestSnapshot();
      void loadMaintenanceLog();
      void loadTopPriority();
    } else {
      // Safety: never carry destructive-confirm state outside lead mode.
      setConfirmArtifactsExecute(false);
    }
  }, [
    leadMode,
    loadOutreachFunnel,
    loadOutreachHealth,
    loadStatusSnapshot,
    loadDailyDigestSnapshot,
    loadMaintenanceLog,
    loadTopPriority,
  ]);

  const handleSyncOutreachSent = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Sync sent je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('sync_outreach_sent', 'denied', 'Sync sent je dostupný pouze pro role admin/manager.');
      return;
    }
    if (syncingOutreachSent) return;
    setSyncingOutreachSent(true);
    try {
      const res = await syncRealityOutreachSent({
        lookbackDays: 30,
        limit: 2000,
      });
      toast.success(`Sync sent: ${res.synced} | scanned sent: ${res.scannedSent}`);
      auditSensitiveAction('sync_outreach_sent', 'success', undefined, {
        synced: res.synced,
        scannedSent: res.scannedSent,
      });
      markLastAction(`Sync sent (synced ${res.synced})`);
      await Promise.all([
        loadOutreachFunnel(),
        loadOutreachHealth(),
        loadStatusSnapshot(),
        loadDailyDigestSnapshot(),
        loadMaintenanceLog(),
        loadTopPriority(),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync sent selhal.';
      toast.error(message);
      auditSensitiveAction('sync_outreach_sent', 'error', message);
    } finally {
      setSyncingOutreachSent(false);
    }
  }, [
    canManageSensitiveActions,
    syncingOutreachSent,
    loadOutreachFunnel,
    loadOutreachHealth,
    loadStatusSnapshot,
    loadDailyDigestSnapshot,
    loadMaintenanceLog,
    loadTopPriority,
    markLastAction,
    auditSensitiveAction,
  ]);

  const handleExportOutreachQueueCsv = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Export outreach queue je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('export_outreach_queue_csv', 'denied', 'Export outreach queue je dostupný pouze pro role admin/manager.');
      return;
    }
    if (exportingOutreachQueue) return;
    setExportingOutreachQueue(true);
    try {
      await downloadRealityOutreachQueueCsv({ status: outreachExportStatus, limit: 20000 });
      toast.success(`Outreach CSV (${outreachExportStatus}) je stažen.`);
      auditSensitiveAction('export_outreach_queue_csv', 'success', undefined, { status: outreachExportStatus });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export outreach queue selhal.';
      toast.error(message);
      auditSensitiveAction('export_outreach_queue_csv', 'error', message, { status: outreachExportStatus });
    } finally {
      setExportingOutreachQueue(false);
    }
  }, [canManageSensitiveActions, exportingOutreachQueue, outreachExportStatus, auditSensitiveAction]);

  const handleRunOutreachAutoCycle = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Auto cycle je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('run_outreach_auto_cycle', 'denied', 'Auto cycle je dostupný pouze pro role admin/manager.');
      return;
    }
    if (autoCyclingOutreach) return;
    setAutoCyclingOutreach(true);
    try {
      const res = await runRealityOutreachAutoCycle({
        enqueue: {
          limit: 200,
          locality: localityInput || undefined,
          minDaysOnMarket: leadFilters.minDaysOnMarket,
          onlyNoAgency: leadFilters.onlyNoAgency,
          urgencyOnly: leadFilters.urgencyOnly,
          weakPresentationOnly: leadFilters.weakPresentationOnly,
          minOverpricePct: leadFilters.minOverpricePct,
          minCallPriorityScore: leadFilters.minCallPriorityScore,
          autoTemplateByBand: true,
        },
        draftLimit: 200,
        syncLookbackDays: 30,
        syncLimit: 2000,
        metricsPeriodDays: 30,
      });

      toast.success(
        `Auto cycle: queue ${res.enqueue?.queued ?? 0} | draft ${res.draft?.drafted ?? 0} | sync ${res.syncSent?.synced ?? 0}`,
      );
      auditSensitiveAction('run_outreach_auto_cycle', 'success', undefined, {
        queued: res.enqueue?.queued ?? 0,
        drafted: res.draft?.drafted ?? 0,
        synced: res.syncSent?.synced ?? 0,
      });
      markLastAction(`Auto cycle (queue ${res.enqueue?.queued ?? 0}, draft ${res.draft?.drafted ?? 0})`);

      await Promise.all([
        loadOutreachFunnel(),
        loadOutreachHealth(),
        loadStatusSnapshot(),
        loadDailyDigestSnapshot(),
        loadMaintenanceLog(),
        loadTopPriority(),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auto cycle selhal.';
      toast.error(message);
      auditSensitiveAction('run_outreach_auto_cycle', 'error', message);
    } finally {
      setAutoCyclingOutreach(false);
    }
  }, [
    canManageSensitiveActions,
    autoCyclingOutreach,
    leadFilters,
    localityInput,
    loadOutreachFunnel,
    loadOutreachHealth,
    loadStatusSnapshot,
    loadDailyDigestSnapshot,
    loadMaintenanceLog,
    loadTopPriority,
    markLastAction,
    auditSensitiveAction,
  ]);

  const handleSaveStatusSnapshot = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Uložení status snapshotu je dostupné pouze pro role admin/manager.');
      auditSensitiveAction('save_status_snapshot', 'denied', 'Uložení status snapshotu je dostupné pouze pro role admin/manager.');
      return;
    }
    if (savingStatusSnapshot) return;
    setSavingStatusSnapshot(true);
    try {
      const res = await saveRealityOutreachStatusSnapshot({
        healthStaleHours: 24,
        healthFailWarnPct: 20,
        recentPeriodDays: 30,
        prefix: 'status-report',
      });
      toast.success(`Snapshot uložen: ${res.fileName}`);
      auditSensitiveAction('save_status_snapshot', 'success', undefined, { fileName: res.fileName });
      await loadStatusSnapshot();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Uložení status snapshotu selhalo.';
      toast.error(message);
      auditSensitiveAction('save_status_snapshot', 'error', message);
    } finally {
      setSavingStatusSnapshot(false);
    }
  }, [canManageSensitiveActions, savingStatusSnapshot, loadStatusSnapshot, auditSensitiveAction]);

  const handleDownloadLatestStatusSnapshot = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Stažení snapshotu je dostupné pouze pro role admin/manager.');
      auditSensitiveAction('download_status_snapshot', 'denied', 'Stažení snapshotu je dostupné pouze pro role admin/manager.');
      return;
    }
    if (downloadingStatusSnapshot) return;
    if (!latestStatusSnapshot?.fileName) {
      toast.error('Není dostupný žádný status snapshot.');
      return;
    }
    setDownloadingStatusSnapshot(true);
    try {
      await downloadRealityOutreachStatusSnapshot(latestStatusSnapshot.fileName);
      toast.success(`Snapshot stažen: ${latestStatusSnapshot.fileName}`);
      auditSensitiveAction('download_status_snapshot', 'success', undefined, { fileName: latestStatusSnapshot.fileName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stažení status snapshotu selhalo.';
      toast.error(message);
      auditSensitiveAction('download_status_snapshot', 'error', message);
    } finally {
      setDownloadingStatusSnapshot(false);
    }
  }, [canManageSensitiveActions, downloadingStatusSnapshot, latestStatusSnapshot, auditSensitiveAction]);

  const handleCleanupStatusSnapshotsDryRun = useCallback(async () => {
    if (runningSnapshotCleanup) return;
    setRunningSnapshotCleanup(true);
    try {
      const res = await cleanupRealityOutreachStatusSnapshots({
        olderThanDays: 30,
        keepLatest: 200,
        dryRun: true,
      });
      setSnapshotCleanupResult(res);
      toast.success(`Cleanup dry-run: candidates ${res.candidates} / scanned ${res.scanned}`);
      auditSensitiveAction('cleanup_status_snapshots_dry_run', 'success', undefined, {
        candidates: res.candidates,
        scanned: res.scanned,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Snapshot cleanup dry-run selhal.';
      toast.error(message);
      auditSensitiveAction('cleanup_status_snapshots_dry_run', 'error', message);
    } finally {
      setRunningSnapshotCleanup(false);
    }
  }, [runningSnapshotCleanup, auditSensitiveAction]);

  const handleCleanupStatusSnapshotsExecute = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Snapshot cleanup execute je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('cleanup_status_snapshots_execute', 'denied', 'Snapshot cleanup execute je dostupný pouze pro role admin/manager.');
      return;
    }
    if (runningSnapshotCleanup) return;
    setRunningSnapshotCleanup(true);
    try {
      const res = await cleanupRealityOutreachStatusSnapshots({
        olderThanDays: 30,
        keepLatest: 200,
        dryRun: false,
      });
      setSnapshotCleanupResult(res);
      toast.success(`Cleanup execute: deleted ${res.deleted} / candidates ${res.candidates}`);
      auditSensitiveAction('cleanup_status_snapshots_execute', 'success', undefined, {
        deleted: res.deleted,
        candidates: res.candidates,
      });
      await loadStatusSnapshot();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Snapshot cleanup execute selhal.';
      toast.error(message);
      auditSensitiveAction('cleanup_status_snapshots_execute', 'error', message);
    } finally {
      setRunningSnapshotCleanup(false);
    }
  }, [canManageSensitiveActions, runningSnapshotCleanup, loadStatusSnapshot, auditSensitiveAction]);

  const handleCleanupDailyDigestExecute = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Digest cleanup execute je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('cleanup_daily_digest_execute', 'denied', 'Digest cleanup execute je dostupný pouze pro role admin/manager.');
      return;
    }
    if (runningDailyDigestCleanup) return;
    setRunningDailyDigestCleanup(true);
    try {
      const res = await cleanupRealityOutreachDailyDigestSnapshots({
        olderThanDays: 30,
        keepLatest: 100,
      });
      setDailyDigestCleanupResult(res);
      toast.success(`Digest cleanup: deleted ${res.deleted} / scanned ${res.scanned}`);
      auditSensitiveAction('cleanup_daily_digest_execute', 'success', undefined, {
        deleted: res.deleted,
        scanned: res.scanned,
      });
      await loadDailyDigestSnapshot();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Daily digest cleanup selhal.';
      toast.error(message);
      auditSensitiveAction('cleanup_daily_digest_execute', 'error', message);
    } finally {
      setRunningDailyDigestCleanup(false);
    }
  }, [canManageSensitiveActions, runningDailyDigestCleanup, loadDailyDigestSnapshot, auditSensitiveAction]);

  const handleCleanupMaintenanceDryRun = useCallback(async () => {
    if (runningMaintenanceCleanup) return;
    setRunningMaintenanceCleanup(true);
    try {
      const res = await cleanupRealityOutreachMaintenanceLogs({
        olderThanDays: 30,
        keepLatest: 200,
        dryRun: true,
      });
      setMaintenanceCleanupResult(res);
      toast.success(`Maintenance dry-run: candidates ${res.candidates} / scanned ${res.scanned}`);
      auditSensitiveAction('cleanup_maintenance_dry_run', 'success', undefined, {
        candidates: res.candidates,
        scanned: res.scanned,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Maintenance cleanup dry-run selhal.';
      toast.error(message);
      auditSensitiveAction('cleanup_maintenance_dry_run', 'error', message);
    } finally {
      setRunningMaintenanceCleanup(false);
    }
  }, [runningMaintenanceCleanup, auditSensitiveAction]);

  const handleCleanupMaintenanceExecute = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Maintenance cleanup execute je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('cleanup_maintenance_execute', 'denied', 'Maintenance cleanup execute je dostupný pouze pro role admin/manager.');
      return;
    }
    if (runningMaintenanceCleanup) return;
    setRunningMaintenanceCleanup(true);
    try {
      const res = await cleanupRealityOutreachMaintenanceLogs({
        olderThanDays: 30,
        keepLatest: 200,
        dryRun: false,
      });
      setMaintenanceCleanupResult(res);
      toast.success(`Maintenance cleanup: deleted ${res.deleted} / candidates ${res.candidates}`);
      auditSensitiveAction('cleanup_maintenance_execute', 'success', undefined, {
        deleted: res.deleted,
        candidates: res.candidates,
      });
      await loadMaintenanceLog();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Maintenance cleanup execute selhal.';
      toast.error(message);
      auditSensitiveAction('cleanup_maintenance_execute', 'error', message);
    } finally {
      setRunningMaintenanceCleanup(false);
    }
  }, [canManageSensitiveActions, runningMaintenanceCleanup, loadMaintenanceLog, auditSensitiveAction]);

  const handleArtifactsCleanupDryRunAll = useCallback(async () => {
    if (runningArtifactsDryRunAll) return;
    setRunningArtifactsDryRunAll(true);
    try {
      const [statusDryRun, maintenanceDryRun] = await Promise.all([
        cleanupRealityOutreachStatusSnapshots({
          olderThanDays: 30,
          keepLatest: 200,
          dryRun: true,
        }),
        cleanupRealityOutreachMaintenanceLogs({
          olderThanDays: 30,
          keepLatest: 200,
          dryRun: true,
        }),
      ]);
      setSnapshotCleanupResult(statusDryRun);
      setMaintenanceCleanupResult(maintenanceDryRun);
      const summary = {
        statusCandidates: statusDryRun.candidates ?? 0,
        maintenanceCandidates: maintenanceDryRun.candidates ?? 0,
        totalCandidates: (statusDryRun.candidates ?? 0) + (maintenanceDryRun.candidates ?? 0),
      };
      setArtifactsDryRunSummary(summary);
      toast.success(
        `Artifacts dry-run: status ${summary.statusCandidates} + maintenance ${summary.maintenanceCandidates} = ${summary.totalCandidates}`,
      );
      auditSensitiveAction('artifacts_cleanup_dry_run_all', 'success', undefined, summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Artifacts cleanup dry-run all selhal.';
      toast.error(message);
      auditSensitiveAction('artifacts_cleanup_dry_run_all', 'error', message);
    } finally {
      setRunningArtifactsDryRunAll(false);
    }
  }, [runningArtifactsDryRunAll, auditSensitiveAction]);

  const handleArtifactsCleanupExecuteAll = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Artifacts cleanup execute je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('artifacts_cleanup_execute_all', 'denied', 'Artifacts cleanup execute je dostupný pouze pro role admin/manager.');
      return;
    }
    if (!confirmArtifactsExecute) {
      toast.error('Nejdřív zapni Confirm execute.');
      return;
    }
    if (runningArtifactsExecuteAll) return;
    setRunningArtifactsExecuteAll(true);
    try {
      const [statusExec, maintenanceExec, digestExec] = await Promise.all([
        cleanupRealityOutreachStatusSnapshots({
          olderThanDays: 30,
          keepLatest: 200,
          dryRun: false,
        }),
        cleanupRealityOutreachMaintenanceLogs({
          olderThanDays: 30,
          keepLatest: 200,
          dryRun: false,
        }),
        cleanupRealityOutreachDailyDigestSnapshots({
          olderThanDays: 30,
          keepLatest: 100,
        }),
      ]);
      setSnapshotCleanupResult(statusExec);
      setMaintenanceCleanupResult(maintenanceExec);
      setDailyDigestCleanupResult(digestExec);

      const summary = {
        statusDeleted: statusExec.deleted ?? 0,
        maintenanceDeleted: maintenanceExec.deleted ?? 0,
        digestDeleted: digestExec.deleted ?? 0,
        totalDeleted:
          (statusExec.deleted ?? 0) +
          (maintenanceExec.deleted ?? 0) +
          (digestExec.deleted ?? 0),
      };
      setArtifactsExecuteSummary(summary);
      setArtifactsExecuteAudit((prev) =>
        [
          {
            at: new Date().toISOString(),
            ...summary,
          },
          ...prev,
        ].slice(0, 5),
      );
      setConfirmArtifactsExecute(false);
      toast.success(
        `Artifacts execute: status ${summary.statusDeleted} + maintenance ${summary.maintenanceDeleted} + digest ${summary.digestDeleted} = ${summary.totalDeleted}`,
      );
      auditSensitiveAction('artifacts_cleanup_execute_all', 'success', undefined, summary);
      markLastAction(`Artifacts execute all (total deleted ${summary.totalDeleted})`);

      await Promise.all([loadStatusSnapshot(), loadDailyDigestSnapshot(), loadMaintenanceLog()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Artifacts cleanup execute all selhal.';
      toast.error(message);
      auditSensitiveAction('artifacts_cleanup_execute_all', 'error', message);
    } finally {
      setRunningArtifactsExecuteAll(false);
    }
  }, [
    canManageSensitiveActions,
    confirmArtifactsExecute,
    runningArtifactsExecuteAll,
    loadStatusSnapshot,
    loadDailyDigestSnapshot,
    loadMaintenanceLog,
    markLastAction,
    auditSensitiveAction,
  ]);

  const handleClearArtifactsExecuteAudit = useCallback(() => {
    setArtifactsExecuteAudit([]);
    try {
      localStorage.removeItem(ARTIFACTS_EXEC_AUDIT_KEY);
    } catch {
      // ignore localStorage errors
    }
    toast.success('Artifacts execute audit byl vymazán.');
    markLastAction('Clear artifacts execute audit');
    auditSensitiveAction('clear_artifacts_execute_audit', 'success');
  }, [markLastAction, auditSensitiveAction]);

  const handleRunOutreachAutoCycleAndOpenDrafts = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Auto cycle + open drafts je dostupné pouze pro role admin/manager.');
      auditSensitiveAction('run_outreach_auto_cycle_open_drafts', 'denied', 'Auto cycle + open drafts je dostupné pouze pro role admin/manager.');
      return;
    }
    if (autoCycleAndOpenDrafts) return;
    setAutoCycleAndOpenDrafts(true);
    try {
      const res = await runRealityOutreachAutoCycle({
        enqueue: {
          limit: 200,
          locality: localityInput || undefined,
          minDaysOnMarket: leadFilters.minDaysOnMarket,
          onlyNoAgency: leadFilters.onlyNoAgency,
          urgencyOnly: leadFilters.urgencyOnly,
          weakPresentationOnly: leadFilters.weakPresentationOnly,
          minOverpricePct: leadFilters.minOverpricePct,
          minCallPriorityScore: leadFilters.minCallPriorityScore,
          autoTemplateByBand: true,
        },
        draftLimit: 200,
        syncLookbackDays: 30,
        syncLimit: 2000,
        metricsPeriodDays: 30,
      });

      toast.success(
        `Auto+open: queue ${res.enqueue?.queued ?? 0} | draft ${res.draft?.drafted ?? 0} | sync ${res.syncSent?.synced ?? 0}`,
      );
      auditSensitiveAction('run_outreach_auto_cycle_open_drafts', 'success', undefined, {
        queued: res.enqueue?.queued ?? 0,
        drafted: res.draft?.drafted ?? 0,
        synced: res.syncSent?.synced ?? 0,
      });
      window.location.assign('/core/mail/draft');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auto cycle + open drafts selhal.';
      toast.error(message);
      auditSensitiveAction('run_outreach_auto_cycle_open_drafts', 'error', message);
    } finally {
      setAutoCycleAndOpenDrafts(false);
    }
  }, [canManageSensitiveActions, autoCycleAndOpenDrafts, leadFilters, localityInput, auditSensitiveAction]);

  const applyLeadPreset = useCallback((preset: LeadPresetKey) => {
    setPage(1);
    setLeadFilters((prev) => ({ ...prev, ...getLeadPresetValues(preset) }));
    setActiveLeadPreset(preset);
    try {
      localStorage.setItem(LAST_LEAD_PRESET_KEY, preset);
    } catch {
      // ignore localStorage write errors
    }

    if (preset === 'acquisition_30d') {
      toast.success('Preset aplikován: Akvizice 30d');
      return;
    }
    if (preset === 'urgent_only') {
      toast.success('Preset aplikován: Urgent only');
      return;
    }
    toast.success('Preset aplikován: High score 70+');
  }, []);

  const handleRunOutreachAutoCycleDryRun = useCallback(async () => {
    if (!canManageSensitiveActions) {
      toast.error('Dry-run auto cycle je dostupný pouze pro role admin/manager.');
      auditSensitiveAction('run_outreach_auto_cycle_dry_run', 'denied', 'Dry-run auto cycle je dostupný pouze pro role admin/manager.');
      return;
    }
    if (dryRunningAutoCycle) return;
    setDryRunningAutoCycle(true);
    try {
      const res = await runRealityOutreachAutoCycleDryRun({
        enqueue: {
          limit: 200,
          locality: localityInput || undefined,
          minDaysOnMarket: leadFilters.minDaysOnMarket,
          onlyNoAgency: leadFilters.onlyNoAgency,
          urgencyOnly: leadFilters.urgencyOnly,
          weakPresentationOnly: leadFilters.weakPresentationOnly,
          minOverpricePct: leadFilters.minOverpricePct,
          minCallPriorityScore: leadFilters.minCallPriorityScore,
          autoTemplateByBand: true,
        },
        draftLimit: 200,
        syncLookbackDays: 30,
        syncLimit: 2000,
        metricsPeriodDays: 30,
      });

      toast.success(
        `Dry-run: wouldQueue ${res.projections?.enqueue?.wouldQueue ?? 0} | wouldDraft ${res.projections?.draft?.wouldDraftNow ?? 0} | sentInWindow ${res.projections?.syncSent?.sentMessagesInWindow ?? 0}`,
      );
      auditSensitiveAction('run_outreach_auto_cycle_dry_run', 'success', undefined, {
        wouldQueue: res.projections?.enqueue?.wouldQueue ?? 0,
        wouldDraft: res.projections?.draft?.wouldDraftNow ?? 0,
        sentInWindow: res.projections?.syncSent?.sentMessagesInWindow ?? 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Dry-run auto cycle selhal.';
      toast.error(message);
      auditSensitiveAction('run_outreach_auto_cycle_dry_run', 'error', message);
    } finally {
      setDryRunningAutoCycle(false);
    }
  }, [canManageSensitiveActions, dryRunningAutoCycle, leadFilters, localityInput, auditSensitiveAction]);

  const handleOpenMailDrafts = useCallback(() => {
    window.location.assign('/core/mail/draft');
  }, []);

  return (
    <>
      <ContentHeader>
        <div className="w-full flex flex-col gap-2 py-2">
          {loadError && (
            <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900">Databáze je dočasně nedostupná</p>
                <p className="text-xs text-red-700 truncate">
                  {loadError}
                </p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={loadData}>
                Zkusit znovu
              </Button>
            </div>
          )}
          {loadWarning && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">Dočasný offline režim</p>
                <p className="text-xs text-amber-700 truncate">{loadWarning}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={loadData}>
                Obnovit data
              </Button>
            </div>
          )}

          {/* Resume banner — shown when there's an unfinished scrape session (manual resume mode) */}
          {pendingSession && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <Loader2 className="size-4 text-amber-600 animate-spin" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">Nedokončené scrapování</p>
                <p className="text-xs text-amber-700 truncate">
                  {pendingSession.progress || 'Přerušeno'} — {pendingSession.result.itemsScraped.toLocaleString('cs-CZ')} zpracováno
                  {pendingSession.status === 'error' && pendingSession.errorMessage && (
                    <span className="text-red-600"> (chyba: {pendingSession.errorMessage})</span>
                  )}
                </p>
              </div>
              <Button size="sm" variant="default" className="shrink-0" onClick={handleResume}>
                <RotateCcw className="size-3.5" />
                Pokračovat
              </Button>
              <Button size="sm" variant="ghost" className="shrink-0" onClick={handleDismissSession}>
                <X className="size-3.5" />
              </Button>
            </div>
          )}


          {analytics && analytics.count > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
              <StatCard label="Inzerátů" value={String(analytics.count)} icon={<Building2 className="size-4" />} />
              <StatCard label="Ø Kč/m²" value={analytics.avgPricePerM2?.toLocaleString('cs-CZ') ?? '-'} icon={<Minus className="size-4" />} />
              <StatCard label="Medián Kč/m²" value={analytics.medianPricePerM2?.toLocaleString('cs-CZ') ?? '-'} icon={<MapPin className="size-4" />} />
              <StatCard label="Ø dny na trhu" value={analytics.avgDaysOnMarket != null ? String(analytics.avgDaysOnMarket) : '-'} icon={<Minus className="size-4" />} />
              <StatCard label="Ø pokles %" value={analytics.avgPriceDropPercent != null ? `${analytics.avgPriceDropPercent}%` : '-'} icon={<ArrowDown className="size-4" />} />
              <StatCard label="Ø změn ceny" value={analytics.avgPriceChangesBeforeSold != null ? String(analytics.avgPriceChangesBeforeSold) : '-'} icon={<Minus className="size-4" />} />
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0 w-full flex-wrap">
            <div className="inline-flex items-center gap-2 shrink-0 pe-1">
              <Landmark className="size-4 text-primary" />
              <span className="text-sm font-semibold">Reality</span>
            </div>
            <div className="relative flex-shrink-0">
              <Search className="size-4 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2" />
              <Input
                variant="sm"
                placeholder="Hledat..."
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
            <div className="relative flex-shrink-0">
              <MapPin className="size-4 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2" />
              <Input
                variant="sm"
                placeholder="Ulice / město..."
                value={localityInput}
                onChange={(e) => { setLocalityInput(e.target.value); setPage(1); }}
                className="ps-9 w-48 h-10 rounded-lg"
              />
              {localityInput && (
                <button
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => { setLocalityInput(''); setPage(1); }}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
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
            <ChipSelect label="Typ" value={filters.categoryType} options={CATEGORY_TYPE_OPTIONS} onChange={(v) => updateFilter('categoryType', v)} />
            <ChipSelect label="Kategorie" value={filters.categoryMain} options={CATEGORY_MAIN_OPTIONS} onChange={(v) => updateFilter('categoryMain', v)} />
            <ChipSelect label="Kraj" value={filters.region} options={REGION_OPTIONS} onChange={(v) => updateFilter('region', v)} />
            <ChipSelect label="Stav" value={filters.listingState} options={STATE_OPTIONS} onChange={(v) => updateFilter('listingState', v)} />
            <ChipSelect label="Dispozice" value={filters.disposition} options={DISPOSITION_OPTIONS} onChange={(v) => updateFilter('disposition', v)} />

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
                role={role}
                frontendErrorCount24h={frontendErrorCount24h}
                sensitiveActions24hSummary={sensitiveActions24hSummary}
              />
              <button
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${leadMode ? 'bg-primary' : 'bg-gray-300'}`}
                onClick={() => {
                  setPage(1);
                  setLeadMode((prev) => !prev);
                }}
                title="Lead scoring režim"
              >
                <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow transform transition-transform ${leadMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-[11px] text-muted-foreground hidden lg:inline">Lead mode</span>
              <button
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${autoResumeEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                onClick={toggleAutoResume}
                title="Automaticky pokračovat po refreshi stránky"
              >
                <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow transform transition-transform ${autoResumeEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-[11px] text-muted-foreground hidden lg:inline">Auto-resume</span>
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-lg"
                onClick={handleExportCsv}
                title="Stáhnout všechna data jako CSV"
                disabled={exportingCsv || !canManageSensitiveActions}
              >
                {exportingCsv ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {exportingCsv
                  ? exportFinalizing
                    ? 'Finalizuji export...'
                    : `Exportuji... ${exportProgress}%`
                  : 'Export CSV'}
              </Button>
              <Button
                size="sm"
                variant={radiusOpen ? 'default' : 'outline'}
                className="h-10 rounded-lg"
                onClick={() => setRadiusOpen(!radiusOpen)}
                title="Hledat inzeráty v okolí adresy"
              >
                <Navigation2 className="size-4" /> Radius
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-lg"
                disabled={!canManageSensitiveActions}
                onClick={() => setImportOpen(true)}
              >
                <Download className="size-4" /> Scrape Sreality
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-lg"
                disabled={!canManageSensitiveActions}
                onClick={() => setBezrealitkyImportOpen(true)}
              >
                <Home className="size-4" /> Scrape Bezrealitky
              </Button>
            </div>
          </div>
          {exportingCsv && (
            <div className="w-full">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full bg-primary transition-all duration-300 ${exportFinalizing ? 'animate-pulse' : ''}`}
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {exportFinalizing
                  ? 'Server dokončuje export velkého datasetu. Prosím vyčkej.'
                  : 'Připravuji CSV z databáze, může to trvat déle u velkého počtu inzerátů.'}
              </p>
            </div>
          )}
        </div>
      </ContentHeader>

      <Content className="py-0">
        {/* Radius search panel */}
        {radiusOpen && (
          <div className="px-4 py-3 border-b border-border bg-blue-50/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Navigation2 className="size-3.5" /> Hledání v okruhu — ověření zdroje dat
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-48 max-w-96">
                <Search className="size-3.5 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="w-full h-9 ps-8 pe-3 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ulice + číslo + město (př. Klausova 11, Praha)"
                  value={radiusAddress}
                  onChange={(e) => setRadiusAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRadiusSearch()}
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {[0.5, 1, 2, 5].map((km) => (
                  <button
                    key={km}
                    className={`h-9 px-3 rounded-lg border text-sm font-medium transition-colors ${radiusKm === km ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                    onClick={() => setRadiusKm(km)}
                  >
                    {km < 1 ? `${km * 1000}m` : `${km}km`}
                  </button>
                ))}
              </div>
              <Button size="sm" className="h-9 shrink-0" onClick={handleRadiusSearch} disabled={radiusLoading}>
                {radiusLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Navigation2 className="size-3.5" />}
                Hledat
              </Button>
            </div>
            {radiusError && (
              <p className="text-xs text-red-600 mt-2">{radiusError}</p>
            )}
            {radiusResult && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Nalezeno <strong>{radiusResult.count}</strong> inzerátů v okruhu <strong>{radiusKm} km</strong>
                  {filters.categoryMain && ` · ${filters.categoryMain}`}
                  {filters.categoryType && ` · ${filters.categoryType}`}
                  {filters.disposition && ` · ${filters.disposition}`}
                </p>
                {radiusResult.items.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border bg-background">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-muted/50">
                        <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium border-b border-border">
                          <th>Vzdálenost</th>
                          <th>Název</th>
                          <th>Dispozice</th>
                          <th>Plocha</th>
                          <th>Lokalita</th>
                          <th>Cena</th>
                          <th>Kč/m²</th>
                        </tr>
                      </thead>
                      <tbody>
                        {radiusResult.items.slice(0, 30).map((item) => (
                          <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="px-3 py-1.5 font-medium text-primary whitespace-nowrap">{item.distanceKm} km</td>
                            <td className="px-3 py-1.5 max-w-[280px] truncate">
                              {item.sourceUrl ? (
                                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
                                  {item.title} <ExternalLink className="size-2.5 shrink-0" />
                                </a>
                              ) : item.title}
                            </td>
                            <td className="px-3 py-1.5">{item.disposition ?? '-'}</td>
                            <td className="px-3 py-1.5 whitespace-nowrap">{item.usableArea != null ? `${item.usableArea} m²` : '-'}</td>
                            <td className="px-3 py-1.5 max-w-[160px] truncate">{item.locality ?? '-'}</td>
                            <td className="px-3 py-1.5 whitespace-nowrap">{item.currentPrice ? formatPrice(item.currentPrice) : '-'}</td>
                            <td className="px-3 py-1.5 whitespace-nowrap">{item.pricePerM2 ? `${item.pricePerM2.toLocaleString('cs-CZ')} Kč` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {radiusResult.items.length > 30 && (
                      <p className="px-3 py-2 text-xs text-muted-foreground">… a {radiusResult.items.length - 30} dalších</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Žádné inzeráty v tomto okruhu.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expanded filters panel */}
        {filtersOpen && (
          <div className="px-4 py-3 border-b border-border space-y-3">
              {leadMode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-amber-900 uppercase tracking-wide">
                      Lead scoring filtry
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleRunOutreachAutoCycleDryRun()}
                        disabled={dryRunningAutoCycle || !canManageSensitiveActions}
                      >
                        {dryRunningAutoCycle ? <Loader2 className="size-3 animate-spin" /> : null}
                        Dry-run
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleRunOutreachAutoCycle()}
                        disabled={autoCyclingOutreach || !canManageSensitiveActions}
                      >
                        {autoCyclingOutreach ? <Loader2 className="size-3 animate-spin" /> : null}
                        Auto cycle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleRunOutreachAutoCycleAndOpenDrafts()}
                        disabled={autoCycleAndOpenDrafts || !canManageSensitiveActions}
                      >
                        {autoCycleAndOpenDrafts ? <Loader2 className="size-3 animate-spin" /> : null}
                        Auto cycle + open drafts
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleSaveStatusSnapshot()}
                        disabled={savingStatusSnapshot || !canManageSensitiveActions}
                      >
                        {savingStatusSnapshot ? <Loader2 className="size-3 animate-spin" /> : null}
                        Uložit status snapshot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleDownloadLatestStatusSnapshot()}
                        disabled={downloadingStatusSnapshot || !latestStatusSnapshot?.fileName || !canManageSensitiveActions}
                      >
                        {downloadingStatusSnapshot ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                        Stáhnout poslední snapshot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleCleanupStatusSnapshotsDryRun()}
                        disabled={runningSnapshotCleanup}
                      >
                        {runningSnapshotCleanup ? <Loader2 className="size-3 animate-spin" /> : null}
                        Snapshot cleanup dry-run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleCleanupStatusSnapshotsExecute()}
                        disabled={runningSnapshotCleanup || !canManageSensitiveActions}
                      >
                        {runningSnapshotCleanup ? <Loader2 className="size-3 animate-spin" /> : null}
                        Snapshot cleanup execute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleCleanupDailyDigestExecute()}
                        disabled={runningDailyDigestCleanup || !canManageSensitiveActions}
                      >
                        {runningDailyDigestCleanup ? <Loader2 className="size-3 animate-spin" /> : null}
                        Digest cleanup execute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleCleanupMaintenanceDryRun()}
                        disabled={runningMaintenanceCleanup}
                      >
                        {runningMaintenanceCleanup ? <Loader2 className="size-3 animate-spin" /> : null}
                        Maintenance cleanup dry-run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleCleanupMaintenanceExecute()}
                        disabled={runningMaintenanceCleanup || !canManageSensitiveActions}
                      >
                        {runningMaintenanceCleanup ? <Loader2 className="size-3 animate-spin" /> : null}
                        Maintenance cleanup execute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleArtifactsCleanupDryRunAll()}
                        disabled={runningArtifactsDryRunAll}
                      >
                        {runningArtifactsDryRunAll ? <Loader2 className="size-3 animate-spin" /> : null}
                        Artifacts cleanup dry-run all
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleArtifactsCleanupExecuteAll()}
                        disabled={runningArtifactsExecuteAll || !confirmArtifactsExecute || !canManageSensitiveActions}
                      >
                        {runningArtifactsExecuteAll ? <Loader2 className="size-3 animate-spin" /> : null}
                        Artifacts cleanup execute all
                      </Button>
                      <button
                        className={`inline-flex items-center gap-1 h-7 px-2 rounded-md border text-[11px] font-medium ${
                          confirmArtifactsExecute
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-background border-border text-muted-foreground hover:bg-muted'
                        }`}
                        onClick={() => setConfirmArtifactsExecute((v) => !v)}
                        title="Bez aktivního Confirm execute se execute all nespustí"
                      >
                        {confirmArtifactsExecute ? 'Confirm execute: ON' : 'Confirm execute: OFF'}
                      </button>
                      <span className="text-[10px] text-red-700">
                        Destruktivní akce: trvale maže artifacty
                      </span>
                      <div className="inline-flex items-center rounded-md border border-border overflow-hidden">
                        {(['queued', 'drafted', 'sent', 'failed'] as const).map((status) => (
                          <button
                            key={status}
                            className={`h-7 px-2 text-[11px] font-medium border-r border-border last:border-r-0 ${
                              outreachExportStatus === status
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted text-muted-foreground'
                            }`}
                            onClick={() => setOutreachExportStatus(status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleExportOutreachQueueCsv()}
                        disabled={exportingOutreachQueue || !canManageSensitiveActions}
                      >
                        {exportingOutreachQueue ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                        Export queue CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleSyncOutreachSent()}
                        disabled={syncingOutreachSent || !canManageSensitiveActions}
                      >
                        {syncingOutreachSent ? <Loader2 className="size-3 animate-spin" /> : null}
                        Sync sent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={handleOpenMailDrafts}
                      >
                        Otevřít drafty v Inboxu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleCreateOutreachDrafts()}
                        disabled={draftingOutreach || !canManageSensitiveActions}
                      >
                        {draftingOutreach ? <Loader2 className="size-3 animate-spin" /> : null}
                        Vytvořit drafty
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => void handleEnqueueLeadCandidates()}
                        disabled={enqueueingLeads || !canManageSensitiveActions}
                      >
                        {enqueueingLeads ? <Loader2 className="size-3 animate-spin" /> : null}
                        Zařadit do outreach queue
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Funnel 30d:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                      total: {outreachFunnel?.total ?? '-'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                      queued: {outreachFunnel?.queued ?? '-'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700">
                      drafted: {outreachFunnel?.drafted ?? '-'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                      sent: {outreachFunnel?.sent ?? '-'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700">
                      failed: {outreachFunnel?.failed ?? '-'}
                    </span>
                    {loadingOutreachFunnel && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Health:</span>
                    {outreachHealth ? (
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          outreachHealth.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {outreachHealth.ok ? 'OK' : `WARN (${outreachHealth.warnings.length})`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        -
                      </span>
                    )}
                    {loadingOutreachHealth && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                    {outreachHealth && outreachHealth.warnings.length > 0 && (
                      <span className="text-[10px] text-red-700">
                        {outreachHealth.warnings.slice(0, 2).join(' | ')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Last action:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                      {lastPanelAction
                        ? `${new Date(lastPanelAction.at).toLocaleString('cs-CZ')} · ${lastPanelAction.label}`
                        : '-'}
                    </span>
                    {lastPanelAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2"
                        onClick={() => void handleClearLastPanelAction()}
                      >
                        Clear last action
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Status snapshot:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                      {latestStatusSnapshot?.fileName ?? '-'}
                    </span>
                    {loadingStatusSnapshot && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Daily digest:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                      {latestDailyDigestSnapshot?.fileName ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Maintenance log:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                      {latestMaintenanceLog?.fileName ?? '-'}
                    </span>
                  </div>
                  {snapshotCleanupResult && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Snapshot cleanup:</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        {snapshotCleanupResult.dryRun ? 'dry-run' : 'execute'}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700">
                        scanned: {snapshotCleanupResult.scanned}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                        candidates: {snapshotCleanupResult.candidates}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                        deleted: {snapshotCleanupResult.deleted}
                      </span>
                    </div>
                  )}
                  {dailyDigestCleanupResult && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Digest cleanup:</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700">
                        scanned: {dailyDigestCleanupResult.scanned}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                        deleted: {dailyDigestCleanupResult.deleted}
                      </span>
                    </div>
                  )}
                  {maintenanceCleanupResult && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Maintenance cleanup:</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        {maintenanceCleanupResult.dryRun ? 'dry-run' : 'execute'}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                        candidates: {maintenanceCleanupResult.candidates}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                        deleted: {maintenanceCleanupResult.deleted}
                      </span>
                    </div>
                  )}
                  {artifactsDryRunSummary && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Artifacts dry-run summary:</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                        status: {artifactsDryRunSummary.statusCandidates}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700">
                        maintenance: {artifactsDryRunSummary.maintenanceCandidates}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                        total: {artifactsDryRunSummary.totalCandidates}
                      </span>
                    </div>
                  )}
                  {artifactsExecuteSummary && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Artifacts execute summary:</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                        status del: {artifactsExecuteSummary.statusDeleted}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700">
                        maintenance del: {artifactsExecuteSummary.maintenanceDeleted}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-violet-100 text-violet-700">
                        digest del: {artifactsExecuteSummary.digestDeleted}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                        total del: {artifactsExecuteSummary.totalDeleted}
                      </span>
                    </div>
                  )}
                  {artifactsExecuteAudit.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Artifacts execute audit (last 5):</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          onClick={() => void handleClearArtifactsExecuteAudit()}
                        >
                          Clear audit log
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {artifactsExecuteAudit.map((entry) => (
                          <span
                            key={`${entry.at}-${entry.totalDeleted}`}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                            title={`status:${entry.statusDeleted} maintenance:${entry.maintenanceDeleted} digest:${entry.digestDeleted}`}
                          >
                            {new Date(entry.at).toLocaleString('cs-CZ')} · del {entry.totalDeleted}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Top priority (10 %):</span>
                      <div className="inline-flex items-center rounded-md border border-border overflow-hidden">
                        {(['queued', 'drafted'] as const).map((status) => (
                          <button
                            key={status}
                            className={`h-6 px-2 text-[10px] font-medium border-r border-border last:border-r-0 ${
                              topPriorityStatus === status
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted text-muted-foreground'
                            }`}
                            onClick={() => setTopPriorityStatus(status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                      {loadingTopPriority && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                    </div>
                    {topPriorityItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {topPriorityItems.slice(0, 8).map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700"
                            title={`${item.subject} | ${item.contact_email ?? item.contact_phone ?? '-'} `}
                          >
                            {item.call_priority_score?.toFixed?.(1) ?? '-'} · {item.template_id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Žádná queued data</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="col-span-2 md:col-span-4 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Quick presets:</span>
                      <Button
                        size="sm"
                        variant={activeLeadPreset === 'acquisition_30d' ? 'default' : 'outline'}
                        className="h-6 text-[10px] px-2"
                        onClick={() => applyLeadPreset('acquisition_30d')}
                      >
                        Akvizice 30d
                      </Button>
                      <Button
                        size="sm"
                        variant={activeLeadPreset === 'urgent_only' ? 'default' : 'outline'}
                        className="h-6 text-[10px] px-2"
                        onClick={() => applyLeadPreset('urgent_only')}
                      >
                        Urgent only
                      </Button>
                      <Button
                        size="sm"
                        variant={activeLeadPreset === 'high_score_70' ? 'default' : 'outline'}
                        className="h-6 text-[10px] px-2"
                        onClick={() => applyLeadPreset('high_score_70')}
                      >
                        High score 70+
                      </Button>
                    </div>
                    <RangeFilter
                      label="Min score"
                      minVal={leadFilters.minCallPriorityScore}
                      maxVal={undefined}
                      onMinChange={(v) => setLeadFilters((prev) => ({ ...prev, minCallPriorityScore: v }))}
                      onMaxChange={() => undefined}
                    />
                    <RangeFilter
                      label="Min dny na trhu"
                      minVal={leadFilters.minDaysOnMarket}
                      maxVal={undefined}
                      onMinChange={(v) => setLeadFilters((prev) => ({ ...prev, minDaysOnMarket: v }))}
                      onMaxChange={() => undefined}
                    />
                    <RangeFilter
                      label="Min overprice %"
                      minVal={leadFilters.minOverpricePct}
                      maxVal={undefined}
                      onMinChange={(v) => setLeadFilters((prev) => ({ ...prev, minOverpricePct: v }))}
                      onMaxChange={() => undefined}
                    />
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Signály</label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          className={`h-7 px-2 rounded-md text-[11px] font-medium border transition-colors ${(leadFilters.onlyNoAgency ?? false) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                          onClick={() => setLeadFilters((prev) => ({ ...prev, onlyNoAgency: !(prev.onlyNoAgency ?? false) }))}
                        >
                          Bez RK
                        </button>
                        <button
                          className={`h-7 px-2 rounded-md text-[11px] font-medium border transition-colors ${(leadFilters.urgencyOnly ?? false) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                          onClick={() => setLeadFilters((prev) => ({ ...prev, urgencyOnly: !(prev.urgencyOnly ?? false) }))}
                        >
                          Urgence
                        </button>
                        <button
                          className={`h-7 px-2 rounded-md text-[11px] font-medium border transition-colors ${(leadFilters.weakPresentationOnly ?? false) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                          onClick={() => setLeadFilters((prev) => ({ ...prev, weakPresentationOnly: !(prev.weakPresentationOnly ?? false) }))}
                        >
                          Slabá prezentace
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Range filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <RangeFilter label="Cena (Kč)" minVal={filters.minPrice} maxVal={filters.maxPrice} onMinChange={(v) => updateFilter('minPrice', v)} onMaxChange={(v) => updateFilter('maxPrice', v)} />
                <RangeFilter label="Cena/m² (Kč)" minVal={filters.minPricePerM2} maxVal={filters.maxPricePerM2} onMinChange={(v) => updateFilter('minPricePerM2', v)} onMaxChange={(v) => updateFilter('maxPricePerM2', v)} />
                <RangeFilter label="Plocha (m²)" minVal={filters.minArea} maxVal={filters.maxArea} onMinChange={(v) => updateFilter('minArea', v)} onMaxChange={(v) => updateFilter('maxArea', v)} />
                <RangeFilter label="Dny na trhu" minVal={filters.minDaysOnMarket} maxVal={filters.maxDaysOnMarket} onMinChange={(v) => updateFilter('minDaysOnMarket', v)} onMaxChange={(v) => updateFilter('maxDaysOnMarket', v)} />
              </div>

              {/* Boolean filter groups */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {BOOLEAN_FILTER_GROUPS.map((group) => (
                  <div key={group.label} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{group.label}:</span>
                    {group.filters.map((f) => {
                      const active = (filters as Record<string, unknown>)[f.key] === true;
                      return (
                        <button
                          key={f.key}
                          className={`h-6 px-2 rounded-md text-[11px] font-medium border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                          onClick={() => toggleBoolFilter(f.key)}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                ))}
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
                    <th>Typ</th>
                    <th>Kategorie</th>
                    <th>Cena</th>
                    <th>m²</th>
                    <th>Lokalita</th>
                    <th>Přidáno</th>
                    {leadMode && <th>Score</th>}
                    {leadMode && <th>Band</th>}
                    {leadMode && <th>Důvody</th>}
                    {leadMode && <th>Guard</th>}
                    <th>CRM</th>
                  </tr>
                </thead>
                <tbody className="[&>tr]:border-b [&>tr]:border-border/70 [&>tr:last-child]:border-b-0">
                  {loading ? (
                    <tr>
                      <td colSpan={leadMode ? 12 : 8} className="px-3 py-10 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          Načítám data z databáze...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    listings.map((row) => {
                      const pct = priceChangePercent(row.originalPrice, row.currentPrice);

                      return (
                        <tr key={row.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2.5 pl-4 max-w-[420px]">
                            <div className="flex items-center gap-1.5 min-w-0 max-w-[420px]">
                              <Link to={`../reality/${row.id}`} className="font-medium text-foreground hover:text-primary block truncate">
                                {row.title}
                              </Link>
                              {row.sourceUrl && (
                                <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground hover:text-primary" title="Otevřít na Sreality.cz">
                                  <ExternalLink className="size-3.5" />
                                </a>
                              )}
                              {row.longUnsold && (
                                <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700" title="Déle než 90 dní na trhu">
                                  <Clock className="size-3 mr-0.5" />
                                  90+
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">{row.categoryType ?? '-'}</td>
                          <td className="px-3 py-2.5">{row.categoryMain ?? '-'}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <span className="font-medium whitespace-nowrap">{formatPrice(row.currentPrice)}</span>
                              {pct !== null && pct !== 0 && (
                                <span className={`text-xs font-medium ${pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {pct < 0 ? <ArrowDown className="inline size-3" /> : <ArrowUp className="inline size-3" />}
                                  {Math.abs(Math.round(pct))}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">{row.usableArea ?? '-'}</td>
                          <td className="px-3 py-2.5 max-w-[190px] truncate">{row.locality ?? '-'}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">{formatDate(row.firstSeenAt)}</td>
                          {leadMode && (
                            <td className="px-3 py-2.5 whitespace-nowrap font-semibold">
                              {row.scores?.callPriorityScore != null
                                ? row.scores.callPriorityScore.toFixed(1)
                                : '-'}
                            </td>
                          )}
                          {leadMode && (
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${row.leadSignals?.leadBand === 'A' ? 'bg-red-100 text-red-700' : row.leadSignals?.leadBand === 'B' ? 'bg-orange-100 text-orange-700' : row.leadSignals?.leadBand === 'C' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                                {row.leadSignals?.leadBand ?? '-'}
                              </span>
                            </td>
                          )}
                          {leadMode && (
                            <td className="px-3 py-2.5 max-w-[240px]">
                              <div className="flex flex-wrap gap-1">
                                {(row.leadSignals?.reasonCodes ?? []).slice(0, 3).map((code) => (
                                  <span key={code} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                                    {code}
                                  </span>
                                ))}
                                {(row.leadSignals?.reasonCodes?.length ?? 0) === 0 && (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </div>
                            </td>
                          )}
                          {leadMode && (
                            <td className="px-3 py-2.5 max-w-[220px]">
                              {row.leadSignals?.blockedForEnqueue ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                                  BLOCK
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                                  OK
                                </span>
                              )}
                            </td>
                          )}
                          <td className="px-3 py-2.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2 whitespace-nowrap"
                              disabled={importingLeadId === row.id || !canManageSensitiveActions}
                              onClick={() => void handleImportAsLead(row)}
                            >
                              {importingLeadId === row.id ? <Loader2 className="size-3 animate-spin" /> : '+ Lead'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {!loading && !loadError && listings.length === 0 && (
                    <tr>
                      <td colSpan={leadMode ? 12 : 8} className="px-3 py-8 text-center text-sm text-muted-foreground">Žádné záznamy</td>
                    </tr>
                  )}
                  {!loading && loadError && listings.length === 0 && (
                    <tr>
                      <td colSpan={leadMode ? 12 : 8} className="px-3 py-8 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-red-700">
                          Databáze není dostupná. Zkontroluj připojení k backend DB.
                        </div>
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

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={loadData}
        resumeSession={resumeSession}
        onResumeHandled={() => setResumeSession(null)}
      />
      <BezrealitkyImportDialog
        open={bezrealitkyImportOpen}
        onOpenChange={setBezrealitkyImportOpen}
        onSuccess={loadData}
      />
    </>
  );
}

// ==========================================
// Sub-components
// ==========================================

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
          <span
            className="ml-0.5 hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onChange(undefined); setOpen(false); }}
          >
            <X className="size-3" />
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px] max-h-64 overflow-y-auto">
            {value && (
              <button
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                onClick={() => { onChange(undefined); setOpen(false); }}
              >
                Vše ({label})
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${opt === value ? 'font-semibold text-primary' : 'text-foreground'}`}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RangeFilter({
  label,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  minVal?: number;
  maxVal?: number;
  onMinChange: (val: number | undefined) => void;
  onMaxChange: (val: number | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Od"
          value={minVal ?? ''}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
        />
        <span className="text-xs text-muted-foreground shrink-0">–</span>
        <input
          type="number"
          className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Do"
          value={maxVal ?? ''}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
    </div>
  );
}
