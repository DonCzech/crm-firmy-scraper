/**
 * F1 — Canonical data slot registry.
 *
 * Tenant-level shared data that survives template switches. Templates reference
 * via `{"$slot": "contact.phone"}` markers in their content/cs.json — resolver
 * substitutes the tenant's actual value at render time.
 *
 * To add a new slot: add a SLOT_REGISTRY entry. Migration script (Krok 5)
 * auto-extracts known slot keys from legacy section content.
 */
import { query, queryOne, withTransaction } from "./db";
import { invalidateSlotsCache } from "./section-resolver";

export type SlotType = "string" | "number" | "boolean" | "url" | "color" | "json";

export interface SlotDefinition {
  key: string;
  type: SlotType;
  category: "brand" | "contact" | "hours" | "social" | "company" | "seo";
  label: string;
  description?: string;
  /** Field paths in legacy section content that should auto-migrate to this slot. */
  legacyPaths?: string[];
}

export const SLOT_REGISTRY: SlotDefinition[] = [
  // ── Brand ────────────────────────────────────────────────────────────────
  { key: "brand.name",          type: "string", category: "brand",  label: "Název firmy",          legacyPaths: ["navbar.siteName", "footer.siteName"] },
  { key: "brand.tagline",       type: "string", category: "brand",  label: "Tagline",              legacyPaths: ["navbar.tagline"] },
  { key: "brand.logoUrl",       type: "url",    category: "brand",  label: "Logo URL",             legacyPaths: ["navbar.logoUrl", "footer.logoUrl"] },
  { key: "brand.colorPrimary",  type: "color",  category: "brand",  label: "Primární barva" },
  { key: "brand.colorAccent",   type: "color",  category: "brand",  label: "Akcentová barva" },

  // ── Contact ──────────────────────────────────────────────────────────────
  { key: "contact.phone",       type: "string", category: "contact", label: "Telefon",            legacyPaths: ["navbar.phone", "footer.phone", "contact.phone"] },
  { key: "contact.email",       type: "string", category: "contact", label: "E-mail",             legacyPaths: ["navbar.email", "footer.email", "contact.email"] },
  { key: "contact.address",     type: "string", category: "contact", label: "Adresa",             legacyPaths: ["contact.address", "footer.address"] },
  { key: "contact.city",        type: "string", category: "contact", label: "Město",              legacyPaths: ["contact.city"] },
  { key: "contact.zip",         type: "string", category: "contact", label: "PSČ",                legacyPaths: ["contact.zip"] },

  // ── Opening hours ────────────────────────────────────────────────────────
  { key: "hours.monday",        type: "string", category: "hours", label: "Pondělí" },
  { key: "hours.tuesday",       type: "string", category: "hours", label: "Úterý" },
  { key: "hours.wednesday",     type: "string", category: "hours", label: "Středa" },
  { key: "hours.thursday",      type: "string", category: "hours", label: "Čtvrtek" },
  { key: "hours.friday",        type: "string", category: "hours", label: "Pátek" },
  { key: "hours.saturday",      type: "string", category: "hours", label: "Sobota" },
  { key: "hours.sunday",        type: "string", category: "hours", label: "Neděle" },

  // ── Social ───────────────────────────────────────────────────────────────
  { key: "social.facebook",     type: "url",    category: "social",  label: "Facebook" },
  { key: "social.instagram",    type: "url",    category: "social",  label: "Instagram" },
  { key: "social.linkedin",     type: "url",    category: "social",  label: "LinkedIn" },
  { key: "social.youtube",      type: "url",    category: "social",  label: "YouTube" },
  { key: "social.tiktok",       type: "url",    category: "social",  label: "TikTok" },

  // ── Company ──────────────────────────────────────────────────────────────
  { key: "company.ico",         type: "string", category: "company", label: "IČO" },
  { key: "company.dic",         type: "string", category: "company", label: "DIČ" },
  { key: "company.legalName",   type: "string", category: "company", label: "Obchodní název" },

  // ── SEO ──────────────────────────────────────────────────────────────────
  { key: "seo.defaultTitle",       type: "string", category: "seo", label: "Výchozí title" },
  { key: "seo.defaultDescription", type: "string", category: "seo", label: "Výchozí description" },
  { key: "seo.ogImage",            type: "url",    category: "seo", label: "Výchozí OG image" },
];

const SLOT_KEYS = new Set(SLOT_REGISTRY.map((s) => s.key));

export function isValidSlotKey(key: string): boolean {
  return SLOT_KEYS.has(key);
}

export function getSlotDefinition(key: string): SlotDefinition | undefined {
  return SLOT_REGISTRY.find((s) => s.key === key);
}

/** Reverse map: legacy field path → slot key. Used by migration script. */
const LEGACY_PATH_INDEX: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const def of SLOT_REGISTRY) {
    for (const p of def.legacyPaths ?? []) {
      m.set(p, def.key);
    }
  }
  return m;
})();

export function legacyPathToSlotKey(path: string): string | undefined {
  return LEGACY_PATH_INDEX.get(path);
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export interface SlotRow {
  slot_key: string;
  value: unknown;
  updated_at: string;
}

export async function getSlot(tenantId: number, slotKey: string): Promise<SlotRow | null> {
  return queryOne<SlotRow>(
    "SELECT slot_key, value, updated_at FROM tenant_data_slots WHERE tenant_id = $1 AND slot_key = $2",
    [tenantId, slotKey]
  );
}

export async function getAllSlots(tenantId: number): Promise<SlotRow[]> {
  return query<SlotRow>(
    "SELECT slot_key, value, updated_at FROM tenant_data_slots WHERE tenant_id = $1 ORDER BY slot_key",
    [tenantId]
  );
}

export async function upsertSlot(tenantId: number, slotKey: string, value: unknown): Promise<void> {
  if (!isValidSlotKey(slotKey)) {
    throw new Error(`Unknown slot key: ${slotKey}`);
  }
  await query(
    `INSERT INTO tenant_data_slots (tenant_id, slot_key, value, updated_at)
     VALUES ($1, $2, $3::jsonb, now())
     ON CONFLICT (tenant_id, slot_key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = now()`,
    [tenantId, slotKey, JSON.stringify(value)]
  );
  invalidateSlotsCache(tenantId);
}

export async function upsertSlotsBatch(
  tenantId: number,
  entries: Array<{ key: string; value: unknown }>
): Promise<void> {
  if (entries.length === 0) return;
  for (const e of entries) {
    if (!isValidSlotKey(e.key)) throw new Error(`Unknown slot key: ${e.key}`);
  }
  await withTransaction(async (client) => {
    for (const e of entries) {
      await client.query(
        `INSERT INTO tenant_data_slots (tenant_id, slot_key, value, updated_at)
         VALUES ($1, $2, $3::jsonb, now())
         ON CONFLICT (tenant_id, slot_key) DO UPDATE
           SET value = EXCLUDED.value, updated_at = now()`,
        [tenantId, e.key, JSON.stringify(e.value)]
      );
    }
  });
  invalidateSlotsCache(tenantId);
}

export async function deleteSlot(tenantId: number, slotKey: string): Promise<void> {
  await query("DELETE FROM tenant_data_slots WHERE tenant_id = $1 AND slot_key = $2", [
    tenantId,
    slotKey,
  ]);
  invalidateSlotsCache(tenantId);
}
