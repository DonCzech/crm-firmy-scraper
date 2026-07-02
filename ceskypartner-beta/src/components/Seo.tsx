/**
 * SEO komponenta – využívá React 19 nativní hoist metadata do <head>.
 * Vkládej do každé stránky pro per-page title, description, canonical a OG tagy.
 */

const SITE_URL = 'https://www.online-odhad.cz';
const SITE_NAME = 'Online-Odhad.cz';
// og-image.svg je ve /public – pro produkci vyexportuj jako og-image.png (1200×630)
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

interface SeoProps {
  title: string;
  description: string;
  /** Cesta bez domény, např. "/online-kalkulacka" */
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  /** JSON-LD structured data jako objekt nebo pole objektů */
  jsonLd?: object | object[];
  /** Zabránit indexaci (pro děkovné stránky apod.) */
  noIndex?: boolean;
}

export function Seo({
  title,
  description,
  canonical = '/',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  jsonLd,
  noIndex = false,
}: SeoProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${canonical}`;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="cs_CZ" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(Array.isArray(jsonLd) ? { '@context': 'https://schema.org', '@graph': jsonLd } : jsonLd),
          }}
        />
      )}
    </>
  );
}
