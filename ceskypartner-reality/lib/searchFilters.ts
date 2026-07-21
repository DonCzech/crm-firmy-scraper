import type { DealType, PropertyKind } from "@prisma/client";
import type { ListingSearchFilters } from "./queries";

const DEALS = new Set(["SALE", "RENT", "INVESTMENT"]);
const KINDS = new Set(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"]);

/** Mapa české URL hodnoty `typ` → Prisma PropertyKind (sdíleno webem i API). */
export const KIND_PARAM_MAP: Record<string, PropertyKind> = {
  byt: "APARTMENT",
  dum: "HOUSE",
  pozemek: "LAND",
  komercni: "COMMERCIAL",
};

/** Parsuje filtry z query stringu API (`/api/search`). */
export function parseSearchFilters(sp: URLSearchParams): ListingSearchFilters {
  const deal = sp.get("deal");
  const kind = sp.get("kind");
  const priceMin = Number(sp.get("priceMin"));
  const priceMax = Number(sp.get("priceMax"));
  const areaMin = Number(sp.get("areaMin"));

  return {
    ...(deal && DEALS.has(deal) ? { deal: deal as DealType } : {}),
    ...(kind && KINDS.has(kind) ? { kind: kind as PropertyKind } : {}),
    ...(sp.get("regions") ? { regions: sp.get("regions")!.split(",").filter(Boolean) } : {}),
    ...(sp.get("districts") ? { districts: sp.get("districts")!.split(",").filter(Boolean) } : {}),
    ...(sp.get("disposition") ? { disposition: sp.get("disposition")! } : {}),
    ...(priceMin > 0 ? { priceMin } : {}),
    ...(priceMax > 0 ? { priceMax } : {}),
    ...(areaMin > 0 ? { areaMin } : {}),
  };
}

/** Parsuje české filtry z URL stránky nabídky (`/nabidka/*?typ=…&kraj=…`). */
export function parseCategoryFilters(sp: {
  typ?: string;
  kraj?: string;
  okres?: string;
  dispozice?: string;
  cena_min?: string;
  cena_max?: string;
  plocha_min?: string;
}): Omit<ListingSearchFilters, "deal"> {
  const kind = sp.typ ? KIND_PARAM_MAP[sp.typ] : undefined;
  const priceMin = Number(sp.cena_min);
  const priceMax = Number(sp.cena_max);
  const areaMin = Number(sp.plocha_min);

  return {
    ...(kind ? { kind } : {}),
    ...(sp.kraj ? { regions: sp.kraj.split(",").filter(Boolean) } : {}),
    ...(sp.okres ? { districts: sp.okres.split(",").filter(Boolean) } : {}),
    ...(sp.dispozice ? { disposition: sp.dispozice } : {}),
    ...(priceMin > 0 ? { priceMin } : {}),
    ...(priceMax > 0 ? { priceMax } : {}),
    ...(areaMin > 0 ? { areaMin } : {}),
  };
}

/** True, pokud URL obsahuje aspoň jeden vyhledávací filtr. */
export function hasCategoryFilters(f: Omit<ListingSearchFilters, "deal">): boolean {
  return Object.keys(f).length > 0;
}
