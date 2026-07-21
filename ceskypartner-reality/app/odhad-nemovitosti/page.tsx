import type { Metadata } from "next";
import ValuationPageContent from "@/components/ValuationPageContent";

export const metadata: Metadata = {
  title: "Odhad ceny nemovitosti zdarma",
  description:
    "Zjistěte, za kolik prodáte nebo pronajmete svou nemovitost. Odhad ceny zdarma do 24 hodin od makléře, který zná vaši lokalitu.",
  alternates: { canonical: "/odhad-nemovitosti", languages: { "cs-CZ": "/odhad-nemovitosti", "en-GB": "/en/valuation", "x-default": "/odhad-nemovitosti" } },
};

export default function ValuationPage() {
  return <ValuationPageContent />;
}
