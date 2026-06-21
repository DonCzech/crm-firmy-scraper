import type { Metadata } from "next";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { LiveTemplatesCatalog } from "@/components/LiveTemplatesCatalog";

export const metadata: Metadata = {
  title: "Šablony — Webero",
  description: "Hotové responzivní šablony webů — vyberte si svůj obor a aktivujte web během minut.",
  alternates: { canonical: "/sablony" },
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default function SablonyPage() {
  return (
    <>
      <PlatformHeader />
      <main>
        <div className="bg-gradient-to-b from-white to-[#f1f5f9] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase tracking-wide text-[#14532d]">Katalog šablon</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Hotové šablony připravené na pár kliků.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Šablony prošly review (mobile + desktop, obrázky unikátní, žádná konkurenční data, klikací editor, SEO).
              Vyberte si svůj obor, aktivujte tenant a začněte upravovat.
            </p>
          </div>
        </div>
        <LiveTemplatesCatalog heading="Všechny schválené" />
      </main>
      <PlatformFooter />
    </>
  );
}
