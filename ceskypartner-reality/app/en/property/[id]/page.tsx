import type { Metadata } from "next";
import ListingDetailContent from "@/components/ListingDetailContent";
import { INVESTMENT_EN, RENT_EN, SALE_EN } from "@/data/listings-en";
import { englishListingDescription } from "@/data/listing-details-en";
import { getListingBySlug } from "@/lib/queries";

const ALL_LISTINGS = [...SALE_EN, ...RENT_EN, ...INVESTMENT_EN];

type Props = { params: { id: string } };

export const revalidate = 60;

export function generateStaticParams() {
  return ALL_LISTINGS.map((listing) => ({ id: listing.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const staticListing = ALL_LISTINGS.find((item) => item.id === params.id);
  const dbListing = staticListing ? null : await getListingBySlug(params.id).catch(() => null);
  if (!staticListing && !dbListing) return {};

  const title = staticListing?.title ?? dbListing!.title;
  const location = staticListing?.location ?? dbListing!.location;
  const image = staticListing?.image ?? dbListing!.images[0]?.url;
  const description = englishListingDescription(params.id).slice(0, 160);
  const enPath = `/en/property/${params.id}`;
  const csPath = `/nemovitost/${params.id}`;

  return {
    title: `${title} — ${location}`,
    description,
    alternates: {
      canonical: enPath,
      languages: { "en-GB": enPath, "cs-CZ": csPath, "x-default": csPath },
    },
    openGraph: {
      title,
      description,
      locale: "en_GB",
      alternateLocale: ["cs_CZ"],
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default function EnglishPropertyDetailPage({ params }: Props) {
  return <ListingDetailContent params={params} locale="en" />;
}
