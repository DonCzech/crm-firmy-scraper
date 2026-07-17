import { query, queryOne, withTransaction } from "@/lib/db";
import { initCommerceDb } from "./schema";
import type { ProductCategory } from "./types";

export interface CategoryInput {
  slug: string;
  name: string;
  parent_id?: number | null;
  description?: string | null;
  image_url?: string | null;
  is_visible?: boolean;
  sort_order?: number;
  seo_title?: string | null;
  seo_description?: string | null;
}

export async function listCategories(tenantId: number): Promise<Array<ProductCategory & { product_count: number }>> {
  await initCommerceDb();
  const rows = await query<ProductCategory & { product_count: string }>(
    `SELECT c.*,
            (SELECT COUNT(*)::text FROM product_category_links l WHERE l.category_id = c.id) AS product_count
       FROM product_categories c
      WHERE c.tenant_id = $1
      ORDER BY c.sort_order, c.name`,
    [tenantId]
  );
  return rows.map((r) => ({ ...r, product_count: parseInt(r.product_count, 10) }));
}

export async function getCategory(tenantId: number, categoryId: number): Promise<ProductCategory | null> {
  await initCommerceDb();
  return queryOne<ProductCategory>(
    "SELECT * FROM product_categories WHERE tenant_id = $1 AND id = $2",
    [tenantId, categoryId]
  );
}

export async function getCategoryBySlug(tenantId: number, slug: string): Promise<ProductCategory | null> {
  await initCommerceDb();
  return queryOne<ProductCategory>(
    "SELECT * FROM product_categories WHERE tenant_id = $1 AND slug = $2",
    [tenantId, slug]
  );
}

export async function createCategory(tenantId: number, input: CategoryInput): Promise<ProductCategory> {
  await initCommerceDb();
  const rows = await query<ProductCategory>(
    `INSERT INTO product_categories
       (tenant_id, parent_id, slug, name, description, image_url, is_visible, sort_order, seo_title, seo_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      tenantId,
      input.parent_id ?? null,
      input.slug,
      input.name,
      input.description ?? null,
      input.image_url ?? null,
      input.is_visible ?? true,
      input.sort_order ?? 0,
      input.seo_title ?? null,
      input.seo_description ?? null,
    ]
  );
  return rows[0];
}

export async function updateCategory(
  tenantId: number,
  categoryId: number,
  patch: Partial<CategoryInput>
): Promise<ProductCategory | null> {
  await initCommerceDb();

  return withTransaction(async (client) => {
    const current = await client.query(
      "SELECT * FROM product_categories WHERE tenant_id = $1 AND id = $2 FOR UPDATE",
      [tenantId, categoryId]
    );
    if (!current.rows.length) return null;
    const row = current.rows[0] as ProductCategory;

    // A parent must belong to the same tenant and must not create a cycle
    // (self-loop or a move under any of the category's own descendants).
    if (patch.parent_id != null) {
      if (patch.parent_id === categoryId) throw new Error("Kategorie nemůže být svým vlastním rodičem");
      const parent = await client.query(
        "SELECT id FROM product_categories WHERE tenant_id = $1 AND id = $2",
        [tenantId, patch.parent_id]
      );
      if (!parent.rows.length) throw new Error("Nadřazená kategorie neexistuje");
      const cycle = await client.query(
        `WITH RECURSIVE sub AS (
           SELECT id FROM product_categories WHERE tenant_id = $1 AND parent_id = $2
           UNION ALL
           SELECT c.id FROM product_categories c JOIN sub s ON c.parent_id = s.id WHERE c.tenant_id = $1
         )
         SELECT 1 FROM sub WHERE id = $3 LIMIT 1`,
        [tenantId, categoryId, patch.parent_id]
      );
      if (cycle.rows.length) throw new Error("Přesun pod vlastní podkategorii by vytvořil cyklus");
    }

    // Slug change → keep a 301 redirect record for SEO.
    if (patch.slug && patch.slug !== row.slug) {
      await client.query(
        `INSERT INTO commerce_slug_redirects (tenant_id, entity_type, from_slug, to_slug)
         VALUES ($1, 'category', $2, $3)
         ON CONFLICT (tenant_id, entity_type, from_slug) DO UPDATE SET to_slug = $3`,
        [tenantId, row.slug, patch.slug]
      );
    }

    const fields: Array<[string, unknown]> = [];
    const allowed = ["slug", "name", "description", "image_url", "is_visible", "sort_order", "parent_id", "seo_title", "seo_description"] as const;
    for (const key of allowed) {
      if (patch[key] !== undefined) fields.push([key, patch[key]]);
    }
    if (!fields.length) return row;

    const sets = fields.map(([k], i) => `${k} = $${i + 3}`).join(", ");
    const updated = await client.query(
      `UPDATE product_categories SET ${sets}, updated_at = now()
       WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [tenantId, categoryId, ...fields.map(([, v]) => v)]
    );
    return updated.rows[0] as ProductCategory;
  });
}

export async function deleteCategory(tenantId: number, categoryId: number): Promise<boolean> {
  await initCommerceDb();
  // The admin dialog promises "smazat včetně všech podkategorií" — the FK is
  // ON DELETE SET NULL, so delete the whole subtree explicitly in one transaction.
  return withTransaction(async (client) => {
    const rows = await client.query(
      `WITH RECURSIVE sub AS (
         SELECT id FROM product_categories WHERE tenant_id = $1 AND id = $2
         UNION ALL
         SELECT c.id FROM product_categories c JOIN sub s ON c.parent_id = s.id WHERE c.tenant_id = $1
       )
       DELETE FROM product_categories WHERE tenant_id = $1 AND id IN (SELECT id FROM sub)
       RETURNING id`,
      [tenantId, categoryId]
    );
    return rows.rows.length > 0;
  });
}
