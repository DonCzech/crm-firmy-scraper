import { query, queryOne } from "@/lib/db";
import { initCommerceDb } from "./schema";

export const SUPPORTED_LOCALES = ["cs", "sk", "en", "de", "pl"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<string, string> = {
  cs: "Čeština", sk: "Slovenčina", en: "English", de: "Deutsch", pl: "Polski",
};

export const TRANSLATABLE_FIELDS: Record<string, string[]> = {
  product: ["title", "subtitle", "description", "seo_title", "seo_description"],
  category: ["name", "description", "seo_title", "seo_description"],
  shipping_method: ["label", "description"],
  payment_method: ["label", "description"],
};

export interface Translation {
  id: number;
  entity_type: string;
  entity_id: number;
  locale: string;
  field: string;
  value: string;
}

export async function getTranslations(tenantId: number, entityType: string, entityId: number, locale?: string) {
  await initCommerceDb();
  if (locale) {
    return query<Translation>(
      `SELECT * FROM commerce_translations WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3 AND locale = $4`,
      [tenantId, entityType, entityId, locale]
    ) ?? [];
  }
  return query<Translation>(
    `SELECT * FROM commerce_translations WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3 ORDER BY locale, field`,
    [tenantId, entityType, entityId]
  ) ?? [];
}

export async function setTranslation(
  tenantId: number, entityType: string, entityId: number, locale: string, field: string, value: string
) {
  await initCommerceDb();
  return queryOne<Translation>(
    `INSERT INTO commerce_translations (tenant_id, entity_type, entity_id, locale, field, value)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (tenant_id, entity_type, entity_id, locale, field) DO UPDATE SET value = $6
     RETURNING *`,
    [tenantId, entityType, entityId, locale, field, value]
  );
}

export async function setTranslationsBulk(
  tenantId: number, entityType: string, entityId: number, locale: string,
  fields: Record<string, string>
) {
  await initCommerceDb();
  const entries = Object.entries(fields).filter(([, v]) => v.trim());
  for (const [field, value] of entries) {
    await setTranslation(tenantId, entityType, entityId, locale, field, value);
  }
  const fieldNames = entries.map(([f]) => f);
  if (fieldNames.length > 0) {
    await query(
      `DELETE FROM commerce_translations
       WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3 AND locale = $4
       AND field NOT IN (${fieldNames.map((_, i) => `$${i + 5}`).join(",")})`,
      [tenantId, entityType, entityId, locale, ...fieldNames]
    );
  }
}

export async function deleteTranslations(tenantId: number, entityType: string, entityId: number) {
  await initCommerceDb();
  await query(
    `DELETE FROM commerce_translations WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3`,
    [tenantId, entityType, entityId]
  );
}

export async function getTranslatedField(
  tenantId: number, entityType: string, entityId: number, locale: string, field: string
): Promise<string | null> {
  await initCommerceDb();
  const row = await queryOne<{ value: string }>(
    `SELECT value FROM commerce_translations WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3 AND locale = $4 AND field = $5`,
    [tenantId, entityType, entityId, locale, field]
  );
  return row?.value ?? null;
}

export async function getTranslationCoverage(tenantId: number, entityType: string) {
  await initCommerceDb();
  const rows = await query<{ locale: string; translated: number; total: number }>(
    `SELECT t.locale,
       COUNT(DISTINCT t.entity_id)::int AS translated,
       (SELECT COUNT(*)::int FROM ${entityType === "product" ? "products" : "product_categories"} WHERE tenant_id = $1 AND ${entityType === "product" ? "status = 'active'" : "is_visible = true"}) AS total
     FROM commerce_translations t
     WHERE t.tenant_id = $1 AND t.entity_type = $2
     GROUP BY t.locale`,
    [tenantId, entityType]
  );
  return rows ?? [];
}

/** Hromadné načtení překladů pro víc entit najednou (listing) → mapa entity_id → field → value. */
export async function getTranslationsMap(
  tenantId: number, entityType: string, entityIds: number[], locale: string
): Promise<Map<number, Record<string, string>>> {
  const map = new Map<number, Record<string, string>>();
  if (!entityIds.length) return map;
  await initCommerceDb();
  const rows = await query<Translation>(
    `SELECT * FROM commerce_translations
     WHERE tenant_id = $1 AND entity_type = $2 AND locale = $3 AND entity_id = ANY($4)`,
    [tenantId, entityType, locale, entityIds]
  );
  for (const t of rows ?? []) {
    if (!t.value) continue;
    const entry = map.get(t.entity_id) ?? {};
    entry[t.field] = t.value;
    map.set(t.entity_id, entry);
  }
  return map;
}

export function applyTranslations<T extends Record<string, unknown>>(
  entity: T,
  translations: Translation[],
  fields: string[]
): T {
  const result = { ...entity };
  for (const t of translations) {
    if (fields.includes(t.field) && t.value) {
      (result as Record<string, unknown>)[t.field] = t.value;
    }
  }
  return result;
}
