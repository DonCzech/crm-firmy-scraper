#!/usr/bin/env node
/**
 * migrate-section-spacing-to-vars.mjs
 *
 * Scan `src/sections/** /skin.css` and `src/templates/** /skin.css` files,
 * detect `padding:` declarations on section-level selectors, and rewrite
 * them to consume the new CSS vars (`--section-pt`, `--section-pb`,
 * `--section-px`) emitted by the SectionRenderer wrapper. This is the
 * codemod for T1.4 of EDITOR_WIX_UPGRADE_PLAN.md.
 *
 * Modes:
 *   --dry        (default) just list candidates + write report, no file changes
 *   --write      apply the rewrite (skips locked templates listed in LOCKED below)
 *   --report     path for the report (default: docs/spacing-codemod-report.md)
 *
 * Heuristic: a CSS rule is treated as "section-level" when its selector
 * starts with a recognised section-root token (section type or class
 * convention). Anything narrower (e.g. `.hero .button`, `.services .card`)
 * is ignored — we only want the top wrapper to honour the CSS vars.
 *
 * The codemod is intentionally conservative — better to skip than to
 * silently break a template. Anything ambiguous is logged but left alone.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { argv, cwd, exit } from "node:process";

const ROOT = cwd();
const SCAN_ROOTS = [join(ROOT, "src/sections"), join(ROOT, "src/templates")];
const DEFAULT_REPORT = join(ROOT, "docs/spacing-codemod-report.md");

// Templates whose visuals are locked by the project ledger (MEMORY.md
// "Venom šablony" — DONE ✅). The codemod SKIPS these even in --write mode.
// barber-01 through barber-04 are the original Opus-finished templates.
// Extend this list as more templates are locked.
const LOCKED_KEYS = new Set([
  "barber-01", "barber-02", "barber-03", "barber-04",
]);

// Section root keywords. A selector is considered "section-level" when
// the FIRST class / element token matches one of these. We deliberately
// keep this narrow: we only rewrite the top-most wrapper.
const SECTION_ROOTS = [
  "section",
  "hero", "services", "gallery", "contact", "footer", "about", "team",
  "testimonials", "faq", "cta", "opening-hours", "pricing", "stats",
  "blog-preview", "promo", "products", "embed", "navbar", "map",
];

const args = new Set(argv.slice(2));
const WRITE = args.has("--write");
const reportArgIdx = argv.indexOf("--report");
const REPORT_PATH = reportArgIdx > 0 ? argv[reportArgIdx + 1] : DEFAULT_REPORT;

function listCssFiles(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) out.push(...listCssFiles(full));
    else if (s.isFile() && entry.endsWith(".css")) out.push(full);
  }
  return out;
}

/** Extract the template key from a path like `src/templates/<key>/skin.css`.
 *  Returns null if the path doesn't match. */
function templateKeyForFile(absPath) {
  const rel = relative(ROOT, absPath);
  const m = rel.match(/^src\/templates\/([^/]+)\/skin\.css$/);
  return m ? m[1] : null;
}

/** Is this selector targetting a section root? */
function isSectionRootSelector(selectorChunk) {
  const s = selectorChunk.trim();
  if (!s) return false;
  // Strip leading combinators / commas / whitespace
  // We look at the FIRST simple selector only (before any descendant combinator).
  const firstToken = s.split(/[\s>+~]/)[0];
  // Examples we want to match:
  //   section, section.foo, .section, .hero, .hero-luxury-dark,
  //   .b03-services, .services-grid, .testimonials, [data-template="barber-01"] section
  // Examples we DO NOT want to match:
  //   .hero .button, .services .card .icon (those have descendant combinator,
  //   handled by firstToken-only check), .button, .card, .icon
  if (firstToken === "section") return true;
  // class-style: `.something` — does `something` (or its prefix) match a root?
  const m = firstToken.match(/^\.([a-z][a-z0-9_-]*)/i);
  if (!m) return false;
  const cls = m[1].toLowerCase();
  return SECTION_ROOTS.some((root) => cls === root || cls.startsWith(root + "-") || cls.endsWith("-" + root) || cls.includes("__" + root));
}

/** Parse a flat list of {selector, body, headerStart, bodyStart, bodyEnd}
 *  rules from raw CSS source. Naive `}`-split — assumes no nested at-rules
 *  with curly braces inside `@media`, which is fine for skin.css that uses
 *  `@media` at top level only. */
function parseRules(src) {
  const rules = [];
  let i = 0;
  while (i < src.length) {
    const openIdx = src.indexOf("{", i);
    if (openIdx < 0) break;
    // Walk back to last `;` / `}` / start-of-file to find selector start
    let selStart = i;
    while (selStart < openIdx && /[\s\n]/.test(src[selStart])) selStart++;
    const selector = src.slice(selStart, openIdx).trim();
    // Find matching close
    let depth = 1;
    let j = openIdx + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") depth--;
      if (depth === 0) break;
      j++;
    }
    if (depth !== 0) break;
    const body = src.slice(openIdx + 1, j);
    // @media etc. → recurse, but only one level deep for simple cases
    if (selector.startsWith("@media") || selector.startsWith("@supports")) {
      const inner = parseRules(body).map((r) => ({
        ...r,
        bodyStart: r.bodyStart + openIdx + 1,
        bodyEnd: r.bodyEnd + openIdx + 1,
      }));
      rules.push(...inner);
    } else {
      rules.push({
        selector,
        body,
        bodyStart: openIdx + 1,
        bodyEnd: j,
      });
    }
    i = j + 1;
  }
  return rules;
}

const PADDING_DECL = /(^|\n)(\s*)padding\s*:\s*([^;]+);/g;
const NUM = /[+-]?(?:\d*\.)?\d+(?:px|rem|em|%)?/;

/** Decompose `padding: <values>` into 4 sides per CSS shorthand rules.
 *  Returns null if the value isn't a simple length shorthand we can rewrite. */
function decomposePadding(value) {
  const tokens = value.trim().split(/\s+/);
  // Any token with var()/calc()/!important/etc. → bail out
  if (tokens.some((t) => /[(){}!]/.test(t))) return null;
  // Each token must be a number (with optional unit)
  const lenRe = new RegExp("^" + NUM.source + "$");
  if (!tokens.every((t) => lenRe.test(t))) return null;
  let pt, pr, pb, pl;
  if (tokens.length === 1) { pt = pr = pb = pl = tokens[0]; }
  else if (tokens.length === 2) { pt = pb = tokens[0]; pr = pl = tokens[1]; }
  else if (tokens.length === 3) { pt = tokens[0]; pr = pl = tokens[1]; pb = tokens[2]; }
  else if (tokens.length === 4) { pt = tokens[0]; pr = tokens[1]; pb = tokens[2]; pl = tokens[3]; }
  else return null;
  return { pt, pr, pb, pl };
}

/** Build the rewritten padding shorthand consuming CSS vars with fallbacks. */
function buildRewritten(d) {
  // Use the same value for left/right via --section-px (matches inspector slider semantics).
  // If original pl !== pr (asymmetric) we keep them literal so we don't break design.
  if (d.pl !== d.pr) {
    return `padding: var(--section-pt, ${d.pt}) ${d.pr} var(--section-pb, ${d.pb}) ${d.pl};`;
  }
  return `padding: var(--section-pt, ${d.pt}) var(--section-px, ${d.pr}) var(--section-pb, ${d.pb}) var(--section-px, ${d.pl});`;
}

// ── Main ────────────────────────────────────────────────────────────────────
const allFiles = SCAN_ROOTS.flatMap(listCssFiles);
const findings = [];

for (const file of allFiles) {
  const src = readFileSync(file, "utf8");
  const rules = parseRules(src);
  const fileFindings = [];
  for (const rule of rules) {
    // A rule's selector may be a comma list — check each fragment
    const fragments = rule.selector.split(",").map((s) => s.trim()).filter(Boolean);
    const anyMatches = fragments.some(isSectionRootSelector);
    if (!anyMatches) continue;
    // Scan the body for padding declarations
    let m;
    PADDING_DECL.lastIndex = 0;
    while ((m = PADDING_DECL.exec(rule.body)) !== null) {
      const fullMatch = m[0];
      const valuePart = m[3];
      // Skip if already consuming a CSS var or has !important — leave it alone
      if (valuePart.includes("var(--section-")) continue;
      const decomposed = decomposePadding(valuePart);
      if (!decomposed) {
        fileFindings.push({
          kind: "skip",
          selector: rule.selector,
          original: fullMatch.replace(/^\n/, "").trim(),
          reason: "non-trivial value (var/calc/!important/non-length)",
        });
        continue;
      }
      const rewritten = buildRewritten(decomposed);
      // Position in source for diff context
      const absStart = rule.bodyStart + m.index + (m[1] === "\n" ? 1 : 0);
      const absEnd = absStart + fullMatch.replace(/^\n/, "").length;
      fileFindings.push({
        kind: "candidate",
        selector: rule.selector,
        original: fullMatch.replace(/^\n/, "").trim(),
        rewritten,
        absStart,
        absEnd,
        decomposed,
      });
    }
  }
  if (fileFindings.length === 0) continue;
  findings.push({ file, findings: fileFindings, src });
}

// ── Report ──────────────────────────────────────────────────────────────────
const lines = [];
lines.push("# spacing-codemod-report");
lines.push("");
lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
lines.push(`**Mode:** ${WRITE ? "WRITE (files modified)" : "DRY-RUN (no changes)"}`);
lines.push(`**CSS files scanned:** ${allFiles.length}`);
lines.push(`**Files with candidates:** ${findings.length}`);
lines.push(`**Locked templates (always skipped):** ${[...LOCKED_KEYS].join(", ")}`);
lines.push("");
lines.push("## What this codemod does");
lines.push("");
lines.push("Rewrites `padding: <top> <right> <bottom> <left>` on **section-root selectors** to consume the new CSS vars emitted by `SectionRenderer`:");
lines.push("");
lines.push("```css");
lines.push("/* before */");
lines.push("section.hero { padding: 96px 24px; }");
lines.push("");
lines.push("/* after */");
lines.push("section.hero { padding: var(--section-pt, 96px) var(--section-px, 24px) var(--section-pb, 96px) var(--section-px, 24px); }");
lines.push("```");
lines.push("");
lines.push("Effect after migration: the Layout-inspector padding sliders **replace** the template's interior padding instead of adding to it (today's `T1.2` semantics are *additive outer padding*).");
lines.push("");

let totalCandidates = 0;
let totalSkips = 0;
let appliedFiles = 0;

for (const entry of findings) {
  const rel = relative(ROOT, entry.file);
  const tplKey = templateKeyForFile(entry.file);
  const locked = tplKey && LOCKED_KEYS.has(tplKey);
  const candidates = entry.findings.filter((f) => f.kind === "candidate");
  const skips = entry.findings.filter((f) => f.kind === "skip");
  totalCandidates += candidates.length;
  totalSkips += skips.length;

  lines.push(`## \`${rel}\`${locked ? " 🔒 **LOCKED — skipped**" : ""}`);
  lines.push("");
  if (candidates.length) {
    lines.push(`**${candidates.length} candidate${candidates.length === 1 ? "" : "s"}:**`);
    lines.push("");
    for (const c of candidates) {
      lines.push("```diff");
      lines.push(`@ ${c.selector}`);
      lines.push(`- ${c.original}`);
      lines.push(`+ ${c.rewritten}`);
      lines.push("```");
      lines.push("");
    }
  }
  if (skips.length) {
    lines.push(`**${skips.length} skipped (non-trivial value):**`);
    lines.push("");
    for (const s of skips) {
      lines.push(`- \`${s.selector}\` — \`${s.original}\` (${s.reason})`);
    }
    lines.push("");
  }

  // Apply if --write and not locked
  if (WRITE && !locked && candidates.length > 0) {
    let src = entry.src;
    // Apply substitutions in REVERSE order so absStart/absEnd indices stay valid
    const sorted = [...candidates].sort((a, b) => b.absStart - a.absStart);
    for (const c of sorted) {
      src = src.slice(0, c.absStart) + c.rewritten + src.slice(c.absEnd);
    }
    writeFileSync(entry.file, src, "utf8");
    appliedFiles++;
  }
}

lines.push("## Summary");
lines.push("");
lines.push(`- **Total candidates** (rewritable padding declarations): ${totalCandidates}`);
lines.push(`- **Total skips** (non-trivial values left as-is): ${totalSkips}`);
if (WRITE) {
  lines.push(`- **Files actually written:** ${appliedFiles}`);
} else {
  lines.push("- **Files written:** 0 (dry-run — pass `--write` to apply)");
}
lines.push("");
lines.push("## Next step");
lines.push("");
if (WRITE) {
  lines.push("1. Verify pilot template visually — paddings should be the same (vars fall back to original values).");
  lines.push("2. Test Layout slider on pilot: now slider value should REPLACE template padding (no longer additive).");
  lines.push("3. If anything breaks, `git restore` the affected `skin.css`.");
} else {
  lines.push("1. Review candidates above (esp. heroes / luxury variants).");
  lines.push("2. When happy, run `node scripts/migrate-section-spacing-to-vars.mjs --write` to apply.");
  lines.push("3. Re-render pilot template — visually should be identical (vars have original values as fallbacks).");
  lines.push("4. Edit a section via Layout slider → padding should now REPLACE template padding (semantic shift from T1.2 additive).");
}

writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");

console.log(`Scanned ${allFiles.length} CSS files`);
console.log(`Found ${findings.length} files with section-level padding candidates`);
console.log(`Total candidates: ${totalCandidates}`);
console.log(`Total skips: ${totalSkips}`);
if (WRITE) console.log(`Wrote: ${appliedFiles} files`);
console.log(`Report: ${relative(ROOT, REPORT_PATH)}`);

exit(0);
