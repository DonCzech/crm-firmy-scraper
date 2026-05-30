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

  const [users, tenants, subs, recentTenants, lifecycle, lastCleanupAt, lastCleanupSummary] = await Promise.all([
    query<{ total: string }>("SELECT COUNT(*)::int AS total FROM user_accounts"),
    query<{ total: string; demo: string; active: string }>(
      `SELECT COUNT(*)::int AS total,
              COUNT(CASE WHEN status = 'demo' THEN 1 END)::int AS demo,
              COUNT(CASE WHEN status = 'active' THEN 1 END)::int AS active
       FROM tenants`
    ),
    query<{ trial: string; paid: string; expired: string; cancelled: string }>(
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
    query<{ active: string; inactive_warning: string; archived: string; at_risk: string }>(
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
  ]);

  return Response.json({
    users: users[0]?.total ?? 0,
    tenants: tenants[0],
    subscriptions: subs[0],
    recentTenants,
    lifecycle: lifecycle[0],
    lastCleanupAt,
    lastCleanupSummary: lastCleanupSummary ? JSON.parse(lastCleanupSummary) : null,
    mrr: (Number(subs[0]?.paid ?? 0)) * 500,
  });
}
