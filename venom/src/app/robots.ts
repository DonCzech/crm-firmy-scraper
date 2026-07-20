import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://webero.co";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * F3 — Dynamický robots.txt.
 *
 * Allows: homepage, statické platformní stránky, všechny published tenant homepages
 *         (status != 'demo' && != 'suspended', a respektuje page.noindex)
 * Disallows: admin, api, studio, demo tenants, suspended tenants
 */
interface TenantSlugRow { slug: string }

export default async function robots(): Promise<MetadataRoute.Robots> {
  const allow: string[] = ["/", "/cenik", "/o-nas"];
  try {
    const tenants = await query<TenantSlugRow>(
      `SELECT slug FROM tenants
        WHERE status NOT IN ('demo', 'suspended')
          AND lifecycle_status = 'active'`
    );
    for (const t of tenants) allow.push(`/demo/${t.slug}`);
  } catch (err) {
    console.error("[robots] DB error:", err);
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow,
        disallow: [
          "/admin",
          "/api/",
          "/account/",
          "/preview-2",
          "/studio",
          "*/studio",
          "*/admin",
          "/demo/*-demo",
          "/demo/*-showcase",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
