import { NextRequest } from "next/server";
import { z } from "zod";
import { query, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

const BodySchema = z.object({
  settings: z.record(z.unknown()).optional(),
  is_visible: z.boolean().optional(),
}).refine(
  (v) => v.settings !== undefined || v.is_visible !== undefined,
  { message: "Nothing to update — provide settings or is_visible" }
);

interface RouteParams {
  params: Promise<{ tenantSlug: string; sectionId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, sectionId } = await params;
  const sid = parseInt(sectionId, 10);
  if (isNaN(sid)) return Response.json({ error: "Invalid section ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  // Security: section must belong to this tenant — filter by tenant_id in WHERE
  const rows = await query<{ id: number }>(
    "SELECT id FROM sections WHERE id = $1 AND tenant_id = $2",
    [sid, tenant.id]
  );
  if (!rows.length) return Response.json({ error: "Section not found" }, { status: 404 });

  const updates: string[] = ["updated_at = now()"];
  const values: unknown[] = [];

  if (parsed.data.settings !== undefined) {
    updates.push(`settings = $${values.length + 1}`);
    values.push(JSON.stringify(parsed.data.settings));
  }
  if (parsed.data.is_visible !== undefined) {
    updates.push(`is_visible = $${values.length + 1}`);
    values.push(parsed.data.is_visible);
  }

  values.push(sid, tenant.id); // WHERE id = $N AND tenant_id = $N+1
  await query(
    `UPDATE sections SET ${updates.join(", ")} WHERE id = $${values.length - 1} AND tenant_id = $${values.length}`,
    values
  );

  await auditLog("section_updated", { tenantId: tenant.id, targetType: "section", targetId: String(sid) });
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, sectionId } = await params;
  const sid = parseInt(sectionId, 10);
  if (isNaN(sid)) return Response.json({ error: "Invalid section ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Security: filter by tenant_id to prevent cross-tenant deletes.
  const res = await query<{ id: number }>(
    "DELETE FROM sections WHERE id = $1 AND tenant_id = $2 RETURNING id",
    [sid, tenant.id]
  );
  if (!res.length) return Response.json({ error: "Section not found" }, { status: 404 });

  await auditLog("section_deleted", { tenantId: tenant.id, targetType: "section", targetId: String(sid) });
  return Response.json({ ok: true });
}
