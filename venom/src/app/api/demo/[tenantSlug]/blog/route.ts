import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

const CreateSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug může obsahovat jen a-z, 0-9, -"),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.array(z.unknown()).default([]),
  featured_image: z.string().url().optional(),
  author: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  seo_title: z.string().max(200).optional(),
  seo_description: z.string().max(300).optional(),
  noindex: z.boolean().optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });

  const url = new URL(req.url);
  const limitParam = parseInt(url.searchParams.get("limit") ?? "100", 10);
  const limit = isNaN(limitParam) || limitParam < 1 ? 100 : Math.min(limitParam, 100);
  // Public preview requests want only published posts. Admin requests may load drafts.
  const publishedOnly = url.searchParams.get("published") === "true";
  if (!publishedOnly) {
    const auth = await requireTenantAdmin(tenantSlug);
    if (!auth.ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await query(
    publishedOnly
      ? `SELECT id, slug, title, excerpt, featured_image, author, category, tags, status, published_at, created_at
         FROM blog_posts WHERE tenant_id = $1 AND status = 'published'
         ORDER BY published_at DESC LIMIT $2`
      : `SELECT id, slug, title, excerpt, featured_image, author, category, tags, status, published_at, created_at
         FROM blog_posts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [tenant.id, limit]
  );

  return Response.json({ posts });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const d = parsed.data;

  const existing = await query(
    "SELECT id FROM blog_posts WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, d.slug]
  );
  if (existing.length) return Response.json({ error: "Slug již existuje" }, { status: 409 });

  const rows = await query<{ id: number }>(
    `INSERT INTO blog_posts
       (tenant_id, slug, title, excerpt, content, featured_image, author, category, tags, status,
        seo_title, seo_description, noindex, scheduled_at, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id`,
    [
      tenant.id, d.slug, d.title, d.excerpt ?? null,
      JSON.stringify(d.content), d.featured_image ?? null, d.author ?? null,
      d.category ?? null, d.tags, d.status, d.seo_title ?? null, d.seo_description ?? null,
      d.noindex ?? false, d.scheduled_at ?? null,
      d.status === "published" ? new Date().toISOString() : null,
    ]
  );

  await auditLog("blog_post_created", { tenantId: tenant.id, targetType: "blog_post", targetId: String(rows[0].id) });
  return Response.json({ id: rows[0].id }, { status: 201 });
}
