import { PlatformHomePage } from "@/components/PlatformHomePage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const metadata: Metadata = {
  title: "Webero - Professional websites for local businesses",
  description: "Create a professional website for your industry in 5 minutes. Live editor, SEO, EU hosting, and mobile optimization.",
  alternates: {
    canonical: `${BASE}/en`,
    languages: {
      cs: `${BASE}/cs`,
      en: `${BASE}/en`,
    },
  },
  openGraph: {
    locale: "en_US",
    url: `${BASE}/en`,
    title: "Webero - Professional websites for local businesses",
    description: "A website for your industry in 5 minutes. Live editor, SEO, EU hosting.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webero - Professional websites in 5 minutes",
    description: "Live editor, 100+ templates, EU hosting. No developer needed.",
    images: ["/templates/arch-01/hero-1.webp"],
  },
};

export default async function EnglishHome() {
  return <PlatformHomePage locale="en" />;
}
