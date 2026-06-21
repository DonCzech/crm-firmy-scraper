#!/usr/bin/env node
/**
 * F4 — pre-commit gate for residue regression.
 *
 * Runs only on staged venom/src/templates/<key>/content/cs.json + skin.css files.
 * If any staged file introduces residue patterns (wp-content, wixstatic,
 * shopify, external origin hosts), exits non-zero and lists offenders.
 *
 * Wire-up:
 *   ln -s ../../venom/scripts/precommit-residue-check.mjs .git/hooks/pre-commit
 *   chmod +x .git/hooks/pre-commit
 * or via husky/lefthook in package.json.
 *
 * Bypass (use sparingly):
 *   SKIP_RESIDUE_CHECK=1 git commit ...
 */
import { execSync } from "child_process";
import { promises as fs } from "fs";
import { existsSync } from "fs";
import path from "path";

if (process.env.SKIP_RESIDUE_CHECK === "1") {
  console.log("[precommit-residue] SKIP_RESIDUE_CHECK=1 set — bypassing check");
  process.exit(0);
}

const PATTERNS = [
  { name: "wordpress", re: /\/wp-content\/|\/wp-includes\//gi },
  { name: "wixstatic", re: /static\.wixstatic\.com/gi },
  { name: "shopify",   re: /cdn\.shopify\.com\/s\/files/gi },
  { name: "webflow",   re: /assets-global\.website-files\.com/gi },
  { name: "framer",    re: /framerusercontent\.com/gi },
  { name: "wp-emoji",  re: /s\.w\.org\b/gi },
  { name: "clones",    re: /\/clones\/[a-z0-9-]+\//gi },
];

let staged = "";
try {
  staged = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf-8" });
} catch (err) {
  console.error("[precommit-residue] git command failed:", err.message);
  process.exit(0);
}

const files = staged
  .split("\n")
  .filter((p) => p.startsWith("venom/src/templates/"))
  .filter((p) => p.endsWith("/content/cs.json") || p.endsWith("/skin.css"));

if (files.length === 0) {
  process.exit(0);
}

const repoRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
let totalFindings = 0;
const findings = [];

for (const rel of files) {
  const abs = path.join(repoRoot, rel);
  if (!existsSync(abs)) continue;
  const raw = await fs.readFile(abs, "utf-8");
  for (const p of PATTERNS) {
    const matches = [...raw.matchAll(p.re)];
    if (matches.length > 0) {
      findings.push({ file: rel, pattern: p.name, count: matches.length, sample: matches[0][0] });
      totalFindings += matches.length;
    }
  }
}

if (findings.length === 0) {
  process.exit(0);
}

console.error("");
console.error("✗ Residue check FAILED — staged template files reference external sources:");
console.error("");
for (const f of findings) {
  console.error(`  ${f.file}`);
  console.error(`    [${f.pattern}] ${f.count}× — sample: ${f.sample.slice(0, 80)}`);
}
console.error("");
console.error("Fix:");
console.error("  - Local /clones/ paths:    node venom/scripts/cleanup-residues.mjs --key <key>");
console.error("  - External CDN URLs:       node venom/scripts/download-external-assets.mjs --key <key>");
console.error("  - Then: node venom/scripts/seed-all-templates.mjs --key <key>");
console.error("");
console.error("Bypass (use sparingly):  SKIP_RESIDUE_CHECK=1 git commit ...");
console.error("");
process.exit(1);
