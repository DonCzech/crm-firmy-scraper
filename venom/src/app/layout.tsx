import type { Metadata, Viewport } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-source-sans",
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
  title: "Webero — Profesionální weby pro lokální podnikatele",
  description:
    "Vytvořte si profesionální web pro váš obor za 5 minut. Barber, wellness, advokát a další. Live editor, SEO, mobilní optimalizace.",
  alternates: { canonical: BASE },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    url: BASE,
    siteName: "Webero",
    title: "Webero — Profesionální weby pro lokální podnikatele",
    description: "Web pro váš obor za 5 minut. Barber, wellness, advokát. Live editor, SEO, mobil.",
    locale: "cs_CZ",
    images: [
      {
        url: "/templates/arch-01/hero-1.webp",
        width: 1200,
        height: 630,
        alt: "Webero — Profesionální web bez programátora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webero — Profesionální weby za 5 minut",
    description: "Live editor, 99+ šablon, hosting v EU. Bez programátora.",
    images: ["/templates/arch-01/hero-1.webp"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const schemaWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  url: BASE,
  name: "Webero",
  description: "SaaS platforma pro tvorbu profesionálních webů pro lokální podnikatele.",
  inLanguage: "cs",
};

const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "Webero s.r.o.",
  url: BASE,
  logo: `${BASE}/favicon.ico`,
  description: "Profesionální weby bez programátora pro české podnikatele.",
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
  description: "Profesionální web s live editorem, 99+ šablonami, EU hostingem a českou podporou.",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={`${libreBaskerville.variable} ${sourceSans.variable}`}>
      <head>
        {/* Early connection hints — resolved before any render */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }}
        />
        {/* Preload hero poster for fastest LCP */}
        <link rel="preload" as="image" href="/templates/arch-01/hero-1.webp" fetchPriority="high" />
      </head>
      <body className="min-h-screen">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
