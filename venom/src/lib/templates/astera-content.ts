import { getDefaultContent, type Lang } from "@/astera/lib/i18n";
import type { SiteContent } from "@/astera/lib/content-types";
import seed from "./astera-seed.json";

/**
 * Real, live asteralight.cz content per language, folded from the astera-web
 * DB export (site_content + site_content_i18n). Overlaid on the astera defaults
 * so every SiteContent key is present and correctly typed even if the export
 * lacks an optional section. This is a one-time template seed — no runtime
 * cross-language merge happens (see project_astera_i18n_per_language).
 */
const LANGS: Lang[] = ["cs", "en", "ua"];

const rawSeed = seed as unknown as Record<Lang, Record<string, unknown>>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Two-level merge: section keys, then fields within each section. The DB export
// can be older than the current astera schema (e.g. oracle gained an `image`
// field after the export), so any field the seed lacks falls back to the astera
// default. Arrays and scalars from the seed replace the default wholesale — no
// element-wise array merge that would corrupt nav / testimonials / pages.
function mergeContent(base: Record<string, unknown>, over: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(over)) {
    const b = base[key];
    const o = over[key];
    out[key] = isPlainObject(b) && isPlainObject(o) ? { ...b, ...o } : o;
  }
  return out;
}

export const asteraSiteContent: Record<Lang, SiteContent> = Object.fromEntries(
  LANGS.map((lang) => [
    lang,
    mergeContent(getDefaultContent(lang) as unknown as Record<string, unknown>, rawSeed[lang]) as unknown as SiteContent,
  ])
) as Record<Lang, SiteContent>;
