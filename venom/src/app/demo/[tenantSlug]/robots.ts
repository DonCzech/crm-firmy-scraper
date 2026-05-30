import type { MetadataRoute } from "next";
import { getTenantBySlug } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://venom-saas.vercel.app";

export default async function robots({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<MetadataRoute.Robots> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  // Demo tenants: block all crawlers to avoid SEO fragmentation
  if (!tenant || tenant.status === "demo") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/demo/${tenantSlug}/sitemap.xml`,
  };
}
