import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/user-auth";
import { query } from "@/lib/db";

// GET /api/account/billing?tenantSlug=xxx
export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenantSlug");

  const rows = await query<{
    tenant_id: number; slug: string; sub_id: number | null;
    status: string | null; plan: string | null; trial_starts_at: string | null;
    trial_ends_at: string | null; paid_at: string | null; next_billing_at: string | null;
    price_czk: number | null; billing_cycle: string | null; cancelled_at: string | null;
    days_remaining: number | null;
  }>(
    `SELECT t.id AS tenant_id, t.slug,
            s.id AS sub_id, s.status, s.plan, s.trial_starts_at, s.trial_ends_at,
            s.paid_at, s.next_billing_at, s.price_czk, s.billing_cycle, s.cancelled_at,
            GREATEST(0, CEIL(EXTRACT(EPOCH FROM (s.trial_ends_at - NOW())) / 86400))::int AS days_remaining
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     WHERE t.user_account_id = $1 ${tenantSlug ? "AND t.slug = $2" : ""}
     ORDER BY t.created_at DESC`,
    tenantSlug ? [payload.id, tenantSlug] : [payload.id]
  );

  return Response.json(tenantSlug ? (rows[0] ?? null) : rows);
}
