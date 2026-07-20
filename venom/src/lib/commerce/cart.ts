import { randomBytes } from "crypto";
import { query, queryOne, withTransaction } from "@/lib/db";
import { initCommerceDb } from "./schema";

/**
 * Webero Commerce — persistentní košík (Fáze 4).
 * Identifikace přes httpOnly cookie token (webero_cart_{slug}), žádný účet.
 * Ceny se počítají vždy z aktuálních variant — košík drží jen variant_id + qty.
 */

export interface CartItemView {
  id: number;
  variant_id: number;
  qty: number;
  product_id: number;
  product_slug: string;
  product_title: string;
  variant_title: string | null;
  sku: string | null;
  price_cents: number;
  line_total_cents: number;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  image_url: string | null;
  product_status: string;
}

export interface CartView {
  token: string;
  items: CartItemView[];
  item_count: number;
  subtotal_cents: number;
  currency: string;
}

export function newCartToken(): string {
  return randomBytes(20).toString("hex");
}

async function fetchCartId(tenantId: number, token: string): Promise<number | null> {
  const row = await queryOne<{ id: number }>(
    "SELECT id FROM carts WHERE tenant_id = $1 AND token = $2 AND status = 'open'",
    [tenantId, token]
  );
  return row?.id ?? null;
}

export async function getCartView(tenantId: number, token: string | null, currency: string): Promise<CartView> {
  await initCommerceDb();
  const empty: CartView = { token: token ?? "", items: [], item_count: 0, subtotal_cents: 0, currency };
  if (!token) return empty;

  const cartId = await fetchCartId(tenantId, token);
  if (!cartId) return empty;

  const items = await query<CartItemView>(
    `SELECT ci.id, ci.variant_id, ci.qty,
            p.id AS product_id, p.slug AS product_slug, p.title AS product_title, p.status AS product_status,
            pv.title AS variant_title, pv.sku, pv.price_cents,
            (pv.price_cents * ci.qty) AS line_total_cents,
            pv.stock_qty, pv.track_stock, pv.stock_policy,
            img.url AS image_url
       FROM cart_items ci
       JOIN product_variants pv ON pv.id = ci.variant_id
       JOIN products p ON p.id = pv.product_id
       LEFT JOIN LATERAL (
         SELECT pi.url FROM product_images pi
         WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1
       ) img ON true
      WHERE ci.tenant_id = $1 AND ci.cart_id = $2
      ORDER BY ci.id`,
    [tenantId, cartId]
  );

  // Produkty stažené z prodeje v košíku nenabízíme
  const valid = items.filter((i) => i.product_status === "active");
  return {
    token,
    items: valid,
    item_count: valid.reduce((sum, i) => sum + i.qty, 0),
    subtotal_cents: valid.reduce((sum, i) => sum + i.line_total_cents, 0),
    currency,
  };
}

/** Přidá položku (nebo navýší qty). Vrací token košíku (nový, pokud nebyl). */
export async function addCartItem(
  tenantId: number,
  token: string | null,
  variantId: number,
  qty: number
): Promise<{ token: string } | { error: string }> {
  await initCommerceDb();
  if (qty < 1 || qty > 999) return { error: "Neplatný počet kusů" };

  return withTransaction(async (client) => {
    // Varianta musí existovat, patřit tenantovi a být z aktivního produktu
    const v = await client.query(
      `SELECT pv.id, pv.stock_qty, pv.track_stock, pv.stock_policy, p.title
       FROM product_variants pv JOIN products p ON p.id = pv.product_id
       WHERE pv.tenant_id = $1 AND pv.id = $2 AND p.status = 'active'`,
      [tenantId, variantId]
    );
    if (!v.rows.length) return { error: "Produkt není dostupný" };

    let cartToken = token;
    let cartId: number | null = null;
    if (cartToken) {
      const c = await client.query(
        "SELECT id FROM carts WHERE tenant_id = $1 AND token = $2 AND status = 'open'",
        [tenantId, cartToken]
      );
      cartId = c.rows[0]?.id ?? null;
    }
    if (!cartId) {
      cartToken = newCartToken();
      const c = await client.query(
        "INSERT INTO carts (tenant_id, token) VALUES ($1, $2) RETURNING id",
        [tenantId, cartToken]
      );
      cartId = c.rows[0].id;
    }

    const existing = await client.query(
      "SELECT id, qty FROM cart_items WHERE tenant_id = $1 AND cart_id = $2 AND variant_id = $3",
      [tenantId, cartId, variantId]
    );
    const newQty = (existing.rows[0]?.qty ?? 0) + qty;

    const variant = v.rows[0];
    if (variant.track_stock && variant.stock_policy === "deny" && newQty > variant.stock_qty) {
      return { error: `Skladem je pouze ${variant.stock_qty} ks` };
    }

    if (existing.rows.length) {
      await client.query(
        "UPDATE cart_items SET qty = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2",
        [tenantId, existing.rows[0].id, newQty]
      );
    } else {
      await client.query(
        "INSERT INTO cart_items (tenant_id, cart_id, variant_id, qty) VALUES ($1, $2, $3, $4)",
        [tenantId, cartId, variantId, qty]
      );
    }
    await client.query("UPDATE carts SET updated_at = now() WHERE id = $1", [cartId]);
    return { token: cartToken! };
  });
}

/** Nastaví qty položky; 0 = odebrat. */
export async function setCartItemQty(
  tenantId: number,
  token: string,
  itemId: number,
  qty: number
): Promise<{ ok: true } | { error: string }> {
  await initCommerceDb();
  if (qty < 0 || qty > 999) return { error: "Neplatný počet kusů" };

  const cartId = await fetchCartId(tenantId, token);
  if (!cartId) return { error: "Košík nenalezen" };

  if (qty === 0) {
    await query("DELETE FROM cart_items WHERE tenant_id = $1 AND cart_id = $2 AND id = $3", [tenantId, cartId, itemId]);
    return { ok: true };
  }

  const item = await queryOne<{ variant_id: number }>(
    "SELECT variant_id FROM cart_items WHERE tenant_id = $1 AND cart_id = $2 AND id = $3",
    [tenantId, cartId, itemId]
  );
  if (!item) return { error: "Položka nenalezena" };

  const variant = await queryOne<{ stock_qty: number; track_stock: boolean; stock_policy: string }>(
    "SELECT stock_qty, track_stock, stock_policy FROM product_variants WHERE tenant_id = $1 AND id = $2",
    [tenantId, item.variant_id]
  );
  if (variant?.track_stock && variant.stock_policy === "deny" && qty > variant.stock_qty) {
    return { error: `Skladem je pouze ${variant.stock_qty} ks` };
  }

  await query(
    "UPDATE cart_items SET qty = $4, updated_at = now() WHERE tenant_id = $1 AND cart_id = $2 AND id = $3",
    [tenantId, cartId, itemId, qty]
  );
  return { ok: true };
}

/** Po vytvoření objednávky — košík označit jako converted (uvnitř tx checkoutu). */
export async function convertCartInTx(
  client: { query: (sql: string, params: unknown[]) => Promise<unknown> },
  tenantId: number,
  token: string,
  orderId: number
): Promise<void> {
  await client.query(
    "UPDATE carts SET status = 'converted', order_id = $3, updated_at = now() WHERE tenant_id = $1 AND token = $2",
    [tenantId, token, orderId]
  );
}
