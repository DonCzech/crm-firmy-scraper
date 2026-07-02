/**
 * BezrealitkyScraperPanel — spouštění scraperu inzerátů z Bezrealitky.cz
 *
 * Scraper volá bezrealitky GraphQL API a stahuje aktivní inzeráty
 * (byty, domy, pozemky) do ExternalListing — stejné tabulky jako Sreality.
 * Inzeráty jsou identifikovány prefixem bzr_ v poli srealityId.
 */

import { useState, useCallback } from 'react';
import {
  Home,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { scrapeBezrealitky, type BzrScrapeResult } from '../../services/backend';

// ─── Constants ────────────────────────────────────────────────────────────────

const OFFER_TYPES = [
  { value: 'PRODEJ', label: 'Prodej' },
  { value: 'PRONAJEM', label: 'Pronájem' },
];

const ESTATE_TYPES = [
  { value: 'BYT', label: 'Byty' },
  { value: 'DUM', label: 'Domy' },
  { value: 'POZEMEK', label: 'Pozemky' },
  { value: 'GARAZ', label: 'Garáže' },
  { value: 'KANCELAR', label: 'Kanceláře' },
  { value: 'NEBYTOVY_PROSTOR', label: 'Nebytové prostory' },
  { value: 'REKREACNI_OBJEKT', label: 'Rekreační objekty' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('cs-CZ').format(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BezrealitkyScraperPanel({ defaultOpen }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BzrScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form params
  const [offerType, setOfferType] = useState('PRODEJ');
  const [estateType, setEstateType] = useState('BYT');
  const [maxPages, setMaxPages] = useState('50');
  const [syncType, setSyncType] = useState<'delta' | 'full'>('delta');

  const handleScrape = useCallback(async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const parsedMaxPages = Number.parseInt(maxPages, 10);
      const res = await scrapeBezrealitky({
        offerType,
        estateType,
        maxPages: Number.isFinite(parsedMaxPages) && parsedMaxPages >= 0 ? parsedMaxPages : 50,
        syncType,
      });
      setResult(res);
      if (res.error || res.scrape.scrapeErrors > 0) {
        const message = res.error || `Scrape selhal (errors: ${res.scrape.scrapeErrors})`;
        setError(message);
        toast.error(`Chyba: ${message}`);
      } else {
        toast.success(
          `Bezrealitky: staženo ${fmtNum(res.scrape.itemsScraped)} inzerátů, ` +
          `nových ${fmtNum(res.import.created)}, aktualizováno ${fmtNum(res.import.updated)}`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(`Chyba: ${msg}`);
    } finally {
      setRunning(false);
    }
  }, [offerType, estateType, maxPages, syncType]);

  const isDone = !running && result != null && !error;
  const isError = !running && !!error;

  return (
    <div className="border-b border-border">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <Home className="size-4 text-orange-500 shrink-0" />
        <span className="text-sm font-semibold">Bezrealitky.cz</span>
        <span className="text-[11px] text-muted-foreground">(scraper inzerátů)</span>

        {running && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
            <Loader2 className="size-3 animate-spin" />
            Probíhá...
          </span>
        )}
        {isDone && result && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
            <CheckCircle2 className="size-3" />
            {fmtNum(result.scrape.itemsScraped)} staženo · +{fmtNum(result.import.created)} nových
          </span>
        )}
        {!running && !result && (
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-medium">
            <AlertCircle className="size-3" />
            Nespuštěno
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

          {/* Params */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Typ nabídky:</label>
              <select
                className="h-8 px-2 text-xs border border-border rounded-md bg-background"
                value={offerType}
                onChange={(e) => setOfferType(e.target.value)}
                disabled={running}
              >
                {OFFER_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Typ nemovitosti:</label>
              <select
                className="h-8 px-2 text-xs border border-border rounded-md bg-background"
                value={estateType}
                onChange={(e) => setEstateType(e.target.value)}
                disabled={running}
              >
                {ESTATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Max stran:</label>
              <input
                type="number"
                className="h-8 w-16 px-2 text-xs border border-border rounded-md bg-background"
                value={maxPages}
                onChange={(e) => setMaxPages(e.target.value)}
                min={1}
                max={200}
                disabled={running}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Sync:</label>
              <select
                className="h-8 px-2 text-xs border border-border rounded-md bg-background"
                value={syncType}
                onChange={(e) => setSyncType(e.target.value as 'delta' | 'full')}
                disabled={running}
              >
                <option value="delta">Delta (update)</option>
                <option value="full">Full (přepsat vše)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="h-9 bg-orange-500 hover:bg-orange-600"
              onClick={handleScrape}
              disabled={running}
            >
              {running
                ? <><Loader2 className="size-3.5 animate-spin" /> Probíhá...</>
                : <><Play className="size-3.5" /> Spustit scraping</>
              }
            </Button>
            <span className="text-xs text-muted-foreground">
              {Number.parseInt(maxPages || '0', 10) === 0
                ? 'Rozsah: všechny strany (full scrape)'
                : `~40 inzerátů/strana · ${maxPages} stran = max ~${fmtNum(parseInt(maxPages || '0', 10) * 40)} inzerátů`}
            </span>
          </div>

          {/* Info */}
          {!running && !result && (
            <div className="text-sm text-muted-foreground rounded-lg bg-muted/50 px-3 py-2.5 space-y-1">
              <p className="font-medium text-foreground">Jak to funguje?</p>
              <p>
                Scraper volá GraphQL API Bezrealitky.cz a stahuje aktivní inzeráty do databáze.
                Inzeráty jsou uloženy společně s těmi ze Sreality (prefix <code className="text-[11px] bg-muted px-1 rounded">bzr_</code> v ID).
                Používej <strong>Delta</strong> pro pravidelný update — aktualizuje jen změněné záznamy.
              </p>
            </div>
          )}

          {/* Running */}
          {running && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 flex items-center gap-2">
              <Loader2 className="size-4 text-blue-600 animate-spin shrink-0" />
              <span className="text-sm text-blue-800">Stahují se inzeráty z Bezrealitky.cz... (může trvat 1–10 minut)</span>
            </div>
          )}

          {/* Error */}
          {isError && error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
              <strong>Chyba:</strong> {error}
            </div>
          )}

          {/* Result */}
          {isDone && result && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CheckCircle2 className="size-4 shrink-0" />
                <span className="font-medium">Scraping dokončen</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded bg-white border border-green-200 px-2.5 py-2 text-center">
                  <div className="font-semibold text-base text-foreground">{fmtNum(result.scrape.totalFound)}</div>
                  <div className="text-muted-foreground">Celkem na webu</div>
                </div>
                <div className="rounded bg-white border border-green-200 px-2.5 py-2 text-center">
                  <div className="font-semibold text-base text-foreground">{fmtNum(result.scrape.itemsScraped)}</div>
                  <div className="text-muted-foreground">Staženo</div>
                </div>
                <div className="rounded bg-white border border-green-200 px-2.5 py-2 text-center">
                  <div className="font-semibold text-base text-green-700">+{fmtNum(result.import.created)}</div>
                  <div className="text-muted-foreground">Nové</div>
                </div>
                <div className="rounded bg-white border border-green-200 px-2.5 py-2 text-center">
                  <div className="font-semibold text-base text-blue-700">{fmtNum(result.import.updated)}</div>
                  <div className="text-muted-foreground">Aktualizováno</div>
                </div>
              </div>
              {(result.scrape.scrapeErrors > 0 || result.import.errors > 0) && (
                <div className="text-xs text-amber-700">
                  Chyby: scrape {result.scrape.scrapeErrors}, import {result.import.errors}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
