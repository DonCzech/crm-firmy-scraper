import { query, queryOne } from "@/lib/db";
import { initCommerceDb } from "./schema";
import crypto from "crypto";

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === check;
}

export interface CustomerAuth {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  verified: boolean;
  created_at: string;
  last_login: string | null;
}

export async function registerCustomer(
  tenantId: number,
  data: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }
): Promise<{ customer: CustomerAuth; verify_token: string }> {
  await initCommerceDb();
  const existing = await queryOne<{ id: number; password_hash: string | null }>(
    `SELECT id, password_hash FROM customers WHERE tenant_id = $1 AND email = $2`,
    [tenantId, data.email.toLowerCase()]
  );

  const passwordHash = await hashPassword(data.password);
  const verifyToken = crypto.randomBytes(32).toString("hex");

  if (existing) {
    if (existing.password_hash) {
      throw new Error("Účet s tímto e-mailem již existuje");
    }
    const updated = await queryOne<CustomerAuth>(
      `UPDATE customers SET password_hash = $1, verify_token = $2, first_name = COALESCE($3, first_name),
       last_name = COALESCE($4, last_name), phone = COALESCE($5, phone), updated_at = now()
       WHERE id = $6 RETURNING id, email, first_name, last_name, phone, verified, created_at::text, last_login::text`,
      [passwordHash, verifyToken, data.first_name, data.last_name, data.phone, existing.id]
    );
    return { customer: updated!, verify_token: verifyToken };
  }

  const customer = await queryOne<CustomerAuth>(
    `INSERT INTO customers (tenant_id, email, password_hash, first_name, last_name, phone, verify_token, verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false)
     RETURNING id, email, first_name, last_name, phone, verified, created_at::text, last_login::text`,
    [tenantId, data.email.toLowerCase(), passwordHash, data.first_name ?? null, data.last_name ?? null, data.phone ?? null, verifyToken]
  );
  return { customer: customer!, verify_token: verifyToken };
}

export async function loginCustomer(
  tenantId: number,
  email: string,
  password: string
): Promise<CustomerAuth> {
  await initCommerceDb();
  const row = await queryOne<CustomerAuth & { password_hash: string }>(
    `SELECT id, email, first_name, last_name, phone, verified, password_hash, created_at::text, last_login::text
     FROM customers WHERE tenant_id = $1 AND email = $2`,
    [tenantId, email.toLowerCase()]
  );
  if (!row || !row.password_hash) throw new Error("Nesprávný e-mail nebo heslo");

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) throw new Error("Nesprávný e-mail nebo heslo");

  await query(`UPDATE customers SET last_login = now() WHERE id = $1`, [row.id]);

  const { password_hash: _, ...customer } = row;
  return customer;
}

export async function verifyEmail(tenantId: number, token: string): Promise<boolean> {
  await initCommerceDb();
  const result = await query<{ id: number }>(
    `UPDATE customers SET verified = true, verify_token = NULL, updated_at = now()
     WHERE tenant_id = $1 AND verify_token = $2 RETURNING id`,
    [tenantId, token]
  );
  return result.length > 0;
}

export async function requestPasswordReset(tenantId: number, email: string): Promise<string | null> {
  await initCommerceDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600_000).toISOString();
  const result = await query<{ id: number }>(
    `UPDATE customers SET reset_token = $1, reset_expires = $2, updated_at = now()
     WHERE tenant_id = $3 AND email = $4 AND password_hash IS NOT NULL RETURNING id`,
    [token, expires, tenantId, email.toLowerCase()]
  );
  return result.length > 0 ? token : null;
}

export async function resetPassword(tenantId: number, token: string, newPassword: string): Promise<boolean> {
  await initCommerceDb();
  const row = await queryOne<{ id: number }>(
    `SELECT id FROM customers WHERE tenant_id = $1 AND reset_token = $2 AND reset_expires > now()`,
    [tenantId, token]
  );
  if (!row) return false;

  const passwordHash = await hashPassword(newPassword);
  await query(
    `UPDATE customers SET password_hash = $1, reset_token = NULL, reset_expires = NULL, updated_at = now() WHERE id = $2`,
    [passwordHash, row.id]
  );
  return true;
}

export async function changePassword(tenantId: number, customerId: number, oldPassword: string, newPassword: string): Promise<boolean> {
  await initCommerceDb();
  const row = await queryOne<{ password_hash: string }>(
    `SELECT password_hash FROM customers WHERE id = $1 AND tenant_id = $2`,
    [customerId, tenantId]
  );
  if (!row?.password_hash) return false;

  const valid = await verifyPassword(oldPassword, row.password_hash);
  if (!valid) throw new Error("Stávající heslo je nesprávné");

  const passwordHash = await hashPassword(newPassword);
  await query(`UPDATE customers SET password_hash = $1, updated_at = now() WHERE id = $2`, [passwordHash, customerId]);
  return true;
}

export async function getCustomerProfile(tenantId: number, customerId: number) {
  await initCommerceDb();
  return queryOne<CustomerAuth & { order_count: number; total_spent_cents: number }>(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.phone, c.verified, c.created_at::text, c.last_login::text,
       COALESCE((SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id), 0)::int AS order_count,
       COALESCE((SELECT SUM(total_cents) FROM orders o WHERE o.customer_id = c.id AND o.payment_status = 'paid'), 0)::int AS total_spent_cents
     FROM customers c WHERE c.id = $1 AND c.tenant_id = $2`,
    [customerId, tenantId]
  );
}

export async function updateCustomerProfile(
  tenantId: number,
  customerId: number,
  data: { first_name?: string; last_name?: string; phone?: string }
): Promise<CustomerAuth | null> {
  await initCommerceDb();
  return queryOne<CustomerAuth>(
    `UPDATE customers SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
     phone = COALESCE($3, phone), updated_at = now()
     WHERE id = $4 AND tenant_id = $5
     RETURNING id, email, first_name, last_name, phone, verified, created_at::text, last_login::text`,
    [data.first_name, data.last_name, data.phone, customerId, tenantId]
  );
}

export async function getCustomerOrders(tenantId: number, customerId: number, page = 1, perPage = 20) {
  await initCommerceDb();
  const offset = (page - 1) * perPage;
  const items = await query<{
    id: number; order_number: string; status: string; payment_status: string;
    total_cents: number; currency: string; placed_at: string; item_count: number;
  }>(
    `SELECT o.id, o.order_number, o.status, o.payment_status, o.total_cents, o.currency, o.placed_at::text,
       (SELECT COALESCE(SUM(qty), 0) FROM order_items oi WHERE oi.order_id = o.id)::int AS item_count
     FROM orders o WHERE o.tenant_id = $1 AND o.customer_id = $2
     ORDER BY o.placed_at DESC LIMIT $3 OFFSET $4`,
    [tenantId, customerId, perPage, offset]
  );
  const countRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM orders WHERE tenant_id = $1 AND customer_id = $2`,
    [tenantId, customerId]
  );
  return { items: items ?? [], total: countRow?.count ?? 0 };
}

export async function getCustomerOrderDetail(tenantId: number, customerId: number, orderId: number) {
  await initCommerceDb();
  const order = await queryOne<Record<string, unknown>>(
    `SELECT o.id, o.order_number, o.status, o.payment_status, o.currency,
       o.subtotal_cents, o.discount_cents, o.shipping_cents, o.total_cents,
       o.shipping_address, o.billing_address, o.shipping_method, o.payment_method,
       o.customer_note, o.placed_at::text
     FROM orders o WHERE o.id = $1 AND o.tenant_id = $2 AND o.customer_id = $3`,
    [orderId, tenantId, customerId]
  );
  if (!order) return null;
  const items = await query(
    `SELECT oi.id, oi.title, oi.variant_title, oi.qty, oi.unit_price_cents, oi.total_cents,
       (SELECT url FROM product_images pi WHERE pi.product_id = oi.product_id ORDER BY position LIMIT 1) AS image_url,
       (SELECT slug FROM products p WHERE p.id = oi.product_id) AS product_slug
     FROM order_items oi WHERE oi.order_id = $1 AND oi.tenant_id = $2 ORDER BY oi.id`,
    [orderId, tenantId]
  );
  return { ...order, items: items ?? [] };
}

export async function getCustomerAddresses(tenantId: number, customerId: number) {
  await initCommerceDb();
  return query(
    `SELECT id, kind, name, street, city, zip, country, phone, is_default
     FROM customer_addresses WHERE tenant_id = $1 AND customer_id = $2 ORDER BY is_default DESC, id`,
    [tenantId, customerId]
  ) ?? [];
}

export async function saveCustomerAddress(
  tenantId: number,
  customerId: number,
  data: { id?: number; kind: string; name: string; street: string; city: string; zip: string; country?: string; phone?: string; is_default?: boolean }
) {
  await initCommerceDb();
  if (data.is_default) {
    await query(
      `UPDATE customer_addresses SET is_default = false WHERE tenant_id = $1 AND customer_id = $2 AND kind = $3`,
      [tenantId, customerId, data.kind]
    );
  }
  if (data.id) {
    return queryOne(
      `UPDATE customer_addresses SET name = $1, street = $2, city = $3, zip = $4, country = $5, phone = $6, is_default = $7
       WHERE id = $8 AND tenant_id = $9 AND customer_id = $10
       RETURNING *`,
      [data.name, data.street, data.city, data.zip, data.country ?? "CZ", data.phone ?? null, data.is_default ?? false, data.id, tenantId, customerId]
    );
  }
  return queryOne(
    `INSERT INTO customer_addresses (tenant_id, customer_id, kind, name, street, city, zip, country, phone, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [tenantId, customerId, data.kind, data.name, data.street, data.city, data.zip, data.country ?? "CZ", data.phone ?? null, data.is_default ?? false]
  );
}

export async function deleteCustomerAddress(tenantId: number, customerId: number, addressId: number) {
  await initCommerceDb();
  await query(`DELETE FROM customer_addresses WHERE id = $1 AND tenant_id = $2 AND customer_id = $3`, [addressId, tenantId, customerId]);
}

export function createSessionToken(customerId: number, tenantId: number): string {
  const payload = JSON.stringify({ cid: customerId, tid: tenantId, iat: Date.now() });
  const key = process.env.SESSION_SECRET || "webero-commerce-session-key-change-me";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", crypto.scryptSync(key, "salt", 32), iv);
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function parseSessionToken(token: string): { cid: number; tid: number; iat: number } | null {
  try {
    const key = process.env.SESSION_SECRET || "webero-commerce-session-key-change-me";
    const [ivHex, encrypted] = token.split(":");
    if (!ivHex || !encrypted) return null;
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", crypto.scryptSync(key, "salt", 32), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const data = JSON.parse(decrypted);
    if (Date.now() - data.iat > 30 * 86400_000) return null;
    return data;
  } catch {
    return null;
  }
}
