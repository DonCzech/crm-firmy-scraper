import { allLocalPages, type LocalPage } from "./localSeo";

const KIND: Record<string, { slug: string; plural: string; singular: string }> = {
  APARTMENT: { slug: "apartments", plural: "Apartments", singular: "apartment" },
  HOUSE: { slug: "houses", plural: "Houses and villas", singular: "house" },
  LAND: { slug: "land", plural: "Land", singular: "plot" },
  COMMERCIAL: { slug: "commercial-property", plural: "Commercial property", singular: "commercial property" },
};

const REGION: Record<string, { slug: string; label: string }> = {
  prague: { slug: "prague", label: "Prague" },
  stredocesky: { slug: "central-bohemia", label: "Central Bohemia" },
  jihocesky: { slug: "south-bohemia", label: "South Bohemia" },
  plzensky: { slug: "plzen-region", label: "the Plzeň Region" },
  karlovarsky: { slug: "karlovy-vary-region", label: "the Karlovy Vary Region" },
  ustecky: { slug: "usti-nad-labem-region", label: "the Ústí nad Labem Region" },
  liberecky: { slug: "liberec-region", label: "the Liberec Region" },
  kralovehradecky: { slug: "hradec-kralove-region", label: "the Hradec Králové Region" },
  pardubicky: { slug: "pardubice-region", label: "the Pardubice Region" },
  vysocina: { slug: "vysocina", label: "Vysočina" },
  jihomoravsky: { slug: "south-moravia", label: "South Moravia" },
  olomoucky: { slug: "olomouc-region", label: "the Olomouc Region" },
  zlinsky: { slug: "zlin-region", label: "the Zlín Region" },
  moravskoslezsky: { slug: "moravian-silesian-region", label: "the Moravian-Silesian Region" },
};

export type EnglishLocalPage = {
  slug: string;
  czechSlug: string;
  source: LocalPage;
  title: string;
  kind: (typeof KIND)[string];
  region: { slug: string; label: string } | null;
  action: "for sale" | "to rent";
};

export function allEnglishLocalPages(): EnglishLocalPage[] {
  return allLocalPages().map((page) => {
    const kind = KIND[page.kind.value];
    const region = page.region ? REGION[page.region.value] : null;
    const action = page.deal.value === "SALE" ? "for sale" : "to rent";
    const slug = `${kind.slug}-${page.deal.value === "SALE" ? "for-sale" : "to-rent"}${region ? `-${region.slug}` : ""}`;
    return {
      slug,
      czechSlug: page.slug,
      source: page,
      title: `${kind.plural} ${action}${region ? ` in ${region.label}` : " in the Czech Republic"}`,
      kind,
      region,
      action,
    };
  });
}

const ENGLISH_LOCAL_PAGE_MAP = new Map(allEnglishLocalPages().map((page) => [page.slug, page]));

export function getEnglishLocalPage(slug: string): EnglishLocalPage | null {
  return ENGLISH_LOCAL_PAGE_MAP.get(slug) ?? null;
}

