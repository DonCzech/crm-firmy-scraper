/**
 * ApifyStatsPanel — sekce pro spouštění Apify sreality-statistics actoru
 * a zobrazení uložených výsledků.
 *
 * Použití: vložit do reality/page.tsx jako samostatnou sekci.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  RefreshCw,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import {
  runApifyScrape,
  getApifyRunStatus,
  importApifyResults,
  getApifyStats,
  getApifyInfo,
  clearApifyStats,
  type ApifyRunStatus,
  type ApifyStatRow,
  type ApifyInfo,
} from '../../services/backend';

// ─── Polling hook ────────────────────────────────────────────────────────────

function useApifyPoller(
  runId: string | null,
  token: string,
  onDone: (status: ApifyRunStatus) => void,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<ApifyRunStatus | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const poll = useCallback(async () => {
    if (!runId || !token) return;
    try {
      const s = await getApifyRunStatus(runId, token);
      setStatus(s);
      if (s.status === 'SUCCEEDED' || s.status === 'FAILED' || s.status === 'ABORTED' || s.status === 'TIMED-OUT') {
        onDone(s);
        return;
      }
    } catch {
      // ignore transient errors
    }
    timerRef.current = setTimeout(poll, 5000);
  }, [runId, token, onDone]);

  useEffect(() => {
    if (!runId) { stop(); return; }
    poll();
    return stop;
  }, [runId, poll, stop]);

  return { status, stop };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
}

function fmtNum(n: number | null | undefined, decimals = 0) {
  if (n == null) return '—';
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: decimals }).format(n);
}

function fmtCzk(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

const STATUS_LABEL: Record<string, string> = {
  READY: 'Čeká', RUNNING: 'Probíhá', SUCCEEDED: 'Dokončeno',
  FAILED: 'Chyba', ABORTED: 'Přerušeno', 'TIMED-OUT': 'Timeout',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ApifyStatsPanel({ onStatsLoaded }: { onStatsLoaded?: () => void }) {
  const { role, userId, canManageSensitiveActions } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('reality');
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('apify-token') ?? ''; } catch { return ''; }
  });
  const [runId, setRunId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [info, setInfo] = useState<ApifyInfo | null>(null);
  const [stats, setStats] = useState<ApifyStatRow[]>([]);
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsPage, setStatsPage] = useState(1);
  const [filterLocality, setFilterLocality] = useState('');
  const [filterDisp, setFilterDisp] = useState('');

  // Save token to localStorage
  const handleTokenChange = (v: string) => {
    setToken(v);
    try { localStorage.setItem('apify-token', v); } catch { /* ignore */ }
  };

  // Load meta info
  const loadInfo = useCallback(async () => {
    try {
      setInfo(await getApifyInfo());
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-apify-stats',
        message: error instanceof Error ? error.message : 'Failed to load Apify info',
        meta: { operation: 'load_apify_info' },
      });
    }
  }, []);

  // Load stats table
  const loadStats = useCallback(async (page = 1) => {
    setStatsLoading(true);
    try {
      const res = await getApifyStats({
        locality: filterLocality || undefined,
        disposition: filterDisp || undefined,
        page,
        limit: 50,
      });
      setStats(res.data);
      setStatsTotal(res.meta.total);
      setStatsPage(page);
      onStatsLoaded?.();
    } catch {
      toast.error('Nepodařilo se načíst statistiky');
    } finally {
      setStatsLoading(false);
    }
  }, [filterLocality, filterDisp, onStatsLoaded]);

  useEffect(() => {
    if (open) {
      loadInfo();
      loadStats(1);
    }
  }, [open, loadInfo, loadStats]);

  // Polling
  const handleRunDone = useCallback(async (status: ApifyRunStatus) => {
    setRunning(false);
    if (status.status !== 'SUCCEEDED') {
      const message = `Apify actor skončil se stavem: ${STATUS_LABEL[status.status] ?? status.status}`;
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_import',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta: { status: status.status, runId: status.runId },
      });
      return;
    }
    if (!status.defaultDatasetId) {
      const message = 'Apify actor neodevzdal dataset ID.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_import',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta: { status: status.status, runId: status.runId },
      });
      return;
    }
    // Auto-import
    setImporting(true);
    try {
      const res = await importApifyResults(status.runId, { token, datasetId: status.defaultDatasetId, clearOld: true });
      toast.success(`Importováno ${res.imported} statistik ze Sreality${res.errors > 0 ? ` (${res.errors} chyb)` : ''}`);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_import',
        result: 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        meta: { imported: res.imported, errors: res.errors, runId: status.runId },
      });
      await loadInfo();
      await loadStats(1);
    } catch (err) {
      const message = `Import selhal: ${err instanceof Error ? err.message : err}`;
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_import',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
        meta: { runId: status.runId },
      });
    } finally {
      setImporting(false);
    }
  }, [token, loadInfo, loadStats, role, userId]);

  const { status: pollStatus } = useApifyPoller(runId, token, handleRunDone);

  // Start scrape
  const handleRun = useCallback(async () => {
    if (!canManageSensitiveActions) {
      const message = 'Spuštění scrapingu je dostupné pouze pro role admin/manager.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_run',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
      });
      return;
    }
    if (!token) { toast.error('Zadej Apify token'); return; }
    setRunning(true);
    try {
      const res = await runApifyScrape(token);
      setRunId(res.runId);
      toast.info(`Apify spuštěn (ID: ${res.runId})`);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_run',
        result: 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        meta: { runId: res.runId },
      });
    } catch (err) {
      const message = `Spuštění selhalo: ${err instanceof Error ? err.message : err}`;
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_run',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
      });
      setRunning(false);
    }
  }, [canManageSensitiveActions, token, role, userId]);

  // Stop / cancel
  const handleCancel = useCallback(() => {
    setRunId(null);
    setRunning(false);
  }, []);

  // Clear stats
  const handleClear = useCallback(async () => {
    if (!canManageSensitiveActions) {
      const message = 'Mazání statistik je dostupné pouze pro role admin/manager.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_clear_stats',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
      });
      return;
    }
    if (!confirm('Opravdu smazat všechna uložená Apify statistická data?')) return;
    setClearing(true);
    try {
      const res = await clearApifyStats();
      toast.success(`Smazáno ${res.deleted} záznamů`);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_clear_stats',
        result: 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        meta: { deleted: res.deleted },
      });
      setStats([]);
      setStatsTotal(0);
      await loadInfo();
    } catch (err) {
      const message = `Mazání selhalo: ${err instanceof Error ? err.message : err}`;
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'reality',
        action: 'apify_clear_stats',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
      });
    } finally {
      setClearing(false);
    }
  }, [canManageSensitiveActions, loadInfo, role, userId]);

  const isActive = running || importing;
  const DISPOSITIONS = ['1+kk','1+1','2+kk','2+1','3+kk','3+1','4+kk','4+1','5+kk','5+1','6+','atypický'];

  return (
    <div className="border-b border-border">
      {/* Header row */}
      <button
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <BarChart2 className="size-4 text-primary shrink-0" />
        <span className="text-sm font-semibold">Sreality Statistics (Apify)</span>
        {info && info.count > 0 && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
            <CheckCircle2 className="size-3" />
            {fmtNum(info.count)} statistik — {fmtDate(info.scrapedAt)}
          </span>
        )}
        {info && info.count === 0 && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-medium">
            <AlertCircle className="size-3" />
            Žádná data
          </span>
        )}
        <span className="ml-auto text-muted-foreground">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 space-y-4 bg-muted/10">

          {/* Controls */}
          <div className="flex flex-wrap items-end gap-2 pt-2">
            <ObservabilityBadges
              frontendErrorCount24h={frontendErrorCount24h}
              sensitiveActions24hSummary={sensitiveActions24hSummary}
              compact
            />
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Apify API Token</label>
              <Input
                type="password"
                variant="sm"
                className="w-72 h-9"
                placeholder="apify_api_..."
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
              />
            </div>

            {!isActive ? (
              <Button
                size="sm"
                className="h-9"
                onClick={handleRun}
                disabled={!token || !canManageSensitiveActions}
              >
                <Play className="size-3.5" />
                Spustit scraping
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-9" onClick={handleCancel}>
                <X className="size-3.5" />
                Zrušit
              </Button>
            )}

            <Button size="sm" variant="outline" className="h-9" onClick={() => loadStats(1)} disabled={statsLoading}>
              <RefreshCw className={`size-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>

            {stats.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-destructive hover:bg-destructive/10"
                onClick={handleClear}
                disabled={clearing || !canManageSensitiveActions}
              >
                <Trash2 className="size-3.5" />
                {clearing ? 'Mažu...' : 'Smazat data'}
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          {isActive && (
            <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
              <Loader2 className="size-4 text-blue-600 animate-spin shrink-0" />
              <div className="text-sm text-blue-800">
                {importing
                  ? 'Importuji výsledky do databáze...'
                  : pollStatus
                  ? `Apify: ${STATUS_LABEL[pollStatus.status] ?? pollStatus.status} — ID: ${runId}`
                  : `Spouštím Apify actor...`}
              </div>
            </div>
          )}

          {/* Info box */}
          {!isActive && stats.length === 0 && (
            <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <Info className="size-4 mt-0.5 shrink-0" />
              <p>
                Apify actor <strong>bebich/sreality-statistics</strong> scrape agregovaná data cen z Sreality.cz.
                Výsledky se ukládají do databáze a slouží jako základ pro výpočet tržní ceny nemovitostí.
                Scraping spusť klepnutím na „Spustit scraping" — stačí 1× za týden.
              </p>
            </div>
          )}

          {/* Filter row */}
          {stats.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                variant="sm"
                className="w-44 h-8"
                placeholder="Lokalita..."
                value={filterLocality}
                onChange={(e) => setFilterLocality(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadStats(1)}
              />
              <select
                className="h-8 px-2 text-xs border border-border rounded-md bg-background"
                value={filterDisp}
                onChange={(e) => { setFilterDisp(e.target.value); }}
              >
                <option value="">Všechny dispozice</option>
                {DISPOSITIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => loadStats(1)}>Filtrovat</Button>
              {(filterLocality || filterDisp) && (
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => { setFilterLocality(''); setFilterDisp(''); }}>Vymazat filtry</button>
              )}
              <span className="ml-auto text-xs text-muted-foreground">{fmtNum(statsTotal)} záznamů</span>
            </div>
          )}

          {/* Stats table */}
          {stats.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground border-b border-border">
                      <th>Kraj / Okres / Lokalita</th>
                      <th>Typ</th>
                      <th>Dispozice</th>
                      <th className="text-right">Počet</th>
                      <th className="text-right">Ø Kč/m²</th>
                      <th className="text-right">Medián Kč/m²</th>
                      <th className="text-right">Ø plocha m²</th>
                      <th className="text-right">Ø cena</th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr]:border-b [&>tr]:border-border/50 [&>tr:last-child]:border-b-0">
                    {statsLoading ? (
                      <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                        <Loader2 className="size-4 animate-spin inline" />
                      </td></tr>
                    ) : stats.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 max-w-[220px] truncate">
                          <span className="text-muted-foreground">{[row.region, row.district].filter(Boolean).join(' / ')}</span>
                          {row.locality && <span className="ml-1 font-medium text-foreground">{row.locality}</span>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-muted-foreground">{row.categoryMain}</span>
                            <span className="text-[10px] text-muted-foreground/60">{row.categoryType}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2">{row.disposition ?? '—'}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmtNum(row.count)}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">{fmtNum(row.avgPricePerM2)}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium text-primary">{fmtNum(row.medianPricePerM2)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmtNum(row.avgArea, 0)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmtCzk(row.medianPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {statsTotal > 50 && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">Strana {statsPage} / {Math.ceil(statsTotal / 50)}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={statsPage <= 1} onClick={() => loadStats(statsPage - 1)}>Předchozí</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={statsPage >= Math.ceil(statsTotal / 50)} onClick={() => loadStats(statsPage + 1)}>Další</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
