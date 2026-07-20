/**
 * AI Designér — sestavení kontextu webu pro model.
 *
 * Model dostává POUZE data daného tenanta (čtená přes tenant_id z
 * autentizované session): strukturu stránek a sekcí, design tokeny,
 * existující overrides a aktuální AI blok CSS/HTML. Nic ze souborů šablon,
 * nic z jiných tenantů.
 */
import { query, queryOne } from "@/lib/db";
import { SECTION_VARIANTS } from "@/sections/variants";
import { SECTION_TYPE_LABELS } from "@/sections/labels";
import { getAiCss, getAiHtmlBlocks } from "./apply";

interface SectionRow {
  id: number;
  page_id: number;
  section_type: string;
  section_variant: string;
  order_index: number;
  is_visible: boolean;
  settings: Record<string, unknown>;
}

interface PageRow {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
}

const MAX_VALUE_CHARS = 220;

function compactValue(value: unknown, depth = 0): unknown {
  if (value === null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.length > MAX_VALUE_CHARS ? `${value.slice(0, MAX_VALUE_CHARS)}…[zkráceno]` : value;
  }
  if (Array.isArray(value)) {
    const head = value.slice(0, depth > 1 ? 2 : 6).map((v) => compactValue(v, depth + 1));
    if (value.length > head.length) head.push(`…(+${value.length - head.length} položek)`);
    return head;
  }
  if (typeof value === "object") {
    if (depth > 3) return "…(objekt)";
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = compactValue(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

export interface DesignContext {
  text: string;
  sectionIds: number[];
}

export async function buildDesignContext(tenantId: number, maxChars: number): Promise<DesignContext> {
  const pages = await query<PageRow>(
    `SELECT id, slug, title, is_homepage FROM pages
      WHERE tenant_id = $1 AND status = 'published'
      ORDER BY is_homepage DESC, id ASC LIMIT 20`,
    [tenantId]
  );

  const sections = await query<SectionRow>(
    `SELECT id, page_id, section_type, section_variant, order_index, is_visible, settings
       FROM sections
      WHERE tenant_id = $1
      ORDER BY page_id ASC, order_index ASC`,
    [tenantId]
  );

  const tokensRow = await queryOne<{ design_tokens: Record<string, unknown> | null }>(
    `SELECT (settings -> 'designTokens')::jsonb AS design_tokens
       FROM sections WHERE tenant_id = $1 ORDER BY id ASC LIMIT 1`,
    [tenantId]
  );

  const overrides = await query<{ target_id: string | null; field_path: string; value: unknown }>(
    `SELECT target_id, field_path, value FROM tenant_overrides
      WHERE tenant_id = $1 AND target_type = 'section'
      ORDER BY updated_at DESC LIMIT 100`,
    [tenantId]
  );

  const aiCss = await getAiCss(tenantId);
  const aiBlocks = await getAiHtmlBlocks(tenantId);

  const pageById = new Map(pages.map((p) => [p.id, p]));

  const lines: string[] = [];
  lines.push("## Design tokeny (globální — barvy, fonty, radius)");
  lines.push(JSON.stringify(tokensRow?.design_tokens ?? {}, null, 0));
  lines.push("");
  lines.push("## Stránky a sekce");

  for (const page of pages) {
    lines.push(`### Stránka "${page.title}" (slug: ${page.slug}${page.is_homepage ? ", HOMEPAGE" : ""})`);
    const pageSections = sections.filter((s) => s.page_id === page.id);
    for (const s of pageSections) {
      const rest: Record<string, unknown> = { ...(s.settings ?? {}) };
      delete rest.designTokens; // tokeny mají vlastní sekci kontextu
      lines.push(
        `- Sekce #${s.id} [${s.section_type}/${s.section_variant}] order=${s.order_index}${s.is_visible ? "" : " SKRYTÁ"}`
      );
      lines.push(`  settings: ${JSON.stringify(compactValue(rest))}`);
    }
    lines.push("");
  }

  const orphanSections = sections.filter((s) => !pageById.has(s.page_id));
  if (orphanSections.length > 0) {
    lines.push(`### Ostatní sekce: ${orphanSections.map((s) => `#${s.id} ${s.section_type}`).join(", ")}`);
  }

  if (overrides.length > 0) {
    lines.push("## Existující content overrides (tenant vrstva)");
    for (const o of overrides.slice(0, 60)) {
      lines.push(`- sekce ${o.target_id ?? "všechny"} · ${o.field_path} = ${JSON.stringify(compactValue(o.value))}`);
    }
    lines.push("");
  }

  lines.push("## Aktuální AI CSS blok (tvůj předchozí výstup, op set_css ho NAHRAZUJE celý)");
  lines.push(aiCss ? "```css\n" + aiCss + "\n```" : "(prázdný)");
  lines.push("");
  lines.push("## Aktuální AI HTML bloky");
  lines.push(
    aiBlocks.length > 0
      ? aiBlocks.map((b) => `- ${b.id}: ${b.html.slice(0, 300)}`).join("\n")
      : "(žádné)"
  );
  lines.push("");

  // ── Moduly ──
  const tenantRow = await queryOne<{ tenant_kind: string | null; active_modules: string[] | null }>(
    `SELECT tenant_kind, active_modules FROM tenants WHERE id = $1`,
    [tenantId]
  );
  const activeModules = new Set(tenantRow?.active_modules ?? []);
  const ALL_MODULES = ["blog", "advanced-seo", "gallery", "testimonials", "rezora", "analytics", "forms", "newsletter"];
  lines.push("## Moduly (op set_module)");
  lines.push(ALL_MODULES.map((m) => `- ${m}: ${activeModules.has(m) ? "ZAPNUTÝ" : "vypnutý"}`).join("\n"));
  lines.push("");

  // ── E-shop ──
  const isCommerce = tenantRow?.tenant_kind === "commerce";
  lines.push("## E-shop");
  if (isCommerce) {
    const counts = await queryOne<{ products: string; categories: string }>(
      `SELECT
         (SELECT COUNT(*) FROM products WHERE tenant_id = $1 AND status != 'archived')::text AS products,
         (SELECT COUNT(*) FROM product_categories WHERE tenant_id = $1)::text AS categories`,
      [tenantId]
    ).catch(() => null);
    lines.push(`AKTIVNÍ (storefront na /obchod) — produktů: ${counts?.products ?? "?"}, kategorií: ${counts?.categories ?? "?"}.`);
    const cats = await query<{ name: string }>(
      `SELECT name FROM product_categories WHERE tenant_id = $1 ORDER BY sort_order, id LIMIT 30`,
      [tenantId]
    ).catch(() => [] as Array<{ name: string }>);
    if (cats.length > 0) lines.push(`Kategorie: ${cats.map((c) => c.name).join(", ")}`);
  } else {
    lines.push("VYPNUTÝ — lze zapnout operací enable_shop (vznikne storefront /obchod), pak create_category + create_product.");
  }
  lines.push("");

  // ── Katalog sekcí (pro add_section) ──
  lines.push("## Katalog sekcí (op add_section: section_type + section_variant)");
  const catalogTypes = new Set([...Object.keys(SECTION_TYPE_LABELS), ...Object.keys(SECTION_VARIANTS)]);
  catalogTypes.delete("full-page-clone");
  catalogTypes.delete("astera-home");
  catalogTypes.delete("freeform");
  catalogTypes.delete("ai-custom");
  for (const type of catalogTypes) {
    const label = SECTION_TYPE_LABELS[type] ?? type;
    const variants = (SECTION_VARIANTS[type] ?? []).map((v) => v.key);
    const variantList = variants.length > 0 ? ` | varianty: default, ${variants.slice(0, 40).join(", ")}` : " | varianty: default";
    lines.push(`- ${type} (${label})${variantList}`);
  }
  lines.push("Pro zcela vlastní vzhled použij add_custom_section (vlastní HTML+CSS).");

  let text = lines.join("\n");
  if (text.length > maxChars) text = text.slice(0, maxChars) + "\n…[kontext zkrácen]";

  return { text, sectionIds: sections.map((s) => s.id) };
}
