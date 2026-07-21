import type { Metadata } from "next";
import PropertyCategoryContent from "@/components/PropertyCategoryContent";

type Props = { params: { category: string }; searchParams: Record<string, string | undefined> };
export const dynamic = "force-dynamic";

const META: Record<string, { title: string; description: string; cs: string }> = {
  all: { title: "All properties", description: "Explore our complete collection of homes, rental property and investment opportunities across the Czech Republic.", cs: "vse" },
  "for-sale": { title: "Property for sale", description: "Apartments, family homes and villas chosen with care and checked in detail.", cs: "prodej" },
  "to-let": { title: "Property to rent", description: "Residential and commercial rentals with verified owners, clear terms and attentive support.", cs: "pronajem" },
  investment: { title: "Investment property", description: "Income-producing buildings, commercial assets and development opportunities.", cs: "investicni" },
};

export function generateMetadata({ params }: Props): Metadata {
  const meta = META[params.category];
  if (!meta) return {};
  const en = `/en/properties/${params.category}`;
  const cs = `/nabidka/${meta.cs}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: en, languages: { "en-GB": en, "cs-CZ": cs, "x-default": cs } },
    openGraph: { title: `${meta.title} | Český Partner`, description: meta.description, locale: "en_GB", alternateLocale: ["cs_CZ"] },
  };
}

export default function EnglishPropertyCategoryPage({ params, searchParams }: Props) {
  return <PropertyCategoryContent slug={params.category} locale="en" searchParams={searchParams} />;
}
