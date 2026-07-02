import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * F3 — Dynamický sitemap.
 *
 * Vrací:
 *   1. Homepage + statické platformní stránky
 *   2. Všechny published tenant homepages (status != 'demo' && != 'suspended')
 *   3. Per-tenant published blog post URLs
 *
 * `noindex` flag na blog je respektován — vyloučeno ze sitemap.
 */
interface TenantRow {
  slug: string;
  updated_at: string;
  custom_domain: string | null;
}
interface BlogRow {
  tenant_slug: string;
  slug: string;
  updated_at: string;
  custom_domain: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const items: MetadataRoute.Sitemap = [
    { url: BASE,             lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/cs`,     lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/en`,     lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/cenik`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/produkty-a-reseni`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/prehled-funkci`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/vybrat-design`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/pricing`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/products-and-solutions`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/features`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/choose-design`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/o-nas`,  lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const tenants = await query<TenantRow>(
      `SELECT t.slug, t.updated_at,
              (SELECT d.domain FROM domains d
                WHERE d.tenant_id = t.id AND d.verified = true
                ORDER BY d.created_at ASC LIMIT 1) AS custom_domain
         FROM tenants t
        WHERE t.status NOT IN ('demo', 'suspended')
          AND t.lifecycle_status = 'active'`
    );
    for (const t of tenants) {
      const base = t.custom_domain ? `https://${t.custom_domain}` : `${BASE}/demo/${t.slug}`;
      items.push({
        url: base,
        lastModified: new Date(t.updated_at),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    const posts = await query<BlogRow>(
      `SELECT t.slug AS tenant_slug, b.slug, b.updated_at,
              (SELECT d.domain FROM domains d
                WHERE d.tenant_id = t.id AND d.verified = true
                ORDER BY d.created_at ASC LIMIT 1) AS custom_domain
         FROM blog_posts b
         JOIN tenants t ON t.id = b.tenant_id
        WHERE b.status = 'published'
          AND (b.noindex IS NULL OR b.noindex = false)
          AND t.status NOT IN ('demo', 'suspended')`
    );
    for (const p of posts) {
      const base = p.custom_domain
        ? `https://${p.custom_domain}/blog/${p.slug}`
        : `${BASE}/demo/${p.tenant_slug}/blog/${p.slug}`;
      items.push({
        url: base,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch (err) {
    console.error("[sitemap] DB error:", err);
  }

  return items;
}
