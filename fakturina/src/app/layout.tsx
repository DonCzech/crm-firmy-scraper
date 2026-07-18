import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fakturina.cz";
const SITE_NAME = "Fakturina";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fakturina.cz — Chytrá česká fakturace",
    template: `%s | ${SITE_NAME}`,
  },
  description: "Vystavujte profesionální české faktury, posílejte online upomínky a mějte platby pod kontrolou.",
  applicationName: SITE_NAME,
  // Podstránky si canonical overridují vlastním alternates — tohle platí jen pro homepage
  // a interní stránky, které se stejně neindexují.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    title: "Fakturina.cz — Chytrá česká fakturace",
    description: "Profesionální české faktury, upomínky a přehled plateb.",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: { card: "summary", title: "Fakturina.cz", description: "Chytrá česká fakturace." },
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: "Chytrá česká fakturace — vystavujte faktury, sledujte platby, posílejte upomínky.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "cs",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      offers: { "@type": "Offer", price: 0, priceCurrency: "CZK" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        {children}
      </body>
    </html>
  );
}
