import { PlatformHomePage } from "@/components/PlatformHomePage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const metadata: Metadata = {
  title: "Webero — Profesionální weby pro lokální podnikatele",
  description: "Vytvořte si profesionální web pro váš obor za 5 minut. Live editor, SEO, hosting v EU a mobilní optimalizace.",
  alternates: {
    canonical: `${BASE}/cs`,
    languages: {
      cs: `${BASE}/cs`,
      en: `${BASE}/en`,
    },
  },
  openGraph: {
    locale: "cs_CZ",
    url: `${BASE}/cs`,
    title: "Webero — Profesionální weby pro lokální podnikatele",
    description: "Web pro váš obor za 5 minut. Live editor, SEO, hosting v EU.",
  },
};

export default async function CzechHome() {
  return <PlatformHomePage locale="cs" />;
}
