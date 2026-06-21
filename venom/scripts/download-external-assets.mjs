#!/usr/bin/env node
/**
 * F4 (extension) — Download external assets referenced by templates.
 *
 * Scans content/cs.json for external URLs (http(s)://...) and downloads them
 * to /public/assets/<key>/<hash>-<basename>, then rewrites references.
 *
 * Skips:
 *   - data: URLs
 *   - URLs already on our own host (relative paths or NEXT_PUBLIC_BASE_URL)
 *   - already downloaded (hash match)
 *
 * Usage:
 *   node scripts/download-external-assets.mjs --key solar-02 --dry-run
 *   node scripts/download-external-assets.mjs --key video-01
 *   node scripts/download-external-assets.mjs --all
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

// External URL pattern (http or https) — stops at quote char only, allowing spaces in path
const EXTERNAL_URL_RE = /https?:\/\/[^"']+?\.(?:jpe?g|png|gif|webp|svg|mp4|webm|mov|m4v|woff2?|ttf|otf)/gi;

// Skip our own hosts
const SKIP_HOSTS = [
  "localhost",
  "127.0.0.1",
  "webero.co",
  "venom-saas.vercel.app",
  ...((process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/^https?:\/\//, "").split("/")[0]
    ? [process.env.NEXT_PUBLIC_BASE_URL.replace(/^https?:\/\//, "").split("/")[0]]
    : []),
];

function hashOf(s) {
  return createHash("sha1").update(s).digest("hex").slice(0, 10);
}

function shouldSkip(url) {
  try {
    const u = new URL(url);
    return SKIP_HOSTS.some((h) => u.hostname.endsWith(h));
  } catch { return true; }
}

async function downloadOne(url, templateKey) {
  const ext = path.extname(new URL(url).pathname).toLowerCase().slice(1) || "bin";
  const base = path.basename(new URL(url).pathname).split("?")[0] || `asset.${ext}`;
  const targetName = `${hashOf(url)}-${base}`;
  const targetRel = `/assets/${templateKey}/${targetName}`;
  const targetAbs = path.join(ASSETS_ROOT, templateKey, targetName);

  if (existsSync(targetAbs)) return { ok: true, targetRel, skipped: "already-downloaded" };
  if (DRY_RUN)               return { ok: true, targetRel, dryrun: true };

  await fs.mkdir(path.dirname(targetAbs), { recursive: true });
  try {
    const res = await fetch(url, { headers: { "user-agent": "venom-asset-downloader/1.0" } });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(targetAbs, buf);
    return { ok: true, targetRel, size: buf.length };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

async function processTemplate(key) {
  const contentPath = path.join(TEMPLATES_ROOT, key, "content", "cs.json");
  if (!existsSync(contentPath)) return { key, downloaded: 0, skipped: 0, failed: 0 };

  let raw = await fs.readFile(contentPath, "utf-8");
  const urls = new Set();
  for (const m of raw.matchAll(EXTERNAL_URL_RE)) {
    if (!shouldSkip(m[0])) urls.add(m[0]);
  }
  if (urls.size === 0) return { key, downloaded: 0, skipped: 0, failed: 0 };

  const rewriteMap = new Map();
  let downloaded = 0, failed = 0;
  for (const url of urls) {
    const r = await downloadOne(url, key);
    if (!r.ok) {
      console.log(`    ✗ ${url.slice(0, 80)}: ${r.reason}`);
      failed++;
      continue;
    }
    if (r.skipped) {
      // Already on disk — still rewrite reference in JSON if not done
      rewriteMap.set(url, r.targetRel);
    } else {
      rewriteMap.set(url, r.targetRel);
      downloaded++;
      const sizeKb = r.size ? Math.round(r.size / 1024) : "?";
      console.log(`    ↓ ${url.slice(0, 70)} → ${r.targetRel} (${sizeKb} KB)`);
    }
  }

  if (rewriteMap.size === 0) return { key, downloaded, skipped: 0, failed };

  let next = raw;
  for (const [oldUrl, newUrl] of rewriteMap) {
    next = next.split(oldUrl).join(newUrl);
  }

  if (!DRY_RUN && next !== raw) {
    await fs.writeFile(contentPath, next);
  }

  console.log(`  ${DRY_RUN ? "[DRY]" : "✓"} ${key}: ${downloaded} downloaded, ${rewriteMap.size} URL rewrites, ${failed} failed`);
  return { key, downloaded, skipped: 0, failed };
}

async function main() {
  let keys;
  if (ALL) {
    keys = (await fs.readdir(TEMPLATES_ROOT, { withFileTypes: true }))
      .filter((d) => d.isDirectory()).map((d) => d.name);
  } else {
    keys = [ONLY_KEY];
  }
  console.log(`[download-external] DRY_RUN=${DRY_RUN} templates=${keys.length}`);

  let totalDownloaded = 0, totalFailed = 0;
  for (const key of keys) {
    const r = await processTemplate(key);
    totalDownloaded += r.downloaded;
    totalFailed += r.failed;
  }
  console.log(`\n[download-external] DONE. downloaded=${totalDownloaded} failed=${totalFailed}${DRY_RUN ? " (DRY-RUN)" : ""}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
