import type { Metadata } from "next";
import { PricingPageContent } from "./PricingPageContent";

export const metadata: Metadata = {
  title: "Ceník — Webero",
  description:
    "Transparentní ceník bez skrytých poplatků. Standard od 500 Kč/měsíc, E-shop od 890 Kč/měsíc. 14 dní zdarma, bez platební karty.",
};

export default function PricingPage() {
  return <PricingPageContent locale="cs" />;
}
