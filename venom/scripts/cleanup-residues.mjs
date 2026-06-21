#!/usr/bin/env node
/**
 * F4 — Residue cleanup helper.
 *
 * Pro každý nalezený `wp-content/uploads/...` (a podobné CMS artifact paths) v
 * content/cs.json šablony:
 *   1. Najde fyzický soubor v /public/clones/<x>/wp-content/uploads/...
 *   2. Zkopíruje do /public/assets/<template-key>/<hash>-<basename>
 *   3. Přepíše JSON reference na novou cestu (žádné wp-content nikde)
 *
 * Zachovává hash basename pro deduplikaci a stabilní URL.
 *
 * Bezpečnost: kopíruje (nemaže) — staré soubory zůstávají na disku dokud nepotvrdíš.
 *
 * Usage:
 *   node scripts/cleanup-residues.mjs --key dental-01 --dry-run
 *   node scripts/cleanup-residues.mjs --key dental-01
 *   node scripts/cleanup-residues.mjs --all                # všechny šablony s residui
 */
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";
import { createHash } from "crypto";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ALL = args.includes("--all");
const ONLY_KEY = (() => { const i = args.indexOf("--key"); return i >= 0 ? args[i + 1] : null; })();

if (!ONLY_KEY && !ALL) {
  console.error("ERROR: --key <template-key> OR --all required");
  process.exit(1);
}

const ROOT = process.cwd();
const TEMPLATES_ROOT = path.join(ROOT, "src", "templates");
const PUBLIC_ROOT = path.join(ROOT, "public");
const ASSETS_ROOT = path.join(PUBLIC_ROOT, "assets");

// Patterns to rewrite. Order matters — more specific first.
const RESIDUE_PATTERNS = [
  /\/clones\/[a-z0-9-]+\/wp-content\/[^"'\s)]+/gi,   // WP uploads, themes, plugins
  /\/clones\/[a-z0-9-]+\/wp-includes\/[^"'\s)]+/gi,
  /\/clones\/[a-z0-9-]+\/[^"'\s)]+\.(?:woff2?|ttf|otf|eot)/gi, // font files in any subdir
  /\/clones\/[a-z0-9-]+\/[^"'\s)]+\.(?:jpe?g|png|webp|svg|gif|mp4|webm|mov)/gi, // any image/video
  /https?:\/\/static\.wixstatic\.com\/[^"'\s)]+/gi,
  /https?:\/\/cdn\.shopify\.com\/s\/files\/[^"'\s)]+/gi,
];

function hashOf(p) {
  return createHash("sha1").update(p).digest("hex").slice(0, 10);
}

async function copyAsset(srcUrlPath, templateKey) {
  // Map URL path → filesystem path
  const decoded = decodeURI(srcUrlPath.split("?")[0]); // strip query string
  const srcAbs = path.join(PUBLIC_ROOT, decoded.replace(/^\//, ""));
  const baseName = path.basename(decoded);
  const targetName = `${hashOf(decoded)}-${baseName}`;
  const targetRel = `/assets/${templateKey}/${targetName}`;
  const targetAbs = path.join(ASSETS_ROOT, templateKey, targetName);

  if (!existsSync(srcAbs)) return { ok: false, reason: "source file missing", srcAbs, targetRel };

  if (DRY_RUN) return { ok: true, dryrun: true, srcAbs, targetRel };

  await fs.mkdir(path.dirname(targetAbs), { recursive: true });
  if (!existsSync(targetAbs)) {
    await fs.copyFile(srcAbs, targetAbs);
  }
  return { ok: true, srcAbs, targetRel };
}

async function processFile(filePath, key) {
  if (!existsSync(filePath)) return { rewrites: 0, missing: 0 };
  let raw = await fs.readFile(filePath, "utf-8");
  const rewriteMap = new Map();
  let missing = 0;
  for (const pattern of RESIDUE_PATTERNS) {
    const matches = new Set();
    for (const m of raw.matchAll(pattern)) matches.add(m[0]);
    for (const oldUrl of matches) {
      if (!oldUrl.startsWith("/clones/")) continue;
      const result = await copyAsset(oldUrl, key);
      if (!result.ok) { missing++; continue; }
      rewriteMap.set(oldUrl, result.targetRel);
    }
  }
  if (rewriteMap.size === 0) return { rewrites: 0, missing };
  let next = raw;
  for (const [oldUrl, newUrl] of rewriteMap) next = next.split(oldUrl).join(newUrl);
  if (!DRY_RUN && next !== raw) await fs.writeFile(filePath, next);
  return { rewrites: rewriteMap.size, missing };
}

async function processTemplate(key) {
  const contentPath = path.join(TEMPLATES_ROOT, key, "content", "cs.json");
  const skinPath = path.join(TEMPLATES_ROOT, key, "skin.css");
  if (!existsSync(contentPath)) {
    console.log(`  ⚠ ${key}: no content/cs.json — skip`);
    return { key, rewrites: 0, copied: 0, missing: 0 };
  }

  // Also process skin.css (font URLs, background-image)
  const skinResult = await processFile(skinPath, key);
  if (skinResult.rewrites > 0) {
    console.log(`  ${DRY_RUN ? "[DRY] " : "✓ "}${key}/skin.css: ${skinResult.rewrites} URLs rewritten`);
  }

  let raw = await fs.readFile(contentPath, "utf-8");
  const rewriteMap = new Map(); // oldUrl → newUrl
  let missing = 0;

  for (const pattern of RESIDUE_PATTERNS) {
    const matches = new Set();
    for (const m of raw.matchAll(pattern)) matches.add(m[0]);

    for (const oldUrl of matches) {
      // Only handle local-ish /clones/... paths for now. External CDN paths
      // (wixstatic, shopify) we report — manual download needed.
      if (!oldUrl.startsWith("/clones/")) {
        console.log(`  ⚠ external CDN path (manual download required): ${oldUrl.slice(0, 80)}`);
        continue;
      }
      const result = await copyAsset(oldUrl, key);
      if (!result.ok) {
        missing++;
        console.log(`    ✗ ${result.reason}: ${oldUrl.slice(0, 100)}`);
        continue;
      }
      rewriteMap.set(oldUrl, result.targetRel);
    }
  }

  if (rewriteMap.size === 0) {
    console.log(`  · ${key}: no rewritable residues found`);
    return { key, rewrites: 0, copied: 0, missing };
  }

  // Apply rewrites
  let next = raw;
  for (const [oldUrl, newUrl] of rewriteMap) {
    // Word-boundary not safe with URL chars — do straight replace.
    next = next.split(oldUrl).join(newUrl);
  }

  if (!DRY_RUN && next !== raw) {
    await fs.writeFile(contentPath, next);
  }

  console.log(`  ${DRY_RUN ? "[DRY] " : "✓ "}${key}: ${rewriteMap.size} URLs rewritten, ${missing} missing source files`);
  return { key, rewrites: rewriteMap.size, copied: rewriteMap.size, missing };
}

async function main() {
  console.log(`[cleanup-residues] DRY_RUN=${DRY_RUN} ${ALL ? "(all templates)" : `key=${ONLY_KEY}`}`);

  let keys;
  if (ALL) {
    // Scan ALL templates — cleanup is idempotent and a no-op if no /clones/ residue exists.
    keys = (await fs.readdir(TEMPLATES_ROOT, { withFileTypes: true }))
      .filter((d) => d.isDirectory()).map((d) => d.name);
    console.log(`Scanning ${keys.length} templates on disk`);
  } else {
    keys = [ONLY_KEY];
  }

  let totalRewrites = 0, totalMissing = 0;
  for (const key of keys) {
    const r = await processTemplate(key);
    totalRewrites += r.rewrites;
    totalMissing += r.missing;
  }

  console.log(`\n[cleanup-residues] DONE. templates=${keys.length} rewrites=${totalRewrites} missing_sources=${totalMissing}${DRY_RUN ? " (DRY-RUN)" : ""}`);
  if (!DRY_RUN && totalRewrites > 0) {
    console.log("Next: re-run scripts/seed-all-templates.mjs to push rewritten content to template_versions.");
    console.log("Then: scripts/detect-residues.mjs --all to verify zero remaining residues.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
