import { query } from "@/lib/db";

interface OrderInfo {
  order_number: string;
  customer_email: string;
  shipping_name: string;
  status: string;
  total_cents: number;
}

function czk(cents: number): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(cents / 100);
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Čeká na zpracování",
    confirmed: "Potvrzena",
    processing: "Zpracovává se",
    shipped: "Odeslána",
    completed: "Dokončena",
    cancelled: "Zrušena",
  };
  return map[status] ?? status;
}

function buildEmailHtml(order: OrderInfo, shopName: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif; max-width:600px; margin:0 auto; padding:20px; color:#222;">
  <div style="text-align:center; padding:20px 0; border-bottom:2px solid #111;">
    <h1 style="font-size:22px; font-weight:800; margin:0;">${shopName}</h1>
  </div>
  <div style="padding:24px 0;">
    <h2 style="font-size:18px; font-weight:700; margin:0 0 8px;">Stav objednávky: ${statusLabel(order.status)}</h2>
    <p style="color:#666; font-size:14px; margin:0 0 16px;">
      Dobrý den, ${order.shipping_name || "zákazníku"},
    </p>
    <p style="font-size:14px; line-height:1.6;">
      Vaše objednávka <strong>${order.order_number}</strong> byla aktualizována na stav: <strong>${statusLabel(order.status)}</strong>.
    </p>
    <div style="margin:20px 0; padding:16px; background:#f9fafb; border-radius:10px;">
      <div style="display:flex; justify-content:space-between; font-size:14px;">
        <span>Objednávka:</span><strong>${order.order_number}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:14px; margin-top:8px;">
        <span>Celkem:</span><strong>${czk(order.total_cents)}</strong>
      </div>
    </div>
    ${order.status === "shipped" ? `
    <p style="font-size:14px; color:#166534; background:#f0fdf4; padding:12px 16px; border-radius:8px;">
      📦 Vaše zásilka je na cestě! Sledování zásilky naleznete v detailu objednávky.
    </p>` : ""}
    ${order.status === "cancelled" ? `
    <p style="font-size:14px; color:#991b1b; background:#fef2f2; padding:12px 16px; border-radius:8px;">
      Vaše objednávka byla zrušena. Pokud máte dotazy, kontaktujte nás.
    </p>` : ""}
  </div>
  <div style="padding:16px 0; border-top:1px solid #eee; text-align:center; font-size:11px; color:#999;">
    ${shopName} · Powered by Webero
  </div>
</body></html>`;
}

export async function queueOrderStatusEmail(orderId: number, tenantId: number, shopName: string): Promise<void> {
  const orders = await query<OrderInfo>(
    `SELECT order_number, customer_email, COALESCE(shipping_name, '') as shipping_name,
            status, total_cents
     FROM orders WHERE id = $1 AND tenant_id = $2`,
    [orderId, tenantId]
  );
  if (orders.length === 0) return;
  const order = orders[0];

  await query(
    `INSERT INTO commerce_email_queue (tenant_id, order_id, to_email, subject, html_body)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      tenantId,
      orderId,
      order.customer_email,
      `${shopName} — Objednávka ${order.order_number}: ${statusLabel(order.status)}`,
      buildEmailHtml(order, shopName),
    ]
  );
}
