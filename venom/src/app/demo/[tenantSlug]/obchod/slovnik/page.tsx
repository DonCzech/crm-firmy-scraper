import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";

/** Modul „Slovník pojmů“ — vysvětlivky pojmů z e-shopu. */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Slovník pojmů", robots: { index: false } };
}

const TERMS: { term: string; def: string }[] = [
  { term: "Dobírka", def: "Platba za zboží až při jeho převzetí od dopravce. Za dobírku se obvykle účtuje malý příplatek." },
  { term: "DPH", def: "Daň z přidané hodnoty. Všechny ceny v našem obchodě uvádíme včetně DPH, pokud není uvedeno jinak." },
  { term: "Expedice", def: "Okamžik, kdy objednávku zabalíme a předáme dopravci. Od expedice běží doba doručení." },
  { term: "Hlídací pes", def: "Služba, která vás e-mailem upozorní, jakmile bude vyprodaný produkt znovu skladem." },
  { term: "Odstoupení od smlouvy", def: "Právo vrátit zboží zakoupené online do 14 dnů bez udání důvodu dle občanského zákoníku." },
  { term: "Osobní odběr", def: "Vyzvednutí objednávky zdarma na naší kamenné prodejně nebo výdejním místě." },
  { term: "Recenze ověřeného zákazníka", def: "Hodnocení od zákazníka, u kterého jsme ověřili, že produkt skutečně zakoupil." },
  { term: "Reklamace", def: "Uplatnění práva z vadného plnění. Standardní záruční doba je 24 měsíců od převzetí zboží." },
  { term: "Rekapitulace objednávky", def: "Souhrn položek, dopravy, platby a celkové ceny, který vidíte před dokončením nákupu a poté v potvrzovacím e-mailu." },
  { term: "Skladem", def: "Zboží máme fyzicky na skladě a při objednání v pracovní den jej zpravidla expedujeme do 24 hodin." },
  { term: "Sledovací číslo (tracking)", def: "Kód zásilky od dopravce, přes který můžete online sledovat cestu balíku až k vám." },
  { term: "Variabilní symbol", def: "Číselný kód platby (obvykle číslo objednávky), podle kterého spárujeme vaši platbu převodem." },
  { term: "Varianta produktu", def: "Konkrétní provedení produktu — např. velikost, barva nebo objem. Každá varianta může mít vlastní cenu a skladovou dostupnost." },
  { term: "Výdejní místo", def: "Smluvní pobočka dopravce (např. Balíkovna), kde si zásilku vyzvednete, kdy se vám to hodí." },
];

export default async function GlossaryPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has("slovnik-pojmu")) return notFound();

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[900px] px-5 py-10">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">Slovník pojmů</h1>
          <p className="mt-2 max-w-[640px] text-[15px] text-neutral-500">
            Nevíte si rady s pojmy z e-shopu? Tady najdete srozumitelné vysvětlení těch nejčastějších.
          </p>
          <dl className="mt-8 divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {TERMS.map((t) => (
              <div key={t.term} className="p-5">
                <dt className="text-[16px] font-extrabold text-neutral-950">{t.term}</dt>
                <dd className="mt-1 text-[14.5px] leading-relaxed text-neutral-600">{t.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}
