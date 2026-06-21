import { NextRequest } from "next/server";
import { query, auditLog } from "@/lib/db";

/**
 * Vercel Cron — proactive template cache warmup.
 *
 * Schedule: 30 * * * * (hourly, offset 30 min from seed-templates).
 *
 * Picks active tenants on v2 that haven't been rendered in the last hour and
 * fires a HEAD request against their public page. The render warms the
 * in-process template_versions LRU cache (5-min TTL) and the section-resolver
 * slot cache (60-sec TTL) for that tenant so the next real visitor doesn't
 * cold-hit DB.
 *
 * Caps work at 20 warmups per invocation (well under Vercel 60s limit).
 *
 * Auth: x-cron-secret header must match CRON_SECRET env var.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://webero.co";

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== (process.env.CRON_SECRET ?? "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pick up to 20 active v2 tenants whose last_activity_at < now() - 1 hour
  // (or null), preferring custom_domain tenants first since they have real
  // traffic stakes.
  interface TenantRow { id: number; slug: string; custom_domain: string | null }
  const rows = await query<TenantRow>(
    `SELECT DISTINCT ON (t.id) t.id, t.slug,
            (SELECT d.domain FROM domains d
              WHERE d.tenant_id = t.id AND d.verified = true
              ORDER BY d.created_at ASC LIMIT 1) AS custom_domain
       FROM tenants t
       JOIN sections s ON s.tenant_id = t.id AND s.content_source = 'v2'
      WHERE t.status = 'active'
        AND t.lifecycle_status = 'active'
        AND (t.last_activity_at IS NULL OR t.last_activity_at < now() - interval '1 hour')
      ORDER BY t.id DESC
      LIMIT 20`
  );

  let warmed = 0;
  let failed = 0;
  for (const t of rows) {
    const url = t.custom_domain
      ? `https://${t.custom_domain}`
      : `${BASE_URL}/demo/${t.slug}`;
    try {
      const res = await fetch(url, {
        method: "HEAD",
        headers: { "user-agent": "venom-cron-warmup/1.0" },
      });
      if (res.ok) warmed++;
      else failed++;
    } catch {
      failed++;
    }
  }

  if (warmed > 0 || failed > 0) {
    await auditLog("cron_warmup_renders", {
      targetType: "tenant",
      extra: { warmed, failed, totalPicked: rows.length },
    });
  }

  return Response.json({ picked: rows.length, warmed, failed });
}
