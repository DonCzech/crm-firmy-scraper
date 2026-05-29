import { promises as fs } from "fs";
import path from "path";
import type { TemplateDefinition, DesignTokens, SectionConfig, TemplatePageDefinition } from "./types";
import { templateManifestSchema, themeTokensSchema, type TemplateManifest, type ThemeTokens } from "@/lib/schema";
import { placeholderImage } from "./placeholder";

// ── Placeholder marker resolution ─────────────────────────────────────────────
type PlaceholderMarker = { __placeholder: [number, number, string?] };

function isPlaceholder(v: unknown): v is PlaceholderMarker {
  return typeof v === "object" && v !== null && Array.isArray((v as PlaceholderMarker).__placeholder);
}

function resolvePlaceholders(input: unknown): unknown {
  if (isPlaceholder(input)) {
    const [w, h, label] = input.__placeholder;
    return placeholderImage(w, h, label);
  }
  if (Array.isArray(input)) return input.map(resolvePlaceholders);
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = resolvePlaceholders(v);
    }
    return out;
  }
  return input;
}

// ── Theme tokens → legacy DesignTokens adapter ────────────────────────────────
function themeToDesignTokens(theme: ThemeTokens): DesignTokens {
  const spacingMap: Record<string, DesignTokens["spacing"]> = {
    compact: "compact",
    normal: "normal",
    spacious: "relaxed",
    editorial: "relaxed",
  };
  return {
    colorPrimary: theme.colors.primary,
    colorSecondary: theme.colors.secondary,
    colorBackground: theme.colors.background,
    colorSurface: theme.colors.surface,
    colorText: theme.colors.text,
    colorTextMuted: theme.colors.textMuted,
    colorAccent: theme.colors.accent,
    colorBorder: theme.colors.border,
    fontHeading: theme.typography.fontHeading,
    fontBody: theme.typography.fontBody,
    borderRadius: theme.radius.pill,
    spacing: spacingMap[theme.spacing.personality] ?? "normal",
  };
}

// ── Content lookup by dot-path ────────────────────────────────────────────────
function lookupRef(content: Record<string, unknown>, ref?: string): Record<string, unknown> {
  if (!ref) return {};
  const parts = ref.split(".");
  let cur: unknown = content;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return {};
    }
  }
  return (cur && typeof cur === "object" ? (cur as Record<string, unknown>) : {});
}

// ── Manifest → TemplateDefinition ─────────────────────────────────────────────
function manifestToDefinition(
  manifest: TemplateManifest,
  theme: ThemeTokens,
  content: Record<string, unknown>
): TemplateDefinition {
  const designTokens = themeToDesignTokens(theme);
  const resolvedContent = resolvePlaceholders(content) as Record<string, unknown>;

  // Find homepage
  const homepage = manifest.pages.find((p) => p.isHomepage) ?? manifest.pages[0];

  const defaultSections: SectionConfig[] = homepage.sections.map((s, i) => ({
    type: s.type,
    variant: s.variant,
    order: i,
    visible: !s.hidden,
    anchorId: s.anchorId,
    content: s.contentRef ? lookupRef(resolvedContent, s.contentRef) : undefined,
  }));

  // Subpages (everything except homepage) → TemplatePageDefinition
  const pagesContent = (resolvedContent.pages ?? {}) as Record<string, Record<string, unknown>>;
  const subPages: TemplatePageDefinition[] = manifest.pages
    .filter((p) => p !== homepage)
    .map((page) => {
      const pc = (pagesContent[page.slug] ?? {}) as Record<string, unknown>;
      const seoTitle = typeof pc.seoTitle === "string" ? pc.seoTitle : undefined;
      const seoDescription = typeof pc.seoDescription === "string" ? pc.seoDescription : undefined;
      return {
        slug: page.slug,
        title: page.title ?? page.slug,
        seoTitle,
        seoDescription,
        sections: page.sections.map((s, i) => ({
          type: s.type,
          variant: s.variant,
          order: i,
          visible: !s.hidden,
          anchorId: s.anchorId,
          content: lookupRef(resolvedContent, s.contentRef),
        })),
      };
    });

  // demoContent: use the root content, flattened on top-level keys consumed by tenant-factory
  return {
    key: manifest.key,
    name: manifest.name,
    industry: manifest.industry,
    version: manifest.version,
    designTokens,
    defaultSections,
    pages: subPages,
    demoContent: resolvedContent,
  };
}

// ── Public loader ─────────────────────────────────────────────────────────────
const TEMPLATES_ROOT = path.join(process.cwd(), "src", "templates");

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function loadTemplate(key: string): Promise<TemplateDefinition> {
  const dir = path.join(TEMPLATES_ROOT, key);
  const manifestPath = path.join(dir, "template.json");

  if (await fileExists(manifestPath)) {
    const rawManifest = await readJson<unknown>(manifestPath);
    const manifestParsed = templateManifestSchema.safeParse(rawManifest);
    if (!manifestParsed.success) {
      throw new Error(`Template manifest invalid for "${key}": ${manifestParsed.error.message}`);
    }
    const manifest = manifestParsed.data;

    const themePath = path.join(dir, "theme.json");
    const rawTheme = await readJson<unknown>(themePath);
    const themeParsed = themeTokensSchema.safeParse(rawTheme);
    if (!themeParsed.success) {
      throw new Error(`Theme tokens invalid for "${key}": ${themeParsed.error.message}`);
    }
    const theme = themeParsed.data;

    const contentRel = manifest.content?.default ?? "./content/cs.json";
    const contentPath = path.join(dir, contentRel);
    const content = await readJson<Record<string, unknown>>(contentPath);

    return manifestToDefinition(manifest, theme, content);
  }

  // Fallback to legacy TS templates
  const { TEMPLATES } = await import("./index");
  const legacy = TEMPLATES[key];
  if (!legacy) throw new Error(`Unknown template: ${key}`);
  return legacy;
}
