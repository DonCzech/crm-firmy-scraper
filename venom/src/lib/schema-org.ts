type Url = string;

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.length === 0) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as T;
}

export function buildOrganization(t: {
  name: string;
  url: Url;
  logoUrl?: string;
  sameAs?: string[];
  description?: string;
}) {
  return clean({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t.name,
    url: t.url,
    logo: t.logoUrl,
    sameAs: t.sameAs,
    description: t.description,
  });
}

export function buildLocalBusiness(t: {
  name: string;
  url: Url;
  schemaType?: string;
  phone?: string;
  email?: string;
  address?: { street?: string; city?: string; postalCode?: string; country?: string };
  geo?: { lat: number; lng: number };
  openingHours?: string[];
  image?: string;
  priceRange?: string;
  description?: string;
}) {
  const address = t.address
    ? clean({
        "@type": "PostalAddress",
        streetAddress: t.address.street,
        addressLocality: t.address.city,
        postalCode: t.address.postalCode,
        addressCountry: t.address.country,
      })
    : undefined;
  const addressFinal = address && Object.keys(address).length > 1 ? address : undefined;

  const geo = t.geo
    ? { "@type": "GeoCoordinates", latitude: t.geo.lat, longitude: t.geo.lng }
    : undefined;

  return clean({
    "@context": "https://schema.org",
    "@type": t.schemaType ?? "LocalBusiness",
    name: t.name,
    url: t.url,
    telephone: t.phone,
    email: t.email,
    address: addressFinal,
    geo,
    openingHoursSpecification: t.openingHours,
    image: t.image,
    priceRange: t.priceRange,
    description: t.description,
  });
}

export function buildWebSite({
  name,
  url,
  inLanguage,
  searchUrl,
}: {
  name: string;
  url: Url;
  inLanguage?: string;
  searchUrl?: string;
}) {
  const potentialAction = searchUrl
    ? {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${searchUrl}{search_term_string}` },
        "query-input": "required name=search_term_string",
      }
    : undefined;

  return clean({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    inLanguage,
    potentialAction,
  });
}

export function buildBreadcrumbList(items: Array<{ name: string; url: Url }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticle(p: {
  headline: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  url: Url;
  description?: string;
}) {
  const author = p.authorName ? { "@type": "Person", name: p.authorName } : undefined;
  return clean({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.headline,
    image: p.image,
    datePublished: p.datePublished,
    dateModified: p.dateModified,
    author,
    url: p.url,
    description: p.description,
  });
}

export function buildFAQPage(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildProduct(p: {
  name: string;
  image?: string;
  description?: string;
  price?: number;
  currency?: string;
  sku?: string;
}) {
  const offers =
    p.price !== undefined
      ? clean({
          "@type": "Offer",
          price: p.price,
          priceCurrency: p.currency,
        })
      : undefined;

  return clean({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.image,
    description: p.description,
    sku: p.sku,
    offers,
  });
}

export function buildService(p: {
  name: string;
  image?: string;
  description?: string;
  provider?: string;
}) {
  const provider = p.provider ? { "@type": "Organization", name: p.provider } : undefined;
  return clean({
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.name,
    image: p.image,
    description: p.description,
    provider,
  });
}
