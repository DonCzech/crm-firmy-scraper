/**
 * Auto-fix toolkit — orchestrates the residue cleanup + external CDN download +
 * template re-seed + stale override clearing for a single template.
 *
 * Used by /api/admin/template-queue/[key]/auto-fix and run in batch from
 * /api/admin/template-queue/auto-fix-batch.
 *
 * Each step is idempotent and safe to re-run.
 */
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";
import { createHash } from "crypto";
import { query, queryOne, withTransaction } from "./db";
import { loadTemplate } from "./templates/loader";
import { invalidateTemplateCache } from "./section-resolver";

const PUBLIC_ROOT = path.join(process.cwd(), "public");
const TEMPLATES_ROOT = path.join(process.cwd(), "src", "templates");
const ASSETS_ROOT = path.join(PUBLIC_ROOT, "assets");

const LOCAL_CLONE_PATTERNS = [
  /\/clones\/[a-z0-9-]+\/wp-content\/[^"'\s)]+/gi,
  /\/clones\/[a-z0-9-]+\/wp-includes\/[^"'\s)]+/gi,
  /\/clones\/[a-z0-9-]+\/[^"'\s)]+\.(?:woff2?|ttf|otf|eot)/gi,
  /\/clones\/[a-z0-9-]+\/[^"'\s)]+\.(?:jpe?g|png|webp|svg|gif|mp4|webm|mov)/gi,
];

const EXTERNAL_URL_RE = /https?:\/\/[^"']+?\.(?:jpe?g|png|gif|webp|svg|mp4|webm|mov|m4v|woff2?|ttf|otf)/gi;
const SKIP_HOSTS = ["localhost", "127.0.0.1", "webero.co", "webero.co"];

export interface AutoFixSummary {
  key: string;
  startedAt: string;
  finishedAt: string;
  steps: {
    cleanedLocalUrls: number;
    downloadedExternalAssets: number;
    skippedExternal: string[];
    missingSourceFiles: string[];
    reseed: { inserted: boolean; updated: boolean; skipped: boolean };
    clearedStaleOverrides: number;
  };
  error?: string;
}

function hashOf(p: string): string {
  return createHash("sha1").update(p).digest("hex").slice(0, 10);
}

function shouldSkipExternal(url: string): boolean {
  try {
    const u = new URL(url);
    return SKIP_HOSTS.some((h) => u.hostname.endsWith(h));
  } catch { return true; }
}

async function readIfExists(p: string): Promise<string | null> {
  if (!existsSync(p)) return null;
  return fs.readFile(p, "utf-8");
}

async function writeFileSafe(p: string, content: string): Promise<void> {
  await fs.writeFile(p, content);
}

async function copyLocalAsset(srcUrlPath: string, templateKey: string): Promise<string | null> {
  const decoded = decodeURI(srcUrlPath.split("?")[0]);
  const srcAbs = path.join(PUBLIC_ROOT, decoded.replace(/^\//, ""));
  if (!existsSync(srcAbs)) return null;
  const baseName = path.basename(decoded);
  const targetName = `${hashOf(decoded)}-${baseName}`;
  const targetAbs = path.join(ASSETS_ROOT, templateKey, targetName);
  if (!existsSync(targetAbs)) {
    await fs.mkdir(path.dirname(targetAbs), { recursive: true });
    await fs.copyFile(srcAbs, targetAbs);
  }
  return `/assets/${templateKey}/${targetName}`;
}

async function downloadExternalAsset(url: string, templateKey: string): Promise<{ targetRel: string; downloaded: boolean } | null> {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).toLowerCase().slice(1) || "bin";
    const base = path.basename(parsed.pathname).split("?")[0] || `asset.${ext}`;
    const targetName = `${hashOf(url)}-${base}`;
    const targetAbs = path.join(ASSETS_ROOT, templateKey, targetName);
    const targetRel = `/assets/${templateKey}/${targetName}`;
    if (existsSync(targetAbs)) return { targetRel, downloaded: false };

    const res = await fetch(url, { headers: { "user-agent": "webero-auto-fix/1.0" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(path.dirname(targetAbs), { recursive: true });
    await fs.writeFile(targetAbs, buf);
    return { targetRel, downloaded: true };
  } catch {
    return null;
  }
}

async function processFileForResidues(filePath: string, templateKey: string, summary: AutoFixSummary["steps"]) {
  const raw = await readIfExists(filePath);
  if (raw === null) return;
  let next = raw;
  const rewrites = new Map<string, string>();

  // 1. Local /clones/ → /assets/
  for (const pat of LOCAL_CLONE_PATTERNS) {
    const matches = new Set<string>();
    for (const m of next.matchAll(pat)) matches.add(m[0]);
    for (const old of matches) {
      const replacement = await copyLocalAsset(old, templateKey);
      if (!replacement) {
        summary.missingSourceFiles.push(old);
        continue;
      }
      rewrites.set(old, replacement);
    }
  }

  // 2. External CDN → /assets/
  const extMatches = new Set<string>();
  for (const m of next.matchAll(EXTERNAL_URL_RE)) {
    if (!shouldSkipExternal(m[0])) extMatches.add(m[0]);
  }
  for (const url of extMatches) {
    const result = await downloadExternalAsset(url, templateKey);
    if (!result) {
      summary.skippedExternal.push(url);
      continue;
    }
    if (result.downloaded) summary.downloadedExternalAssets++;
    rewrites.set(url, result.targetRel);
  }

  // 3. Apply rewrites
  for (const [oldUrl, newUrl] of rewrites) next = next.split(oldUrl).join(newUrl);
  if (next !== raw) {
    await writeFileSafe(filePath, next);
    summary.cleanedLocalUrls += rewrites.size;
  }
}

async function reseedTemplate(templateKey: string, summary: AutoFixSummary["steps"]): Promise<void> {
  const tpl = await loadTemplate(templateKey).catch(() => null);
  if (!tpl) return;
  const checksum = createHash("sha256").update(JSON.stringify({
    sections: tpl.defaultSections,
    tokens: tpl.designTokens,
    demo: tpl.demoContent,
  })).digest("hex");

  const tplRow = await queryOne<{ id: number; current_version: string }>(
    "SELECT id, current_version FROM templates WHERE key = $1", [templateKey]
  );

  if (tplRow) {
    const existing = await queryOne<{ checksum: string | null }>(
      "SELECT checksum FROM template_versions WHERE template_id = $1 AND version = $2",
      [tplRow.id, tplRow.current_version]
    );
    if (existing?.checksum === checksum) {
      summary.reseed.skipped = true;
      return;
    }
  }

  await withTransaction(async (client) => {
    const tplRes = await client.query<{ id: number; inserted: boolean }>(
      `INSERT INTO templates (key, name, industry, current_version, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (key) DO UPDATE SET
         name = EXCLUDED.name, industry = EXCLUDED.industry,
         current_version = EXCLUDED.current_version, updated_at = now()
       RETURNING id, xmax = 0 AS inserted`,
      [tpl.key, tpl.name, tpl.industry, tpl.version]
    );
    const tid = tplRes.rows[0].id;

    await client.query(
      `INSERT INTO template_versions (template_id, version, default_sections, default_design_tokens, default_demo_content, checksum, published_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, now())
       ON CONFLICT (template_id, version) DO UPDATE SET
         default_sections = EXCLUDED.default_sections,
         default_design_tokens = EXCLUDED.default_design_tokens,
         default_demo_content = EXCLUDED.default_demo_content,
         checksum = EXCLUDED.checksum,
         published_at = now()`,
      [
        tid, tpl.version,
        JSON.stringify(tpl.defaultSections),
        JSON.stringify(tpl.designTokens),
        JSON.stringify(tpl.demoContent),
        checksum,
      ]
    );
    if (tplRes.rows[0].inserted) summary.reseed.inserted = true;
    else summary.reseed.updated = true;
  });

  invalidateTemplateCache(templateKey);
}

async function clearStaleOverrides(templateKey: string, summary: AutoFixSummary["steps"]): Promise<void> {
  const tplRow = await queryOne<{ id: number }>("SELECT id FROM templates WHERE key = $1", [templateKey]);
  if (!tplRow) return;
  const res = await query(
    `UPDATE sections
        SET content_overrides = '{}'::jsonb, updated_at = now()
      WHERE content_source = 'v2'
        AND tenant_id IN (SELECT id FROM tenants WHERE template_id = $1)
        AND (content_overrides::text LIKE '%/wp-content/%'
          OR content_overrides::text LIKE '%/clones/%'
          OR content_overrides::text LIKE '%wixstatic.com%'
          OR content_overrides::text LIKE '%cdn.shopify.com%')`,
    [tplRow.id]
  );
  summary.clearedStaleOverrides = res.length;
}

export async function autoFixTemplate(templateKey: string): Promise<AutoFixSummary> {
  const summary: AutoFixSummary = {
    key: templateKey,
    startedAt: new Date().toISOString(),
    finishedAt: "",
    steps: {
      cleanedLocalUrls: 0,
      downloadedExternalAssets: 0,
      skippedExternal: [],
      missingSourceFiles: [],
      reseed: { inserted: false, updated: false, skipped: false },
      clearedStaleOverrides: 0,
    },
  };

  try {
    const contentPath = path.join(TEMPLATES_ROOT, templateKey, "content", "cs.json");
    const skinPath = path.join(TEMPLATES_ROOT, templateKey, "skin.css");
    await processFileForResidues(contentPath, templateKey, summary.steps);
    await processFileForResidues(skinPath, templateKey, summary.steps);
    await reseedTemplate(templateKey, summary.steps);
    await clearStaleOverrides(templateKey, summary.steps);
  } catch (err) {
    summary.error = err instanceof Error ? err.message : String(err);
  }

  summary.finishedAt = new Date().toISOString();
  return summary;
}
