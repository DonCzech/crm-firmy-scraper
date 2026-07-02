'use client';

import { ListingPhotoGrid } from './ListingPhotoGrid';
import { ListingDetailMap } from './ListingDetailMap';
import { MortgageCalculator } from './MortgageCalculator';
import { SimilarListings } from './SimilarListings';
import { ListingFavoriteShare } from './ListingFavoriteShare';
import { ContactOwnerCTA } from './ContactOwnerCTA';
import { formatPrice, formatDate, OFFER_TYPE_LABELS, ESTATE_TYPE_LABELS } from '@/lib/utils';
import {
  MapPin, Eye, Calendar, Maximize2, BedDouble, Layers, TrendingUp,
  CheckCircle2, XCircle, Phone,
} from 'lucide-react';

export function ListingModalContent({ listing }: { listing: any }) {
  const pricePerM2 = listing.area ? Math.round(listing.price / listing.area) : null;
  const publishedDate = listing.publishedAt ?? listing.createdAt;
  const daysOnMarket = Math.max(
    0,
    Math.floor((Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24)),
  );

  /* Zillow-style stat columns */
  const statCols = [
    listing.area     && { icon: <Maximize2 size={15} />, value: `${listing.area}`, unit: 'm²',  label: 'Plocha' },
    listing.rooms    && { icon: <BedDouble  size={15} />, value: listing.rooms,    unit: null,   label: 'Dispozice' },
    listing.floor != null && { icon: <Layers size={15} />, value: `${listing.floor}.`, unit: listing.totalFloors ? `/ ${listing.totalFloors}` : null, label: 'Patro' },
    pricePerM2       && { icon: <TrendingUp size={15} />, value: formatPrice(pricePerM2), unit: null, label: 'Cena / m²' },
  ].filter(Boolean) as { icon: React.ReactNode; value: string; unit: string | null; label: string }[];

  const amenities = [
    { label: 'Zařízeno',         value: listing.furnished },
    { label: 'Balkón / terasa',  value: listing.balcony },
    { label: 'Sklep',            value: listing.cellar },
    { label: 'Výtah',            value: listing.elevator },
    { label: 'Parkování',        value: listing.parking },
    { label: 'Domácí zvířata',   value: listing.petFriendly },
  ].filter((a) => a.value !== null && a.value !== undefined);

  const params = [
    { label: 'Typ nemovitosti', value: ESTATE_TYPE_LABELS[listing.estateType] },
    { label: 'Dispozice',       value: listing.rooms },
    { label: 'Plocha',          value: listing.area ? `${listing.area} m²` : null },
    {
      label: 'Patro',
      value: listing.floor != null
        ? `${listing.floor}. patro${listing.totalFloors ? ` / ${listing.totalFloors}` : ''}`
        : null,
    },
    { label: 'Kraj',   value: listing.region },
    { label: 'Okres',  value: listing.district },
    { label: 'PSČ',    value: listing.zip },
  ].filter((p) => p.value);

  return (
    /* Two-column layout: left scroll (photos + content) | right sticky sidebar */
    <div className="flex flex-1 overflow-hidden min-h-0">

      {/* ══ LEFT: scrollable main content ══ */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-w-0">

        {/* Photos — edge-to-edge */}
        <ListingPhotoGrid media={listing.media ?? []} gridHeight="h-[360px]" rounded={false} />

        <div className="px-7 py-5 space-y-6 pb-12">

          {/* Title + address */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{listing.title}</h1>
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={13} className="text-gray-400 flex-shrink-0" />
              {[listing.street, listing.city, listing.district, listing.zip].filter(Boolean).join(', ')}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">Popis</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                {listing.description}
              </p>
            </div>
          )}

          {/* Facts & features */}
          {(params.length > 0 || amenities.length > 0) && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3">Fakta a vlastnosti</h2>

              {params.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {params.map((p) => (
                    <div key={p.label} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{p.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">{p.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {amenities.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((a) => (
                    <div
                      key={a.label}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                        a.value ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {a.value
                        ? <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                        : <XCircle     size={13} className="text-gray-300 flex-shrink-0" />}
                      {a.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map */}
          {listing.lat && listing.lon && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3">Poloha</h2>
              <ListingDetailMap lat={listing.lat} lon={listing.lon} title={listing.title} />
              <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} />
                {[listing.street, listing.city, listing.district].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Calculator */}
          <MortgageCalculator price={listing.price} offerType={listing.offerType} />

          {/* Similar */}
          <SimilarListings
            city={listing.city}
            estateType={listing.estateType}
            offerType={listing.offerType}
            excludeId={listing.id}
          />
        </div>
      </div>

      {/* ══ RIGHT: sticky sidebar ══ */}
      <div className="w-[360px] flex-shrink-0 border-l border-gray-100 overflow-y-auto overscroll-contain bg-white">
        <div className="p-6 space-y-5">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-100 px-3 py-0.5 text-xs font-semibold text-primary-700">
              {OFFER_TYPE_LABELS[listing.offerType]}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600">
              {ESTATE_TYPE_LABELS[listing.estateType]}
            </span>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] font-black text-gray-900 leading-none tracking-tight">
                    {formatPrice(listing.price)}
                  </span>
                  {listing.offerType === 'RENT' && (
                    <span className="text-base text-gray-400">/měs.</span>
                  )}
                </div>
              </div>
              <ListingFavoriteShare listingId={listing.id} />
            </div>

            {/* Zillow stat columns: big value + label below */}
            {statCols.length > 0 && (
              <div className="mt-3 flex items-stretch divide-x divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                {statCols.map((s, i) => (
                  <div key={i} className="flex flex-col items-center justify-center px-3 py-2.5 flex-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[18px] font-black text-gray-900 leading-none">{s.value}</span>
                      {s.unit && <span className="text-[11px] font-medium text-gray-400">{s.unit}</span>}
                    </div>
                    <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400 text-center">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye size={11} /> {listing.viewCount} zobrazení</span>
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(publishedDate)}</span>
            {daysOnMarket > 0 && <span>{daysOnMarket} dní na trhu</span>}
          </div>

          <hr className="border-gray-100" />

          {/* CTA buttons */}
          <div className="space-y-2.5">
            <ContactOwnerCTA listing={listing} />
            {listing.ownerPhone && (
              <a
                href={`tel:${listing.ownerPhone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-700 transition"
              >
                <Phone size={16} /> {listing.ownerPhone}
              </a>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
