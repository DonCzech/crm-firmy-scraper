import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";
import { WholesaleForm } from "@/components/storefront/WholesaleForm";

/** Modul „Velkoobchod (B2B)" — informace a registrace velkoobchodních partnerů. */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Velkoobchod", robots: { index: false } };
}

const BENEFITS = [
  { icon: "💰", title: "Individuální ceník", text: "Velkoobchodní sleva se po schválení uplatní automaticky na každou objednávku s vaším e-mailem." },
  { icon: "📦", title: "Prioritní expedice", text: "B2B objednávky vyřizujeme přednostně, u větších objemů domluvíme paletovou přepravu." },
  { icon: "🧾", title: "Fakturace s DPH", text: "Doklady se všemi náležitostmi pro plátce DPH, možnost platby převodem se splatností." },
];

export default async function WholesalePage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has("velkoobchod")) return notFound();

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[900px] px-5 py-10">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">Velkoobchod</h1>
          <p className="mt-2 max-w-[640px] text-[15px] text-neutral-500">
            Nakupujete pro firmu, prodejnu nebo e-shop? Staňte se naším velkoobchodním partnerem
            a získejte individuální ceny na celý sortiment.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5">
                <div className="text-[26px]">{b.icon}</div>
                <h2 className="mt-2 text-[15px] font-extrabold text-neutral-950">{b.title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{b.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-[20px] font-extrabold tracking-tight text-neutral-950">Žádost o velkoobchodní účet</h2>
          <p className="mb-4 mt-1 text-[13.5px] text-neutral-500">
            Vyplňte údaje o vaší firmě. Žádosti schvalujeme obvykle do jednoho pracovního dne.
          </p>
          <WholesaleForm tenantSlug={tenantSlug} />
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}
