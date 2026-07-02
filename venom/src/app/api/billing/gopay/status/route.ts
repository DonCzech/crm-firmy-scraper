import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/user-auth";
import { requireTenantAdmin } from "@/lib/demo-auth";
import { initDb, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initDb();

  const tenantSlug = req.nextUrl.searchParams.get("tenantSlug") || "";
  if (!tenantSlug) return NextResponse.json({ error: "missing_tenant" }, { status: 400 });

  // Přístup: buď vlastník (user JWT), nebo tenant-admin cookie pro daný slug
  let tenantId: number | null = null;
  const user = getUserFromRequest(req);
  if (user) {
    const tenantRows = await query<{ id: number }>(
      `SELECT t.id FROM tenants t
       JOIN user_accounts ua ON ua.id = t.user_account_id
       WHERE t.slug = $1 AND ua.id = $2 LIMIT 1`,
      [tenantSlug, user.id]
    );
    if (tenantRows[0]) tenantId = tenantRows[0].id;
  }
  if (tenantId === null) {
    const auth = await requireTenantAdmin(tenantSlug);
    if (auth.ok && auth.tenant) tenantId = auth.tenant.id;
  }
  if (tenantId === null) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const tenant = { id: tenantId };

  const subRows = await query(
    `SELECT status, plan, trial_ends_at, paid_at, next_billing_at, next_charge_at,
            payment_provider, charge_attempt_count,
            GREATEST(0, CEIL(EXTRACT(EPOCH FROM (trial_ends_at - NOW())) / 86400))::int AS days_remaining
     FROM subscriptions WHERE tenant_id = $1`,
    [tenant.id]
  );

  const payRows = await query(
    `SELECT gopay_id, order_number, status, amount_cents, created_at
     FROM gopay_payments WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [tenant.id]
  );

  return NextResponse.json({
    subscription: subRows[0] ?? null,
    recent_payments: payRows,
  });
}
