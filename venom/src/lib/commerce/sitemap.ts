import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export async function generateSitemap(tenantId: number, tenantSlug: string, baseUrl: string): Promise<string> {
  await initCommerceDb();

  const urls: SitemapUrl[] = [];
  const shopBase = `${baseUrl}/demo/${tenantSlug}/obchod`;

  urls.push({ loc: shopBase, changefreq: "daily", priority: 1.0 });

  const products = await query<{ slug: string; updated_at: string }>(
    `SELECT slug, updated_at::text FROM products WHERE tenant_id = $1 AND status = 'active' ORDER BY updated_at DESC`,
    [tenantId]
  ) ?? [];

  for (const p of products) {
    urls.push({
      loc: `${shopBase}/${p.slug}`,
      lastmod: new Date(p.updated_at).toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  const categories = await query<{ slug: string; updated_at: string }>(
    `SELECT slug, updated_at::text FROM product_categories WHERE tenant_id = $1 AND is_visible = true ORDER BY name`,
    [tenantId]
  ) ?? [];

  for (const c of categories) {
    urls.push({
      loc: `${shopBase}?kategorie=${c.slug}`,
      lastmod: new Date(c.updated_at).toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  urls.push({ loc: `${shopBase}/kosik`, changefreq: "never", priority: 0.3 });

  const xmlUrls = urls.map((u) => {
    const parts = [`    <loc>${escapeXml(u.loc)}</loc>`];
    if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
    if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
    if (u.priority != null) parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
    return `  <url>\n${parts.join("\n")}\n  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

export async function generateRobotsTxt(tenantSlug: string, baseUrl: string): Promise<string> {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/demo/${tenantSlug}/sitemap.xml

Disallow: /api/
Disallow: /demo/${tenantSlug}/admin/
Disallow: /demo/${tenantSlug}/obchod/pokladna
Disallow: /demo/${tenantSlug}/obchod/objednavka/
`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
