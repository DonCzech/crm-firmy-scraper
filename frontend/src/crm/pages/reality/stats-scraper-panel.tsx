/**
 * StatsScraperPanel — spouštění vlastního scraperu statistik ze Sreality.cz
 *
 * Scraper prochází všechny kombinace kraj × kategorie × dispozice,
 * stáhne cenová data a uloží agregované statistiky (průměr/medián Kč/m²)
 * do SrealityAreaStats. Tyto statistiky pak slouží jako základ výpočtu cen.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BarChart2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logFrontendError } from '@/crm/services/frontend-logger';
import {
  startStatsScrape,
  getStatsScrapeStatus,
  getStatsScrapeData,
  type StatsScrapeStatus,
  type SrealityStatEntry,
} from '../../services/backend';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number | null | undefined, decimals = 0) {
  if (n == null) return '—';
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: decimals }).format(n);
}

function fmtCzk(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));
}

const DISPOSITIONS = ['1+kk','1+1','2+kk','2+1','3+kk','3+1','4+kk','4+1','5+kk','5+1','6+','atypický'];

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StatsScraperPanel({ onStatsLoaded, defaultOpen }: { onStatsLoaded?: () => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [status, setStatus] = useState<StatsScrapeStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Výsledné statistiky pro zobrazení
  const [stats, setStats] = useState<SrealityStatEntry[]>([]);
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsPage, setStatsPage] = useState(1);
  const [filterDisp, setFilterDisp] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  const loadStats = useCallback(async (page = 1) => {
    setStatsLoading(true);
    try {
      const res = await getStatsScrapeData({
        disposition: filterDisp || undefined,
        region: filterRegion || undefined,
        page,
        limit: 50,
      });
      setStats(res.data);
      setStatsTotal(res.meta?.total ?? 0);
      setStatsPage(page);
      onStatsLoaded?.();
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-stats-scraper-panel',
        message: error instanceof Error ? error.message : 'Failed to load scraped stats data',
        meta: { operation: 'load_stats_scrape_data' },
      });
    } finally {
      setStatsLoading(false);
    }
  }, [filterDisp, filterRegion, onStatsLoaded]);

  // Polling stavu scraper
  const poll = useCallback(async () => {
    try {
      const s = await getStatsScrapeStatus();
      setStatus(s);
      if (s.running || s.phase === 'saving') {
        pollRef.current = setTimeout(poll, 3000);
      } else if (s.phase === 'done') {
        toast.success(`Statistiky staženy: ${s.rowsSaved} záznamů uloženo`);
        await loadStats(1);
      }
    } catch (error) {
      logFrontendError({
        area: 'crm-reality-stats-scraper-panel',
        message: error instanceof Error ? error.message : 'Failed to poll stats scraper status',
        meta: { operation: 'poll_stats_scraper_status' },
      });
    }
  }, [loadStats]);

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearTimeout(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => {
    if (open) {
      poll();
      loadStats(1);
    }
    return stopPoll;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      const res = await startStatsScrape({ clearOld: true, categoryMains: [1, 2, 3], categoryTypes: [1] });
      if (!res.started) {
        toast.error(`Nepodařilo se spustit: ${res.error ?? 'Neznámá chyba'}`);
        return;
      }
      toast.info('Scraper statistik spuštěn na pozadí. Může trvat 5–15 minut.');
      stopPoll();
      pollRef.current = setTimeout(poll, 2000);
    } catch (err) {
      toast.error(`Chyba: ${err instanceof Error ? err.message : err}`);
    } finally {
      setStarting(false);
    }
  }, [poll, stopPoll]);

  const isRunning = status?.running || status?.phase === 'saving';
  const isDone = status?.phase === 'done';
  const isError = status?.phase === 'error';
  const hasStats = statsTotal > 0;

  const progressPct = status && status.combosTotal > 0
    ? Math.round((status.combosDone / status.combosTotal) * 100)
    : 0;

  return (
    <div className="border-b border-border">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <BarChart2 className="size-4 text-primary shrink-0" />
        <span className="text-sm font-semibold">Statistiky Sreality</span>
        <span className="text-[11px] text-muted-foreground">(vlastní scraper)</span>

        {isRunning && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
            <Loader2 className="size-3 animate-spin" />
            Probíhá — {progressPct}%
          </span>
        )}
        {isDone && hasStats && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
            <CheckCircle2 className="size-3" />
            {fmtNum(statsTotal)} statistik — {fmtDate(status?.finishedAt)}
          </span>
        )}
        {!isRunning && !isDone && hasStats && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
            <CheckCircle2 className="size-3" />
            {fmtNum(statsTotal)} statistik v DB
          </span>
        )}
        {!isRunning && !hasStats && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-medium">
            <AlertCircle className="size-3" />
            Žádná data — spusť scraper
          </span>
        )}
        {isError && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">
            <XCircle className="size-3" />
            Chyba
          </span>
        )}

        <span className="ml-auto text-muted-foreground">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {/* Expandable content */}
      {open && (
        <div className="px-4 pb-4 space-y-3 bg-muted/10">

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              size="sm"
              className="h-9"
              onClick={handleStart}
              disabled={starting || isRunning}
            >
              {starting || isRunning
                ? <><Loader2 className="size-3.5 animate-spin" /> Probíhá...</>
                : <><Play className="size-3.5" /> Spustit scraping statistik</>
              }
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-9"
              onClick={() => { poll(); loadStats(1); }}
              disabled={isRunning}
            >
              <RefreshCw className="size-3.5" />
              Obnovit
            </Button>

            <span className="text-xs text-muted-foreground">
              Stahuje: Byty + Domy + Pozemky / Prodej / všechny kraje
            </span>
          </div>

          {/* Co scraper dělá */}
          {!isRunning && !hasStats && (
            <div className="text-sm text-muted-foreground rounded-lg bg-muted/50 px-3 py-2.5 space-y-1">
              <p className="font-medium text-foreground">Jak to funguje?</p>
              <p>Scraper projde ~400 kombinací (14 krajů × kategorie × dispozice) na Sreality.cz a pro každou stáhne cenová data (3 stránky × 60 inzerátů). Z nich vypočítá průměr a medián ceny/m² a uloží do databáze.</p>
              <p>Tyto statistiky pak používá kalkulačka cen jako základ — jsou přesnější než hardcoded tabulky a zohledňují aktuální trh. Doporučujeme spouštět 1× týdně.</p>
            </div>
          )}

          {/* Progress */}
          {isRunning && status && (
            <div className="space-y-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 text-blue-600 animate-spin shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-blue-800 font-medium truncate">
                    {status.phase === 'saving' ? 'Ukládám výsledky do DB...' : status.current || 'Inicializuji...'}
                  </div>
                  <div className="text-xs text-blue-600 mt-0.5">
                    {status.combosDone} / {status.combosTotal} kombinací
                    {status.itemsCollected > 0 && ` · ${fmtNum(status.itemsCollected)} vzorků`}
                    {status.errors > 0 && ` · ${status.errors} chyb`}
                  </div>
                </div>
                <span className="text-sm font-semibold text-blue-700 shrink-0">{progressPct}%</span>
              </div>
              <ProgressBar value={status.combosDone} max={status.combosTotal} />
            </div>
          )}

          {/* Error */}
          {isError && status?.errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
              <strong>Chyba scraping:</strong> {status.errorMessage}
            </div>
          )}

          {/* Hotovo */}
          {isDone && status && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>
                Dokončeno {fmtDate(status.finishedAt)} — uloženo <strong>{status.rowsSaved}</strong> statistik
                {status.errors > 0 && <span className="text-amber-700"> ({status.errors} chyb)</span>}
              </span>
            </div>
          )}

          {/* Tabulka statistik */}
          {hasStats && (
            <>
              {/* Filtry */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="h-8 px-2 text-xs border border-border rounded-md bg-background"
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                >
                  <option value="">Všechny kraje</option>
                  {['Praha','Středočeský','Jihočeský','Plzeňský','Karlovarský','Ústecký','Liberecký',
                    'Královéhradecký','Pardubický','Vysočina','Jihomoravský','Olomoucký','Zlínský','Moravskoslezský'
                  ].map((r) => <option key={r}>{r}</option>)}
                </select>
                <select
                  className="h-8 px-2 text-xs border border-border rounded-md bg-background"
                  value={filterDisp}
                  onChange={(e) => setFilterDisp(e.target.value)}
                >
                  <option value="">Všechny dispozice</option>
                  {DISPOSITIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => loadStats(1)}>
                  Filtrovat
                </Button>
                {(filterRegion || filterDisp) && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => { setFilterRegion(''); setFilterDisp(''); }}
                  >
                    Vymazat
                  </button>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{fmtNum(statsTotal)} záznamů</span>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground border-b border-border">
                        <th>Kraj</th>
                        <th>Kategorie</th>
                        <th>Dispozice</th>
                        <th className="text-right">Počet</th>
                        <th className="text-right">Ø Kč/m²</th>
                        <th className="text-right">Medián Kč/m²</th>
                        <th className="text-right">Ø plocha</th>
                        <th className="text-right">Medián ceny</th>
                      </tr>
                    </thead>
                    <tbody className="[&>tr]:border-b [&>tr]:border-border/50 [&>tr:last-child]:border-b-0">
                      {statsLoading ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                            <Loader2 className="size-4 animate-spin inline" />
                          </td>
                        </tr>
                      ) : stats.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 max-w-[160px] truncate font-medium">{row.region ?? '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-muted-foreground">{row.categoryMain}</span>
                            <span className="text-[10px] text-muted-foreground/60 ml-1">{row.categoryType}</span>
                          </td>
                          <td className="px-3 py-2">{row.disposition ?? '—'}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmtNum(row.count)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmtNum(row.avgPricePerM2)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-medium text-primary">{fmtNum(row.medianPricePerM2)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmtNum(row.avgArea)} m²</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmtCzk(row.medianPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {statsTotal > 50 && (
                  <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
                    <span className="text-[11px] text-muted-foreground">
                      Strana {statsPage} / {Math.ceil(statsTotal / 50)}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={statsPage <= 1} onClick={() => loadStats(statsPage - 1)}>Předchozí</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={statsPage >= Math.ceil(statsTotal / 50)} onClick={() => loadStats(statsPage + 1)}>Další</Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
