/**
 * F1 — Section content resolver.
 *
 * Read-through render pipeline:
 *   templateDefaults (template_versions, cached) ⊕ tenant_data_slots ⊕ section.content_overrides
 *
 * This module is currently NOT WIRED into SectionRenderer. Step 3 will branch on
 * section.content_source ('legacy' vs 'v2') and call resolveSectionContent for v2 rows.
 * Existing tenants stay on 'legacy' path until migration.
 */
import { query, queryOne, type Section, type Tenant } from "./db";

// ── Public types ──────────────────────────────────────────────────────────────

export interface TemplateSectionDefault {
  type: string;
  variant: string;
  order: number;
  visible?: boolean;
  anchorId?: string;
  content?: Record<string, unknown>;
}

export interface TemplateVersionRow {
  template_id: number;
  template_key: string;
  version: string;
  default_sections: TemplateSectionDefault[];
  default_design_tokens: Record<string, unknown>;
  default_demo_content: Record<string, unknown>;
  checksum: string | null;
}

export interface ResolvedContent {
  content: Record<string, unknown>;
  source: "legacy" | "template";
  modifiedPaths: string[];
}

export type SectionV2 = Section & {
  content_overrides?: Record<string, unknown>;
  content_source?: "legacy" | "v2" | string;
};

export type TenantWithKey = Tenant & { template_key?: string };

// ── Template version cache (LRU, 5 min TTL) ───────────────────────────────────

const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1000;
const TEMPLATE_CACHE_MAX = 100;
const templateCache = new Map<string, { data: TemplateVersionRow; expires: number }>();

export async function getTemplateVersionCached(
  templateKey: string,
  version: string
): Promise<TemplateVersionRow | null> {
  const cacheKey = `${templateKey}@${version}`;
  const now = Date.now();
  const hit = templateCache.get(cacheKey);
  if (hit && hit.expires > now) return hit.data;

  const row = await queryOne<TemplateVersionRow>(
    `SELECT tv.template_id,
            t.key AS template_key,
            tv.version,
            tv.default_sections,
            tv.default_design_tokens,
            tv.default_demo_content,
            tv.checksum
       FROM template_versions tv
       JOIN templates t ON t.id = tv.template_id
      WHERE t.key = $1 AND tv.version = $2`,
    [templateKey, version]
  );
  if (!row) return null;

  // Simple FIFO eviction when at cap
  if (templateCache.size >= TEMPLATE_CACHE_MAX) {
    const firstKey = templateCache.keys().next().value;
    if (firstKey) templateCache.delete(firstKey);
  }
  templateCache.set(cacheKey, { data: row, expires: now + TEMPLATE_CACHE_TTL_MS });
  return row;
}

export function invalidateTemplateCache(templateKey?: string, version?: string): void {
  if (!templateKey) {
    templateCache.clear();
    return;
  }
  if (version) {
    templateCache.delete(`${templateKey}@${version}`);
    return;
  }
  for (const k of Array.from(templateCache.keys())) {
    if (k.startsWith(`${templateKey}@`)) templateCache.delete(k);
  }
}

// ── Tenant data slots cache (60s TTL — invalidate on write) ───────────────────

const SLOTS_CACHE_TTL_MS = 60 * 1000;
const slotsCache = new Map<number, { data: Map<string, unknown>; expires: number }>();

export async function getTenantDataSlotsCached(tenantId: number): Promise<Map<string, unknown>> {
  const now = Date.now();
  const hit = slotsCache.get(tenantId);
  if (hit && hit.expires > now) return hit.data;

  const rows = await query<{ slot_key: string; value: unknown }>(
    "SELECT slot_key, value FROM tenant_data_slots WHERE tenant_id = $1",
    [tenantId]
  );
  const map = new Map<string, unknown>();
  for (const r of rows) map.set(r.slot_key, r.value);
  slotsCache.set(tenantId, { data: map, expires: now + SLOTS_CACHE_TTL_MS });
  return map;
}

export function invalidateSlotsCache(tenantId?: number): void {
  if (typeof tenantId === "number") slotsCache.delete(tenantId);
  else slotsCache.clear();
}

// ── $slot reference resolution ────────────────────────────────────────────────

type SlotRef = { $slot: string };

function isSlotRef(v: unknown): v is SlotRef {
  return (
    typeof v === "object" &&
    v !== null &&
    "$slot" in v &&
    typeof (v as { $slot: unknown }).$slot === "string"
  );
}

export function resolveSlotRefs(input: unknown, slots: Map<string, unknown>): unknown {
  if (isSlotRef(input)) {
    return slots.get(input.$slot) ?? null;
  }
  if (Array.isArray(input)) return input.map((x) => resolveSlotRefs(x, slots));
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = resolveSlotRefs(v, slots);
    }
    return out;
  }
  return input;
}

// ── Sparse overrides merge (deep) ─────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function applySparseOverrides(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>,
  modifiedPaths: string[],
  prefix = ""
): Record<string, unknown> {
  if (!overrides || Object.keys(overrides).length === 0) return base;
  const result: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(overrides)) {
    const fullPath = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v) && isPlainObject(result[k])) {
      result[k] = applySparseOverrides(
        result[k] as Record<string, unknown>,
        v,
        modifiedPaths,
        fullPath
      );
    } else {
      result[k] = v;
      modifiedPaths.push(fullPath);
    }
  }
  return result;
}

// ── Main resolver ─────────────────────────────────────────────────────────────

function legacyContent(section: SectionV2): Record<string, unknown> {
  const settings = section.settings as { content?: Record<string, unknown> } | undefined;
  return settings?.content ?? {};
}

export async function resolveSectionContent(
  section: SectionV2,
  tenant: TenantWithKey
): Promise<ResolvedContent> {
  const source = section.content_source ?? "legacy";
  if (source !== "v2") {
    return { content: legacyContent(section), source: "legacy", modifiedPaths: [] };
  }

  const templateKey =
    tenant.template_key ??
    (
      await queryOne<{ key: string }>("SELECT key FROM templates WHERE id = $1", [
        tenant.template_id,
      ])
    )?.key;
  if (!templateKey) {
    return { content: legacyContent(section), source: "legacy", modifiedPaths: [] };
  }

  const tmpl = await getTemplateVersionCached(templateKey, tenant.template_version);
  if (!tmpl) {
    return { content: legacyContent(section), source: "legacy", modifiedPaths: [] };
  }

  const sectionDefault =
    tmpl.default_sections.find(
      (s) => s.type === section.section_type && s.order === section.order_index
    ) ?? tmpl.default_sections.find((s) => s.type === section.section_type);

  let merged: Record<string, unknown> = sectionDefault?.content
    ? (JSON.parse(JSON.stringify(sectionDefault.content)) as Record<string, unknown>)
    : {};

  const slots = await getTenantDataSlotsCached(tenant.id);
  merged = resolveSlotRefs(merged, slots) as Record<string, unknown>;

  const modifiedPaths: string[] = [];
  merged = applySparseOverrides(merged, section.content_overrides ?? {}, modifiedPaths);

  return { content: merged, source: "template", modifiedPaths };
}

// ── Sparse diff (reverse of applySparseOverrides) ─────────────────────────────
//
// Computes the sparse difference of `next` vs `base`. Returns only fields where
// `next` differs from `base`. Used at studio save time: studio sends back fully
// merged content (which it edits), and we extract just what differs from
// (templateDefault + slots) and store in sections.content_overrides.

function isPlainObjectStrict(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
}

export function sparseDiff(
  next: Record<string, unknown>,
  base: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(next)) {
    const nv = next[k];
    const bv = base[k];
    if (isPlainObjectStrict(nv) && isPlainObjectStrict(bv)) {
      const sub = sparseDiff(nv, bv);
      if (Object.keys(sub).length > 0) out[k] = sub;
    } else if (JSON.stringify(nv) !== JSON.stringify(bv)) {
      out[k] = nv;
    }
  }
  return out;
}

/**
 * For v2 sections, compute content_overrides from a studio-submitted fully-merged content.
 * Returns { contentOverrides, anchorId } — caller writes contentOverrides to the dedicated
 * column and leaves settings.content untouched.
 */
export async function computeOverridesForSubmit(
  section: SectionV2,
  tenant: TenantWithKey,
  submittedContent: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (section.content_source !== "v2") return submittedContent;

  const templateKey =
    tenant.template_key ??
    (
      await queryOne<{ key: string }>("SELECT key FROM templates WHERE id = $1", [tenant.template_id])
    )?.key;
  if (!templateKey) return submittedContent;

  const tmpl = await getTemplateVersionCached(templateKey, tenant.template_version);
  if (!tmpl) return submittedContent;

  const sectionDefault =
    tmpl.default_sections.find((s) => s.type === section.section_type && s.order === section.order_index)
    ?? tmpl.default_sections.find((s) => s.type === section.section_type);
  const defaultContent = sectionDefault?.content ?? {};

  // Resolve $slot refs in defaults so diff happens against "what user sees"
  const slots = await getTenantDataSlotsCached(tenant.id);
  const resolvedDefault = resolveSlotRefs(JSON.parse(JSON.stringify(defaultContent)), slots) as Record<string, unknown>;

  return sparseDiff(submittedContent, resolvedDefault);
}

// ── Batch resolve all sections for a tenant ───────────────────────────────────
//
// Fetches template_key once via single query, then resolves each section.
// Returns sections with `settings.content` replaced by resolved content (legacy
// rows unchanged). Optional metadata fields `_resolvedSource` and `_modifiedPaths`
// added for studio "modified" indicator (Krok 6).
//
// Safe to call from server components (page.tsx). Zero impact on legacy rows:
// they return identical `section.settings.content`.

export interface SectionResolved extends SectionV2 {
  _resolvedSource?: "legacy" | "template";
  _modifiedPaths?: string[];
}

export async function resolveAllSections(
  tenant: Tenant,
  sections: SectionV2[]
): Promise<SectionResolved[]> {
  // Fast path: if all sections are legacy, skip template_key lookup entirely.
  const anyV2 = sections.some((s) => s.content_source === "v2");
  if (!anyV2) {
    return sections.map((s) => ({
      ...s,
      _resolvedSource: "legacy" as const,
      _modifiedPaths: [],
    }));
  }

  const tplKeyRow = await queryOne<{ key: string }>(
    "SELECT key FROM templates WHERE id = $1",
    [tenant.template_id]
  );
  const tenantWithKey: TenantWithKey = { ...tenant, template_key: tplKeyRow?.key };

  return Promise.all(
    sections.map(async (s) => {
      const resolved = await resolveSectionContent(s, tenantWithKey);
      const currentSettings = (s.settings ?? {}) as Record<string, unknown>;
      return {
        ...s,
        settings: { ...currentSettings, content: resolved.content },
        _resolvedSource: resolved.source,
        _modifiedPaths: resolved.modifiedPaths,
      };
    })
  );
}

// ── Test helpers (for unit tests, no DB) ──────────────────────────────────────

export const __testing__ = {
  resolveSlotRefs,
  applySparseOverrides,
  templateCacheSize: () => templateCache.size,
  slotsCacheSize: () => slotsCache.size,
};
