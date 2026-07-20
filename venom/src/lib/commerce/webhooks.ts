import crypto from "crypto";
import { query, queryOne } from "@/lib/db";

// ── Types ─────────────────────────────────────────────────────────────────────

export type WebhookEvent =
  | "order.created"
  | "order.paid"
  | "order.shipped"
  | "order.completed"
  | "order.cancelled"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "stock.low"
  | "customer.created"
  | "subscription.renewed";

export interface Webhook {
  id: number;
  tenant_id: number;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  last_triggered_at: string | null;
  last_status: number | null;
  fail_count: number;
  created_at: string;
}

export interface WebhookLog {
  id: number;
  webhook_id: number;
  event: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  duration_ms: number | null;
  created_at: string;
}

interface CreateWebhookData {
  url: string;
  events: string[];
  secret?: string;
}

interface UpdateWebhookData {
  url?: string;
  events?: string[];
  secret?: string;
  is_active?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WEBHOOK_TIMEOUT_MS = 10_000;
const MAX_FAIL_COUNT = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateSecret(): string {
  return crypto.randomBytes(16).toString("hex"); // 32-char hex
}

function signPayload(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/** List all webhooks for a tenant */
export async function listWebhooks(tenantId: number): Promise<Webhook[]> {
  return await query<Webhook>(
    `SELECT * FROM commerce_webhooks WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId],
  );
}

/** Create a new webhook */
export async function createWebhook(
  tenantId: number,
  data: CreateWebhookData,
): Promise<Webhook> {
  const secret = data.secret || generateSecret();
  const row = await queryOne<Webhook>(
    `INSERT INTO commerce_webhooks (tenant_id, url, events, secret, is_active)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [tenantId, data.url, data.events, secret],
  );
  return row!;
}

/** Update a webhook (partial) */
export async function updateWebhook(
  tenantId: number,
  webhookId: number,
  data: UpdateWebhookData,
): Promise<Webhook | null> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (data.url !== undefined) {
    sets.push(`url = $${idx++}`);
    vals.push(data.url);
  }
  if (data.events !== undefined) {
    sets.push(`events = $${idx++}`);
    vals.push(data.events);
  }
  if (data.secret !== undefined) {
    sets.push(`secret = $${idx++}`);
    vals.push(data.secret);
  }
  if (data.is_active !== undefined) {
    sets.push(`is_active = $${idx++}`);
    vals.push(data.is_active);
    // Reset fail_count when re-activating
    if (data.is_active) {
      sets.push(`fail_count = 0`);
    }
  }

  if (sets.length === 0) return null;

  vals.push(webhookId, tenantId);
  const row = await queryOne<Webhook>(
    `UPDATE commerce_webhooks SET ${sets.join(", ")}
     WHERE id = $${idx++} AND tenant_id = $${idx}
     RETURNING *`,
    vals,
  );
  return row ?? null;
}

/** Delete a webhook */
export async function deleteWebhook(
  tenantId: number,
  webhookId: number,
): Promise<boolean> {
  const result = await query<{ id: number }>(
    `DELETE FROM commerce_webhooks WHERE id = $1 AND tenant_id = $2 RETURNING id`,
    [webhookId, tenantId],
  );
  return result.length > 0;
}

// ── Fire webhooks ─────────────────────────────────────────────────────────────

/** Fire webhooks for a given event. Non-blocking, never throws. */
export async function fireWebhooks(
  tenantId: number,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const webhooks = await query<Webhook>(
      `SELECT * FROM commerce_webhooks
       WHERE tenant_id = $1 AND is_active = true AND $2 = ANY(events)`,
      [tenantId, event],
    );

    if (webhooks.length === 0) return;

    // Fire all in parallel, each independently handled
    await Promise.allSettled(
      webhooks.map((wh: Webhook) => deliverWebhook(wh, event, payload)),
    );
  } catch {
    // Webhook failures must never break the main flow
    console.error(`[webhooks] Failed to fire event "${event}" for tenant ${tenantId}`);
  }
}

async function deliverWebhook(
  webhook: Webhook,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const body = JSON.stringify({
    event,
    payload,
    timestamp: new Date().toISOString(),
    webhook_id: webhook.id,
  });

  const signature = signPayload(body, webhook.secret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  const start = Date.now();
  let responseStatus: number | null = null;
  let responseBody: string | null = null;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webero-Event": event,
        "X-Webero-Signature": signature,
      },
      body,
      signal: controller.signal,
    });

    responseStatus = res.status;
    responseBody = await res.text().catch(() => null);

    const isSuccess = res.ok; // 2xx

    // Update webhook state
    if (isSuccess) {
      await query(
        `UPDATE commerce_webhooks
         SET last_triggered_at = NOW(), last_status = $1, fail_count = 0
         WHERE id = $2`,
        [responseStatus, webhook.id],
      );
    } else {
      const newFail = webhook.fail_count + 1;
      await query(
        `UPDATE commerce_webhooks
         SET last_triggered_at = NOW(), last_status = $1,
             fail_count = $2, is_active = CASE WHEN $2 >= $3 THEN false ELSE is_active END
         WHERE id = $4`,
        [responseStatus, newFail, MAX_FAIL_COUNT, webhook.id],
      );
    }
  } catch (err) {
    // Network error or timeout
    const newFail = webhook.fail_count + 1;
    await query(
      `UPDATE commerce_webhooks
       SET last_triggered_at = NOW(), last_status = 0,
           fail_count = $1, is_active = CASE WHEN $1 >= $2 THEN false ELSE is_active END
       WHERE id = $3`,
      [newFail, MAX_FAIL_COUNT, webhook.id],
    ).catch(() => {});

    responseStatus = 0;
    responseBody = err instanceof Error ? err.message : "Unknown error";
  } finally {
    clearTimeout(timeout);
  }

  const durationMs = Date.now() - start;

  // Log the attempt
  try {
    await query(
      `INSERT INTO commerce_webhook_logs
         (webhook_id, event, payload, response_status, response_body, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [webhook.id, event, JSON.stringify(payload), responseStatus, responseBody, durationMs],
    );
  } catch {
    console.error(`[webhooks] Failed to log webhook delivery for webhook ${webhook.id}`);
  }
}

// ── Logs ──────────────────────────────────────────────────────────────────────

/** Get paginated webhook logs */
export async function getWebhookLogs(
  tenantId: number,
  webhookId: number,
  opts?: { page?: number; perPage?: number },
): Promise<{ logs: WebhookLog[]; total: number }> {
  const page = opts?.page ?? 1;
  const perPage = opts?.perPage ?? 25;
  const offset = (page - 1) * perPage;

  // Verify webhook belongs to tenant
  const wh = await queryOne(
    `SELECT id FROM commerce_webhooks WHERE id = $1 AND tenant_id = $2`,
    [webhookId, tenantId],
  );
  if (!wh) return { logs: [], total: 0 };

  const [logs, countRow] = await Promise.all([
    query<WebhookLog>(
      `SELECT * FROM commerce_webhook_logs
       WHERE webhook_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [webhookId, perPage, offset],
    ),
    queryOne<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM commerce_webhook_logs WHERE webhook_id = $1`,
      [webhookId],
    ),
  ]);

  return { logs, total: countRow?.total ?? 0 };
}

// ── Test ping ─────────────────────────────────────────────────────────────────

/** Send a test ping to a webhook */
export async function testWebhook(
  tenantId: number,
  webhookId: number,
): Promise<{ success: boolean; status: number | null; duration_ms: number }> {
  const webhook = await queryOne<Webhook>(
    `SELECT * FROM commerce_webhooks WHERE id = $1 AND tenant_id = $2`,
    [webhookId, tenantId],
  );

  if (!webhook) {
    return { success: false, status: null, duration_ms: 0 };
  }

  const event = "webhook.test";
  const payload: Record<string, unknown> = {
    message: "This is a test ping from Webero Commerce.",
    webhook_id: webhook.id,
    tenant_id: tenantId,
  };

  const body = JSON.stringify({
    event,
    payload,
    timestamp: new Date().toISOString(),
    webhook_id: webhook.id,
  });

  const signature = signPayload(body, webhook.secret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  const start = Date.now();
  let responseStatus: number | null = null;
  let responseBody: string | null = null;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webero-Event": event,
        "X-Webero-Signature": signature,
      },
      body,
      signal: controller.signal,
    });

    responseStatus = res.status;
    responseBody = await res.text().catch(() => null);
  } catch (err) {
    responseStatus = 0;
    responseBody = err instanceof Error ? err.message : "Unknown error";
  } finally {
    clearTimeout(timeout);
  }

  const durationMs = Date.now() - start;

  // Log the test attempt
  try {
    await query(
      `INSERT INTO commerce_webhook_logs
         (webhook_id, event, payload, response_status, response_body, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [webhook.id, event, JSON.stringify(payload), responseStatus, responseBody, durationMs],
    );
  } catch {
    // Non-critical
  }

  return {
    success: responseStatus !== null && responseStatus >= 200 && responseStatus < 300,
    status: responseStatus,
    duration_ms: durationMs,
  };
}
