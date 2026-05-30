import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query, auditLog } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.array(z.unknown()).optional(),
  featured_image: z.string().url().optional().nullable(),
  author: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  noindex: z.boolean().optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ tenantSlug: string; postSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, postSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });

  const rows = await query(
    "SELECT * FROM blog_posts WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, postSlug]
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

  const rows = await query<{ id: number; status: string }>(
    "SELECT id, status FROM blog_posts WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, postSlug]
  );
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });

  const d = parsed.data;
  const sets: string[] = ["updated_at = now()"];
  const vals: unknown[] = [];

  const addField = (col: string, val: unknown) => {
    vals.push(val);
    sets.push(`${col} = $${vals.length}`);
  };

  if (d.title !== undefined) addField("title", d.title);
  if (d.excerpt !== undefined) addField("excerpt", d.excerpt);
  if (d.content !== undefined) addField("content", JSON.stringify(d.content));
  if (d.featured_image !== undefined) addField("featured_image", d.featured_image);
  if (d.author !== undefined) addField("author", d.author);
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
  if (d.noindex !== undefined) addField("noindex", d.noindex);
  if (d.scheduled_at !== undefined) addField("scheduled_at", d.scheduled_at);

  vals.push(rows[0].id, tenant.id);
  await query(
    `UPDATE blog_posts SET ${sets.join(", ")} WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}`,
    vals
  );

  await auditLog("blog_post_updated", { tenantId: tenant.id, targetType: "blog_post", targetId: String(rows[0].id) });
  revalidatePath(`/demo/${tenantSlug}/blog`);
  revalidatePath(`/demo/${tenantSlug}/blog/${postSlug}`);
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, postSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ id: number }>(
    "SELECT id FROM blog_posts WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, postSlug]
  );
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });

  await query("DELETE FROM blog_posts WHERE id = $1 AND tenant_id = $2", [rows[0].id, tenant.id]);
  await auditLog("blog_post_deleted", { tenantId: tenant.id, targetType: "blog_post", targetId: String(rows[0].id) });
  return Response.json({ ok: true });
}
