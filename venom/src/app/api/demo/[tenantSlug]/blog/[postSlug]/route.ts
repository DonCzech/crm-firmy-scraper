import { NextRequest } from "next/server";
import { sanitizeRichContent, stripHtml } from "@/lib/sanitize-content";
import { z } from "zod";
import { getTenantBySlug, query, auditLog } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { readingTimeMinutes, type BlogBlock } from "@/lib/blog/content";

/** Accepts absolute http(s) URLs and site-relative paths (uploaded media). */
const imageUrl = z.string().max(2000).refine(
  (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
  "Neplatná URL obrázku"
);

const UpdateSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug může obsahovat jen a-z, 0-9, -").optional(),
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.array(z.unknown()).optional(),
  featured_image: imageUrl.optional().nullable(),
  og_image: imageUrl.optional().nullable(),
  author: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  noindex: z.boolean().optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
  // Simple text fields used by StudioArticlesCanvas (legacy)
  annotation: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  reading_time_min: z.number().int().min(1).max(999).optional().nullable(),
  allow_indexing: z.boolean().optional(),
}).partial();

interface RouteParams {
  params: Promise<{ tenantSlug: string; postSlug: string }>;
}

/** Returns [whereClause, value] — numeric param → lookup by id, otherwise by slug */
function resolvePost(postSlug: string): ["id = $2", number] | ["slug = $2", string] {
  const numericId = parseInt(postSlug, 10);
  if (!isNaN(numericId) && String(numericId) === postSlug) {
    return ["id = $2", numericId];
  }
  return ["slug = $2", postSlug];
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, postSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });

  const [where, val] = resolvePost(postSlug);
  const rows = await query(
    `SELECT * FROM blog_posts WHERE tenant_id = $1 AND ${where}`,
    [tenant.id, val]
  );
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
  const post = rows[0] as { status?: string };
  if (post.status !== "published") {
    const auth = await requireTenantAdmin(tenantSlug);
    if (!auth.ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ post: rows[0] });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, postSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const [where, val] = resolvePost(postSlug);
  const rows = await query<{ id: number; status: string; slug: string }>(
    `SELECT id, status, slug FROM blog_posts WHERE tenant_id = $1 AND ${where}`,
    [tenant.id, val]
  );
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });

  const d = parsed.data;
  const sets: string[] = ["updated_at = now()"];
  const vals: unknown[] = [];

  const addField = (col: string, v: unknown) => {
    vals.push(v);
    sets.push(`${col} = $${vals.length}`);
  };

  if (d.slug !== undefined && d.slug !== rows[0].slug) {
    const dup = await query(
      "SELECT id FROM blog_posts WHERE tenant_id = $1 AND slug = $2 AND id != $3",
      [tenant.id, d.slug, rows[0].id]
    );
    if (dup.length) return Response.json({ error: "Slug již existuje" }, { status: 409 });
    addField("slug", d.slug);
  }
  if (d.title !== undefined) addField("title", stripHtml(d.title));
  if (d.excerpt !== undefined) addField("excerpt", stripHtml(d.excerpt));
  if (d.content !== undefined) {
    const content = sanitizeRichContent(d.content);
    addField("content", JSON.stringify(content));
    if (d.reading_time_min === undefined) {
      addField("reading_time_min", readingTimeMinutes(content as BlogBlock[]));
    }
  }
  if (d.featured_image !== undefined) addField("featured_image", d.featured_image);
  if (d.og_image !== undefined) addField("og_image", d.og_image);
  if (d.author !== undefined) addField("author", stripHtml(d.author));
  if (d.category !== undefined) addField("category", d.category);
  if (d.tags !== undefined) addField("tags", d.tags);
  if (d.status !== undefined) {
    addField("status", d.status);
    if (d.status === "published" && rows[0].status !== "published") {
      addField("published_at", new Date().toISOString());
    }
  }
  if (d.seo_title !== undefined) addField("seo_title", d.seo_title);
  if (d.seo_description !== undefined) addField("seo_description", d.seo_description);
  if (d.description !== undefined) addField("seo_description", d.description);
  if (d.noindex !== undefined) addField("noindex", d.noindex);
  if (d.allow_indexing !== undefined) {
    addField("allow_indexing", d.allow_indexing);
    addField("noindex", !d.allow_indexing);
  }
  if (d.scheduled_at !== undefined) addField("scheduled_at", d.scheduled_at);
  if (d.annotation !== undefined) addField("annotation", d.annotation);
  if (d.reading_time_min !== undefined) addField("reading_time_min", d.reading_time_min);

  vals.push(rows[0].id, tenant.id);
  await query(
    `UPDATE blog_posts SET ${sets.join(", ")} WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}`,
    vals
  );

  await auditLog("blog_post_updated", { tenantId: tenant.id, targetType: "blog_post", targetId: String(rows[0].id) });
  revalidatePath(`/demo/${tenantSlug}/blog`);
  revalidatePath(`/demo/${tenantSlug}/blog/${rows[0].slug}`);
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, postSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [where, val] = resolvePost(postSlug);
  const rows = await query<{ id: number }>(
    `SELECT id FROM blog_posts WHERE tenant_id = $1 AND ${where}`,
    [tenant.id, val]
  );
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });

  await query("DELETE FROM blog_posts WHERE id = $1 AND tenant_id = $2", [rows[0].id, tenant.id]);
  await auditLog("blog_post_deleted", { tenantId: tenant.id, targetType: "blog_post", targetId: String(rows[0].id) });
  return Response.json({ ok: true });
}
