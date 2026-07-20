import type { MetadataRoute } from "next";
import { getTenantBySlug, getTenantPages, query } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

interface BlogPost {
  slug: string;
  updated_at: string;
  noindex: boolean;
  category: string | null;
}

export default async function sitemap({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return [];

  const base = `${BASE}/demo/${tenantSlug}`;

  const [pages, posts] = await Promise.all([
    getTenantPages(tenant.id),
    query<BlogPost>(
      "SELECT slug, updated_at, noindex, category FROM blog_posts WHERE tenant_id = $1 AND status = 'published'",
      [tenant.id]
    ),
  ]);

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: p.is_homepage ? base : `${base}/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: p.is_homepage ? 1.0 : 0.8,
    }));

  const blogIndex: MetadataRoute.Sitemap = posts.length > 0
    ? [{ url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 }]
    : [];

  // Category pages
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];
  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/blog?category=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((p) => !p.noindex)
    .map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Commerce: shop listing + product detail pages
  const shopEntries: MetadataRoute.Sitemap = [];
  try {
    const shop = await getShopByTenantId(tenant.id);
    if (shop) {
      shopEntries.push({ url: `${base}/obchod`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 });
      const products = await query<{ slug: string; updated_at: string }>(
        "SELECT slug, updated_at FROM products WHERE tenant_id = $1 AND status = 'active' ORDER BY updated_at DESC LIMIT 5000",
        [tenant.id]
      );
      for (const p of products) {
        shopEntries.push({ url: `${base}/obchod/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: "weekly", priority: 0.7 });
      }
      const cats = await query<{ slug: string }>(
        "SELECT slug FROM product_categories WHERE tenant_id = $1 AND is_visible = true",
        [tenant.id]
      );
      for (const c of cats) {
        shopEntries.push({ url: `${base}/obchod?kategorie=${c.slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
      }
    }
  } catch { /* commerce not initialized */ }

  return [...pageEntries, ...blogIndex, ...categoryEntries, ...postEntries, ...shopEntries];
}
