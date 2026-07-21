import type { Metadata } from "next";
import AboutPageContent from "@/components/AboutPageContent";

export const metadata: Metadata = {
  title: "About us",
  description: "Meet Český Partner: an independent Czech real estate agency combining local knowledge, personal responsibility and more than 1,200 completed transactions.",
  alternates: { canonical: "/en/about", languages: { "en-GB": "/en/about", "cs-CZ": "/o-nas", "x-default": "/o-nas" } },
  openGraph: { locale: "en_GB", alternateLocale: ["cs_CZ"] },
};

export default function EnglishAboutPage() {
  return <AboutPageContent locale="en" />;
}
