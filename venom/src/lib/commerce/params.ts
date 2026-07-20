import { query, queryOne } from "@/lib/db";
import { initCommerceDb } from "./schema";

export interface ParamDefinition {
  id: number;
  tenant_id: number;
  slug: string;
  name: string;
  type: string;
  unit: string | null;
  filterable: boolean;
  position: number;
}

export interface ProductParam {
  id: number;
  tenant_id: number;
  product_id: number;
  param_id: number;
  value: string;
  numeric_value: number | null;
  name: string;
  unit: string | null;
}

export interface ParamDefinitionInput {
  slug: string;
  name: string;
  type?: string;
  unit?: string | null;
  filterable?: boolean;
}

export interface FilterableParam {
  id: number;
  slug: string;
  name: string;
  type: string;
  unit: string | null;
  values: string[];
}

export async function listParamDefinitions(tenantId: number): Promise<ParamDefinition[]> {
  await initCommerceDb();
  return query<ParamDefinition>(
    `SELECT * FROM commerce_param_definitions
      WHERE tenant_id = $1
      ORDER BY position, name`,
    [tenantId]
  );
}

export async function createParamDefinition(
  tenantId: number,
  data: ParamDefinitionInput
): Promise<ParamDefinition> {
  await initCommerceDb();
  const rows = await query<ParamDefinition>(
    `INSERT INTO commerce_param_definitions
       (tenant_id, slug, name, type, unit, filterable)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      tenantId,
      data.slug,
      data.name,
      data.type ?? "text",
      data.unit ?? null,
      data.filterable ?? false,
    ]
  );
  return rows[0];
}

export async function updateParamDefinition(
  tenantId: number,
  paramId: number,
  data: Partial<ParamDefinitionInput>
): Promise<ParamDefinition | null> {
  await initCommerceDb();

  const fields: Array<[string, unknown]> = [];
  const allowed = ["slug", "name", "type", "unit", "filterable"] as const;
  for (const key of allowed) {
    if (data[key] !== undefined) fields.push([key, data[key]]);
  }
  if (!fields.length) {
    return queryOne<ParamDefinition>(
      "SELECT * FROM commerce_param_definitions WHERE tenant_id = $1 AND id = $2",
      [tenantId, paramId]
    );
  }

  const sets = fields.map(([k], i) => `${k} = $${i + 3}`).join(", ");
  const rows = await query<ParamDefinition>(
    `UPDATE commerce_param_definitions SET ${sets}
      WHERE tenant_id = $1 AND id = $2
      RETURNING *`,
    [tenantId, paramId, ...fields.map(([, v]) => v)]
  );
  return rows[0] ?? null;
}

export async function deleteParamDefinition(tenantId: number, paramId: number): Promise<boolean> {
  await initCommerceDb();
  const rows = await query<{ id: number }>(
    "DELETE FROM commerce_param_definitions WHERE tenant_id = $1 AND id = $2 RETURNING id",
    [tenantId, paramId]
  );
  return rows.length > 0;
}

export async function getProductParams(tenantId: number, productId: number): Promise<ProductParam[]> {
  await initCommerceDb();
  return query<ProductParam>(
    `SELECT pp.*, pd.name, pd.unit
       FROM commerce_product_params pp
       JOIN commerce_param_definitions pd ON pd.id = pp.param_id AND pd.tenant_id = pp.tenant_id
      WHERE pp.tenant_id = $1 AND pp.product_id = $2
      ORDER BY pd.position, pd.name`,
    [tenantId, productId]
  );
}

export async function setProductParams(
  tenantId: number,
  productId: number,
  params: Array<{ param_id: number; value: string }>
): Promise<void> {
  await initCommerceDb();

  const keepIds = params.map((p) => p.param_id);

  if (keepIds.length === 0) {
    await query(
      "DELETE FROM commerce_product_params WHERE tenant_id = $1 AND product_id = $2",
      [tenantId, productId]
    );
    return;
  }

  await query(
    `DELETE FROM commerce_product_params
      WHERE tenant_id = $1 AND product_id = $2
        AND param_id != ALL($3::int[])`,
    [tenantId, productId, keepIds]
  );

  for (const p of params) {
    await query(
      `INSERT INTO commerce_product_params (tenant_id, product_id, param_id, value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, param_id)
       DO UPDATE SET value = EXCLUDED.value`,
      [tenantId, productId, p.param_id, p.value]
    );
  }
}

export async function getFilterableParams(
  tenantId: number,
  categoryId?: number
): Promise<FilterableParam[]> {
  await initCommerceDb();

  const categoryFilter = categoryId
    ? `AND pp.product_id IN (
         SELECT product_id FROM product_category_links WHERE category_id = $2
       )`
    : "";

  const args: unknown[] = categoryId ? [tenantId, categoryId] : [tenantId];

  const rows = await query<{
    id: number;
    slug: string;
    name: string;
    type: string;
    unit: string | null;
    values: string;
  }>(
    `SELECT pd.id, pd.slug, pd.name, pd.type, pd.unit,
            array_to_json(ARRAY(
              SELECT DISTINCT pp.value
                FROM commerce_product_params pp
               WHERE pp.param_id = pd.id AND pp.tenant_id = pd.tenant_id
                 ${categoryFilter}
               ORDER BY pp.value
            ))::text AS values
       FROM commerce_param_definitions pd
      WHERE pd.tenant_id = $1 AND pd.filterable = true
      ORDER BY pd.position, pd.name`,
    args
  );

  return rows.map((r) => ({
    ...r,
    values: JSON.parse(r.values) as string[],
  }));
}

export async function filterProductsByParams(
  tenantId: number,
  filters: Record<string, string[]>
): Promise<number[]> {
  await initCommerceDb();

  const entries = Object.entries(filters).filter(([, vals]) => vals.length > 0);
  if (entries.length === 0) return [];

  const conditions: string[] = [];
  const args: unknown[] = [tenantId];
  let idx = 2;

  for (const [paramSlug, values] of entries) {
    conditions.push(
      `p.id IN (
        SELECT pp.product_id
          FROM commerce_product_params pp
          JOIN commerce_param_definitions pd ON pd.id = pp.param_id AND pd.tenant_id = pp.tenant_id
         WHERE pp.tenant_id = $1
           AND pd.slug = $${idx}
           AND pp.value = ANY($${idx + 1}::text[])
      )`
    );
    args.push(paramSlug, values);
    idx += 2;
  }

  const rows = await query<{ id: number }>(
    `SELECT p.id FROM products p
      WHERE p.tenant_id = $1
        AND ${conditions.join(" AND ")}
      ORDER BY p.id`,
    args
  );

  return rows.map((r) => r.id);
}
