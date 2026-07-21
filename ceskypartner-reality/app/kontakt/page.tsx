import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktujte naši realitní kancelář. Rádi vám poradíme s prodejem, nákupem i pronájmem nemovitostí.",
  alternates: { canonical: "/kontakt", languages: { "cs-CZ": "/kontakt", "en-GB": "/en/contact", "x-default": "/kontakt" } },
};
export default function ContactPage() { return <ContactPageContent locale="cs" />; }
