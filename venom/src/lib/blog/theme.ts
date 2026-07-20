import { getTenantPage, getPageSections, type Tenant } from "@/lib/db";
import { getTenantDataSlotsCached } from "@/lib/section-resolver";

/**
 * Blog theme engine — one blog module, 100+ template adaptations.
 *
 * Every tenant page already carries design tokens (colors, fonts, radius) in the
 * homepage section settings. The blog reads those tokens so it automatically
 * inherits each template's identity. On top of that a "skin" adds layout
 * personality (editorial / magazine / minimal), resolved from:
 *
 *   1. explicit `designTokens.blogSkin` set by the template
 *   2. tenant industry → skin mapping
 *   3. fallback "minimal"
 */

export type BlogSkin = "editorial" | "magazine" | "minimal";

export interface BlogTheme {
  /** Raw design tokens from the homepage sections */
  tokens: Record<string, string>;
  skin: BlogSkin;
  /** True when the template background is dark — used to tune overlays/shadows */
  isDark: boolean;
  /** Display name of the business (publisher in JSON-LD, hero eyebrow) */
  businessName: string;
  // Resolved token shortcuts with fallbacks
  colorPrimary: string;
  /** Readable foreground for text sitting on `colorPrimary` (white or near-black). */
  colorOnPrimary: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextMuted: string;
  colorBorder: string;
  fontHeading: string;
  fontBody: string;
  radiusLg: string;
  radiusMd: string;
}

const INDUSTRY_SKIN: Record<string, BlogSkin> = {
  // Editorial — professions built on trust: serif rhythm, drop caps, thin rules
  lawyer: "editorial",
  advokat: "editorial",
  ucetni: "editorial",
  finance: "editorial",
  wellness: "editorial",
  clinic: "editorial",
  dentist: "editorial",
  zubar: "editorial",
  fyzioterapie: "editorial",
  reality: "editorial",
  // Magazine — visual businesses: bold chips, image-heavy asymmetric grid
  barber: "magazine",
  fitness: "magazine",
  restaurace: "magazine",
  restaurant: "magazine",
  cafe: "magazine",
  kavarna: "magazine",
  tattoo: "magazine",
  kosmetika: "magazine",
  nehty: "magazine",
  florist: "magazine",
  eshop: "magazine",
};

function resolveSkin(tokens: Record<string, string>, industry: string): BlogSkin {
  const explicit = tokens.blogSkin;
  if (explicit === "editorial" || explicit === "magazine" || explicit === "minimal") return explicit;
  const key = (industry ?? "").toLowerCase();
  for (const [prefix, skin] of Object.entries(INDUSTRY_SKIN)) {
    if (key.startsWith(prefix)) return skin;
  }
  return "minimal";
}

/** Relative luminance of a #rgb/#rrggbb color; ~0 dark, ~1 light. */
function luminance(hex: string): number {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return 1;
  let c = m[1];
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Foreground for text on a filled primary swatch. Plenty of templates use a
 * pale gold/sand/mint primary, where hardcoded white text is unreadable.
 */
function onColor(hex: string): string {
  return luminance(hex) > 0.6 ? "#111827" : "#ffffff";
}

/**
 * Some template scaffolds ship an unfilled `brand.name` slot holding a literal
 * placeholder. Using it would print "Jak u Název podniku pracujeme…" in article
 * copy and titles, so treat those exact strings as absent.
 */
const PLACEHOLDER_NAMES = new Set([
  "název podniku",
  "nazev podniku",
  "vaše firma",
  "váš podnik",
  "název firmy",
]);

export function isPlaceholderName(value: string | null | undefined): boolean {
  return !value || PLACEHOLDER_NAMES.has(value.trim().toLowerCase());
}

export async function getBlogTheme(tenant: Tenant): Promise<BlogTheme> {
  const homepage = await getTenantPage(tenant.id, "home");
  const homeSections = homepage ? await getPageSections(tenant.id, homepage.id) : [];
  const tokens = (homeSections[0]?.settings?.designTokens ?? {}) as Record<string, string>;

  const colorBackground = tokens.colorBackground || "#ffffff";

  // Display name: the `brand.name` data slot is what the rest of the site
  // renders (navbar, footer, SEO). `business_name` is often empty on demo
  // tenants, and falling through to the slug printed "lawyer-01-v2" as the
  // blog eyebrow and JSON-LD publisher.
  const slots = await getTenantDataSlotsCached(tenant.id);
  const brandName = (slots.get("brand.name") as string | undefined)?.trim();
  const navbarContent = (homeSections.find((s) => s.section_type === "navbar")?.settings
    ?.content ?? {}) as Record<string, unknown>;
  const navbarName = typeof navbarContent.siteName === "string" ? navbarContent.siteName.trim() : "";

  return {
    tokens,
    skin: resolveSkin(tokens, tenant.industry),
    isDark: luminance(colorBackground) < 0.4,
    // Navbar siteName wins: it's the name the visitor actually reads at the top
    // of the page, so the blog header and JSON-LD publisher stay consistent with
    // it. A handful of tenants carry a different (often stale) brand.name slot.
    businessName:
      (!isPlaceholderName(navbarName) && navbarName) ||
      (!isPlaceholderName(brandName) && brandName) ||
      tenant.business_name ||
      tenant.slug,
    colorPrimary: tokens.colorPrimary || "#6366f1",
    colorOnPrimary: onColor(tokens.colorPrimary || "#6366f1"),
    colorBackground,
    colorSurface: tokens.colorSurface || (luminance(colorBackground) < 0.4 ? "rgba(255,255,255,.05)" : "#f9fafb"),
    colorText: tokens.colorText || "#111827",
    colorTextMuted: tokens.colorTextMuted || "#6b7280",
    colorBorder: tokens.colorBorder || (luminance(colorBackground) < 0.4 ? "rgba(255,255,255,.12)" : "#e5e7eb"),
    fontHeading: tokens.fontHeading || "inherit",
    fontBody: tokens.fontBody || "Inter, sans-serif",
    radiusLg: tokens.radiusLg || "20px",
    radiusMd: tokens.radiusMd || "12px",
  };
}

/** CSS custom properties injected on the blog root so all components share the theme. */
export function blogCssVars(theme: BlogTheme): Record<string, string> {
  return {
    "--blog-primary": theme.colorPrimary,
    "--blog-on-primary": theme.colorOnPrimary,
    "--blog-bg": theme.colorBackground,
    "--blog-surface": theme.colorSurface,
    "--blog-text": theme.colorText,
    "--blog-muted": theme.colorTextMuted,
    "--blog-border": theme.colorBorder,
    "--blog-font-heading": theme.fontHeading,
    "--blog-font-body": theme.fontBody,
    "--blog-radius-lg": theme.radiusLg,
    "--blog-radius-md": theme.radiusMd,
  };
}
