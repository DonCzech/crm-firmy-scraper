import type { PublicListing, PublicListingDetail } from "./queries";
import type { Listing, ListingKind } from "@/data/listings";

const KIND_MAP: Record<string, ListingKind> = {
  APARTMENT: "byt",
  HOUSE: "dum",
  LAND: "pozemek",
  COMMERCIAL: "komercni",
};

const DEAL_LABEL: Record<string, string> = {
  SALE: "Prodej",
  RENT: "Pronájem",
  INVESTMENT: "Investiční příležitost",
};

export function dbToCardListing(row: PublicListing): Listing {
  const isRent = row.deal === "RENT";
  return {
    id: row.slug,
    title: row.title,
    location: row.location,
    disposition: row.disposition || undefined,
    area: row.area || 0,
    price: row.price,
    priceSuffix: isRent ? "/ měsíc" : undefined,
    image: row.image || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop",
    images: row.images?.length ? row.images : undefined,
    description: row.description || undefined,
    tag: row.status === "SOLD"
      ? "Prodáno"
      : row.status === "RENTED"
        ? "Pronajato"
        : row.status === "RESERVED"
          ? "Rezervováno"
          : row.tags?.includes("novinka")
            ? "Novinka"
            : row.tags?.includes("exkluzivně")
              ? "Exkluzivně"
              : undefined,
    kind: KIND_MAP[row.kind] || "byt",
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  };
}

export function dealTypeLabel(deal: string): string {
  return DEAL_LABEL[deal] || deal;
}

export function dealToCategory(deal: string): string {
  if (deal === "SALE") return "prodej";
  if (deal === "RENT") return "pronajem";
  return "investicni";
}
