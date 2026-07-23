import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Libre_Baskerville, Source_Sans_3, Oswald, Overpass, Overpass_Mono, Instrument_Serif, Montserrat } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import { LanguageSuggestionModal } from "@/components/LanguageSuggestionModal";
import type { PlatformLocale } from "@/lib/platform-i18n";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
  display: "optional",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-sans",
  display: "optional",
});

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const overpass = Overpass({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-overpass",
  display: "swap",
});

const overpassMono = Overpass_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-overpass-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: "Webero — Professional websites for local businesses",
  description:
    "Create a professional website for your business in 5 minutes. Barber, wellness, legal services, and more. Live editor, SEO, mobile optimization.",
  alternates: {
    canonical: BASE,
    languages: {
      cs: `${BASE}/cs`,
      en: BASE,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    url: BASE,
    siteName: "Webero",
    title: "Webero — Professional websites for local businesses",
    description: "A website for your business in 5 minutes. Barber, wellness, legal services. Live editor, SEO, mobile-ready.",
    locale: "en_US",
    images: [
      {
        url: "/templates/arch-01/hero-1.webp",
        width: 1200,
        height: 630,
        alt: "Webero — A professional website without a developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webero — Professional websites in 5 minutes",
    description: "Live editor, 100+ templates, EU hosting. No developer needed.",
    images: ["/templates/arch-01/hero-1.webp"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

const schemaWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  url: BASE,
  name: "Webero",
  description: "SaaS platform for creating professional websites for local businesses.",
  inLanguage: "en",
};

const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "Webero s.r.o.",
  url: BASE,
  logo: `${BASE}/apple-icon.png`,
  description: "Professional websites without a developer for local businesses.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+420-776-123-456",
    email: "podpora@webero.co",
    contactType: "customer support",
    areaServed: "CZ",
    availableLanguage: ["cs", "en"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "CZ",
    addressLocality: "Praha",
  },
};

const schemaProduct = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${BASE}/#product`,
  name: "Webero",
  description: "A professional website with a live editor, 100+ templates, EU hosting, and support.",
  brand: { "@id": `${BASE}/#organization` },
  offers: {
    "@type": "Offer",
    price: "500",
    priceCurrency: "CZK",
    priceValidUntil: "2026-12-31",
    availability: "https://schema.org/InStock",
    url: `${BASE}#ceny`,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "200",
    bestRating: "5",
  },
};

const CZECH_ROUTE_PREFIXES = [
  "/produkty-a-reseni",
  "/prehled-funkci",
  "/vybrat-design",
  "/cenik",
  "/admin/login",
];

/**
 * Editor / admin surfaces where platform overlays (cookie banner, language
 * suggestion) must never render — they would cover the editing canvas.
 */
function isEditorSurface(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/studio")) return true;
  // /demo/<slug>/admin…, /demo/<slug>/studio…, /demo/<slug>/edit-frame…
  return /^\/demo\/[^/]+\/(admin|studio|edit-frame)(\/|$)/.test(pathname);
}

function detectLocale(pathname: string): PlatformLocale {
  if (pathname === "/cs" || pathname.startsWith("/cs/")) return "cs";
  if (CZECH_ROUTE_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return "cs";
  return "en";
}

function detectsCzechVisitor(headerList: Headers) {
  const country = (
    headerList.get("x-vercel-ip-country") ||
    headerList.get("cf-ipcountry") ||
    headerList.get("x-country-code") ||
    ""
  ).toUpperCase();
  if (country === "CZ") return true;

  const acceptLanguage = headerList.get("accept-language")?.toLowerCase() ?? "";
  return acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .some((lang) => lang === "cs" || lang === "cs-cz");
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headerList = await headers();
  const cookieStore = await cookies();
  const pathname = headerList.get("x-pathname") ?? "";
  const locale = detectLocale(pathname);
  const hasLocalePreference = !!cookieStore.get("webero-locale-preference")?.value;
  const suggestedCookie = cookieStore.get("webero-locale-suggested")?.value;
  const suggestedLocale: PlatformLocale | "" =
    !hasLocalePreference && locale === "en" && (suggestedCookie === "cs" || detectsCzechVisitor(headerList))
      ? "cs"
      : "";
  const localizedSchemaWebsite = {
    ...schemaWebsite,
    description: locale === "en"
      ? schemaWebsite.description
      : "SaaS platforma pro tvorbu profesionálních webů pro lokální podnikatele.",
    inLanguage: locale,
  };
  const localizedSchemaOrganization = {
    ...schemaOrganization,
    description: locale === "en"
      ? schemaOrganization.description
      : "Profesionální weby bez programátora pro české podnikatele.",
  };
  const localizedSchemaProduct = {
    ...schemaProduct,
    description: locale === "en"
      ? schemaProduct.description
      : "Profesionální web s live editorem, 100+ šablonami, EU hostingem a českou podporou.",
  };

  return (
    // suppressHydrationWarning: StudioThemeScript (admin) nastavuje data-vs-*
    // atributy na <html> ještě před hydratací (anti-FOUC tématu editoru) —
    // potlačení platí jen pro atributy tohoto elementu, ne pro potomky.
    <html lang={locale} suppressHydrationWarning className={`${libreBaskerville.variable} ${sourceSans.variable} ${oswald.variable} ${overpass.variable} ${overpassMono.variable} ${instrumentSerif.variable} ${montserrat.variable}`}>
      <head>
        {/* next/font self-hosts all font files — no runtime Google Fonts requests */}
        {/* arch-01 LCP preload moved to src/app/page.tsx (landing only, not demo pages) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localizedSchemaWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localizedSchemaOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localizedSchemaProduct) }}
        />

      </head>
      <body className="min-h-screen">
        {children}
        {!isEditorSurface(pathname) && (
          <>
            <LanguageSuggestionModal currentLocale={locale} suggestedLocale={suggestedLocale} />
            <CookieConsent locale={locale} />
          </>
        )}
      </body>
    </html>
  );
}
