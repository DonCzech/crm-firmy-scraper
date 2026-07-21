import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ChevronRight, MapPin } from "lucide-react";
import ContactAgentForm from "@/components/ContactAgentForm";
import DetailMap from "@/components/DetailMap";
import EnergyLabel, { EnergyBadgeInline, energyClassLabel } from "@/components/EnergyLabel";
import FavoriteButton from "@/components/FavoriteButton";
import MortgageCalculator from "@/components/MortgageCalculator";
import Footer from "@/components/Footer";
import GalleryLightbox from "@/components/GalleryLightbox";
import Header from "@/components/Header";
import ListingSection from "@/components/ListingSection";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import ShareActions from "@/components/ShareActions";
import VirtualTour from "@/components/VirtualTour";
import { getListingBySlug, getSimilarListings } from "@/lib/queries";
import { isWatermarkEnabled } from "@/lib/settings";
import { dbToCardListing, dealTypeLabel, dealToCategory } from "@/lib/mappers";
import { regionLabel } from "@/lib/regions";
import { optionLabel, OWNERSHIP_OPTIONS, CONDITION_OPTIONS, CONSTRUCTION_OPTIONS, FURNISHING_OPTIONS } from "@/lib/listingOptions";
import { getListingDetail } from "@/data/details";
import { formatPrice } from "@/data/listings";
import { toEnglishListing } from "@/data/listings-en";
import { englishListingDescription } from "@/data/listing-details-en";
import { absoluteUrl, listingJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import type { SiteLocale } from "@/lib/locale";

// ISR — detail se předrenderuje a drží v cache; admin změny ji invalidují
// přes revalidatePath, časová revalidace je pojistka
function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

type PageProps = { params: { id: string } };

const AMENITY_EN: Record<string, string> = {
  "Vestavěné skříně na míru": "Bespoke fitted wardrobes",
  "Kuchyně s vinotékou a spotřebiči Miele": "Kitchen with wine cabinet and Miele appliances",
  "Dubové podlahy": "Oak flooring",
  "Podlahové vytápění": "Underfloor heating",
  Klimatizace: "Air conditioning",
  "Chytrá domácnost": "Smart-home system",
  "Bezpečnostní vstupní dveře": "Security entrance door",
  "Sklepní kóje": "Private cellar",
  Výtah: "Lift",
  Videovrátný: "Video entry system",
  "Zahrada s automatickou závlahou": "Garden with automatic irrigation",
  "Dvojgaráž s nabíječkou pro elektromobil": "Double garage with EV charger",
  "Krbová vložka": "Built-in fireplace",
  "Tepelné čerpadlo": "Heat pump",
  "Rekuperace vzduchu": "Heat-recovery ventilation",
  "Venkovní terasa s pergolou": "Outdoor terrace with pergola",
  "Alarm a kamerový systém": "Alarm and CCTV system",
  "Studna na pozemku": "Private well",
  "Fotovoltaická elektrárna": "Solar photovoltaic system",
  "Recepce s ostrahou 24/7": "24/7 staffed reception",
  "Klimatizace a rekuperace": "Air conditioning and heat recovery",
  "Zdvojené podlahy": "Raised access floors",
  "Optická konektivita": "Fibre connectivity",
  "Parkování v objektu": "On-site parking",
  "Zázemí pro cyklisty": "Cyclist facilities",
  "Certifikace BREEAM": "BREEAM certification",
  "Záložní zdroj energie": "Backup power supply",
};

const OVERVIEW_LABEL_EN: Record<string, string> = {
  "Referenční číslo": "Reference",
  Nájemné: "Rent",
  Cena: "Price",
  Dispozice: "Layout",
  "Užitná plocha": "Floor area",
  Podlaží: "Floor",
  Stav: "Condition",
  Vlastnictví: "Ownership",
  PENB: "Energy rating",
  Výnos: "Yield",
  "K dispozici": "Availability",
};
const OPTION_VALUE_EN: Record<string, string> = {
  PERSONAL: "Private", COOPERATIVE: "Co-operative", STATE: "State / municipal",
  NEW_BUILD: "New build", VERY_GOOD: "Very good", GOOD: "Good", TO_RECONSTRUCT: "For refurbishment",
  UNDER_CONSTRUCTION: "Under construction", DEVELOPER_PROJECT: "Development project",
  BRICK: "Brick", PANEL: "Panel", WOOD: "Timber", STONE: "Stone", MIXED: "Mixed",
  SKELETON: "Frame construction", LOW_ENERGY: "Low-energy",
  FURNISHED: "Furnished", PARTLY: "Part-furnished", UNFURNISHED: "Unfurnished",
};

function overviewValueEn(value: string): string {
  return value
    .replace(" / měsíc", " / month")
    .replace("podlaží z", "floor of")
    .replace("Po kompletní rekonstrukci", "Fully refurbished")
    .replace("Velmi dobrý", "Very good")
    .replace("Osobní", "Private")
    .replace("Třída ", "Class ")
    .replace("Ihned", "Immediately")
    .replace("Dle dohody", "By agreement")
    .replace(/\bKč\b/g, "CZK");
}

const COPY = {
  cs: {
    home: "Úvod", rent: "Pronájem", sale: "Prodej", investment: "Investiční příležitost",
    breadcrumb: "Drobečková navigace", rentPrice: "Nájemné", price: "Cena", area: "Plocha",
    layout: "Dispozice", type: "Typ", location: "Lokalita", about: "O nemovitosti",
    tour: "3D prohlídka", tourText: "Projděte si nemovitost interaktivně — místnost po místnosti, s fotografiemi shodnými s galerií inzerátu.",
    amenities: "Vybavení a vlastnosti", details: "Podrobné informace", financing: "Financování",
    relatedEyebrow: "Mohlo by vás zajímat", relatedTitle: "Podobné nemovitosti", all: "Celá nabídka",
  },
  en: {
    home: "Home", rent: "To let", sale: "For sale", investment: "Investment opportunity",
    breadcrumb: "Breadcrumb", rentPrice: "Rent", price: "Price", area: "Floor area",
    layout: "Layout", type: "Type", location: "Location", about: "About the property",
    tour: "3D tour", tourText: "Explore the property interactively, room by room, using the same photography as the listing gallery.",
    amenities: "Features and amenities", details: "Property details", financing: "Financing",
    relatedEyebrow: "You may also like", relatedTitle: "Similar properties", all: "View all properties",
  },
} as const;

function localizedListingJsonLd(
  input: Parameters<typeof listingJsonLd>[0],
  slug: string,
  locale: SiteLocale
) {
  const data = listingJsonLd(input);
  if (locale !== "en") return data;
  const url = absoluteUrl(`/en/property/${slug}`);
  return {
    ...data,
    url,
    category: "Real estate",
    inLanguage: "en-GB",
    offers: {
      ...data.offers,
      url,
      seller: { ...data.offers.seller, url: absoluteUrl("/en") },
    },
  };
}

export async function generateCzechMetadata({ params }: PageProps): Promise<Metadata> {
  const dbListing = await getListingBySlug(params.id).catch(() => null);
  if (dbListing) {
    const dt = dealTypeLabel(dbListing.deal);
    const priceText = dbListing.priceHidden
      ? ""
      : ` za ${dbListing.price.toLocaleString("cs-CZ")} Kč${dbListing.deal === "RENT" ? "/měsíc" : ""}`;
    const title = `${dt} — ${dbListing.title}, ${dbListing.location}`;
    const description =
      dbListing.description?.slice(0, 155) ||
      `${dbListing.title} v lokalitě ${dbListing.location}${priceText}. Exkluzivně u realitní kanceláře Český Partner.`;
    return {
      title,
      description,
      alternates: {
        canonical: `/nemovitost/${dbListing.slug}`,
        languages: {
          "cs-CZ": `/nemovitost/${dbListing.slug}`,
          "en-GB": `/en/property/${dbListing.slug}`,
          "x-default": `/nemovitost/${dbListing.slug}`,
        },
      },
      // OG obrázek generuje opengraph-image.tsx (brandovaná kartička)
      openGraph: { title, description, type: "article" },
    };
  }
  const detail = getListingDetail(params.id);
  if (!detail) return {};
  const title = `${detail.dealType} — ${detail.listing.title}, ${detail.listing.location}`;
  return {
    title,
    description: detail.description[0].slice(0, 160),
    alternates: {
      canonical: `/nemovitost/${params.id}`,
      languages: {
        "cs-CZ": `/nemovitost/${params.id}`,
        "en-GB": `/en/property/${params.id}`,
        "x-default": `/nemovitost/${params.id}`,
      },
    },
    openGraph: { title, description: detail.description[0].slice(0, 160), type: "article" },
  };
}

export default async function ListingDetailContent({ params, locale = "cs" }: PageProps & { locale?: SiteLocale }) {
  const en = locale === "en";
  const t = COPY[locale];
  const dbListing = await getListingBySlug(params.id).catch(() => null);

  if (dbListing) {
    return <DbDetailView listing={dbListing} locale={locale} />;
  }

  const sourceDetail = getListingDetail(params.id);
  if (!sourceDetail) notFound();

  const {
    refNumber, gallery, coords, tourUrl,
  } = sourceDetail;
  const listing = en ? toEnglishListing(sourceDetail.listing) : sourceDetail.listing;
  const dealType = en
    ? sourceDetail.dealType === "Pronájem" ? t.rent : sourceDetail.dealType === "Prodej" ? t.sale : t.investment
    : sourceDetail.dealType;
  const description = en ? [englishListingDescription(listing.id)] : sourceDetail.description;
  const amenities = en ? sourceDetail.amenities.map((item) => AMENITY_EN[item] ?? item) : sourceDetail.amenities;
  const overview = en
    ? sourceDetail.overview.map(([label, value]) => [OVERVIEW_LABEL_EN[label] ?? label, overviewValueEn(value)] as [string, string])
    : sourceDetail.overview;
  const locationText = en
    ? `${listing.location} offers excellent everyday amenities and convenient connections. Cafés, restaurants, schools, green spaces and public transport are all within easy reach.`
    : sourceDetail.locationText;
  const agent = en ? {
    ...sourceDetail.agent,
    role: sourceDetail.agent.role === "Senior makléřka"
      ? "Senior real estate agent"
      : sourceDetail.agent.role === "Specialistka na investice"
        ? "Investment specialist"
        : "Real estate agent",
  } : sourceDetail.agent;
  const similar = en ? sourceDetail.similar.map(toEnglishListing) : sourceDetail.similar;
  const [lat, lng] = coords;
  const categoryHref = en
    ? sourceDetail.dealType === "Pronájem" ? "/en/properties/to-let" : sourceDetail.dealType === "Prodej" ? "/en/properties/for-sale" : "/en/properties/investment"
    : dealType === "Pronájem" ? "/nabidka/pronajem" : dealType === "Prodej" ? "/nabidka/prodej" : "/nabidka/investicni";
  const watermark = await isWatermarkEnabled();
  // PENB z přehledové tabulky — pro vizuální energetický štítek
  const penbGrade = sourceDetail.overview.find(([label]) => label === "PENB")?.[1]?.match(/[A-G]/)?.[0] ?? null;
  const overviewLeft = overview.slice(0, Math.ceil(overview.length / 2));
  const overviewRight = overview.slice(Math.ceil(overview.length / 2));

  return (
    <>
      <JsonLd
        data={[
          localizedListingJsonLd({
            title: listing.title,
            slug: listing.id,
            description: description[0],
            price: listing.price,
            isRent: sourceDetail.dealType === "Pronájem",
            location: listing.location,
            area: listing.area,
            disposition: listing.disposition,
            image: gallery[0],
            lat,
            lng,
          }, listing.id, locale),
          breadcrumbJsonLd([
            { name: t.home, path: en ? "/en" : "/" },
            { name: dealType, path: categoryHref },
            { name: listing.title, path: en ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}` },
          ]),
        ]}
      />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-8 pt-10 xl:px-10">
          <nav aria-label={t.breadcrumb} className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
            <a href={en ? "/en" : "/"} className="transition-colors hover:text-ink">{t.home}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <a href={categoryHref} className="transition-colors hover:text-ink">{dealType}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{listing.title}</span>
          </nav>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-bronze-deep">{dealType}{listing.disposition ? ` · ${listing.disposition}` : ""} · ref. {refNumber}</p>
              <h1 className="mt-3 max-w-3xl text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">{listing.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-[15px] text-muted">
                <MapPin size={15} strokeWidth={1.5} className="text-bronze" />{listing.location}
              </p>
            </div>
            <div className="flex w-full items-end justify-between gap-6 sm:w-auto sm:justify-start">
              <div className="text-left sm:text-right">
                <p className="eyebrow text-muted">{sourceDetail.dealType === "Pronájem" ? t.rentPrice : t.price}</p>
                <p className="mt-2 text-[clamp(1.6rem,2.6vw,2.3rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">{formatPrice(listing, locale)}</p>
                {penbGrade && (
                  <p className="mt-3">
                    <EnergyBadgeInline grade={penbGrade} locale={locale} />
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2.5 print:hidden">
                <ShareActions title={listing.title} locale={locale} />
                <FavoriteButton id={listing.id} variant="detail" locale={locale} />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-site px-6 xl:px-10">
          <div className="md:h-[560px] [&>div:first-child]:h-full">
            <GalleryLightbox images={gallery} title={listing.title} tourUrl={tourUrl} watermark={watermark} exclusive locale={locale} />
          </div>
        </div>
        <div className="mx-auto grid max-w-site gap-14 px-6 py-16 lg:grid-cols-[1fr_400px] lg:gap-20 xl:px-10">
          <div>
            <Reveal>
              <dl className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
                {[
                  [sourceDetail.dealType === "Pronájem" ? t.rentPrice : t.price, formatPrice(listing, locale)],
                  [t.area, `${listing.area.toLocaleString(en ? "en-GB" : "cs-CZ")} m²`],
                  [listing.disposition ? t.layout : t.type, listing.disposition ?? dealType],
                  [t.location, listing.location.split(" — ")[0]],
                ].map(([label, value]) => (
                  <div key={label} className="bg-paper px-5 py-5">
                    <dt className="eyebrow text-muted">{label}</dt>
                    <dd className="mt-2 text-[15.5px] font-semibold tracking-[-0.01em]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal className="mt-14">
              <p className="eyebrow text-muted">{t.about}</p>
              <div className="mt-6 space-y-5 text-[15.5px] leading-[1.75] text-ink/85">
                {description.map((para) => (<p key={para.slice(0, 24)}>{para}</p>))}
              </div>
            </Reveal>
            {tourUrl && (
              <Reveal className="mt-14 print:hidden">
                <p className="eyebrow text-muted">{t.tour}</p>
                <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-muted">
                  {t.tourText}
                </p>
                <div className="mt-6">
                  <VirtualTour url={tourUrl} poster={gallery[0]} title={listing.title} locale={locale} />
                </div>
              </Reveal>
            )}
            <Reveal className="mt-14">
              <p className="eyebrow text-muted">{t.amenities}</p>
              <ul className="mt-6 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
                {amenities.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14.5px]">
                    <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-bronze" />{item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="mt-14">
              <p className="eyebrow text-muted">{t.details}</p>
              <div className="mt-6 grid gap-x-16 md:grid-cols-2">
                {[overviewLeft, overviewRight].map((column, ci) => (
                  <dl key={ci} className={ci === 1 ? "max-md:-mt-px" : ""}>
                    {column.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[auto_1fr] gap-6 border-b border-line py-3.5 text-[14.5px] first:border-t">
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-right font-semibold tracking-[-0.01em]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ))}
              </div>
              {penbGrade && (
                <div className="mt-8">
                  <EnergyLabel grade={penbGrade} locale={locale} />
                </div>
              )}
            </Reveal>
            {sourceDetail.dealType !== "Pronájem" && (
              <Reveal className="mt-14 print:hidden">
                <p className="eyebrow text-muted">{t.financing}</p>
                <div className="mt-6">
                  <MortgageCalculator price={listing.price} listingTitle={listing.title} refNumber={refNumber} locale={locale} />
                </div>
              </Reveal>
            )}
            <Reveal className="mt-14">
              <p className="eyebrow text-muted">{t.location}</p>
              <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-muted">{locationText}</p>
              <div className="relative mt-6 aspect-[4/3] overflow-hidden border border-line print:hidden md:aspect-[16/8]">
                <DetailMap lat={lat} lng={lng} title={listing.location} locale={locale} />
              </div>
            </Reveal>
          </div>
          <aside>
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <Reveal delay={100}>
                <ContactAgentForm agent={agent} refNumber={refNumber} listingTitle={listing.title} locale={locale} />
              </Reveal>
            </div>
          </aside>
        </div>
        <div className="print:hidden"><ListingSection id="podobne" eyebrow={t.relatedEyebrow} title={t.relatedTitle} ctaLabel={t.all} ctaHref={categoryHref} listings={similar} tone="stone" locale={locale} /></div>
      </main>
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}

async function DbDetailView({ listing: l, locale = "cs" }: { listing: NonNullable<Awaited<ReturnType<typeof getListingBySlug>>>; locale?: SiteLocale }) {
  const en = locale === "en";
  const t = COPY[locale];
  const dealTypeCs = dealTypeLabel(l.deal);
  const dealType = en ? l.deal === "RENT" ? t.rent : l.deal === "SALE" ? t.sale : t.investment : dealTypeCs;
  const isRent = l.deal === "RENT";
  const categoryHref = en
    ? l.deal === "RENT" ? "/en/properties/to-let" : l.deal === "SALE" ? "/en/properties/for-sale" : "/en/properties/investment"
    : `/nabidka/${dealToCategory(l.deal)}`;
  const priceFormatted = l.priceHidden
    ? en ? "Price on request" : "Cena na vyžádání"
    : `${l.price.toLocaleString(en ? "en-GB" : "cs-CZ")} ${en ? "CZK" : "Kč"}${isRent ? en ? " / month" : " / měsíc" : ""}`;
  const gallery = l.images.length > 0 ? l.images.map((i) => i.url) : ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80&auto=format&fit=crop"];
  const descParagraphs = en
    ? [englishListingDescription(l.slug)]
    : l.description ? l.description.split("\n\n").filter(Boolean) : ["Podrobný popis nemovitosti bude doplněn."];
  const refNumber = `CP-${l.id.slice(-4).toUpperCase()}`;

  const similar = await getSimilarListings(l, 6).catch(() => []);
  const similarCards = similar.map(dbToCardListing).map((listing) => en ? toEnglishListing(listing) : listing);
  const watermark = await isWatermarkEnabled();

  const statusLabel = (en
    ? ({ RESERVED: "Reserved", SOLD: "Sold", RENTED: "Let" } as Record<string, string>)
    : ({ RESERVED: "Rezervováno", SOLD: "Prodáno", RENTED: "Pronajato" } as Record<string, string>))[l.status] || null;
  const isClosed = l.status === "SOLD" || l.status === "RENTED";
  // U prodaných/pronajatých nemovitostí cenu nezobrazujeme — místo hodnoty stojí status
  const priceDisplay = isClosed && statusLabel ? statusLabel.toUpperCase() : priceFormatted;
  const kindLabel = (en
    ? ({ APARTMENT: "Apartment", HOUSE: "House", LAND: "Land", COMMERCIAL: "Commercial property" } as Record<string, string>)
    : ({ APARTMENT: "Byt", HOUSE: "Rodinný dům", LAND: "Pozemek", COMMERCIAL: "Komerční prostor" } as Record<string, string>))[l.kind] || l.kind;
  const row = (label: string, value?: string | null): [string, string][] => (value ? [[label, value]] : []);

  // Podrobné informace — dva sloupce dle Remax: vlevo to nejdůležitější, vpravo doplňkové údaje
  const infoLeft: [string, string][] = [
    [en ? "Reference" : "Číslo zakázky", refNumber],
    [isRent ? t.rentPrice : t.price, priceDisplay],
    ...row(en ? "Property type" : "Typ nemovitosti", kindLabel),
    ...row(t.layout, l.disposition),
    ...row(t.area, l.area ? `${l.area.toLocaleString(en ? "en-GB" : "cs-CZ")} m²` : null),
    ...row(en ? "Plot area" : "Plocha pozemku", l.landArea ? `${l.landArea.toLocaleString(en ? "en-GB" : "cs-CZ")} m²` : null),
    ...row(en ? "Floor number" : "Číslo podlaží", l.floor != null ? `${l.floor}.` : null),
    ...row(en ? "Number of floors" : "Počet podlaží v objektu", l.floors ? String(l.floors) : null),
    ...row(en ? "Condition" : "Stav objektu", en && l.condition ? OPTION_VALUE_EN[l.condition] : optionLabel(CONDITION_OPTIONS, l.condition)),
    ...row(en ? "Ownership" : "Vlastnictví", en && l.ownership ? OPTION_VALUE_EN[l.ownership] : optionLabel(OWNERSHIP_OPTIONS, l.ownership)),
  ];
  const infoRight: [string, string][] = [
    ...row(en ? "Construction" : "Konstrukce budovy", en && l.construction ? OPTION_VALUE_EN[l.construction] : optionLabel(CONSTRUCTION_OPTIONS, l.construction)),
    ...row(en ? "Year built" : "Rok výstavby", l.yearBuilt ? String(l.yearBuilt) : null),
    ...row(en ? "Furnishing" : "Vybaveno", en && l.furnishing ? OPTION_VALUE_EN[l.furnishing] : optionLabel(FURNISHING_OPTIONS, l.furnishing)),
    ...row(en ? "Monthly charges" : "Měsíční náklady", l.monthlyFees ? `${l.monthlyFees.toLocaleString(en ? "en-GB" : "cs-CZ")} ${en ? "CZK" : "Kč"}` : null),
    ...row(en ? "Refundable deposit" : "Vratná kauce", l.deposit ? `${l.deposit.toLocaleString(en ? "en-GB" : "cs-CZ")} ${en ? "CZK" : "Kč"}` : null),
    ...row(en ? "Region" : "Kraj", l.region ? regionLabel(l.region) : null),
    ...row(en ? "District / area" : "Okres / oblast", l.district),
    ...row(en ? "Postcode" : "PSČ", l.zip),
    ...row(en ? "Building energy rating" : "Energetická náročnost budovy", l.penb ? en ? `Class ${l.penb}` : energyClassLabel(l.penb) || `Třída ${l.penb}` : null),
  ];

  const agent = l.agent ? {
    name: l.agent.name,
    role: en ? "Real estate agent" : "Realitní makléř/ka",
    phone: l.agent.phone || "",
    email: l.agent.email,
    photo: l.agent.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop",
  } : {
    name: "Český Partner",
    role: en ? "Real estate agency" : "Realitní kancelář",
    phone: "+420 800 123 456",
    email: "info@ceskypartner.cz",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop",
  };

  const lat = l.lat || 50.0755;
  const lng = l.lng || 14.4378;

  return (
    <>
      <JsonLd
        data={[
          localizedListingJsonLd({
            title: l.title,
            slug: l.slug,
            description: l.description,
            price: l.price,
            priceHidden: l.priceHidden,
            isRent,
            location: l.location,
            area: l.area,
            disposition: l.disposition,
            image: gallery[0],
            lat: l.lat,
            lng: l.lng,
            sold: isClosed,
          }, l.slug, locale),
          breadcrumbJsonLd([
            { name: t.home, path: en ? "/en" : "/" },
            { name: dealType, path: categoryHref },
            { name: l.title, path: en ? `/en/property/${l.slug}` : `/nemovitost/${l.slug}` },
          ]),
        ]}
      />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-8 pt-10 xl:px-10">
          <nav aria-label={t.breadcrumb} className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
            <a href={en ? "/en" : "/"} className="transition-colors hover:text-ink">{t.home}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <a href={categoryHref} className="transition-colors hover:text-ink">{dealType}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{l.title}</span>
          </nav>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
            <div>
              {statusLabel && (
                <p className="mb-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex px-3.5 py-2 text-[10.5px] font-semibold uppercase leading-none tracking-[0.22em] text-paper ${l.status === "RESERVED" ? "bg-bronze-deep" : "bg-muted"}`}>
                    {statusLabel}
                  </span>
                </p>
              )}
              <p className="eyebrow text-bronze-deep">{dealType}{l.disposition ? ` · ${l.disposition}` : ""} · ref. {refNumber}</p>
              <h1 className="mt-3 max-w-3xl text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">{l.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-[15px] text-muted">
                <MapPin size={15} strokeWidth={1.5} className="text-bronze" />
                {l.location}
                {l.region && l.region !== "prague" ? (
                  <span className="text-muted/70">· {regionLabel(l.region)}{en ? "" : " kraj"}</span>
                ) : null}
              </p>
            </div>
            <div className="flex w-full items-end justify-between gap-6 sm:w-auto sm:justify-start">
              <div className="text-left sm:text-right">
                <p className="eyebrow text-muted">{isRent ? t.rentPrice : t.price}</p>
                <p className={`mt-2 text-[clamp(1.6rem,2.6vw,2.3rem)] font-semibold leading-none tracking-[-0.02em] ${isClosed ? "text-muted" : "text-bronze-deep"}`}>{priceDisplay}</p>
                {l.penb && (
                  <p className="mt-3">
                    <EnergyBadgeInline grade={l.penb} locale={locale} />
                  </p>
                )}
                {l.priceNote && (
                  <p className="mt-2.5 max-w-[340px] text-[12.5px] leading-[1.55] text-muted">
                    <span className="font-semibold text-ink/70">{en ? "Price note:" : "Poznámka k ceně:"}</span> {l.priceNote}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2.5 print:hidden">
                <ShareActions title={l.title} locale={locale} />
                <FavoriteButton id={l.slug} variant="detail" locale={locale} />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-site px-6 xl:px-10">
          <div className="md:h-[560px] [&>div:first-child]:h-full">
            <GalleryLightbox images={gallery} title={l.title} tourUrl={l.tourUrl} watermark={watermark} exclusive soldLabel={statusLabel} soldEyebrow={l.status === "RESERVED" ? (en ? "A transaction is currently being negotiated" : "Probíhá jednání se zájemcem") : undefined} locale={locale} />
          </div>
        </div>
        {isClosed && (
          <div className="mx-auto max-w-site px-6 pt-10 xl:px-10">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-l-2 border-bronze bg-stone/60 px-6 py-5">
              <div>
                <p className="text-[16px] font-semibold tracking-[-0.01em]">
                  {en
                    ? l.status === "SOLD" ? "We have successfully sold this property" : "We have successfully let this property"
                    : l.status === "SOLD" ? "Tuto nemovitost jsme úspěšně prodali" : "Tuto nemovitost jsme úspěšně pronajali"}
                </p>
                <p className="mt-1 text-[13.5px] text-muted">
                  {en
                    ? "Browse similar properties below, or contact us and we will help you find the right alternative."
                    : <>Podobné nemovitosti najdete níže — nebo nám napište a najdeme vám {l.status === "SOLD" ? "novou k prodeji" : "jinou k pronájmu"}.</>}
                </p>
              </div>
              <a
                href={categoryHref}
                className="border border-ink px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                {en ? "Current properties" : "Aktuální nabídka"}
              </a>
            </div>
          </div>
        )}
        <div className="mx-auto grid max-w-site gap-14 px-6 py-16 lg:grid-cols-[1fr_400px] lg:gap-20 xl:px-10">
          <div>
            <Reveal>
              <dl className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
                {[
                  [isRent ? t.rentPrice : t.price, priceDisplay],
                  [t.area, l.area ? `${l.area.toLocaleString(en ? "en-GB" : "cs-CZ")} m²` : "—"],
                  [l.disposition ? t.layout : t.type, l.disposition || dealType],
                  [t.location, l.location.split(" — ")[0]],
                ].map(([label, value]) => (
                  <div key={label} className="bg-paper px-5 py-5">
                    <dt className="eyebrow text-muted">{label}</dt>
                    <dd className="mt-2 text-[15.5px] font-semibold tracking-[-0.01em]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal className="mt-14">
              <p className="eyebrow text-muted">{t.about}</p>
              <div className="mt-6 space-y-5 text-[15.5px] leading-[1.75] text-ink/85">
                {descParagraphs.map((para) => (<p key={para.slice(0, 24)}>{para}</p>))}
              </div>
            </Reveal>
            {l.tourUrl && (
              <Reveal className="mt-14 print:hidden">
                <p className="eyebrow text-muted">{t.tour}</p>
                <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-muted">
                  {t.tourText}
                </p>
                <div className="mt-6">
                  <VirtualTour url={l.tourUrl} poster={gallery[0]} title={l.title} locale={locale} />
                </div>
              </Reveal>
            )}
            {l.videoUrl && (() => {
              const embedUrl = videoEmbedUrl(l.videoUrl);
              return (
                <Reveal className="mt-14 print:hidden">
                  <p className="eyebrow text-muted">Video</p>
                  <div className="mt-6 aspect-video overflow-hidden border border-line">
                    {embedUrl ? (
                      <iframe
                        title={`Video — ${l.title}`}
                        src={embedUrl}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <video src={l.videoUrl} controls className="h-full w-full" poster={gallery[0]} />
                    )}
                  </div>
                </Reveal>
              );
            })()}
            {l.amenities.length > 0 && (
              <Reveal className="mt-14">
                <p className="eyebrow text-muted">{t.amenities}</p>
                <ul className="mt-6 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
                  {l.amenities.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14.5px]">
                      <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-bronze" />{en ? AMENITY_EN[item] ?? item : item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            <Reveal className="mt-14">
              <p className="eyebrow text-muted">{t.details}</p>
              {l.priceNote && (
                <p className="mt-6 border-l-2 border-bronze bg-stone/50 px-5 py-4 text-[14px] leading-[1.65] text-ink/85">
                  <span className="font-semibold">{en ? "Price note:" : "Poznámka k ceně:"}</span> {l.priceNote}
                </p>
              )}
              <div className="mt-6 grid gap-x-16 md:grid-cols-2">
                {[infoLeft, infoRight].map((column, ci) => (
                  <dl key={ci} className={ci === 1 ? "max-md:-mt-px" : ""}>
                    {column.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[auto_1fr] gap-6 border-b border-line py-3.5 text-[14.5px] first:border-t">
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-right font-semibold tracking-[-0.01em]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ))}
              </div>
              {l.penb && (
                <div className="mt-8">
                  <EnergyLabel grade={l.penb} locale={locale} />
                </div>
              )}
            </Reveal>
            {!isRent && !l.priceHidden && l.price > 0 && !isClosed && (
              <Reveal className="mt-14 print:hidden">
                <p className="eyebrow text-muted">{t.financing}</p>
                <div className="mt-6">
                  <MortgageCalculator price={l.price} listingTitle={l.title} refNumber={refNumber} listingId={l.id} locale={locale} />
                </div>
              </Reveal>
            )}
            {(l.lat && l.lng) && (
              <Reveal className="mt-14">
                <p className="eyebrow text-muted">{t.location}</p>
                <div className="relative mt-6 aspect-[4/3] overflow-hidden border border-line print:hidden md:aspect-[16/8]">
                  <DetailMap lat={lat} lng={lng} title={l.location} locale={locale} />
                </div>
              </Reveal>
            )}
          </div>
          <aside>
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <Reveal delay={100}>
                <ContactAgentForm agent={agent} refNumber={refNumber} listingTitle={l.title} listingId={l.id} locale={locale} />
              </Reveal>
            </div>
          </aside>
        </div>
        {similarCards.length > 0 && (
          <div className="print:hidden"><ListingSection id="podobne" eyebrow={t.relatedEyebrow} title={t.relatedTitle} ctaLabel={t.all} ctaHref={categoryHref} listings={similarCards} tone="stone" locale={locale} /></div>
        )}
      </main>
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
