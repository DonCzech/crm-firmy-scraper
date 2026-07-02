import { randomUUID } from "crypto";
import { query } from "./db";

export async function auditLog(opts: {
  userId: string;
  companyId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await query(
      `INSERT INTO fak_audit_log (id, company_id, user_id, action, entity_type, entity_id, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        randomUUID(),
        opts.companyId ?? null,
        opts.userId,
        opts.action,
        opts.entityType ?? null,
        opts.entityId ?? null,
        opts.meta ? JSON.stringify(opts.meta) : null,
      ]
    );
  } catch {
    // audit failures must not break the app
  }
}
