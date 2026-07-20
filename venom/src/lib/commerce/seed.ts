import type { PoolClient } from "pg";
import { COMMERCE_CORE_MODULES } from "./schema";
import { ensureShopInTx } from "./shop";

/**
 * Commerce activation — runs INSIDE the tenant-factory transaction so an
 * e-shop tenant is created atomically (tenant + shop + moduly + demo katalog).
 *
 * Idempotent: safe to call again on an existing commerce tenant.
 */
export async function activateCommerceInTx(
  client: PoolClient,
  tenantId: number,
  opts: { shopName?: string; seedDemoCatalog?: boolean } = {}
): Promise<void> {
  await client.query(
    "UPDATE tenants SET tenant_kind = 'commerce', updated_at = now() WHERE id = $1",
    [tenantId]
  );

  await ensureShopInTx(client, tenantId, { name: opts.shopName });

  for (const moduleKey of COMMERCE_CORE_MODULES) {
    await client.query(
      `INSERT INTO tenant_modules (tenant_id, module_key, enabled)
       VALUES ($1, $2, true)
       ON CONFLICT (tenant_id, module_key) DO UPDATE SET enabled = true, updated_at = now()`,
      [tenantId, moduleKey]
    );
  }

  if (opts.seedDemoCatalog !== false) {
    await seedDemoCatalogInTx(client, tenantId);
  }
}

// ── Demo katalog ──────────────────────────────────────────────────────────────
// Neutrální ukázkový sortiment — každá commerce šablona ho může later přepsat
// vlastním oborovým seedem (fashion/beauty/food…). Ceny v haléřích.

interface DemoVariant {
  sku: string;
  title?: string;
  optionValues?: Record<string, string>;
  priceCents: number;
  compareAtCents?: number;
  stock: number;
}

interface DemoProduct {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  brand?: string;
  category: string; // category slug
  options?: Array<{ name: string; values: string[] }>;
  variants: DemoVariant[];
  flags?: Record<string, unknown>;
  images?: Array<{ url: string; alt: string }>;
}

const DEMO_CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 0, image: "/assets/eshop-01/mikina-oversize.webp" },
  { slug: "obleceni", name: "Oblečení", sort: 1, image: "/assets/eshop-01/tricko-classic.webp" },
  { slug: "doplnky", name: "Doplňky", sort: 2, image: "/assets/eshop-01/platena-taska.webp" },
  { slug: "domacnost", name: "Domácnost", sort: 3, image: "/assets/eshop-01/svicka.webp" },
];

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: "tricko-classic",
    images: [{ url: "/assets/eshop-01/tricko-classic.webp", alt: "Tričko Classic — černá na ramínku" }, { url: "/assets/eshop-01/tricko-classic-bila.webp", alt: "Tričko Classic — bílá" }],
    title: "Tričko Classic",
    subtitle: "100% organická bavlna",
    description: "Nadčasové tričko z těžké organické bavlny 220 g/m². Předsrážené, drží tvar i barvu po desítkách praní.",
    brand: "Webero Demo",
    category: "obleceni",
    options: [
      { name: "Barva", values: ["Černá", "Bílá"] },
      { name: "Velikost", values: ["S", "M", "L", "XL"] },
    ],
    variants: [
      { sku: "TC-BLK-M", title: "Černá / M", optionValues: { Barva: "Černá", Velikost: "M" }, priceCents: 59900, stock: 24 },
      { sku: "TC-BLK-L", title: "Černá / L", optionValues: { Barva: "Černá", Velikost: "L" }, priceCents: 59900, stock: 18 },
      { sku: "TC-WHT-M", title: "Bílá / M", optionValues: { Barva: "Bílá", Velikost: "M" }, priceCents: 59900, stock: 12 },
    ],
    flags: { featured: true },
  },
  {
    slug: "mikina-oversize",
    images: [{ url: "/assets/eshop-01/mikina-oversize.webp", alt: "Mikina Oversize s kapucí" }],
    title: "Mikina Oversize",
    subtitle: "Počesaný fleece, spadlá ramena",
    description: "Prémiová mikina s kapucí ze 400 g/m² počesaného fleecu. Oversize střih, žebrované lemy, vyšité logo.",
    brand: "Webero Demo",
    category: "obleceni",
    options: [{ name: "Velikost", values: ["S", "M", "L"] }],
    variants: [
      { sku: "MO-S", title: "S", optionValues: { Velikost: "S" }, priceCents: 149900, compareAtCents: 179900, stock: 8 },
      { sku: "MO-M", title: "M", optionValues: { Velikost: "M" }, priceCents: 149900, compareAtCents: 179900, stock: 15 },
      { sku: "MO-L", title: "L", optionValues: { Velikost: "L" }, priceCents: 149900, compareAtCents: 179900, stock: 6 },
    ],
    flags: { featured: true, sale: true },
  },
  {
    slug: "platena-taska",
    images: [{ url: "/assets/eshop-01/platena-taska.webp", alt: "Plátěná taška černá" }],
    title: "Plátěná taška",
    description: "Odolná taška z tlusté režné bavlny s dlouhými uchy. Unese týdenní nákup, složíte ji do kapsy.",
    brand: "Webero Demo",
    category: "doplnky",
    variants: [{ sku: "PT-01", priceCents: 29900, stock: 60 }],
  },
  {
    slug: "termohrnek-350",
    images: [{ url: "/assets/eshop-01/termohrnek.webp", alt: "Termohrnek 350 ml" }],
    title: "Termohrnek 350 ml",
    subtitle: "Dvoustěnná nerez, 8 hodin teplý",
    description: "Dvoustěnný nerezový termohrnek s vakuovou izolací. Nápoj udrží 8 hodin teplý a 12 hodin studený.",
    brand: "Webero Demo",
    category: "domacnost",
    options: [{ name: "Barva", values: ["Grafitová", "Krémová"] }],
    variants: [
      { sku: "TH-GRF", title: "Grafitová", optionValues: { Barva: "Grafitová" }, priceCents: 69900, stock: 32 },
      { sku: "TH-CRM", title: "Krémová", optionValues: { Barva: "Krémová" }, priceCents: 69900, stock: 21 },
    ],
    flags: { new: true },
  },
  {
    slug: "svicka-cedr-vanilka",
    images: [{ url: "/assets/eshop-01/svicka.webp", alt: "Svíčka Cedr & Vanilka" }],
    title: "Svíčka Cedr & Vanilka",
    subtitle: "Sójový vosk, 45 hodin hoření",
    description: "Ručně litá svíčka ze 100% sójového vosku s dřevěným knotem. Tóny cedrového dřeva, vanilky a ambry.",
    brand: "Webero Demo",
    category: "domacnost",
    variants: [{ sku: "SV-CV", priceCents: 44900, stock: 40 }],
    flags: { new: true },
  },
  {
    slug: "ponozky-merino-2pack",
    images: [{ url: "/assets/eshop-01/ponozky-merino.webp", alt: "Ponožky Merino" }],
    title: "Ponožky Merino (2 páry)",
    description: "Celoroční ponožky z merino vlny — termoregulace, žádný zápach, zpevněná pata i špička.",
    brand: "Webero Demo",
    category: "obleceni",
    options: [{ name: "Velikost", values: ["36–40", "41–45"] }],
    variants: [
      { sku: "PM-36", title: "36–40", optionValues: { Velikost: "36–40" }, priceCents: 39900, stock: 25 },
      { sku: "PM-41", title: "41–45", optionValues: { Velikost: "41–45" }, priceCents: 39900, stock: 30 },
    ],
  },
];

export async function seedDemoCatalogInTx(client: PoolClient, tenantId: number): Promise<void> {
  // Idempotence guard — never double-seed a tenant that already has products.
  const existing = await client.query(
    "SELECT 1 FROM products WHERE tenant_id = $1 LIMIT 1",
    [tenantId]
  );
  if (existing.rows.length) return;

  const categoryIds = new Map<string, number>();
  for (const cat of DEMO_CATEGORIES) {
    const res = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, sort_order, is_visible, image_url)
       VALUES ($1, $2, $3, $4, true, $5)
       ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
       RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.sort, cat.image ?? null]
    );
    categoryIds.set(cat.slug, res.rows[0].id);
  }

  for (const product of DEMO_PRODUCTS) {
    const categoryId = categoryIds.get(product.category) ?? null;
    const pRes = await client.query(
      `INSERT INTO products
         (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9)
       ON CONFLICT (tenant_id, slug) DO NOTHING
       RETURNING id`,
      [
        tenantId, product.slug, product.title, product.subtitle ?? null, product.description,
        product.brand ?? null, categoryId,
        JSON.stringify(product.options ?? []), JSON.stringify(product.flags ?? {}),
      ]
    );
    if (!pRes.rows.length) continue;
    const productId: number = pRes.rows[0].id;

    if (categoryId) {
      await client.query(
        `INSERT INTO product_category_links (tenant_id, product_id, category_id)
         VALUES ($1, $2, $3) ON CONFLICT (product_id, category_id) DO NOTHING`,
        [tenantId, productId, categoryId]
      );
      // Novinky = smart-collection-like druhá kategorie pro flagged produkty
      const novinky = categoryIds.get("novinky");
      if (novinky && (product.flags?.new || product.flags?.featured)) {
        await client.query(
          `INSERT INTO product_category_links (tenant_id, product_id, category_id)
           VALUES ($1, $2, $3) ON CONFLICT (product_id, category_id) DO NOTHING`,
          [tenantId, productId, novinky]
        );
      }
    }

    for (let i = 0; i < (product.images ?? []).length; i++) {
      const img = product.images![i];
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, productId, img.url, img.alt, i]
      );
    }

    for (let i = 0; i < product.variants.length; i++) {
      const v = product.variants[i];
      const vRes = await client.query(
        `INSERT INTO product_variants
           (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents,
            stock_qty, is_default, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          tenantId, productId, v.sku, v.title ?? null, JSON.stringify(v.optionValues ?? {}),
          v.priceCents, v.compareAtCents ?? null, v.stock, i === 0, i,
        ]
      );
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1, $2, $3, $4, 'import', 'Demo seed')`,
        [tenantId, vRes.rows[0].id, v.stock, v.stock]
      );
    }
  }
}
