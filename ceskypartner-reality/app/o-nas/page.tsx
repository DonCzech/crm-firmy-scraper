import type { Metadata } from "next";
import AboutPageContent from "@/components/AboutPageContent";

export const metadata: Metadata = {
  title: "O nás",
  description: "Poznejte tým Českého Partnera. 15 let zkušeností na českém realitním trhu, osobní přístup a 1 200+ úspěšných obchodů.",
  alternates: { canonical: "/o-nas", languages: { "cs-CZ": "/o-nas", "en-GB": "/en/about", "x-default": "/o-nas" } },
};

export default function AboutPage() {
  return <AboutPageContent locale="cs" />;
}
