import { getTenantBySlug, query } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

interface FeedPost {
  slug: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  category: string | null;
  published_at: string | null;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !(tenant.active_modules ?? []).includes("blog")) {
    return new Response("Not found", { status: 404 });
  }

  const posts = await query<FeedPost>(
    `SELECT slug, title, excerpt, author, category, published_at
     FROM blog_posts
     WHERE tenant_id = $1 AND status = 'published' AND noindex IS NOT TRUE
     ORDER BY published_at DESC LIMIT 50`,
    [tenant.id]
  );

  const base = `${BASE_URL}/demo/${tenantSlug}`;
  const name = tenant.business_name || tenantSlug;

  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${p.excerpt ? `<description>${esc(p.excerpt)}</description>` : ""}
      ${p.category ? `<category>${esc(p.category)}</category>` : ""}
      ${p.author ? `<dc:creator>${esc(p.author)}</dc:creator>` : ""}
      ${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(`Blog — ${name}`)}</title>
    <link>${base}/blog</link>
    <description>${esc(`Články, novinky a tipy od ${name}.`)}</description>
    <language>cs</language>
    <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
