import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { getSetting } from "@/lib/settings";
import { SITE_URL, organizationJsonLd } from "@/lib/seo";
import LocalizedDocument from "@/components/LocalizedDocument";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Český Partner | Realitní kancelář",
    template: "%s | Český Partner",
  },
  description:
    "Prémiové nemovitosti v České republice. Prodej, pronájem a investiční nemovitosti s osobním přístupem a exkluzivním zastoupením.",
  alternates: {
    canonical: "./",
    languages: { "cs-CZ": "/", "en-GB": "/en", "x-default": "/" },
  },
  openGraph: {
    title: "Český Partner | Realitní kancelář",
    description:
      "Prémiové nemovitosti v České republice. Prodej, pronájem a investiční nemovitosti.",
    locale: "cs_CZ",
    type: "website",
    siteName: "Český Partner",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Analytika (Plausible) — zapíná se vyplněním domény v admin Nastavení → SEO
  const plausibleDomain = await getSetting("plausible_domain").catch(() => "");

  return (
    <LocalizedDocument
      fontVariable={hanken.variable}
      plausibleDomain={plausibleDomain}
      organizationData={organizationJsonLd()}
    >
      {children}
    </LocalizedDocument>
  );
}
