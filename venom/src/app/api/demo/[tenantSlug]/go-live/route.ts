import { NextRequest } from "next/server";
import { query, queryOne, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { getTenantDataSlotsCached } from "@/lib/section-resolver";

/**
 * F2 Sprint 1 — "Spustit web" / Publish to homepage.
 *
 * Flips tenant from status='demo' to status='active' (lifecycle_status='active').
 * Site se objeví v sitemap.ts + robots.ts allow list. Klient přejde z trial demo
 * do produkce.
 *
 * Pre-flight check:
 *   - Aspoň 1 sekce v homepage
 *   - brand.name slot vyplněn
 *   - contact.phone NEBO contact.email slot vyplněn
 *
 * Volání:
 *   POST /api/demo/<slug>/go-live   — provede publish (vrací 200 + summary)
 *   GET  /api/demo/<slug>/go-live   — preflight check, vrací {ready, missing[]}
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

async function preflight(tenantId: number): Promise<{ ready: boolean; missing: string[] }> {
  const missing: string[] = [];

  const sectionCount = await queryOne<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM sections s
       JOIN pages p ON p.id = s.page_id
      WHERE s.tenant_id = $1 AND p.is_homepage = true AND s.is_visible = true`,
    [tenantId]
  );
  if (!sectionCount || parseInt(sectionCount.c, 10) === 0) {
    missing.push("Žádné viditelné sekce na úvodní stránce");
  }

  const slots = await getTenantDataSlotsCached(tenantId);
  if (!slots.get("brand.name"))                                  missing.push("Chybí název firmy (brand.name)");
  if (!slots.get("contact.phone") && !slots.get("contact.email")) missing.push("Chybí telefon nebo e-mail");

  return { ready: missing.length === 0, missing };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const check = await preflight(tenant.id);
  return Response.json({
    currentStatus: tenant.status,
    isPublished: tenant.status === "active",
    ...check,
  });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const check = await preflight(tenant.id);
  if (!check.ready) {
    return Response.json({ error: "Pre-flight failed", missing: check.missing }, { status: 422 });
  }

  await query(
    `UPDATE tenants
        SET status = 'active', lifecycle_status = 'active', updated_at = now()
      WHERE id = $1`,
    [tenant.id]
  );

  await auditLog("tenant_published_to_homepage", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { previousStatus: tenant.status },
  });

  return Response.json({ ok: true, slug: tenant.slug, status: "active" });
}
