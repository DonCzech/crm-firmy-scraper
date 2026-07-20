import type { PoolClient } from "pg";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { initCommerceDb } from "./schema";
import { nextOrderNumberInTx } from "./shop";
import type {
  Order,
  OrderAddress,
  OrderDetail,
  OrderEvent,
  OrderItem,
  OrderStatus,
  PaymentStatus,
} from "./types";

// ── Status transitions ────────────────────────────────────────────────────────

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

// ── List / detail ─────────────────────────────────────────────────────────────

export interface ListOrdersParams {
  page?: number;
  perPage?: number;
  status?: OrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  search?: string; // order number or email
}

export async function listOrders(
  tenantId: number,
  params: ListOrdersParams = {}
): Promise<{ items: Array<Order & { item_count: number }>; total: number; page: number; perPage: number }> {
  await initCommerceDb();

  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 50));

  const where: string[] = ["o.tenant_id = $1"];
  const values: unknown[] = [tenantId];

  if (params.status && params.status !== "all") {
    values.push(params.status);
    where.push(`o.status = $${values.length}`);
  }
  if (params.paymentStatus && params.paymentStatus !== "all") {
    values.push(params.paymentStatus);
    where.push(`o.payment_status = $${values.length}`);
  }
  if (params.search) {
    values.push(`%${params.search}%`);
    where.push(`(o.order_number ILIKE $${values.length} OR o.email ILIKE $${values.length})`);
  }

  const totalRow = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM orders o WHERE ${where.join(" AND ")}`,
    values
  );
  const total = parseInt(totalRow[0]?.count ?? "0", 10);

  values.push(perPage, (page - 1) * perPage);
  const items = await query<Order & { item_count: number }>(
    `SELECT o.*, (SELECT COALESCE(SUM(oi.qty), 0)::int FROM order_items oi WHERE oi.order_id = o.id) AS item_count
     FROM orders o
     WHERE ${where.join(" AND ")}
     ORDER BY o.placed_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { items, total, page, perPage };
}

export async function getOrder(tenantId: number, orderId: number): Promise<OrderDetail | null> {
  await initCommerceDb();
  const order = await queryOne<Order>(
    "SELECT * FROM orders WHERE tenant_id = $1 AND id = $2",
    [tenantId, orderId]
  );
  if (!order) return null;

  const [items, events] = await Promise.all([
    query<OrderItem>(
      `SELECT oi.*, (
         SELECT pi.url FROM product_images pi
         WHERE pi.product_id = oi.product_id
         ORDER BY pi.position, pi.id LIMIT 1
       ) AS image_url
       FROM order_items oi
       WHERE oi.tenant_id = $1 AND oi.order_id = $2 ORDER BY oi.id`,
      [tenantId, orderId]
    ),
    query<OrderEvent>(
      "SELECT * FROM order_events WHERE tenant_id = $1 AND order_id = $2 ORDER BY created_at DESC, id DESC",
      [tenantId, orderId]
    ),
  ]);
  return { ...order, items, events };
}

// ── Create (Fáze 1: manual admin creation; checkout přijde ve Fázi 4) ─────────

export interface CreateOrderItemInput {
  variant_id: number;
  qty: number;
  /** Override unit price (haléře) — default is the variant's current price. */
  unit_price_cents?: number;
}

export interface CreateOrderInput {
  email: string;
  phone?: string;
  items: CreateOrderItemInput[];
  billing_address?: OrderAddress;
  shipping_address?: OrderAddress;
  shipping_method?: string;
  shipping_cents?: number;
  payment_method?: string;
  customer_note?: string;
  admin_note?: string;
  discount_cents?: number;
}

/** Included-VAT portion of an inclusive gross amount (Czech B2C default). */
function inclusiveTax(grossCents: number, ratePercent: number): number {
  if (ratePercent <= 0) return 0;
  return Math.round(grossCents - grossCents / (1 + ratePercent / 100));
}

export async function createOrder(
  tenantId: number,
  input: CreateOrderInput,
  actorEmail?: string
): Promise<OrderDetail> {
  await initCommerceDb();
  if (!input.items.length) throw new Error("Objednávka musí mít alespoň jednu položku");

  const orderId = await withTransaction(async (client: PoolClient) => {
    const shopRes = await client.query("SELECT * FROM shops WHERE tenant_id = $1 FOR UPDATE", [tenantId]);
    if (!shopRes.rows.length) throw new Error("Tenant nemá aktivovaný e-shop");
    const defaultTaxRate: number = shopRes.rows[0].default_tax_rate ?? 21;
    const currency: string = shopRes.rows[0].currency ?? "CZK";

    const orderNumber = await nextOrderNumberInTx(client, tenantId);

    // Snapshot line items + decrement stock under row locks.
    let subtotal = 0;
    let tax = 0;
    const lineItems: Array<{
      product_id: number | null; variant_id: number; title: string; variant_title: string | null;
      sku: string | null; qty: number; unit_price_cents: number; tax_rate: number; total_cents: number;
    }> = [];

    for (const item of input.items) {
      if (item.qty <= 0) throw new Error("Počet kusů musí být kladný");
      const vRes = await client.query(
        `SELECT pv.*, p.title AS product_title, p.tax_rate AS product_tax_rate, p.id AS pid
         FROM product_variants pv
         JOIN products p ON p.id = pv.product_id
         WHERE pv.tenant_id = $1 AND pv.id = $2
         FOR UPDATE OF pv`,
        [tenantId, item.variant_id]
      );
      if (!vRes.rows.length) throw new Error(`Varianta ${item.variant_id} neexistuje`);
      const v = vRes.rows[0];

      if (v.track_stock && v.stock_policy === "deny" && v.stock_qty < item.qty) {
        throw new Error(`Nedostatek skladu pro „${v.product_title}${v.title ? ` – ${v.title}` : ""}" (skladem ${v.stock_qty})`);
      }

      const unitPrice = item.unit_price_cents ?? v.price_cents;
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

      if (v.track_stock) {
        const upd = await client.query(
          `UPDATE product_variants SET stock_qty = stock_qty - $3, updated_at = now()
           WHERE tenant_id = $1 AND id = $2 RETURNING stock_qty`,
          [tenantId, v.id, item.qty]
        );
        await client.query(
          `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email, note)
           VALUES ($1, $2, $3, $4, 'order', $5, $6)`,
          [tenantId, v.id, -item.qty, upd.rows[0].stock_qty, actorEmail ?? null, orderNumber]
        );
      }
    }

    const shipping = input.shipping_cents ?? 0;
    const discount = input.discount_cents ?? 0;
    tax += inclusiveTax(shipping, defaultTaxRate);
    const total = Math.max(0, subtotal + shipping - discount);

    // Upsert customer record (lightweight CRM, no account yet).
    const customerRes = await client.query(
      `INSERT INTO customers (tenant_id, email, phone)
       VALUES ($1, $2, $3)
       ON CONFLICT (tenant_id, email) DO UPDATE SET
         phone = COALESCE(EXCLUDED.phone, customers.phone), updated_at = now()
       RETURNING id`,
      [tenantId, input.email.toLowerCase(), input.phone ?? null]
    );
    const customerId: number = customerRes.rows[0].id;

    const { randomBytes } = await import("crypto");
    const publicToken = randomBytes(16).toString("hex");

    const orderRes = await client.query(
      `INSERT INTO orders
         (tenant_id, order_number, customer_id, email, phone, status, payment_status,
          currency, subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
          billing_address, shipping_address, shipping_method, payment_method,
          customer_note, admin_note, public_token)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id`,
      [
        tenantId, orderNumber, customerId, input.email.toLowerCase(), input.phone ?? null,
        currency, subtotal, discount, shipping, tax, total,
        JSON.stringify(input.billing_address ?? {}),
        JSON.stringify(input.shipping_address ?? input.billing_address ?? {}),
        input.shipping_method ?? null, input.payment_method ?? null,
        input.customer_note ?? null, input.admin_note ?? null, publicToken,
      ]
    );
    const id: number = orderRes.rows[0].id;

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items
           (tenant_id, order_id, product_id, variant_id, title, variant_title, sku, qty,
            unit_price_cents, tax_rate, total_cents)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [tenantId, id, li.product_id, li.variant_id, li.title, li.variant_title, li.sku,
         li.qty, li.unit_price_cents, li.tax_rate, li.total_cents]
      );
    }

    await client.query(
      `INSERT INTO order_events (tenant_id, order_id, type, message, actor_email, data)
       VALUES ($1, $2, 'created', $3, $4, $5)`,
      [tenantId, id, `Objednávka ${orderNumber} vytvořena`, actorEmail ?? null,
       JSON.stringify({ total_cents: total, items: lineItems.length })]
    );

    return id;
  });

  await auditLog("commerce_order_created", {
    tenantId, actorEmail, targetType: "order", targetId: String(orderId),
  });

  const detail = await getOrder(tenantId, orderId);
  if (!detail) throw new Error("Order vanished after create");
  return detail;
}

// ── Status updates ────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  tenantId: number,
  orderId: number,
  updates: { status?: OrderStatus; payment_status?: PaymentStatus; admin_note?: string },
  actorEmail?: string
): Promise<OrderDetail | null> {
  await initCommerceDb();

  const ok = await withTransaction(async (client) => {
    const res = await client.query(
      "SELECT * FROM orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE",
      [tenantId, orderId]
    );
    if (!res.rows.length) return false;
    const order = res.rows[0] as Order;

    if (updates.status && updates.status !== order.status) {
      if (!canTransitionOrder(order.status, updates.status)) {
        throw new Error(`Přechod stavu ${order.status} → ${updates.status} není povolen`);
      }
      await client.query(
        "UPDATE orders SET status = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2",
        [tenantId, orderId, updates.status]
      );
      await client.query(
        `INSERT INTO order_events (tenant_id, order_id, type, message, actor_email, data)
         VALUES ($1, $2, 'status_changed', $3, $4, $5)`,
        [tenantId, orderId, `Stav změněn: ${order.status} → ${updates.status}`, actorEmail ?? null,
         JSON.stringify({ from: order.status, to: updates.status })]
      );

      // Cancelling returns tracked stock.
      if (updates.status === "cancelled") {
        const items = await client.query(
          "SELECT variant_id, qty FROM order_items WHERE tenant_id = $1 AND order_id = $2 AND variant_id IS NOT NULL",
          [tenantId, orderId]
        );
        for (const item of items.rows) {
          const upd = await client.query(
            `UPDATE product_variants SET stock_qty = stock_qty + $3, updated_at = now()
             WHERE tenant_id = $1 AND id = $2 AND track_stock = true
             RETURNING stock_qty`,
            [tenantId, item.variant_id, item.qty]
          );
          if (upd.rows.length) {
            await client.query(
              `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email, note)
               VALUES ($1, $2, $3, $4, 'return', $5, 'Storno objednávky')`,
              [tenantId, item.variant_id, item.qty, upd.rows[0].stock_qty, actorEmail ?? null]
            );
          }
        }
      }
    }

    if (updates.payment_status && updates.payment_status !== order.payment_status) {
      await client.query(
        "UPDATE orders SET payment_status = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2",
        [tenantId, orderId, updates.payment_status]
      );
      await client.query(
        `INSERT INTO order_events (tenant_id, order_id, type, message, actor_email, data)
         VALUES ($1, $2, 'payment_status_changed', $3, $4, $5)`,
        [tenantId, orderId, `Platba: ${order.payment_status} → ${updates.payment_status}`, actorEmail ?? null,
         JSON.stringify({ from: order.payment_status, to: updates.payment_status })]
      );
    }

    if (updates.admin_note !== undefined) {
      await client.query(
        "UPDATE orders SET admin_note = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2",
        [tenantId, orderId, updates.admin_note]
      );
    }

    return true;
  });

  if (!ok) return null;

  await auditLog("commerce_order_updated", {
    tenantId, actorEmail, targetType: "order", targetId: String(orderId),
    extra: updates as Record<string, unknown>,
  });

  return getOrder(tenantId, orderId);
}
