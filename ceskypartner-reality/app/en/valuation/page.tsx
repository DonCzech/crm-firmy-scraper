import type { Metadata } from "next";
import ValuationPageContent from "@/components/ValuationPageContent";

export const metadata: Metadata = {
  title: "Complimentary property valuation",
  description:
    "Discover what your property could sell or let for with a considered, evidence-led valuation from a specialist who knows your area.",
  alternates: {
    canonical: "/en/valuation",
    languages: { "en-GB": "/en/valuation", "cs-CZ": "/odhad-nemovitosti", "x-default": "/odhad-nemovitosti" },
  },
  openGraph: {
    title: "Complimentary property valuation | Český Partner",
    description: "An informed view of your property’s current market value, prepared by a local specialist.",
    locale: "en_GB",
    alternateLocale: ["cs_CZ"],
  },
};

export default function EnglishValuationPage() {
  return <ValuationPageContent locale="en" />;
}
