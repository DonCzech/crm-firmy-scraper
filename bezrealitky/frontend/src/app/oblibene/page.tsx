'use client';

import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { MY_FAVORITES } from '@/graphql/queries';
import { ListingCard } from '@/components/listing/ListingCard';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getClient().request(MY_FAVORITES),
  });

  const favorites = (data as any)?.myFavorites ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="text-primary-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Oblíbené inzeráty</h1>
        <span className="text-gray-400 text-sm">({favorites.length})</span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="card h-72 animate-pulse bg-gray-100" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Zatím žádné oblíbené inzeráty</p>
          <a href="/vyhledat" className="btn-primary mt-4 inline-block">Procházet inzeráty</a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav: any) => (
            <ListingCard key={fav.id} listing={fav.listing} />
          ))}
        </div>
      )}
    </div>
  );
}
