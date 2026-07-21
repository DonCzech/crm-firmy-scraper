import type { Metadata } from "next";
import PropertyCategoryContent from "@/components/PropertyCategoryContent";

type Props = { params: { kategorie: string }; searchParams: Record<string, string | undefined> };
export const dynamic = "force-dynamic";

const META: Record<string, { title: string; description: string; en: string }> = {
  prodej: { title: "Nemovitosti na prodej", description: "Byty, rodinné domy a vily, které jsme pro vás pečlivě vybrali a prověřili.", en: "for-sale" },
  pronajem: { title: "Nemovitosti k pronájmu", description: "Rezidenční i komerční pronájmy s prověřenými vlastníky a bezpečnými smlouvami.", en: "to-let" },
  investicni: { title: "Investiční nemovitosti", description: "Činžovní domy, komerční objekty a developerské projekty s prověřeným výnosem.", en: "investment" },
  vse: { title: "Nabídka nemovitostí", description: "Kompletní aktuální nabídka nemovitostí na prodej, k pronájmu a pro investici.", en: "all" },
};

export function generateMetadata({ params }: Props): Metadata {
  const meta = META[params.kategorie];
  if (!meta) return {};
  const cs = `/nabidka/${params.kategorie}`;
  const en = `/en/properties/${meta.en}`;
  return { title: meta.title, description: meta.description, alternates: { canonical: cs, languages: { "cs-CZ": cs, "en-GB": en, "x-default": cs } }, openGraph: { title: meta.title, description: meta.description } };
}

export default function CategoryPage({ params, searchParams }: Props) {
  return <PropertyCategoryContent slug={params.kategorie} searchParams={searchParams} />;
}
