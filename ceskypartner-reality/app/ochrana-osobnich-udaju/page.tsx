import type { Metadata } from "next";
import PrivacyPageContent from "@/components/PrivacyPageContent";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: "Zásady zpracování osobních údajů realitní kanceláře Český Partner s.r.o.",
  alternates: { canonical: "/ochrana-osobnich-udaju", languages: { "cs-CZ": "/ochrana-osobnich-udaju", "en-GB": "/en/privacy", "x-default": "/ochrana-osobnich-udaju" } },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
