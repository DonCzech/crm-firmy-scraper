import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/user-auth";
import { getUserById, query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  // 200 + user:null místo 401 — studio běží i jen na tenant cookie a 401 by jinak
  // na každém loadu editoru házel error do konzole
  if (!payload) return Response.json({ user: null });

  const user = await getUserById(payload.id);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const tenants = await query<{
    id: number; slug: string; email: string; status: string; plan: string;
    business_name: string | null; industry: string | null; created_at: string;
    sub_status: string | null; trial_ends_at: string | null; days_remaining: number | null;
  }>(
    `SELECT t.id, t.slug, t.email, t.status, t.plan, t.business_name, t.industry, t.created_at,
            s.status AS sub_status, s.trial_ends_at,
            GREATEST(0, CEIL(EXTRACT(EPOCH FROM (s.trial_ends_at - NOW())) / 86400))::int AS days_remaining
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     WHERE t.user_account_id = $1
     ORDER BY t.created_at DESC`,
    [user.id]
  );

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    created_at: user.created_at,
    tenants,
  });
}
