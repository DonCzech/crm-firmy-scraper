import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query, queryOne, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });

  const row = await queryOne<Record<string, unknown>>(
    `SELECT slug, email, plan, status, business_name,
            seo_default_title, seo_title_prefix, seo_title_suffix, seo_default_description,
            allow_indexing, canonical_enabled, maintenance_mode, maintenance_message,
            cookie_enabled, cookie_text, cookie_show_more,
            gtm_id, ga_measurement_id,
            billing_data, email_settings, brand_data,
            search_console_verification, analytics_config, created_at
     FROM tenants WHERE id = $1`,
    [tenant.id]
  );

  return Response.json({ ok: true, settings: row });
}

const PatchSchema = z.object({
  seo_default_title: z.string().max(200).nullish(),
  seo_title_prefix: z.string().max(100).nullish(),
  seo_title_suffix: z.string().max(100).nullish(),
  seo_default_description: z.string().max(300).nullish(),
  allow_indexing: z.boolean().nullish(),
  canonical_enabled: z.boolean().nullish(),
  maintenance_mode: z.boolean().nullish(),
  maintenance_message: z.string().max(500).nullish(),
  cookie_enabled: z.boolean().nullish(),
  cookie_text: z.string().nullish(),
  cookie_show_more: z.boolean().nullish(),
  gtm_id: z.string().max(50).nullish(),
  ga_measurement_id: z.string().max(50).nullish(),
  business_name: z.string().max(200).nullish(),
  search_console_verification: z.string().max(200).nullish(),
  billing_data: z.record(z.unknown()).nullish(),
  email_settings: z.record(z.unknown()).nullish(),
  brand_data: z.record(z.unknown()).nullish(),
}).partial();

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const data = parsed.data;
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return Response.json({ ok: true });

  const setClauses = entries.map(([k], i) => `${k} = $${i + 2}`).join(", ");
  const values = entries.map(([, v]) => v ?? null);

  await query(
    `UPDATE tenants SET ${setClauses}, updated_at = now() WHERE id = $1`,
    [tenant.id, ...values]
  );

  await auditLog("settings_updated", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: tenant.id.toString(),
    extra: { fields: entries.map(([k]) => k) },
  });

  return Response.json({ ok: true });
}
