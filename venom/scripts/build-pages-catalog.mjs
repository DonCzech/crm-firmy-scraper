#!/usr/bin/env node
/**
 * Walks src/templates/<family>/template.json, extracts every page's
 * (slug, sections[]), and writes one static JSON catalogue at
 * src/sections/built-in-pages.json.
 *
 * This is what the Wix "+ Add → Stránky" panel reads to offer real,
 * production-quality page templates instead of synthesising them from
 * default variants. Re-run after adding or renaming a template page:
 *   npm run pages:catalog
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const TEMPLATES = join(REPO_ROOT, "src/templates");
const OUT = join(REPO_ROOT, "src/sections/built-in-pages.json");

// Human-friendly Czech labels keyed by slug. Falls back to title-cased slug.
const SLUG_LABELS = {
  home:       "Úvod",
  domov:      "Úvod",
  "o-nas":    "O nás",
  about:      "O nás",
  sluzby:     "Služby",
  services:   "Služby",
  cenik:      "Ceník",
  pricing:    "Ceník",
  galerie:    "Galerie",
  gallery:    "Galerie",
  portfolio:  "Portfolio",
  kontakt:    "Kontakt",
  contact:    "Kontakt",
  recenze:    "Recenze",
  rezervace:  "Rezervace",
  tym:        "Tým",
  team:       "Tým",
  blog:       "Blog",
  faq:        "FAQ",
  pokoje:     "Pokoje",
  apartmany:  "Apartmány",
  ubytovani:  "Ubytování",
  rooms:      "Pokoje",
  menu:       "Menu",
  jidelnicek: "Jídelní lístek",
  produkty:   "Produkty",
  reference:  "Reference",
  akce:       "Akce",
  novinky:    "Novinky",
};

function labelForSlug(slug) {
  if (SLUG_LABELS[slug]) return SLUG_LABELS[slug];
  return slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Coarse category per slug for the left sidebar of the Stránky panel.
function categoryForSlug(slug) {
  if (/^(home|domov|index|root)$/.test(slug))     return "home";
  if (/o-?nas|about/.test(slug))                  return "about";
  if (/sluzby|services|nabidka/.test(slug))       return "services";
  if (/cenik|pricing/.test(slug))                 return "pricing";
  if (/galer|portfolio|reference/.test(slug))     return "portfolio";
  if (/menu|jidel/.test(slug))                    return "menu";
  if (/pokoj|apart|ubyt|rooms/.test(slug))        return "rooms";
  if (/produkt|product/.test(slug))               return "products";
  if (/blog|novink|article/.test(slug))           return "blog";
  if (/faq|otazk/.test(slug))                     return "faq";
  if (/kontakt|contact|rezervac/.test(slug))      return "contact";
  if (/tym|team/.test(slug))                      return "team";
  if (/^404|chyba/.test(slug))                    return "404";
  if (/gdpr|cookies|podminky|legal|ochrana/.test(slug)) return "legal";
  return "other";
}

async function main() {
  const families = await readdir(TEMPLATES, { withFileTypes: true });
  const pages = [];

  for (const ent of families) {
    if (!ent.isDirectory()) continue;
    const tplPath = join(TEMPLATES, ent.name, "template.json");
    let raw;
    try { raw = await readFile(tplPath, "utf8"); }
    catch { continue; }

    let json;
    try { json = JSON.parse(raw); }
    catch (e) { console.warn(`✗ ${ent.name}/template.json: ${e.message}`); continue; }

    if (!Array.isArray(json.pages)) continue;
    const family = json.key || ent.name;
    const industry = json.industry || null;
    const familyLabel = json.name || family;

    for (const p of json.pages) {
      if (!p.slug || !Array.isArray(p.sections) || p.sections.length === 0) continue;
      const sections = p.sections
        .filter(s => s.type && s.variant)
        .map(s => ({ type: s.type, variant: s.variant }));
      if (sections.length === 0) continue;
      pages.push({
        id: `${family}__${p.slug}`,
        family,
        familyLabel,
        industry,
        slug: p.slug,
        label: labelForSlug(p.slug),
        category: categoryForSlug(p.slug),
        isHomepage: !!p.isHomepage,
        sections,
        // Thumb hint: the hero section's thumbnail is what we'll show in the
        // page card. Pick the first non-navbar section.
        thumbHint: sections.find(s => s.type !== "navbar") || sections[0],
      });
    }
  }

  // Sort: homepage of each family first, then by family, slug
  pages.sort((a, b) => {
    if (a.isHomepage !== b.isHomepage) return a.isHomepage ? -1 : 1;
    if (a.family !== b.family) return a.family.localeCompare(b.family);
    return a.slug.localeCompare(b.slug);
  });

  await writeFile(OUT, JSON.stringify(pages, null, 2), "utf8");

  // Print stats
  const byCat = {};
  for (const p of pages) byCat[p.category] = (byCat[p.category] || 0) + 1;
  console.log(`✓ Wrote ${pages.length} pages from ${families.length} template folders to ${OUT}`);
  console.log(`  Categories: ${Object.entries(byCat).map(([k,v]) => `${k}=${v}`).join(", ")}`);
}

main().catch(err => { console.error(err); process.exit(1); });
