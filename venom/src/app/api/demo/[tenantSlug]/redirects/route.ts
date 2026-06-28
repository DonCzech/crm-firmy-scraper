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
    "SELECT id, from_path, to_path, status_code, created_at FROM tenant_redirects WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenant.id]
  );

  return Response.json({ ok: true, redirects: rows });
}

const CreateSchema = z.object({
  from_path: z.string().min(1).max(500),
  to_path: z.string().min(1).max(500),
  status_code: z.number().int().refine((n) => [301, 302, 307, 308].includes(n), { message: "Must be 301, 302, 307, or 308" }).default(301),
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

  const { from_path, to_path, status_code } = parsed.data;
  const rows = await query<{ id: number }>(
    "INSERT INTO tenant_redirects (tenant_id, from_path, to_path, status_code) VALUES ($1, $2, $3, $4) RETURNING id",
    [tenant.id, from_path, to_path, status_code]
  );

  await auditLog("redirect_created", { tenantId: tenant.id, targetType: "redirect", targetId: String(rows[0]?.id) });
  return Response.json({ ok: true, id: rows[0]?.id });
}
