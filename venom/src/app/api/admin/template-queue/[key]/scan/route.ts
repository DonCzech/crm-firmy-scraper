import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";
import { query, queryOne, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { buildAuditNotes } from "@/lib/audit-notes";
import { assertSafeKey, resolveWithin } from "@/lib/safe-path";

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

// All types known to SECTION_RENDERERS (src/sections/registry.ts)
const KNOWN_SECTION_TYPES = new Set([
  "navbar", "footer", "hero", "services", "pricing", "testimonials", "gallery",
  "contact", "opening-hours", "faq", "cta", "rezora-cta", "rezora-widget",
  "team", "about", "blog-preview", "map", "promo", "products", "stats",
  "embed", "freeform", "full-page-clone", "astera-home",
]);

// ── Studio Compatibility Audit ────────────────────────────────────────────────

export interface StudioIssue {
  severity: "critical" | "warning" | "info";
  code: string;
  message: string;
  detail?: string;
}

interface TemplateManifest {
  pages?: Array<{
    slug: string;
    isHomepage?: boolean;
    sections?: Array<{ type: string; variant: string; contentRef: string }>;
  }>;
}

function resolveContentRef(json: Record<string, unknown>, ref: string): boolean {
  const parts = ref.split(".");
  let cur: unknown = json;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return false;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur !== undefined;
}

export async function studioCompatibilityAudit(templateKey: string): Promise<{
  issues: StudioIssue[];
  score: number;
  summary: Record<string, unknown>;
}> {
  assertSafeKey(templateKey, "template key");
  const issues: StudioIssue[] = [];
  const templateDir = path.join(process.cwd(), "src", "templates", templateKey);
  const publicDir = path.join(process.cwd(), "public", "templates", templateKey);

  // ── 1. Template manifest check ─────────────────────────────────────────────
  const manifestPath = path.join(templateDir, "template.json");

  // Legacy TypeScript-based templates (barber.ts, barber-01, etc.) have no
  // template.json or content/cs.json — they define everything in code.
  // These are fully compatible with Studio; skip JSON checks.
  const contentPath = path.join(templateDir, "content", "cs.json");
  if (!existsSync(manifestPath) && !existsSync(contentPath)) {
    issues.push({ severity: "info", code: "LEGACY_TS_TEMPLATE", message: "Legacy TypeScript šablona (barber.ts) — bez template.json/cs.json. Studio kompatibilní, obsah je v kódu." });
    return { issues, score: 100, summary: { type: "legacy-ts" } };
  }
  if (!existsSync(manifestPath)) {
    issues.push({ severity: "info", code: "NO_MANIFEST", message: "template.json chybí — šablona pravděpodobně používá TypeScript definici" });
    return { issues, score: 95, summary: { type: "legacy-ts" } };
  }
  const manifest: TemplateManifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  // ── 2. cs.json existence ──────────────────────────────────────────────────
  if (!existsSync(contentPath)) {
    // Hybrid: template.json exists but content is in TypeScript (barber.ts pattern).
    // Check if there's a TypeScript template definition in /src/lib/templates/
    const tsDefPath = path.join(process.cwd(), "src", "lib", "templates", `${templateKey}.ts`);
    const tsIndexEntry = path.join(process.cwd(), "src", "lib", "templates", "index.ts");
    const isHybridTs = existsSync(tsDefPath) ||
      (existsSync(tsIndexEntry) && (await fs.readFile(tsIndexEntry, "utf-8")).includes(`"${templateKey}"`));
    if (isHybridTs) {
      issues.push({
        severity: "info",
        code: "HYBRID_TS_CONTENT",
        message: "Obsah šablony je definován v TypeScript (barber.ts) — bez cs.json. Studio plně kompatibilní.",
      });
      return { issues, score: 100, summary: { type: "hybrid-ts", pagesCount: (manifest.pages ?? []).length } };
    }
    issues.push({ severity: "critical", code: "NO_CONTENT", message: "content/cs.json chybí — šablona má template.json ale nemá data" });
    return { issues, score: 0, summary: {} };
  }
  const content: Record<string, unknown> = JSON.parse(await fs.readFile(contentPath, "utf-8"));

  // ── 3. Placeholder images ─────────────────────────────────────────────────
  const contentStr = JSON.stringify(content);
  const placeholderCount = (contentStr.match(/"__placeholder"/g) ?? []).length;
  if (placeholderCount > 0) {
    issues.push({
      severity: "warning",
      code: "PLACEHOLDER_IMAGES",
      message: `cs.json obsahuje ${placeholderCount}× __placeholder — chybí reálné obrázky`,
      detail: "Nahraď placeholdery cestami do /templates/{key}/images/",
    });
  }

  // ── 4. ContentRef validity ────────────────────────────────────────────────
  const pages = manifest.pages ?? [];
  const deadRefs: string[] = [];
  const allTypes: string[] = [];
  const allVariants: string[] = [];
  const pageNavbarCount: Record<string, number> = {};
  const pageFooterCount: Record<string, number> = {};

  for (const page of pages) {
    const slug = page.slug ?? "unknown";
    pageNavbarCount[slug] = 0;
    pageFooterCount[slug] = 0;
    for (const sec of page.sections ?? []) {
      // ContentRef
      if (sec.contentRef && !resolveContentRef(content, sec.contentRef)) {
        deadRefs.push(`${slug}/${sec.type}: contentRef="${sec.contentRef}" nenalezen v cs.json`);
      }
      // Unknown section type
      if (!KNOWN_SECTION_TYPES.has(sec.type)) {
        issues.push({
          severity: "warning",
          code: "UNKNOWN_SECTION_TYPE",
          message: `Sekce type="${sec.type}" není v SECTION_RENDERERS registry`,
          detail: `Stránka ${slug} — sekce se nezobrazí (pouze admin fallback box)`,
        });
      }
      allTypes.push(sec.type);
      allVariants.push(sec.variant);
      if (sec.type === "navbar") pageNavbarCount[slug]++;
      if (sec.type === "footer") pageFooterCount[slug]++;
    }
  }

  if (deadRefs.length > 0) {
    issues.push({
      severity: "critical",
      code: "DEAD_CONTENT_REF",
      message: `${deadRefs.length} contentRef nenalezeno v cs.json — sekce se zobrazí bez dat`,
      detail: deadRefs.slice(0, 5).join("\n"),
    });
  }

  // ── 5. Navbar/footer singleton per page ───────────────────────────────────
  for (const slug of Object.keys(pageNavbarCount)) {
    if ((pageNavbarCount[slug] ?? 0) > 1) {
      issues.push({ severity: "warning", code: "MULTI_NAVBAR", message: `Stránka "${slug}" má ${pageNavbarCount[slug]} navbarů — pouze 1 se vykreslí` });
    }
    if ((pageFooterCount[slug] ?? 0) > 1) {
      issues.push({ severity: "warning", code: "MULTI_FOOTER", message: `Stránka "${slug}" má ${pageFooterCount[slug]} footerů — pouze 1 se vykreslí` });
    }
  }

  // ── 6. Image path validity ────────────────────────────────────────────────
  const imagePaths = [...contentStr.matchAll(/["']\/templates\/[^"']+\.(?:jpg|jpeg|png|webp|svg|gif)["']/gi)]
    .map((m) => m[0].slice(1, -1));
  const missingImages: string[] = [];
  const imagesDir = path.join(publicDir, "images");
  for (const imgPath of imagePaths) {
    const abs = resolveWithin(path.join(process.cwd(), "public"), imgPath.replace(/^\//, ""));
    if (!existsSync(abs)) {
      missingImages.push(imgPath);
    }
  }
  if (missingImages.length > 0) {
    issues.push({
      severity: "warning",
      code: "MISSING_IMAGES",
      message: `${missingImages.length} obrázek(ů) v cs.json neexistuje na disku`,
      detail: missingImages.slice(0, 8).join("\n"),
    });
  }

  // ── 7. CSS hardcoded heights ───────────────────────────────────────────────
  const cssPath = path.join(templateDir, "skin.css");
  let hardcodedHeights: string[] = [];
  if (existsSync(cssPath)) {
    const css = await fs.readFile(cssPath, "utf-8");
    const heightMatches = [...css.matchAll(/height\s*:\s*\d{3,}px/gi)].map((m) => m[0]);
    hardcodedHeights = heightMatches;
    if (heightMatches.length > 0) {
      issues.push({
        severity: "warning",
        code: "HARDCODED_HEIGHTS",
        message: `skin.css obsahuje ${heightMatches.length} fixní výšk(y) (height: XXXpx)`,
        detail: `Může způsobit přetékání obsahu po editaci: ${heightMatches.slice(0, 3).join(", ")}`,
      });
    }

    // Z-index conflicts — flag anything above 9000 (likely Studio UI overlay is 1000)
    const highZIndex = [...css.matchAll(/z-index\s*:\s*(\d+)/gi)]
      .map((m) => ({ rule: m[0], val: parseInt(m[1] ?? "0") }))
      .filter((z) => z.val >= 9000);
    if (highZIndex.length > 0) {
      issues.push({
        severity: "warning",
        code: "HIGH_ZINDEX",
        message: `skin.css má ${highZIndex.length} z-index ≥ 9000 — může překrývat Studio editor UI`,
        detail: highZIndex.map((z) => z.rule).join(", "),
      });
    }
  }

  // ── 8. Theme.json check ────────────────────────────────────────────────────
  const themePath = path.join(templateDir, "theme.json");
  if (!existsSync(themePath)) {
    issues.push({ severity: "info", code: "NO_THEME", message: "theme.json chybí — designTokens nejsou definované, bude použit fallback" });
  } else {
    const theme = JSON.parse(await fs.readFile(themePath, "utf-8")) as Record<string, unknown>;
    const requiredKeys = ["colors", "typography", "spacing"];
    for (const k of requiredKeys) {
      if (!theme[k]) {
        issues.push({ severity: "info", code: `THEME_MISSING_${k.toUpperCase()}`, message: `theme.json chybí klíč "${k}"` });
      }
    }
  }

  // ── 9. Homepage has hero? ─────────────────────────────────────────────────
  const homepage = pages.find((p) => p.isHomepage || p.slug === "home");
  if (homepage) {
    const types = (homepage.sections ?? []).map((s) => s.type);
    if (!types.includes("hero")) {
      issues.push({ severity: "info", code: "NO_HERO_ON_HOME", message: "Homepage nemá sekci type=hero" });
    }
    if (!types.includes("navbar")) {
      issues.push({ severity: "critical", code: "NO_NAVBAR_ON_HOME", message: "Homepage nemá navbar sekci" });
    }
    if (!types.includes("footer")) {
      issues.push({ severity: "critical", code: "NO_FOOTER_ON_HOME", message: "Homepage nemá footer sekci" });
    }
  }

  // ── 10. Duplicate section IDs in DB (only if tenant exists) ──────────────
  // (done via DB query below)

  // ── Score ─────────────────────────────────────────────────────────────────
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount  = issues.filter((i) => i.severity === "warning").length;
  const studioScore   = Math.max(0, 100 - criticalCount * 25 - warningCount * 8);

  const uniqueTypes    = [...new Set(allTypes)];
  const uniqueVariants = [...new Set(allVariants)];

  return {
    issues,
    score: studioScore,
    summary: {
      pagesCount: pages.length,
      sectionsTotal: allTypes.length,
      uniqueTypes,
      uniqueVariants,
      placeholderCount,
      missingImages: missingImages.length,
      deadRefs: deadRefs.length,
      hardcodedHeights: hardcodedHeights.length,
      imagesDir: existsSync(imagesDir),
    },
  };
}

// ── DB-level Studio checks ───────────────────────────────────────────────────

async function dbStudioChecks(templateId: number, tenantSlug: string): Promise<StudioIssue[]> {
  const issues: StudioIssue[] = [];

  // Duplicate order_index per page
  const dupOrders = await query<{ page_slug: string; order_index: number; cnt: string }>(
    `SELECT p.slug AS page_slug, s.order_index, COUNT(*) AS cnt
       FROM sections s
       JOIN pages p ON p.id = s.page_id
       JOIN tenants t ON t.id = s.tenant_id
      WHERE t.slug = $1
      GROUP BY p.slug, s.order_index
     HAVING COUNT(*) > 1`,
    [tenantSlug]
  ).catch(() => []);

  if (dupOrders.length > 0) {
    issues.push({
      severity: "critical",
      code: "DUPLICATE_ORDER_INDEX",
      message: `${dupOrders.length} duplicitní order_index — drag & drop bude chaotický`,
      detail: dupOrders.map((d) => `${d.page_slug}: order=${d.order_index} (${d.cnt}×)`).join(", "),
    });
  }

  // Sections with NULL order_index
  const nullOrders = await query<{ cnt: string }>(
    `SELECT COUNT(*)::text AS cnt FROM sections s
       JOIN tenants t ON t.id = s.tenant_id
      WHERE t.slug = $1 AND s.order_index IS NULL`,
    [tenantSlug]
  ).catch(() => []);
  if ((parseInt(nullOrders[0]?.cnt ?? "0")) > 0) {
    issues.push({
      severity: "critical",
      code: "NULL_ORDER_INDEX",
      message: `${nullOrders[0]?.cnt} sekcí nemá order_index — nebudou se zobrazovat ve správném pořadí`,
    });
  }

  // Sections with unknown type in DB
  const unknownTypes = await query<{ section_type: string; cnt: string }>(
    `SELECT section_type, COUNT(*)::text AS cnt
       FROM sections s
       JOIN tenants t ON t.id = s.tenant_id
      WHERE t.slug = $1
      GROUP BY section_type`,
    [tenantSlug]
  ).catch(() => []);

  for (const row of unknownTypes) {
    if (!KNOWN_SECTION_TYPES.has(row.section_type)) {
      issues.push({
        severity: "warning",
        code: "DB_UNKNOWN_SECTION_TYPE",
        message: `DB obsahuje sekci section_type="${row.section_type}" která není v SECTION_RENDERERS`,
        detail: `${row.cnt}× — sekce se nezobrazí (prázdný box v admin, null v public)`,
      });
    }
  }

  // Content_source check — all v2 sections must have content_source='v2'
  const legacySections = await query<{ cnt: string }>(
    `SELECT COUNT(*)::text AS cnt FROM sections s
       JOIN tenants t ON t.id = s.tenant_id
      WHERE t.slug = $1 AND (s.content_source IS NULL OR s.content_source != 'v2')`,
    [tenantSlug]
  ).catch(() => []);
  if (parseInt(legacySections[0]?.cnt ?? "0") > 0) {
    issues.push({
      severity: "warning",
      code: "LEGACY_CONTENT_SOURCE",
      message: `${legacySections[0]?.cnt} sekcí nemá content_source='v2' — Studio nebude načítat template defaults`,
    });
  }

  return issues;
}

/**
 * Per-template scan on demand. Runs:
 *   1. Residue check (disk + tenant render)
 *   2. Lightweight perf audit
 *   3. Studio compatibility audit (NEW)
 *
 * Updates templates.last_perf_score, last_perf_at, last_residue_count,
 * last_residue_at and returns full report.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  try {
    assertSafeKey(key, "template key");
  } catch {
    return Response.json({ error: "Invalid template key" }, { status: 400 });
  }
  const tplRow = await queryOne<{ id: number }>(
    "SELECT id FROM templates WHERE key = $1", [key]
  );
  if (!tplRow) return Response.json({ error: "Template not found" }, { status: 404 });

  // 1. Disk-level residue scan
  const templatesRoot = resolveWithin(path.join(process.cwd(), "src", "templates"), key);
  const findings: Array<{ file: string; pattern: string; count: number; sample: string }> = [];
  for (const rel of ["content/cs.json", "skin.css"]) {
    const full = path.join(/* turbopackIgnore: true */ templatesRoot, rel);
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

  // 2. Studio compatibility audit (disk-level)
  const studioAudit = await studioCompatibilityAudit(key);

  // 3. Find a v2 tenant for render scan + perf check + DB checks
  const tenant = await queryOne<{ slug: string }>(
    `SELECT t.slug FROM tenants t
       JOIN sections s ON s.tenant_id = t.id
      WHERE t.template_id = $1 AND s.content_source = 'v2'
      ORDER BY t.id LIMIT 1`,
    [tplRow.id]
  );

  // DB-level Studio checks (requires tenant)
  let dbIssues: StudioIssue[] = [];
  if (tenant) {
    dbIssues = await dbStudioChecks(tplRow.id, tenant.slug);
    studioAudit.issues.push(...dbIssues);
  }

  let perfScore: number | null = null;
  let perfReport: Record<string, unknown> | null = null;
  const renderFindings: Array<{ pattern: string; count: number }> = [];

  if (tenant) {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3015";
    const url = `${base}/demo/${tenant.slug}`;
    try {
      const t0 = Date.now();
      const res = await fetch(url, { headers: { "user-agent": "webero-admin-scan/1.0" } });
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

      // Studio render checks — data-section-id present on all sections
      const sectionDataIds = [...html.matchAll(/data-section-id=["'](\d+)["']/gi)].length;

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
        sectionDataIds,
        issues,
        score: perfScore,
      };
    } catch (err) {
      perfReport = { error: err instanceof Error ? err.message : "fetch failed" };
    }
  }

  // 4. Update templates row with snapshot
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
    extra: {
      residueCount,
      renderFindings,
      perfScore,
      studioScore: studioAudit.score,
      studioCritical: studioAudit.issues.filter((i) => i.severity === "critical").length,
    },
  });

  // Generate auto-audit notes from scan data (same as auto-fix, but without fix steps)
  const scanResult = {
    residueDisk: residueCount,
    residueRender: renderFindings.reduce((a, f) => a + f.count, 0),
    perfScore: perfScore ?? null,
    perfIssues: Array.isArray((perfReport as Record<string,unknown>)?.issues) ? (perfReport as Record<string,unknown>).issues as string[] : [],
    hasH1: ((perfReport as Record<string,unknown>)?.h1Count as number) === 1,
    hasDescription: Boolean((perfReport as Record<string,unknown>)?.hasDescription),
    jsonLdCount: Number((perfReport as Record<string,unknown>)?.jsonLd ?? 0),
    imgCount: Number((perfReport as Record<string,unknown>)?.imgs ?? 0),
    lazyImgCount: Number((perfReport as Record<string,unknown>)?.lazyImgs ?? 0),
    bytesKb: Number((perfReport as Record<string,unknown>)?.bytesKb ?? 0),
    elapsedMs: Number((perfReport as Record<string,unknown>)?.elapsed ?? 0),
    studioScore: studioAudit.score,
    studioIssues: studioAudit.issues,
    studioSummary: studioAudit.summary,
  };
  const notes = buildAuditNotes(null, scanResult);

  return Response.json({
    key,
    residue: {
      diskCount: residueCount,
      diskFindings: findings,
      renderFindings,
    },
    perf: perfReport,
    studio: {
      score: studioAudit.score,
      issues: studioAudit.issues,
      summary: studioAudit.summary,
    },
    notes,
    tenant: tenant?.slug ?? null,
  });
}
