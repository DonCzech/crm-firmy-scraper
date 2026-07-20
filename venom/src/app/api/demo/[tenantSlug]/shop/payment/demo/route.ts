import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, queryOne, withTransaction } from "@/lib/db";
import { assertSameOrigin } from "@/lib/demo-auth";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { queueOrderStatusSms } from "@/lib/commerce/sms";

/**
 * Moduly „PayPal“ a „Nákup na splátky“ — demo platební brána.
 * Zaplatit → payment_status=paid (idempotentně, jako GoPay flow),
 * Zrušit → payment_status=failed. Vše auditované v order_events.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({
  order_number: z.string().min(3).max(40),
  token: z.string().min(8).max(120),
  action: z.enum(["pay", "cancel"]),
});

const PROVIDER_LABELS: Record<string, string> = { paypal: "PayPal", splatky: "Splátky" };

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Neplatný požadavek" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Neplatný požadavek" }, { status: 400 });
  const { order_number, token, action } = parsed.data;

  await initCommerceDb();
  const order = await queryOne<{ id: number; payment_method: string | null; payment_status: string }>(
    `SELECT id, payment_method, payment_status FROM orders
     WHERE tenant_id = $1 AND order_number = $2 AND public_token = $3`,
    [tenant.id, order_number, token]
  );
  if (!order) return Response.json({ error: "Objednávka nenalezena" }, { status: 404 });

  const provider = order.payment_method ?? "";
  if (!(provider in PROVIDER_LABELS)) {
    return Response.json({ error: "Objednávka nepoužívá demo platební bránu" }, { status: 400 });
  }
  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has(provider)) {
    return Response.json({ error: `Modul ${PROVIDER_LABELS[provider]} není aktivní` }, { status: 403 });
  }

  const label = PROVIDER_LABELS[provider];
  await withTransaction(async (client) => {
    const cur = await client.query("SELECT payment_status FROM orders WHERE id = $1 FOR UPDATE", [order.id]);
    const current = cur.rows[0]?.payment_status;
    if (current === "paid") return; // idempotence — už zaplaceno

    if (action === "pay") {
      await client.query(
        `UPDATE orders SET payment_status = 'paid',
           status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
           updated_at = now()
         WHERE id = $1`,
        [order.id]
      );
      await client.query(
        `INSERT INTO order_events (tenant_id, order_id, type, message, data)
         VALUES ($1, $2, 'payment_status_changed', $3, $4)`,
        [tenant.id, order.id, `Platba přijata (${label})`, JSON.stringify({ provider, to: "paid", demo: true })]
      );
    } else {
      await client.query(
        `UPDATE orders SET payment_status = 'failed', updated_at = now() WHERE id = $1 AND payment_status = 'pending'`,
        [order.id]
      );
      await client.query(
        `INSERT INTO order_events (tenant_id, order_id, type, message, data)
         VALUES ($1, $2, 'payment_status_changed', $3, $4)`,
        [tenant.id, order.id, `Platba zrušena zákazníkem (${label})`, JSON.stringify({ provider, to: "failed", demo: true })]
      );
    }
  });

  // Modul sms-upozorneni: SMS o přijaté platbě
  if (action === "pay" && addons.has("sms-upozorneni")) {
    const shop = await getShopByTenantId(tenant.id);
    queueOrderStatusSms(tenant.id, order.id, "paid", shop?.name || "Obchod")
      .catch((e) => console.error("[payment/demo] sms failed:", e));
  }

  const redirect = `/demo/${tenantSlug}/obchod/objednavka/${encodeURIComponent(order_number)}?t=${token}`;
  return Response.json({ ok: true, redirect });
}
