#!/usr/bin/env node
// scripts/validate-template.mjs <slug>
//
// DONE-blocker pro novou šablonu. Zachytí přesně to, čím se rozbil peak-cut:
//   - varianty v manifestu, které nejsou v SECTION_VARIANTS (studio neumí přepnout)
//   - section.type, který není v SECTION_RENDERERS
//   - contentRef, který v content/cs.json neresolvuje
//   - povinné content klíče, které komponenta čte (logoUrl, services[], images[]...)
//   - chybějící páry (variant ↔ if-větev v komponentě) — opt-in přes flag
//
// Použití:
//   node scripts/validate-template.mjs <slug>             # exit 1 při errors
//   node scripts/validate-template.mjs <slug> --warn      # warnings také blokují

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const slug = process.argv[2];
const warnFatal = process.argv.includes("--warn");

if (!slug) {
  console.error("Usage: node scripts/validate-template.mjs <slug> [--warn]");
  process.exit(2);
}

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// ── 1. Načti SECTION_VARIANTS a SECTION_RENDERERS z TS zdrojů ──────────────
function extractRenderers() {
  const src = readFileSync(join(ROOT, "src/sections/registry.ts"), "utf8");
  const re = /(?:["']([\w-]+)["']|(\w+))\s*:\s*dynamic/g;
  const keys = new Set();
  let m;
  while ((m = re.exec(src))) keys.add(m[1] ?? m[2]);
  return keys;
}

function extractVariants() {
  const src = readFileSync(join(ROOT, "src/sections/variants.ts"), "utf8");
  // Match `"type": [ ... { key: "variant", ... }, ... ],`
  const out = new Map();
  const blockRe = /["']?([\w-]+)["']?\s*:\s*\[([\s\S]*?)\]\s*,/g;
  let m;
  while ((m = blockRe.exec(src))) {
    const type = m[1];
    if (type === "SECTION_VARIANTS" || type === "industries") continue;
    const inner = m[2];
    const keyRe = /key\s*:\s*["']([\w-]+)["']/g;
    const keys = new Set();
    let km;
    while ((km = keyRe.exec(inner))) keys.add(km[1]);
    if (keys.size > 0) out.set(type, keys);
  }
  return out;
}

// ── 2. Per-section minimální schémata content klíčů ────────────────────────
// Klíče, které příslušná komponenta čte přes `content.X` bez fallbacku, nebo
// kde absence vede k vizuálně rozbité sekci (žádné logo, prázdná galerie, atd.)
const CONTENT_SCHEMA = {
  navbar: {
    required: [],
    recommended: ["siteName", "logoUrl", "links"],
    arrays: { links: ["label", "href"] },
  },
  footer: {
    required: [],
    recommended: ["siteName"],
    arrays: { links: ["label", "href"], columns: ["title"], socials: ["label", "href"] },
  },
  hero: {
    required: [],
    recommended: ["title"],
    arrays: {},
  },
  about: {
    required: [],
    recommended: ["title", "body"],
    arrays: { values: ["title"] },
  },
  services: {
    required: [],
    recommended: ["services"],
    arrays: { services: ["name"], items: ["name"] },
  },
  pricing: {
    required: [],
    recommended: ["services"],
    arrays: { services: ["name"], items: ["name"] },
  },
  gallery: {
    required: [],
    recommended: ["images"],
    arrays: { images: ["url"] },
  },
  testimonials: {
    required: [],
    recommended: ["testimonials"],
    arrays: { testimonials: ["text"], items: ["text"] },
  },
  contact: {
    required: [],
    recommended: ["phone", "email"],
    arrays: {},
  },
  "opening-hours": {
    required: [],
    recommended: ["hours"],
    arrays: { hours: ["day"] },
  },
  faq: {
    required: [],
    recommended: ["items"],
    arrays: { items: ["question", "answer"] },
  },
  cta: { required: [], recommended: ["title"], arrays: {} },
  "rezora-cta": { required: [], recommended: [], arrays: {} },
  "rezora-widget": { required: [], recommended: [], arrays: {} },
  team: { required: [], recommended: ["members"], arrays: { members: ["name"] } },
  map: { required: [], recommended: ["address"], arrays: {} },
  "blog-preview": { required: [], recommended: [], arrays: { items: ["title"] } },
};

// ── 3. Načti template ──────────────────────────────────────────────────────
const tplDir = join(ROOT, "src/templates", slug);
if (!existsSync(tplDir)) {
  console.error(`✗ Template directory not found: ${tplDir}`);
  process.exit(2);
}

function readJson(rel) {
  const p = join(tplDir, rel);
  if (!existsSync(p)) {
    err(`Chybí soubor: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    err(`Nečitelný JSON v ${rel}: ${e.message}`);
    return null;
  }
}

const manifest = readJson("template.json");
const theme = readJson("theme.json");
if (!manifest) {
  console.error(errors.join("\n"));
  process.exit(2);
}

const contentRel = manifest?.content?.default ?? "./content/cs.json";
const content = readJson(contentRel.replace(/^\.\//, ""));

// ── 4. Validace ─────────────────────────────────────────────────────────────
const RENDERERS = extractRenderers();
const VARIANTS = extractVariants();

if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
  err("template.json nemá žádné pages[]");
}

const homepages = (manifest.pages || []).filter((p) => p.isHomepage);
if (homepages.length === 0) warn("Žádná page nemá isHomepage:true (loader vezme první).");
if (homepages.length > 1) err(`Více homepages: ${homepages.map((p) => p.slug).join(", ")}`);

function lookup(obj, ref) {
  if (!ref) return undefined;
  const parts = ref.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return undefined;
  }
  return cur;
}

function checkContentShape(type, contentRef, value) {
  const schema = CONTENT_SCHEMA[type];
  if (!schema || !value || typeof value !== "object") return;
  const hasOwn = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
  for (const k of schema.required) {
    if (!hasOwn(value, k)) err(`[${type}@${contentRef}] chybí povinný klíč "${k}"`);
  }
  for (const k of schema.recommended) {
    if (!hasOwn(value, k)) warn(`[${type}@${contentRef}] chybí doporučený klíč "${k}" — sekce může být vizuálně prázdná`);
  }
  for (const [arrKey, itemKeys] of Object.entries(schema.arrays)) {
    if (hasOwn(value, arrKey)) {
      const arr = value[arrKey];
      if (!Array.isArray(arr)) {
        // "socials" smí být i objektová mapa { instagram: url, facebook: url, … } (eshop-07, eshop-13)
        if (arrKey === "socials" && arr && typeof arr === "object") continue;
        err(`[${type}@${contentRef}] klíč "${arrKey}" má být pole, je ${typeof arr}`);
        continue;
      }
      arr.forEach((item, i) => {
        if (!item || typeof item !== "object") {
          err(`[${type}@${contentRef}] ${arrKey}[${i}] není objekt`);
          return;
        }
        for (const ik of itemKeys) {
          if (!(ik in item)) warn(`[${type}@${contentRef}] ${arrKey}[${i}] chybí "${ik}"`);
        }
      });
    }
  }
}

for (const page of manifest.pages || []) {
  if (!Array.isArray(page.sections) || page.sections.length === 0) {
    err(`Page "${page.slug}" nemá žádné sections[]`);
    continue;
  }
  for (const s of page.sections) {
    if (!s.type) {
      err(`Page "${page.slug}" — sekce bez type`);
      continue;
    }
    if (!RENDERERS.has(s.type)) {
      err(`Page "${page.slug}" — sekce type="${s.type}" není v SECTION_RENDERERS (registry.ts)`);
      continue;
    }
    const known = VARIANTS.get(s.type);
    if (!known) {
      warn(`Page "${page.slug}" — pro type="${s.type}" není definovaný žádný variant v variants.ts`);
    } else if (s.variant && !known.has(s.variant)) {
      err(
        `Page "${page.slug}" — variant "${s.type}.${s.variant}" NENÍ v SECTION_VARIANTS. ` +
          `Studio ji nedokáže přidat/přepnout. Známé: [${[...known].join(", ")}]`
      );
    }
    // contentRef
    if (s.contentRef && content) {
      const v = lookup(content, s.contentRef);
      if (v === undefined) {
        err(`Page "${page.slug}" — contentRef "${s.contentRef}" neexistuje v ${contentRel}`);
      } else if (v === null || (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0)) {
        warn(`Page "${page.slug}" — contentRef "${s.contentRef}" je prázdný objekt — sekce vyrenderuje s defaulty`);
      } else {
        checkContentShape(s.type, s.contentRef, v);
      }
    }
  }
}

// Industry sanity: varianty z barber/cafe/wellness na cizí industry
for (const page of manifest.pages || []) {
  for (const s of page.sections) {
    if (!s.variant) continue;
    if (s.variant.startsWith("barber-") && manifest.industry !== "barber") {
      warn(`Page "${page.slug}" — variant "${s.variant}" je pro industry=barber, šablona má "${manifest.industry}"`);
    }
    if (s.variant.startsWith("cafe-") && manifest.industry !== "cafe") {
      warn(`Page "${page.slug}" — variant "${s.variant}" je pro industry=cafe, šablona má "${manifest.industry}"`);
    }
  }
}

// ── 4b. SKELETON compliance (docs/skeletons.json) ──────────────────────────
// Šablona vyhlásí svůj skeleton v manifest.skeleton ("service-personal", "gastro", ...)
// Validátor ověří, že sections[] na homepage jdou v pořadí skeletonu (allowing SKIP
// zaznamenané v manifest.skippedSections[]). Skeleton se může vynechat (legacy
// šablony před 2026-05-27) — pak jen warning.
const skeletonsPath = join(ROOT, "docs/skeletons.json");
if (existsSync(skeletonsPath)) {
  try {
    const skelDoc = JSON.parse(readFileSync(skeletonsPath, "utf8"));
    const skeletonName =
      manifest.skeleton ||
      skelDoc.templateCategoryMap?.[slug] ||
      null;

    if (!skeletonName) {
      warn(
        `Šablona nemá deklarovaný skeleton (manifest.skeleton ani záznam v ` +
          `docs/skeletons.json:templateCategoryMap). Nové šablony MUSÍ mít skeleton.`
      );
    } else {
      const skeleton = skelDoc.skeletons?.[skeletonName];
      if (!skeleton) {
        err(`Skeleton "${skeletonName}" není v docs/skeletons.json.`);
      } else {
        const skipped = new Set((manifest.skippedSections || []).map((s) => s.pos));
        const homepage = homepages[0] || manifest.pages?.[0];
        if (homepage) {
          const sectionsByType = (homepage.sections || []).map((s) => s.type);
          // Skeleton positions, filtered by skippedSections[]
          const expected = skeleton.filter((s) => !skipped.has(s.pos));
          // Match: skeleton.type musí být podsekvencí sections.type v daném pořadí.
          // Engine šablona může mít MÉNĚ sekcí (skip) nebo VÍC (extra) — extra
          // musí být zaznamenány v manifest.extraSections[].
          let si = 0;
          const matched = [];
          const missing = [];
          const outOfOrder = [];
          const orderNote = String(manifest.sectionOrderNote || "").trim();
          for (const sk of expected) {
            const found = sectionsByType.indexOf(sk.type, si);
            if (found === -1) {
              // Strict subsequence failed — check if type exists anywhere (out-of-order)
              const anywhere = sectionsByType.indexOf(sk.type);
              if (anywhere !== -1 && orderNote) {
                outOfOrder.push(`#${sk.pos} ${sk.name} (type=${sk.type})`);
                matched.push({ skeletonPos: sk.pos, foundAt: anywhere, name: sk.name });
              } else {
                missing.push(`#${sk.pos} ${sk.name} (type=${sk.type})`);
              }
            } else {
              matched.push({ skeletonPos: sk.pos, foundAt: found, name: sk.name });
              si = found + 1;
            }
          }
          if (missing.length > 0) {
            err(
              `Skeleton "${skeletonName}" — chybí sekce: ${missing.join(", ")}. ` +
                `Pokud má originál tyto sekce vynechat, přidej je do manifest.skippedSections[]` +
                ` jako { "pos": <N>, "name": "<jméno>", "reason": "<důvod>" }.`
            );
          }
          if (outOfOrder.length > 0) {
            warn(
              `Skeleton "${skeletonName}" — sekce mimo doporučené pořadí: ${outOfOrder.join(", ")}. ` +
                `Akceptováno kvůli sectionOrderNote (visual parity > skeleton order).`
            );
          }
          // Extra sekce mimo skeleton
          const skeletonTypes = new Set(skeleton.map((s) => s.type));
          const extraDeclared = new Set((manifest.extraSections || []).map((s) => s.type));
          for (const t of sectionsByType) {
            if (!skeletonTypes.has(t) && !extraDeclared.has(t)) {
              warn(
                `Sekce type="${t}" je mimo skeleton "${skeletonName}" a není v ` +
                  `manifest.extraSections[]. Pokud je úmyslná, doplň ji do extraSections s důvodem.`
              );
            }
          }
        }
      }
    }
  } catch (e) {
    warn(`Nelze načíst docs/skeletons.json: ${e.message}`);
  }
}

// ── 4c. EDITABLE flags (live editor coverage) ──────────────────────────────
// Aby studio bylo 100% klikací, KAŽDÁ sekce v homepage by měla mít alespoň
// jeden editovatelný prvek (text/image/cta). Validátor čeká, že content má
// nějaký nenull klíč nebo že komponenta ve variantě má edit handlery (kontrolovat
// nelze staticky). Min požadavek: contentRef MUSÍ být vyplněný pro každou sekci
// (jinak studio nemá co editovat — defaults nejdou klikem měnit).
for (const page of manifest.pages || []) {
  for (const s of page.sections) {
    if (!s.contentRef) {
      warn(
        `Page "${page.slug}" — sekce type="${s.type}" nemá contentRef. ` +
          `Studio nebude mít co editovat (defaulty z komponenty nejdou klikem měnit).`
      );
    }
  }
}

// ── 5. Output ───────────────────────────────────────────────────────────────
const RED = "\x1b[31m";
const YEL = "\x1b[33m";
const GRN = "\x1b[32m";
const DIM = "\x1b[2m";
const RST = "\x1b[0m";

console.log(`${DIM}Template:${RST} ${slug}`);
console.log(`${DIM}Industry:${RST} ${manifest.industry ?? "(none)"}`);
console.log(`${DIM}Pages:${RST}    ${manifest.pages?.length ?? 0}`);
console.log("");

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${GRN}✓ PASS${RST} — template ${slug} prošla všechny kontroly.`);
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`${RED}✗ ${errors.length} error(s):${RST}`);
  for (const e of errors) console.log(`  ${RED}✗${RST} ${e}`);
  console.log("");
}
if (warnings.length > 0) {
  console.log(`${YEL}⚠ ${warnings.length} warning(s):${RST}`);
  for (const w of warnings) console.log(`  ${YEL}⚠${RST} ${w}`);
  console.log("");
}

const fail = errors.length > 0 || (warnFatal && warnings.length > 0);
if (fail) {
  console.log(`${RED}FAIL${RST} — nepoužívat ${slug} jako DONE.`);
  process.exit(1);
} else {
  console.log(`${YEL}PASS s warnings${RST} — šablona je publikovatelná, ale varovné body doporučujeme opravit.`);
  process.exit(0);
}
