'use client';

import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { SEARCH_LISTINGS } from '@/graphql/queries';
import { ListingCard } from './ListingCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LatestListings() {
  const { data, isLoading } = useQuery({
    queryKey: ['latestListings'],
    queryFn: () => getClient().request(SEARCH_LISTINGS, {
      filters: {},
      pagination: { page: 1, limit: 6 },
      sort: { field: 'createdAt', direction: 'desc' },
    }),
  });

  const items = (data as any)?.searchListings?.items ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-64 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Nejnovější inzeráty</h2>
          <Link href="/vyhledat" className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800">
            Zobrazit vše <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((l: any) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </div>
    </section>
  );
}
