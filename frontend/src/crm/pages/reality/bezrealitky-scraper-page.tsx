import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Home,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { BezrealitkyImportDialog } from './bezrealitky-import-dialog';
import { fetchBezrealitkyListings, type BezrealitkyListingItem } from '../../services/backend';

const PAGE_SIZE = 50;

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function stateLabel(state: string): { label: string; className: string } {
  switch (state) {
    case 'ACTIVE':   return { label: 'Aktivní',   className: 'bg-green-100 text-green-800' };
    case 'RESERVED': return { label: 'Rezervace', className: 'bg-yellow-100 text-yellow-800' };
    case 'SOLD':     return { label: 'Prodáno',   className: 'bg-blue-100 text-blue-800' };
    case 'REMOVED':  return { label: 'Odstraněno', className: 'bg-red-100 text-red-800' };
    default:         return { label: state,        className: 'bg-gray-100 text-gray-700' };
  }
}

export function BezrealitkyScraperPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [listings, setListings] = useState<BezrealitkyListingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchBezrealitkyListings({
        page: p,
        limit: PAGE_SIZE,
        search: q || undefined,
        sortBy: 'lastSeenAt',
        sortOrder: 'desc',
      });
      if ('error' in res && res.error) throw new Error(String(res.error));
      const data = res as { items: BezrealitkyListingItem[]; total: number; totalPages: number };
      setListings(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search);
  }, [page, search, load]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleSuccess = () => {
    setPage(1);
    load(1, search);
  };

  return (
    <>
      <ContentHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Home className="size-4 text-orange-500" />
            <span className="text-sm font-semibold">Bezrealitky.cz</span>
            {!loading && (
              <span className="text-xs text-muted-foreground">
                ({total.toLocaleString('cs-CZ')} inzerátů)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-sm w-56"
                placeholder="Hledat..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchInput && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={handleClearSearch}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Button size="sm" variant="outline" className="h-8" onClick={handleSearch}>
              Hledat
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="h-8 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Home className="size-3.5" />
              Scrape Bezrealitky
            </Button>
          </div>
        </div>
      </ContentHeader>

      <Content>

        {/* Error */}
        {loadError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">{loadError}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Načítám...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !loadError && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Home className="size-10 text-orange-300" />
            <p className="text-sm font-medium">Žádné inzeráty z Bezrealitky</p>
            <p className="text-xs">Spusť scrape pro stažení inzerátů z Bezrealitky.cz</p>
            <Button size="sm" onClick={() => setOpen(true)} className="mt-2 bg-orange-500 hover:bg-orange-600 text-white">
              Spustit scrape
            </Button>
          </div>
        )}

        {/* Table */}
        {!loading && listings.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-muted/50">
                  <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium border-b border-border">
                    <th>Název</th>
                    <th>Kategorie</th>
                    <th>Cena</th>
                    <th>Kč/m²</th>
                    <th>Plocha</th>
                    <th>Dispozice</th>
                    <th>Lokalita</th>
                    <th>Stav</th>
                    <th>Přidáno</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => {
                    const state = stateLabel(listing.listingState);
                    return (
                      <tr
                        key={listing.id}
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                        onClick={() => navigate(listing.id)}
                      >
                        <td className="px-3 py-1.5 max-w-[240px] truncate font-medium">
                          {listing.title}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {[listing.categoryMain, listing.categoryType].filter(Boolean).join(' · ') || '-'}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {formatPrice(listing.currentPrice)}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {listing.pricePerM2 ? `${listing.pricePerM2.toLocaleString('cs-CZ')} Kč` : '-'}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {listing.usableArea != null ? `${listing.usableArea} m²` : '-'}
                        </td>
                        <td className="px-3 py-1.5">{listing.disposition ?? '-'}</td>
                        <td className="px-3 py-1.5 max-w-[180px] truncate">{listing.locality ?? '-'}</td>
                        <td className="px-3 py-1.5">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${state.className}`}>
                            {state.label}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">
                          {formatDate(listing.firstSeenAt)}
                        </td>
                        <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                          {listing.sourceUrl ? (
                            <a
                              href={listing.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              BZR <ExternalLink className="size-3" />
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted-foreground">
                  Strana {page} z {totalPages} ({total.toLocaleString('cs-CZ')} celkem)
                </p>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setPage(1)} disabled={page === 1}>
                    <ChevronsLeft className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <span className="text-xs px-2">{page} / {totalPages}</span>
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                    <ChevronRight className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
                    <ChevronsRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Content>

      <BezrealitkyImportDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
