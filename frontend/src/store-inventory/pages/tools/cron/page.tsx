import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Archive,
  CheckCircle2,
  Database,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchCronLogs,
  fetchRealityListings,
  fetchFirmyListings,
  type BackendCronLog,
  type BackendExternalListing,
  type BackendFirmyCzListing,
} from '@/crm/services/backend';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { logFrontendError } from '@/crm/services/frontend-logger';

type FirmyCronSummaryItem = {
  category: string;
  pagesScraped: number;
  newCount: number;
  errors: number;
  stopReason: string;
};

type CronCategoryDetail = {
  label: string;
  scraped?: number;
  refsTotal?: number;
  existingInDb?: number;
  newInBatch?: number;
  detailFetched?: number;
  skippedExisting?: number;
  touchedExisting?: number;
  created?: number;
  updated?: number;
  archived?: number;
  unchanged?: number;
  phase1Errors?: number;
  phase2Errors?: number;
  importErrors?: number;
  errors?: number;
  errorMessage?: string;
};

type AggregationPeriod = 'today' | 'yesterday' | 'dayBefore' | '7d' | 'week' | 'month';
type ListingMetricFilter = 'created' | 'updated' | 'archived' | 'unchanged';

const PERIOD_TABS: Array<{ key: AggregationPeriod; label: string }> = [
  { key: 'today', label: 'Dnes' },
  { key: 'yesterday', label: 'Včera' },
  { key: 'dayBefore', label: 'Předevčírem' },
  { key: '7d', label: '7 dní' },
  { key: 'week', label: 'Týden' },
  { key: 'month', label: 'Měsíc' },
];

type CategoryCellModalState = {
  open: boolean;
  categoryMain: string;
  categoryType: string;
  categoryLabel: string;
  count: number;
  auctionOnly?: boolean;
  metric: ListingMetricFilter;
};

const LISTING_METRIC_TABS: Array<{ key: ListingMetricFilter; label: string }> = [
  { key: 'created', label: 'Vytvořeno' },
  { key: 'updated', label: 'Aktualizováno' },
  { key: 'archived', label: 'Archivováno' },
  { key: 'unchanged', label: 'Beze změny' },
];

const LISTING_METRIC_LABEL: Record<ListingMetricFilter, string> = {
  created: 'Vytvořeno',
  updated: 'Aktualizováno',
  archived: 'Archivováno',
  unchanged: 'Beze změny',
};

const SUBCATEGORY_ROWS: Array<{ categoryMain: string; categoryType: string; label: string }> = [
  { categoryMain: 'Byty', categoryType: 'Prodej', label: 'Byty - prodej' },
  { categoryMain: 'Byty', categoryType: 'Pronájem', label: 'Byty - pronájem' },
  { categoryMain: 'Domy', categoryType: 'Prodej', label: 'Domy - prodej' },
  { categoryMain: 'Domy', categoryType: 'Pronájem', label: 'Domy - pronájem' },
  { categoryMain: 'Pozemky', categoryType: 'Prodej', label: 'Pozemky - prodej' },
  { categoryMain: 'Pozemky', categoryType: 'Pronájem', label: 'Pozemky - pronájem' },
  { categoryMain: 'Komerční', categoryType: 'Prodej', label: 'Komerční - prodej' },
  { categoryMain: 'Komerční', categoryType: 'Pronájem', label: 'Komerční - pronájem' },
  { categoryMain: 'Ostatní', categoryType: 'Prodej', label: 'Ostatní - prodej' },
  { categoryMain: 'Ostatní', categoryType: 'Pronájem', label: 'Ostatní - pronájem' },
  { categoryMain: 'Dražby', categoryType: 'Vše', label: 'Dražby - vše' },
];

function parseCategoryDetail(detail: string | null): CronCategoryDetail[] {
  if (!detail) return [];
  try {
    const parsed = JSON.parse(detail) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((item) => ({
        label: typeof item.label === 'string' ? item.label : 'N/A',
        scraped: typeof item.scraped === 'number' ? item.scraped : undefined,
        refsTotal: typeof item.refsTotal === 'number' ? item.refsTotal : undefined,
        existingInDb: typeof item.existingInDb === 'number' ? item.existingInDb : undefined,
        newInBatch: typeof item.newInBatch === 'number' ? item.newInBatch : undefined,
        detailFetched: typeof item.detailFetched === 'number' ? item.detailFetched : undefined,
        skippedExisting: typeof item.skippedExisting === 'number' ? item.skippedExisting : undefined,
        touchedExisting: typeof item.touchedExisting === 'number' ? item.touchedExisting : undefined,
        created: typeof item.created === 'number' ? item.created : undefined,
        updated: typeof item.updated === 'number' ? item.updated : undefined,
        archived: typeof item.archived === 'number' ? item.archived : undefined,
        unchanged: typeof item.unchanged === 'number' ? item.unchanged : undefined,
        phase1Errors: typeof item.phase1Errors === 'number' ? item.phase1Errors : undefined,
        phase2Errors: typeof item.phase2Errors === 'number' ? item.phase2Errors : undefined,
        importErrors: typeof item.importErrors === 'number' ? item.importErrors : undefined,
        errors: typeof item.errors === 'number' ? item.errors : undefined,
        errorMessage: typeof item.errorMessage === 'string' ? item.errorMessage : undefined,
      }));
  } catch {
    return [];
  }
}

function parseFirmyDetail(detail: string | null): FirmyCronSummaryItem[] {
  if (!detail) return [];
  try {
    const parsed = JSON.parse(detail) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];
    const obj = parsed as Record<string, unknown>;
    if (!Array.isArray(obj.summary)) return [];
    return obj.summary
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((item) => ({
        category: typeof item.category === 'string' ? item.category : '',
        pagesScraped: typeof item.pagesScraped === 'number' ? item.pagesScraped : 0,
        newCount: typeof item.newCount === 'number' ? item.newCount : 0,
        errors: typeof item.errors === 'number' ? item.errors : 0,
        stopReason: typeof item.stopReason === 'string' ? item.stopReason : '',
      }));
  } catch {
    return [];
  }
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCategoryPair(label: string): { categoryMain: string; categoryType: string } | null {
  const text = normalizeText(label);
  const categoryType = text.includes('pronajem')
    ? 'Pronájem'
    : text.includes('prodej')
      ? 'Prodej'
      : null;
  if (!categoryType) return null;

  if (text.includes('byt')) return { categoryMain: 'Byty', categoryType };
  if (text.includes('dom')) return { categoryMain: 'Domy', categoryType };
  if (text.includes('pozem')) return { categoryMain: 'Pozemky', categoryType };
  if (text.includes('ostat')) return { categoryMain: 'Ostatní', categoryType };
  if (text.includes('drazb')) return { categoryMain: 'Dražby', categoryType: 'Vše' };
  if (
    text.includes('komerc') ||
    text.includes('kancel') ||
    text.includes('hala') ||
    text.includes('sklad')
  ) {
    return { categoryMain: 'Komerční', categoryType };
  }

  return null;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('cs-CZ');
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function statusBadge(status: string) {
  if (status === 'success') {
    return (
      <Badge variant="outline" className="border-emerald-300 text-emerald-700">
        success
      </Badge>
    );
  }
  if (status === 'warning') {
    return (
      <Badge variant="outline" className="border-amber-300 text-amber-700">
        warning
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-red-300 text-red-700">
      {status || 'error'}
    </Badge>
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // monday start
  d.setDate(d.getDate() - diff);
  return d;
}

function matchesPeriod(input: string, period: AggregationPeriod, now = new Date()): boolean {
  const dt = new Date(input);
  if (Number.isNaN(dt.getTime())) return false;
  const check = startOfDay(dt).getTime();
  const today = startOfDay(now);

  if (period === 'today') return check === today.getTime();
  if (period === 'yesterday') {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return check === d.getTime();
  }
  if (period === 'dayBefore') {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    return check === d.getTime();
  }
  if (period === '7d') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return check >= d.getTime() && check <= today.getTime();
  }
  if (period === 'week') {
    const start = startOfWeek(today);
    return check >= start.getTime() && check <= today.getTime();
  }
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return check >= start.getTime() && check <= today.getTime();
}

function resolveListingStatus(
  item: BackendExternalListing,
  period: AggregationPeriod,
): { key: 'added' | 'updated' | 'archived' | 'unchanged'; label: string; className: string; icon: typeof PlusCircle } {
  const createdInPeriod = matchesPeriod(item.firstSeenAt, period);
  const touchedInPeriod = matchesPeriod(item.updatedAt, period) || matchesPeriod(item.lastSeenAt, period);
  const archivedInPeriod = (item.listingState || '').toUpperCase() !== 'ACTIVE' && touchedInPeriod;

  if (createdInPeriod) {
    return { key: 'added', label: 'Přidáno', className: 'text-emerald-700', icon: PlusCircle };
  }
  if (archivedInPeriod) {
    return { key: 'archived', label: 'Archivováno', className: 'text-amber-700', icon: Archive };
  }
  if (touchedInPeriod) {
    return { key: 'updated', label: 'Aktualizováno', className: 'text-sky-700', icon: RotateCcw };
  }
  return { key: 'unchanged', label: 'Beze změny', className: 'text-muted-foreground', icon: CheckCircle2 };
}

export function CronToolPage() {
  const REAL_CRON_JOB = 'reality-update';
  const [logs, setLogs] = useState<BackendCronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [period, setPeriod] = useState<AggregationPeriod>('today');
  const [metricFilter, setMetricFilter] = useState<ListingMetricFilter>('created');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [cellModal, setCellModal] = useState<CategoryCellModalState>({
    open: false,
    categoryMain: '',
    categoryType: '',
    categoryLabel: '',
    count: 0,
    auctionOnly: false,
    metric: 'created',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalListings, setModalListings] = useState<BackendExternalListing[]>([]);
  const [auctionPeriodCount, setAuctionPeriodCount] = useState(0);

  // ── Firmy.cz scraper stav ───────────────────────────────────────────
  const [firmyLogs, setFirmyLogs] = useState<BackendCronLog[]>([]);
  const [firmyCellModal, setFirmyCellModal] = useState<{
    open: boolean;
    category: string;
    label: string;
    count: number;
  }>({ open: false, category: '', label: '', count: 0 });
  const [firmyModalLoading, setFirmyModalLoading] = useState(false);
  const [firmyModalError, setFirmyModalError] = useState<string | null>(null);
  const [firmyModalListings, setFirmyModalListings] = useState<BackendFirmyCzListing[]>([]);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchCronLogs(120);
      const realCronRows = Array.isArray(data) ? data.filter((row) => row?.job === REAL_CRON_JOB) : [];
      setLogs(realCronRows);
      const firmyRows = Array.isArray(data) ? data.filter((row) => row?.job === 'firmy-scrape') : [];
      setFirmyLogs(firmyRows);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nepodařilo se načíst cron logy.';
      logFrontendError({
        area: 'tools-cron',
        message,
        meta: { scope: 'tools-cron:load' },
      });
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => {
      void load(true);
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const availableJobs = useMemo(() => [REAL_CRON_JOB], [REAL_CRON_JOB]);

  useEffect(() => {
    let cancelled = false;
    const loadAuctionCount = async () => {
      try {
        let count = 0;
        const pageSize = 200;
        for (let page = 1; page <= 10; page += 1) {
          const res = await fetchRealityListings({
            page,
            limit: pageSize,
            source: 'sreality',
            auction: true,
            sortBy: 'firstSeenAt',
            sortOrder: 'desc',
          });
          const items = Array.isArray(res?.data) ? res.data : [];
          for (const item of items) {
            if (matchesPeriod(item.firstSeenAt, period)) count += 1;
          }
          if (items.length < pageSize) break;
        }
        if (!cancelled) setAuctionPeriodCount(count);
      } catch {
        if (!cancelled) setAuctionPeriodCount(0);
      }
    };
    void loadAuctionCount();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const filteredLogs = useMemo(() => {
    if (jobFilter === 'all') return logs;
    return logs.filter((item) => item.job === jobFilter);
  }, [logs, jobFilter]);

  const summary = useMemo(() => {
    return filteredLogs.reduce(
      (acc, item) => {
        acc.runs += 1;
        acc.scraped += Number(item.scraped || 0);
        acc.created += Number(item.created || 0);
        acc.updated += Number(item.updated || 0);
        acc.errors += Number(item.errors || 0);
        if (item.status === 'success') acc.success += 1;
        if (item.status === 'error') acc.failed += 1;
        return acc;
      },
      { runs: 0, success: 0, failed: 0, scraped: 0, created: 0, updated: 0, errors: 0 },
    );
  }, [filteredLogs]);

  const categoryTable = useMemo(() => {
    const rows = new Map<
      string,
      {
        categoryMain: string;
        categoryType: string;
        label: string;
        created: number;
        updated: number;
        archived: number;
        unchanged: number;
      }
    >();
    for (const row of SUBCATEGORY_ROWS) {
      rows.set(`${row.categoryMain}|${row.categoryType}`, {
        categoryMain: row.categoryMain,
        categoryType: row.categoryType,
        label: row.label,
        created: 0,
        updated: 0,
        archived: 0,
        unchanged: 0,
      });
    }
    for (const log of filteredLogs) {
      if (!matchesPeriod(log.createdAt, period)) continue;
      const categories = parseCategoryDetail(log.detail);
      for (const cat of categories) {
        const parsed = parseCategoryPair(cat.label);
        if (!parsed) continue;
        const key = `${parsed.categoryMain}|${parsed.categoryType}`;
        const prev = rows.get(key) ?? {
          categoryMain: parsed.categoryMain,
          categoryType: parsed.categoryType,
          label: `${parsed.categoryMain} - ${parsed.categoryType.toLowerCase()}`,
          created: 0,
          updated: 0,
          archived: 0,
          unchanged: 0,
        };
        prev.created += Number(cat.created ?? 0);
        prev.updated += Number(cat.updated ?? 0);
        prev.archived += Number(cat.archived ?? 0);
        prev.unchanged += Number(cat.unchanged ?? 0);
        rows.set(key, prev);
      }
    }
    // Dražby nejsou samostatná cron kategorie — bereme je z již sečtených kategorií,
    // které přišly v detailu jako "dražba*".
    const auctionsKey = 'Dražby|Vše';
    const auctionsRow = rows.get(auctionsKey);
    if (auctionsRow) {
      auctionsRow.created = auctionPeriodCount;
      rows.set(auctionsKey, auctionsRow);
    }
    return Array.from(rows.values());
  }, [filteredLogs, period, auctionPeriodCount]);

  // ── Firmy category table ─────────────────────────────────────────────
  const firmyCategoryTable = useMemo(() => {
    const rows = new Map<string, { category: string; label: string; newCount: number; errors: number }>();
    for (const log of firmyLogs) {
      if (!matchesPeriod(log.createdAt, period)) continue;
      const items = parseFirmyDetail(log.detail);
      for (const item of items) {
        if (!item.category) continue;
        const prev = rows.get(item.category) ?? { category: item.category, label: item.category, newCount: 0, errors: 0 };
        prev.newCount += item.newCount;
        prev.errors += item.errors;
        rows.set(item.category, prev);
      }
    }
    return Array.from(rows.values()).sort((a, b) => b.newCount - a.newCount);
  }, [firmyLogs, period]);

  const firmySummary = useMemo(() => {
    return firmyLogs.reduce(
      (acc, item) => {
        acc.runs += 1;
        acc.created += Number(item.created || 0);
        acc.errors += Number(item.errors || 0);
        if (item.status === 'success' || item.status === 'warning') acc.success += 1;
        if (item.status === 'error') acc.failed += 1;
        return acc;
      },
      { runs: 0, success: 0, failed: 0, created: 0, errors: 0 },
    );
  }, [firmyLogs]);

  const loadFirmyCellListings = async (category: string, label: string, count: number) => {
    setFirmyCellModal({ open: true, category, label, count });
    setFirmyModalListings([]);
    setFirmyModalError(null);
    if (!count) return;
    setFirmyModalLoading(true);
    try {
      const pageSize = 200;
      const maxPages = Math.max(3, Math.min(10, Math.ceil(count / pageSize) + 2));
      const merged: BackendFirmyCzListing[] = [];
      const seen = new Set<string>();
      for (let page = 1; page <= maxPages; page += 1) {
        const res = await fetchFirmyListings({ page, limit: pageSize, category, sortBy: 'firstSeenAt', sortOrder: 'desc' });
        const items = Array.isArray(res?.data) ? res.data : [];
        for (const firm of items) {
          if (!matchesPeriod(firm.firstSeenAt, period)) continue;
          if (seen.has(firm.id)) continue;
          seen.add(firm.id);
          merged.push(firm);
          if (merged.length >= count) break;
        }
        if (merged.length >= count || items.length < pageSize) break;
      }
      setFirmyModalListings(merged.slice(0, count));
    } catch (err) {
      setFirmyModalError(err instanceof Error ? err.message : 'Nepodařilo se načíst seznam firem.');
    } finally {
      setFirmyModalLoading(false);
    }
  };

  const periodDateLabel = useMemo(() => {
    const now = new Date();
    if (period === 'today') return now.toLocaleDateString('cs-CZ');
    if (period === 'yesterday') {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      return d.toLocaleDateString('cs-CZ');
    }
    if (period === 'dayBefore') {
      const d = new Date(now);
      d.setDate(d.getDate() - 2);
      return d.toLocaleDateString('cs-CZ');
    }
    return '';
  }, [period]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadCellListings = async (payload: {
    categoryMain: string;
    categoryType: string;
    categoryLabel: string;
    count: number;
    auctionOnly?: boolean;
    metric: ListingMetricFilter;
  }) => {
    setCellModal({ open: true, ...payload });
    setModalListings([]);
    setModalError(null);
    if (!payload.count || payload.count <= 0) return;

    setModalLoading(true);
    try {
      const pageSize = 200;
      const wanted = payload.count;
      const maxPages = Math.max(3, Math.min(10, Math.ceil(wanted / pageSize) + 2));
      const merged: BackendExternalListing[] = [];
      const seen = new Set<string>();

      for (let page = 1; page <= maxPages; page += 1) {
        const res = await fetchRealityListings({
          page,
          limit: pageSize,
          source: 'sreality',
          categoryMain: payload.auctionOnly ? undefined : payload.categoryMain,
          categoryType: payload.auctionOnly ? undefined : payload.categoryType,
          auction: payload.auctionOnly ? true : undefined,
          sortBy: 'firstSeenAt',
          sortOrder: 'desc',
        });
        const items = Array.isArray(res?.data) ? res.data : [];
        for (const listing of items) {
          const listingStatus = resolveListingStatus(listing, period);
          const matchesMetric =
            (payload.metric === 'created' && listingStatus.key === 'added') ||
            (payload.metric === 'updated' && listingStatus.key === 'updated') ||
            (payload.metric === 'archived' && listingStatus.key === 'archived') ||
            (payload.metric === 'unchanged' && listingStatus.key === 'unchanged');
          if (!matchesMetric) continue;
          if (seen.has(listing.id)) continue;
          seen.add(listing.id);
          merged.push(listing);
          if (merged.length >= wanted) break;
        }
        if (merged.length >= wanted || items.length < pageSize) break;
      }

      setModalListings(merged.slice(0, wanted));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nepodařilo se načíst seznam inzerátů.';
      setModalError(message);
      logFrontendError({
        area: 'tools-cron',
        message,
        meta: {
          scope: 'tools-cron:cell-modal',
          categoryMain: payload.categoryMain,
          categoryType: payload.categoryType,
          period,
        },
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Cron monitoring
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailní audit běhů cronů: spuštění, nově nahrané inzeráty, aktualizace, chyby a změny po kategoriích.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                <option value="all">Všechny joby</option>
                {availableJobs.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void load(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Obnovit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 pt-0">
          <Badge variant="outline">Běhy: {summary.runs}</Badge>
          <Badge variant="outline" className="border-emerald-300 text-emerald-700">
            Success: {summary.success}
          </Badge>
          <Badge variant="outline" className="border-red-300 text-red-700">
            Error: {summary.failed}
          </Badge>
          <Badge variant="outline">Scraped: {summary.scraped}</Badge>
          <Badge variant="outline">Created: {summary.created}</Badge>
          <Badge variant="outline">Updated: {summary.updated}</Badge>
          <Badge variant="outline">Errors: {summary.errors}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {LISTING_METRIC_TABS.map((tab) => (
                <Button
                  key={tab.key}
                  type="button"
                  size="sm"
                  variant={metricFilter === tab.key ? 'default' : 'outline'}
                  onClick={() => setMetricFilter(tab.key)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{periodDateLabel || new Date().toLocaleDateString('cs-CZ')}</div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
              {PERIOD_TABS.map((tab) => (
                <Button
                  key={tab.key}
                  type="button"
                  size="sm"
                  variant={period === tab.key ? 'default' : 'outline'}
                  onClick={() => setPeriod(tab.key)}
                >
                  {tab.label}
                </Button>
              ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {categoryTable.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">Pro zvolené období nejsou dostupná data.</div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <table className="min-w-[760px] w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Podkategorie</th>
                    <th className="px-3 py-2 text-right">{LISTING_METRIC_LABEL[metricFilter]} inzerátů</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTable.map((row) => (
                    <tr key={`${row.categoryMain}-${row.categoryType}`} className="border-t">
                      <td className="px-3 py-2 font-medium">{row.label}</td>
                      <td className="px-3 py-2 text-right">
                        {(() => {
                          const count = metricFilter === 'created'
                            ? row.created
                            : metricFilter === 'updated'
                              ? row.updated
                              : metricFilter === 'archived'
                                ? row.archived
                                : row.unchanged;
                          return (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 font-semibold"
                          onClick={() =>
                            void loadCellListings({
                              categoryMain: row.categoryMain,
                              categoryType: row.categoryType,
                              categoryLabel: row.label,
                              count,
                              auctionOnly: row.categoryMain === 'Dražby',
                              metric: metricFilter,
                            })
                          }
                        >
                          {count}
                        </Button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30 font-semibold">
                    <td className="px-3 py-2">Celkem</td>
                    <td className="px-3 py-2 text-right">
                      {categoryTable.reduce(
                        (s, r) =>
                          s +
                          (metricFilter === 'created'
                            ? r.created
                            : metricFilter === 'updated'
                              ? r.updated
                              : metricFilter === 'archived'
                                ? r.archived
                                : r.unchanged),
                        0,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Firmy.cz Scraper sekce ─────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                Firmy.cz Scraper — cron statistiky
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Cron běží každé 2 hodiny — přírůstkový scraping firem dle kategorií.
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Běhy: {firmySummary.runs}</Badge>
            <Badge variant="outline" className="border-emerald-300 text-emerald-700">
              Success: {firmySummary.success}
            </Badge>
            <Badge variant="outline" className="border-red-300 text-red-700">
              Error: {firmySummary.failed}
            </Badge>
            <Badge variant="outline">Nové firmy: {firmySummary.created}</Badge>
            <Badge variant="outline">Chyby: {firmySummary.errors}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {firmyCategoryTable.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">Pro zvolené období nejsou data ze scrapperu firem.</div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <table className="min-w-[500px] w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Kategorie</th>
                    <th className="px-3 py-2 text-right">Nové firmy</th>
                    <th className="px-3 py-2 text-right">Chyby</th>
                  </tr>
                </thead>
                <tbody>
                  {firmyCategoryTable.map((row) => (
                    <tr key={row.category} className="border-t">
                      <td className="px-3 py-2 font-medium">{row.label}</td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 font-semibold text-emerald-700"
                          onClick={() => void loadFirmyCellListings(row.category, row.label, row.newCount)}
                        >
                          {row.newCount}
                        </Button>
                      </td>
                      <td className="px-3 py-2 text-right text-red-500">{row.errors || '—'}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30 font-semibold">
                    <td className="px-3 py-2">Celkem</td>
                    <td className="px-3 py-2 text-right">
                      {firmyCategoryTable.reduce((s, r) => s + r.newCount, 0)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {firmyCategoryTable.reduce((s, r) => s + r.errors, 0) || '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Firmy modal — seznam nových firem v kategorii */}
      <Dialog open={firmyCellModal.open} onOpenChange={(open) => setFirmyCellModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {firmyCellModal.label}: {firmyCellModal.count} nových firem
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {firmyModalLoading ? (
              <div className="py-6 text-sm text-muted-foreground">Načítám seznam firem…</div>
            ) : null}
            {!firmyModalLoading && firmyModalError ? (
              <div className="py-6 text-sm text-red-600">{firmyModalError}</div>
            ) : null}
            {!firmyModalLoading && !firmyModalError && firmyCellModal.count === 0 ? (
              <div className="py-6 text-sm text-muted-foreground">
                Pro tuto kategorii není v období žádná nová firma.
              </div>
            ) : null}
            {!firmyModalLoading && !firmyModalError && firmyCellModal.count > 0 ? (
              <div className="overflow-auto rounded-md border">
                <table className="min-w-[600px] w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Název firmy</th>
                      <th className="px-3 py-2 text-left">Město</th>
                      <th className="px-3 py-2 text-right">Odkazy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firmyModalListings.map((firm) => (
                      <tr key={firm.id} className="border-t">
                        <td className="px-3 py-2">{firm.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{firm.city ?? '—'}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-2">
                            {firm.sourceUrl ? (
                              <a
                                href={firm.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                                title="Otevřít na Firmy.cz"
                                aria-label="Otevřít na Firmy.cz"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : null}
                            <a
                              href={`/core/crm/firmy/${firm.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                              title="Otevřít v naší databázi"
                              aria-label="Otevřít v naší databázi"
                            >
                              <Database className="h-4 w-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {firmyModalListings.length < firmyCellModal.count ? (
                  <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                    Zobrazeno {firmyModalListings.length} z očekávaných {firmyCellModal.count} firem pro zvolené období.
                  </div>
                ) : null}
              </div>
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={cellModal.open} onOpenChange={(open) => setCellModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {cellModal.categoryLabel}: {cellModal.count} inzerátů ({LISTING_METRIC_LABEL[cellModal.metric]})
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {modalLoading ? (
              <div className="py-6 text-sm text-muted-foreground">Načítám odkazy inzerátů…</div>
            ) : null}
            {!modalLoading && modalError ? (
              <div className="py-6 text-sm text-red-600">{modalError}</div>
            ) : null}
            {!modalLoading && !modalError && cellModal.count === 0 ? (
              <div className="py-6 text-sm text-muted-foreground">
                Pro tuto podkategorii není v období žádný inzerát pro zvolený stav.
              </div>
            ) : null}
            {!modalLoading && !modalError && cellModal.count > 0 ? (
              <div className="overflow-auto rounded-md border">
                <table className="min-w-[760px] w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Název inzerátu</th>
                      <th className="px-3 py-2 text-left">Stav</th>
                      <th className="px-3 py-2 text-right">Odkazy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalListings.map((item) => {
                      const status = resolveListingStatus(item, period);
                      const StatusIcon = status.icon;
                      const srealityHref = item.sourceUrl && item.sourceUrl.trim().length > 0
                        ? item.sourceUrl
                        : `https://www.sreality.cz/detail/prodej/byt/x/x/${item.srealityId}`;
                      const dbHref = `/core/crm/reality/${item.id}`;
                      return (
                        <tr key={item.id} className="border-t">
                          <td className="px-3 py-2">{item.title || item.srealityId}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 ${status.className}`}>
                              <StatusIcon className="h-4 w-4" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={srealityHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                                title="Otevřít na Sreality"
                                aria-label="Otevřít na Sreality"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              <a
                                href={dbHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                                title="Otevřít v naší databázi"
                                aria-label="Otevřít v naší databázi"
                              >
                                <Database className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {modalListings.length < cellModal.count ? (
                  <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                    Zobrazeno {modalListings.length} z očekávaných {cellModal.count} položek pro zvolené období.
                  </div>
                ) : null}
              </div>
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {error ? (
        <Card>
          <CardContent className="py-6 text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      {loading && logs.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">Načítám cron logy…</CardContent>
        </Card>
      ) : null}

      {!loading && !error && filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Pro zvolený filtr nejsou dostupné žádné cron logy.
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const categories = parseCategoryDetail(log.detail);
          const expanded = Boolean(expandedIds[log.id]);
          return (
            <Card key={log.id} className="border">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{log.job}</Badge>
                    {statusBadge(log.status)}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3 w-3" />
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Doba běhu: {formatDuration(log.durationMs)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-6">
                  <div className="rounded-md border px-2 py-1"><span className="text-muted-foreground">Scraped:</span> {log.scraped}</div>
                  <div className="rounded-md border px-2 py-1"><span className="text-muted-foreground">Created:</span> {log.created}</div>
                  <div className="rounded-md border px-2 py-1"><span className="text-muted-foreground">Updated:</span> {log.updated}</div>
                  <div className="rounded-md border px-2 py-1"><span className="text-muted-foreground">Errors:</span> {log.errors}</div>
                  <div className="rounded-md border px-2 py-1">
                    <span className="text-muted-foreground">Stav:</span>{' '}
                    {log.status === 'success' ? <CheckCircle2 className="inline h-3 w-3 text-emerald-600" /> : <XCircle className="inline h-3 w-3 text-red-600" />}
                  </div>
                  <div className="rounded-md border px-2 py-1">
                    <span className="text-muted-foreground">Detail kategorií:</span> {categories.length}
                  </div>
                </div>

                {categories.length > 0 ? (
                  <Button variant="ghost" size="sm" className="gap-2 px-0" onClick={() => toggleExpanded(log.id)}>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {expanded ? 'Skrýt detail kategorií' : 'Zobrazit detail kategorií'}
                  </Button>
                ) : (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    Tento běh neobsahuje strukturovaný detail kategorií.
                  </p>
                )}

                {expanded && categories.length > 0 ? (
                  <div className="overflow-auto rounded-md border">
                    <table className="min-w-[1100px] w-full text-xs">
                      <thead className="bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-2 py-2 text-left">Kategorie</th>
                          <th className="px-2 py-2 text-right">Refs</th>
                          <th className="px-2 py-2 text-right">Existující</th>
                          <th className="px-2 py-2 text-right">Nové</th>
                          <th className="px-2 py-2 text-right">Detail fetched</th>
                          <th className="px-2 py-2 text-right">Skipped</th>
                          <th className="px-2 py-2 text-right">Touched</th>
                          <th className="px-2 py-2 text-right">Created</th>
                          <th className="px-2 py-2 text-right">Updated</th>
                          <th className="px-2 py-2 text-right">Archived</th>
                          <th className="px-2 py-2 text-right">Unchanged</th>
                          <th className="px-2 py-2 text-right">P1/P2/Import err</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat, index) => (
                          <tr key={`${log.id}-${cat.label}-${index}`} className="border-t">
                            <td className="px-2 py-2">{cat.label}</td>
                            <td className="px-2 py-2 text-right">{cat.refsTotal ?? cat.scraped ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.existingInDb ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.newInBatch ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.detailFetched ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.skippedExisting ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.touchedExisting ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.created ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.updated ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.archived ?? 0}</td>
                            <td className="px-2 py-2 text-right">{cat.unchanged ?? 0}</td>
                            <td className="px-2 py-2 text-right">
                              {(cat.phase1Errors ?? 0)}/{(cat.phase2Errors ?? 0)}/{(cat.importErrors ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
