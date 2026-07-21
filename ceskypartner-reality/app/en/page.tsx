import type { Metadata } from "next";
import HomePageContent from "@/components/HomePageContent";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Premium Real Estate in Prague and the Czech Republic",
  description: "Buy, sell, rent or invest in Czech property with an English-speaking real estate team. Discreet representation, local expertise and complete support from valuation to handover.",
  alternates: { canonical: "/en", languages: { "cs-CZ": "/", "en-GB": "/en", "x-default": "/" } },
  openGraph: {
    title: "Premium Czech Real Estate | Český Partner",
    description: "Exceptional homes and investment property across Prague and the Czech Republic, handled entirely in English.",
    locale: "en_GB", alternateLocale: ["cs_CZ"], type: "website",
  },
};

export default function EnglishHomePage() {
  return <HomePageContent locale="en" />;
}
