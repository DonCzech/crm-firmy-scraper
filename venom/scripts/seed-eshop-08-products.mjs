/**
 * Seed produktového katalogu pro eshop-08-v2 (Domea — bonami DNA, nábytek a bydlení).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-08-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-08-v2";

const U = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const P = {
  sofa: "1555041469-a586c61ea9bc",
  armchair: "1586023492125-27b2c045efd7",
  bed: "1505693416388-ac5ce068fe85",
  dining: "1519710164239-da123dc03ef4",
  shelf: "1533090481720-856c6e3c1fdc",
  sideTable: "1499933374294-4584851497cc",
  bench: "1600585154340-be6161a56a0c",
  poster: "1513519245088-0e12902e35ca",
  mirror: "1618220179428-22790b461013",
  vase: "1578500494198-246f612d3b3d",
  candle: "1556228453-efd6c1ff04f6",
  clock: "1563861826100-9cb868fdbe1c",
  ceiling: "1513506003901-1e6a229e2d15",
  tableLamp: "1507473885765-e6ed057f782c",
  floorLamp: "1567016432779-094069958ea5",
  rug: "1600166898405-da9535204843",
  curtains: "1513694203232-719a280e022f",
  bedding: "1522771739844-6a9f6d5f14af",
  blanket: "1616627561950-9f746e330187",
  pillow: "1584100936595-c0654b55a2e2",
  dishes: "1556911220-bff31c812dba",
  mugs: "1514228742587-6b1558fcca3d",
  kitchen: "1565538810643-b5bdb714032a",
  garden: "1506439773649-6e0eb8cfb237",
  gardenTable: "1416879595882-3373a0480b5b",
  patio: "1520250497591-112f2f40a3f4",
  kids: "1519689680058-324335c77eba",
  interior: "1600210492486-724fe5c67fb0",
  desk: "1524758631624-e2822e304c36",
};

const CATEGORIES = [
  { slug: "nabytek", name: "Nábytek", sort: 0, desc: "Kousky, které tvoří domov." },
  { slug: "pohovky", name: "Sedací soupravy a pohovky", sort: 0, parent: "nabytek" },
  { slug: "kresla", name: "Křesla a taburety", sort: 1, parent: "nabytek" },
  { slug: "postele", name: "Postele a matrace", sort: 2, parent: "nabytek" },
  { slug: "stoly", name: "Stoly a židle", sort: 3, parent: "nabytek" },
  { slug: "ulozne-prostory", name: "Úložné prostory", sort: 4, parent: "nabytek" },
  { slug: "stolky", name: "Odkládací stolky", sort: 5, parent: "nabytek" },
  { slug: "lavice", name: "Lavice a věšáky", sort: 6, parent: "nabytek" },
  { slug: "doplnky", name: "Doplňky a dekorace", sort: 1 },
  { slug: "obrazy", name: "Obrazy a plakáty", sort: 0, parent: "doplnky" },
  { slug: "zrcadla", name: "Zrcadla", sort: 1, parent: "doplnky" },
  { slug: "vazy", name: "Vázy a květináče", sort: 2, parent: "doplnky" },
  { slug: "svicky", name: "Svíčky a difuzéry", sort: 3, parent: "doplnky" },
  { slug: "hodiny", name: "Hodiny", sort: 4, parent: "doplnky" },
  { slug: "osvetleni", name: "Osvětlení", sort: 2 },
  { slug: "stropni-svitidla", name: "Stropní svítidla", sort: 0, parent: "osvetleni" },
  { slug: "stolni-lampy", name: "Stolní lampy", sort: 1, parent: "osvetleni" },
  { slug: "stojaci-lampy", name: "Stojací lampy", sort: 2, parent: "osvetleni" },
  { slug: "textil", name: "Textil", sort: 3 },
  { slug: "koberce", name: "Koberce", sort: 0, parent: "textil" },
  { slug: "zavesy", name: "Závěsy a záclony", sort: 1, parent: "textil" },
  { slug: "povleceni", name: "Povlečení", sort: 2, parent: "textil" },
  { slug: "deky", name: "Deky a plédy", sort: 3, parent: "textil" },
  { slug: "polstare", name: "Dekorační polštáře", sort: 4, parent: "textil" },
  { slug: "kuchyne", name: "Kuchyně a stolování", sort: 4 },
  { slug: "nadobi", name: "Nádobí a servírování", sort: 0, parent: "kuchyne" },
  { slug: "hrnky", name: "Hrnky a sklenice", sort: 1, parent: "kuchyne" },
  { slug: "zahrada", name: "Zahrada a balkon", sort: 5 },
  { slug: "zahradni-sety", name: "Zahradní sety", sort: 0, parent: "zahrada" },
  { slug: "zahradni-stolky", name: "Zahradní stolky", sort: 1, parent: "zahrada" },
  { slug: "venkovni-koberce", name: "Venkovní koberce", sort: 2, parent: "zahrada" },
  { slug: "detsky-svet", name: "Dětský svět", sort: 6 },
  { slug: "detske-postele", name: "Dětské postele", sort: 0, parent: "detsky-svet" },
  { slug: "slevy", name: "Slevy & Outlet", sort: 90 },
];

// price v haléřích; jedna varianta „Standard" (nábytek), textil barvy
const PRODUCTS = [
  { slug: "pohovka-tori", title: "Pohovka Tori", subtitle: "Manšestrová, rozkládací, s úložným prostorem, světle zelená", cat: "pohovky", brand: "Fjorda", price: 2684900, stock: 8, flags: { featured: true }, img: [P.sofa, P.interior] },
  { slug: "pohovka-nube", title: "Pohovka Nube třímístná", subtitle: "Bouclé, krémová, hloubka sedáku 62 cm", cat: "pohovky", brand: "Casa Lumo", price: 3199000, compare: 3799000, stock: 5, flags: { featured: true }, img: [P.interior, P.sofa] },
  { slug: "kreslo-morvana", title: "Křeslo Morvana", subtitle: "Se snímatelným potahem, khaki/hnědé", cat: "kresla", brand: "Bizetto", price: 1889900, compare: 2149900, stock: 12, flags: { featured: true, new: true }, img: [P.armchair, P.interior] },
  { slug: "kreslo-aisha", title: "Křeslo Aisha", subtitle: "Sametové čalounění, šedomodré", cat: "kresla", brand: "Bizetto", price: 819000, stock: 20, flags: { featured: true }, img: [P.armchair, P.sofa] },
  { slug: "kreslo-vince", title: "Křeslo Vince", subtitle: "Žinylkové, lahvově zelené", cat: "kresla", brand: "MOMO Living", price: 889900, stock: 9, flags: { new: true }, img: [P.armchair] },
  { slug: "postel-skagen", title: "Postel Skagen 180×200", subtitle: "Masivní dub, čalouněné čelo", cat: "postele", brand: "Nordhem", price: 2459000, stock: 6, flags: { featured: true }, img: [P.bed, P.bedding] },
  { slug: "jidelni-stul-elva", title: "Jídelní stůl Elva 160 cm", subtitle: "Dubová dýha, kovové nohy", cat: "stoly", brand: "Nordhem", price: 1299000, compare: 1549000, stock: 10, flags: { featured: true }, img: [P.dining, P.interior] },
  { slug: "regal-frame", title: "Regál Frame 5 polic", subtitle: "Černý kov a dubové police", cat: "ulozne-prostory", brand: "Fjorda", price: 649000, stock: 15, img: [P.shelf] },
  { slug: "odkladaci-stolek-luna", title: "Odkládací stolek Luna", subtitle: "Mramorová deska, zlatá podnož", cat: "stolky", brand: "Casa Lumo", price: 329000, stock: 25, flags: { new: true }, img: [P.sideTable] },
  { slug: "lavice-porto", title: "Lavice Porto s úložným prostorem", subtitle: "Čalouněná, béžová, 120 cm", cat: "lavice", brand: "Fjorda", price: 549000, compare: 649000, stock: 14, img: [P.bench] },
  { slug: "plakat-line-art", title: "Plakát Line Art no. 3", subtitle: "50×70 cm, matný papír 200 g", cat: "obrazy", brand: "Atelier Sever", price: 79000, stock: 60, flags: { new: true }, img: [P.poster] },
  { slug: "zrcadlo-organic", title: "Zrcadlo Organic 80 cm", subtitle: "Atypický tvar, bez rámu", cat: "zrcadla", brand: "Casa Lumo", price: 419000, stock: 18, flags: { featured: true }, img: [P.mirror] },
  { slug: "vaza-terra", title: "Váza Terra 28 cm", subtitle: "Ručně točená kamenina, terakota", cat: "vazy", brand: "Atelier Sever", price: 89000, stock: 45, img: [P.vase] },
  { slug: "sada-svicek-hygge", title: "Sada svíček Hygge 3 ks", subtitle: "Sójový vosk, santalové dřevo", cat: "svicky", brand: "Domea Selection", price: 59000, compare: 74000, stock: 80, img: [P.candle] },
  { slug: "nastenne-hodiny-oslo", title: "Nástěnné hodiny Oslo 30 cm", subtitle: "Tichý chod, dubová dýha", cat: "hodiny", brand: "Nordhem", price: 129000, stock: 30, img: [P.clock] },
  { slug: "stropni-svitidlo-globe", title: "Stropní svítidlo Globe", subtitle: "Opálové sklo, mosazný závěs", cat: "stropni-svitidla", brand: "Lumo", price: 359000, stock: 22, flags: { featured: true }, img: [P.ceiling] },
  { slug: "stolni-lampa-arch", title: "Stolní lampa Arch", subtitle: "Matná černá, stmívatelná", cat: "stolni-lampy", brand: "Lumo", price: 189000, stock: 35, flags: { new: true }, img: [P.tableLamp] },
  { slug: "stojaci-lampa-tripod", title: "Stojací lampa Tripod", subtitle: "Jasanové nohy, lněné stínidlo", cat: "stojaci-lampy", brand: "Lumo", price: 429000, compare: 499000, stock: 12, img: [P.floorLamp] },
  { slug: "koberec-flair", title: "Koberec Flair 160×230", subtitle: "Hebký vysoký vlas, krémový", cat: "koberce", brand: "Flair Home", price: 549000, compare: 699000, stock: 16, flags: { featured: true }, img: [P.rug] },
  { slug: "povleceni-perkal", title: "Povlečení Perkál 140×200", subtitle: "100% česaná bavlna, šalvějová", cat: "povleceni", brand: "Domea Selection", price: 149000, stock: 50, img: [P.bedding], variants: ["Šalvějová", "Krémová", "Antracit"] },
  { slug: "pled-merino", title: "Pléd Merino 130×170", subtitle: "Jemná merino vlna, karamelový", cat: "deky", brand: "Domea Selection", price: 219000, stock: 28, flags: { new: true }, img: [P.blanket] },
  { slug: "polstar-boucle-set", title: "Polštář Bouclé 45×45 — set 2 ks", subtitle: "Krémová a karamelová", cat: "polstare", brand: "Casa Lumo", price: 99000, compare: 129000, stock: 40, img: [P.pillow] },
  { slug: "jidelni-sada-mist", title: "Jídelní sada Mist 16 ks", subtitle: "Kamenina, matná glazura", cat: "nadobi", brand: "Domea Selection", price: 249000, stock: 24, flags: { featured: true }, img: [P.dishes] },
  { slug: "hrnky-ritual-set", title: "Hrnky Ritual — set 4 ks", subtitle: "400 ml, dvojité stěny", cat: "hrnky", brand: "Domea Selection", price: 79000, stock: 55, img: [P.mugs] },
  { slug: "zahradni-set-como", title: "Zahradní set Como", subtitle: "Stůl + 4 křesla, umělý ratan", cat: "zahradni-sety", brand: "Terra Garden", price: 1899000, compare: 2299000, stock: 7, flags: { featured: true }, img: [P.garden, P.patio] },
  { slug: "zahradni-stolek-breeze", title: "Zahradní stolek Breeze", subtitle: "Hliník, mentolový", cat: "zahradni-stolky", brand: "Terra Garden", price: 219000, stock: 20, img: [P.gardenTable] },
  { slug: "venkovni-koberec-terazzo", title: "Venkovní koberec Terazzo 120×170", subtitle: "UV stálý, snadná údržba", cat: "venkovni-koberce", brand: "Flair Home", price: 179000, compare: 219000, stock: 26, img: [P.rug, P.patio] },
  { slug: "detska-postel-domek", title: "Dětská postel Domeček 90×200", subtitle: "Borovice, s bezpečnostní zábranou", cat: "detske-postele", brand: "Nordhem Kids", price: 899000, stock: 9, flags: { new: true }, img: [P.kids] },
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
    const variants = p.variants ?? ["Standard"];
    const optName = p.variants ? "Barva" : "Provedení";
    const desc = `${p.subtitle}. ${p.title} od značky ${p.brand} — pečlivě vybraný kousek z kolekce Domea. Doručení až domů, 60 dní na vrácení.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.subtitle, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: optName, values: variants }]), JSON.stringify(p.flags ?? {})]
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
    if (p.compare) {
      await client.query(
        `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [tenantId, pid, catIds.get("slevy")]
      );
    }

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase().slice(0, 14)}-${i}`, variants[i],
         JSON.stringify({ [optName]: variants[i] }), p.price, p.compare ?? null, p.stock, i === 0, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-08 seed')`,
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
