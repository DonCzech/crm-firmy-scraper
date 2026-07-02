'use client';

import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { SEARCH_LISTINGS } from '@/graphql/queries';
import { ListingCard } from './ListingCard';
import { Home } from 'lucide-react';

interface Props {
  city: string;
  estateType: string;
  offerType: string;
  excludeId: string;
}

export function SimilarListings({ city, estateType, offerType, excludeId }: Props) {
  const { data } = useQuery({
    queryKey: ['similar', city, estateType, offerType],
    queryFn: () =>
      getClient().request(SEARCH_LISTINGS, {
        filters: { city, estateType: estateType as any, offerType: offerType as any },
        pagination: { page: 1, limit: 5 },
      }),
    staleTime: 5 * 60 * 1000,
  });

  const items: any[] = ((data as any)?.searchListings?.items ?? [])
    .filter((l: any) => l.id !== excludeId)
    .slice(0, 4);

  if (!items.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Home size={20} className="text-primary-600" />
        <h2 className="text-xl font-bold text-gray-900">Podobné nemovitosti</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((l) => (
          <ListingCard key={l.id} listing={l} variant="grid" />
        ))}
      </div>
    </div>
  );
}
