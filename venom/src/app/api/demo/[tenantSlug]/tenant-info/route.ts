import { NextRequest } from "next/server";
import { queryOne } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * GET /api/demo/:tenantSlug/tenant-info
 *
 * Lightweight tenant overview for admin panels (current template key/name/version,
 * business name). All sensitive ops live elsewhere — this is read-only.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const tpl = tenant.template_id
    ? await queryOne<{ key: string; name: string }>(
        "SELECT key, name FROM templates WHERE id = $1",
        [tenant.template_id]
      )
    : null;

  const extra = await queryOne<{ business_name: string | null }>(
    "SELECT business_name FROM tenants WHERE id = $1",
    [tenant.id]
  );

  return Response.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      businessName: extra?.business_name ?? null,
      templateId: tenant.template_id ?? null,
      templateKey: tpl?.key ?? null,
      templateName: tpl?.name ?? null,
      templateVersion: tenant.template_version ?? null,
    },
  });
}
