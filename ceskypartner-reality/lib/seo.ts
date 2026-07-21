// Sdílené SEO utility — absolutní URL, JSON-LD data pro nemovitosti a firmu.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ceskypartner.cz";
export const SITE_NAME = "Český Partner";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Organizace / realitní kancelář — celoweb (footer layoutu) */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: `${SITE_NAME} — realitní kancelář`,
    url: SITE_URL,
    telephone: "+420 224 000 111",
    email: "info@ceskypartner.cz",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Václavské náměstí 1",
      postalCode: "110 00",
      addressLocality: "Praha 1",
      addressCountry: "CZ",
    },
    areaServed: "Česká republika",
  };
}

type ListingSeo = {
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  priceHidden?: boolean;
  isRent: boolean;
  location: string;
  area?: number | null;
  disposition?: string | null;
  image?: string | null;
  lat?: number | null;
  lng?: number | null;
  sold?: boolean;
};

/** Inzerát nemovitosti — detail stránka */
export function listingJsonLd(l: ListingSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: l.title,
    description: l.description?.slice(0, 500) || `${l.title}, ${l.location}`,
    image: l.image || undefined,
    url: absoluteUrl(`/nemovitost/${l.slug}`),
    category: "Nemovitost",
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/nemovitost/${l.slug}`),
      priceCurrency: "CZK",
      price: l.priceHidden ? undefined : l.price,
      availability: l.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      businessFunction: l.isRent ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
      seller: { "@type": "RealEstateAgent", name: SITE_NAME, url: SITE_URL },
    },
    ...(l.lat && l.lng
      ? {
          subjectOf: {
            "@type": "Place",
            geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
            address: l.location,
          },
        }
      : {}),
  };
}

/** Drobečková navigace */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Výpis inzerátů v kategorii */
export function itemListJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 30).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
