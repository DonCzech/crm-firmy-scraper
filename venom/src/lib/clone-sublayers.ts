/**
 * Extract logical sub-layers from a full-page-clone HTML blob.
 * Returns top-level sections/header/footer with a human label and a CSS selector
 * that the studio can use to scroll the iframe to that element.
 */

export interface CloneSubLayer {
  /** Unique key for React rendering */
  key: string;
  /** Human label shown in LayersPanel */
  label: string;
  /** CSS selector to find this element inside the iframe */
  selector: string;
  /** Semantic tag (used for icon) */
  tag: "header" | "nav" | "section" | "footer" | "div" | "main";
}

interface MatchedTag {
  tag: string;
  attrs: string;
  start: number;
  end: number;
}

const LABEL_BY_ID: Record<string, string> = {
  "about": "O nás",
  "services": "Služby / Ceník",
  "gallery": "Galerie",
  "reviews": "Recenze",
  "contacts": "Kontakty",
  "contact-us": "Kontaktní formulář",
  "contact": "Kontakt",
  "map": "Mapa",
  "main": "Hero",
  "hero": "Hero",
  "footer": "Patička",
};

const LABEL_BY_CLASS: Record<string, string> = {
  "header": "Hlavička",
  "footer": "Patička",
  "main": "Hero",
  "map": "Mapa",
  "partners": "Partneři",
  "gallery": "Galerie",
  "reviews": "Recenze",
  "services": "Služby",
  "about": "O nás",
  "contacts": "Kontakty",
  "contact-us": "Kontaktní formulář",
};

function findOpenTags(html: string, tagName: string): MatchedTag[] {
  const out: MatchedTag[] = [];
  const re = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push({ tag: tagName, attrs: m[1], start: m.index, end: m.index + m[0].length });
  }
  return out;
}

function getAttr(attrs: string, name: string): string | null {
  const m = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return m ? m[1] : null;
}

function labelFor(tag: string, id: string | null, cls: string | null): string {
  if (id && LABEL_BY_ID[id]) return LABEL_BY_ID[id];
  if (cls) {
    for (const token of cls.split(/\s+/)) {
      if (LABEL_BY_CLASS[token]) return LABEL_BY_CLASS[token];
    }
  }
  if (tag === "header") return "Hlavička";
  if (tag === "nav") return "Navigace";
  if (tag === "footer") return "Patička";
  if (tag === "main") return "Hero";
  if (id) return id.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

function selectorFor(tag: string, id: string | null, cls: string | null, nth: number): string {
  if (id) return `#${CSS.escape(id)}`;
  if (cls) {
    const first = cls.split(/\s+/)[0];
    if (first) return `${tag}.${CSS.escape(first)}`;
  }
  return `${tag}:nth-of-type(${nth + 1})`;
}

/**
 * Parse the HTML blob and return one entry per top-level visible section.
 * Limits to the first 20 entries to avoid panel overflow on large clones.
 */
export function extractCloneSubLayers(html: string): CloneSubLayer[] {
  if (!html) return [];

  // Collect candidate top-level structural tags
  const candidates: Array<{ tag: string; attrs: string; pos: number }> = [];

  for (const t of ["header", "nav", "main", "section", "footer"]) {
    findOpenTags(html, t).forEach(m => candidates.push({ tag: t, attrs: m.attrs, pos: m.start }));
  }

  // Also pull <div class="map">, <div class="partners"> etc — common in cloned WP themes
  const divRe = /<div\b([^>]*class\s*=\s*["'][^"']*\b(map|partners|footer|contacts)\b[^"']*["'][^>]*)>/gi;
  let mm: RegExpExecArray | null;
  while ((mm = divRe.exec(html)) !== null) {
    candidates.push({ tag: "div", attrs: mm[1], pos: mm.index });
  }

  // Sort by position so layers list mirrors document order
  candidates.sort((a, b) => a.pos - b.pos);

  const kept: typeof candidates = [];
  const seenLabels = new Set<string>();

  for (const c of candidates) {
    const id = getAttr(c.attrs, "id");
    const cls = getAttr(c.attrs, "class");

    // Skip script/admin artifacts and empty wrappers
    if (cls && /admin-ui|peak-cut-render-fix|container|wrapper|wrap$/.test(cls)) continue;

    const label = labelFor(c.tag, id, cls);
    if (seenLabels.has(label)) continue; // dedupe by display label
    seenLabels.add(label);

    kept.push(c);
    if (kept.length >= 20) break;
  }

  return kept.map((c, idx) => {
    const id = getAttr(c.attrs, "id");
    const cls = getAttr(c.attrs, "class");
    const nthIndex = kept.filter((k, i) => i < idx && k.tag === c.tag).length;
    return {
      key: `sub-${idx}-${id || (cls || "").split(/\s+/)[0] || c.tag}`,
      label: labelFor(c.tag, id, cls),
      selector: selectorFor(c.tag, id, cls, nthIndex),
      tag: c.tag as CloneSubLayer["tag"],
    };
  });
}
