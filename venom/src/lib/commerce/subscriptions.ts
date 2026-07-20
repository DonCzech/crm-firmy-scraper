import type { PoolClient } from "pg";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { initCommerceDb } from "./schema";
import { nextOrderNumberInTx } from "./shop";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface SubscriptionItem {
  id: number;
  subscription_id: number;
  variant_id: number;
  qty: number;
  price_cents_override: number | null;
  // Joined fields
  variant_title?: string | null;
  product_title?: string;
  price_cents?: number;
  sku?: string | null;
}

export interface Subscription {
  id: number;
  tenant_id: number;
  customer_id: number;
  status: SubscriptionStatus;
  interval_days: number;
  next_order_at: string;
  shipping_address: Record<string, unknown> | null;
  shipping_method: string | null;
  payment_method: string | null;
  discount_percent: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionDetail extends Subscription {
  items: SubscriptionItem[];
}

export interface CreateSubscriptionItemInput {
  variant_id: number;
  qty: number;
  /** Override unit price (haléře/cents). Defaults to variant's current price. */
  price_cents_override?: number;
}

export interface CreateSubscriptionInput {
  customer_id: number;
  interval_days: number;
  items: CreateSubscriptionItemInput[];
  shipping_address: Record<string, unknown>;
  shipping_method: string;
  payment_method: string;
  discount_percent?: number;
  note?: string;
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createSubscription(
  tenantId: number,
  data: CreateSubscriptionInput,
): Promise<SubscriptionDetail> {
  await initCommerceDb();
  if (!data.items.length) throw new Error("Předplatné musí mít alespoň jednu položku");

  const subId = await withTransaction(async (client: PoolClient) => {
    // Verify all variants exist
    for (const item of data.items) {
      const vRes = await client.query(
        "SELECT id FROM product_variants WHERE tenant_id = $1 AND id = $2",
        [tenantId, item.variant_id],
      );
      if (!vRes.rows.length) throw new Error(`Varianta ${item.variant_id} neexistuje`);
    }

    const res = await client.query(
      `INSERT INTO commerce_subscriptions
         (tenant_id, customer_id, status, interval_days, next_order_at,
          shipping_address, shipping_method, payment_method, discount_percent, note)
       VALUES ($1, $2, 'active', $3, now() + make_interval(days => $3), $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        tenantId,
        data.customer_id,
        data.interval_days,
        JSON.stringify(data.shipping_address),
        data.shipping_method,
        data.payment_method,
        data.discount_percent ?? 0,
        data.note ?? null,
      ],
    );
    const id: number = res.rows[0].id;

    for (const item of data.items) {
      await client.query(
        `INSERT INTO commerce_subscription_items (subscription_id, variant_id, qty, price_cents_override)
         VALUES ($1, $2, $3, $4)`,
        [id, item.variant_id, item.qty, item.price_cents_override ?? null],
      );
    }

    return id;
  });

  await auditLog("commerce_subscription_created", {
    tenantId, targetType: "subscription", targetId: String(subId),
  });

  const detail = await getSubscription(tenantId, subId);
  if (!detail) throw new Error("Subscription vanished after create");
  return detail;
}

// ── Get detail ────────────────────────────────────────────────────────────────

export async function getSubscription(
  tenantId: number,
  subscriptionId: number,
): Promise<SubscriptionDetail | null> {
  await initCommerceDb();

  const sub = await queryOne<Subscription>(
    "SELECT * FROM commerce_subscriptions WHERE tenant_id = $1 AND id = $2",
    [tenantId, subscriptionId],
  );
  if (!sub) return null;

  const items = await query<SubscriptionItem>(
    `SELECT si.*, pv.title AS variant_title, pv.price_cents, pv.sku, p.title AS product_title
     FROM commerce_subscription_items si
     JOIN product_variants pv ON pv.id = si.variant_id
     JOIN products p ON p.id = pv.product_id
     WHERE si.subscription_id = $1
     ORDER BY si.id`,
    [subscriptionId],
  );

  return { ...sub, items };
}

// ── List (paginated) ──────────────────────────────────────────────────────────

export interface ListSubscriptionsParams {
  page?: number;
  perPage?: number;
  status?: SubscriptionStatus | "all";
  customer_id?: number;
}

export async function listSubscriptions(
  tenantId: number,
  params: ListSubscriptionsParams = {},
): Promise<{ items: Subscription[]; total: number; page: number; perPage: number }> {
  await initCommerceDb();

  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 50));

  const where: string[] = ["s.tenant_id = $1"];
  const values: unknown[] = [tenantId];

  if (params.status && params.status !== "all") {
    values.push(params.status);
    where.push(`s.status = $${values.length}`);
  }
  if (params.customer_id) {
    values.push(params.customer_id);
    where.push(`s.customer_id = $${values.length}`);
  }

  const whereClause = where.join(" AND ");

  const totalRow = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM commerce_subscriptions s WHERE ${whereClause}`,
    values,
  );
  const total = parseInt(totalRow[0]?.count ?? "0", 10);

  values.push(perPage, (page - 1) * perPage);
  const items = await query<Subscription>(
    `SELECT s.*
     FROM commerce_subscriptions s
     WHERE ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );

  return { items, total, page, perPage };
}

// ── Update ────────────────────────────────────────────────────────────────────

export interface UpdateSubscriptionInput {
  interval_days?: number;
  shipping_address?: Record<string, unknown>;
  shipping_method?: string;
  payment_method?: string;
  discount_percent?: number;
  note?: string;
}

export async function updateSubscription(
  tenantId: number,
  subscriptionId: number,
  data: UpdateSubscriptionInput,
): Promise<SubscriptionDetail | null> {
  await initCommerceDb();

  const sets: string[] = ["updated_at = now()"];
  const values: unknown[] = [tenantId, subscriptionId];

  if (data.interval_days !== undefined) {
    values.push(data.interval_days);
    sets.push(`interval_days = $${values.length}`);
  }
  if (data.shipping_address !== undefined) {
    values.push(JSON.stringify(data.shipping_address));
    sets.push(`shipping_address = $${values.length}`);
  }
  if (data.shipping_method !== undefined) {
    values.push(data.shipping_method);
    sets.push(`shipping_method = $${values.length}`);
  }
  if (data.payment_method !== undefined) {
    values.push(data.payment_method);
    sets.push(`payment_method = $${values.length}`);
  }
  if (data.discount_percent !== undefined) {
    values.push(data.discount_percent);
    sets.push(`discount_percent = $${values.length}`);
  }
  if (data.note !== undefined) {
    values.push(data.note);
    sets.push(`note = $${values.length}`);
  }

  await query(
    `UPDATE commerce_subscriptions SET ${sets.join(", ")} WHERE tenant_id = $1 AND id = $2`,
    values,
  );

  return getSubscription(tenantId, subscriptionId);
}

// ── Status transitions ────────────────────────────────────────────────────────

export async function pauseSubscription(
  tenantId: number,
  subscriptionId: number,
): Promise<SubscriptionDetail | null> {
  await initCommerceDb();
  await query(
    `UPDATE commerce_subscriptions SET status = 'paused', updated_at = now()
     WHERE tenant_id = $1 AND id = $2 AND status = 'active'`,
    [tenantId, subscriptionId],
  );
  return getSubscription(tenantId, subscriptionId);
}

export async function resumeSubscription(
  tenantId: number,
  subscriptionId: number,
): Promise<SubscriptionDetail | null> {
  await initCommerceDb();
  await query(
    `UPDATE commerce_subscriptions
     SET status = 'active',
         next_order_at = now() + make_interval(days => interval_days),
         updated_at = now()
     WHERE tenant_id = $1 AND id = $2 AND status = 'paused'`,
    [tenantId, subscriptionId],
  );
  return getSubscription(tenantId, subscriptionId);
}

export async function cancelSubscription(
  tenantId: number,
  subscriptionId: number,
): Promise<SubscriptionDetail | null> {
  await initCommerceDb();
  await query(
    `UPDATE commerce_subscriptions SET status = 'cancelled', updated_at = now()
     WHERE tenant_id = $1 AND id = $2 AND status != 'cancelled'`,
    [tenantId, subscriptionId],
  );
  return getSubscription(tenantId, subscriptionId);
}

// ── Item management ───────────────────────────────────────────────────────────

export async function addItem(
  tenantId: number,
  subscriptionId: number,
  variantId: number,
  qty: number,
  priceOverride?: number,
): Promise<SubscriptionDetail | null> {
  await initCommerceDb();

  // Verify subscription belongs to tenant
  const sub = await queryOne<Subscription>(
    "SELECT id FROM commerce_subscriptions WHERE tenant_id = $1 AND id = $2",
    [tenantId, subscriptionId],
  );
  if (!sub) return null;

  // Verify variant exists
  const variant = await queryOne<{ id: number }>(
    "SELECT id FROM product_variants WHERE tenant_id = $1 AND id = $2",
    [tenantId, variantId],
  );
  if (!variant) throw new Error(`Varianta ${variantId} neexistuje`);

  await query(
    `INSERT INTO commerce_subscription_items (subscription_id, variant_id, qty, price_cents_override)
     VALUES ($1, $2, $3, $4)`,
    [subscriptionId, variantId, qty, priceOverride ?? null],
  );

  return getSubscription(tenantId, subscriptionId);
}

export async function removeItem(
  tenantId: number,
  subscriptionId: number,
  itemId: number,
): Promise<SubscriptionDetail | null> {
  await initCommerceDb();

  // Verify subscription belongs to tenant
  const sub = await queryOne<Subscription>(
    "SELECT id FROM commerce_subscriptions WHERE tenant_id = $1 AND id = $2",
    [tenantId, subscriptionId],
  );
  if (!sub) return null;

  await query(
    "DELETE FROM commerce_subscription_items WHERE id = $1 AND subscription_id = $2",
    [itemId, subscriptionId],
  );

  return getSubscription(tenantId, subscriptionId);
}

// ── Due subscriptions & processing ────────────────────────────────────────────

export async function getDueSubscriptions(
  tenantId: number,
): Promise<SubscriptionDetail[]> {
  await initCommerceDb();

  const subs = await query<Subscription>(
    `SELECT * FROM commerce_subscriptions
     WHERE tenant_id = $1 AND status = 'active' AND next_order_at <= now()
     ORDER BY next_order_at`,
    [tenantId],
  );

  const results: SubscriptionDetail[] = [];
  for (const sub of subs) {
    const detail = await getSubscription(tenantId, sub.id);
    if (detail) results.push(detail);
  }
  return results;
}

/** Included-VAT portion of an inclusive gross amount (Czech B2C default). */
function inclusiveTax(grossCents: number, ratePercent: number): number {
  if (ratePercent <= 0) return 0;
  return Math.round(grossCents - grossCents / (1 + ratePercent / 100));
}

/**
 * Creates a new order from the subscription's current items and advances
 * next_order_at by interval_days.
 */
export async function processSubscription(
  tenantId: number,
  subscriptionId: number,
): Promise<number> {
  await initCommerceDb();

  const sub = await getSubscription(tenantId, subscriptionId);
  if (!sub) throw new Error("Předplatné nenalezeno");
  if (sub.status !== "active") throw new Error("Předplatné není aktivní");
  if (!sub.items.length) throw new Error("Předplatné nemá žádné položky");

  const orderId = await withTransaction(async (client: PoolClient) => {
    const shopRes = await client.query(
      "SELECT * FROM shops WHERE tenant_id = $1 FOR UPDATE",
      [tenantId],
    );
    if (!shopRes.rows.length) throw new Error("Tenant nemá aktivovaný e-shop");
    const defaultTaxRate: number = shopRes.rows[0].default_tax_rate ?? 21;
    const currency: string = shopRes.rows[0].currency ?? "CZK";

    const orderNumber = await nextOrderNumberInTx(client, tenantId);

    // Snapshot line items
    let subtotal = 0;
    let tax = 0;
    const lineItems: Array<{
      product_id: number | null;
      variant_id: number;
      title: string;
      variant_title: string | null;
      sku: string | null;
      qty: number;
      unit_price_cents: number;
      tax_rate: number;
      total_cents: number;
    }> = [];

    for (const item of sub.items) {
      const vRes = await client.query(
        `SELECT pv.*, p.title AS product_title, p.tax_rate AS product_tax_rate, p.id AS pid
         FROM product_variants pv
         JOIN products p ON p.id = pv.product_id
         WHERE pv.tenant_id = $1 AND pv.id = $2
         FOR UPDATE OF pv`,
        [tenantId, item.variant_id],
      );
      if (!vRes.rows.length) throw new Error(`Varianta ${item.variant_id} neexistuje`);
      const v = vRes.rows[0];

      // Use override price if set, otherwise current variant price
      const unitPrice = item.price_cents_override ?? v.price_cents;
      const rate = v.product_tax_rate ?? defaultTaxRate;
      const lineTotal = unitPrice * item.qty;
      subtotal += lineTotal;
      tax += inclusiveTax(lineTotal, rate);

      lineItems.push({
        product_id: v.pid,
        variant_id: v.id,
        title: v.product_title,
        variant_title: v.title,
        sku: v.sku,
        qty: item.qty,
        unit_price_cents: unitPrice,
        tax_rate: rate,
        total_cents: lineTotal,
      });

      // Decrement stock if tracked
      if (v.track_stock) {
        if (v.stock_policy === "deny" && v.stock_qty < item.qty) {
          throw new Error(
            `Nedostatek skladu pro „${v.product_title}${v.title ? ` – ${v.title}` : ""}" (skladem ${v.stock_qty})`,
          );
        }
        const upd = await client.query(
          `UPDATE product_variants SET stock_qty = stock_qty - $3, updated_at = now()
           WHERE tenant_id = $1 AND id = $2 RETURNING stock_qty`,
          [tenantId, v.id, item.qty],
        );
        await client.query(
          `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
           VALUES ($1, $2, $3, $4, 'subscription', $5)`,
          [tenantId, v.id, -item.qty, upd.rows[0].stock_qty, `Předplatné #${subscriptionId}`],
        );
      }
    }

    // Apply subscription discount
    const discountCents = sub.discount_percent > 0
      ? Math.round(subtotal * sub.discount_percent / 100)
      : 0;
    const total = Math.max(0, subtotal - discountCents);

    // Get customer email for the order
    const custRes = await client.query(
      "SELECT email, phone FROM customers WHERE id = $1 AND tenant_id = $2",
      [sub.customer_id, tenantId],
    );
    if (!custRes.rows.length) throw new Error("Zákazník nenalezen");
    const customer = custRes.rows[0];

    const { randomBytes } = await import("crypto");
    const publicToken = randomBytes(16).toString("hex");

    const orderRes = await client.query(
      `INSERT INTO orders
         (tenant_id, order_number, customer_id, email, phone, status, payment_status,
          currency, subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
          shipping_address, shipping_method, payment_method,
          admin_note, public_token)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', $6, $7, $8, 0, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
      [
        tenantId, orderNumber, sub.customer_id, customer.email, customer.phone ?? null,
        currency, subtotal, discountCents, tax, total,
        JSON.stringify(sub.shipping_address ?? {}),
        sub.shipping_method, sub.payment_method,
        `Automatická objednávka z předplatného #${subscriptionId}`,
        publicToken,
      ],
    );
    const id: number = orderRes.rows[0].id;

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items
           (tenant_id, order_id, product_id, variant_id, title, variant_title, sku, qty,
            unit_price_cents, tax_rate, total_cents)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          tenantId, id, li.product_id, li.variant_id, li.title, li.variant_title, li.sku,
          li.qty, li.unit_price_cents, li.tax_rate, li.total_cents,
        ],
      );
    }

    await client.query(
      `INSERT INTO order_events (tenant_id, order_id, type, message, data)
       VALUES ($1, $2, 'created', $3, $4)`,
      [
        tenantId, id,
        `Objednávka ${orderNumber} vytvořena z předplatného #${subscriptionId}`,
        JSON.stringify({ subscription_id: subscriptionId, total_cents: total, items: lineItems.length }),
      ],
    );

    // Advance next_order_at
    await client.query(
      `UPDATE commerce_subscriptions
       SET next_order_at = now() + make_interval(days => interval_days),
           updated_at = now()
       WHERE id = $1`,
      [subscriptionId],
    );

    return id;
  });

  await auditLog("commerce_subscription_order_created", {
    tenantId, targetType: "order", targetId: String(orderId),
    extra: { subscription_id: subscriptionId },
  });

  return orderId;
}

// ── Customer subscriptions ────────────────────────────────────────────────────

export async function getCustomerSubscriptions(
  tenantId: number,
  customerId: number,
): Promise<SubscriptionDetail[]> {
  await initCommerceDb();

  const subs = await query<Subscription>(
    `SELECT * FROM commerce_subscriptions
     WHERE tenant_id = $1 AND customer_id = $2
     ORDER BY created_at DESC`,
    [tenantId, customerId],
  );

  const results: SubscriptionDetail[] = [];
  for (const sub of subs) {
    const detail = await getSubscription(tenantId, sub.id);
    if (detail) results.push(detail);
  }
  return results;
}
