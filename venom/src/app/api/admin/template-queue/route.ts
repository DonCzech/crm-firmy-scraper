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

// Industry priority order — matches preview-2 grouping but starts with barber.
// Used both for auto-assign (which industry to pick next) and list ordering.
const INDUSTRY_PRIORITY = [
  "barber", "hairdresser", "hair", "beauty", "nails", "clinic",
  "wellness", "massage", "ananda", "spa", "tawan",
  "fitness", "physio", "fyzio",
  "dentist", "dental", "ortho",
  "tattoo",
  "bakery", "cafe", "restaurant", "catering", "sweet",
  "florist", "garden", "arbo", "grooming",
  "veterinary", "vet", "pets", "pethotel",
  "kids", "edu", "lang", "education", "autoskola",
  "lawyer", "legal",
  "accounting", "ucetni", "finance",
  "realEstate", "reality", "architecture", "arch",
  "auto", "autoservis", "klempir", "klima",
  "instala", "stavba", "construction", "elektro", "malir", "floors",
  "cleaning", "clean", "ddd",
  "solar",
  "hotel", "chalet",
  "events", "dj",
  "photographer", "photo", "video",
];

function industryRank(industry: string): number {
  const idx = INDUSTRY_PRIORITY.indexOf(industry);
  return idx >= 0 ? idx : 999;
}

export async function GET(req: NextRequest) {
  const { ok } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const status = url.searchParams.get("status");
  const all = url.searchParams.get("all") === "1";

  const where: string[] = [
    // Only show templates that have a corresponding disk dir (= a current
    // template_versions row). Legacy DB-only entries like 'barber',
    // 'wellness', 'astera' are excluded — those aren't real Phase 3 templates.
    "EXISTS (SELECT 1 FROM template_versions tv WHERE tv.template_id = t.id)",
    "t.status = 'active'",
  ];
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

  // Enrich with v2 tenant counts (production impact) + a representative tenant
  // for one-click access (slug + access_token) so the admin queue lists every
  // template with a working studio link without further lookup.
  const rows = await query<TemplateRow & {
    v2_tenant_count: string;
    primary_tenant_slug: string | null;
    primary_tenant_token: string | null;
  }>(
    `SELECT t.id, t.key, t.name, t.industry, t.current_version, t.status,
            t.review_status, t.review_notes, t.reviewed_at, t.reviewer_email,
            t.assigned_date, t.review_checklist, t.last_perf_score, t.last_perf_at,
            t.last_residue_count, t.last_residue_at,
            (SELECT COUNT(DISTINCT s.tenant_id)::text
              FROM sections s
              JOIN tenants tn ON tn.id = s.tenant_id
             WHERE tn.template_id = t.id AND s.content_source = 'v2') AS v2_tenant_count,
            (SELECT tn.slug FROM tenants tn
              JOIN sections s ON s.tenant_id = tn.id AND s.content_source = 'v2'
             WHERE tn.template_id = t.id
             ORDER BY tn.id LIMIT 1) AS primary_tenant_slug,
            (SELECT tn.access_token FROM tenants tn
              JOIN sections s ON s.tenant_id = tn.id AND s.content_source = 'v2'
             WHERE tn.template_id = t.id
             ORDER BY tn.id LIMIT 1) AS primary_tenant_token
       FROM templates t
      WHERE ${where.join(" AND ")}`,
    values
  );

  // Sort in JS by preview-2 industry priority, then by name.
  rows.sort((a, b) => {
    const ra = industryRank(a.industry);
    const rb = industryRank(b.industry);
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "cs");
  });

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
      primary_tenant_slug: r.primary_tenant_slug ?? null,
      primary_tenant_token: r.primary_tenant_token ?? null,
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

  // Pick pending templates whose disk version is seeded. Sort by industry
  // priority (barber first), then by name within industry.
  const all = await query<{ id: number; key: string; name: string; industry: string }>(
    `SELECT t.id, t.key, t.name, t.industry
       FROM templates t
      WHERE t.review_status = 'pending'
        AND t.assigned_date IS NULL
        AND t.status = 'active'
        AND EXISTS (SELECT 1 FROM template_versions tv WHERE tv.template_id = t.id)`
  );

  all.sort((a, b) => {
    const ra = industryRank(a.industry);
    const rb = industryRank(b.industry);
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "cs");
  });

  const candidates = all.slice(0, needed);

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
