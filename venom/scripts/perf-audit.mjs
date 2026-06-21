#!/usr/bin/env node
/**
 * F3 — lightweight page performance audit (no lighthouse required).
 *
 * Fetches a URL + parses the HTML for the metrics that matter most for
 * Core Web Vitals and SEO:
 *
 *   - HTML size + response time
 *   - inline <style> / <script> bytes
 *   - <img> count + loading="lazy" coverage
 *   - <link rel="preload"> / <link rel="preconnect"> count
 *   - JSON-LD <script type="application/ld+json"> count + @type
 *   - <meta property="og:..."> presence
 *   - <meta name="viewport" / description> presence
 *   - <h1> count (should be 1)
 *   - Cache-Control, Content-Encoding, security headers
 *
 * Score is heuristic (0–100), not lighthouse-accurate. Use for quick CI
 * gates or regression detection per template.
 *
 * Usage:
 *   node scripts/perf-audit.mjs http://localhost:3015/demo/floors-01-v2
 *   node scripts/perf-audit.mjs --json https://webero.co/demo/foo
 *   node scripts/perf-audit.mjs --tenants floors-01-v2,arbo-01-v2  # batch
 */
const args = process.argv.slice(2);
const JSON_OUT = args.includes("--json");
const TENANTS = (() => { const i = args.indexOf("--tenants"); return i >= 0 ? args[i + 1].split(",") : null; })();
const URLS = args.filter((a) => a.startsWith("http"));

const BASE = process.env.SITE_URL ?? "http://localhost:3015";
const targets = TENANTS
  ? TENANTS.map((slug) => `${BASE}/demo/${slug}`)
  : URLS.length > 0 ? URLS : [`${BASE}/demo/floors-01-v2`];

const RESULTS = [];

async function audit(url) {
  const t0 = Date.now();
  let res, html = "";
  try {
    res = await fetch(url, { headers: { "user-agent": "venom-perf-audit/1.0" } });
    html = await res.text();
  } catch (err) {
    return { url, error: err.message };
  }
  const elapsed = Date.now() - t0;

  const headers = Object.fromEntries(res.headers.entries());
  const bytes = Buffer.byteLength(html, "utf-8");

  // Parse
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const inlineCss = styles.reduce((a, m) => a + m[1].length, 0);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  const inlineJs = scripts.reduce((a, m) => a + m[1].length, 0);
  const extScripts = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/gi)].length;
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  const lazyImgs = imgs.filter((m) => /\bloading=["']?lazy/.test(m[0])).length;
  const preloads = [...html.matchAll(/<link[^>]*rel=["']?preload/gi)].length;
  const preconnects = [...html.matchAll(/<link[^>]*rel=["']?preconnect/gi)].length;
  const jsonLd = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonLdTypes = jsonLd
    .map((m) => { try { return JSON.parse(m[1].trim())["@type"]; } catch { return null; } })
    .filter(Boolean);
  const ogTags = [...html.matchAll(/<meta[^>]*property=["']og:[^"']+["']/gi)].length;
  const twitter = [...html.matchAll(/<meta[^>]*name=["']twitter:[^"']+["']/gi)].length;
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  const hasDescription = /<meta[^>]*name=["']description["']/i.test(html);
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  // Inline <link> font preloads OR HTTP Link header (Next.js puts them in headers by default)
  const fontsInline = [...html.matchAll(/<link[^>]*\.woff2?[^>]*>/gi)].length;
  const linkHeader = headers["link"] ?? "";
  const fontsHeader = [...linkHeader.matchAll(/\.woff2?/gi)].length;
  const fonts = fontsInline + fontsHeader;

  // Scoring (heuristic)
  let score = 100;
  const issues = [];
  if (bytes > 150_000)          { score -= 10; issues.push(`HTML > 150 KB (${Math.round(bytes/1024)} KB)`); }
  if (inlineCss > 30_000)       { score -= 8;  issues.push(`Inline CSS > 30 KB (${Math.round(inlineCss/1024)} KB)`); }
  if (inlineJs > 100_000)       { score -= 8;  issues.push(`Inline JS > 100 KB (${Math.round(inlineJs/1024)} KB)`); }
  if (elapsed > 1500)           { score -= 10; issues.push(`Response time > 1.5s (${elapsed}ms)`); }
  // Allow first 2 images to be eager (hero/navbar logo). Aim for ≥80% lazy on the rest.
  const eligibleImgs = Math.max(0, imgs.length - 2);
  if (eligibleImgs > 0 && lazyImgs / eligibleImgs < 0.7) {
    score -= 6;
    issues.push(`${lazyImgs}/${imgs.length} <img> have loading=lazy (cíl: ${imgs.length - 2} po hero)`);
  }
  if (h1Count !== 1)            { score -= 6;  issues.push(`<h1> count = ${h1Count} (should be 1)`); }
  if (!hasViewport)             { score -= 8;  issues.push("Missing <meta viewport>"); }
  if (!hasDescription)          { score -= 4;  issues.push("Missing <meta description>"); }
  if (ogTags < 4)               { score -= 4;  issues.push(`Only ${ogTags} OG tags (need title/description/url/image min)`); }
  if (jsonLd.length === 0)      { score -= 6;  issues.push("No JSON-LD structured data"); }
  if (fonts === 0)              { score -= 2;  issues.push("No font preload links"); }
  if (!headers["content-encoding"]) { score -= 4; issues.push("Response not compressed (no Content-Encoding)"); }
  if (!headers["strict-transport-security"] && url.startsWith("https")) { score -= 4; issues.push("Missing HSTS header"); }
  if (!headers["x-content-type-options"]) { score -= 2; issues.push("Missing X-Content-Type-Options"); }

  return {
    url,
    status: res.status,
    elapsedMs: elapsed,
    bytes,
    bytesKb: Math.round(bytes / 1024),
    inlineCssBytes: inlineCss,
    inlineJsBytes: inlineJs,
    extScripts,
    imgs: imgs.length,
    lazyImgs,
    preloads,
    preconnects,
    jsonLd: jsonLd.length,
    jsonLdTypes,
    ogTags,
    twitter,
    hasViewport,
    hasDescription,
    h1Count,
    fonts,
    headers: {
      "content-encoding": headers["content-encoding"] ?? null,
      "cache-control":    headers["cache-control"] ?? null,
      "strict-transport-security": headers["strict-transport-security"] ?? null,
      "x-content-type-options":    headers["x-content-type-options"] ?? null,
    },
    score: Math.max(0, score),
    issues,
  };
}

for (const url of targets) {
  const r = await audit(url);
  RESULTS.push(r);
}

if (JSON_OUT) {
  console.log(JSON.stringify(RESULTS, null, 2));
  process.exit(0);
}

// Pretty print
for (const r of RESULTS) {
  if (r.error) {
    console.log(`\n${r.url}\n  ERROR: ${r.error}`);
    continue;
  }
  console.log(`\n${r.url}`);
  console.log(`  Status: ${r.status} · ${r.elapsedMs}ms · ${r.bytesKb} KB · Score: ${r.score}/100`);
  console.log(`  HTML:   inline CSS ${(r.inlineCssBytes/1024).toFixed(1)} KB · inline JS ${(r.inlineJsBytes/1024).toFixed(1)} KB · ${r.extScripts} ext scripts`);
  console.log(`  Images: ${r.imgs} <img> · ${r.lazyImgs} lazy${r.imgs ? ` (${Math.round(100*r.lazyImgs/r.imgs)}%)` : ""}`);
  console.log(`  Head:   preload ${r.preloads} · preconnect ${r.preconnects} · fonts ${r.fonts}`);
  console.log(`  SEO:    JSON-LD ${r.jsonLd} [${r.jsonLdTypes.join(",")}] · OG ${r.ogTags} · twitter ${r.twitter} · h1×${r.h1Count}`);
  console.log(`  Meta:   viewport=${r.hasViewport ? "✓" : "✗"} description=${r.hasDescription ? "✓" : "✗"}`);
  if (r.issues.length > 0) {
    console.log(`  Issues:`);
    for (const i of r.issues) console.log(`    · ${i}`);
  }
}

const failing = RESULTS.filter((r) => !r.error && r.score < 70);
if (failing.length > 0) {
  console.log(`\n${failing.length}/${RESULTS.length} URLs scored < 70 — see issues above.`);
  process.exit(2);
}
