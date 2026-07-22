import type { Metadata } from "next";
import { ContactPageContent } from "./ContactPageContent";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const metadata: Metadata = {
  title: "Kontakt — Webero",
  description:
    "Web, e-shop nebo aplikace na míru? Napište nám nezávaznou poptávku — ozveme se do 24 hodin s návrhem řešení i cenou.",
  alternates: {
    canonical: `${BASE}/kontakt`,
    languages: {
      cs: `${BASE}/kontakt`,
      en: `${BASE}/en/contact`,
    },
  },
};

export default function KontaktPage() {
  return <ContactPageContent locale="cs" />;
}
