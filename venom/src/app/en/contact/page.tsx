import type { Metadata } from "next";
import { ContactPageContent } from "@/app/kontakt/ContactPageContent";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const metadata: Metadata = {
  title: "Contact — Webero",
  description:
    "A website, an e-shop, or a custom app? Send us a no-commitment request — we reply within 24 hours with a proposed solution and a price.",
  alternates: {
    canonical: `${BASE}/en/contact`,
    languages: {
      cs: `${BASE}/kontakt`,
      en: `${BASE}/en/contact`,
    },
  },
};

export default function ContactPage() {
  return <ContactPageContent locale="en" />;
}
