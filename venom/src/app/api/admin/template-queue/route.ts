import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { query, queryOne, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

/**
 * Admin — daily template review queue.
 *
 * GET  ?date=YYYY-MM-DD       — list templates assigned to that day (default today)
 * GET  ?status=pending|reviewed|approved|blocked — filter (default all)
 * POST                          — auto-assign next 3 pending templates to today
 *
 * Auth: platform admin cookie (verifyToken).
 */
async function requireAdmin(): Promise<{ ok: boolean; email?: string }> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false };
  const payload = verifyToken(token) as { email?: string } | null;
  if (!payload) return { ok: false };
  return { ok: true, email: payload.email };
}

interface TemplateRow {
  id: number;
  key: string;
  name: string;
  industry: string;
  current_version: string;
  status: string;
  review_status: string;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewer_email: string | null;
  assigned_date: string | null;
  review_checklist: Record<string, unknown> | null;
  last_perf_score: number | null;
  last_perf_at: string | null;
  last_residue_count: number | null;
  last_residue_at: string | null;
}

export async function GET(req: NextRequest) {
  const { ok } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const status = url.searchParams.get("status");
  const all = url.searchParams.get("all") === "1";

  const where: string[] = [];
  const values: unknown[] = [];
  if (date) {
    values.push(date);
    where.push(`t.assigned_date = $${values.length}`);
  }
  if (status) {
    values.push(status);
    where.push(`t.review_status = $${values.length}`);
  }
  if (!date && !status && !all) {
    // Default: today's queue
    where.push(`t.assigned_date = CURRENT_DATE`);
  }

  // Enrich with v2 tenant counts (production impact)
  const rows = await query<TemplateRow & { v2_tenant_count: string }>(
    `SELECT t.id, t.key, t.name, t.industry, t.current_version, t.status,
            t.review_status, t.review_notes, t.reviewed_at, t.reviewer_email,
            t.assigned_date, t.review_checklist, t.last_perf_score, t.last_perf_at,
            t.last_residue_count, t.last_residue_at,
            (SELECT COUNT(DISTINCT s.tenant_id)::text
              FROM sections s
              JOIN tenants tn ON tn.id = s.tenant_id
             WHERE tn.template_id = t.id AND s.content_source = 'v2') AS v2_tenant_count
       FROM templates t
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY t.assigned_date NULLS LAST, t.review_status, t.key`,
    values
  );

  // Stats summary
  const stats = await queryOne<{ pending: string; reviewed: string; approved: string; blocked: string; total: string }>(
    `SELECT
       COUNT(*) FILTER (WHERE review_status = 'pending')::text  AS pending,
       COUNT(*) FILTER (WHERE review_status = 'reviewed')::text AS reviewed,
       COUNT(*) FILTER (WHERE review_status = 'approved')::text AS approved,
       COUNT(*) FILTER (WHERE review_status = 'blocked')::text  AS blocked,
       COUNT(*)::text AS total
     FROM templates`
  );

  return Response.json({
    date: date ?? null,
    items: rows.map((r) => ({
      ...r,
      v2_tenant_count: parseInt(r.v2_tenant_count, 10),
    })),
    stats: stats ? {
      pending:  parseInt(stats.pending,  10),
      reviewed: parseInt(stats.reviewed, 10),
      approved: parseInt(stats.approved, 10),
      blocked:  parseInt(stats.blocked,  10),
      total:    parseInt(stats.total,    10),
    } : null,
  });
}

/**
 * POST — auto-assign 3 pending templates to today (or supplied date).
 *
 * Body: { date?: "YYYY-MM-DD", count?: 3 }
 *
 * Picks templates with review_status='pending' and no assigned_date, ordered
 * by v2 tenant count DESC (most production impact first) then alphabetical.
 */
export async function POST(req: NextRequest) {
  const { ok, email } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { date?: string; count?: number };
  const targetDate = body.date ?? new Date().toISOString().slice(0, 10);
  const count = Math.max(1, Math.min(body.count ?? 3, 10));

  // Already assigned today? Don't double-assign.
  const existing = await query<{ key: string }>(
    "SELECT key FROM templates WHERE assigned_date = $1",
    [targetDate]
  );
  if (existing.length >= count) {
    return Response.json({
      assigned: 0,
      reason: "already assigned",
      existing: existing.map((r) => r.key),
    });
  }

  const needed = count - existing.length;

  // Pick pending templates, sort by v2 tenant impact, then alpha
  const candidates = await query<{ id: number; key: string; n: string }>(
    `SELECT t.id, t.key,
            (SELECT COUNT(DISTINCT s.tenant_id)::text
              FROM sections s
              JOIN tenants tn ON tn.id = s.tenant_id
             WHERE tn.template_id = t.id AND s.content_source = 'v2') AS n
       FROM templates t
      WHERE t.review_status = 'pending'
        AND t.assigned_date IS NULL
      ORDER BY (SELECT COUNT(DISTINCT s.tenant_id)
                  FROM sections s
                  JOIN tenants tn ON tn.id = s.tenant_id
                 WHERE tn.template_id = t.id AND s.content_source = 'v2') DESC, t.key ASC
      LIMIT $1`,
    [needed]
  );

  if (candidates.length === 0) {
    return Response.json({ assigned: 0, reason: "no pending templates left" });
  }

  for (const c of candidates) {
    await query(
      "UPDATE templates SET assigned_date = $1, updated_at = now() WHERE id = $2",
      [targetDate, c.id]
    );
  }

  await auditLog("template_queue_assigned", {
    actorEmail: email,
    targetType: "template",
    extra: { date: targetDate, keys: candidates.map((c) => c.key) },
  });

  return Response.json({
    assigned: candidates.length,
    date: targetDate,
    keys: candidates.map((c) => c.key),
  });
}
