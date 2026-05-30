import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
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

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://venom-saas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: "Venom SaaS — Profesionální weby pro lokální podnikatele",
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
    siteName: "Venom SaaS",
    title: "Venom SaaS — Profesionální weby pro lokální podnikatele",
    description: "Web pro váš obor za 5 minut. Barber, wellness, advokát. Live editor, SEO, mobil.",
    locale: "cs_CZ",
  },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  url: BASE,
  name: "Venom SaaS",
  description: "SaaS platforma pro tvorbu profesionálních webů pro lokální podnikatele.",
  inLanguage: "cs",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={`${libreBaskerville.variable} ${sourceSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
