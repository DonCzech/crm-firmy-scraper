import { NextRequest } from "next/server";
import { query, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * F1 — Reset a section's content_overrides to template default.
 *
 * Clears sections.content_overrides for this section. The next render of a v2
 * section will return raw template defaults (with $slot refs resolved against
 * tenant_data_slots). Used by studio "Resetovat sekci" action.
 *
 * For legacy sections (content_source != 'v2') returns 409 — they don't have
 * the read-through layer, must be migrated first.
 */
interface RouteParams {
  params: Promise<{ tenantSlug: string; sectionId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const { tenantSlug, sectionId } = await params;
  const sid = parseInt(sectionId, 10);
  if (isNaN(sid)) return Response.json({ error: "Invalid section ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ id: number; content_source: string | null }>(
    "SELECT id, content_source FROM sections WHERE id = $1 AND tenant_id = $2",
    [sid, tenant.id]
  );
  if (!rows.length) return Response.json({ error: "Section not found" }, { status: 404 });
  if (rows[0].content_source !== "v2") {
    return Response.json(
      { error: "Section is on legacy storage — migrate to v2 first" },
      { status: 409 }
    );
  }

  await query(
    "UPDATE sections SET content_overrides = '{}'::jsonb, updated_at = now() WHERE id = $1 AND tenant_id = $2",
    [sid, tenant.id]
  );
  await auditLog("section_overrides_reset", {
    tenantId: tenant.id,
    targetType: "section",
    targetId: String(sid),
  });

  return Response.json({ ok: true });
}
