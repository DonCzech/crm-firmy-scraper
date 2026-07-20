import { NextRequest } from "next/server";
import { z } from "zod";
import { auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import {
  getTenantCustomCode,
  saveTenantCustomCode,
  invalidateCustomCodeCache,
  EMPTY_CUSTOM_CODE,
  CUSTOM_CODE_FIELD_LIMIT,
} from "@/lib/custom-code";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  invalidateCustomCodeCache(tenant.id); // admin chce vždy čerstvá data
  const code = await getTenantCustomCode(tenant.id);
  return Response.json({ ok: true, code: code ?? EMPTY_CUSTOM_CODE });
}

const SaveSchema = z.object({
  enabled: z.boolean().default(true),
  head_html: z.string().max(CUSTOM_CODE_FIELD_LIMIT).default(""),
  body_end_html: z.string().max(CUSTOM_CODE_FIELD_LIMIT).default(""),
  custom_css: z.string().max(CUSTOM_CODE_FIELD_LIMIT).default(""),
  custom_js: z.string().max(CUSTOM_CODE_FIELD_LIMIT).default(""),
});

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const errors = await saveTenantCustomCode(tenant.id, parsed.data);
  if (errors.length) {
    return Response.json({ error: errors[0].message, errors }, { status: 422 });
  }

  await auditLog("custom_code_updated", {
    tenantId: tenant.id,
    targetType: "tenant_custom_code",
    targetId: String(tenant.id),
    extra: {
      enabled: parsed.data.enabled,
      head_html_len: parsed.data.head_html.length,
      body_end_html_len: parsed.data.body_end_html.length,
      custom_css_len: parsed.data.custom_css.length,
      custom_js_len: parsed.data.custom_js.length,
    },
  });

  return Response.json({ ok: true });
}
