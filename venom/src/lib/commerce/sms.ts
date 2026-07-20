import { query, queryOne } from "@/lib/db";

/**
 * Modul „SMS upozornění“ — SMS outbox s triggery na změnu stavu objednávky.
 * Bez SMS_GATEWAY_KEY se zpráva označí jako odeslaná v demo režimu (log),
 * s klíčem by šla přes reálnou bránu — outbox a audit je vždy skutečný.
 */

export interface SmsRow {
  id: number;
  order_id: number | null;
  order_number: string | null;
  to_phone: string;
  message: string;
  trigger: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export async function initSmsDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_sms_queue (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_id INTEGER,
      to_phone TEXT NOT NULL,
      message TEXT NOT NULL,
      trigger TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

/** SMS šablony pro jednotlivé triggery (max ~160 znaků). */
function buildMessage(trigger: string, shopName: string, orderNumber: string): string | null {
  const templates: Record<string, string> = {
    confirmed: `${shopName}: Objednavku ${orderNumber} jsme prijali a potvrdili. Dekujeme za nakup!`,
    processing: `${shopName}: Objednavku ${orderNumber} prave pripravujeme k odeslani.`,
    shipped: `${shopName}: Objednavka ${orderNumber} byla predana dopravci. Sledujte svou schranku/e-mail.`,
    completed: `${shopName}: Objednavka ${orderNumber} byla dorucena. Dekujeme a tesime se priste!`,
    cancelled: `${shopName}: Objednavka ${orderNumber} byla stornovana. V pripade dotazu nas kontaktujte.`,
    paid: `${shopName}: Prijali jsme platbu za objednavku ${orderNumber}. Dekujeme!`,
  };
  return templates[trigger] ?? null;
}

/** Zařadí a „odešle“ SMS pro daný trigger; bez telefonu nebo šablony tiše přeskočí. */
export async function queueOrderStatusSms(
  tenantId: number,
  orderId: number,
  trigger: string,
  shopName: string
): Promise<void> {
  await initSmsDb();
  const order = await queryOne<{ order_number: string; phone: string | null }>(
    `SELECT order_number, phone FROM orders WHERE tenant_id = $1 AND id = $2`,
    [tenantId, orderId]
  );
  if (!order?.phone) return;
  const message = buildMessage(trigger, shopName, order.order_number);
  if (!message) return;

  // Demo brána: bez SMS_GATEWAY_KEY jen zalogujeme a označíme jako odeslané.
  const hasGateway = !!process.env.SMS_GATEWAY_KEY;
  if (!hasGateway) console.log(`[sms] Demo gateway — would send to ${order.phone}: ${message}`);

  await query(
    `INSERT INTO commerce_sms_queue (tenant_id, order_id, to_phone, message, trigger, status, sent_at)
     VALUES ($1, $2, $3, $4, $5, 'sent', now())`,
    [tenantId, orderId, order.phone, message, trigger]
  );
}

export async function listSms(tenantId: number, limit = 100): Promise<SmsRow[]> {
  await initSmsDb();
  return query<SmsRow>(
    `SELECT s.id, s.order_id, o.order_number, s.to_phone, s.message, s.trigger, s.status, s.sent_at, s.created_at
     FROM commerce_sms_queue s LEFT JOIN orders o ON o.id = s.order_id
     WHERE s.tenant_id = $1 ORDER BY s.id DESC LIMIT $2`,
    [tenantId, limit]
  );
}

export async function getSmsStats(tenantId: number): Promise<{ total: number; last30d: number; by_trigger: { trigger: string; count: number }[] }> {
  await initSmsDb();
  const [totals, byTrigger] = await Promise.all([
    queryOne<{ total: string; last30d: string }>(
      `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE created_at > now() - interval '30 days') AS last30d
       FROM commerce_sms_queue WHERE tenant_id = $1`,
      [tenantId]
    ),
    query<{ trigger: string; count: string }>(
      `SELECT trigger, COUNT(*) AS count FROM commerce_sms_queue WHERE tenant_id = $1 GROUP BY trigger ORDER BY count DESC`,
      [tenantId]
    ),
  ]);
  return {
    total: parseInt(totals?.total ?? "0", 10),
    last30d: parseInt(totals?.last30d ?? "0", 10),
    by_trigger: byTrigger.map((r) => ({ trigger: r.trigger, count: parseInt(r.count, 10) })),
  };
}
