import type { Metadata } from "next";
import ServicesPageContent from "@/components/ServicesPageContent";

export const metadata: Metadata = {
  title: "Služby",
  description: "Prodej, pronájem, investiční poradenství a kompletní právní servis. Objevte, jak vám můžeme pomoci s nemovitostmi.",
  alternates: { canonical: "/sluzby", languages: { "cs-CZ": "/sluzby", "en-GB": "/en/services", "x-default": "/sluzby" } },
};
export default function ServicesPage() { return <ServicesPageContent locale="cs" />; }
