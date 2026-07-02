import { NextRequest, NextResponse } from "next/server";
import { createGoPayRecurrence } from "@/lib/gopay";
import { initDb, query } from "@/lib/db";
import { PLAN_AMOUNT_CENTS, PLAN_CURRENCY, PLAN_DESCRIPTION, makeOrderId } from "@/lib/pricing";

export const maxDuration = 300;

/**
 * Cron: charge active GoPay subscriptions whose next_charge_at is overdue.
 * Invoke: GET /api/cron/gopay-recurring  (x-cron-secret header or ?secret=)
 * Schedule: daily at 03:00 UTC via Vercel Cron or external scheduler.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await initDb();

  const now = new Date().toISOString();
  const due = await query<{
    tenant_id: number;
    provider_transaction_id: string;
    charge_attempt_count: number;
  }>(
    `SELECT tenant_id, provider_transaction_id, charge_attempt_count
     FROM subscriptions
     WHERE payment_provider = 'gopay'
       AND status = 'active'
       AND next_charge_at <= $1
       AND charge_attempt_count < 3
     ORDER BY next_charge_at ASC
     LIMIT 50`,
    [now]
  );

  const results: Array<{ tenant_id: number; status: string; error?: string }> = [];

  for (const row of due) {
    const orderId = makeOrderId();
    try {
      await query(
        `UPDATE subscriptions
         SET last_charge_attempt_at = now(),
             charge_attempt_count   = charge_attempt_count + 1,
             updated_at             = now()
         WHERE tenant_id = $1`,
        [row.tenant_id]
      );

      const payment = await createGoPayRecurrence({
        parentGopayId: row.provider_transaction_id,
        amountInCents: PLAN_AMOUNT_CENTS,
        currency: PLAN_CURRENCY,
        orderId,
        description: PLAN_DESCRIPTION,
      });

      await query(
        `INSERT INTO gopay_payments
           (tenant_id, gopay_id, order_number, type, parent_gopay_id, amount_cents, currency, status, raw_response)
         VALUES ($1, $2, $3, 'recurring', $4, $5, $6, $7, $8)`,
        [
          row.tenant_id,
          String(payment.id),
          orderId,
          row.provider_transaction_id,
          PLAN_AMOUNT_CENTS,
          PLAN_CURRENCY,
          payment.state === "PAID" ? "paid" : "pending",
          JSON.stringify(payment),
        ]
      );

      if (payment.state === "PAID") {
        const nextCharge = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await query(
          `UPDATE subscriptions
           SET next_charge_at       = $1,
               next_billing_at      = $1,
               charge_attempt_count = 0,
               updated_at           = now()
           WHERE tenant_id = $2`,
          [nextCharge, row.tenant_id]
        );
      }

      await query(
        `INSERT INTO payment_attempts
           (tenant_id, provider, action, amount_cents, currency, gopay_id, order_number, status)
         VALUES ($1, 'gopay', 'recurring', $2, $3, $4, $5, $6)`,
        [row.tenant_id, PLAN_AMOUNT_CENTS, PLAN_CURRENCY, String(payment.id), orderId,
          payment.state === "PAID" ? "ok" : "pending"]
      );

      results.push({ tenant_id: row.tenant_id, status: payment.state });
    } catch (err) {
      console.error(`[cron/gopay-recurring] tenant ${row.tenant_id}`, err);

      await query(
        `INSERT INTO payment_attempts
           (tenant_id, provider, action, amount_cents, currency, order_number, status, message)
         VALUES ($1, 'gopay', 'recurring', $2, $3, $4, 'failed', $5)`,
        [row.tenant_id, PLAN_AMOUNT_CENTS, PLAN_CURRENCY, orderId, String(err)]
      ).catch(() => null);

      results.push({ tenant_id: row.tenant_id, status: "failed", error: String(err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
