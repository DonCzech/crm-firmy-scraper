/**
 * Seed produktového katalogu pro eshop-06-v2 (Ořeškárna — svetplodu DNA).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-06-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-06-v2";

const U = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// Ověřené Unsplash food fotky (už používané v repu)
const P = {
  nuts: "1508061253366-f7da158b6d46",
  strawberries: "1601493700631-2b16ec4b4716",
  dried: "1596591606975-97ee5cef3a1e",
  chocBerries: "1481391319762-47dff72954d9",
  berries: "1490474418585-ba9bad8fd0ea",
  pineapple: "1470119693884-47d3a1d1f180",
  bowl: "1512621776951-a57141f2eefd",
  baking: "1509440159596-0249088772ff",
  food1: "1553531384-cc64ac80f931",
  food2: "1543339308-43e59d6b73a6",
  fruit: "1559181567-c3190ca9959b",
  food3: "1504674900247-0877df9cc836",
  food4: "1504674900247-0877df9cc836",
  porridgeMango: "1571748982800-fa51082c2224",
  porridgeStrawberry: "1464965911861-746a04b4bca6",
  raspberry: "1615485290382-441e4d049cb5",
  fruitTable: "1490818387583-1baba5e638af",
};

const CATEGORIES = [
  { slug: "orechy", name: "Ořechy", sort: 0, desc: "Pražíme každý týden v malých šaržích." },
  { slug: "mandle", name: "Mandle", sort: 0, parent: "orechy" },
  { slug: "kesu", name: "Kešu", sort: 1, parent: "orechy" },
  { slug: "vlasske-orechy", name: "Vlašské ořechy", sort: 2, parent: "orechy" },
  { slug: "pistacie", name: "Pistácie", sort: 3, parent: "orechy" },
  { slug: "krupave-ovoce", name: "Křupavé ovoce", sort: 1, desc: "Šetrně sušené mrazem — chuť jako z trhu." },
  { slug: "krupave-jahody", name: "Jahody", sort: 0, parent: "krupave-ovoce" },
  { slug: "krupave-maliny", name: "Maliny", sort: 1, parent: "krupave-ovoce" },
  { slug: "krupave-mango", name: "Mango", sort: 2, parent: "krupave-ovoce" },
  { slug: "susene-plody", name: "Sušené plody", sort: 2 },
  { slug: "datle-a-fiky", name: "Datle a fíky", sort: 0, parent: "susene-plody" },
  { slug: "merunky", name: "Meruňky", sort: 1, parent: "susene-plody" },
  { slug: "mlsani", name: "Mlsání", sort: 3 },
  { slug: "plody-v-cokolade", name: "Plody v čokoládě", sort: 0, parent: "mlsani" },
  { slug: "orechy-v-cokolade", name: "Ořechy v čokoládě", sort: 1, parent: "mlsani" },
  { slug: "energeticke-kulicky", name: "Energetické kuličky", sort: 2, parent: "mlsani" },
  { slug: "krupko-smesi", name: "Křupko® směsi", sort: 4, desc: "Naše poctivé směsi míchané ručně." },
  { slug: "do-kuchyne", name: "Do kuchyně", sort: 5 },
  { slug: "orechova-masla", name: "Ořechová másla", sort: 0, parent: "do-kuchyne" },
  { slug: "superpotraviny", name: "Superpotraviny", sort: 6 },
  { slug: "doplnkove-sluzby", name: "Doplňkové služby", sort: 99, hidden: true },
  { slug: "seminka-a-klicky", name: "Semínka a klíčky", sort: 0, parent: "superpotraviny" },
];

// price v haléřích za 100g; varianty 100g / 500g (×4.4, zaokr.)
const g500 = (p) => Math.round((p * 4.4) / 100) * 100;
const PRODUCTS = [
  { slug: "mandle-natural", title: "Mandle natural", subtitle: "Španělská odrůda, sladká a šťavnatá", cat: "mandle", brand: "Ořeškárna", price: 8900, stock: 120, flags: { featured: true }, img: [P.nuts, P.food1] },
  { slug: "mandle-prazene-solene", title: "Mandle pražené na sucho solené", subtitle: "Pražíme bez oleje, jen mořská sůl", cat: "mandle", brand: "Ořeškárna", price: 9500, compare: 11900, stock: 80, flags: { featured: true }, img: [P.nuts, P.food2] },
  { slug: "kesu-natural", title: "Kešu natural", subtitle: "Máslově jemné, křehké", cat: "kesu", brand: "Ořeškárna", price: 10900, stock: 95, flags: { featured: true }, img: [P.food2, P.nuts] },
  { slug: "kesu-prazene-sul", title: "Kešu pražené s mořskou solí", subtitle: "Zlatavě dopražené do křupava", cat: "kesu", brand: "Ořeškárna", price: 11900, stock: 60, img: [P.food1, P.nuts] },
  { slug: "vlasska-jadra", title: "Vlašská jádra výběrová", subtitle: "Světlá půlená jádra, čerstvá sklizeň", cat: "vlasske-orechy", brand: "Ořeškárna", price: 12900, stock: 70, flags: { featured: true }, img: [P.food3, P.nuts] },
  { slug: "pistacie-prazene", title: "Pistácie pražené solené", subtitle: "V skořápce, pražené pomalu", cat: "pistacie", brand: "Ořeškárna", price: 14900, stock: 55, flags: { featured: true }, img: [P.food4, P.nuts] },
  { slug: "krupave-jahodove-platky", title: "Křupavé jahodové plátky", subtitle: "100 % ovoce, bez cukru", cat: "krupave-jahody", brand: "Ořeškárna", price: 11900, compare: 14900, stock: 90, flags: { featured: true, new: true }, img: [P.strawberries, P.berries] },
  { slug: "krupave-jahody-cele", title: "Křupavé jahody celé", subtitle: "Celé plody sušené mrazem", cat: "krupave-jahody", brand: "Ořeškárna", price: 13900, stock: 65, flags: { new: true }, img: [P.berries, P.strawberries] },
  { slug: "krupave-maliny-cele", title: "Křupavé maliny celé", subtitle: "Křehké a plné chuti", cat: "krupave-maliny", brand: "Ořeškárna", price: 15900, stock: 45, flags: { new: true }, img: [P.raspberry, P.berries] },
  { slug: "krupave-mango-kostky", title: "Křupavé mango kostky", subtitle: "Sladké jako med", cat: "krupave-mango", brand: "Ořeškárna", price: 12900, stock: 75, flags: { featured: true }, img: [P.fruit, P.pineapple] },
  { slug: "malinova-drt", title: "Malinová drť", subtitle: "Do jogurtu, kaše i na dort", cat: "krupave-maliny", brand: "Ořeškárna", price: 6900, compare: 10500, stock: 30, img: [P.raspberry, P.bowl] },
  { slug: "datle-medjool", title: "Datle Medjool", subtitle: "Královská odrůda, karamelová dužina", cat: "datle-a-fiky", brand: "Ořeškárna", price: 9900, stock: 85, flags: { featured: true }, img: [P.dried, P.fruitTable] },
  { slug: "fiky-susene", title: "Fíky sušené natural", subtitle: "Bez síření, měkké", cat: "datle-a-fiky", brand: "Ořeškárna", price: 7900, stock: 100, img: [P.dried, P.food3] },
  { slug: "merunky-susene", title: "Meruňky sušené", subtitle: "Nesířené, tmavé a medové", cat: "merunky", brand: "Ořeškárna", price: 8500, compare: 9900, stock: 50, img: [P.fruitTable, P.dried] },
  { slug: "jahody-v-mlecne-cokolade", title: "Jahody v mléčné čokoládě", subtitle: "Křupavé jahody, poctivá čokoláda", cat: "plody-v-cokolade", brand: "Ořeškárna", price: 13900, stock: 70, flags: { featured: true, new: true }, img: [P.chocBerries, P.strawberries] },
  { slug: "mandle-v-horke-cokolade", title: "Mandle v hořké čokoládě", subtitle: "70% kakaa, jemně hořké", cat: "orechy-v-cokolade", brand: "Ořeškárna", price: 11900, stock: 80, flags: { featured: true }, img: [P.chocBerries, P.nuts] },
  { slug: "kesu-v-bile-cokolade", title: "Kešu v bílé čokoládě se skořicí", subtitle: "Sváteční klasika", cat: "orechy-v-cokolade", brand: "Ořeškárna", price: 12500, stock: 40, img: [P.food1, P.chocBerries] },
  { slug: "energeticke-kulicky-kakao", title: "Energetické kuličky kakao & datle", subtitle: "Jen 4 suroviny, bez cukru", cat: "energeticke-kulicky", brand: "Křupko®", price: 9900, stock: 60, flags: { new: true }, img: [P.bowl, P.food4] },
  { slug: "studentska-klasika", title: "Studentská klasika", subtitle: "Ořechy a rozinky v poměru, který funguje", cat: "krupko-smesi", brand: "Křupko®", price: 7900, stock: 110, flags: { featured: true }, img: [P.nuts, P.dried] },
  { slug: "sportovni-mix", title: "Sportovní mix", subtitle: "Energie na trail i do posilovny", cat: "krupko-smesi", brand: "Křupko®", price: 8900, stock: 90, img: [P.bowl, P.nuts] },
  { slug: "mix-do-kancelare", title: "Mix do kanceláře", subtitle: "Křupání k práci bez výčitek", cat: "krupko-smesi", brand: "Křupko®", price: 7500, compare: 8900, stock: 75, img: [P.food2, P.bowl] },
  { slug: "mandlove-maslo", title: "Mandlové máslo 100%", subtitle: "Jen mleté mandle, nic víc", cat: "orechova-masla", brand: "Ořeškárna", price: 16900, stock: 45, flags: { featured: true }, img: [P.baking, P.nuts], weights: ["190g", "500g"] },
  { slug: "kesu-maslo", title: "Kešu máslo jemné", subtitle: "Krémové, lehce nasládlé", cat: "orechova-masla", brand: "Ořeškárna", price: 17900, stock: 35, img: [P.baking, P.food1], weights: ["190g", "500g"] },
  { slug: "arasidove-maslo-krupave", title: "Arašídové máslo křupavé", subtitle: "S kousky pražených arašídů", cat: "orechova-masla", brand: "Ořeškárna", price: 8900, compare: 10500, stock: 65, img: [P.baking, P.food2], weights: ["330g", "1kg"] },
  { slug: "chia-seminka", title: "Chia semínka", subtitle: "Do kaší, pudinků i pečení", cat: "seminka-a-klicky", brand: "Ořeškárna", price: 4900, stock: 130, img: [P.bowl, P.food3] },
  // Doplňkové služby ke košíku (svetplodu pattern) — skrytá kategorie
  { slug: "sluzba-darkova-taska", title: "Dárková papírová taška", subtitle: "Recyklovaný papír s logem Ořeškárny", cat: "doplnkove-sluzby", brand: "Ořeškárna", price: 1900, stock: 9999, img: [P.food2], weights: ["Služba"] },
  { slug: "sluzba-spropitne-balicce", title: "Spropitné pro baličku", subtitle: "Potěší toho, kdo váš balíček chystá", cat: "doplnkove-sluzby", brand: "Ořeškárna", price: 1900, stock: 9999, img: [], weights: ["Služba"] },
  { slug: "sluzba-bezplatne-vraceni", title: "Bezplatné vrácení zboží", subtitle: "Zpětná doprava zdarma po celé ČR", cat: "doplnkove-sluzby", brand: "Ořeškárna", price: 2900, stock: 9999, img: [], weights: ["Služba"] },
  { slug: "sluzba-prednostni-odeslani", title: "Přednostní odeslání", subtitle: "Váš balíček přeskočí frontu ve skladu", cat: "doplnkove-sluzby", brand: "Ořeškárna", price: 5900, stock: 9999, img: [], weights: ["Služba"] },
  { slug: "dynova-seminka-prazena", title: "Dýňová semínka pražená", subtitle: "S mořskou solí, ještě teplá voní", cat: "seminka-a-klicky", brand: "Ořeškárna", price: 5900, stock: 105, img: [P.food4, P.bowl] },
];

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  const tRes = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
  if (!tRes.rows.length) throw new Error(`Tenant ${TENANT_SLUG} not found`);
  const tenantId = tRes.rows[0].id;

  await client.query("BEGIN");
  for (const tbl of ["stock_movements", "product_images", "product_category_links", "product_variants", "products", "product_categories"]) {
    await client.query(`DELETE FROM ${tbl} WHERE tenant_id = $1`, [tenantId]);
  }

  const catIds = new Map();
  for (const cat of CATEGORIES.filter(x => !x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, !cat.hidden]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }
  for (const cat of CATEGORIES.filter(x => x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id)
       VALUES ($1,$2,$3,$4,$5,true,$6) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, catIds.get(cat.parent)]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }

  let pc = 0, vc = 0;
  for (const p of PRODUCTS) {
    const weights = p.weights ?? ["100g", "500g"];
    const desc = `${p.subtitle}. ${p.title} z naší dílny — pražíme a balíme v malých šaržích, aby k vám dorazily vždy čerstvé. Skladujte v suchu a temnu.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.subtitle, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: "Balení", values: weights }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await client.query(
      `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [tenantId, pid, catIds.get(p.cat)]
    );
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) {
      await client.query(
        `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [tenantId, pid, catIds.get(parent)]
      );
    }

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
      );
    }

    const prices = [p.price, g500(p.price), Math.round(p.price * 7.6 / 100) * 100];
    const compares = [p.compare ?? null, p.compare ? g500(p.compare) : null, null];
    for (let i = 0; i < weights.length; i++) {
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase().slice(0, 14)}-${weights[i].toUpperCase()}`, weights[i],
         JSON.stringify({ "Balení": weights[i] }), prices[i], compares[i], p.stock, i === 0, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-06 seed')`,
        [tenantId, vr.rows[0].id, p.stock, p.stock]
      );
    }
  }

  await client.query("COMMIT");
  console.log(`✅ ${TENANT_SLUG}: ${catIds.size} kategorií, ${pc} produktů, ${vc} variant`);
} catch (e) {
  await client.query("ROLLBACK");
  console.error("❌", e.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
