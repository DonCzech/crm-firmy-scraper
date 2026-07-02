'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { TOGGLE_FAVORITE } from '@/graphql/mutations';
import { formatPrice, formatDate, OFFER_TYPE_LABELS, ESTATE_TYPE_LABELS } from '@/lib/utils';
import { Heart, MapPin, Maximize2, BedDouble, Calendar, Camera } from 'lucide-react';

interface Props {
  listing: any;
  /** 'grid' = card tiles (default), 'list' = horizontal row, 'compact' = small map sidebar */
  variant?: 'grid' | 'list' | 'compact';
  /** @deprecated use variant='compact' */
  compact?: boolean;
}

export function ListingCard({ listing, variant, compact }: Props) {
  const mode = variant ?? (compact ? 'compact' : 'grid');
  const qc = useQueryClient();
  const coverImage = listing.media?.find((m: any) => m.isCover) ?? listing.media?.[0];
  const photoCount = listing.media?.length ?? 0;
  const pricePerM2 = listing.area ? Math.round(listing.price / listing.area) : null;

  const { mutate: toggleFav } = useMutation({
    mutationFn: () => getClient().request(TOGGLE_FAVORITE, { listingId: listing.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });

  /* ── COMPACT (map sidebar) ─────────────────────────────── */
  if (mode === 'compact') {
    return (
      <Link href={`/inzerat/${listing.slug}`}>
        <article className="card group flex gap-3 overflow-hidden transition hover:shadow-md">
          <div className="relative w-28 h-20 flex-shrink-0 bg-gray-100">
            {coverImage?.url
              ? <Image src={coverImage.url} alt={listing.title} fill className="object-cover" sizes="112px" />
              : <div className="flex h-full items-center justify-center text-gray-300 text-2xl">🏠</div>}
            <span className="absolute left-1 top-1 rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {OFFER_TYPE_LABELS[listing.offerType]}
            </span>
            {photoCount > 1 && (
              <span className="absolute right-1 bottom-1 flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                <Camera size={8} /> {photoCount}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center py-2 min-w-0">
            <p className="text-sm font-bold text-primary-700 leading-none">
              {formatPrice(listing.price)}
              {listing.offerType === 'RENT' && <span className="text-xs font-normal text-gray-400">/měs.</span>}
            </p>
            <h3 className="mt-1 text-xs font-medium text-gray-900 line-clamp-1">{listing.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-0.5"><MapPin size={10} /> {listing.city}</span>
              {listing.area && <span className="flex items-center gap-0.5"><Maximize2 size={10} /> {listing.area} m²</span>}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  /* ── LIST (horizontal row, Rightmove-style) ────────────── */
  if (mode === 'list') {
    return (
      <Link href={`/inzerat/${listing.slug}`}>
        <article className="card group flex overflow-hidden transition hover:shadow-md">
          <div className="relative w-64 flex-shrink-0 bg-gray-100 min-h-[160px]">
            {coverImage?.url
              ? <Image src={coverImage.url} alt={listing.title} fill className="object-cover group-hover:scale-[1.02] transition duration-300" sizes="260px" />
              : <div className="flex h-full items-center justify-center text-gray-300 text-4xl">🏠</div>}
            <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
              {OFFER_TYPE_LABELS[listing.offerType]}
            </span>
            {photoCount > 1 && (
              <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
                <Camera size={11} /> {photoCount}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between p-5 min-w-0">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-bold text-primary-700 leading-none">
                      {formatPrice(listing.price)}
                      {listing.offerType === 'RENT' && <span className="text-sm font-normal text-gray-400 ml-1">/měs.</span>}
                    </p>
                    {pricePerM2 && (
                      <span className="text-sm text-gray-400">{formatPrice(pricePerM2)}/m²</span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition">
                    {listing.title}
                  </h3>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); toggleFav(); }}
                  className="flex-shrink-0 rounded-full p-2 border border-gray-200 hover:border-red-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                  <Heart size={15} className="text-gray-400" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {listing.city}{listing.district ? `, ${listing.district}` : ''}
                </span>
                {listing.area && (
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={13} className="text-gray-400" /> {listing.area} m²
                  </span>
                )}
                {listing.rooms && (
                  <span className="flex items-center gap-1.5">
                    <BedDouble size={13} className="text-gray-400" /> {listing.rooms}
                  </span>
                )}
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {ESTATE_TYPE_LABELS[listing.estateType]}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={11} />
              Přidáno {formatDate(listing.publishedAt ?? listing.createdAt)}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  /* ── GRID (default card, image on top) ─────────────────── */
  return (
    <Link href={`/inzerat/${listing.slug}`}>
      <article className="card group overflow-hidden transition hover:shadow-md">
        <div className="relative h-48 bg-gray-100">
          {coverImage?.url
            ? <Image src={coverImage.url} alt={listing.title} fill className="object-cover group-hover:scale-[1.02] transition duration-300" sizes="400px" />
            : <div className="flex h-full items-center justify-center text-gray-300 text-4xl">🏠</div>}
          <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
            {OFFER_TYPE_LABELS[listing.offerType]}
          </span>
          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); toggleFav(); }}
            className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow opacity-0 group-hover:opacity-100 transition"
          >
            <Heart size={16} className="text-gray-500" />
          </button>
          {/* Photo count badge */}
          {photoCount > 1 && (
            <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
              <Camera size={11} /> {photoCount}
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-primary-700 leading-none">
              {formatPrice(listing.price)}
              {listing.offerType === 'RENT' && <span className="text-sm font-normal text-gray-400">/měs.</span>}
            </p>
            {pricePerM2 && (
              <span className="text-xs text-gray-400">{formatPrice(pricePerM2)}/m²</span>
            )}
          </div>
          <h3 className="mt-1 font-medium text-gray-900 line-clamp-2 group-hover:text-primary-700 transition">
            {listing.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={11} /> {listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
            {listing.area && <span className="flex items-center gap-1"><Maximize2 size={11} /> {listing.area} m²</span>}
            {listing.rooms && <span className="flex items-center gap-1"><BedDouble size={11} /> {listing.rooms}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
