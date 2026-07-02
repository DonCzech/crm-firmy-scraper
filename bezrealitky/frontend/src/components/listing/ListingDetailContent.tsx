// Server component — renders the main listing detail body
// mode='page'   → left column only (no contact; sidebar is handled by the page wrapper)
// mode='drawer' → full single-column with contact form, stats, phone embedded inline

import { ListingPhotoGrid } from './ListingPhotoGrid';
import { ListingDetailMap } from './ListingDetailMap';
import { MortgageCalculator } from './MortgageCalculator';
import { SimilarListings } from './SimilarListings';
import { ListingFavoriteShare } from './ListingFavoriteShare';
import { ContactOwnerCTA } from './ContactOwnerCTA';
import { formatPrice, formatDate, OFFER_TYPE_LABELS, ESTATE_TYPE_LABELS } from '@/lib/utils';
import {
  MapPin, Eye, Calendar, Maximize2, BedDouble,
  Layers, TrendingUp, CheckCircle2, XCircle, Phone,
} from 'lucide-react';

interface Props {
  listing: any;
  mode?: 'page' | 'drawer';
}

export function ListingDetailContent({ listing, mode = 'page' }: Props) {
  const isDrawer = mode === 'drawer';

  const pricePerM2 = listing.area ? Math.round(listing.price / listing.area) : null;
  const publishedDate = listing.publishedAt ?? listing.createdAt;
  const daysOnMarket = Math.max(
    0,
    Math.floor((Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24)),
  );

  const amenities = [
    { label: 'Zařízeno', value: listing.furnished },
    { label: 'Balkón / terasa', value: listing.balcony },
    { label: 'Sklep', value: listing.cellar },
    { label: 'Výtah', value: listing.elevator },
    { label: 'Parkování', value: listing.parking },
    { label: 'Domácí zvířata', value: listing.petFriendly },
  ].filter((a) => a.value !== null && a.value !== undefined);

  const params2 = [
    { label: 'Typ nemovitosti', value: ESTATE_TYPE_LABELS[listing.estateType] },
    { label: 'Dispozice', value: listing.rooms },
    { label: 'Plocha', value: listing.area ? `${listing.area} m²` : null },
    {
      label: 'Patro',
      value:
        listing.floor != null
          ? `${listing.floor}. patro${listing.totalFloors ? ` / ${listing.totalFloors}` : ''}`
          : null,
    },
    { label: 'Kraj', value: listing.region },
    { label: 'Okres', value: listing.district },
    { label: 'PSČ', value: listing.zip },
  ].filter((p) => p.value);

  return (
    <div className="space-y-10">
      {/* ── Photo Grid ── */}
      <ListingPhotoGrid
        media={listing.media ?? []}
        gridHeight={isDrawer ? 'h-[300px]' : 'h-[480px]'}
      />

      {/* ── Price + Key Stats + Address ── */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`font-black text-gray-900 ${isDrawer ? 'text-3xl' : 'text-4xl'}`}>
                {formatPrice(listing.price)}
              </span>
              {listing.offerType === 'RENT' && (
                <span className="text-lg text-gray-400">/měs.</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
              {listing.area && (
                <div className="flex items-center gap-1.5">
                  <Maximize2 size={17} className="text-gray-400" />
                  <span className="text-base font-semibold text-gray-800">{listing.area}</span>
                  <span className="text-sm text-gray-400">m²</span>
                </div>
              )}
              {listing.rooms && (
                <div className="flex items-center gap-1.5">
                  <BedDouble size={17} className="text-gray-400" />
                  <span className="text-base font-semibold text-gray-800">{listing.rooms}</span>
                </div>
              )}
              {listing.floor != null && (
                <div className="flex items-center gap-1.5">
                  <Layers size={17} className="text-gray-400" />
                  <span className="text-base font-semibold text-gray-800">{listing.floor}.</span>
                  <span className="text-sm text-gray-400">
                    patro{listing.totalFloors ? ` / ${listing.totalFloors}` : ''}
                  </span>
                </div>
              )}
              {pricePerM2 && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={17} className="text-gray-400" />
                  <span className="text-base font-semibold text-gray-800">{formatPrice(pricePerM2)}</span>
                  <span className="text-sm text-gray-400">/m²</span>
                </div>
              )}
            </div>
          </div>

          <ListingFavoriteShare listingId={listing.id} />
        </div>

        {/* Address */}
        <div className="mt-4 flex items-start gap-1.5 text-gray-700">
          <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span>
            {[listing.street, listing.city, listing.district, listing.zip]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>

        {/* Badges + meta */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
            {OFFER_TYPE_LABELS[listing.offerType]}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {ESTATE_TYPE_LABELS[listing.estateType]}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Eye size={13} /> {listing.viewCount} zobrazení
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar size={13} /> {formatDate(publishedDate)}
          </span>
          {daysOnMarket > 0 && (
            <span className="text-sm text-gray-400">· {daysOnMarket} dní na trhu</span>
          )}
        </div>

        {/* ── Drawer-only inline contact zone ── */}
        {isDrawer && (
          <div className="mt-6 space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 rounded-xl border border-gray-200 bg-white p-4 text-center">
              <div className="pr-4">
                <p className="text-2xl font-black text-gray-900">{listing.viewCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">zobrazení</p>
              </div>
              <div className="pl-4">
                <p className="text-2xl font-black text-gray-900">{daysOnMarket}</p>
                <p className="text-xs text-gray-400 mt-0.5">dní na trhu</p>
              </div>
            </div>

            {listing.ownerPhone && (
              <a
                href={`tel:${listing.ownerPhone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-primary-600 py-3 font-semibold text-primary-700 hover:bg-primary-50 transition"
              >
                <Phone size={18} /> {listing.ownerPhone}
              </a>
            )}

            <ContactOwnerCTA listing={listing} />
          </div>
        )}
      </div>

      {/* ── Description ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Popis</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
      </div>

      {/* ── Facts & Features ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fakta a vlastnosti</h2>

        {params2.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {params2.map((p) => (
              <div key={p.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{p.label}</p>
                <p className="mt-0.5 font-semibold text-gray-900">{p.value}</p>
              </div>
            ))}
          </div>
        )}

        {amenities.length > 0 && (
          <>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Vybavení</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenities.map((a) => (
                <div
                  key={a.label}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    a.value ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {a.value
                    ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    : <XCircle size={16} className="text-gray-300 flex-shrink-0" />}
                  {a.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Map ── */}
      {listing.lat && listing.lon && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Poloha</h2>
          <ListingDetailMap lat={listing.lat} lon={listing.lon} title={listing.title} />
          <p className="mt-2 flex items-center gap-1 text-sm text-gray-400">
            <MapPin size={13} />
            {[listing.street, listing.city, listing.district].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {/* ── Calculator ── */}
      <MortgageCalculator price={listing.price} offerType={listing.offerType} />

      {/* ── Similar listings ── */}
      <SimilarListings
        city={listing.city}
        estateType={listing.estateType}
        offerType={listing.offerType}
        excludeId={listing.id}
      />
    </div>
  );
}
