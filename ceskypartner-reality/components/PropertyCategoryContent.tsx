import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import CategoryBrowser from "@/components/CategoryBrowser";
import WatchdogForm from "@/components/WatchdogForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import { getActiveListings, searchListings } from "@/lib/queries";
import { dbToCardListing } from "@/lib/mappers";
import { parseCategoryFilters, hasCategoryFilters } from "@/lib/searchFilters";
import { regionLabel } from "@/lib/regions";
import { INVESTICE, PRODEJ, PRONAJEM, type ListingKind } from "@/data/listings";
import { toEnglishListing } from "@/data/listings-en";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import type { DealType } from "@prisma/client";
import type { SiteLocale } from "@/lib/locale";

type SearchParams = {
  typ?: string; novinky?: string; kraj?: string; okres?: string; dispozice?: string;
  cena_min?: string; cena_max?: string; plocha_min?: string;
  type?: string; new?: string; region?: string; district?: string; layout?: string;
  price_min?: string; price_max?: string; area_min?: string;
};

type Config = {
  deal?: DealType;
  fallback: typeof PRODEJ;
  cs: { slug: string; eyebrow: string; title: string; description: string };
  en: { slug: string; eyebrow: string; title: string; description: string };
};

const CONFIGS: Config[] = [
  {
    deal: "SALE", fallback: PRODEJ,
    cs: { slug: "prodej", eyebrow: "Prodej", title: "Nemovitosti na prodej", description: "Byty, rodinné domy a vily, které jsme pro vás pečlivě vybrali a prověřili. Každou nemovitost známe osobně — od dispozice po sousedství." },
    en: { slug: "for-sale", eyebrow: "For sale", title: "Property for sale", description: "Apartments, family homes and villas chosen with care and checked in detail. We know every property personally, from its layout to its neighbourhood." },
  },
  {
    deal: "RENT", fallback: PRONAJEM,
    cs: { slug: "pronajem", eyebrow: "Pronájem", title: "Nemovitosti k pronájmu", description: "Rezidenční i komerční pronájmy s prověřenými vlastníky a smlouvami bez slabých míst. Nastěhujte se bez starostí." },
    en: { slug: "to-let", eyebrow: "To let", title: "Property to rent", description: "Residential and commercial rentals with verified owners, clear terms and attentive support from the first viewing to move-in day." },
  },
  {
    deal: "INVESTMENT", fallback: INVESTICE,
    cs: { slug: "investicni", eyebrow: "Investice", title: "Investiční nemovitosti", description: "Činžovní domy, komerční objekty a developerské projekty s prověřeným výnosem. Diskrétní jednání a kompletní datová místnost ke každé příležitosti." },
    en: { slug: "investment", eyebrow: "Investment", title: "Investment property", description: "Income-producing buildings, commercial assets and development opportunities backed by transparent documentation and clear fundamentals." },
  },
  {
    fallback: [...PRODEJ, ...PRONAJEM, ...INVESTICE],
    cs: { slug: "vse", eyebrow: "Nabídka", title: "Nabídka nemovitostí", description: "Kompletní aktuální nabídka — prodej, pronájem i investiční příležitosti. Každou nemovitost známe osobně a ručíme za prověřené podklady." },
    en: { slug: "all", eyebrow: "Property", title: "All properties", description: "Explore our complete collection of homes, rental property and carefully selected investment opportunities across the Czech Republic." },
  },
];

const TYPE_EN_TO_CS: Record<string, ListingKind> = {
  apartment: "byt", house: "dum", land: "pozemek", commercial: "komercni",
};
const VALID_KINDS: ListingKind[] = ["byt", "dum", "pozemek", "komercni"];
const KIND_TO_DB = { byt: "APARTMENT", dum: "HOUSE", pozemek: "LAND", komercni: "COMMERCIAL" } as const;
const REGION_EN: Record<string, string> = {
  prague: "Prague", stredocesky: "Central Bohemia", jihocesky: "South Bohemia", plzensky: "Plzeň Region",
  karlovarsky: "Karlovy Vary Region", ustecky: "Ústí nad Labem Region", liberecky: "Liberec Region",
  kralovehradecky: "Hradec Králové Region", pardubicky: "Pardubice Region", vysocina: "Vysočina Region",
  jihomoravsky: "South Moravia", olomoucky: "Olomouc Region", zlinsky: "Zlín Region", moravskoslezsky: "Moravian-Silesian Region",
};

export default async function PropertyCategoryContent({
  slug,
  locale = "cs",
  searchParams,
}: {
  slug: string;
  locale?: SiteLocale;
  searchParams: SearchParams;
}) {
  const en = locale === "en";
  const config = CONFIGS.find((item) => item[locale].slug === slug);
  if (!config) notFound();
  const copy = config[locale];

  const kind = en ? TYPE_EN_TO_CS[searchParams.type ?? ""] : searchParams.typ;
  const normalized = {
    typ: kind,
    kraj: en ? searchParams.region : searchParams.kraj,
    okres: en ? searchParams.district : searchParams.okres,
    dispozice: en ? searchParams.layout : searchParams.dispozice,
    cena_min: en ? searchParams.price_min : searchParams.cena_min,
    cena_max: en ? searchParams.price_max : searchParams.cena_max,
    plocha_min: en ? searchParams.area_min : searchParams.plocha_min,
  };
  const filters = parseCategoryFilters(normalized);
  const filtered = hasCategoryFilters(filters);
  const dbListings = filtered
    ? await searchListings({ ...filters, deal: config.deal }).catch(() => [])
    : await getActiveListings(config.deal).catch(() => []);
  const sourceListings = filtered
    ? dbListings.map(dbToCardListing)
    : dbListings.length > 0 ? dbListings.map(dbToCardListing) : config.fallback;
  const listings = en ? sourceListings.map(toEnglishListing) : sourceListings;
  const initialKind = VALID_KINDS.includes(kind as ListingKind) ? kind as ListingKind : null;
  const isNew = (en ? searchParams.new : searchParams.novinky) === "1";
  const pagePath = en ? `/en/properties/${copy.slug}` : `/nabidka/${copy.slug}`;
  const homePath = en ? "/en" : "/";

  const activeFilterLabels = [
    ...(filters.regions?.map((region) => en ? REGION_EN[region] ?? region : regionLabel(region)) ?? []),
    ...(filters.districts ?? []),
    ...(filters.disposition ? [filters.disposition] : []),
    ...(filters.priceMin ? [en ? `from CZK ${filters.priceMin.toLocaleString("en-GB")}` : `od ${filters.priceMin.toLocaleString("cs-CZ")} Kč`] : []),
    ...(filters.priceMax ? [en ? `up to CZK ${filters.priceMax.toLocaleString("en-GB")}` : `do ${filters.priceMax.toLocaleString("cs-CZ")} Kč`] : []),
    ...(filters.areaMin ? [en ? `minimum ${filters.areaMin} m²` : `min. ${filters.areaMin} m²`] : []),
  ];

  return (
    <>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: en ? "Home" : "Úvod", path: homePath }, { name: copy.title, path: pagePath }]),
        itemListJsonLd(listings.map((listing) => ({ name: listing.title, path: en ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}` }))),
      ]} />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <div id="category-hero">
            <nav aria-label={en ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
              <a href={homePath} className="transition-colors hover:text-ink">{en ? "Home" : "Úvod"}</a>
              <ChevronRight size={13} strokeWidth={1.5} />
              <span className="text-ink">{copy.title}</span>
            </nav>
            <Reveal className="mt-10">
              <div className="max-w-2xl">
                <p className="eyebrow text-bronze-deep">{copy.eyebrow}</p>
                <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">{copy.title}</h1>
                <p className="mt-5 text-[15.5px] leading-[1.7] text-muted">{copy.description}</p>
              </div>
            </Reveal>
          </div>

          {filtered && (
            <Reveal className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-muted">{en ? "Active filters:" : "Aktivní filtry:"}</span>
                {activeFilterLabels.map((label) => <span key={label} className="border border-line bg-stone px-3 py-1 text-[12.5px] font-medium text-ink">{label}</span>)}
                <a href={pagePath} className="ml-1 text-[12.5px] font-semibold text-bronze-deep underline-offset-4 transition-colors hover:text-ink hover:underline">
                  {en ? "Clear filters" : "Zrušit filtry"}
                </a>
              </div>
            </Reveal>
          )}

          <div className="mt-12">
            <CategoryBrowser listings={listings} initialKind={initialKind} initialNewOnly={isNew} title={copy.title} deal={config.deal} locale={locale} />
          </div>
          <Reveal className="mt-20">
            <WatchdogForm deal={config.deal} kind={initialKind ? KIND_TO_DB[initialKind] : null} locale={locale} />
          </Reveal>
        </div>
      </main>
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
