import type { Metadata } from "next";
import { FeaturesHubPageContent } from "./FeaturesHubPageContent";

export const metadata: Metadata = {
  title: "Moduly Webera — Přehled funkcí",
  description:
    "12 modulů, které pokryjí každou potřebu vašeho webu. Články, SEO, e-shop, rezervace, formuláře, analytika, bezpečnost — všechno v jedné platformě.",
};

export default function FeaturesHubPage() {
  return <FeaturesHubPageContent locale="cs" />;
}
