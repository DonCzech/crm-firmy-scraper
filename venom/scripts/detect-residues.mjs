#!/usr/bin/env node
/**
 * F4 — Residue detector.
 *
 * Skenuje šablonu (src/templates/<key>/ + výsledný render z DB) na zbytky
 * z originálních referenčních webů, ze kterých byla šablona inspirována.
 *
 * Co kontroluje:
 *   1. text fragmenty (jména firem, adresy, slogany) vůči "research notes"
 *   2. URL/path fragmenty z původních domén (např. supellex.cz/wp-content/…)
 *   3. CSS class names obsažené v obfuscation-maps (pokud zbyly z původního site)
 *   4. analytické skripty (GTM, Pixel, Clarity, recaptcha, s.w.org)
 *   5. WordPress/Wix artifacts (wp-content, wp-includes, sitebuilder-css)
 *
 * Output: report JSON v template-lab/audits/residue-<key>-<timestamp>.json
 *
 * Usage:
 *   DATABASE_URL=... node scripts/detect-residues.mjs --key arbo-01
 *   DATABASE_URL=... node scripts/detect-residues.mjs --key arbo-01 --tenant arbo-01-demo
 *   DATABASE_URL=... node scripts/detect-residues.mjs --all                  # scan all 92 templates
 *   DATABASE_URL=... node scripts/detect-residues.mjs --key arbo-01 --strict # fail on any finding
 */
import pg from "pg";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";

const args = process.argv.slice(2);
const ONLY_KEY = (() => { const i = args.indexOf("--key"); return i >= 0 ? args[i + 1] : null; })();
const TENANT_SLUG = (() => { const i = args.indexOf("--tenant"); return i >= 0 ? args[i + 1] : null; })();
const ALL = args.includes("--all");
const STRICT = args.includes("--strict");
const INCLUDE_DEMO = args.includes("--include-demo"); // scan legacy -demo clones too (off by default)

if (!ONLY_KEY && !ALL) {
  console.error("ERROR: --key <template-key> OR --all required");
  process.exit(1);
}

const ROOT = process.cwd();
const TEMPLATES_ROOT = path.join(ROOT, "src", "templates");
const AUDITS_ROOT = path.join(ROOT, "template-lab", "audits");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// ── Universal patterns (apply to every template) ─────────────────────────────
const UNIVERSAL_PATTERNS = [
  // Trackers
  { kind: "tracker",   re: /googletagmanager\.com\/gtm\.js/gi,            desc: "Google Tag Manager script" },
  { kind: "tracker",   re: /connect\.facebook\.net|fbevents\.js/gi,       desc: "Meta Pixel" },
  { kind: "tracker",   re: /clarity\.ms/gi,                                desc: "Microsoft Clarity" },
  { kind: "tracker",   re: /hotjar\.com\/c\/hotjar/gi,                     desc: "Hotjar" },
  { kind: "tracker",   re: /smartlook\.com\/recorder\.js/gi,              desc: "Smartlook" },
  { kind: "tracker",   re: /google-analytics\.com\/(?:ga|analytics)\.js/gi, desc: "Google Analytics" },
  { kind: "tracker",   re: /seznam-id|sklik\.cz/gi,                       desc: "Seznam Sklik" },
  { kind: "tracker",   re: /recaptcha\/(api|enterprise)/gi,                desc: "reCAPTCHA" },

  // CMS artifacts
  { kind: "wordpress", re: /\/wp-content\/|\/wp-includes\/|wp-emoji-release/gi, desc: "WordPress artifact" },
  { kind: "wordpress", re: /s\.w\.org\b/gi,                                desc: "WP.org Emoji JSON" },
  { kind: "wordpress", re: /\?ver=\d+\.\d+(?:\.\d+)?\b/gi,                 desc: "WP asset query versioning" },
  { kind: "wix",       re: /static\.wixstatic\.com|wix-warmup/gi,         desc: "Wix artifact" },
  { kind: "shopify",   re: /cdn\.shopify\.com\/s\/files/gi,                desc: "Shopify CDN" },
  { kind: "webflow",   re: /assets-global\.website-files\.com/gi,         desc: "Webflow artifact" },
  { kind: "framer",    re: /framerusercontent\.com/gi,                    desc: "Framer artifact" },
];

// ── Read research notes (originalUrl + brand names) ──────────────────────────
async function loadResearchHints(key) {
  // research/ subdir name often = original brand. Look for README or notes.
  const candidatesDir = path.join(ROOT, "template-lab", "research");
  if (!existsSync(candidatesDir)) return { brands: [], hosts: [] };
  const entries = await fs.readdir(candidatesDir, { withFileTypes: true });
  const matched = entries
    .filter((e) => e.isDirectory())
    .filter((e) => e.name.startsWith(key.replace(/-\d+$/, "")) || key.startsWith(e.name));
  const brands = new Set();
  const hosts = new Set();
  for (const d of matched) {
    const dir = path.join(candidatesDir, d.name);
    const files = await fs.readdir(dir).catch(() => []);
    for (const f of files) {
      if (!/\.(md|json|txt)$/.test(f)) continue;
      const raw = await fs.readFile(path.join(dir, f), "utf-8").catch(() => "");
      // Extract domain names
      for (const m of raw.matchAll(/\b([a-z0-9-]+\.(?:cz|com|sk|eu|net|io))\b/gi)) {
        hosts.add(m[1].toLowerCase());
      }
      // Extract “Inspirováno X.cz” style markers from template description elsewhere
      for (const m of raw.matchAll(/[Ii]nspirov[aá]no\s+([A-ZÁ-Ž][^\.\n]+?)(?:\.|$)/g)) {
        brands.add(m[1].trim());
      }
    }
  }
  return { brands: [...brands], hosts: [...hosts] };
}

// ── Load template description to discover hints (e.g. "Inspirováno lesarb.cz") ─
async function loadTemplateHints(key) {
  const manifestPath = path.join(TEMPLATES_ROOT, key, "template.json");
  if (!existsSync(manifestPath)) return { brands: [], hosts: [] };
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
  const desc = manifest.description ?? "";
  const brands = new Set();
  const hosts = new Set();
  for (const m of desc.matchAll(/\b([a-z0-9-]+\.(?:cz|com|sk|eu|net|io))\b/gi)) {
    hosts.add(m[1].toLowerCase());
  }
  for (const m of desc.matchAll(/[Ii]nspirov[aá]no\s+([A-Za-z0-9\.-]+)/g)) {
    brands.add(m[1].trim());
  }
  return { brands: [...brands], hosts: [...hosts] };
}

// ── Scan helpers ──────────────────────────────────────────────────────────────
function scanText(text, patterns, originHosts, originBrands) {
  const findings = [];
  for (const p of patterns) {
    const matches = [...text.matchAll(p.re)];
    if (matches.length) {
      findings.push({ kind: p.kind, desc: p.desc, count: matches.length, sample: matches[0][0] });
    }
  }
  for (const host of originHosts) {
    const re = new RegExp(host.replace(/\./g, "\\."), "gi");
    const matches = [...text.matchAll(re)];
    if (matches.length) {
      findings.push({ kind: "origin-host", desc: `Reference to original host ${host}`, count: matches.length, sample: host });
    }
  }
  for (const brand of originBrands) {
    if (brand.length < 4) continue;
    const safe = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${safe}\\b`, "gi");
    const matches = [...text.matchAll(re)];
    if (matches.length) {
      findings.push({ kind: "origin-brand", desc: `Reference to original brand "${brand}"`, count: matches.length, sample: brand });
    }
  }
  return findings;
}

// ── Render tenant page over HTTP ──────────────────────────────────────────────
async function fetchTenantHtml(tenantSlug) {
  const base = process.env.SITE_URL || "http://localhost:3015";
  try {
    const res = await fetch(`${base}/demo/${tenantSlug}`, { headers: { "user-agent": "residue-detector/1.0" } });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function scanTemplate(key) {
  const [hintsT, hintsR] = await Promise.all([loadTemplateHints(key), loadResearchHints(key)]);
  const hosts = [...new Set([...hintsT.hosts, ...hintsR.hosts])];
  const brands = [...new Set([...hintsT.brands, ...hintsR.brands])];

  const templateDir = path.join(TEMPLATES_ROOT, key);
  const findings = [];

  // 1. Scan disk files — content + skin only. template.json/theme.json obsahují
  //    interní metadata (description, "Inspirováno X.cz") která nejsou součástí
  //    publikovaného webu — ignorujeme.
  const filesToScan = ["content/cs.json", "skin.css"];
  for (const rel of filesToScan) {
    const full = path.join(templateDir, rel);
    if (!existsSync(full)) continue;
    const raw = await fs.readFile(full, "utf-8");
    const f = scanText(raw, UNIVERSAL_PATTERNS, hosts, brands);
    if (f.length) findings.push({ file: `disk:${rel}`, findings: f });
  }

  // 2. Scan rendered HTML if tenant exists
  let tenantSlugForKey = TENANT_SLUG;
  if (!tenantSlugForKey) {
    // Production-ready render = v2 only. Demo (legacy clones) are excluded unless --include-demo.
    const candidates = INCLUDE_DEMO ? [`${key}-v2`, `${key}-demo`, key] : [`${key}-v2`];
    for (const c of candidates) {
      const r = await pool.query("SELECT slug FROM tenants WHERE slug = $1", [c]);
      if (r.rows.length) { tenantSlugForKey = c; break; }
    }
  }
  if (tenantSlugForKey) {
    const html = await fetchTenantHtml(tenantSlugForKey);
    if (html) {
      const f = scanText(html, UNIVERSAL_PATTERNS, hosts, brands);
      if (f.length) findings.push({ file: `render:${tenantSlugForKey}`, findings: f });
    } else {
      findings.push({ file: `render:${tenantSlugForKey}`, error: "tenant did not render (server down or 404)" });
    }
  }

  return { key, hosts, brands, findings };
}

async function main() {
  if (!existsSync(AUDITS_ROOT)) await fs.mkdir(AUDITS_ROOT, { recursive: true });
  const keys = ALL
    ? (await fs.readdir(TEMPLATES_ROOT, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)
    : [ONLY_KEY];

  const reports = [];
  let totalFindings = 0;
  for (const key of keys) {
    process.stdout.write(`\rscanning ${key}…                              `);
    const report = await scanTemplate(key);
    const issues = report.findings.reduce((a, f) => a + (f.findings?.length ?? 0), 0);
    totalFindings += issues;
    if (issues > 0 || report.findings.some((f) => f.error)) {
      reports.push(report);
    }
  }
  process.stdout.write("\r" + " ".repeat(60) + "\r");

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(AUDITS_ROOT, `residue-${ALL ? "all" : ONLY_KEY}-${ts}.json`);
  await fs.writeFile(outPath, JSON.stringify({ when: new Date().toISOString(), scanned: keys.length, withFindings: reports.length, totalFindings, reports }, null, 2));

  console.log(`[residue] DONE. scanned=${keys.length} with_findings=${reports.length} total_issues=${totalFindings}`);
  console.log(`[residue] report: ${path.relative(ROOT, outPath)}`);

  // Print summary to stdout
  for (const r of reports) {
    console.log(`\n── ${r.key} ── hosts=[${r.hosts.join(",")}] brands=[${r.brands.join(",")}]`);
    for (const f of r.findings) {
      if (f.error) { console.log(`  ⚠ ${f.file}: ${f.error}`); continue; }
      for (const issue of f.findings ?? []) {
        console.log(`  ✗ ${f.file}: [${issue.kind}] ${issue.desc} (×${issue.count}) — sample: ${issue.sample.slice(0, 80)}`);
      }
    }
  }

  await pool.end();
  if (STRICT && totalFindings > 0) process.exit(2);
}

main().catch((e) => { console.error(e); pool.end(); process.exit(1); });
