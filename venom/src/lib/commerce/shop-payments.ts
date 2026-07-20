import { query, queryOne, withTransaction } from "@/lib/db";
import { createGoPayPayment, getGoPayPayment } from "@/lib/gopay";
import { initCommerceDb } from "./schema";
import { getShopByTenantId } from "./shop";
import { getOrder } from "./orders";
import type { OrderDetail } from "./types";

/**
 * Webero Commerce — shop platby (Fáze 4).
 * ODDĚLENÉ od subscription billingu (gopay_payments): objednávkové platby
 * žijí v commerce_payments, stav objednávky se mění idempotentně.
 */

export interface ShopPaymentRow {
  id: number;
  tenant_id: number;
  order_id: number;
  provider: string;
  provider_payment_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  gw_url: string | null;
}

/** Založí GoPay platbu pro objednávku a vrátí gateway URL. */
export async function createGoPayShopPayment(
  tenantId: number,
  order: OrderDetail,
  origin: string,
  tenantSlug: string
): Promise<{ gwUrl: string } | { error: string }> {
  await initCommerceDb();

  // Reuse: existující created platba se stejnou částkou → vrať původní gw_url
  const existing = await queryOne<ShopPaymentRow>(
    `SELECT * FROM commerce_payments
     WHERE tenant_id = $1 AND order_id = $2 AND provider = 'gopay' AND status IN ('pending','created')
     ORDER BY id DESC LIMIT 1`,
    [tenantId, order.id]
  );
  if (existing?.gw_url && existing.amount_cents === order.total_cents) {
    return { gwUrl: existing.gw_url };
  }

  const returnUrl = `${origin}/api/demo/${tenantSlug}/shop/payment/gopay/return?order=${encodeURIComponent(order.order_number)}&t=${order.public_token}`;
  const notificationUrl = `${origin}/api/demo/${tenantSlug}/shop/payment/gopay/webhook`;

  try {
    const payment = await createGoPayPayment({
      amountInCents: order.total_cents,
      currency: order.currency,
      orderId: order.order_number,
      description: `Objednávka ${order.order_number}`,
      returnUrl,
      notificationUrl,
      buyerEmail: order.email,
    });

    if (!payment.gw_url) return { error: "GoPay nevrátil platební bránu" };

    await query(
      `INSERT INTO commerce_payments (tenant_id, order_id, provider, provider_payment_id, amount_cents, currency, status, gw_url, raw_response)
       VALUES ($1, $2, 'gopay', $3, $4, $5, 'created', $6, $7)`,
      [tenantId, order.id, String(payment.id), order.total_cents, order.currency, payment.gw_url, JSON.stringify(payment)]
    );

    return { gwUrl: payment.gw_url };
  } catch (err) {
    console.error("[shop-payments] GoPay create failed:", err);
    return { error: "Platební bránu se nepodařilo otevřít. Zkuste to znovu, nebo zvolte převod." };
  }
}

/**
 * Idempotentní zpracování stavu GoPay platby (return i webhook).
 * Opakovaná notifikace stejného stavu = no-op.
 */
export async function processGoPayShopPayment(gopayId: number): Promise<{
  tenantId: number; orderNumber: string; publicToken: string | null; paid: boolean;
} | null> {
  await initCommerceDb();

  const row = await queryOne<ShopPaymentRow & { order_number: string; public_token: string | null }>(
    `SELECT cp.*, o.order_number, o.public_token
     FROM commerce_payments cp JOIN orders o ON o.id = cp.order_id
     WHERE cp.provider = 'gopay' AND cp.provider_payment_id = $1`,
    [String(gopayId)]
  );
  if (!row) return null;

  const payment = await getGoPayPayment(gopayId);
  const stateMap: Record<string, string> = {
    PAID: "paid",
    CANCELED: "cancelled",
    TIMEOUTED: "cancelled",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "refunded",
  };
  const newStatus = stateMap[payment.state] ?? "created";
  const paid = payment.state === "PAID";

  await withTransaction(async (client) => {
    // Idempotence: lock + no-op pokud už je stav zapsaný
    const cur = await client.query(
      "SELECT status FROM commerce_payments WHERE id = $1 FOR UPDATE",
      [row.id]
    );
    if (cur.rows[0]?.status === newStatus) return;

    await client.query(
      `UPDATE commerce_payments SET status = $2, raw_response = $3, updated_at = now() WHERE id = $1`,
      [row.id, newStatus, JSON.stringify(payment)]
    );

    if (paid) {
      const orderCur = await client.query(
        "SELECT payment_status, status FROM orders WHERE id = $1 FOR UPDATE",
        [row.order_id]
      );
      if (orderCur.rows[0]?.payment_status !== "paid") {
        await client.query(
          `UPDATE orders SET payment_status = 'paid',
             status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
             updated_at = now()
           WHERE id = $1`,
          [row.order_id]
        );
        await client.query(
          `INSERT INTO order_events (tenant_id, order_id, type, message, data)
           VALUES ($1, $2, 'payment_status_changed', 'Platba přijata (GoPay)', $3)`,
          [row.tenant_id, row.order_id, JSON.stringify({ provider: "gopay", gopay_id: gopayId, to: "paid" })]
        );
      }
    } else if (newStatus === "cancelled") {
      await client.query(
        `INSERT INTO order_events (tenant_id, order_id, type, message, data)
         VALUES ($1, $2, 'payment_status_changed', $3, $4)`,
        [row.tenant_id, row.order_id, `Platba ${payment.state === "TIMEOUTED" ? "vypršela" : "zrušena"} (GoPay)`,
         JSON.stringify({ provider: "gopay", gopay_id: gopayId, state: payment.state })]
      );
    }
  });

  // E-mail o přijaté platbě (jen při prvním přechodu na paid — kontrola výše zajistí,
  // že event vznikl; e-mail pošleme mimo tx a jen když jsme skutečně přepnuli)
  if (paid) {
    const order = await getOrder(row.tenant_id, row.order_id);
    const shop = await getShopByTenantId(row.tenant_id);
    if (order && shop) {
      // Poslat jen jednou: poslední payment event musí být čerstvý GoPay přechod
      const freshlyPaid = order.events.find(
        (e) => e.type === "payment_status_changed" && (e.data as { provider?: string })?.provider === "gopay"
      );
      if (freshlyPaid && Date.now() - new Date(freshlyPaid.created_at).getTime() < 60_000) {
        const { sendPaymentConfirmedEmail } = await import("./emails");
        sendPaymentConfirmedEmail(order, shop).catch(() => {});
      }
    }
  }

  return { tenantId: row.tenant_id, orderNumber: row.order_number, publicToken: row.public_token, paid };
}
