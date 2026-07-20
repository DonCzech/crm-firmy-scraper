import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { OrderStatusClient } from "@/components/storefront/OrderStatusClient";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";

/** Modul „Stav objednávky“ — sledování objednávky bez přihlášení. */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Stav objednávky", robots: { index: false } };
}

export default async function OrderStatusPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has("stav-objednavky")) return notFound();

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">Stav objednávky</h1>
          <p className="mt-2 max-w-[640px] text-[15px] text-neutral-500">
            Zadejte číslo objednávky a e-mail, který jste použili při nákupu — ukážeme vám, kde se zásilka právě nachází.
          </p>
          <OrderStatusClient tenantSlug={tenantSlug} />
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}
