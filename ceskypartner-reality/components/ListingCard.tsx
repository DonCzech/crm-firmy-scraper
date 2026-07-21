import Image from "next/image";
import { MapPin } from "lucide-react";
import { formatPrice, type Listing } from "@/data/listings";
import { BLUR_DATA_URL } from "@/lib/blur";
import FavoriteButton from "./FavoriteButton";
import type { SiteLocale } from "@/lib/locale";

const TAG_EN: Record<string, string> = {
  Novinka: "New",
  Rezervováno: "Reserved",
  Exkluzivně: "Exclusive",
  Prodáno: "Sold",
  Pronajato: "Let",
};

export default function ListingCard({
  listing,
  locale = "cs",
}: {
  listing: Listing;
  locale?: SiteLocale;
}) {
  const meta = [
    listing.disposition,
    `${listing.area.toLocaleString(locale === "en" ? "en-GB" : "cs-CZ")} m²`,
    listing.yieldPa && `${locale === "en" ? "Yield" : "Výnos"} ${listing.yieldPa}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <a
      href={locale === "en" ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}`}
      className="group block"
      aria-label={`${listing.title}, ${listing.location}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 86vw"
          className="object-cover transition-transform duration-[800ms] ease-luxe group-hover:scale-105"
        />
        {listing.tag && listing.tag !== "Exkluzivně" && (
          <span className="absolute left-4 top-4 bg-ink px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-paper">
            {locale === "en" ? TAG_EN[listing.tag] ?? listing.tag : listing.tag}
          </span>
        )}
        <FavoriteButton id={listing.id} className="absolute right-4 top-4" locale={locale} />
      </div>

      <div className="pt-5">
        <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.01em]">
          <span className="card-title">{listing.title}</span>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
          <MapPin size={13} strokeWidth={1.5} className="shrink-0 text-bronze" />
          {listing.location}
        </p>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-[13px] text-muted">{meta}</span>
          <span className="text-[16px] font-semibold text-bronze-deep">
            {formatPrice(listing, locale)}
          </span>
        </div>
      </div>
    </a>
  );
}
