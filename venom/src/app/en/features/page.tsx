import type { Metadata } from "next";
import { FeaturesHubPageContent } from "@/app/prehled-funkci/FeaturesHubPageContent";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const metadata: Metadata = {
  title: "Features - Webero",
  description: "Ready-made modules for content, SEO, e-commerce, bookings, forms, analytics, security, and integrations in one platform.",
  alternates: {
    canonical: `${BASE}/en/features`,
    languages: {
      cs: `${BASE}/prehled-funkci`,
      en: `${BASE}/en/features`,
    },
  },
};

export default function EnglishFeaturesPage() {
  return <FeaturesHubPageContent locale="en" />;
}
