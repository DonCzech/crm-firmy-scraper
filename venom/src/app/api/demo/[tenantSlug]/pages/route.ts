import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * F2 Sprint 3 — tenant pages CRUD.
 *
 * GET  list all pages (homepage first) with section counts
 * POST create a new page (slug + title)
 *
 * Per-page section operations go through /api/demo/:slug/sections (already exists).
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const PostBodySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Použij jen malá písmena, čísla a pomlčky").min(1).max(60),
  title: z.string().min(1).max(120),
  seo_title: z.string().max(160).optional(),
  seo_description: z.string().max(320).optional(),
});

interface PageRow {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  noindex: boolean | null;
  updated_at: string;
  sections_count: string;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<PageRow>(
    `SELECT p.id, p.slug, p.title, p.is_homepage, p.status,
            p.seo_title, p.seo_description, p.og_title, p.og_description,
            p.noindex, p.updated_at,
            (SELECT COUNT(*)::text FROM sections s WHERE s.page_id = p.id) AS sections_count
       FROM pages p
      WHERE p.tenant_id = $1
      ORDER BY p.is_homepage DESC, p.slug ASC`,
    [tenant.id]
  );

  return Response.json({
    pages: rows.map((r) => ({
      ...r,
      sections_count: parseInt(r.sections_count, 10),
    })),
  });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PostBodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  if (parsed.data.slug === "home") {
    return Response.json({ error: "Slug 'home' je rezervovaný pro úvodní stránku" }, { status: 400 });
  }

  // Check duplicate slug
  const dupe = await queryOne<{ id: number }>(
    "SELECT id FROM pages WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, parsed.data.slug]
  );
  if (dupe) return Response.json({ error: "Stránka se stejným URL již existuje" }, { status: 409 });

  // Create the page and clone navbar/footer from homepage in one transaction so
  // the new page already has navigation chrome when first opened.
  const inserted = await withTransaction(async (client) => {
    const ins = await client.query<{ id: number }>(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, $2, $3, false, 'draft', $4, $5)
       RETURNING id`,
      [
        tenant.id,
        parsed.data.slug,
        parsed.data.title,
        parsed.data.seo_title ?? null,
        parsed.data.seo_description ?? null,
      ]
    );
    const newPageId = ins.rows[0]?.id;
    if (!newPageId) return null;

    // Copy navbar + footer sections from homepage so the new page has the same
    // chrome. Section content is cloned 1:1 (content_overrides + settings) so
    // future menu edits stay consistent via the resolver.
    const home = await client.query<{ id: number }>(
      "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
      [tenant.id]
    );
    if (home.rows[0]?.id) {
      await client.query(
        `INSERT INTO sections (
           tenant_id, page_id, section_type, section_variant, order_index,
           is_visible, settings, content_overrides, content_source
         )
         SELECT tenant_id, $1, section_type, section_variant, order_index,
                is_visible, settings, content_overrides, content_source
           FROM sections
          WHERE tenant_id = $2 AND page_id = $3
            AND section_type IN ('navbar', 'footer')`,
        [newPageId, tenant.id, home.rows[0].id]
      );
    }
    return { id: newPageId };
  });

  await auditLog("page_created", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(inserted?.id),
    extra: { slug: parsed.data.slug, title: parsed.data.title },
  });

  return Response.json({ ok: true, id: inserted?.id, slug: parsed.data.slug });
}
