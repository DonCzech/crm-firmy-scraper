import type { Metadata } from "next";
import { PickDesignPageContent } from "@/app/vybrat-design/PickDesignPageContent";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Choose a design - Webero",
  description: "Complete template catalog. Start with a website concept instead of a blank page, with fully editable designs for every industry.",
  alternates: {
    canonical: `${BASE}/en/choose-design`,
    languages: {
      cs: `${BASE}/vybrat-design`,
      en: `${BASE}/en/choose-design`,
    },
  },
};

export default async function EnglishPickDesignPage() {
  return <PickDesignPageContent locale="en" />;
}
