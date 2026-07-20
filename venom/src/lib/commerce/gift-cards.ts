import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface GiftCardRow {
  id: number;
  code: string;
  initial_cents: number;
  balance_cents: number;
  currency: string;
  purchaser_email: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface GiftCardTransactionRow {
  id: number;
  gift_card_id: number;
  order_id: number | null;
  amount_cents: number;
  balance_after_cents: number;
  note: string | null;
  created_at: string;
}

export interface CreateGiftCardInput {
  amount_cents: number;
  currency?: string;
  purchaser_email?: string;
  recipient_email?: string;
  recipient_name?: string;
  message?: string;
  expires_at?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

export function generateGiftCardCode(): string {
  const raw = Array.from({ length: 16 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

/* ------------------------------------------------------------------ */
/*  CRUD                                                              */
/* ------------------------------------------------------------------ */

export async function createGiftCard(
  tenantId: number,
  data: CreateGiftCardInput
): Promise<GiftCardRow> {
  await initCommerceDb();
  const code = generateGiftCardCode();
  const rows = await query<GiftCardRow>(
    `INSERT INTO commerce_gift_cards
       (tenant_id, code, initial_cents, balance_cents, currency,
        purchaser_email, recipient_email, recipient_name, message, is_active, expires_at)
     VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, true, $9)
     RETURNING id, code, initial_cents, balance_cents, currency,
               purchaser_email, recipient_email, recipient_name, message,
               is_active, expires_at, created_at`,
    [
      tenantId,
      code,
      data.amount_cents,
      data.currency ?? "CZK",
      data.purchaser_email ?? null,
      data.recipient_email ?? null,
      data.recipient_name ?? null,
      data.message ?? null,
      data.expires_at ?? null,
    ]
  );
  return rows[0];
}

export async function getGiftCard(
  tenantId: number,
  code: string
): Promise<GiftCardRow | null> {
  await initCommerceDb();
  const rows = await query<GiftCardRow>(
    `SELECT id, code, initial_cents, balance_cents, currency,
            purchaser_email, recipient_email, recipient_name, message,
            is_active, expires_at, created_at
     FROM commerce_gift_cards
     WHERE tenant_id = $1 AND code = $2`,
    [tenantId, code.toUpperCase().trim()]
  );
  return rows[0] ?? null;
}

export async function listGiftCards(
  tenantId: number,
  opts?: { page?: number; perPage?: number; is_active?: boolean }
): Promise<{ items: (GiftCardRow & { transaction_count: number })[]; total: number }> {
  await initCommerceDb();
  const page = opts?.page ?? 1;
  const perPage = opts?.perPage ?? 20;
  const offset = (page - 1) * perPage;

  const conditions = ["g.tenant_id = $1"];
  const vals: unknown[] = [tenantId];
  let i = 2;

  if (opts?.is_active !== undefined) {
    conditions.push(`g.is_active = $${i++}`);
    vals.push(opts.is_active);
  }

  const where = conditions.join(" AND ");

  const countRows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM commerce_gift_cards g WHERE ${where}`,
    vals
  );
  const total = parseInt(countRows[0]?.count ?? "0", 10);

  const listVals = [...vals, perPage, offset];
  const rows = await query<GiftCardRow & { transaction_count: number }>(
    `SELECT g.id, g.code, g.initial_cents, g.balance_cents, g.currency,
            g.purchaser_email, g.recipient_email, g.recipient_name, g.message,
            g.is_active, g.expires_at, g.created_at,
            COALESCE(t.cnt, 0)::int AS transaction_count
     FROM commerce_gift_cards g
     LEFT JOIN (
       SELECT gift_card_id, COUNT(*) AS cnt
       FROM commerce_gift_card_transactions GROUP BY gift_card_id
     ) t ON t.gift_card_id = g.id
     WHERE ${where}
     ORDER BY g.created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
    listVals
  );

  return { items: rows, total };
}

/* ------------------------------------------------------------------ */
/*  Redeem / Refund                                                   */
/* ------------------------------------------------------------------ */

export async function redeemGiftCard(
  tenantId: number,
  code: string,
  amount_cents: number,
  orderId?: number
): Promise<{ balance_cents: number }> {
  await initCommerceDb();

  const card = await getGiftCard(tenantId, code);
  if (!card) throw new Error("Gift card not found");
  if (!card.is_active) throw new Error("Gift card is inactive");
  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    throw new Error("Gift card has expired");
  }
  if (card.balance_cents < amount_cents) {
    throw new Error("Insufficient gift card balance");
  }

  const newBalance = card.balance_cents - amount_cents;

  await query(
    `UPDATE commerce_gift_cards SET balance_cents = $1 WHERE id = $2 AND tenant_id = $3`,
    [newBalance, card.id, tenantId]
  );

  await query(
    `INSERT INTO commerce_gift_card_transactions
       (gift_card_id, order_id, amount_cents, balance_after_cents, note)
     VALUES ($1, $2, $3, $4, $5)`,
    [card.id, orderId ?? null, -amount_cents, newBalance, "Redemption"]
  );

  return { balance_cents: newBalance };
}

export async function refundGiftCard(
  tenantId: number,
  code: string,
  amount_cents: number,
  orderId?: number
): Promise<{ balance_cents: number }> {
  await initCommerceDb();

  const card = await getGiftCard(tenantId, code);
  if (!card) throw new Error("Gift card not found");

  const newBalance = card.balance_cents + amount_cents;

  await query(
    `UPDATE commerce_gift_cards SET balance_cents = $1 WHERE id = $2 AND tenant_id = $3`,
    [newBalance, card.id, tenantId]
  );

  await query(
    `INSERT INTO commerce_gift_card_transactions
       (gift_card_id, order_id, amount_cents, balance_after_cents, note)
     VALUES ($1, $2, $3, $4, $5)`,
    [card.id, orderId ?? null, amount_cents, newBalance, "Refund"]
  );

  return { balance_cents: newBalance };
}

/* ------------------------------------------------------------------ */
/*  Admin                                                             */
/* ------------------------------------------------------------------ */

export async function deactivateGiftCard(
  tenantId: number,
  cardId: number
): Promise<boolean> {
  await initCommerceDb();
  const rows = await query(
    `UPDATE commerce_gift_cards SET is_active = false
     WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    [tenantId, cardId]
  );
  return rows.length > 0;
}

export async function getGiftCardTransactions(
  tenantId: number,
  cardId: number
): Promise<GiftCardTransactionRow[]> {
  await initCommerceDb();
  return query<GiftCardTransactionRow>(
    `SELECT t.id, t.gift_card_id, t.order_id, t.amount_cents,
            t.balance_after_cents, t.note, t.created_at
     FROM commerce_gift_card_transactions t
     JOIN commerce_gift_cards g ON g.id = t.gift_card_id
     WHERE g.tenant_id = $1 AND t.gift_card_id = $2
     ORDER BY t.created_at DESC`,
    [tenantId, cardId]
  );
}
