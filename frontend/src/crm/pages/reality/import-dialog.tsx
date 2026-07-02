import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Loader2, Zap, Database, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { scrapeReality, ScrapeResult, getScrapeProgress, ScrapeProgress } from '../../services/backend';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** When set, dialog auto-starts resuming this session */
  resumeSession?: ScrapeSession | null;
  onResumeHandled?: () => void;
}

const CATEGORY_MAIN = [
  { value: 1, label: 'Byty' },
  { value: 2, label: 'Domy' },
  { value: 3, label: 'Pozemky' },
  { value: 4, label: 'Komerční' },
  { value: 5, label: 'Ostatní' },
];

const CATEGORY_TYPE = [
  { value: 1, label: 'Prodej' },
  { value: 2, label: 'Pronájem' },
];

interface AggregatedResult {
  totalFound: number;
  pagesScraped: number;
  itemsScraped: number;
  scrapeErrors: number;
  created: number;
  updated: number;
  unchanged: number;
  importErrors: number;
}

const BATCH_SIZE = 20;
const FULL_BATCH_SIZE = 5;  // 5 pages × 60 estates, parallel detail fetch (5× concurrency) ≈ 12s per request
const MAX_RETRIES = 2;
const AUTO_RETRY_SECS = 20; // seconds before auto-resuming after network abort

const STORAGE_KEY = 'sreality-scrape-session';

// ── Persistent scrape session ──────────────────────────────────────────

export interface ScrapeSession {
  status: 'in_progress' | 'completed' | 'error';
  config: {
    mode: 'all' | 'both' | 'selected';
    scrapeMode: 'quick' | 'full';
    categoryMain: number;
    categoryType: number;
    maxPages: number;
    syncType: 'full' | 'delta';
  };
  combos: { cat: number; type: number }[];
  /** Index of current combo (category+type pair) */
  comboIndex: number;
  /** For infinite batching (maxPages=0): startPage within current combo */
  startPage: number;
  /** Per-combo start pages for resume — overrides startPage for individual combos */
  comboStartPages?: Record<number, number>;
  result: AggregatedResult;
  progress: string;
  startedAt: number;
  updatedAt: number;
  errorMessage?: string;
}

export function saveScrapeSession(session: ScrapeSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch { /* quota exceeded — ignore */ }
}

export function loadScrapeSession(): ScrapeSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ScrapeSession;
    // Discard sessions older than 24 hours
    if (Date.now() - session.updatedAt > 24 * 60 * 60 * 1000) {
      clearScrapeSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearScrapeSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ── Sreality totals (approx. — used only to detect which combos are incomplete) ──
const SREALITY_TOTALS: Record<string, number> = {
  'Byty_Prodej': 17521, 'Byty_Pronájem': 12331,
  'Domy_Prodej': 18537, 'Domy_Pronájem': 765,
  'Pozemky_Prodej': 26685, 'Pozemky_Pronájem': 491,
  'Komerční_Prodej': 4688, 'Komerční_Pronájem': 14861,
  'Ostatní_Prodej': 1243, 'Ostatní_Pronájem': 961,
};

const CAT_LABEL: Record<number, string> = { 1: 'Byty', 2: 'Domy', 3: 'Pozemky', 4: 'Komerční', 5: 'Ostatní' };
const TYPE_LABEL: Record<number, string> = { 1: 'Prodej', 2: 'Pronájem' };

/** Builds a resume session from live DB counts — works even if localStorage was wiped. */
function buildResumeSession(progress: ScrapeProgress[]): ScrapeSession | null {
  const dbCounts: Record<string, number> = {};
  let totalInDB = 0;
  for (const row of progress) {
    dbCounts[`${row.categoryMain}_${row.categoryType}`] = row.count;
    totalInDB += row.count;
  }

  // Same order as buildCombos('both')
  const allOrder = [
    { cat: 1, type: 1 }, { cat: 2, type: 1 }, { cat: 3, type: 1 }, { cat: 4, type: 1 }, { cat: 5, type: 1 },
    { cat: 1, type: 2 }, { cat: 2, type: 2 }, { cat: 3, type: 2 }, { cat: 4, type: 2 }, { cat: 5, type: 2 },
  ];

  const incompleteCombos: { cat: number; type: number }[] = [];
  const comboStartPages: Record<number, number> = {};

  for (const combo of allOrder) {
    const key = `${CAT_LABEL[combo.cat]}_${TYPE_LABEL[combo.type]}`;
    const count = dbCounts[key] ?? 0;
    const total = SREALITY_TOTALS[key] ?? 0;
    if (count < total) {
      comboStartPages[incompleteCombos.length] = Math.floor(count / 60) + 1;
      incompleteCombos.push(combo);
    }
  }

  if (incompleteCombos.length === 0) return null; // vše hotovo

  const first = incompleteCombos[0];
  const firstPage = comboStartPages[0];
  const label = `${TYPE_LABEL[first.type]} ${CAT_LABEL[first.cat]}`;

  return {
    status: 'in_progress',
    config: { mode: 'both', scrapeMode: 'full', categoryMain: 1, categoryType: 1, maxPages: 0, syncType: 'full' },
    combos: incompleteCombos,
    comboIndex: 0,
    startPage: firstPage,
    comboStartPages,
    result: {
      totalFound: 0, pagesScraped: 0, itemsScraped: totalInDB,
      scrapeErrors: 0, created: totalInDB, updated: 0, unchanged: 0, importErrors: 0,
    },
    progress: `Pokračování od DB — ${label} str. ${firstPage} (${totalInDB.toLocaleString('cs-CZ')} v DB)`,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ── Helpers ────────────────────────────────────────────────────────────

function aggregateResult(prev: AggregatedResult, res: ScrapeResult): AggregatedResult {
  return {
    totalFound: Math.max(prev.totalFound, res.scrape.totalFound),
    pagesScraped: prev.pagesScraped + res.scrape.pagesScraped,
    itemsScraped: prev.itemsScraped + res.scrape.itemsScraped,
    scrapeErrors: prev.scrapeErrors + res.scrape.scrapeErrors,
    created: prev.created + res.import.created,
    updated: prev.updated + res.import.updated,
    unchanged: prev.unchanged + res.import.unchanged,
    importErrors: prev.importErrors + res.import.errors,
  };
}

const EMPTY_AGG: AggregatedResult = {
  totalFound: 0, pagesScraped: 0, itemsScraped: 0, scrapeErrors: 0,
  created: 0, updated: 0, unchanged: 0, importErrors: 0,
};

function buildCombos(mode: 'all' | 'both' | 'selected', categoryMain: number, categoryType: number) {
  const combos: { cat: number; type: number }[] = [];
  if (mode === 'all') {
    for (const cat of CATEGORY_MAIN) combos.push({ cat: cat.value, type: categoryType });
  } else if (mode === 'both') {
    for (const type of CATEGORY_TYPE)
      for (const cat of CATEGORY_MAIN) combos.push({ cat: cat.value, type: type.value });
  } else {
    combos.push({ cat: categoryMain, type: categoryType });
  }
  return combos;
}

// ── Component ──────────────────────────────────────────────────────────

export function ImportDialog({ open, onOpenChange, onSuccess, resumeSession, onResumeHandled }: ImportDialogProps) {
  const [categoryMain, setCategoryMain] = useState(1);
  const [categoryType, setCategoryType] = useState(1);
  const [maxPages, setMaxPages] = useState(0);
  const [syncType, setSyncType] = useState<'full' | 'delta'>('full');
  const [scrapeMode, setScrapeMode] = useState<'quick' | 'full'>('quick');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<AggregatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingSession, setExistingSession] = useState<ScrapeSession | null>(null);
  const [showRestartGuard, setShowRestartGuard] = useState(false);
  const [loadingDbResume, setLoadingDbResume] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);
  const abortRef = useRef(false);
  const cancelAutoRetryRef = useRef(false);
  // Stable ref to resumeScrape — avoids stale closure in auto-retry effect
  const resumeScrapeRef = useRef<(session: ScrapeSession) => Promise<void>>(async () => {});

  const isQuick = scrapeMode === 'quick';

  // ── Core scrape loop (works for both fresh start and resume) ───────

  const runScrapeLoop = useCallback(async (
    combos: { cat: number; type: number }[],
    startComboIndex: number,
    initialStartPage: number,
    initialAgg: AggregatedResult,
    config: ScrapeSession['config'],
    comboStartPages?: Record<number, number>,
  ) => {
    const quick = config.scrapeMode === 'quick';
    const batch = quick ? BATCH_SIZE : FULL_BATCH_SIZE;
    const all = config.mode !== 'selected';
    let agg = { ...initialAgg };

    const session: ScrapeSession = {
      status: 'in_progress',
      config,
      combos,
      comboIndex: startComboIndex,
      startPage: initialStartPage,
      result: agg,
      progress: '',
      startedAt: loadScrapeSession()?.startedAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    setLoading(true);
    setError(null);
    abortRef.current = false;
    let networkAborted = false;

    try {
      for (let i = startComboIndex; i < combos.length; i++) {
        if (abortRef.current) break;
        const { cat, type } = combos[i];
        const catLabel = CATEGORY_MAIN.find((c) => c.value === cat)?.label ?? String(cat);
        const typeLabel = CATEGORY_TYPE.find((c) => c.value === type)?.label ?? '';
        const modeLabel = quick ? '' : ' [FULL]';

        if (config.maxPages > 0) {
          // Fixed page count mode
          const msg = `${typeLabel} ${catLabel}${all ? ` (${i + 1}/${combos.length})` : ''}${modeLabel}...`;
          setProgress(msg);

          session.comboIndex = i;
          session.startPage = 1;
          session.progress = msg;
          session.updatedAt = Date.now();
          saveScrapeSession(session);

          const res = await scrapeReality({
            categoryMain: cat,
            categoryType: type,
            maxPages: config.maxPages,
            startPage: 1,
            quick,
            syncType: config.syncType,
          });
          agg = aggregateResult(agg, res);
          setResult({ ...agg });

          session.result = agg;
          session.updatedAt = Date.now();
          saveScrapeSession(session);
        } else {
          // Infinite batching mode
          // comboStartPages overrides per-combo start; falls back to initialStartPage for the first combo
          let startPage = comboStartPages ? (comboStartPages[i] ?? 1) : (i === startComboIndex ? initialStartPage : 1);
          let totalFound = 0;
          let batchNum = Math.ceil((startPage - 1) / batch);
          let retries = 0;

           
          while (true) {
            if (abortRef.current) break;
            batchNum++;
            const fetched = agg.itemsScraped;
            const msg =
              `${typeLabel} ${catLabel}${all ? ` (${i + 1}/${combos.length})` : ''} — dávka ${batchNum}${modeLabel}` +
              (totalFound > 0 ? ` (${fetched.toLocaleString('cs-CZ')}/${totalFound.toLocaleString('cs-CZ')})` : '...');
            setProgress(msg);

            // Persist BEFORE the request so we can resume if page crashes mid-request
            session.comboIndex = i;
            session.startPage = startPage;
            session.progress = msg;
            session.result = agg;
            session.updatedAt = Date.now();
            saveScrapeSession(session);

            let res: ScrapeResult;
            try {
              res = await scrapeReality({
                categoryMain: cat,
                categoryType: type,
                maxPages: batch,
                startPage,
                quick,
                syncType: config.syncType,
              });
            } catch {
              // Backend returned 500 or network error — retry before giving up
              retries++;
              if (retries >= MAX_RETRIES) {
                networkAborted = true;
                abortRef.current = true;
                session.comboIndex = i;
                session.startPage = startPage;
                session.result = agg;
                session.updatedAt = Date.now();
                saveScrapeSession(session);
                break;
              }
              batchNum--; // vrátit zpět — zobrazí stejné číslo dávky při retryi
              await new Promise(r => setTimeout(r, 3000 * retries));
              continue;
            }

            agg = aggregateResult(agg, res);
            setResult({ ...agg });

            if (totalFound === 0) totalFound = res.scrape.totalFound;

            // Check for errors — retry before giving up
            if (res.scrape.scrapeErrors > 0) {
              retries++;
              if (retries >= MAX_RETRIES) {
                // Network error — stop entire scrape, preserve state for resume
                networkAborted = true;
                abortRef.current = true;
                session.comboIndex = i;
                session.startPage = startPage;
                session.result = agg;
                session.updatedAt = Date.now();
                saveScrapeSession(session); // status stays 'in_progress' → resume bude fungovat
                break;
              }
              // Retry same batch — don't advance startPage
              continue;
            }
            retries = 0;

            const done = res.scrape.pagesScraped === 0 || res.scrape.itemsScraped === 0;
            const nextStartPage = startPage + batch;
            const allFetched = (nextStartPage - 1) * 60 >= totalFound;

            // Persist AFTER success — save the NEXT startPage so resume skips completed work
            startPage = nextStartPage;
            session.startPage = done || allFetched ? 1 : startPage;
            session.result = agg;
            session.updatedAt = Date.now();
            saveScrapeSession(session);

            if (done || allFetched) break;
          }
        }
      }

      if (networkAborted) {
        // Výpadek sítě — session zůstává 'in_progress', uživatel může pokračovat
        setError('Scraping byl přerušen. Klikněte "Pokračovat" pro obnovení.');
        setExistingSession(loadScrapeSession());
      } else if (!abortRef.current) {
        // Přirozené dokončení (ne uživatelský abort)
        session.status = 'completed';
        session.updatedAt = Date.now();
        saveScrapeSession(session);
        onSuccess();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Chyba při scrapování';
      setError(msg);
      // Persist error so user can resume after refresh
      session.status = 'error';
      session.errorMessage = msg;
      session.updatedAt = Date.now();
      saveScrapeSession(session);
      setExistingSession({ ...session });
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, [onSuccess]);

  // ── Fresh scrape ───────────────────────────────────────────────────

  const handleScrape = async (mode: 'all' | 'both' | 'selected') => {
    setShowRestartGuard(false);
    const combos = buildCombos(mode, categoryMain, categoryType);
    const config: ScrapeSession['config'] = {
      mode, scrapeMode, categoryMain, categoryType, maxPages, syncType,
    };
    setResult(null);
    await runScrapeLoop(combos, 0, 1, { ...EMPTY_AGG }, config);
  };

  // ── Resume scrape ──────────────────────────────────────────────────

  const resumeScrape = useCallback(async (session: ScrapeSession) => {
    // Restore UI state from saved session
    setScrapeMode(session.config.scrapeMode);
    setCategoryMain(session.config.categoryMain);
    setCategoryType(session.config.categoryType);
    setMaxPages(session.config.maxPages);
    setSyncType(session.config.syncType);
    setResult({ ...session.result });

    await runScrapeLoop(
      session.combos,
      session.comboIndex,
      session.startPage,
      session.result,
      session.config,
      session.comboStartPages,
    );
  }, [runScrapeLoop]);

  // Keep ref always up to date (avoids stale closure in auto-retry effect)
  useEffect(() => { resumeScrapeRef.current = resumeScrape; }, [resumeScrape]);

  // Auto-retry after network abort — triggers only when loading stops with an active error
  // (error is null when dialog opens with a pre-existing localStorage session, so no false triggers)
  useEffect(() => {
    if (!loading && error && existingSession && existingSession.status === 'in_progress' && open) {
      cancelAutoRetryRef.current = false;
      let remaining = AUTO_RETRY_SECS;
      setAutoRetryCountdown(remaining);
      const capturedSession = existingSession;

      const tick = () => {
        if (cancelAutoRetryRef.current) {
          setAutoRetryCountdown(null);
          return;
        }
        remaining--;
        if (remaining <= 0) {
          setAutoRetryCountdown(null);
          setError(null);
          setExistingSession(null);
          resumeScrapeRef.current(capturedSession);
          return;
        }
        setAutoRetryCountdown(remaining);
        setTimeout(tick, 1000);
      };

      const timer = setTimeout(tick, 1000);
      return () => {
        cancelAutoRetryRef.current = true;
        clearTimeout(timer);
        setAutoRetryCountdown(null);
      };
    }
   
  }, [loading, error, existingSession, open]);

  // ── Resume from DB (vždy přesné — nezávisí na localStorage) ─────────

  const handleResumeFromDb = useCallback(async () => {
    setShowRestartGuard(false);
    setLoadingDbResume(true);
    setError(null);
    try {
      const progress = await getScrapeProgress();
      const session = buildResumeSession(progress);
      if (!session) {
        setError('DB je kompletní — všechny kategorie staženy. Stáhněte znovu pro aktualizaci.');
        return;
      }
      saveScrapeSession(session);
      setExistingSession(null);
      await resumeScrape(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chyba při načítání stavu DB');
    } finally {
      setLoadingDbResume(false);
    }
  }, [resumeScrape]);

  // Auto-resume when dialog opens with a resumeSession
  useEffect(() => {
    if (open && resumeSession && resumeSession.status !== 'completed' && !loading) {
      onResumeHandled?.();
      resumeScrape(resumeSession);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resumeSession]);

  // When dialog is opened manually (without resumeSession), detect any unfinished session
  useEffect(() => {
    if (open && !resumeSession) {
      const session = loadScrapeSession();
      if (session && session.status !== 'completed') {
        setExistingSession(session);
      }
    }
    if (!open) {
      setExistingSession(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Close handling ─────────────────────────────────────────────────

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && loading) {
      abortRef.current = true;
    }
    if (!nextOpen) {
      cancelAutoRetryRef.current = true;
      setAutoRetryCountdown(null);
      setResult(null);
      setError(null);
      setExistingSession(null);
      setShowRestartGuard(false);
    }
    onOpenChange(nextOpen);
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scrape Sreality</DialogTitle>
          <DialogDescription>
            Stáhne aktuální inzeráty přímo ze Sreality.cz a naimportuje je do databáze.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Existing unfinished session banner */}
          {existingSession && !loading && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-2">
              <p className="text-sm font-semibold text-amber-900">Nedokončené scrapování</p>
              <p className="text-xs text-amber-700">
                {existingSession.progress || 'Přerušeno'} — {existingSession.result.itemsScraped.toLocaleString('cs-CZ')} inzerátů zpracováno
                {existingSession.status === 'error' && existingSession.errorMessage && (
                  <span className="text-red-600 block mt-0.5">Chyba: {existingSession.errorMessage}</span>
                )}
              </p>
              {autoRetryCountdown !== null && (
                <p className="text-xs font-medium text-amber-800">
                  Automatické pokračování za {autoRetryCountdown}s...
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => {
                    cancelAutoRetryRef.current = true;
                    setAutoRetryCountdown(null);
                    const s = existingSession;
                    setExistingSession(null);
                    resumeScrape(s);
                  }}
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  Pokračovat
                </Button>
                {autoRetryCountdown !== null && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { cancelAutoRetryRef.current = true; setAutoRetryCountdown(null); }}
                  >
                    Zrušit auto
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    cancelAutoRetryRef.current = true;
                    setAutoRetryCountdown(null);
                    clearScrapeSession();
                    setExistingSession(null);
                  }}
                >
                  Začít znovu
                </Button>
              </div>
            </div>
          )}

          {/* Scrape mode - Quick vs Full */}
          <div>
            <label className="block text-sm font-medium mb-1">Režim scrapování</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${scrapeMode === 'quick' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                onClick={() => setScrapeMode('quick')}
                disabled={loading}
              >
                <Zap className={`size-5 ${scrapeMode === 'quick' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">Quick</p>
                  <p className="text-[11px] text-muted-foreground">Rychlý, základní data</p>
                </div>
              </button>
              <button
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${scrapeMode === 'full' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                onClick={() => setScrapeMode('full')}
                disabled={loading}
              >
                <Database className={`size-5 ${scrapeMode === 'full' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">Full</p>
                  <p className="text-[11px] text-muted-foreground">Vše: kontakt, popis, ...</p>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {isQuick
                ? 'Stáhne jen seznam inzerátů (název, cena, plocha, lokalita). Bez detailů, kontaktů a vlastností.'
                : 'Pro každý inzerát stáhne kompletní detail: popis, telefon, email, garáž, výtah, balkon, vlastnictví atd. Výrazně pomalejší.'}
            </p>
          </div>

          {/* Category main */}
          <div>
            <label className="block text-sm font-medium mb-1">Typ nemovitosti</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_MAIN.map((c) => (
                <Button
                  key={c.value}
                  size="sm"
                  variant={categoryMain === c.value ? 'default' : 'outline'}
                  onClick={() => setCategoryMain(c.value)}
                  disabled={loading}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Category type */}
          <div>
            <label className="block text-sm font-medium mb-1">Typ nabídky</label>
            <div className="flex gap-2">
              {CATEGORY_TYPE.map((c) => (
                <Button
                  key={c.value}
                  size="sm"
                  variant={categoryType === c.value ? 'default' : 'outline'}
                  onClick={() => setCategoryType(c.value)}
                  disabled={loading}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Max pages */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Rozsah stahování{maxPages > 0 ? ` (~${maxPages * 60} inzerátů na kategorii)` : ' (všechny inzeráty)'}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              <Button
                size="sm"
                variant={maxPages === 0 ? 'default' : 'outline'}
                onClick={() => setMaxPages(0)}
                disabled={loading}
              >
                Vše
              </Button>
              {[5, 10, 20, 50, 100].map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={maxPages === n ? 'default' : 'outline'}
                  onClick={() => setMaxPages(n)}
                  disabled={loading}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {/* Sync type */}
          <div>
            <label className="block text-sm font-medium mb-1">Typ synchronizace</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={syncType === 'full' ? 'default' : 'outline'}
                onClick={() => setSyncType('full')}
                disabled={loading}
              >
                Full sync
              </Button>
              <Button
                size="sm"
                variant={syncType === 'delta' ? 'default' : 'outline'}
                onClick={() => setSyncType('delta')}
                disabled={loading}
              >
                Delta sync
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {syncType === 'full'
                ? 'Vloží/aktualizuje data bez sledování změn.'
                : 'Detekuje změny cen a stavů, zapisuje historii.'}
            </p>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="space-y-2">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Stahuji: {progress}</span>
              </div>
              {result && result.totalFound > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((result.itemsScraped / result.totalFound) * 100))}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {result && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 space-y-2">
              <p className="font-medium">{loading ? 'Průběžné výsledky' : 'Scraping dokončen'}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span>Nalezeno na Sreality:</span>
                <span className="font-medium">{result.totalFound.toLocaleString('cs-CZ')}</span>
                <span>Stránek staženo:</span>
                <span className="font-medium">{result.pagesScraped}</span>
                <span>Zpracováno:</span>
                <span className="font-medium">{result.itemsScraped.toLocaleString('cs-CZ')}</span>
                <span>Vytvořeno nových:</span>
                <span className="font-medium">{result.created.toLocaleString('cs-CZ')}</span>
                <span>Aktualizováno:</span>
                <span className="font-medium">{result.updated.toLocaleString('cs-CZ')}</span>
                <span>Beze změny:</span>
                <span className="font-medium">{result.unchanged.toLocaleString('cs-CZ')}</span>
                {(result.scrapeErrors > 0 || result.importErrors > 0) && (
                  <>
                    <span className="text-red-600">Chyby:</span>
                    <span className="text-red-600 font-medium">
                      {result.scrapeErrors + result.importErrors}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">

          {/* Guard: zobrazí se místo přímého startu když klikneš na "Stáhnout vše" */}
          {showRestartGuard && !loading && (
            <div className="w-full rounded-md bg-amber-50 border border-amber-200 p-3 space-y-2">
              <p className="text-sm font-semibold text-amber-900">⚠️ Opravdu začít od začátku?</p>
              <p className="text-xs text-amber-700">
                DB má stažená data. Pokud chceš jen doplnit chybějící, použij <strong>Pokračovat od DB</strong> —
                zjistí aktuální stav databáze a pokračuje přesně tam, kde jsi skončil, bez ohledu na historii prohlížeče.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleResumeFromDb} disabled={loadingDbResume}>
                  {loadingDbResume ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <RotateCcw className="size-3.5 mr-1" />}
                  Pokračovat od DB
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleScrape('both')}>
                  Začít od začátku
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowRestartGuard(false)}>
                  Zrušit
                </Button>
              </div>
            </div>
          )}

          {/* Hlavní tlačítko — při Full módu zobrazí guard, jinak rovnou spustí */}
          {!showRestartGuard && (
            <>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  if (!isQuick) {
                    setShowRestartGuard(true);
                  } else {
                    void handleScrape('both');
                  }
                }}
                disabled={loading || loadingDbResume}
              >
                {loading || loadingDbResume ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {loading ? 'Stahuji...' : loadingDbResume ? 'Načítám stav DB...' : `Stáhnout vše (${isQuick ? 'Quick' : 'Full'})`}
              </Button>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleScrape('all')}
                  disabled={loading || loadingDbResume}
                >
                  <Download className="size-4" />
                  Jen {CATEGORY_TYPE.find((c) => c.value === categoryType)?.label}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleScrape('selected')}
                  disabled={loading || loadingDbResume}
                >
                  <Download className="size-4" />
                  Jen vybraný typ
                </Button>
              </div>
            </>
          )}

          {/* Vždy dostupné — pokračování přímo z DB bez ohledu na localStorage */}
          {!loading && !showRestartGuard && (
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={handleResumeFromDb}
              disabled={loadingDbResume}
            >
              {loadingDbResume ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <RotateCcw className="size-3.5 mr-1" />}
              Pokračovat od DB (zjistí pozici z databáze)
            </Button>
          )}

          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => handleClose(false)}>
              Zavřít
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
