import { NextRequest } from "next/server";
import { z } from "zod";
import { query, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query(
    "SELECT id, name, value, created_at FROM tenant_http_headers WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenant.id]
  );

  return Response.json({ ok: true, headers: rows });
}

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  value: z.string().min(1).max(1000),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { name, value } = parsed.data;
  const rows = await query<{ id: number }>(
    "INSERT INTO tenant_http_headers (tenant_id, name, value) VALUES ($1, $2, $3) RETURNING id",
    [tenant.id, name, value]
  );

  await auditLog("http_header_created", { tenantId: tenant.id, targetType: "http_header", targetId: String(rows[0]?.id) });
  return Response.json({ ok: true, id: rows[0]?.id });
}
