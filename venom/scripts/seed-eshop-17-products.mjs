/**
 * Seed produktového katalogu pro eshop-17-v2 (Rozkvět — online květinářství).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Demo data: vlastní názvy odrůd (žádné originály z florea.cz), ceny ±15–30 % od zadání,
 * subtitle = délka stonku • počet květů. flags.bulk = množstevní sleva %, flags.freeShip = doprava zdarma.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-17-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-17-v2";

const U = (id, w = 800, h = 800) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;

const IMG = {
  redBig: U("photo-1494972308805-463bc619d34e"),
  redBouquet: U("photo-1487530811176-3780de880c2d"),
  redDark: U("photo-1496062031456-07b8f162a322"),
  redLong: U("photo-1599733594230-6b823276abcc"),
  pink: U("photo-1591886960571-74d43a9d4166"),
  pinkMix: U("photo-1452827073306-6e6e661baf57"),
  white: U("photo-1563241527-3004b7be0ffd"),
  whiteLily: U("photo-1502977249166-824b3a8a4d6d"),
  heart: U("photo-1526047932273-341f2a7631f9"),
  mixWrap: U("photo-1457089328109-e5d9bd499191"),
  mixField: U("photo-1469259943454-aa100abba749"),
  tulips: U("photo-1520763185298-1b434c919102"),
  tulipsBunch: U("photo-1561181286-d3fee7d55364"),
  peony: U("photo-1591886960571-74d43a9d4166"),
  sunflower: U("photo-1470509037663-253afd7f0f51"),
  wedding: U("photo-1465495976277-4387d4b0b4c6"),
  blue: U("photo-1518895949257-7621c3c786d7"),
  trs: U("photo-1519378058457-4c29a0a2efac"),
  box: U("photo-1563241527-3004b7be0ffd"),
  dried: U("photo-1477511801984-4ad318ed9846"),
  daisy: U("photo-1606041008023-472dfb5e530f"),
  vase: U("photo-1533616688419-b7a585564566"),
  candle: U("photo-1602523961358-f9f03dd557db"),
  gift: U("photo-1549465220-1a8b9238cd48"),
  pralines: U("photo-1549007994-cb92caebd54b"),
};

const CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 90, desc: "Čerstvě navázané novinky v Rozkvětu." },
  { slug: "vyprodej", name: "Výprodej", sort: 91, desc: "Květiny za zlomek ceny — jen dokud jsou skladem." },

  { slug: "kytice", name: "Kytice", sort: 1, desc: "Každou kytici vážeme až na vaši objednávku ze 100% čerstvých květin." },
  { slug: "kytice-ruzi", name: "Kytice růží", sort: 0, parent: "kytice" },
  { slug: "michane-kytice", name: "Míchané kytice", sort: 1, parent: "kytice" },
  { slug: "kytice-tvaru-srdce", name: "Kytice tvaru srdce", sort: 2, parent: "kytice" },
  { slug: "kytice-100-kvetu", name: "Kytice 100 květů", sort: 3, parent: "kytice" },
  { slug: "svatebni-kytice", name: "Svatební kytice", sort: 4, parent: "kytice" },
  { slug: "smutecni-kytice", name: "Smuteční kytice", sort: 5, parent: "kytice" },
  { slug: "levne-svazky", name: "Levné svazky", sort: 6, parent: "kytice" },
  { slug: "sezonni-kytice", name: "Sezónní kytice", sort: 7, parent: "kytice" },

  { slug: "ruze", name: "Růže", sort: 2, desc: "Odrůdy vybíráme přímo na holandských burzách a u pěstitelů." },
  { slug: "cervene-ruze", name: "Červené a rudé růže", sort: 0, parent: "ruze" },
  { slug: "bile-ruze", name: "Bílé růže", sort: 1, parent: "ruze" },
  { slug: "ruzove-ruze", name: "Růžové růže", sort: 2, parent: "ruze" },
  { slug: "barvene-ruze", name: "Barvené a modré růže", sort: 3, parent: "ruze" },
  { slug: "luxusni-ruze", name: "Luxusní růže", sort: 4, parent: "ruze" },
  { slug: "metrove-ruze", name: "Metrové a dlouhé růže", sort: 5, parent: "ruze" },
  { slug: "trsove-ruze", name: "Mnohokvěté trsové růže", sort: 6, parent: "ruze" },
  { slug: "ruze-na-svatbu", name: "Růže na svatbu", sort: 7, parent: "ruze" },
  { slug: "zahradni-ruze", name: "Zahradní růže", sort: 8, parent: "ruze" },

  { slug: "kvetiny", name: "Květiny", sort: 3, desc: "Řezané květiny čerstvé z ranních závozů." },
  { slug: "tulipany", name: "Tulipány", sort: 0, parent: "kvetiny" },
  { slug: "pivonky", name: "Pivoňky", sort: 1, parent: "kvetiny" },
  { slug: "slunecnice", name: "Slunečnice", sort: 2, parent: "kvetiny" },
  { slug: "gerbery", name: "Gerbery", sort: 3, parent: "kvetiny" },
  { slug: "lilie", name: "Lilie", sort: 4, parent: "kvetiny" },
  { slug: "eustomy", name: "Eustomy", sort: 5, parent: "kvetiny" },

  { slug: "krabicky", name: "Krabičky", sort: 4, desc: "Flowerboxy a dárkové krabičky s čerstvými i sušenými květy." },
  { slug: "flowerboxy", name: "Kulaté flowerboxy", sort: 0, parent: "krabicky" },
  { slug: "srdcove-boxy", name: "Srdcové boxy", sort: 1, parent: "krabicky" },
  { slug: "boxy-s-pralinkami", name: "Boxy s pralinkami", sort: 2, parent: "krabicky" },
  { slug: "susene-kvetiny", name: "Sušené květiny", sort: 3, parent: "krabicky" },

  { slug: "doplnky", name: "Doplňky", sort: 5, desc: "Vázy, věnce, stuhy a všechno, co ke květinám patří." },
  { slug: "vazy", name: "Vázy", sort: 0, parent: "doplnky" },
  { slug: "vence", name: "Proutěné věnce", sort: 1, parent: "doplnky" },
  { slug: "stuhy-a-prani", name: "Stuhy a přání", sort: 2, parent: "doplnky" },
  { slug: "svicky", name: "Svíčky", sort: 3, parent: "doplnky" },
];

// price v haléřích; sub = délka stonku • počet květů; bulk = množstevní sleva %; freeShip = doprava zdarma
const PRODUCTS = [
  // ── Kytice růží (odrůdy: Rubín, Karmín, Sněžka, Perleť, Purpur — vlastní demo názvy) ──
  { slug: "kytice-15-ruzi-rubin-70", title: "Kytice 15 luxusních růží RUBÍN 70 cm", sub: "70 cm • 15 růží", cat: "kytice-ruzi", brand: "Rozkvět Atelier", price: 129900, compare: 165900, stock: 52, flags: { featured: true, bulk: 3 }, img: IMG.redBig },
  { slug: "kytice-9-ruzi-rubin-70", title: "Kytice 9 luxusních růží RUBÍN 70 cm", sub: "70 cm • 9 růží", cat: "kytice-ruzi", brand: "Rozkvět Atelier", price: 79900, compare: 99900, stock: 88, flags: { featured: true, bulk: 1 }, img: IMG.redBouquet },
  { slug: "kytice-25-ruzi-karmin-60", title: "Kytice 25 rudých růží KARMÍN 60 cm", sub: "60 cm • 25 růží", cat: "kytice-ruzi", brand: "Rozkvět Atelier", price: 149900, compare: 179900, stock: 34, flags: { featured: true, bulk: 7 }, img: IMG.redDark },
  { slug: "kytice-35-ruzi-karmin-60", title: "Kytice 35 rudých růží KARMÍN 60 cm", sub: "60 cm • 35 růží", cat: "kytice-ruzi", brand: "Rozkvět Atelier", price: 109900, stock: 41, flags: { bulk: 10 }, img: IMG.redBig },
  { slug: "kytice-55-ruzi-karmin-50", title: "Kytice 55 rudých růží KARMÍN 50 cm", sub: "50 cm • 55 růží", cat: "kytice-ruzi", brand: "Rozkvět Atelier", price: 119900, stock: 27, flags: { bulk: 12, freeShip: true }, img: IMG.redDark },
  { slug: "kytice-21-ruzi-perlet-60", title: "Kytice 21 bílých růží PERLEŤ 60 cm", sub: "60 cm • 21 růží", cat: "bile-ruze", brand: "Rozkvět Atelier", price: 129900, compare: 155900, stock: 19, flags: { bulk: 5 }, img: IMG.white },

  // ── Kytice 100 květů ──
  { slug: "kytice-100-ruzi-karmin-60", title: "Kytice 100 rudých růží KARMÍN 60 cm", sub: "60 cm • 100 růží", cat: "kytice-100-kvetu", brand: "Rozkvět Atelier", price: 189900, stock: 13, flags: { featured: true, bulk: 30, freeShip: true }, img: IMG.redBig },
  { slug: "kytice-100-ruzi-purpur-60", title: "Kytice 100 růžových růží PURPUR 60 cm", sub: "60 cm • 100 růží", cat: "kytice-100-kvetu", brand: "Rozkvět Atelier", price: 159900, compare: 199900, stock: 9, flags: { featured: true, bulk: 30, freeShip: true }, img: IMG.pink },
  { slug: "kytice-100-ruzi-mix-agra-70", title: "Kytice 100 míchaných růží DUET 70 cm", sub: "70 cm • 100 růží", cat: "kytice-100-kvetu", brand: "Rozkvět Atelier", price: 229900, compare: 259900, stock: 7, flags: { bulk: 30, freeShip: true }, img: IMG.pinkMix },
  { slug: "kytice-100-ruzi-snezka-60", title: "Kytice 100 bílých růží SNĚŽKA 60 cm", sub: "60 cm • 100 růží", cat: "kytice-100-kvetu", brand: "Rozkvět Atelier", price: 209900, stock: 6, flags: { bulk: 30, freeShip: true }, img: IMG.white },
  { slug: "kytice-100-ruzi-zlatohlav-60", title: "Kytice 100 slunečnic ZLATOHLAV 60 cm", sub: "60 cm • 100 květů", cat: "kytice-100-kvetu", brand: "Rozkvět Atelier", price: 155900, compare: 189900, stock: 11, flags: { bulk: 30 }, img: IMG.sunflower },

  // ── Míchané kytice ──
  { slug: "kytice-vyber-floristy-1290", title: "Kytice — výběr od floristy 1.290 Kč", sub: "sezónní mix • 5+ druhů", cat: "michane-kytice", brand: "Rozkvět Atelier", price: 129000, stock: 420, flags: { featured: true }, img: IMG.mixWrap },
  { slug: "kytice-vyber-floristy-1590", title: "Kytice — výběr od floristy 1.590 Kč", sub: "sezónní mix • 6+ druhů", cat: "michane-kytice", brand: "Rozkvět Atelier", price: 159000, stock: 380, flags: { featured: true, freeShip: true }, img: IMG.mixField },
  { slug: "kytice-vyber-floristy-2290", title: "Kytice — výběr od floristy 2.290 Kč", sub: "sezónní mix • 8+ druhů", cat: "michane-kytice", brand: "Rozkvět Atelier", price: 229000, stock: 240, flags: { freeShip: true }, img: IMG.pinkMix },
  { slug: "michana-kytice-adela-40", title: "Míchaná kytice 34 ks ADÉLA 40 cm", sub: "40 cm • 34 květů", cat: "michane-kytice", brand: "Rozkvět Atelier", price: 189900, compare: 219900, stock: 3, flags: { freeShip: true }, img: IMG.mixWrap },
  { slug: "michana-kytice-linda-35", title: "Míchaná kytice 25 ks LINDA 35 cm", sub: "35 cm • 25 květů", cat: "michane-kytice", brand: "Rozkvět Atelier", price: 99900, stock: 5, flags: { new: true }, img: IMG.pink },

  // ── Srdce + svatební + smuteční ──
  { slug: "srdce-z-ruzi-rubin-70", title: "Srdce z růží malé RUBÍN 70 cm", sub: "70 cm • 47 růží", cat: "kytice-tvaru-srdce", brand: "Rozkvět Atelier", price: 129900, compare: 159900, stock: 38, flags: { featured: true }, img: IMG.heart },
  { slug: "svatebni-kytice-bila-eleni", title: "Svatební kytice ELENI — bílé růže a eustomy", sub: "ruční vazba • na míru", cat: "svatebni-kytice", brand: "Rozkvět Atelier", price: 219900, stock: 15, img: IMG.wedding },
  { slug: "smutecni-venec-tichy-haj", title: "Smuteční věnec TICHÝ HÁJ ø 60 cm", sub: "ø 60 cm • chryzantémy a růže", cat: "smutecni-kytice", brand: "Rozkvět Atelier", price: 249900, stock: 12, img: IMG.daisy },

  // ── Levné svazky ──
  { slug: "svazek-10-ruzi-karmin-50", title: "Svazek 10 růží KARMÍN 50 cm (M)", sub: "50 cm • 10 růží", cat: "levne-svazky", brand: "Rozkvět Atelier", price: 13900, stock: 310, flags: { bulk: 40 }, img: IMG.redLong },
  { slug: "svazek-tulipanu-15", title: "Svazek 15 tulipánů JARO", sub: "40 cm • 15 tulipánů", cat: "levne-svazky", brand: "Rozkvět Atelier", price: 19900, compare: 24900, stock: 120, img: IMG.tulipsBunch },

  // ── Jednotlivé růže ──
  { slug: "ruze-rubin-70-xxl", title: "Červená růže RUBÍN 70 cm (XXL) SUPER", sub: "70 cm • květ 6–7 cm", cat: "cervene-ruze", brand: "Rozkvět Atelier", price: 6500, compare: 8200, stock: 780, flags: { featured: true }, img: IMG.redLong },
  { slug: "ruze-purpur-70-m", title: "Růžová růže PURPUR 70 cm (M)", sub: "70 cm • květ 4–5 cm", cat: "ruzove-ruze", brand: "Rozkvět Atelier", price: 2900, compare: 3900, stock: 820, img: IMG.pink },
  { slug: "ruze-modra-azur-70-xxl", title: "Modrá růže AZUR 70 cm (XXL)", sub: "70 cm • barvená", cat: "barvene-ruze", brand: "Rozkvět Atelier", price: 10500, stock: 66, flags: { new: true }, img: IMG.blue },
  { slug: "ruze-snezka-60", title: "Bílá růže SNĚŽKA 60 cm (L)", sub: "60 cm • květ 5–6 cm", cat: "bile-ruze", brand: "Rozkvět Atelier", price: 4900, stock: 240, img: IMG.white },
  { slug: "ruze-metrova-rubin-100", title: "Metrová růže RUBÍN 100 cm", sub: "100 cm • květ 6–7 cm", cat: "metrove-ruze", brand: "Rozkvět Atelier", price: 14900, compare: 17900, stock: 96, flags: { featured: true }, img: IMG.redLong },
  { slug: "ruze-trsova-kaskada-50", title: "Trsová růže KASKÁDA 50 cm", sub: "50 cm • 3–5 květů na stonku", cat: "trsove-ruze", brand: "Rozkvět Atelier", price: 5500, stock: 350, img: IMG.trs },
  { slug: "ruze-zahradni-avalon-50", title: "Zahradní růže AVALON 50 cm", sub: "50 cm • plnokvětá, voní", cat: "zahradni-ruze", brand: "Rozkvět Atelier", price: 8900, stock: 58, flags: { new: true }, img: IMG.peony },
  { slug: "ruze-luxusni-imperial-80", title: "Luxusní růže IMPERIAL 80 cm (XXL)", sub: "80 cm • květ 7+ cm", cat: "luxusni-ruze", brand: "Rozkvět Atelier", price: 9900, compare: 12900, stock: 130, flags: { featured: true }, img: IMG.redDark },

  // ── Řezané květiny ──
  { slug: "tulipan-mix-1ks", title: "Tulipán barevný mix, 1 ks", sub: "40 cm • 1 květ", cat: "tulipany", brand: "Rozkvět Atelier", price: 1900, stock: 900, img: IMG.tulips },
  { slug: "pivonka-sara-1ks", title: "Pivoňka SÁRA růžová, 1 ks", sub: "50 cm • plnokvětá", cat: "pivonky", brand: "Rozkvět Atelier", price: 6900, compare: 8900, stock: 140, flags: { featured: true, new: true }, img: IMG.peony },
  { slug: "slunecnice-helios-1ks", title: "Slunečnice HELIOS, 1 ks", sub: "60 cm • velký květ", cat: "slunecnice", brand: "Rozkvět Atelier", price: 4500, stock: 210, img: IMG.sunflower },
  { slug: "gerbera-mini-mix", title: "Gerbera mini barevný mix, 1 ks", sub: "45 cm • 1 květ", cat: "gerbery", brand: "Rozkvět Atelier", price: 2500, stock: 330, img: IMG.mixField },
  { slug: "lilie-orientalni-bila", title: "Lilie orientální růžová, 1 stonek", sub: "70 cm • 3–4 poupata", cat: "lilie", brand: "Rozkvět Atelier", price: 8500, stock: 90, img: IMG.whiteLily },
  { slug: "eustoma-lila-1ks", title: "Eustoma lila, 1 stonek", sub: "55 cm • více květů", cat: "eustomy", brand: "Rozkvět Atelier", price: 4900, stock: 160, img: IMG.pinkMix },

  // ── Krabičky ──
  { slug: "flowerbox-rubin-m", title: "Flowerbox RUBÍN kulatý (M) — 15 růží", sub: "ø 20 cm • 15 růží", cat: "flowerboxy", brand: "Rozkvět Atelier", price: 169900, compare: 199900, stock: 22, flags: { featured: true }, img: IMG.box },
  { slug: "flowerbox-perlet-s", title: "Flowerbox PERLEŤ kulatý (S) — 9 růží", sub: "ø 15 cm • 9 růží", cat: "flowerboxy", brand: "Rozkvět Atelier", price: 109900, stock: 31, img: IMG.box },
  { slug: "srdcovy-box-purpur", title: "Srdcový box PURPUR — 21 růží", sub: "25×25 cm • 21 růží", cat: "srdcove-boxy", brand: "Rozkvět Atelier", price: 189900, stock: 14, flags: { new: true }, img: IMG.box },
  { slug: "box-s-pralinkami-noir", title: "Flowerbox NOIR s belgickými pralinkami", sub: "ø 20 cm • 11 růží + 8 pralinek", cat: "boxy-s-pralinkami", brand: "Rozkvět Atelier", price: 199900, compare: 235900, stock: 18, flags: { freeShip: true }, img: IMG.pralines },
  { slug: "susena-kytice-savana", title: "Sušená kytice SAVANA", sub: "45 cm • vydrží roky", cat: "susene-kvetiny", brand: "Rozkvět Atelier", price: 89900, stock: 44, img: IMG.dried },

  // ── Doplňky ──
  { slug: "vaza-federica-27", title: "Skleněná váza FEDERICA ø 5,5 cm, výška 27 cm", sub: "ø 5,5 cm • výška 27 cm", cat: "vazy", brand: "Rozkvět Home", price: 7900, compare: 10500, stock: 74, img: IMG.vase },
  { slug: "vaza-kylin-cylinder-60", title: "Silnostěnná váza KYLIN cylinder ø 20 cm, výška 60 cm", sub: "ø 20 cm • výška 60 cm", cat: "vazy", brand: "Rozkvět Home", price: 55900, stock: 150, img: IMG.vase },
  { slug: "venec-liana-80", title: "Proutěný velký věnec LIANA 80 cm", sub: "ø 80 cm • přírodní proutí", cat: "vence", brand: "Rozkvět Home", price: 145900, compare: 165900, stock: 19, flags: { new: true }, img: IMG.dried },
  { slug: "premiova-stuha-vzkaz", title: "Prémiová stuha s vytištěným vzkazem", sub: "šíře 5 cm • vlastní text", cat: "stuhy-a-prani", brand: "Rozkvět Home", price: 11900, stock: 500, img: IMG.gift },
  { slug: "svicka-sojova-poupe", title: "Sójová svíčka POUPĚ — pivoňka a santal", sub: "220 g • hoří 45 h", cat: "svicky", brand: "Rozkvět Home", price: 44900, stock: 85, img: IMG.candle },
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
       VALUES ($1,$2,$3,$4,$5,true) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort]
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

  const link = async (pid, slug) => {
    if (!catIds.has(slug)) return;
    await client.query(
      `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [tenantId, pid, catIds.get(slug)]
    );
  };

  let pc = 0, vc = 0;
  for (const p of PRODUCTS) {
    const desc = `${p.title} (${p.sub}). Vážeme až na vaši objednávku ze 100% čerstvých květin — před odesláním vám zdarma pošleme fotku hotové kytice a doručíme vlastními chlazenými vozy po celé ČR. Doprava zdarma nad 1 590 Kč.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.sub, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: "Provedení", values: ["Standard"] }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (p.compare) await link(pid, "vyprodej");
    if (p.flags?.new) await link(pid, "novinky");

    await client.query(
      `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,0)`,
      [tenantId, pid, p.img, p.title]
    );

    const vr = await client.query(
      `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
       VALUES ($1,$2,$3,'Standard',$4,$5,$6,$7,true,0) RETURNING id`,
      [tenantId, pid, `${p.slug.toUpperCase().slice(0, 40)}-0`, JSON.stringify({ "Provedení": "Standard" }), p.price, p.compare ?? null, p.stock]
    );
    vc++;
    await client.query(
      `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
       VALUES ($1,$2,$3,$4,'import','eshop-17 seed')`,
      [tenantId, vr.rows[0].id, p.stock, p.stock]
    );
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
