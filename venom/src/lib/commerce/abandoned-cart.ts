import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";

export interface AbandonedCart {
  id: number;
  token: string;
  email: string | null;
  item_count: number;
  total_cents: number;
  reminder_count: number;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getAbandonedCarts(tenantId: number, opts: { minAge?: number; maxReminders?: number } = {}) {
  await initCommerceDb();
  const minAgeHours = opts.minAge ?? 2;
  const maxReminders = opts.maxReminders ?? 3;
  return query<AbandonedCart>(
    `SELECT c.id, c.token, c.email,
       (SELECT COUNT(*)::int FROM cart_items ci WHERE ci.cart_id = c.id) AS item_count,
       COALESCE((
         SELECT SUM(pv.price_cents * ci.qty)
         FROM cart_items ci
         JOIN product_variants pv ON pv.id = ci.variant_id
         WHERE ci.cart_id = c.id
       ), 0)::int AS total_cents,
       c.reminder_count, c.reminder_sent_at::text, c.created_at::text, c.updated_at::text
     FROM carts c
     WHERE c.tenant_id = $1
       AND c.status = 'open'
       AND c.email IS NOT NULL
       AND c.reminder_count < $2
       AND c.updated_at < now() - ($3 || ' hours')::interval
       AND EXISTS (SELECT 1 FROM cart_items ci WHERE ci.cart_id = c.id)
     ORDER BY c.updated_at DESC`,
    [tenantId, maxReminders, String(minAgeHours)]
  ) ?? [];
}

export async function markReminderSent(tenantId: number, cartId: number) {
  await initCommerceDb();
  await query(
    `UPDATE carts SET reminder_count = reminder_count + 1, reminder_sent_at = now()
     WHERE id = $1 AND tenant_id = $2`,
    [cartId, tenantId]
  );
}

export async function setCartEmail(tenantId: number, cartToken: string, email: string) {
  await initCommerceDb();
  await query(
    `UPDATE carts SET email = $1 WHERE tenant_id = $2 AND token = $3 AND status = 'open'`,
    [email.toLowerCase(), tenantId, cartToken]
  );
}

export async function getAbandonedCartStats(tenantId: number) {
  await initCommerceDb();
  const stats = await query<{ status: string; count: number; total_cents: number }>(
    `SELECT
       CASE
         WHEN c.status = 'converted' THEN 'recovered'
         WHEN c.reminder_count > 0 AND c.status = 'open' THEN 'reminded'
         ELSE 'abandoned'
       END AS status,
       COUNT(*)::int AS count,
       COALESCE(SUM((
         SELECT COALESCE(SUM(pv.price_cents * ci.qty), 0)
         FROM cart_items ci JOIN product_variants pv ON pv.id = ci.variant_id
         WHERE ci.cart_id = c.id
       )), 0)::int AS total_cents
     FROM carts c
     WHERE c.tenant_id = $1 AND c.email IS NOT NULL
       AND c.created_at > now() - interval '30 days'
     GROUP BY 1`,
    [tenantId]
  );
  return stats ?? [];
}

export function buildAbandonedCartEmailHtml(opts: {
  shopName: string;
  cartUrl: string;
  items: Array<{ title: string; variant_title: string | null; qty: number; price: string; image_url: string | null }>;
  totalFormatted: string;
  couponCode?: string;
}) {
  const itemRows = opts.items.map((item) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0">
        <div style="display:flex;align-items:center;gap:12px">
          ${item.image_url ? `<img src="${item.image_url}" width="48" height="48" style="border-radius:6px;object-fit:cover" alt="">` : ""}
          <div>
            <div style="font-weight:600;color:#1a1a1a">${item.title}</div>
            ${item.variant_title ? `<div style="font-size:12px;color:#888">${item.variant_title}</div>` : ""}
          </div>
        </div>
      </td>
      <td style="padding:12px 8px;text-align:center;border-bottom:1px solid #f0f0f0">${item.qty}×</td>
      <td style="padding:12px 8px;text-align:right;font-weight:600;border-bottom:1px solid #f0f0f0">${item.price}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
  <div style="padding:32px 28px 24px;text-align:center;background:linear-gradient(135deg,#1a1a2e,#16213e)">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600">${opts.shopName}</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px">Zapomněli jste na svůj košík?</p>
  </div>
  <div style="padding:28px">
    <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 20px">
      Vypadá to, že jste nedokončili svůj nákup. Vaše položky na vás stále čekají:
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:14px 8px;font-weight:700;font-size:15px">Celkem</td>
        <td style="padding:14px 8px;text-align:right;font-weight:700;font-size:15px">${opts.totalFormatted}</td>
      </tr>
    </table>
    ${opts.couponCode ? `
    <div style="margin:20px 0;padding:14px;background:#fff8e6;border:1px solid #ffd966;border-radius:8px;text-align:center">
      <p style="margin:0 0 6px;font-size:13px;color:#666">Dokončete objednávku se slevou:</p>
      <div style="font-size:20px;font-weight:700;letter-spacing:2px;color:#b8860b">${opts.couponCode}</div>
    </div>` : ""}
    <div style="text-align:center;margin:24px 0 8px">
      <a href="${opts.cartUrl}" style="display:inline-block;padding:14px 36px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
        Dokončit objednávku →
      </a>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#aaa;text-align:center">
      Pokud jste nákup již dokončili, tento e-mail ignorujte.
    </p>
  </div>
</div>
</body></html>`;
}
