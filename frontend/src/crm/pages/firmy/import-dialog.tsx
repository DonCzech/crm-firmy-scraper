import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Loader2, Zap, Database, RotateCcw, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { scrapeFirmy, discoverFirmyCategories, ScrapeResult } from '../../services/backend';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  resumeSession?: FirmyScrapeSession | FullFirmySession | null;
  onResumeHandled?: () => void;
}

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

const BATCH_SIZE = 20;       // quick mode: 20 pages per request
const FULL_BATCH_SIZE = 5;   // full mode: 5 pages per request (parallel detail fetch, fast)
const MAX_RETRIES = 2;
const AUTO_RETRY_SECS = 20;
const STORAGE_KEY = 'firmy-scrape-session';
const FULL_STORAGE_KEY = 'firmy-full-session';

// ── Known top-level firmy.cz categories ───────────────────────────────
const TOP_LEVEL_CATEGORIES = [
  'Auto-moto',
  'Cestovni-sluzby',
  'Restauracni-a-pohostinske-sluzby',
  'Elektro-mobily-a-pocitace',
  'Banky-a-financni-sluzby',
  'Instituce-a-urady',
  'Obchody-a-obchudky',
  'Remesla-a-sluzby',
  'Dum-byt-a-zahrada',
  'Prvni-pomoc-a-zdravotnictvi',
  'Vse-pro-firmy',
  'Velkoobchod-a-vyroba',
];

// ── Session persistence ────────────────────────────────────────────────

export interface FirmyScrapeSession {
  status: 'in_progress' | 'completed' | 'error';
  categoryPath: string;
  scrapeMode: 'quick' | 'full';
  maxPages: number;
  startPage: number;
  result: AggregatedResult;
  progress: string;
  startedAt: number;
  updatedAt: number;
  errorMessage?: string;
}

export interface FullFirmySession {
  status: 'in_progress' | 'completed';
  categoryQueue: string[];   // remaining categories to scrape
  currentCategoryIdx: number;
  totalCategories: number;
  scrapeMode: 'quick' | 'full';
  result: AggregatedResult;
  startedAt: number;
  updatedAt: number;
}

export function saveFirmyScrapeSession(session: FirmyScrapeSession) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch { /* ignore */ }
}
export function loadFirmyScrapeSession(): FirmyScrapeSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as FirmyScrapeSession;
    if (Date.now() - s.updatedAt > 24 * 60 * 60 * 1000) { clearFirmyScrapeSession(); return null; }
    return s;
  } catch { return null; }
}
export function clearFirmyScrapeSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function saveFullSession(s: FullFirmySession) {
  try { localStorage.setItem(FULL_STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
export function loadFullSession(): FullFirmySession | null {
  try {
    const raw = localStorage.getItem(FULL_STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as FullFirmySession;
    if (Date.now() - s.updatedAt > 7 * 24 * 60 * 60 * 1000) { clearFullSession(); return null; }
    return s;
  } catch { return null; }
}
export function clearFullSession() {
  try { localStorage.removeItem(FULL_STORAGE_KEY); } catch { /* ignore */ }
}

// ── Helpers ────────────────────────────────────────────────────────────

const EMPTY_AGG: AggregatedResult = {
  totalFound: 0, pagesScraped: 0, itemsScraped: 0, scrapeErrors: 0,
  created: 0, updated: 0, unchanged: 0, importErrors: 0,
};

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

// ── Component ──────────────────────────────────────────────────────────

export function FirmyImportDialog({ open, onOpenChange, onSuccess, resumeSession, onResumeHandled }: ImportDialogProps) {
  // Mode: 'category' = single category, 'full' = whole firmy.cz
  const [mode, setMode] = useState<'category' | 'full'>('category');

  // Category mode state
  const [categoryPath, setCategoryPath] = useState('');
  const [maxPages, setMaxPages] = useState(0);
  const [scrapeMode, setScrapeMode] = useState<'quick' | 'full'>('full');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<AggregatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingSession, setExistingSession] = useState<FirmyScrapeSession | null>(null);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);

  // Full mode state
  const [fullProgress, setFullProgress] = useState('');
  const [fullCategoryIdx, setFullCategoryIdx] = useState(0);
  const [fullTotalCategories, setFullTotalCategories] = useState(0);
  const [existingFullSession, setExistingFullSession] = useState<FullFirmySession | null>(null);

  const abortRef = useRef(false);
  const cancelAutoRetryRef = useRef(false);
  const resumeScrapeRef = useRef<(session: FirmyScrapeSession) => Promise<void>>(async () => {});
  const runFullFirmyModeRef = useRef<(session?: FullFirmySession) => Promise<void>>(async () => {});

  // ── Core category scrape loop ──────────────────────────────────────

  const runScrapeLoop = useCallback(async (
    catPath: string,
    startPage: number,
    initialAgg: AggregatedResult,
    sMode: 'quick' | 'full',
    maxPagesLimit: number,
  ): Promise<{ done: boolean; agg: AggregatedResult; networkAborted: boolean }> => {
    const quick = sMode === 'quick';
    const batch = quick ? BATCH_SIZE : FULL_BATCH_SIZE;
    const all = maxPagesLimit === 0;
    let agg = { ...initialAgg };
    let currentPage = startPage;
    let batchNum = Math.ceil((startPage - 1) / batch);
    let totalFound = 0;
    let retries = 0;
    let networkAborted = false;

    const session: FirmyScrapeSession = {
      status: 'in_progress',
      categoryPath: catPath,
      scrapeMode: sMode,
      maxPages: maxPagesLimit,
      startPage,
      result: agg,
      progress: '',
      startedAt: loadFirmyScrapeSession()?.startedAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    try {
      while (true) {
        if (abortRef.current) break;

        batchNum++;
        const pagesToFetch = all ? batch : Math.min(batch, maxPagesLimit - (currentPage - 1));
        if (pagesToFetch <= 0) break;

        const msg =
          `${catPath} — dávka ${batchNum}${quick ? '' : ' [FULL]'}` +
          (totalFound > 0 ? ` (${agg.itemsScraped.toLocaleString('cs-CZ')}/${totalFound.toLocaleString('cs-CZ')})` : '...');

        setProgress(msg);
        session.startPage = currentPage;
        session.progress = msg;
        session.result = agg;
        session.updatedAt = Date.now();
        saveFirmyScrapeSession(session);

        let res: ScrapeResult;
        try {
          res = await scrapeFirmy({
            categoryPath: catPath,
            maxPages: pagesToFetch,
            startPage: currentPage,
            quick,
          });
        } catch {
          retries++;
          if (retries >= MAX_RETRIES) { networkAborted = true; break; }
          batchNum--;
          await new Promise(r => setTimeout(r, 3000 * retries));
          continue;
        }

        agg = aggregateResult(agg, res);
        setResult({ ...agg });

        if (totalFound === 0) totalFound = res.scrape.totalFound;

        if (res.scrape.scrapeErrors > 0) {
          retries++;
          if (retries >= MAX_RETRIES) { networkAborted = true; break; }
          continue;
        }
        retries = 0;

        const done = res.scrape.pagesScraped === 0 || res.scrape.itemsScraped === 0;
        const nextPage = currentPage + pagesToFetch;
        const allFetched = totalFound > 0 && (nextPage - 1) * 15 >= totalFound;

        currentPage = nextPage;
        session.startPage = done || allFetched ? 1 : currentPage;
        session.result = agg;
        session.updatedAt = Date.now();
        saveFirmyScrapeSession(session);

        if (done || allFetched) break;
        if (!all) break;
      }
    } catch {
      networkAborted = true;
    }

    return { done: !networkAborted && !abortRef.current, agg, networkAborted };
  }, []);

  // ── Single-category scrape ─────────────────────────────────────────

  const runCategoryMode = useCallback(async (
    catPath: string,
    startPage: number,
    initialAgg: AggregatedResult,
    sMode: 'quick' | 'full',
    maxPagesLimit: number,
  ) => {
    setLoading(true);
    setError(null);
    abortRef.current = false;

    const session: FirmyScrapeSession = {
      status: 'in_progress',
      categoryPath: catPath,
      scrapeMode: sMode,
      maxPages: maxPagesLimit,
      startPage,
      result: initialAgg,
      progress: '',
      startedAt: loadFirmyScrapeSession()?.startedAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    saveFirmyScrapeSession(session);

    try {
      const { agg, networkAborted } = await runScrapeLoop(catPath, startPage, initialAgg, sMode, maxPagesLimit);
      if (networkAborted) {
        setError('Scraping byl přerušen. Klikněte "Pokračovat" pro obnovení.');
        setExistingSession(loadFirmyScrapeSession());
      } else if (!abortRef.current) {
        session.status = 'completed';
        session.result = agg;
        session.updatedAt = Date.now();
        saveFirmyScrapeSession(session);
        onSuccess();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Chyba';
      setError(msg);
      session.status = 'error';
      session.errorMessage = msg;
      session.updatedAt = Date.now();
      saveFirmyScrapeSession(session);
      setExistingSession({ ...session });
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, [runScrapeLoop, onSuccess]);

  // ── Full firmy.cz scrape ───────────────────────────────────────────

  const runFullFirmyMode = useCallback(async (
    startFromSession?: FullFirmySession,
  ) => {
    setLoading(true);
    setError(null);
    abortRef.current = false;

    let categoryQueue: string[];
    let categoryIdx: number;
    let totalCategories: number;
    let agg: AggregatedResult;
    let lastSavedIdx: number;

    if (startFromSession) {
      categoryQueue = startFromSession.categoryQueue;
      categoryIdx = startFromSession.currentCategoryIdx;
      totalCategories = startFromSession.totalCategories;
      agg = startFromSession.result;
      lastSavedIdx = categoryIdx;
      setResult({ ...agg });
    } else {
      // Discover all categories: top-level → subcategories
      setFullProgress('Zjišťuji kategorie z Firmy.cz...');
      setFullCategoryIdx(0);
      setFullTotalCategories(0);

      try {
        const allCategories: string[] = [];

        for (const topCat of TOP_LEVEL_CATEGORIES) {
          if (abortRef.current) break;
          setFullProgress(`Prozkoumávám ${topCat}...`);
          const subs = await discoverFirmyCategories(topCat);
          if (subs.length > 0) {
            allCategories.push(...subs.map(s => s.path));
          } else {
            // No subcategories – scrape the top-level directly
            allCategories.push(topCat);
          }
          await new Promise(r => setTimeout(r, 300));
        }

        categoryQueue = allCategories;
        categoryIdx = 0;
        totalCategories = allCategories.length;
        agg = { ...EMPTY_AGG };
        lastSavedIdx = 0;
      } catch (e) {
        setError('Nepodařilo se zjistit kategorie: ' + (e instanceof Error ? e.message : String(e)));
        setLoading(false);
        return;
      }
    }

    const session: FullFirmySession = {
      status: 'in_progress',
      categoryQueue,
      currentCategoryIdx: categoryIdx,
      totalCategories,
      scrapeMode: scrapeMode,
      result: agg,
      startedAt: startFromSession?.startedAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    saveFullSession(session);

    setFullTotalCategories(totalCategories);

    try {
      for (let i = categoryIdx; i < categoryQueue.length; i++) {
        if (abortRef.current) break;

        const catPath = categoryQueue[i];
        setFullCategoryIdx(i + 1);
        setFullProgress(`${catPath} (${i + 1}/${totalCategories})`);

        session.currentCategoryIdx = i;
        session.result = agg;
        session.updatedAt = Date.now();
        saveFullSession(session);
        lastSavedIdx = i;

        const { done, agg: newAgg, networkAborted } = await runScrapeLoop(catPath, 1, { ...EMPTY_AGG }, scrapeMode, 0);
        agg = {
          totalFound: agg.totalFound,
          pagesScraped: agg.pagesScraped + newAgg.pagesScraped,
          itemsScraped: agg.itemsScraped + newAgg.itemsScraped,
          scrapeErrors: agg.scrapeErrors + newAgg.scrapeErrors,
          created: agg.created + newAgg.created,
          updated: agg.updated + newAgg.updated,
          unchanged: agg.unchanged + newAgg.unchanged,
          importErrors: agg.importErrors + newAgg.importErrors,
        };
        setResult({ ...agg });

        if (networkAborted) {
          // Network abort inside a category — break the outer loop, preserve session for resume
          abortRef.current = true;
          break;
        }

        if (done) {
          // Kategorie úspěšně dokončena – posuneme index, aby se neopakovala při resume
          lastSavedIdx = i + 1;
          session.currentCategoryIdx = i + 1;
          session.result = agg;
          session.updatedAt = Date.now();
          saveFullSession(session);
        }
      }

      if (!abortRef.current) {
        session.status = 'completed';
        session.updatedAt = Date.now();
        saveFullSession(session);
        clearFullSession();
        clearFirmyScrapeSession(); // vyčistit i single-category session
        onSuccess();
      } else {
        session.result = agg;
        session.currentCategoryIdx = lastSavedIdx;
        session.updatedAt = Date.now();
        saveFullSession(session);
        setExistingFullSession({ ...session });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chyba při scrapování');
    } finally {
      setLoading(false);
      setFullProgress('');
      setProgress('');
    }
  }, [runScrapeLoop, scrapeMode, onSuccess]);

  // ── Handlers ──────────────────────────────────────────────────────

  const handleCategoryScrape = async () => {
    if (!categoryPath.trim()) { setError('Zadejte kategorii'); return; }
    clearFirmyScrapeSession();
    setResult(null);
    setError(null);
    await runCategoryMode(categoryPath.trim(), 1, { ...EMPTY_AGG }, scrapeMode, maxPages);
  };

  const handleFullScrape = async () => {
    clearFirmyScrapeSession();
    clearFullSession();
    setResult(null);
    setError(null);
    setExistingFullSession(null);
    await runFullFirmyMode();
  };

  const resumeScrape = useCallback(async (session: FirmyScrapeSession) => {
    setCategoryPath(session.categoryPath);
    setScrapeMode(session.scrapeMode);
    setMaxPages(session.maxPages);
    setResult({ ...session.result });
    await runCategoryMode(session.categoryPath, session.startPage, session.result, session.scrapeMode, session.maxPages);
  }, [runCategoryMode]);

  useEffect(() => { resumeScrapeRef.current = resumeScrape; }, [resumeScrape]);
  useEffect(() => { runFullFirmyModeRef.current = runFullFirmyMode; }, [runFullFirmyMode]);

  // Auto-start when parent passes a resumeSession (e.g. on page load auto-resume)
  useEffect(() => {
    if (!open || !resumeSession) return;
    if ('categoryPath' in resumeSession) {
      setMode('category');
      setCategoryPath(resumeSession.categoryPath);
      setScrapeMode(resumeSession.scrapeMode);
      setMaxPages(resumeSession.maxPages);
      setResult({ ...resumeSession.result });
      setExistingSession(null);
      void resumeScrapeRef.current(resumeSession);
    } else {
      setMode('full');
      setResult({ ...resumeSession.result });
      setExistingFullSession(null);
      void runFullFirmyModeRef.current(resumeSession);
    }
    onResumeHandled?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resumeSession]);

  // Auto-retry after network abort (category mode)
  useEffect(() => {
    if (!loading && error && existingSession && existingSession.status === 'in_progress' && open) {
      cancelAutoRetryRef.current = false;
      let remaining = AUTO_RETRY_SECS;
      setAutoRetryCountdown(remaining);
      const capturedSession = existingSession;
      const tick = () => {
        if (cancelAutoRetryRef.current) { setAutoRetryCountdown(null); return; }
        remaining--;
        if (remaining <= 0) {
          setAutoRetryCountdown(null); setError(null); setExistingSession(null);
          resumeScrapeRef.current(capturedSession); return;
        }
        setAutoRetryCountdown(remaining);
        setTimeout(tick, 1000);
      };
      const timer = setTimeout(tick, 1000);
      return () => { cancelAutoRetryRef.current = true; clearTimeout(timer); setAutoRetryCountdown(null); };
    }
   
  }, [loading, error, existingSession, open]);

  // Detect unfinished sessions when dialog opens
  useEffect(() => {
    if (open) {
      const session = loadFirmyScrapeSession();
      if (session && session.status !== 'completed') {
        setExistingSession(session); setCategoryPath(session.categoryPath);
      }
      const fullSession = loadFullSession();
      if (fullSession && fullSession.status !== 'completed') {
        setExistingFullSession(fullSession);
        setMode('full');
      }
    }
    if (!open) { setExistingSession(null); setExistingFullSession(null); }
   
  }, [open]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && loading) abortRef.current = true;
    if (!nextOpen) {
      cancelAutoRetryRef.current = true;
      setAutoRetryCountdown(null);
      setResult(null); setError(null);
      setExistingSession(null); setExistingFullSession(null);
    }
    onOpenChange(nextOpen);
  };

  const isQuick = scrapeMode === 'quick';

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scrape Firmy.cz</DialogTitle>
          <DialogDescription>
            Stáhněte firmy z konkrétní kategorie nebo celé Firmy.cz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Mode switch */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-colors ${mode === 'category' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
              onClick={() => setMode('category')} disabled={loading}
            >
              <Database className={`size-4 ${mode === 'category' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">Kategorie</p>
                <p className="text-[11px] text-muted-foreground">Jedna kategorie</p>
              </div>
            </button>
            <button
              className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-colors ${mode === 'full' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
              onClick={() => setMode('full')} disabled={loading}
            >
              <Globe className={`size-4 ${mode === 'full' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">Celé Firmy.cz</p>
                <p className="text-[11px] text-muted-foreground">Všechny kategorie</p>
              </div>
            </button>
          </div>

          {/* ── CATEGORY MODE ── */}
          {mode === 'category' && (
            <>
              {/* Unfinished session banner */}
              {existingSession && !loading && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-2">
                  <p className="text-sm font-semibold text-amber-900">Nedokončené scrapování</p>
                  <p className="text-xs text-amber-700">
                    <strong>{existingSession.categoryPath}</strong> — {existingSession.result.itemsScraped.toLocaleString('cs-CZ')} firem staženo
                  </p>
                  {autoRetryCountdown !== null && (
                    <p className="text-xs font-medium text-amber-800">Automatické pokračování za {autoRetryCountdown}s...</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => {
                      cancelAutoRetryRef.current = true; setAutoRetryCountdown(null);
                      const s = existingSession; setExistingSession(null); resumeScrape(s);
                    }}>
                      <RotateCcw className="size-3.5 mr-1" /> Pokračovat
                    </Button>
                    {autoRetryCountdown !== null && (
                      <Button size="sm" variant="outline" onClick={() => { cancelAutoRetryRef.current = true; setAutoRetryCountdown(null); }}>
                        Zrušit auto
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => {
                      cancelAutoRetryRef.current = true; setAutoRetryCountdown(null);
                      clearFirmyScrapeSession(); setExistingSession(null);
                    }}>Začít znovu</Button>
                  </div>
                </div>
              )}

              {/* Category input */}
              <div>
                <label className="block text-sm font-medium mb-1">Kategorie / URL cesta</label>
                <Input
                  placeholder="např. Remesla-a-sluzby/Stavebni-sluzby/Projektove-prace/Architekti"
                  value={categoryPath}
                  onChange={(e) => setCategoryPath(e.target.value)}
                  disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Výsledná URL: <code className="bg-muted px-1 rounded text-[10px]">firmy.cz/{categoryPath || '…'}</code>
                </p>
              </div>

              {/* Quick shortcuts */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Architekti', path: 'Remesla-a-sluzby/Stavebni-sluzby/Projektove-prace/Architekti' },
                  { label: 'Advokáti', path: 'Remesla-a-sluzby/Pravni-sluzby/Advokatni-kancelare' },
                  { label: 'Restaurace', path: 'Restauracni-a-pohostinske-sluzby/Restaurace' },
                  { label: 'Autoservisy', path: 'Auto-moto/Auto-moto-sluzby/Autoservisy' },
                  { label: 'Elektrikáři', path: 'Remesla-a-sluzby/Remesla/Elektrikarstvi' },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    className={`h-6 px-2 rounded-md text-[11px] font-medium border transition-colors ${categoryPath === path ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                    onClick={() => setCategoryPath(path)}
                    disabled={loading}
                  >{label}</button>
                ))}
              </div>

              {/* Scrape mode */}
              <div>
                <label className="block text-sm font-medium mb-1">Režim scrapování</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${isQuick ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                    onClick={() => setScrapeMode('quick')} disabled={loading}
                  >
                    <Zap className={`size-5 ${isQuick ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div><p className="text-sm font-medium">Quick</p><p className="text-[11px] text-muted-foreground">Rychlý, základní data</p></div>
                  </button>
                  <button
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${!isQuick ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                    onClick={() => setScrapeMode('full')} disabled={loading}
                  >
                    <Database className={`size-5 ${!isQuick ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div><p className="text-sm font-medium">Full</p><p className="text-[11px] text-muted-foreground">Email, IČO, popis...</p></div>
                  </button>
                </div>
              </div>

              {/* Max pages */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rozsah{maxPages > 0 ? ` (~${maxPages * 15} firem)` : ' (vše)'}
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  <Button size="sm" variant={maxPages === 0 ? 'default' : 'outline'} onClick={() => setMaxPages(0)} disabled={loading}>Vše</Button>
                  {[5, 10, 20, 50, 100].map((n) => (
                    <Button key={n} size="sm" variant={maxPages === n ? 'default' : 'outline'} onClick={() => setMaxPages(n)} disabled={loading}>{n}</Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── FULL MODE ── */}
          {mode === 'full' && (
            <>
              {existingFullSession && !loading && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-2">
                  <p className="text-sm font-semibold text-amber-900">Nedokončené celé Firmy.cz</p>
                  <p className="text-xs text-amber-700">
                    Kategorie {existingFullSession.currentCategoryIdx}/{existingFullSession.totalCategories} —{' '}
                    {existingFullSession.result.itemsScraped.toLocaleString('cs-CZ')} firem staženo
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      const s = existingFullSession;
                      setExistingFullSession(null);
                      void runFullFirmyMode(s);
                    }}>
                      <RotateCcw className="size-3.5 mr-1" /> Pokračovat
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { clearFullSession(); setExistingFullSession(null); }}>
                      Začít znovu
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-md bg-blue-50 border border-blue-200 p-3 space-y-1">
                <p className="text-sm font-semibold text-blue-900">Celé Firmy.cz</p>
                <p className="text-xs text-blue-700">
                  Scraper automaticky prozkoumá všech {TOP_LEVEL_CATEGORIES.length} hlavních kategorií,
                  stáhne jejich podkategorie a postupně sesbírá všechny firmy z celého katalogu.
                  Může trvat několik hodin.
                </p>
              </div>

              {/* Scrape mode for full */}
              <div>
                <label className="block text-sm font-medium mb-1">Režim scrapování</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${isQuick ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                    onClick={() => setScrapeMode('quick')} disabled={loading}
                  >
                    <Zap className={`size-5 ${isQuick ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div><p className="text-sm font-medium">Quick</p><p className="text-[11px] text-muted-foreground">Rychlejší, bez emailů/IČO</p></div>
                  </button>
                  <button
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${!isQuick ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                    onClick={() => setScrapeMode('full')} disabled={loading}
                  >
                    <Database className={`size-5 ${!isQuick ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div><p className="text-sm font-medium">Full</p><p className="text-[11px] text-muted-foreground">Email, IČO, popis (pomalé)</p></div>
                  </button>
                </div>
              </div>

              {/* Full mode progress */}
              {loading && fullProgress && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Kategorie {fullCategoryIdx}/{fullTotalCategories || '?'}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: fullTotalCategories > 0 ? `${Math.round((fullCategoryIdx / fullTotalCategories) * 100)}%` : '0%' }}
                    />
                  </div>
                  <p className="text-[11px] text-blue-700">{fullProgress}</p>
                </div>
              )}
            </>
          )}

          {/* Loading indicator (category progress) */}
          {loading && progress && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin shrink-0" />
              <span className="text-[12px] truncate">{progress}</span>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {result && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 space-y-2">
              <p className="font-medium">{loading ? 'Průběžné výsledky' : 'Scraping dokončen'}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span>Stránek staženo:</span><span className="font-medium">{result.pagesScraped}</span>
                <span>Zpracováno firem:</span><span className="font-medium">{result.itemsScraped.toLocaleString('cs-CZ')}</span>
                <span>Vytvořeno nových:</span><span className="font-medium">{result.created.toLocaleString('cs-CZ')}</span>
                <span>Aktualizováno:</span><span className="font-medium">{result.updated.toLocaleString('cs-CZ')}</span>
                <span>Beze změny:</span><span className="font-medium">{result.unchanged.toLocaleString('cs-CZ')}</span>
                {(result.scrapeErrors > 0 || result.importErrors > 0) && (
                  <><span className="text-red-600">Chyby:</span><span className="text-red-600 font-medium">{result.scrapeErrors + result.importErrors}</span></>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {mode === 'category' ? (
            <Button
              className="w-full" size="lg"
              onClick={() => void handleCategoryScrape()}
              disabled={loading || !categoryPath.trim()}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {loading ? 'Stahuji...' : `Stáhnout kategorii (${isQuick ? 'Quick' : 'Full'})`}
            </Button>
          ) : (
            <Button
              className="w-full" size="lg"
              onClick={() => void handleFullScrape()}
              disabled={loading}
              variant={loading ? 'outline' : 'default'}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
              {loading ? 'Scrapuji celé Firmy.cz...' : `Stáhnout celé Firmy.cz (${isQuick ? 'Quick' : 'Full'})`}
            </Button>
          )}
          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => handleClose(false)}>
              <X className="size-4 mr-1" /> Zavřít
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
