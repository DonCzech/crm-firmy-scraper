#!/usr/bin/env node
/**
 * eshop-09 "Mobil Expres" — doplňkové služby do košíku (mp.cz „Doporučujeme").
 * Skrytá kategorie doplnkove-sluzby + 3 služby (záruka / pojištění / sklo s nalepením).
 * Spuštění: export DATABASE_URL=... && node scripts/seed-eshop-09-services.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-09-v2";
const U = (id) => `https://images.unsplash.com/${id}?w=240&h=240&fit=crop&auto=format&q=80`;

const SERVICES = [
  { slug: "sluzba-prodlouzena-zaruka", title: "Prodloužená záruka +1 rok", price: 99000, img: "photo-1556742049-0cfed4f6a45d" },
  { slug: "sluzba-pojisteni-displeje", title: "Pojištění displeje na 1 rok", price: 205000, img: "photo-1512941937669-90a1b58e7e9c" },
  { slug: "sluzba-tvrzene-sklo-nalepeni", title: "Tvrzené sklo s nalepením zdarma", price: 89900, img: "photo-1603313011101-320f26a4f6f6" },
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const tRes = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
if (!tRes.rows.length) throw new Error(`Tenant ${TENANT_SLUG} not found`);
const tenantId = tRes.rows[0].id;

await client.query("BEGIN");

let catId;
const cRes = await client.query(
  "SELECT id FROM product_categories WHERE tenant_id = $1 AND slug = 'doplnkove-sluzby'", [tenantId]);
if (cRes.rows.length) {
  catId = cRes.rows[0].id;
} else {
  const r = await client.query(
    `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible)
     VALUES ($1,'doplnkove-sluzby','Doplňkové služby',NULL,999,false) RETURNING id`,
    [tenantId]
  );
  catId = r.rows[0].id;
}

let n = 0;
for (const s of SERVICES) {
  const exists = await client.query(
    "SELECT id FROM products WHERE tenant_id = $1 AND slug = $2", [tenantId, s.slug]);
  if (exists.rows.length) continue;
  const r = await client.query(
    `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
     VALUES ($1,$2,$3,NULL,$4,'Mobil Expres','active',$5,$6,'{}') RETURNING id`,
    [tenantId, s.slug, s.title, `${s.title} — doplňková služba Mobil Expres.`, catId,
     JSON.stringify([{ name: "Provedení", values: ["Standard"] }])]
  );
  const pid = r.rows[0].id;
  await client.query(
    `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
    [tenantId, pid, catId]
  );
  await client.query(
    `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,0)`,
    [tenantId, pid, U(s.img), s.title]
  );
  const vr = await client.query(
    `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
     VALUES ($1,$2,$3,'Standard',$4,$5,NULL,9999,true,0) RETURNING id`,
    [tenantId, pid, `${s.slug.toUpperCase()}-0`, JSON.stringify({ Provedení: "Standard" }), s.price]
  );
  await client.query(
    `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
     VALUES ($1,$2,9999,9999,'import','eshop-09 services seed')`,
    [tenantId, vr.rows[0].id]
  );
  n++;
}

await client.query("COMMIT");
console.log(`✅ ${TENANT_SLUG}: kategorie doplnkove-sluzby (id ${catId}), ${n} nových služeb`);
await client.end();
