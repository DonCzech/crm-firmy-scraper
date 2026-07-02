import { getGqlClient } from '@/lib/graphql-client';
import { GET_LISTING } from '@/graphql/queries';
import { ListingDetailContent } from '@/components/listing/ListingDetailContent';
import { ContactOwnerCTA } from '@/components/listing/ContactOwnerCTA';
import { formatPrice, OFFER_TYPE_LABELS } from '@/lib/utils';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Phone } from 'lucide-react';

interface Props { params: { slug: string } }

async function getListing(slug: string) {
  try {
    const data = await getGqlClient().request(GET_LISTING, { slug });
    return (data as any).listing;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.slug);
  if (!listing) return { title: 'Inzerát nenalezen' };
  return {
    title: listing.title,
    description: `${OFFER_TYPE_LABELS[listing.offerType]} · ${listing.city} · ${formatPrice(listing.price)}`,
    openGraph: { images: listing.media?.[0]?.url ? [listing.media[0].url] : [] },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const publishedDate = listing.publishedAt ?? listing.createdAt;
  const daysOnMarket = Math.max(
    0,
    Math.floor((Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

        {/* ── Main column ── */}
        <ListingDetailContent listing={listing} mode="page" />

        {/* ── Sticky sidebar ── */}
        <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
          {/* Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-2 divide-x divide-gray-100 text-center">
              <div className="pr-4">
                <p className="text-2xl font-black text-gray-900">{listing.viewCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">zobrazení</p>
              </div>
              <div className="pl-4">
                <p className="text-2xl font-black text-gray-900">{daysOnMarket}</p>
                <p className="text-xs text-gray-400 mt-0.5">dní na trhu</p>
              </div>
            </div>
          </div>

          {/* Phone */}
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
      </div>
    </div>
  );
}
