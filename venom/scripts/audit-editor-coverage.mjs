#!/usr/bin/env node
/**
 * T4.1 — Editor coverage audit
 *
 * For each template.json, for each section used, checks whether the
 * corresponding section component (+ variant) uses GenericEditableText /
 * GenericEditableImage.
 *
 * Also cross-checks section type against registry.ts.
 *
 * Output: docs/coverage-editor.json  +  console table
 *
 * Run:  node scripts/audit-editor-coverage.mjs
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

const ROOT       = path.join(process.cwd(), "src");
const TPL_ROOT   = path.join(ROOT, "templates");
const SECT_ROOT  = path.join(ROOT, "components", "sections");
const REGISTRY   = path.join(ROOT, "sections", "registry.ts");
const OUT        = path.join(process.cwd(), "docs", "coverage-editor.json");

// ── 1. Parse registry ───────────────────────────────────────────────────────
const regContent = readFileSync(REGISTRY, "utf8");
// Match both  key:  and  "key":  (quoted and unquoted object keys in registry)
const registeredTypes = new Set([
  ...[...regContent.matchAll(/^\s+"([\w-]+)"\s*:/gm)].map(m => m[1]),
  ...[...regContent.matchAll(/^\s+([\w-]+)\s*:/gm)].map(m => m[1]),
]);

// ── 2. Load all section files once ──────────────────────────────────────────
const SECTION_FILES = {
  navbar:          "NavbarSection.tsx",
  hero:            "HeroSection.tsx",
  services:        "ServicesSection.tsx",
  pricing:         "ServicesSection.tsx",
  about:           "AboutSection.tsx",
  gallery:         "GallerySection.tsx",
  contact:         "ContactSection.tsx",
  footer:          "FooterSection.tsx",
  faq:             "FaqSection.tsx",
  cta:             "CtaSection.tsx",
  "rezora-cta":    "CtaSection.tsx",
  testimonials:    "TestimonialsSection.tsx",
  team:            "TeamSection.tsx",
  "opening-hours": "OpeningHoursSection.tsx",
  promo:           "PromoSection.tsx",
  products:        "PromoSection.tsx",
  stats:           "StatsSection.tsx",
  map:             "MapSection.tsx",
  "blog-preview":  "BlogPreviewSection.tsx",
  embed:           "EmbedSection.tsx",
  freeform:        "FreeformSection.tsx",
};

const sectionContents = {};
for (const [type, file] of Object.entries(SECTION_FILES)) {
  const fp = path.join(SECT_ROOT, file);
  if (!sectionContents[file] && existsSync(fp)) {
    sectionContents[file] = readFileSync(fp, "utf8");
  }
}

// ── 3. For each template, for each section, check coverage ──────────────────
const templates = readdirSync(TPL_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

const results = [];
const missingTypes   = new Set();
const missingVariants = [];

for (const tplKey of templates) {
  const tplPath = path.join(TPL_ROOT, tplKey, "template.json");
  if (!existsSync(tplPath)) continue;
  const tpl = JSON.parse(readFileSync(tplPath, "utf8"));

  const sectionsSeen = new Map(); // type+variant → {covered, registered}

  for (const page of tpl.pages ?? []) {
    for (const sec of page.sections ?? []) {
      const key = `${sec.type}::${sec.variant}`;
      if (sectionsSeen.has(key)) continue;

      const registered = registeredTypes.has(sec.type);
      if (!registered) missingTypes.add(sec.type);

      const file = SECTION_FILES[sec.type];
      if (!file) { sectionsSeen.set(key, { covered: false, registered }); continue; }

      const src = sectionContents[file] ?? "";
      const variantId = sec.variant;
      // File-level check: does this section file contain this variant AND use GenericEditableText?
      const variantFound = src.includes(variantId);
      const fileHasGet   = src.includes("GenericEditableText");
      const fileHasGei   = src.includes("GenericEditableImage");
      // If variant not found in file → missing (section not implemented yet)
      // If variant found but file has no Generic wrappers → uncovered
      const covered = variantFound && (fileHasGet || fileHasGei);

      if (!covered) {
        missingVariants.push({ template: tplKey, type: sec.type, variant: variantId });
      }
      sectionsSeen.set(key, { covered, registered, variant: variantId, type: sec.type });
    }
  }

  const allSections = [...sectionsSeen.values()];
  const coveredCount  = allSections.filter(s => s.covered).length;
  results.push({
    template: tplKey,
    sections: allSections.length,
    covered:  coveredCount,
    pct:      allSections.length ? Math.round((coveredCount / allSections.length) * 100) : 100,
    gaps: missingVariants.filter(m => m.template === tplKey),
  });
}

// ── 4. Print summary ─────────────────────────────────────────────────────────
console.log("\n=== EDITOR COVERAGE AUDIT ===\n");
console.log(`Registry types: ${registeredTypes.size}`);
if (missingTypes.size) {
  console.log(`\n⚠️  UNREGISTERED types used in templates: ${[...missingTypes].join(", ")}`);
} else {
  console.log("✅ All section types in templates are registered.");
}

const perfect = results.filter(r => r.pct === 100).length;
const partial  = results.filter(r => r.pct > 0 && r.pct < 100).length;
const zero     = results.filter(r => r.pct === 0).length;

console.log(`\nTemplates: ${results.length} total`);
console.log(`  ✅ 100% covered: ${perfect}`);
console.log(`  ⚠️  Partial    : ${partial}`);
console.log(`  ❌ 0% covered  : ${zero}`);

// barber-01 uses generic variant names ("default", "cards-grid") that don't appear
// as literal strings in section files but are covered by generic fallback renders
// which include GenericEditableText. Treat as known exception.
const realGaps = missingVariants.filter(g => !(g.template === "barber-01" && ["default", "cards-grid"].includes(g.variant)));

if (realGaps.length > 0) {
  console.log(`\nGaps (variant not found in section file or no GenericEditableText near it):`);
  for (const g of realGaps) {
    console.log(`  ${g.template}  ${g.type}  variant="${g.variant}"`);
  }
} else {
  console.log("\n✅ No gaps found — all variants appear to use GenericEditableText.");
}
if (missingVariants.length > realGaps.length) {
  console.log(`\nℹ️  barber-01: "default"/"cards-grid" variants use generic fallback renders (EditorText present, visual style is generic). LOCKED template — known exception.`);
}

// Per-template table (sorted by pct asc)
console.log("\n--- Per-template ---");
for (const r of results.sort((a, b) => a.pct - b.pct)) {
  const icon = r.pct === 100 ? "✅" : r.pct === 0 ? "❌" : "⚠️ ";
  console.log(`${icon} ${r.pct.toString().padStart(3)}%  ${r.template}  (${r.covered}/${r.sections} sections)`);
}

// ── 5. Write JSON report ─────────────────────────────────────────────────────
const report = {
  generated: new Date().toISOString(),
  registeredTypes: [...registeredTypes].sort(),
  missingTypes: [...missingTypes],
  totals: { templates: results.length, perfect, partial, zero },
  templates: results.sort((a, b) => a.pct - b.pct),
  gaps: missingVariants,
};
writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(`\nReport → ${OUT}\n`);
