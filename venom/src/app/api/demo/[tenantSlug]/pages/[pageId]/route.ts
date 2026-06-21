import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * F2 Sprint 3 — single page operations.
 *
 * PATCH update slug/title/SEO/status
 * DELETE remove non-homepage pages (homepage cannot be deleted)
 */
interface RouteParams { params: Promise<{ tenantSlug: string; pageId: string }> }

const PatchBodySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Použij jen malá písmena, čísla a pomlčky").min(1).max(60).optional(),
  title: z.string().min(1).max(120).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo_title: z.string().max(160).nullable().optional(),
  seo_description: z.string().max(320).nullable().optional(),
  noindex: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug, pageId } = await params;
  const pid = parseInt(pageId, 10);
  if (isNaN(pid)) return Response.json({ error: "Invalid page ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchBodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  // Security: page must belong to this tenant
  const existing = await queryOne<{ id: number; is_homepage: boolean; slug: string }>(
    "SELECT id, is_homepage, slug FROM pages WHERE id = $1 AND tenant_id = $2",
    [pid, tenant.id]
  );
  if (!existing) return Response.json({ error: "Page not found" }, { status: 404 });

  // Homepage protections — can't rename slug, can't unpublish
  if (existing.is_homepage) {
    if (parsed.data.slug !== undefined && parsed.data.slug !== "home") {
      return Response.json({ error: "Úvodní stránku nelze přejmenovat" }, { status: 400 });
    }
    if (parsed.data.status === "draft") {
      return Response.json({ error: "Úvodní stránka musí být publikovaná" }, { status: 400 });
    }
  }

  // If renaming slug, check no duplicate
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const dupe = await queryOne<{ id: number }>(
      "SELECT id FROM pages WHERE tenant_id = $1 AND slug = $2 AND id != $3",
      [tenant.id, parsed.data.slug, pid]
    );
    if (dupe) return Response.json({ error: "Slug už používá jiná stránka" }, { status: 409 });
  }

  const updates: string[] = ["updated_at = now()"];
  const values: unknown[] = [];
  for (const key of ["slug", "title", "status", "seo_title", "seo_description", "noindex"] as const) {
    if (parsed.data[key] !== undefined) {
      updates.push(`${key} = $${values.length + 1}`);
      values.push(parsed.data[key]);
    }
  }
  values.push(pid, tenant.id);
  await query(
    `UPDATE pages SET ${updates.join(", ")} WHERE id = $${values.length - 1} AND tenant_id = $${values.length}`,
    values
  );

  await auditLog("page_updated", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(pid),
    extra: parsed.data as Record<string, unknown>,
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug, pageId } = await params;
  const pid = parseInt(pageId, 10);
  if (isNaN(pid)) return Response.json({ error: "Invalid page ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await queryOne<{ id: number; is_homepage: boolean }>(
    "SELECT id, is_homepage FROM pages WHERE id = $1 AND tenant_id = $2",
    [pid, tenant.id]
  );
  if (!existing) return Response.json({ error: "Page not found" }, { status: 404 });
  if (existing.is_homepage) {
    return Response.json({ error: "Úvodní stránku nelze smazat" }, { status: 400 });
  }

  await query("DELETE FROM pages WHERE id = $1 AND tenant_id = $2", [pid, tenant.id]);
  await auditLog("page_deleted", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(pid),
  });
  return Response.json({ ok: true });
}
