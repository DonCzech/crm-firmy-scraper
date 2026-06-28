import type { MetadataRoute } from "next";
import { getTenantBySlug, getTenantPages, query } from "@/lib/db";

// force-dynamic: tenant slugs are not statically enumerable at build time
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

  return [...pageEntries, ...blogIndex, ...categoryEntries, ...postEntries];
}
