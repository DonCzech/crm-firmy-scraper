import type { Metadata } from "next";
import SoldPageContent from "@/components/SoldPageContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Prodané a pronajaté nemovitosti",
  description:
    "Nemovitosti, které jsme úspěšně prodali a pronajali. Přesvědčte se, jak pracujeme — a svěřte nám i tu svoji.",
  alternates: { canonical: "/prodano", languages: { "cs-CZ": "/prodano", "en-GB": "/en/sold", "x-default": "/prodano" } },
};

export default function SoldPage() {
  return <SoldPageContent />;
}
