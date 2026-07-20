import { NextRequest } from "next/server";
import { query, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string; postSlug: string }>;
}

/** POST — duplicate a post as a draft with a unique "-kopie" slug. */
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, postSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ id: number; slug: string }>(
    "SELECT id, slug FROM blog_posts WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, postSlug]
  );
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });

  const baseSlug = `${rows[0].slug.slice(0, 80)}-kopie`;
  const taken = await query<{ slug: string }>(
    "SELECT slug FROM blog_posts WHERE tenant_id = $1 AND slug LIKE $2",
    [tenant.id, `${baseSlug}%`]
  );
  const takenSet = new Set(taken.map((t) => t.slug));
  let newSlug = baseSlug;
  for (let n = 2; takenSet.has(newSlug); n++) newSlug = `${baseSlug}-${n}`;

  const inserted = await query<{ id: number; slug: string }>(
    `INSERT INTO blog_posts
       (tenant_id, slug, title, excerpt, content, featured_image, og_image, author, category, tags,
        status, seo_title, seo_description, noindex, reading_time_min)
     SELECT tenant_id, $3, title || ' (kopie)', excerpt, content, featured_image, og_image, author,
            category, tags, 'draft', seo_title, seo_description, noindex, reading_time_min
     FROM blog_posts WHERE tenant_id = $1 AND id = $2
     RETURNING id, slug`,
    [tenant.id, rows[0].id, newSlug]
  );

  await auditLog("blog_post_duplicated", { tenantId: tenant.id, targetType: "blog_post", targetId: String(inserted[0].id) });
  return Response.json({ id: inserted[0].id, slug: inserted[0].slug }, { status: 201 });
}
