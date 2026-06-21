import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";
import { query, queryOne, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

interface RouteParams { params: Promise<{ key: string }> }

async function requireAdmin() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return Boolean(verifyToken(token));
}

const RESIDUE_PATTERNS = [
  { name: "wordpress",  re: /\/wp-content\/|\/wp-includes\//gi },
  { name: "wixstatic",  re: /static\.wixstatic\.com/gi },
  { name: "shopify",    re: /cdn\.shopify\.com\/s\/files/gi },
  { name: "webflow",    re: /assets-global\.website-files\.com/gi },
  { name: "framer",     re: /framerusercontent\.com/gi },
  { name: "wp-emoji",   re: /s\.w\.org\b/gi },
  { name: "clones",     re: /\/clones\/[a-z0-9-]+\//gi },
  { name: "gtm",        re: /googletagmanager\.com\/gtm\.js/gi },
  { name: "fb-pixel",   re: /connect\.facebook\.net|fbevents\.js/gi },
];

/**
 * Per-template scan on demand. Runs residue check (disk + tenant render)
 * plus lightweight perf audit on the first v2 tenant of this template.
 * Updates templates.last_perf_score, last_perf_at, last_residue_count,
 * last_residue_at and returns the report.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const tplRow = await queryOne<{ id: number }>(
    "SELECT id FROM templates WHERE key = $1", [key]
  );
  if (!tplRow) return Response.json({ error: "Template not found" }, { status: 404 });

  // 1. Disk-level residue scan
  const templatesRoot = path.join(process.cwd(), "src", "templates", key);
  const findings: Array<{ file: string; pattern: string; count: number; sample: string }> = [];
  for (const rel of ["content/cs.json", "skin.css"]) {
    const full = path.join(templatesRoot, rel);
    if (!existsSync(full)) continue;
    const raw = await fs.readFile(full, "utf-8");
    for (const p of RESIDUE_PATTERNS) {
      const matches = [...raw.matchAll(p.re)];
      if (matches.length > 0) {
        findings.push({ file: rel, pattern: p.name, count: matches.length, sample: matches[0][0].slice(0, 80) });
      }
    }
  }
  const residueCount = findings.reduce((a, f) => a + f.count, 0);

  // 2. Find a v2 tenant for render scan + perf check
  const tenant = await queryOne<{ slug: string }>(
    `SELECT t.slug FROM tenants t
       JOIN sections s ON s.tenant_id = t.id
      WHERE t.template_id = $1 AND s.content_source = 'v2'
      ORDER BY t.id LIMIT 1`,
    [tplRow.id]
  );

  let perfScore: number | null = null;
  let perfReport: Record<string, unknown> | null = null;
  let renderFindings: Array<{ pattern: string; count: number }> = [];

  if (tenant) {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3015";
    const url = `${base}/demo/${tenant.slug}`;
    try {
      const t0 = Date.now();
      const res = await fetch(url, { headers: { "user-agent": "venom-admin-scan/1.0" } });
      const html = await res.text();
      const elapsed = Date.now() - t0;
      const bytes = Buffer.byteLength(html, "utf-8");

      // Residue scan on render
      for (const p of RESIDUE_PATTERNS) {
        const matches = [...html.matchAll(p.re)];
        if (matches.length > 0) renderFindings.push({ pattern: p.name, count: matches.length });
      }

      // Lightweight perf scoring
      const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
      const inlineCss = styles.reduce((a, m) => a + m[1].length, 0);
      const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
      const inlineJs = scripts.reduce((a, m) => a + m[1].length, 0);
      const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
      const lazyImgs = imgs.filter((m) => /\bloading=["']?lazy/.test(m[0])).length;
      const jsonLd = [...html.matchAll(/<script[^>]*application\/ld\+json/gi)].length;
      const ogTags = [...html.matchAll(/<meta[^>]*property=["']og:[^"']+["']/gi)].length;
      const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
      const hasDescription = /<meta[^>]*name=["']description["']/i.test(html);
      const h1Count = (html.match(/<h1\b/gi) ?? []).length;

      let score = 100;
      const issues: string[] = [];
      if (bytes > 150_000)         { score -= 10; issues.push(`HTML > 150 KB`); }
      if (inlineCss > 30_000)      { score -= 8;  issues.push(`Inline CSS > 30 KB`); }
      if (inlineJs > 100_000)      { score -= 8;  issues.push(`Inline JS > 100 KB`); }
      if (elapsed > 1500)          { score -= 10; issues.push(`Response > 1.5s`); }
      const eligible = Math.max(0, imgs.length - 2);
      if (eligible > 0 && lazyImgs / eligible < 0.7) { score -= 6; issues.push(`Only ${lazyImgs}/${imgs.length} lazy imgs`); }
      if (h1Count !== 1)           { score -= 6;  issues.push(`<h1> count = ${h1Count}`); }
      if (!hasViewport)            { score -= 8;  issues.push("Missing viewport"); }
      if (!hasDescription)         { score -= 4;  issues.push("Missing description"); }
      if (ogTags < 4)              { score -= 4;  issues.push(`Only ${ogTags} OG tags`); }
      if (jsonLd === 0)            { score -= 6;  issues.push("No JSON-LD"); }
      perfScore = Math.max(0, score);
      perfReport = {
        elapsed,
        bytes,
        bytesKb: Math.round(bytes / 1024),
        inlineCssBytes: inlineCss,
        inlineJsBytes: inlineJs,
        imgs: imgs.length,
        lazyImgs,
        jsonLd,
        ogTags,
        hasViewport,
        hasDescription,
        h1Count,
        issues,
        score: perfScore,
      };
    } catch (err) {
      perfReport = { error: err instanceof Error ? err.message : "fetch failed" };
    }
  }

  // 3. Update templates row with snapshot
  await query(
    `UPDATE templates
        SET last_perf_score = $1,
            last_perf_at = now(),
            last_residue_count = $2,
            last_residue_at = now()
      WHERE id = $3`,
    [perfScore, residueCount + renderFindings.reduce((a, f) => a + f.count, 0), tplRow.id]
  );

  await auditLog("template_queue_scan", {
    targetType: "template",
    targetId: key,
    extra: { residueCount, renderFindings, perfScore },
  });

  return Response.json({
    key,
    residue: {
      diskCount: residueCount,
      diskFindings: findings,
      renderFindings,
    },
    perf: perfReport,
    tenant: tenant?.slug ?? null,
  });
}
