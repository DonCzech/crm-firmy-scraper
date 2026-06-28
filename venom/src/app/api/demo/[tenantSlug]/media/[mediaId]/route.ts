import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string; mediaId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug, mediaId } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(mediaId, 10);
  if (!Number.isFinite(id)) return Response.json({ error: "Invalid id" }, { status: 400 });

  await query("DELETE FROM media WHERE id = $1 AND tenant_id = $2", [id, tenant.id]);
  return Response.json({ ok: true });
}
