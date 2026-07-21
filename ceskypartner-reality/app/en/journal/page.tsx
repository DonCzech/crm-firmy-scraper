import type { Metadata } from "next";
import JournalPageContent from "@/components/JournalPageContent";

export const metadata: Metadata = {
  title: "Czech Property Journal",
  description: "Clear analysis, practical guidance and considered perspectives on property in Prague and across the Czech Republic.",
  alternates: { canonical: "/en/journal", languages: { "en-GB": "/en/journal", "cs-CZ": "/blog", "x-default": "/blog" } },
  openGraph: { locale: "en_GB", alternateLocale: ["cs_CZ"] },
};

export default function EnglishJournalPage() {
  return <JournalPageContent locale="en" />;
}
