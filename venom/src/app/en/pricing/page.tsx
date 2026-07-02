import type { Metadata } from "next";
import { PricingPageContent } from "@/app/cenik/PricingPageContent";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const metadata: Metadata = {
  title: "Pricing - Webero",
  description: "Transparent pricing with no hidden fees. Standard from 500 CZK per month, 14 days free, no credit card required.",
  alternates: {
    canonical: `${BASE}/en/pricing`,
    languages: {
      cs: `${BASE}/cenik`,
      en: `${BASE}/en/pricing`,
    },
  },
};

export default function EnglishPricingPage() {
  return <PricingPageContent locale="en" />;
}
