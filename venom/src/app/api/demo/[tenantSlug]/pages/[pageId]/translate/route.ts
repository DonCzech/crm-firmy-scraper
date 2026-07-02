import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * POST /api/demo/<slug>/pages/<id>/translate
 *   { locale: "en" | "de" | "sk" | "pl" | "uk" | ... }
 *
 * Multi-language scaffold. Duplicates the source page (slug "-<locale>"
 * suffix), walks every section's resolved content + content_overrides, calls
 * Claude to translate every string field, then writes the translated page
 * with cloned sections. Brand-specific tokens (URLs, e-mails, phone numbers,
 * brand names, prices) are kept verbatim.
 *
 * Idempotent: if the target slug already exists, returns 409 with the
 * existing page id so the user can navigate there or delete and retry.
 */
interface RouteParams { params: Promise<{ tenantSlug: string; pageId: string }> }

const BodySchema = z.object({
  locale: z.enum(["en", "de", "sk", "pl", "uk", "es", "fr", "it"]),
});

const LOCALE_LABELS: Record<string, { lang: string; native: string }> = {
  en: { lang: "English",   native: "English" },
  de: { lang: "German",    native: "Deutsch" },
  sk: { lang: "Slovak",    native: "Slovenčina" },
  pl: { lang: "Polish",    native: "Polski" },
  uk: { lang: "Ukrainian", native: "Українська" },
  es: { lang: "Spanish",   native: "Español" },
  fr: { lang: "French",    native: "Français" },
  it: { lang: "Italian",   native: "Italiano" },
};

// Skip-list: values that look like URLs, emails, phone numbers, slugs etc.
// stay verbatim. Also skip keys that hold non-translatable data.
const NON_TRANSLATABLE_KEYS = new Set([
  "id", "key", "slug", "href", "src", "url", "link", "image", "icon",
  "image_url", "imageUrl", "imageURL", "logo", "favicon",
  "email", "phone", "tel", "address", "lat", "lng", "latitude", "longitude",
  "type", "variant", "color", "background", "backgroundColor", "anchorId",
  "designTokens", "hiddenOn", "animation", "fontHeading", "fontBody",
  "borderRadius", "ttl", "rel", "target", "format", "currency",
]);
const URL_RE = /^(https?:\/\/|mailto:|tel:|\/\/|\/)/;
const PHONE_RE = /^\+?[\d\s()-]{6,}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const PRICE_RE = /^\s*[\d\s.,]+\s*(Kč|€|\$|EUR|USD|CZK)?\s*$/i;

function isTranslatable(key: string, value: string): boolean {
  if (NON_TRANSLATABLE_KEYS.has(key)) return false;
  if (!value || value.trim().length === 0) return false;
  if (value.length < 2) return false;
  if (URL_RE.test(value)) return false;
  if (PHONE_RE.test(value)) return false;
  if (EMAIL_RE.test(value)) return false;
  if (HEX_RE.test(value)) return false;
  if (PRICE_RE.test(value) && value.length < 12) return false;
  return true;
}

function collectStrings(node: unknown, path: string[] = [], out: Array<{ path: string[]; value: string }> = []) {
  if (typeof node === "string") {
    const key = path[path.length - 1] ?? "";
    if (isTranslatable(key, node)) out.push({ path: [...path], value: node });
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((item, idx) => collectStrings(item, [...path, String(idx)], out));
    return out;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      collectStrings(v, [...path, k], out);
    }
  }
  return out;
}

function applyTranslations(node: unknown, translations: Record<string, string>, path: string[] = []): unknown {
  if (typeof node === "string") {
    const key = path.join(".");
    return translations[key] ?? node;
  }
  if (Array.isArray(node)) {
    return node.map((item, idx) => applyTranslations(item, translations, [...path, String(idx)]));
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = applyTranslations(v, translations, [...path, k]);
    }
    return out;
  }
  return node;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug, pageId } = await params;
  const pid = parseInt(pageId, 10);
  if (isNaN(pid)) return Response.json({ error: "Invalid page ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "AI asistent není na tomto serveru nakonfigurovaný. Kontaktujte podporu." }, { status: 503 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { locale } = parsed.data;

  const src = await queryOne<{
    id: number; slug: string; title: string; is_homepage: boolean;
    seo_title: string | null; seo_description: string | null;
  }>(
    "SELECT id, slug, title, is_homepage, seo_title, seo_description FROM pages WHERE id = $1 AND tenant_id = $2",
    [pid, tenant.id]
  );
  if (!src) return Response.json({ error: "Source page not found" }, { status: 404 });

  const targetSlug = src.is_homepage ? `home-${locale}` : `${src.slug}-${locale}`;
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM pages WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, targetSlug]
  );
  if (existing) {
    return Response.json({ error: "Přeložená stránka už existuje", existingPageId: existing.id, targetSlug }, { status: 409 });
  }

  const sections = await query<{
    id: number; section_type: string; section_variant: string; order_index: number;
    is_visible: boolean; settings: Record<string, unknown>; content_overrides: Record<string, unknown>;
    content_source: string | null;
  }>(
    "SELECT id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index",
    [tenant.id, pid]
  );

  // Collect all translatable strings across every section + page metadata.
  const allStrings: Array<{ id: string; value: string }> = [];
  const stringSourceMap = new Map<string, { sectionIdx: number; field: "content" | "overrides" | "page"; path: string[] }>();
  let counter = 0;
  function pushStrings(items: Array<{ path: string[]; value: string }>, sectionIdx: number, field: "content" | "overrides" | "page") {
    for (const it of items) {
      const id = `t${counter++}`;
      allStrings.push({ id, value: it.value });
      stringSourceMap.set(id, { sectionIdx, field, path: it.path });
    }
  }
  sections.forEach((s, idx) => {
    const content = (s.settings?.content ?? {}) as Record<string, unknown>;
    pushStrings(collectStrings(content), idx, "content");
    pushStrings(collectStrings(s.content_overrides ?? {}), idx, "overrides");
  });
  if (src.title) {
    allStrings.push({ id: `t${counter++}`, value: src.title });
    stringSourceMap.set(`t${counter - 1}`, { sectionIdx: -1, field: "page", path: ["title"] });
  }
  if (src.seo_title) {
    allStrings.push({ id: `t${counter++}`, value: src.seo_title });
    stringSourceMap.set(`t${counter - 1}`, { sectionIdx: -1, field: "page", path: ["seo_title"] });
  }
  if (src.seo_description) {
    allStrings.push({ id: `t${counter++}`, value: src.seo_description });
    stringSourceMap.set(`t${counter - 1}`, { sectionIdx: -1, field: "page", path: ["seo_description"] });
  }

  if (allStrings.length === 0) {
    return Response.json({ error: "Stránka nemá žádný přeložitelný obsah." }, { status: 400 });
  }

  // Call Claude with a batched JSON map { id: original } → { id: translation }.
  const localeLabel = LOCALE_LABELS[locale];
  const systemPrompt = `You are a professional translator. Translate from Czech to ${localeLabel.lang}. Rules:
- Preserve emojis, line breaks and punctuation exactly.
- Brand names (e.g. "Salon Aria"), proper nouns and acronyms stay unchanged.
- Numbers, prices and currencies stay unchanged.
- HTML tags (<br>, <strong>, etc.) stay unchanged.
- Return ONLY a JSON object mapping id → translation. No code fence, no commentary.`;

  const userPrompt = `Translate these strings to ${localeLabel.lang}. Return JSON only.\n\n` +
    JSON.stringify(Object.fromEntries(allStrings.map((s) => [s.id, s.value])), null, 2);

  let translations: Record<string, string>;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return Response.json({ error: `Claude API ${r.status}`, detail: txt.slice(0, 200) }, { status: 502 });
    }
    const json = await r.json() as { content?: Array<{ type: string; text?: string }> };
    const raw = (json.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    translations = JSON.parse(stripped) as Record<string, string>;
  } catch (e) {
    return Response.json({ error: `Překlad selhal: ${(e as Error).message}` }, { status: 500 });
  }

  // Build a per-section translation map keyed by path.
  type SectionTrans = { content: Record<string, string>; overrides: Record<string, string> };
  const sectionTrans: Map<number, SectionTrans> = new Map();
  const pageTrans: Record<string, string> = {};
  for (const [id, src] of stringSourceMap.entries()) {
    const t = translations[id];
    if (!t) continue;
    if (src.field === "page") {
      pageTrans[src.path.join(".")] = t;
      continue;
    }
    let entry = sectionTrans.get(src.sectionIdx);
    if (!entry) { entry = { content: {}, overrides: {} }; sectionTrans.set(src.sectionIdx, entry); }
    entry[src.field][src.path.join(".")] = t;
  }

  // Insert target page + cloned sections (with translated content).
  const newPage = await withTransaction(async (client) => {
    const ins = await client.query<{ id: number }>(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, $2, $3, false, 'draft', $4, $5) RETURNING id`,
      [
        tenant.id,
        targetSlug,
        pageTrans.title ?? `${src.title} (${localeLabel.native})`,
        pageTrans.seo_title ?? src.seo_title,
        pageTrans.seo_description ?? src.seo_description,
      ]
    );
    const newPageId = ins.rows[0]?.id;
    if (!newPageId) return null;

    sections.forEach((s, idx) => {
      const trans = sectionTrans.get(idx) ?? { content: {}, overrides: {} };
      const content = applyTranslations(s.settings?.content ?? {}, trans.content) as Record<string, unknown>;
      const overrides = applyTranslations(s.content_overrides ?? {}, trans.overrides) as Record<string, unknown>;
      const settings = { ...(s.settings ?? {}), content };
      client.query(
        `INSERT INTO sections (
           tenant_id, page_id, section_type, section_variant, order_index,
           is_visible, settings, content_overrides, content_source
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)`,
        [
          tenant.id, newPageId, s.section_type, s.section_variant, s.order_index,
          s.is_visible, JSON.stringify(settings), JSON.stringify(overrides), s.content_source,
        ]
      );
    });

    return newPageId;
  });

  await auditLog("page_translated", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(newPage),
    extra: {
      sourcePageId: pid,
      sourceSlug: src.slug,
      targetSlug,
      locale,
      stringsTranslated: Object.keys(translations).length,
    },
  });

  return Response.json({
    ok: true,
    newPageId: newPage,
    targetSlug,
    locale,
    stringsTranslated: Object.keys(translations).length,
  });
}
