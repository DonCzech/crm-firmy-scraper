import type { Metadata } from "next";
import PrivacyPageContent from "@/components/PrivacyPageContent";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Český Partner s.r.o. collects, uses, retains and protects personal data.",
  alternates: {
    canonical: "/en/privacy",
    languages: { "en-GB": "/en/privacy", "cs-CZ": "/ochrana-osobnich-udaju", "x-default": "/ochrana-osobnich-udaju" },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Privacy policy | Český Partner",
    description: "How Český Partner s.r.o. collects, uses, retains and protects personal data.",
    locale: "en_GB",
    alternateLocale: ["cs_CZ"],
  },
};

export default function EnglishPrivacyPage() {
  return <PrivacyPageContent locale="en" />;
}
