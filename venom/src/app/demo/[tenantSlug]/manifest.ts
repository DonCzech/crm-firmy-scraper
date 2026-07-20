import type { MetadataRoute } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";

export const dynamic = "force-dynamic";

export default async function manifest({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<MetadataRoute.Manifest> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const shop = tenant ? await getShopByTenantId(tenant.id).catch(() => null) : null;

  const name = shop?.name || tenant?.business_name || tenant?.slug || "Webero";
  const shortName = name.length > 12 ? name.slice(0, 12) : name;

  return {
    name,
    short_name: shortName,
    description: `${name} — online obchod`,
    start_url: `/demo/${tenantSlug}/obchod`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      { src: `/demo/${tenantSlug}/opengraph-image`, sizes: "512x512", type: "image/png" },
    ],
  };
}
