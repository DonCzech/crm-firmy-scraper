import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { ComparePageClient } from "@/components/storefront/ComparePageClient";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";

/** Modul „Porovnávač produktů“ — srovnání až 4 produktů. */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Porovnání produktů", robots: { index: false } };
}

export default async function ComparePage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has("porovnavac")) return notFound();

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">Porovnání produktů</h1>
          <ComparePageClient tenantSlug={tenantSlug} />
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}
