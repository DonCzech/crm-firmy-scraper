import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { WishlistPageClient } from "@/components/storefront/WishlistPageClient";
import { CartToast } from "@/components/storefront/CartToast";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";

/** Webero Commerce — oblíbené produkty (wishlist). */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Oblíbené", robots: { index: false } };
}

export default async function WishlistPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[1400px] px-5 py-10">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">Oblíbené</h1>
          <div className="mt-6">
            <WishlistPageClient tenantSlug={tenantSlug} currency={shop.currency} />
          </div>
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <CartToast />
    </div>
  );
}
