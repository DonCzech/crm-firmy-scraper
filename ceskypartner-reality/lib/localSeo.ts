// Programmatic SEO — lokalitní landing pages /nemovitosti/[slug]
// Kombinace obchod × typ × kraj (např. prodej-bytu-praha) s přirozenými
// českými texty. Zdroj pravdy pro generateStaticParams, sitemap i prolinkování.

import type { DealType, PropertyKind } from "@prisma/client";

export type LocalDeal = {
  value: DealType;
  slug: string;
  /** „Prodej" / „Pronájem" */
  label: string;
  /** „na prodej" / „k pronájmu" */
  suffix: string;
};

export type LocalKind = {
  value: PropertyKind;
  slug: string;
  /** „Byty" */
  plural: string;
  /** „bytů" */
  genitive: string;
  /** „byt" */
  singular: string;
};

export type LocalRegion = {
  value: string;
  slug: string;
  /** „Praha" */
  label: string;
  /** „v Praze" */
  locative: string;
};

export const LOCAL_DEALS: LocalDeal[] = [
  { value: "SALE", slug: "prodej", label: "Prodej", suffix: "na prodej" },
  { value: "RENT", slug: "pronajem", label: "Pronájem", suffix: "k pronájmu" },
];

export const LOCAL_KINDS: LocalKind[] = [
  { value: "APARTMENT", slug: "bytu", plural: "Byty", genitive: "bytů", singular: "byt" },
  { value: "HOUSE", slug: "domu", plural: "Rodinné domy", genitive: "rodinných domů", singular: "dům" },
  { value: "LAND", slug: "pozemku", plural: "Pozemky", genitive: "pozemků", singular: "pozemek" },
  { value: "COMMERCIAL", slug: "komercnich-prostor", plural: "Komerční prostory", genitive: "komerčních prostor", singular: "komerční prostor" },
];

export const LOCAL_REGIONS: LocalRegion[] = [
  { value: "prague", slug: "praha", label: "Praha", locative: "v Praze" },
  { value: "stredocesky", slug: "stredocesky-kraj", label: "Středočeský kraj", locative: "ve Středočeském kraji" },
  { value: "jihocesky", slug: "jihocesky-kraj", label: "Jihočeský kraj", locative: "v Jihočeském kraji" },
  { value: "plzensky", slug: "plzensky-kraj", label: "Plzeňský kraj", locative: "v Plzeňském kraji" },
  { value: "karlovarsky", slug: "karlovarsky-kraj", label: "Karlovarský kraj", locative: "v Karlovarském kraji" },
  { value: "ustecky", slug: "ustecky-kraj", label: "Ústecký kraj", locative: "v Ústeckém kraji" },
  { value: "liberecky", slug: "liberecky-kraj", label: "Liberecký kraj", locative: "v Libereckém kraji" },
  { value: "kralovehradecky", slug: "kralovehradecky-kraj", label: "Královéhradecký kraj", locative: "v Královéhradeckém kraji" },
  { value: "pardubicky", slug: "pardubicky-kraj", label: "Pardubický kraj", locative: "v Pardubickém kraji" },
  { value: "vysocina", slug: "vysocina", label: "Vysočina", locative: "na Vysočině" },
  { value: "jihomoravsky", slug: "jihomoravsky-kraj", label: "Jihomoravský kraj", locative: "v Jihomoravském kraji" },
  { value: "olomoucky", slug: "olomoucky-kraj", label: "Olomoucký kraj", locative: "v Olomouckém kraji" },
  { value: "zlinsky", slug: "zlinsky-kraj", label: "Zlínský kraj", locative: "ve Zlínském kraji" },
  { value: "moravskoslezsky", slug: "moravskoslezsky-kraj", label: "Moravskoslezský kraj", locative: "v Moravskoslezském kraji" },
];

export type LocalPage = {
  slug: string;
  deal: LocalDeal;
  kind: LocalKind;
  region: LocalRegion | null;
};

/** Všechny lokalitní stránky: deal×kind (8) + deal×kind×kraj (112) = 120 */
export function allLocalPages(): LocalPage[] {
  const pages: LocalPage[] = [];
  for (const deal of LOCAL_DEALS) {
    for (const kind of LOCAL_KINDS) {
      pages.push({ slug: `${deal.slug}-${kind.slug}`, deal, kind, region: null });
      for (const region of LOCAL_REGIONS) {
        pages.push({ slug: `${deal.slug}-${kind.slug}-${region.slug}`, deal, kind, region });
      }
    }
  }
  return pages;
}

const PAGE_MAP = new Map(allLocalPages().map((p) => [p.slug, p]));

export function getLocalPage(slug: string): LocalPage | null {
  return PAGE_MAP.get(slug) ?? null;
}

/** H1 — „Prodej bytů v Praze" */
export function localTitle(p: LocalPage): string {
  return `${p.deal.label} ${p.kind.genitive}${p.region ? ` ${p.region.locative}` : ""}`;
}
