import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact our Prague real estate team",
  description: "Speak to Český Partner’s English-speaking team about selling, buying, letting, valuation or property investment in the Czech Republic.",
  alternates: { canonical: "/en/contact", languages: { "en-GB": "/en/contact", "cs-CZ": "/kontakt", "x-default": "/kontakt" } },
  openGraph: { locale: "en_GB", alternateLocale: ["cs_CZ"] },
};
export default function EnglishContactPage() { return <ContactPageContent locale="en" />; }
