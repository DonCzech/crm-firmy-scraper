import { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { query, getSetting } from "@/lib/db";

function getAdmin(req: NextRequest) {
  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(match[1]);
}

export async function GET(request: NextRequest) {
  if (!getAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [
    users, tenants, subs, recentTenants, lifecycle,
    lastCleanupAt, lastCleanupSummary,
    signups7d, signups30d, dailySignups, churnData,
  ] = await Promise.all([
    query<{ total: number }>("SELECT COUNT(*)::int AS total FROM user_accounts"),
    query<{ total: number; demo: number; active: number }>(
      `SELECT COUNT(*)::int AS total,
              COUNT(CASE WHEN status = 'demo' THEN 1 END)::int AS demo,
              COUNT(CASE WHEN status = 'active' THEN 1 END)::int AS active
       FROM tenants`
    ),
    query<{ trial: number; paid: number; expired: number; cancelled: number }>(
      `SELECT COUNT(CASE WHEN status = 'trial' THEN 1 END)::int AS trial,
              COUNT(CASE WHEN status = 'active' THEN 1 END)::int AS paid,
              COUNT(CASE WHEN status = 'expired' THEN 1 END)::int AS expired,
              COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int AS cancelled
       FROM subscriptions`
    ),
    query<{ slug: string; email: string; industry: string | null; created_at: string; sub_status: string | null }>(
      `SELECT t.slug, t.email, t.industry, t.created_at, s.status AS sub_status
       FROM tenants t
       LEFT JOIN subscriptions s ON s.tenant_id = t.id
       ORDER BY t.created_at DESC LIMIT 10`
    ),
    query<{ active: number; inactive_warning: number; archived: number; at_risk: number }>(
      `SELECT
         COUNT(CASE WHEN lifecycle_status = 'active' THEN 1 END)::int AS active,
         COUNT(CASE WHEN lifecycle_status = 'inactive_warning' THEN 1 END)::int AS inactive_warning,
         COUNT(CASE WHEN lifecycle_status = 'archived' THEN 1 END)::int AS archived,
         COUNT(CASE WHEN lifecycle_status = 'active'
                     AND last_activity_at < now() - INTERVAL '45 days'
                     AND NOT EXISTS (
                       SELECT 1 FROM subscriptions s
                       WHERE s.tenant_id = tenants.id
                         AND s.status IN ('active','trial')
                         AND (s.status = 'active' OR s.trial_ends_at > now())
                     )
               THEN 1 END)::int AS at_risk
       FROM tenants`
    ),
    getSetting("last_cleanup_at"),
    getSetting("last_cleanup_summary"),
    // Signups last 7 days
    query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM tenants WHERE created_at >= now() - INTERVAL '7 days'"
    ),
    // Signups last 30 days
    query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM tenants WHERE created_at >= now() - INTERVAL '30 days'"
    ),
    // Daily signups — last 14 days
    query<{ day: string; count: number }>(
      `SELECT date_trunc('day', created_at)::date::text AS day, COUNT(*)::int AS count
       FROM tenants
       WHERE created_at >= now() - INTERVAL '14 days'
       GROUP BY 1 ORDER BY 1`
    ),
    // Churn: cancelled last 30d vs (paid + cancelled last 30d)
    query<{ cancelled_30d: number; activated_30d: number }>(
      `SELECT
         COUNT(CASE WHEN status = 'cancelled' AND updated_at >= now() - INTERVAL '30 days' THEN 1 END)::int AS cancelled_30d,
         COUNT(CASE WHEN status IN ('active','cancelled') AND updated_at >= now() - INTERVAL '30 days' THEN 1 END)::int AS activated_30d
       FROM subscriptions`
    ),
  ]);

  const paid = Number(subs[0]?.paid ?? 0);
  const mrr = paid * 49900; // 499 Kč in hellers → display as Kč

  const c30d = Number(churnData[0]?.cancelled_30d ?? 0);
  const a30d = Number(churnData[0]?.activated_30d ?? 0);
  const churnRate = a30d > 0 ? Math.round((c30d / a30d) * 100) : 0;

  return Response.json({
    users: users[0]?.total ?? 0,
    tenants: tenants[0],
    subscriptions: subs[0],
    recentTenants,
    lifecycle: lifecycle[0],
    lastCleanupAt,
    lastCleanupSummary: lastCleanupSummary ? JSON.parse(lastCleanupSummary) : null,
    mrr,
    signups7d: signups7d[0]?.count ?? 0,
    signups30d: signups30d[0]?.count ?? 0,
    dailySignups,
    churnRate,
  });
}
