import { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { query } from "@/lib/db";

function getAdmin(req: NextRequest) {
  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(match[1]);
}

// GET /api/admin/users — list all user accounts with their tenants + subscription info
export async function GET(request: NextRequest) {
  if (!getAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const users = await query<{
    id: number; email: string; name: string | null; phone: string | null;
    created_at: string; tenant_count: number;
    active_count: number; trial_count: number; paid_count: number;
  }>(
    `SELECT u.id, u.email, u.name, u.phone, u.created_at,
            COUNT(t.id)::int AS tenant_count,
            COUNT(CASE WHEN s.status = 'active' THEN 1 END)::int AS active_count,
            COUNT(CASE WHEN s.status = 'trial' OR s.status IS NULL THEN 1 END)::int AS trial_count,
            COUNT(CASE WHEN s.status = 'active' AND s.paid_at IS NOT NULL THEN 1 END)::int AS paid_count
     FROM user_accounts u
     LEFT JOIN tenants t ON t.user_account_id = u.id
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     GROUP BY u.id, u.email, u.name, u.phone, u.created_at
     ORDER BY u.created_at DESC`
  );

  // Also get tenants without user_account (orphan demo sites)
  const orphanTenants = await query<{
    id: number; slug: string; email: string; status: string; plan: string;
    industry: string | null; created_at: string; sub_status: string | null; days_remaining: number | null;
  }>(
    `SELECT t.id, t.slug, t.email, t.status, t.plan, t.industry, t.created_at,
            s.status AS sub_status,
            GREATEST(0, CEIL(EXTRACT(EPOCH FROM (s.trial_ends_at - NOW())) / 86400))::int AS days_remaining
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     WHERE t.user_account_id IS NULL
     ORDER BY t.created_at DESC`
  );

  return Response.json({ users, orphanTenants });
}
