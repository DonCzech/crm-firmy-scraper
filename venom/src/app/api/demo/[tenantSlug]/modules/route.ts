import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query } from "@/lib/db";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { assertSameOrigin } from "@/lib/demo-auth";

const BodySchema = z.object({
  module_key: z.string().min(1).max(50),
  enabled: z.boolean(),
});

async function checkAuth(tenantSlug: string): Promise<{ ok: boolean; tenantId?: number }> {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant?.access_token) return { ok: false };
  const cookieStore = await cookies();
  const token = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!token) return { ok: false };
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(tenant.access_token);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
    return { ok: true, tenantId: tenant.id };
  } catch {
    return { ok: false };
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenantId } = await checkAuth(tenantSlug);
  if (!ok || !tenantId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data" }, { status: 400 });
  }

  const { module_key, enabled } = parsed.data;

  // Upsert into tenant_modules
  await query(
    `INSERT INTO tenant_modules (tenant_id, module_key, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (tenant_id, module_key)
     DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()`,
    [tenantId, module_key, enabled]
  );

  // Sync active_modules array on tenants table (source of truth for runtime checks)
  if (enabled) {
    await query(
      `UPDATE tenants SET active_modules = array_append(
        array_remove(active_modules, $1::text), $1::text
      ), updated_at = now() WHERE id = $2`,
      [module_key, tenantId]
    );
  } else {
    await query(
      `UPDATE tenants SET active_modules = array_remove(active_modules, $1::text), updated_at = now()
       WHERE id = $2`,
      [module_key, tenantId]
    );
  }

  await query(
    `INSERT INTO audit_log (tenant_id, action, actor, details) VALUES ($1, $2, 'admin', $3)`,
    [tenantId, `module.${enabled ? "enabled" : "disabled"}`, JSON.stringify({ module_key })]
  );

  return Response.json({ ok: true });
}
