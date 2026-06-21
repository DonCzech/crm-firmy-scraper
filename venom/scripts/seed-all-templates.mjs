#!/usr/bin/env node
/**
 * F1 prerequisite — seed all file-based templates (src/templates/<key>/) into DB.
 *
 * Iterates disk, calls the same compute logic as src/lib/templates/loader.ts +
 * tenant-factory.seedTemplates(), upserts templates + template_versions rows.
 *
 * Idempotent: ON CONFLICT updates. Safe to run multiple times.
 *
 * Run:
 *   DATABASE_URL=... node scripts/seed-all-templates.mjs            # all templates
 *   DATABASE_URL=... node scripts/seed-all-templates.mjs --key arbo-01
 *   DATABASE_URL=... node scripts/seed-all-templates.mjs --dry-run
 */
import pg from "pg";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY_KEY = (() => { const i = args.indexOf("--key"); return i >= 0 ? args[i + 1] : null; })();

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL env var required");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const TEMPLATES_ROOT = path.join(process.cwd(), "src", "templates");

// Inline placeholder marker handling (mirrors loader.ts resolvePlaceholders, but skipping
// the SVG generator — for seed purposes we just stringify the marker, since tenant-factory
// produces section content from template_versions.default_sections at onboarding time only.
// The Studio renderer uses content/cs.json directly for live editing).
function isPlaceholder(v) {
  return v && typeof v === "object" && Array.isArray(v.__placeholder);
}
function makePlaceholderSvg(w, h, label) {
  const text = label ?? `${w}×${h}`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' fill='#6b7280' font-family='system-ui' font-size='${Math.min(w,h)/12|0}' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function resolvePlaceholders(input) {
  if (isPlaceholder(input)) {
    const [w, h, label] = input.__placeholder;
    return makePlaceholderSvg(w, h, label);
  }
  if (Array.isArray(input)) return input.map(resolvePlaceholders);
  if (input && typeof input === "object") {
    const out = {};
    for (const [k, v] of Object.entries(input)) out[k] = resolvePlaceholders(v);
    return out;
  }
  return input;
}

function themeToDesignTokens(theme) {
  const spacingMap = { compact: "compact", normal: "normal", spacious: "relaxed", editorial: "relaxed" };
  return {
    colorPrimary: theme.colors.primary,
    colorSecondary: theme.colors.secondary,
    colorBackground: theme.colors.background,
    colorSurface: theme.colors.surface,
    colorText: theme.colors.text,
    colorTextMuted: theme.colors.textMuted,
    colorAccent: theme.colors.accent,
    colorBorder: theme.colors.border,
    fontHeading: theme.typography.fontHeading,
    fontBody: theme.typography.fontBody,
    borderRadius: theme.radius?.pill,
    spacing: spacingMap[theme.spacing?.personality] ?? "normal",
  };
}

function lookupRef(content, ref) {
  if (!ref) return {};
  const parts = ref.split(".");
  let cur = content;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return {};
  }
  return (cur && typeof cur === "object") ? cur : {};
}

function manifestToDefinition(manifest, theme, content) {
  const designTokens = themeToDesignTokens(theme);
  const resolvedContent = resolvePlaceholders(content);
  const homepage = manifest.pages?.find((p) => p.isHomepage) ?? manifest.pages?.[0];
  if (!homepage) return null;
  const defaultSections = (homepage.sections ?? []).map((s, i) => ({
    type: s.type,
    variant: s.variant ?? "default",
    order: i,
    visible: s.visible !== false,
    anchorId: s.anchorId,
    content: s.contentRef ? lookupRef(resolvedContent, s.contentRef) : (s.content ?? resolvedContent[s.type] ?? {}),
  }));
  return {
    key: manifest.key,
    name: manifest.name,
    industry: manifest.industry,
    version: manifest.version,
    designTokens,
    defaultSections,
    demoContent: resolvedContent,
  };
}

async function loadTemplateFromDisk(key) {
  const dir = path.join(TEMPLATES_ROOT, key);
  const manifestPath = path.join(dir, "template.json");
  const themePath = path.join(dir, "theme.json");
  const contentPath = path.join(dir, "content", "cs.json");
  if (!existsSync(manifestPath) || !existsSync(themePath)) return null;

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
  const theme = JSON.parse(await fs.readFile(themePath, "utf-8"));
  const content = existsSync(contentPath) ? JSON.parse(await fs.readFile(contentPath, "utf-8")) : {};
  return manifestToDefinition(manifest, theme, content);
}

async function main() {
  console.log(`[seed-all] DRY_RUN=${DRY_RUN} ${ONLY_KEY ? `only=${ONLY_KEY}` : "(all templates)"}`);

  const entries = await fs.readdir(TEMPLATES_ROOT, { withFileTypes: true });
  const keys = entries.filter((d) => d.isDirectory()).map((d) => d.name).filter((k) => !ONLY_KEY || k === ONLY_KEY);
  console.log(`[seed-all] scanning ${keys.length} template dirs`);

  let inserted = 0, updated = 0, skipped = 0, failed = 0;

  for (const key of keys) {
    let tpl;
    try { tpl = await loadTemplateFromDisk(key); }
    catch (err) { console.error(`  ✗ ${key}: load failed:`, err.message); failed++; continue; }
    if (!tpl) { console.log(`  ⚠ ${key}: missing manifest/theme — skip`); skipped++; continue; }

    if (DRY_RUN) {
      console.log(`  · ${key} v${tpl.version} (${tpl.defaultSections.length} sections)`);
      continue;
    }

    try {
      await pool.query("BEGIN");
      // Upsert template
      const tplRes = await pool.query(
        `INSERT INTO templates (key, name, industry, current_version, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, industry = EXCLUDED.industry, current_version = EXCLUDED.current_version, updated_at = now()
         RETURNING id, xmax = 0 AS inserted`,
        [tpl.key, tpl.name, tpl.industry, tpl.version]
      );
      const templateId = tplRes.rows[0].id;

      // Upsert version
      await pool.query(
        `INSERT INTO template_versions (template_id, version, default_sections, default_design_tokens, default_demo_content, published_at)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, now())
         ON CONFLICT (template_id, version) DO UPDATE SET
           default_sections = EXCLUDED.default_sections,
           default_design_tokens = EXCLUDED.default_design_tokens,
           default_demo_content = EXCLUDED.default_demo_content,
           published_at = now()`,
        [
          templateId,
          tpl.version,
          JSON.stringify(tpl.defaultSections),
          JSON.stringify(tpl.designTokens),
          JSON.stringify(tpl.demoContent),
        ]
      );
      await pool.query("COMMIT");
      if (tplRes.rows[0].inserted) { inserted++; console.log(`  + ${key} v${tpl.version} (inserted)`); }
      else                          { updated++;  console.log(`  ↻ ${key} v${tpl.version} (updated)`); }
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error(`  ✗ ${key}:`, err.message);
      failed++;
    }
  }

  console.log(`\n[seed-all] DONE. inserted=${inserted} updated=${updated} skipped=${skipped} failed=${failed}${DRY_RUN ? " (DRY-RUN)" : ""}`);
  await pool.end();
}

main().catch((e) => { console.error(e); pool.end(); process.exit(1); });
