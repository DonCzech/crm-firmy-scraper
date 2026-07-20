/**
 * AI Designér — aplikace validovaných operací na per-tenant vrstvy.
 *
 * Zásady:
 *  - tenant_id pochází VŽDY z autentizované session, nikdy z výstupu modelu;
 *  - každý zápis je parametrizovaný dotaz omezený na tenant_id;
 *  - CSS/HTML prochází sanitizací a stejnými filtry jako ruční "vlastní kód";
 *  - před aplikací se pořizuje snapshot dotčených vrstev → plné undo;
 *  - soubory šablon se NIKDY nemění — aktualizace šablon úpravy nepřepíše.
 */
import sanitizeHtml from "sanitize-html";
import type { PoolClient } from "pg";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import {
  getTenantCustomCode,
  saveTenantCustomCode,
  EMPTY_CUSTOM_CODE,
  type TenantCustomCode,
} from "@/lib/custom-code";
import { sanitizeRichContent } from "@/lib/sanitize-content";
import { SECTION_VARIANTS } from "@/sections/variants";
import { createProduct } from "@/lib/commerce/products";
import { createCategory } from "@/lib/commerce/categories";
import { ensureShopInTx } from "@/lib/commerce/shop";
import type { DesignOperationT } from "./operations";

/** Typy sekcí, které smí AI přidávat (registr rendererů + typy s variantami). */
const BASE_SECTION_TYPES = [
  "navbar", "footer", "hero", "services", "pricing", "testimonials", "gallery",
  "contact", "opening-hours", "faq", "cta", "team", "about", "blog-preview",
  "map", "promo", "products", "stats", "featured-products", "product-grid",
  "category-grid",
];
const VALID_SECTION_TYPES = new Set([...BASE_SECTION_TYPES, ...Object.keys(SECTION_VARIANTS)]);

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "polozka";
}

// ── AI-spravované bloky ve "vlastním kódu" ────────────────────────────────────
// AI píše výhradně do svého ohraničeného bloku; ruční kód uživatele mimo
// blok zůstává nedotčený.

const CSS_START = "/* ═══ AI-DESIGNER:START (needitovat ručně) ═══ */";
const CSS_END = "/* ═══ AI-DESIGNER:END ═══ */";
const HTML_START = "<!-- AI-DESIGNER:START (needitovat ručně) -->";
const HTML_END = "<!-- AI-DESIGNER:END -->";

function extractBlock(source: string, start: string, end: string): string {
  const s = source.indexOf(start);
  const e = source.indexOf(end);
  if (s === -1 || e === -1 || e < s) return "";
  return source.slice(s + start.length, e).trim();
}

function replaceBlock(source: string, start: string, end: string, inner: string): string {
  const s = source.indexOf(start);
  const e = source.indexOf(end);
  const block = inner.trim() ? `${start}\n${inner.trim()}\n${end}` : "";
  if (s === -1 || e === -1 || e < s) {
    if (!block) return source;
    return source.trim() ? `${source.trimEnd()}\n\n${block}\n` : `${block}\n`;
  }
  const before = source.slice(0, s).trimEnd();
  const after = source.slice(e + end.length).trimStart();
  return [before, block, after].filter(Boolean).join("\n\n").trim() + (block || after ? "\n" : "");
}

export async function getAiCss(tenantId: number): Promise<string> {
  const code = await getTenantCustomCode(tenantId);
  return code ? extractBlock(code.custom_css, CSS_START, CSS_END) : "";
}

export interface AiHtmlBlock {
  id: string;
  html: string;
}

const BLOCK_RE = /<div data-ai-block="([a-z0-9\-]+)">([\s\S]*?)<\/div><!--\/ai-block-->/g;

export async function getAiHtmlBlocks(tenantId: number): Promise<AiHtmlBlock[]> {
  const code = await getTenantCustomCode(tenantId);
  if (!code) return [];
  const region = extractBlock(code.body_end_html, HTML_START, HTML_END);
  const out: AiHtmlBlock[] = [];
  for (const m of region.matchAll(BLOCK_RE)) {
    out.push({ id: m[1], html: m[2] });
  }
  return out;
}

function serializeBlocks(blocks: AiHtmlBlock[]): string {
  return blocks.map((b) => `<div data-ai-block="${b.id}">${b.html}</div><!--/ai-block-->`).join("\n");
}

// ── Sanitizace AI HTML ────────────────────────────────────────────────────────

const AI_HTML_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "div", "section", "span", "a", "p", "h2", "h3", "h4", "strong", "em", "b", "i",
    "ul", "ol", "li", "img", "br", "small", "figure", "figcaption", "blockquote",
  ],
  allowedAttributes: {
    "*": ["class", "style", "aria-label", "role", "title"],
    a: ["href", "target", "rel", "class", "style", "aria-label"],
    img: ["src", "alt", "width", "height", "loading", "class", "style"],
  },
  allowedSchemes: ["https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
};

function sanitizeAiHtml(html: string): string {
  const clean = sanitizeHtml(html, AI_HTML_SANITIZE);
  // dvojitá pojistka proti úniku ze zápisu i po sanitizaci
  return clean.replace(/<\/(script|style)/gi, "");
}

const CSS_BLOCKLIST = [/expression\s*\(/i, /behavior\s*:/i, /-moz-binding/i, /javascript\s*:/i, /<\/?[a-z]/i, /@import/i];

function validateAiCss(css: string): string | null {
  for (const re of CSS_BLOCKLIST) {
    if (re.test(css)) return `CSS obsahuje zakázaný vzor: ${re}`;
  }
  return null;
}

// ── Snapshot / undo ───────────────────────────────────────────────────────────

interface SnapshotPayload {
  overrides: Array<{ target_type: string; target_id: string | null; field_path: string; value: unknown }>;
  custom_code: TenantCustomCode | null;
  sections: Array<{
    id: number; page_id: number; section_type: string; section_variant: string;
    order_index: number; is_visible: boolean; settings: Record<string, unknown>;
  }>;
  pages: Array<{ id: number; slug: string; title: string; is_homepage: boolean; status: string }>;
  tenant_kind: string | null;
  active_modules: string[] | null;
  modules: Array<{ module_key: string; enabled: boolean }>;
  /** doplněno po aplikaci — undo tyto záznamy smaže */
  created_product_ids?: number[];
  created_category_ids?: number[];
}

export async function snapshotTenantDesign(tenantId: number, requestId: number): Promise<number> {
  const overrides = await query<SnapshotPayload["overrides"][number]>(
    `SELECT target_type, target_id, field_path, value FROM tenant_overrides WHERE tenant_id = $1`,
    [tenantId]
  );
  const customCode = await queryOne<TenantCustomCode>(
    `SELECT enabled, head_html, body_end_html, custom_css, custom_js FROM tenant_custom_code WHERE tenant_id = $1`,
    [tenantId]
  );
  const sections = await query<SnapshotPayload["sections"][number]>(
    `SELECT id, page_id, section_type, section_variant, order_index, is_visible, settings
       FROM sections WHERE tenant_id = $1 ORDER BY id`,
    [tenantId]
  );
  const pages = await query<SnapshotPayload["pages"][number]>(
    `SELECT id, slug, title, is_homepage, status FROM pages WHERE tenant_id = $1 ORDER BY id`,
    [tenantId]
  );
  const tenantRow = await queryOne<{ tenant_kind: string | null; active_modules: string[] | null }>(
    `SELECT tenant_kind, active_modules FROM tenants WHERE id = $1`,
    [tenantId]
  );
  const modules = await query<SnapshotPayload["modules"][number]>(
    `SELECT module_key, enabled FROM tenant_modules WHERE tenant_id = $1`,
    [tenantId]
  );

  const payload: SnapshotPayload = {
    overrides,
    custom_code: customCode ?? null,
    sections,
    pages,
    tenant_kind: tenantRow?.tenant_kind ?? null,
    active_modules: tenantRow?.active_modules ?? null,
    modules,
  };
  const row = await queryOne<{ id: number }>(
    `INSERT INTO ai_design_snapshots (tenant_id, request_id, payload) VALUES ($1, $2, $3) RETURNING id`,
    [tenantId, requestId, JSON.stringify(payload)]
  );
  return row?.id ?? 0;
}

/** Po aplikaci zapíše do snapshotu id vytvořených commerce záznamů (pro undo). */
export async function recordCreatedCommerce(
  tenantId: number,
  requestId: number,
  createdProductIds: number[],
  createdCategoryIds: number[]
): Promise<void> {
  if (createdProductIds.length === 0 && createdCategoryIds.length === 0) return;
  await query(
    `UPDATE ai_design_snapshots
        SET payload = payload
          || jsonb_build_object('created_product_ids', $3::jsonb)
          || jsonb_build_object('created_category_ids', $4::jsonb)
      WHERE tenant_id = $1 AND request_id = $2`,
    [tenantId, requestId, JSON.stringify(createdProductIds), JSON.stringify(createdCategoryIds)]
  );
}

export async function restoreSnapshot(tenantId: number, requestId: number): Promise<boolean> {
  const snap = await queryOne<{ id: number; payload: SnapshotPayload }>(
    `SELECT id, payload FROM ai_design_snapshots
      WHERE tenant_id = $1 AND request_id = $2 AND restored_at IS NULL
      ORDER BY id DESC LIMIT 1`,
    [tenantId, requestId]
  );
  if (!snap) return false;
  const payload = snap.payload;

  await withTransaction(async (client) => {
    // overrides: plné obnovení stavu
    await client.query(`DELETE FROM tenant_overrides WHERE tenant_id = $1`, [tenantId]);
    for (const o of payload.overrides) {
      await client.query(
        `INSERT INTO tenant_overrides (tenant_id, target_type, target_id, field_path, value)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, o.target_type, o.target_id, o.field_path, JSON.stringify(o.value)]
      );
    }

    // ── stránky: smaž vytvořené, obnov smazané (explicitní id), sjednoť meta ──
    const pageIds = (payload.pages ?? []).map((p) => p.id);
    if (pageIds.length > 0) {
      await client.query(
        `DELETE FROM pages WHERE tenant_id = $1 AND NOT (id = ANY($2::int[]))`,
        [tenantId, pageIds]
      );
      for (const p of payload.pages) {
        await client.query(
          `INSERT INTO pages (id, tenant_id, slug, title, is_homepage, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title,
             is_homepage = EXCLUDED.is_homepage, status = EXCLUDED.status, updated_at = now()`,
          [p.id, tenantId, p.slug, p.title, p.is_homepage, p.status]
        );
      }
      await client.query(
        `SELECT setval(pg_get_serial_sequence('pages','id'), GREATEST((SELECT MAX(id) FROM pages), 1))`
      );
    }

    // ── sekce: smaž vytvořené, obnov smazané, vrať settings/pořadí ──
    const sectionIds = payload.sections.map((s) => s.id);
    await client.query(
      `DELETE FROM sections WHERE tenant_id = $1 AND NOT (id = ANY($2::int[]))`,
      [tenantId, sectionIds.length > 0 ? sectionIds : [0]]
    );
    if (payload.sections.length > 0) {
      await client.query(
        `UPDATE sections SET order_index = order_index + 100000 WHERE tenant_id = $1`,
        [tenantId]
      );
      for (const s of payload.sections) {
        await client.query(
          `INSERT INTO sections (id, tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
           ON CONFLICT (id) DO UPDATE SET
             page_id = EXCLUDED.page_id, section_type = EXCLUDED.section_type,
             section_variant = EXCLUDED.section_variant, order_index = EXCLUDED.order_index,
             is_visible = EXCLUDED.is_visible, settings = EXCLUDED.settings, updated_at = now()`,
          [s.id, tenantId, s.page_id, s.section_type ?? "hero", s.section_variant ?? "default",
           s.order_index, s.is_visible, JSON.stringify(s.settings ?? {})]
        );
      }
      await client.query(
        `SELECT setval(pg_get_serial_sequence('sections','id'), GREATEST((SELECT MAX(id) FROM sections), 1))`
      );
    }

    // ── moduly + druh tenanta ──
    if (payload.modules) {
      await client.query(`DELETE FROM tenant_modules WHERE tenant_id = $1`, [tenantId]);
      for (const m of payload.modules) {
        await client.query(
          `INSERT INTO tenant_modules (tenant_id, module_key, enabled) VALUES ($1, $2, $3)`,
          [tenantId, m.module_key, m.enabled]
        );
      }
    }
    if (payload.tenant_kind !== undefined) {
      await client.query(
        `UPDATE tenants SET tenant_kind = $2, active_modules = $3, updated_at = now() WHERE id = $1`,
        [tenantId, payload.tenant_kind, payload.active_modules ?? []]
      );
    }

    // ── commerce záznamy vytvořené AI — smazat (archivace ne, plné undo) ──
    for (const pid of payload.created_product_ids ?? []) {
      await client.query(`DELETE FROM products WHERE tenant_id = $1 AND id = $2`, [tenantId, pid]);
    }
    for (const cid of payload.created_category_ids ?? []) {
      await client.query(`DELETE FROM product_categories WHERE tenant_id = $1 AND id = $2`, [tenantId, cid]);
    }

    await client.query(
      `UPDATE ai_design_snapshots SET restored_at = now() WHERE id = $1`,
      [snap.id]
    );
  });

  // custom code mimo transakci (vlastní cache invalidace)
  if (payload.custom_code) {
    await saveTenantCustomCode(tenantId, payload.custom_code);
  } else {
    await query(`DELETE FROM tenant_custom_code WHERE tenant_id = $1`, [tenantId]);
  }

  await auditLog("ai_designer_undo", {
    tenantId,
    targetType: "tenant",
    targetId: String(tenantId),
    extra: { requestId },
  });
  return true;
}

// ── Aplikace operací ──────────────────────────────────────────────────────────

export interface ApplyResult {
  applied: number;
  skipped: Array<{ op: string; reason: string }>;
  createdProductIds: number[];
  createdCategoryIds: number[];
}

/** Vloží sekci na pozici v rámci stránky (renumber přes +100000 kvůli UNIQUE). */
async function insertSectionAt(
  client: PoolClient,
  tenantId: number,
  pageId: number,
  position: number,
  section: { section_type: string; section_variant: string; settings: Record<string, unknown> }
): Promise<number> {
  const { rows: siblings } = await client.query(
    `SELECT id FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index ASC`,
    [tenantId, pageId]
  );
  const ids = (siblings as Array<{ id: number }>).map((r) => r.id);

  const { rows: inserted } = await client.query(
    `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
     VALUES ($1, $2, $3, $4, 200000 + floor(random() * 100000)::int, true, $5::jsonb)
     RETURNING id`,
    [tenantId, pageId, section.section_type, section.section_variant, JSON.stringify(section.settings)]
  );
  const newId: number = inserted[0].id;

  const insertAt = Math.min(position, ids.length);
  ids.splice(insertAt, 0, newId);

  await client.query(
    `UPDATE sections SET order_index = order_index + 100000 WHERE tenant_id = $1 AND page_id = $2 AND order_index < 100000`,
    [tenantId, pageId]
  );
  for (let i = 0; i < ids.length; i++) {
    await client.query(
      `UPDATE sections SET order_index = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2`,
      [tenantId, ids[i], i]
    );
  }
  return newId;
}

export async function applyOperations(
  tenantId: number,
  operations: DesignOperationT[],
  validSectionIds: Set<number>
): Promise<ApplyResult> {
  const skipped: ApplyResult["skipped"] = [];
  const createdProductIds: number[] = [];
  const createdCategoryIds: number[] = [];
  let applied = 0;

  // stránky tenanta (id + slug), včetně stránek vytvořených v této dávce
  const pageRows = await query<{ id: number; slug: string; is_homepage: boolean }>(
    `SELECT id, slug, is_homepage FROM pages WHERE tenant_id = $1`,
    [tenantId]
  );
  const pagesBySlug = new Map(pageRows.map((p) => [p.slug, p.id]));
  const validPageIds = new Set(pageRows.map((p) => p.id));
  const homepageIds = new Set(pageRows.filter((p) => p.is_homepage).map((p) => p.id));

  // aktuální design tokeny — nové sekce je dostávají do settings (mirror pattern)
  const tokensRow = await queryOne<{ design_tokens: Record<string, unknown> | null }>(
    `SELECT (settings -> 'designTokens')::jsonb AS design_tokens
       FROM sections WHERE tenant_id = $1 ORDER BY id ASC LIMIT 1`,
    [tenantId]
  );
  const currentTokens = tokensRow?.design_tokens ?? {};

  function resolvePageId(pageId: number | null, pageSlug: string | null): number | null {
    if (pageId !== null && validPageIds.has(pageId)) return pageId;
    if (pageSlug !== null) return pagesBySlug.get(pageSlug) ?? null;
    return null;
  }

  // custom-code operace se kumulují a ukládají jednou na konci
  let cssUpdate: string | null = null;
  const htmlUpserts = new Map<string, string>();
  const htmlRemovals = new Set<string>();

  for (const op of operations) {
    try {
      switch (op.op) {
        case "set_design_tokens": {
          const patch: Record<string, unknown> = {};
          for (const { key, value } of op.pairs) patch[key] = value;
          const row = await queryOne<{ design_tokens: Record<string, unknown> | null }>(
            `SELECT (settings -> 'designTokens')::jsonb AS design_tokens
               FROM sections WHERE tenant_id = $1 ORDER BY id ASC LIMIT 1`,
            [tenantId]
          );
          const merged = { ...(row?.design_tokens ?? {}), ...patch };
          await query(
            `UPDATE sections
                SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{designTokens}', $2::jsonb, true),
                    updated_at = now()
              WHERE tenant_id = $1`,
            [tenantId, JSON.stringify(merged)]
          );
          applied++;
          break;
        }

        case "set_content_override": {
          if (op.section_id !== null && !validSectionIds.has(Number(op.section_id))) {
            skipped.push({ op: op.op, reason: `Sekce ${op.section_id} neexistuje` });
            break;
          }
          await query(
            `INSERT INTO tenant_overrides (tenant_id, target_type, target_id, field_path, value)
             VALUES ($1, 'section', $2, $3, $4)
             ON CONFLICT (tenant_id, target_type, COALESCE(target_id, ''), field_path)
             DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
            [tenantId, op.section_id === null ? null : String(op.section_id), op.field_path, JSON.stringify(op.value)]
          );
          applied++;
          break;
        }

        case "set_section_settings": {
          if (!validSectionIds.has(op.section_id)) {
            skipped.push({ op: op.op, reason: `Sekce ${op.section_id} neexistuje` });
            break;
          }
          const patch: Record<string, unknown> = {};
          for (const { key, value } of op.pairs) {
            if (key === "designTokens") continue; // na tokeny je vlastní operace
            patch[key] = value;
          }
          if (Object.keys(patch).length === 0) break;
          await query(
            `UPDATE sections
                SET settings = COALESCE(settings, '{}'::jsonb) || $3::jsonb, updated_at = now()
              WHERE tenant_id = $1 AND id = $2`,
            [tenantId, op.section_id, JSON.stringify(patch)]
          );
          applied++;
          break;
        }

        case "set_section_visibility": {
          if (!validSectionIds.has(op.section_id)) {
            skipped.push({ op: op.op, reason: `Sekce ${op.section_id} neexistuje` });
            break;
          }
          await query(
            `UPDATE sections SET is_visible = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2`,
            [tenantId, op.section_id, op.visible]
          );
          applied++;
          break;
        }

        case "reorder_section": {
          if (!validSectionIds.has(op.section_id)) {
            skipped.push({ op: op.op, reason: `Sekce ${op.section_id} neexistuje` });
            break;
          }
          await withTransaction(async (client) => {
            const { rows } = await client.query(
              `SELECT id, page_id FROM sections WHERE tenant_id = $1 AND id = $2`,
              [tenantId, op.section_id]
            );
            const target = rows[0] as { id: number; page_id: number } | undefined;
            if (!target) return;
            const { rows: siblings } = await client.query(
              `SELECT id FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index ASC`,
              [tenantId, target.page_id]
            );
            const ids = (siblings as Array<{ id: number }>).map((r) => r.id).filter((id) => id !== target.id);
            const insertAt = Math.min(op.new_index, ids.length);
            ids.splice(insertAt, 0, target.id);
            await client.query(
              `UPDATE sections SET order_index = order_index + 100000 WHERE tenant_id = $1 AND page_id = $2`,
              [tenantId, target.page_id]
            );
            for (let i = 0; i < ids.length; i++) {
              await client.query(
                `UPDATE sections SET order_index = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2`,
                [tenantId, ids[i], i]
              );
            }
          });
          applied++;
          break;
        }

        case "set_css": {
          const err = validateAiCss(op.css);
          if (err) {
            skipped.push({ op: op.op, reason: err });
            break;
          }
          cssUpdate = op.css;
          applied++;
          break;
        }

        case "add_html_block": {
          const clean = sanitizeAiHtml(op.html);
          if (!clean.trim()) {
            skipped.push({ op: op.op, reason: "HTML po sanitizaci prázdné" });
            break;
          }
          htmlUpserts.set(op.block_id, clean);
          htmlRemovals.delete(op.block_id);
          applied++;
          break;
        }

        case "remove_html_block": {
          htmlRemovals.add(op.block_id);
          htmlUpserts.delete(op.block_id);
          applied++;
          break;
        }

        // ── Stavba webu (v2) ──────────────────────────────────────────────

        case "create_page": {
          if (pagesBySlug.has(op.slug)) {
            skipped.push({ op: op.op, reason: `Stránka "${op.slug}" už existuje` });
            break;
          }
          const row = await queryOne<{ id: number }>(
            `INSERT INTO pages (tenant_id, slug, title, is_homepage, status)
             VALUES ($1, $2, $3, false, 'published') RETURNING id`,
            [tenantId, op.slug, op.title]
          );
          if (row) {
            pagesBySlug.set(op.slug, row.id);
            validPageIds.add(row.id);
          }
          applied++;
          break;
        }

        case "delete_page": {
          if (!validPageIds.has(op.page_id)) {
            skipped.push({ op: op.op, reason: `Stránka ${op.page_id} neexistuje` });
            break;
          }
          if (homepageIds.has(op.page_id)) {
            skipped.push({ op: op.op, reason: "Homepage nelze smazat" });
            break;
          }
          await query(`DELETE FROM pages WHERE tenant_id = $1 AND id = $2`, [tenantId, op.page_id]);
          validPageIds.delete(op.page_id);
          applied++;
          break;
        }

        case "add_section": {
          const pageId = resolvePageId(op.page_id, op.page_slug);
          if (pageId === null) {
            skipped.push({ op: op.op, reason: "Stránka nenalezena (page_id/page_slug)" });
            break;
          }
          if (!VALID_SECTION_TYPES.has(op.section_type)) {
            skipped.push({ op: op.op, reason: `Neznámý typ sekce "${op.section_type}"` });
            break;
          }
          let variant = op.section_variant;
          const knownVariants = SECTION_VARIANTS[op.section_type];
          if (variant !== "default" && knownVariants && !knownVariants.some((v) => v.key === variant)) {
            variant = "default";
          }
          let content: Record<string, unknown> = {};
          try {
            const parsed = JSON.parse(op.content_json);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              content = sanitizeRichContent(parsed as Record<string, unknown>);
            }
          } catch {
            skipped.push({ op: op.op, reason: "content_json není platný JSON" });
            break;
          }
          const newId = await withTransaction((client) =>
            insertSectionAt(client, tenantId, pageId, op.position, {
              section_type: op.section_type,
              section_variant: variant,
              settings: { content, designTokens: currentTokens },
            })
          );
          validSectionIds.add(newId);
          applied++;
          break;
        }

        case "remove_section": {
          if (!validSectionIds.has(op.section_id)) {
            skipped.push({ op: op.op, reason: `Sekce ${op.section_id} neexistuje` });
            break;
          }
          await query(`DELETE FROM sections WHERE tenant_id = $1 AND id = $2`, [tenantId, op.section_id]);
          validSectionIds.delete(op.section_id);
          applied++;
          break;
        }

        case "duplicate_section": {
          if (!validSectionIds.has(op.section_id)) {
            skipped.push({ op: op.op, reason: `Sekce ${op.section_id} neexistuje` });
            break;
          }
          const src = await queryOne<{ page_id: number; section_type: string; section_variant: string; settings: Record<string, unknown> }>(
            `SELECT page_id, section_type, section_variant, settings FROM sections WHERE tenant_id = $1 AND id = $2`,
            [tenantId, op.section_id]
          );
          if (!src) break;
          const newId = await withTransaction((client) =>
            insertSectionAt(client, tenantId, src.page_id, op.position, {
              section_type: src.section_type,
              section_variant: src.section_variant,
              settings: src.settings ?? {},
            })
          );
          validSectionIds.add(newId);
          applied++;
          break;
        }

        case "add_custom_section": {
          const pageId = resolvePageId(op.page_id, op.page_slug);
          if (pageId === null) {
            skipped.push({ op: op.op, reason: "Stránka nenalezena (page_id/page_slug)" });
            break;
          }
          const cleanHtml = sanitizeAiHtml(op.html);
          if (!cleanHtml.trim()) {
            skipped.push({ op: op.op, reason: "HTML po sanitizaci prázdné" });
            break;
          }
          const cssErr = op.css ? validateAiCss(op.css) : null;
          if (cssErr) {
            skipped.push({ op: op.op, reason: cssErr });
            break;
          }
          const newId = await withTransaction((client) =>
            insertSectionAt(client, tenantId, pageId, op.position, {
              section_type: "ai-custom",
              section_variant: "default",
              settings: {
                content: { name: op.name, html: cleanHtml, css: op.css ?? "" },
                designTokens: currentTokens,
              },
            })
          );
          validSectionIds.add(newId);
          applied++;
          break;
        }

        case "update_custom_section": {
          if (!validSectionIds.has(op.section_id)) {
            skipped.push({ op: op.op, reason: `Sekce ${op.section_id} neexistuje` });
            break;
          }
          const row = await queryOne<{ section_type: string; settings: Record<string, unknown> }>(
            `SELECT section_type, settings FROM sections WHERE tenant_id = $1 AND id = $2`,
            [tenantId, op.section_id]
          );
          if (!row || row.section_type !== "ai-custom") {
            skipped.push({ op: op.op, reason: "Sekce není typu ai-custom" });
            break;
          }
          const content = { ...((row.settings?.content ?? {}) as Record<string, unknown>) };
          if (op.html !== null) {
            const cleanHtml = sanitizeAiHtml(op.html);
            if (!cleanHtml.trim()) {
              skipped.push({ op: op.op, reason: "HTML po sanitizaci prázdné" });
              break;
            }
            content.html = cleanHtml;
          }
          if (op.css !== null) {
            const cssErr = validateAiCss(op.css);
            if (cssErr) {
              skipped.push({ op: op.op, reason: cssErr });
              break;
            }
            content.css = op.css;
          }
          await query(
            `UPDATE sections
                SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{content}', $3::jsonb, true), updated_at = now()
              WHERE tenant_id = $1 AND id = $2`,
            [tenantId, op.section_id, JSON.stringify(content)]
          );
          applied++;
          break;
        }

        case "set_module": {
          await query(
            `INSERT INTO tenant_modules (tenant_id, module_key, enabled)
             VALUES ($1, $2, $3)
             ON CONFLICT (tenant_id, module_key)
             DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()`,
            [tenantId, op.module_key, op.enabled]
          );
          if (op.enabled) {
            await query(
              `UPDATE tenants SET active_modules = array_append(
                 array_remove(active_modules, $1::text), $1::text
               ), updated_at = now() WHERE id = $2`,
              [op.module_key, tenantId]
            );
          } else {
            await query(
              `UPDATE tenants SET active_modules = array_remove(active_modules, $1::text), updated_at = now() WHERE id = $2`,
              [op.module_key, tenantId]
            );
          }
          applied++;
          break;
        }

        case "enable_shop": {
          await withTransaction(async (client) => {
            await ensureShopInTx(client, tenantId, { name: op.shop_name });
            await client.query(
              `UPDATE tenants SET tenant_kind = 'commerce', updated_at = now() WHERE id = $1`,
              [tenantId]
            );
          });
          applied++;
          break;
        }

        case "create_category": {
          const slug = slugify(op.name);
          const existing = await queryOne<{ id: number }>(
            `SELECT id FROM product_categories WHERE tenant_id = $1 AND (lower(name) = lower($2) OR slug = $3) LIMIT 1`,
            [tenantId, op.name, slug]
          );
          if (existing) {
            skipped.push({ op: op.op, reason: `Kategorie "${op.name}" už existuje` });
            break;
          }
          const cat = await createCategory(tenantId, { slug, name: op.name });
          createdCategoryIds.push(cat.id);
          applied++;
          break;
        }

        case "create_product": {
          let slug = slugify(op.title);
          const conflict = await queryOne<{ id: number }>(
            `SELECT id FROM products WHERE tenant_id = $1 AND slug = $2 LIMIT 1`,
            [tenantId, slug]
          );
          if (conflict) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

          let categoryId: number | null = null;
          if (op.category_name) {
            const catSlug = slugify(op.category_name);
            const cat = await queryOne<{ id: number }>(
              `SELECT id FROM product_categories WHERE tenant_id = $1 AND (lower(name) = lower($2) OR slug = $3) LIMIT 1`,
              [tenantId, op.category_name, catSlug]
            );
            if (cat) {
              categoryId = cat.id;
            } else {
              const created = await createCategory(tenantId, { slug: catSlug, name: op.category_name });
              categoryId = created.id;
              createdCategoryIds.push(created.id);
            }
          }

          const product = await createProduct(tenantId, {
            slug,
            title: op.title,
            description: op.description,
            status: "active",
            primary_category_id: categoryId,
            category_ids: categoryId ? [categoryId] : [],
            variants: [{ price_cents: Math.round(op.price_czk * 100), is_default: true }],
          });
          createdProductIds.push(product.id);
          applied++;
          break;
        }
      }
    } catch (err) {
      skipped.push({ op: op.op, reason: String(err).slice(0, 200) });
    }
  }

  // jediný zápis do tenant_custom_code (s plnou validací "vlastního kódu")
  if (cssUpdate !== null || htmlUpserts.size > 0 || htmlRemovals.size > 0) {
    const current = (await getTenantCustomCode(tenantId)) ?? { ...EMPTY_CUSTOM_CODE };

    let nextCss = current.custom_css;
    if (cssUpdate !== null) {
      nextCss = replaceBlock(current.custom_css, CSS_START, CSS_END, cssUpdate);
    }

    let nextBodyEnd = current.body_end_html;
    if (htmlUpserts.size > 0 || htmlRemovals.size > 0) {
      const region = extractBlock(current.body_end_html, HTML_START, HTML_END);
      const blocks: AiHtmlBlock[] = [];
      for (const m of region.matchAll(BLOCK_RE)) blocks.push({ id: m[1], html: m[2] });
      const byId = new Map(blocks.map((b) => [b.id, b]));
      for (const id of htmlRemovals) byId.delete(id);
      for (const [id, html] of htmlUpserts) byId.set(id, { id, html });
      nextBodyEnd = replaceBlock(
        current.body_end_html,
        HTML_START,
        HTML_END,
        serializeBlocks([...byId.values()])
      );
    }

    const errors = await saveTenantCustomCode(tenantId, {
      ...current,
      enabled: current.enabled !== false,
      custom_css: nextCss,
      body_end_html: nextBodyEnd,
    });
    if (errors.length > 0) {
      skipped.push({ op: "custom_code", reason: errors.map((e) => e.message).join("; ") });
    }
  }

  return { applied, skipped, createdProductIds, createdCategoryIds };
}
