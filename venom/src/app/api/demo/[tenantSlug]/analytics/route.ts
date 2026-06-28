import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query } from "@/lib/db";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { assertSameOrigin } from "@/lib/demo-auth";

const BodySchema = z.object({
  gtm_id: z.string().regex(/^GTM-[A-Z0-9]+$/).nullable().optional(),
  ga4_id: z.string().regex(/^G-[A-Z0-9]+$/).nullable().optional(),
  fb_pixel_id: z.string().regex(/^\d+$/).nullable().optional(),
  search_console_verification: z.string().max(200).nullable().optional(),
});

async function checkAuth(tenantSlug: string): Promise<boolean> {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant?.access_token) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!token) return false;
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(tenant.access_token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * GET /api/demo/<slug>/analytics
 *   Returns the analytics_config + search_console_verification + a 30-day
 *   activity series derived from audit_log (used as a proxy for "site
 *   editing volume" in the Analytics panel until per-page-view tracking is
 *   implemented).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { tenantSlug } = await params;
  if (!(await checkAuth(tenantSlug))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });

  const activity = await query<{ day: string; count: string; action: string }>(
    `SELECT to_char(created_at, 'YYYY-MM-DD') AS day,
            COUNT(*)::text AS count,
            action
       FROM audit_log
      WHERE tenant_id = $1 AND created_at >= now() - interval '30 days'
      GROUP BY day, action
      ORDER BY day ASC`,
    [tenant.id]
  );

  return Response.json({
    config: tenant.analytics_config ?? {},
    searchConsole: tenant.search_console_verification ?? null,
    activity: activity.map((a) => ({ day: a.day, count: parseInt(a.count, 10), action: a.action })),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;

  if (!(await checkAuth(tenantSlug))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });

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

  const { gtm_id, ga4_id, fb_pixel_id, search_console_verification } = parsed.data;

  const analyticsConfig: Record<string, string> = {};
  if (gtm_id) analyticsConfig.gtm_id = gtm_id;
  if (ga4_id) analyticsConfig.ga4_id = ga4_id;
  if (fb_pixel_id) analyticsConfig.fb_pixel_id = fb_pixel_id;

  await query(
    `UPDATE tenants
     SET analytics_config = $1, search_console_verification = $2, updated_at = now()
     WHERE id = $3`,
    [JSON.stringify(analyticsConfig), search_console_verification ?? null, tenant.id]
  );

  await query(
    `INSERT INTO audit_log (tenant_id, action, actor, details) VALUES ($1, 'analytics.updated', 'admin', $2)`,
    [tenant.id, JSON.stringify({ gtm_id, ga4_id, fb_pixel_id })]
  );

  return Response.json({ ok: true });
}
