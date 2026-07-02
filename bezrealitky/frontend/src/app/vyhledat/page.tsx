'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchStore } from '@/store/search.store';
import { getClient } from '@/lib/graphql-client';
import { SEARCH_LISTINGS } from '@/graphql/queries';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterDrawer } from '@/components/search/FilterDrawer';
import { SortBar } from '@/components/search/SortBar';
import { ListingCard } from '@/components/listing/ListingCard';
import { MapPanel } from '@/components/search/MapPanel';
import { Pagination } from '@/components/ui/Pagination';
import { LayoutGrid, List, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const { filters, page, sortField, sortDir, viewMode, setViewMode, setPage } = useSearchStore();

  const { data, isLoading } = useQuery({
    queryKey: ['search', filters, page, sortField, sortDir, viewMode],
    queryFn: () =>
      getClient().request(SEARCH_LISTINGS, {
        filters,
        pagination: { page: viewMode === 'map' ? 1 : page, limit: viewMode === 'map' ? 500 : 20 },
        sort: { field: sortField, direction: sortDir },
      }),
  });

  const result = (data as any)?.searchListings;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">

      {/* Search bar */}
      <div className="mb-4 rounded-xl bg-white border border-gray-200 p-4">
        <SearchBar compact />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FilterDrawer />
          <SortBar />
          {result && <span className="text-sm text-gray-500">{result.total} inzerátů</span>}
        </div>

        {/* View mode toggles */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            title="Dlaždice"
            className={cn('rounded-md p-1.5 transition', viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Seznam"
            className={cn('rounded-md p-1.5 transition', viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            title="Mapa"
            className={cn('rounded-md p-1.5 transition', viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
          >
            <Map size={18} />
          </button>
        </div>
      </div>

      {/* ── Map view ── */}
      {viewMode === 'map' && (
        <div className="flex gap-4">
          <div className="w-96 flex-shrink-0 overflow-y-auto max-h-[calc(100vh-200px)] space-y-3">
            {result?.items.map((l: any) => (
              <ListingCard key={l.id} listing={l} variant="compact" />
            ))}
          </div>
          <div className="flex-1">
            <MapPanel listings={result?.items ?? []} />
          </div>
        </div>
      )}

      {/* ── Grid view ── */}
      {viewMode === 'grid' && (
        <>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-72 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {result?.items.map((l: any) => (
                <ListingCard key={l.id} listing={l} variant="grid" />
              ))}
            </div>
          )}
          {result && <Pagination page={page} pages={result.pages} total={result.total} onPage={setPage} />}
        </>
      )}

      {/* ── List view ── */}
      {viewMode === 'list' && (
        <>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card h-40 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {result?.items.map((l: any) => (
                <ListingCard key={l.id} listing={l} variant="list" />
              ))}
            </div>
          )}
          {result && <Pagination page={page} pages={result.pages} total={result.total} onPage={setPage} />}
        </>
      )}

    </div>
  );
}
