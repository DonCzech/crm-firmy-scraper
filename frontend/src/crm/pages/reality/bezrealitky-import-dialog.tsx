import { useMemo, useState } from 'react';
import { Database, Download, Home, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { scrapeBezrealitky } from '../../services/backend';

interface BezrealitkyImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Mode = 'selected' | 'all' | 'both';

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

const OFFER_TYPES = [
  { value: 'PRODEJ', label: 'Prodej' },
  { value: 'PRONAJEM', label: 'Pronájem' },
] as const;

const ESTATE_TYPES = [
  { value: 'BYT', label: 'Byty' },
  { value: 'DUM', label: 'Domy' },
  { value: 'POZEMEK', label: 'Pozemky' },
  { value: 'GARAZ', label: 'Garáže' },
  { value: 'KANCELAR', label: 'Kanceláře' },
  { value: 'NEBYTOVY_PROSTOR', label: 'Nebytové prostory' },
  { value: 'REKREACNI_OBJEKT', label: 'Rekreační objekty' },
] as const;

const EMPTY_RESULT: AggregatedResult = {
  totalFound: 0,
  pagesScraped: 0,
  itemsScraped: 0,
  scrapeErrors: 0,
  created: 0,
  updated: 0,
  unchanged: 0,
  importErrors: 0,
};

const FULL_BATCH_PAGES = 20;

export function BezrealitkyImportDialog({ open, onOpenChange, onSuccess }: BezrealitkyImportDialogProps) {
  const [mode, setMode] = useState<Mode>('selected');
  const [offerType, setOfferType] = useState<(typeof OFFER_TYPES)[number]['value']>('PRODEJ');
  const [estateType, setEstateType] = useState<(typeof ESTATE_TYPES)[number]['value']>('BYT');
  const [maxPages, setMaxPages] = useState(0);
  const [syncType, setSyncType] = useState<'full' | 'delta'>('delta');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AggregatedResult | null>(null);

  const combos = useMemo(() => {
    if (mode === 'selected') return [{ offerType, estateType }];
    if (mode === 'all') return ESTATE_TYPES.map((type) => ({ offerType, estateType: type.value }));
    return OFFER_TYPES.flatMap((offer) =>
      ESTATE_TYPES.map((type) => ({ offerType: offer.value, estateType: type.value })),
    );
  }, [mode, offerType, estateType]);

  const runScrape = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let agg = { ...EMPTY_RESULT };

      for (let i = 0; i < combos.length; i++) {
        const combo = combos[i];
        const offerLabel = OFFER_TYPES.find((o) => o.value === combo.offerType)?.label ?? combo.offerType;
        const estateLabel = ESTATE_TYPES.find((t) => t.value === combo.estateType)?.label ?? combo.estateType;
        const comboLabel = `${offerLabel} ${estateLabel}`;
        const comboPrefix = combos.length > 1 ? `(${i + 1}/${combos.length}) ` : '';

        if (maxPages > 0) {
          setProgress(`${comboPrefix}${comboLabel} — stahuji ${maxPages} stran`);
          const res = await scrapeBezrealitky({
            offerType: combo.offerType,
            estateType: combo.estateType,
            maxPages,
            startPage: 1,
            syncType,
          });
          if (res.error) throw new Error(res.error);
          agg = {
            totalFound: agg.totalFound + res.scrape.totalFound,
            pagesScraped: agg.pagesScraped + res.scrape.pagesScraped,
            itemsScraped: agg.itemsScraped + res.scrape.itemsScraped,
            scrapeErrors: agg.scrapeErrors + res.scrape.scrapeErrors,
            created: agg.created + res.import.created,
            updated: agg.updated + res.import.updated,
            unchanged: agg.unchanged + res.import.unchanged,
            importErrors: agg.importErrors + res.import.errors,
          };
          setResult({ ...agg });
          continue;
        }

        let startPage = 1;
        let batchNum = 0;
        let comboTotalFound = 0;

        while (true) {
          batchNum++;
          const fetched = agg.itemsScraped;
          const msg = comboTotalFound > 0
            ? `${comboPrefix}${comboLabel} — staženo ${fetched.toLocaleString('cs-CZ')} / ${comboTotalFound.toLocaleString('cs-CZ')}`
            : `${comboPrefix}${comboLabel} — dávka ${batchNum}…`;
          setProgress(msg);

          const res = await scrapeBezrealitky({
            offerType: combo.offerType,
            estateType: combo.estateType,
            maxPages: FULL_BATCH_PAGES,
            startPage,
            syncType,
          });
          if (res.error) throw new Error(res.error);

          agg = {
            totalFound: agg.totalFound + res.scrape.totalFound,
            pagesScraped: agg.pagesScraped + res.scrape.pagesScraped,
            itemsScraped: agg.itemsScraped + res.scrape.itemsScraped,
            scrapeErrors: agg.scrapeErrors + res.scrape.scrapeErrors,
            created: agg.created + res.import.created,
            updated: agg.updated + res.import.updated,
            unchanged: agg.unchanged + res.import.unchanged,
            importErrors: agg.importErrors + res.import.errors,
          };
          setResult({ ...agg });

          if (comboTotalFound === 0) comboTotalFound = res.scrape.totalFound;

          if (res.scrape.scrapeErrors > 0) break;
          if (res.scrape.pagesScraped < FULL_BATCH_PAGES) break;
          if (comboTotalFound > 0 && agg.itemsScraped >= comboTotalFound) break;
          startPage += res.scrape.pagesScraped;
        }
      }

      setProgress('Hotovo');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bezrealitky scrape selhal.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setResult(null);
      setError(null);
      setProgress('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <Home className="size-4 text-orange-500" />
            Scrape Bezrealitky
          </DialogTitle>
          <DialogDescription>
            Stejný workflow jako Sreality: vybereš režim a rozsah, poté se data stáhnou a importují do Reality tabulky.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Režim</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${mode === 'selected' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                onClick={() => setMode('selected')}
                disabled={loading}
              >
                <Download className={`size-5 ${mode === 'selected' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">Vybraný segment</p>
                  <p className="text-xs text-muted-foreground">Jeden offer + typ</p>
                </div>
              </button>
              <button
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${mode === 'all' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                onClick={() => setMode('all')}
                disabled={loading}
              >
                <Zap className={`size-5 ${mode === 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">Všechny typy</p>
                  <p className="text-xs text-muted-foreground">Pro jeden offer typ</p>
                </div>
              </button>
              <button
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors ${mode === 'both' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                onClick={() => setMode('both')}
                disabled={loading}
              >
                <Database className={`size-5 ${mode === 'both' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">Full vše</p>
                  <p className="text-xs text-muted-foreground">Prodej + Pronájem + všechny typy</p>
                </div>
              </button>
            </div>
          </div>

          {mode !== 'both' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Offer typ</label>
                <select
                  className="mt-1 h-9 px-2 w-full text-sm border border-border rounded-md bg-background"
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value as (typeof OFFER_TYPES)[number]['value'])}
                  disabled={loading}
                >
                  {OFFER_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {mode === 'selected' && (
                <div>
                  <label className="text-xs text-muted-foreground">Typ nemovitosti</label>
                  <select
                    className="mt-1 h-9 px-2 w-full text-sm border border-border rounded-md bg-background"
                    value={estateType}
                    onChange={(e) => setEstateType(e.target.value as (typeof ESTATE_TYPES)[number]['value'])}
                    disabled={loading}
                  >
                    {ESTATE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">
              Rozsah stahování{maxPages > 0 ? ` (~${maxPages * 40} inzerátů na segment)` : ' (všechny inzeráty)'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={maxPages === 0 ? 'primary' : 'outline'}
                onClick={() => setMaxPages(0)}
                disabled={loading}
              >
                Vše
              </Button>
              {[10, 25, 50, 100].map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={maxPages === n ? 'primary' : 'outline'}
                  onClick={() => setMaxPages(n)}
                  disabled={loading}
                >
                  {n} stran
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Typ synchronizace</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={syncType === 'full' ? 'primary' : 'outline'}
                onClick={() => setSyncType('full')}
                disabled={loading}
              >
                Full sync
              </Button>
              <Button
                size="sm"
                variant={syncType === 'delta' ? 'primary' : 'outline'}
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

          {/* Loading indicator — stejný jako Sreality */}
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

          {/* Výsledky — stejný styl jako Sreality */}
          {result && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 space-y-2">
              <p className="font-medium">{loading ? 'Průběžné výsledky' : 'Scraping dokončen'}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span>Nalezeno na Bezrealitky:</span>
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

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
            Zavřít
          </Button>
          <Button onClick={runScrape} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {loading ? 'Scrapuji...' : 'Spustit scrape'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
