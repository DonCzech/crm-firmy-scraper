import { NextRequest, NextResponse } from "next/server";
import { getGoPayPayment } from "@/lib/gopay";
import { activateGoPaySubscription, initDb, query } from "@/lib/db";

export const maxDuration = 60;

const PROCESSING_STATES = new Set(["CREATED", "PAYMENT_METHOD_CHOSEN", "AUTHORIZED"]);

function gopayStatus(state: string): string {
  if (state === "PAID") return "paid";
  if (PROCESSING_STATES.has(state)) return state.toLowerCase();
  return "failed";
}

async function handle(req: NextRequest) {
  await initDb();

  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  try {
    const payment = await getGoPayPayment(Number(id));

    const rows = await query<{
      tenant_id: number;
      order_number: string;
      type: string;
      parent_gopay_id: string | null;
    }>(
      "SELECT tenant_id, order_number, type, parent_gopay_id FROM gopay_payments WHERE gopay_id = $1 LIMIT 1",
      [id]
    );
    const row = rows[0];

    if (!row) return NextResponse.json({ received: true });

    if (row.type === "recurring") {
      await query(
        `UPDATE gopay_payments
         SET status = $1, raw_response = $2, updated_at = now()
         WHERE order_number = $3`,
        [gopayStatus(payment.state), JSON.stringify(payment), row.order_number]
      );

      if (payment.state === "PAID" && row.parent_gopay_id) {
        const nextCharge = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await query(
          `UPDATE subscriptions
           SET next_charge_at       = $1,
               next_billing_at      = $1,
               charge_attempt_count = 0,
               updated_at           = now()
           WHERE tenant_id = $2 AND payment_provider = 'gopay' AND status = 'active'`,
          [nextCharge, row.tenant_id]
        );
      }

      await query(
        `INSERT INTO payment_attempts
           (tenant_id, provider, action, gopay_id, order_number, status, raw_response)
         VALUES ($1, 'gopay', 'webhook', $2, $3, $4, $5)`,
        [row.tenant_id, id, row.order_number, gopayStatus(payment.state), JSON.stringify(payment)]
      );

      return NextResponse.json({ received: true });
    }

    await activateGoPaySubscription({
      tenantId: row.tenant_id,
      orderId: row.order_number,
      gopayId: id,
      payment,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[billing/gopay/webhook]", err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
