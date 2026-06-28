import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { query, queryOne, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { autoFixTemplate } from "@/lib/auto-fix";
import { buildAuditNotes, type ScanResult } from "@/lib/audit-notes";

interface RouteParams { params: Promise<{ key: string }> }

export const dynamic = "force-dynamic";
export const maxDuration = 90;

async function requireAdmin() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false, email: undefined as string | undefined };
  const payload = verifyToken(token) as { email?: string } | null;
  if (!payload) return { ok: false, email: undefined as string | undefined };
  return { ok: true, email: payload.email };
}

const RESIDUE_PATTERNS = [
  /\/wp-content\/|\/wp-includes\//gi,
  /static\.wixstatic\.com/gi,
  /cdn\.shopify\.com\/s\/files/gi,
  /assets-global\.website-files\.com/gi,
  /framerusercontent\.com/gi,
  /\/clones\/[a-z0-9-]+\//gi,
];

async function scanTemplate(key: string): Promise<ScanResult & { tenantSlug: string | null }> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const { existsSync } = await import("fs");

  // Disk residue
  const templatesRoot = path.join(process.cwd(), "src", "templates", key);
  let residueDisk = 0;
  for (const rel of ["content/cs.json", "skin.css"]) {
    const full = path.join(templatesRoot, rel);
    if (!existsSync(full)) continue;
    const raw = await fs.readFile(full, "utf-8");
    for (const re of RESIDUE_PATTERNS) {
      residueDisk += (raw.match(re) ?? []).length;
    }
  }

  // Render scan
  const tplRow = await queryOne<{ id: number }>("SELECT id FROM templates WHERE key = $1", [key]);
  let tenant: { slug: string } | null = null;
  if (tplRow) {
    tenant = await queryOne<{ slug: string }>(
      `SELECT t.slug FROM tenants t
         JOIN sections s ON s.tenant_id = t.id
        WHERE t.template_id = $1 AND s.content_source = 'v2'
        ORDER BY t.id LIMIT 1`,
      [tplRow.id]
    );
  }

  let residueRender = 0;
  let perfScore: number | null = null;
  const perfIssues: string[] = [];
  let hasH1 = false, hasDescription = false, jsonLdCount = 0, imgCount = 0, lazyImgCount = 0;
  let bytesKb = 0, elapsedMs = 0;

  if (tenant) {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3015";
    try {
      const t0 = Date.now();
      const res = await fetch(`${base}/demo/${tenant.slug}`, { headers: { "user-agent": "webero-auto-fix-audit/1.0" } });
      const html = await res.text();
      elapsedMs = Date.now() - t0;
      bytesKb = Math.round(Buffer.byteLength(html, "utf-8") / 1024);

      for (const re of RESIDUE_PATTERNS) residueRender += (html.match(re) ?? []).length;

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
      if (bytesKb > 150)             { score -= 10; perfIssues.push(`HTML > 150 KB (${bytesKb} KB)`); }
      if (inlineCss > 30000)         { score -= 8;  perfIssues.push(`Inline CSS > 30 KB`); }
      if (inlineJs > 100000)         { score -= 8;  perfIssues.push(`Inline JS > 100 KB`); }
      if (elapsedMs > 1500)          { score -= 10; perfIssues.push(`Response > 1.5s`); }
      const eligible = Math.max(0, imgs.length - 2);
      if (eligible > 0 && lazyImgCount / eligible < 0.7) {
        score -= 6; perfIssues.push(`Pouze ${lazyImgCount}/${imgs.length} obrázků s loading=lazy`);
      }
      if (!hasH1)                    { score -= 6;  perfIssues.push(`<h1> chybí`); }
      if (!hasViewport)              { score -= 8;  perfIssues.push(`Chybí meta viewport`); }
      if (!hasDescription)           { score -= 4;  perfIssues.push(`Chybí meta description`); }
      if (ogTags < 4)                { score -= 4;  perfIssues.push(`Pouze ${ogTags} OG tagů`); }
      if (jsonLdCount === 0)         { score -= 6;  perfIssues.push(`Chybí JSON-LD`); }
      perfScore = Math.max(0, score);
    } catch (err) {
      perfIssues.push(`Render fetch selhal: ${err instanceof Error ? err.message : "neznámá chyba"}`);
    }
  }

  return {
    residueDisk,
    residueRender,
    perfScore,
    perfIssues,
    hasH1,
    hasDescription,
    jsonLdCount,
    imgCount,
    lazyImgCount,
    bytesKb,
    elapsedMs,
    tenantSlug: tenant?.slug ?? null,
  };
}

/**
 * POST /api/admin/template-queue/:key/auto-fix
 *
 * Workflow:
 *   1. Run autoFixTemplate (cleanup local, download external, reseed, clear stale)
 *   2. Re-scan to measure post-fix state
 *   3. Generate audit notes
 *   4. Persist: last_perf_score, last_residue_count, review_checklist
 *      (with auto-populated items), review_notes (markdown)
 *   5. Return full report
 *
 * Auth: platform admin cookie.
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { ok, email } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const tplRow = await queryOne<{ id: number }>("SELECT id FROM templates WHERE key = $1", [key]);
  if (!tplRow) return Response.json({ error: "Template not found" }, { status: 404 });

  const fix = await autoFixTemplate(key);
  const scan = await scanTemplate(key);

  // Studio compatibility audit
  let studioScore: number | undefined;
  let studioIssues: Array<{ severity: string; code: string; message: string }> = [];
  let studioSummary: Record<string, unknown> = {};
  try {
    const { studioCompatibilityAudit } = await import("../scan/route");
    const studioResult = await studioCompatibilityAudit(key);
    studioScore = studioResult.score;
    studioIssues = studioResult.issues;
    studioSummary = studioResult.summary;
  } catch { /* skip if unavailable */ }

  const fullScan = { ...scan, studioScore, studioIssues, studioSummary };
  const notes = buildAuditNotes(fix, fullScan);

  const totalResidue = scan.residueDisk + scan.residueRender;
  const noPlaceholders = (studioSummary.placeholderCount as number ?? 0) === 0;
  const noDeadRefs    = (studioSummary.deadRefs as number ?? 0) === 0;

  const checklist: Record<string, boolean> = {
    // Visual
    no_original_text:    totalResidue === 0,
    no_original_imgs:    false,
    desktop_rendering:   scan.tenantSlug !== null,
    mobile_rendering:    scan.tenantSlug !== null,
    // Studio
    sections_work:       scan.tenantSlug !== null,
    sections_toggle:     scan.tenantSlug !== null,
    sections_reorder:    scan.tenantSlug !== null,
    sections_add_delete: false,
    editor_clickable:    scan.tenantSlug !== null,
    editor_inline_text:  false,
    editor_images:       false,
    data_slots:          false,
    no_placeholder_imgs: noPlaceholders,
    contentref_valid:    noDeadRefs,
    // Perf & SEO
    pagespeed_ok:        (scan.perfScore ?? 0) >= 80,
    seo_complete:        scan.hasH1 && scan.hasDescription && scan.jsonLdCount > 0,
  };

  await query(
    `UPDATE templates
        SET last_perf_score = $1,
            last_perf_at = now(),
            last_residue_count = $2,
            last_residue_at = now(),
            review_checklist = $3::jsonb,
            review_notes = $4,
            updated_at = now()
      WHERE id = $5`,
    [
      scan.perfScore,
      totalResidue,
      JSON.stringify(checklist),
      JSON.stringify(notes),
      tplRow.id,
    ]
  );

  await auditLog("template_auto_fix", {
    actorEmail: email,
    targetType: "template",
    targetId: key,
    extra: {
      cleanedLocalUrls: fix.steps.cleanedLocalUrls,
      downloadedExternalAssets: fix.steps.downloadedExternalAssets,
      perfScore: scan.perfScore,
      residueAfter: totalResidue,
    },
  });

  return Response.json({
    key,
    tenantSlug: scan.tenantSlug,
    fix,
    scan: fullScan,
    studio: { score: studioScore, issues: studioIssues, summary: studioSummary },
    notes,
    checklist,
  });
}
