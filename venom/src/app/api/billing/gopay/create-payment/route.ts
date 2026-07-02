import { NextRequest, NextResponse } from "next/server";
import { createGoPayPayment } from "@/lib/gopay";
import { getUserFromRequest } from "@/lib/user-auth";
import { initDb, query } from "@/lib/db";
import { PLAN_AMOUNT_CENTS, PLAN_CURRENCY, PLAN_DESCRIPTION, makeOrderId, recurrenceDateTo } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  await initDb();

  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { tenantSlug?: string };
  const tenantSlug = typeof body.tenantSlug === "string" ? body.tenantSlug.trim() : "";
  if (!tenantSlug) return NextResponse.json({ error: "missing_tenant" }, { status: 400 });

  const tenantRows = await query<{ id: number; email: string }>(
    `SELECT t.id, t.email FROM tenants t
     JOIN user_accounts ua ON ua.id = t.user_account_id
     WHERE t.slug = $1 AND ua.id = $2 LIMIT 1`,
    [tenantSlug, user.id]
  );
  const tenant = tenantRows[0];
  if (!tenant) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const orderId = makeOrderId();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  try {
    const payment = await createGoPayPayment({
      amountInCents: PLAN_AMOUNT_CENTS,
      currency: PLAN_CURRENCY,
      orderId,
      description: PLAN_DESCRIPTION,
      returnUrl: `${appUrl}/api/billing/gopay/return?orderId=${encodeURIComponent(orderId)}&tenantSlug=${encodeURIComponent(tenantSlug)}`,
      notificationUrl: `${appUrl}/api/billing/gopay/webhook`,
      buyerEmail: tenant.email || undefined,
      recurrence: {
        recurrence_cycle: "ON_DEMAND",
        recurrence_date_to: recurrenceDateTo(),
      },
    });

    if (!payment.gw_url) throw new Error("GoPay returned no gateway URL");

    await query(
      `INSERT INTO gopay_payments
         (tenant_id, user_account_id, gopay_id, order_number, type, amount_cents, currency, status, gw_url, raw_response)
       VALUES ($1, $2, $3, $4, 'initial', $5, $6, 'pending', $7, $8)
       ON CONFLICT (order_number) DO NOTHING`,
      [tenant.id, user.id, String(payment.id), orderId, PLAN_AMOUNT_CENTS, PLAN_CURRENCY, payment.gw_url, JSON.stringify(payment)]
    );

    await query(
      `INSERT INTO payment_attempts
         (tenant_id, user_account_id, email, provider, action, amount_cents, currency, gopay_id, order_number, status)
       VALUES ($1, $2, $3, 'gopay', 'create', $4, $5, $6, $7, 'ok')`,
      [tenant.id, user.id, tenant.email, PLAN_AMOUNT_CENTS, PLAN_CURRENCY, String(payment.id), orderId]
    );

    return NextResponse.json({ url: payment.gw_url, gopayId: payment.id, orderId });
  } catch (err) {
    console.error("[billing/gopay/create-payment]", err);

    await query(
      `INSERT INTO payment_attempts
         (tenant_id, user_account_id, email, provider, action, amount_cents, currency, order_number, status, message)
       VALUES ($1, $2, $3, 'gopay', 'create', $4, $5, $6, 'failed', $7)`,
      [tenant.id, user.id, tenant.email, PLAN_AMOUNT_CENTS, PLAN_CURRENCY, orderId, String(err)]
    ).catch(() => null);

    return NextResponse.json({ error: "payment_creation_failed" }, { status: 500 });
  }
}
