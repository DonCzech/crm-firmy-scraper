import { NextRequest } from "next/server";
import { query, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string; id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, id } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await query(
    "DELETE FROM tenant_redirects WHERE id = $1 AND tenant_id = $2",
    [Number(id), tenant.id]
  );

  await auditLog("redirect_deleted", { tenantId: tenant.id, targetType: "redirect", targetId: id });
  return Response.json({ ok: true });
}
