import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireTenantAdmin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query(
    `SELECT id, action, target_type AS entity_type, target_id AS entity_id,
            actor_email AS user_label, created_at
     FROM audit_log
     WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT 200`,
    [tenant.id]
  );

  return Response.json({ ok: true, entries: rows });
}
