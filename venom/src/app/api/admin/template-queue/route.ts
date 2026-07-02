import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { existsSync } from "fs";
import path from "path";
import { query, queryOne, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { autoFixTemplate } from "@/lib/auto-fix";
import { buildAuditNotes } from "@/lib/audit-notes";

function templateDirExists(key: string): boolean {
  return existsSync(path.join(process.cwd(), "src", "templates", key));
}

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
    items: rows
      .filter((r) => templateDirExists(r.key))
      .map((r) => ({
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

async function runAutoFixInBackground(keys: string[]) {
  for (const key of keys) {
    try {
      const tplRow = await queryOne<{ id: number }>("SELECT id FROM templates WHERE key = $1", [key]);
      if (!tplRow) continue;

      const fix = await autoFixTemplate(key);

      // Inline scan (same logic as /scan route)
      const { promises: fs } = await import("fs");
      const pathMod = await import("path");
      const { existsSync: fsExists } = await import("fs");
      const RESIDUE_RES = [
        /\/wp-content\/|\/wp-includes\//gi, /static\.wixstatic\.com/gi,
        /cdn\.shopify\.com\/s\/files/gi, /assets-global\.website-files\.com/gi,
        /framerusercontent\.com/gi, /\/clones\/[a-z0-9-]+\//gi,
      ];
      let residueDisk = 0;
      for (const rel of ["content/cs.json", "skin.css"]) {
        const full = pathMod.join(process.cwd(), "src", "templates", key, rel);
        if (!fsExists(full)) continue;
        const raw = await fs.readFile(full, "utf-8");
        for (const re of RESIDUE_RES) residueDisk += (raw.match(re) ?? []).length;
      }
      const tenant = await queryOne<{ slug: string }>(
        `SELECT t.slug FROM tenants t JOIN sections s ON s.tenant_id = t.id
          WHERE t.template_id = $1 AND s.content_source = 'v2' ORDER BY t.id LIMIT 1`,
        [tplRow.id]
      );
      let perfScore: number | null = null;
      let residueRender = 0;
      let hasH1 = false, hasDescription = false, jsonLdCount = 0, bytesKb = 0, elapsedMs = 0, imgCount = 0, lazyImgCount = 0;
      const perfIssues: string[] = [];
      if (tenant) {
        const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3015";
        try {
          const t0 = Date.now();
          const res = await fetch(`${base}/demo/${tenant.slug}`, { headers: { "user-agent": "webero-auto-assign/1.0" } });
          const html = await res.text();
          elapsedMs = Date.now() - t0;
          bytesKb = Math.round(Buffer.byteLength(html, "utf-8") / 1024);
          for (const re of RESIDUE_RES) residueRender += (html.match(re) ?? []).length;
          const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
          const inlineCss = styles.reduce((a, m) => a + m[1].length, 0);
          const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
          const inlineJs = scripts.reduce((a, m) => a + m[1].length, 0);
          const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
          imgCount = imgs.length;
          lazyImgCount = imgs.filter((m) => /\bloading=["']?lazy/.test(m[0])).length;
          jsonLdCount = [...html.matchAll(/<script[^>]*application\/ld\+json/gi)].length;
          const ogTags = [...html.matchAll(/<meta[^>]*property=["']og:[^"']+["']/gi)].length;
          const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
          hasDescription = /<meta[^>]*name=["']description["']/i.test(html);
          const h1Count = (html.match(/<h1\b/gi) ?? []).length;
          hasH1 = h1Count === 1;
          let score = 100;
          if (bytesKb > 150) { score -= 10; perfIssues.push(`HTML > 150 KB (${bytesKb} KB)`); }
          if (inlineCss > 30000) { score -= 8; }
          if (inlineJs > 100000) { score -= 8; }
          if (elapsedMs > 1500) { score -= 10; }
          const eligible = Math.max(0, imgs.length - 2);
          if (eligible > 0 && lazyImgCount / eligible < 0.7) score -= 6;
          if (!hasH1) score -= 6;
          if (!hasViewport) score -= 8;
          if (!hasDescription) score -= 4;
          if (ogTags < 4) score -= 4;
          if (jsonLdCount === 0) score -= 6;
          perfScore = Math.max(0, score);
        } catch { /* render not yet available */ }
      }
      const totalResidue = residueDisk + residueRender;

      // Studio compatibility audit (reuse scan logic)
      let studioScore: number | undefined;
      let studioIssues: import("@/lib/audit-notes").StudioIssue[] = [];
      let studioSummary: Record<string, unknown> = {};
      try {
        const { studioCompatibilityAudit } = await import("./[key]/scan/route");
        const studioResult = await studioCompatibilityAudit(key);
        studioScore = studioResult.score;
        studioIssues = studioResult.issues;
        studioSummary = studioResult.summary;
      } catch { /* scan module not available — skip */ }

      const scanResult = {
        residueDisk, residueRender, perfScore, perfIssues,
        hasH1, hasDescription, jsonLdCount, imgCount, lazyImgCount, bytesKb, elapsedMs,
        studioScore, studioIssues, studioSummary,
      };
      const notes = buildAuditNotes(fix, scanResult);

      const studioOk = studioScore !== undefined ? studioScore >= 80 : tenant !== null;
      const noPlaceholders = (studioSummary.placeholderCount as number ?? 0) === 0;
      const noDeadRefs    = (studioSummary.deadRefs as number ?? 0) === 0;

      const checklist: Record<string, boolean> = {
        // Visual
        no_original_text:   totalResidue === 0,
        no_original_imgs:   false,
        desktop_rendering:  tenant !== null,
        mobile_rendering:   tenant !== null,
        // Studio
        sections_work:      tenant !== null,
        sections_toggle:    tenant !== null,
        sections_reorder:   tenant !== null,
        sections_add_delete: false,
        editor_clickable:   tenant !== null,
        editor_inline_text: false,
        editor_images:      false,
        data_slots:         false,
        no_placeholder_imgs: noPlaceholders,
        contentref_valid:   noDeadRefs,
        // Perf & SEO
        pagespeed_ok:       (perfScore ?? 0) >= 80,
        seo_complete:       hasH1 && hasDescription && jsonLdCount > 0,
      };
      await query(
        `UPDATE templates SET last_perf_score=$1, last_perf_at=now(), last_residue_count=$2,
          last_residue_at=now(), review_checklist=$3::jsonb, review_notes=$4, updated_at=now()
         WHERE id=$5`,
        [perfScore, totalResidue, JSON.stringify(checklist), JSON.stringify(notes), tplRow.id]
      );
    } catch (err) {
      console.error(`[auto-assign] auto-fix failed for ${key}:`, err);
    }
  }
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

  // Only pick templates that have a real disk directory (excludes legacy DB-only entries)
  const candidates = all.filter((t) => templateDirExists(t.key)).slice(0, needed);

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

  // Fire auto-fix for each assigned template in the background (no await).
  // Results (perf score, residue count, checklist, notes) are written to DB
  // and will appear when the user opens the template detail page.
  void runAutoFixInBackground(candidates.map((c) => c.key));

  return Response.json({
    assigned: candidates.length,
    date: targetDate,
    keys: candidates.map((c) => c.key),
    autoFixStarted: true,
  });
}
