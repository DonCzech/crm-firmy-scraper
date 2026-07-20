/**
 * Seed produktového katalogu pro eshop-09-v2 (Mobil Expres — mp.cz DNA, mobily a elektronika).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-09-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-09-v2";

const U = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const P = {
  iphoneBlue: "1616348436168-de43ad0db179",
  iphoneBack: "1592750475338-74b7b21085ab",
  iphoneWhite: "1556656793-08538906a9f8",
  iphoneHome: "1512941937669-90a1b58e7e9c",
  samsung: "1610945265064-0e34e5519bbf",
  samsungFlip: "1565849904461-04a58ad377e0",
  xiaomi: "1598327105666-5b89351aff97",
  pixel: "1511707171634-5f897ff02aa9",
  buttonPhone: "1584006682522-dc17d6c0d9ac",
  rugged: "1580910051074-3eb694886505",
  watch: "1579586337278-3befd40fd17a",
  watchApple: "1523275335684-37898b6baf30",
  watchSamsung: "1617043786394-f977fa12eddf",
  watchGarmin: "1508685096489-7aacd43bd3b1",
  band: "1557438159-51eec7a6c9e8",
  strap: "1434493789847-2f02dc6ca35d",
  earbuds: "1590658268037-6bf12165a8df",
  headphones: "1505740420928-5e560c06d30e",
  speaker: "1608043152269-423dbba4e7e1",
  soundbar: "1545454675-3531b543be5d",
  hifi: "1558756520-22cfe5d382ca",
  ipad: "1544244015-0df4b3ffc6b0",
  tabSamsung: "1561154464-82e9adf32764",
  reader: "1592496431122-2349e0fbc666",
  macbook: "1517336714731-489689fd1ca8",
  notebook: "1496181133206-80ce9b88a853",
  monitor: "1527443224154-c4a3942d3acf",
  ps5: "1606813907291-d86efa9b94db",
  xbox: "1621259182978-fbf93132d53d",
  nintendo: "1578303512597-81e6cc155b3e",
  controller: "1592840496694-26d035b52b48",
  case: "1583863788434-e58a36330cf0",
  charger: "1583394838336-acd977736f90",
  powerbank: "1609091839311-d5365f9ff1c5",
  sdcard: "1618410320928-25228d811631",
  drone: "1473968512647-3e447244af8f",
  camera: "1516035069371-29a1b244cc32",
  vacuum: "1518640467707-6811f4a6ab73",
  smartlight: "1558089687-f282ffcbc126",
};

const CATEGORIES = [
  { slug: "telefony", name: "Telefony", sort: 0, desc: "Nové telefony všech značek — expresní doručení po celé ČR." },
  { slug: "iphone", name: "Apple iPhone", sort: 0, parent: "telefony" },
  { slug: "samsung", name: "Samsung Galaxy", sort: 1, parent: "telefony" },
  { slug: "xiaomi", name: "Xiaomi", sort: 2, parent: "telefony" },
  { slug: "pixel", name: "Google Pixel", sort: 3, parent: "telefony" },
  { slug: "odolne-telefony", name: "Odolné telefony", sort: 4, parent: "telefony" },
  { slug: "tlacitkove-telefony", name: "Tlačítkové telefony", sort: 5, parent: "telefony" },
  { slug: "zanovni", name: "Zánovní a použité", sort: 1, desc: "Prošly kontrolou 30 bodů, se zárukou 2 roky." },
  { slug: "zanovni-iphone", name: "Zánovní iPhone", sort: 0, parent: "zanovni" },
  { slug: "zanovni-samsung", name: "Zánovní Samsung", sort: 1, parent: "zanovni" },
  { slug: "pouzite-telefony", name: "Použité telefony", sort: 2, parent: "zanovni" },
  { slug: "hodinky", name: "Chytré hodinky", sort: 2, desc: "Hodinky a náramky, které vás rozhýbou." },
  { slug: "apple-watch", name: "Apple Watch", sort: 0, parent: "hodinky" },
  { slug: "galaxy-watch", name: "Samsung Galaxy Watch", sort: 1, parent: "hodinky" },
  { slug: "garmin", name: "Garmin", sort: 2, parent: "hodinky" },
  { slug: "chytre-naramky", name: "Chytré náramky", sort: 3, parent: "hodinky" },
  { slug: "reminky", name: "Řemínky", sort: 4, parent: "hodinky" },
  { slug: "prislusenstvi", name: "Příslušenství", sort: 3 },
  { slug: "kryty", name: "Kryty a pouzdra", sort: 0, parent: "prislusenstvi" },
  { slug: "nabijecky", name: "Nabíječky a kabely", sort: 1, parent: "prislusenstvi" },
  { slug: "powerbanky", name: "Powerbanky", sort: 2, parent: "prislusenstvi" },
  { slug: "pametove-karty", name: "Paměťové karty", sort: 3, parent: "prislusenstvi" },
  { slug: "audio", name: "Audio", sort: 4, desc: "Sluchátka, reproduktory a soundbary." },
  { slug: "bezdratova-sluchatka", name: "Bezdrátová sluchátka", sort: 0, parent: "audio" },
  { slug: "sluchatka-pres-hlavu", name: "Sluchátka přes hlavu", sort: 1, parent: "audio" },
  { slug: "reproduktory", name: "Reproduktory", sort: 2, parent: "audio" },
  { slug: "soundbary", name: "Soundbary", sort: 3, parent: "audio" },
  { slug: "tablety", name: "Tablety a čtečky", sort: 5 },
  { slug: "ipad", name: "Apple iPad", sort: 0, parent: "tablety" },
  { slug: "galaxy-tab", name: "Samsung Galaxy Tab", sort: 1, parent: "tablety" },
  { slug: "ctecky", name: "Čtečky knih", sort: 2, parent: "tablety" },
  { slug: "notebooky", name: "Notebooky a PC", sort: 6 },
  { slug: "macbook", name: "Apple MacBook", sort: 0, parent: "notebooky" },
  { slug: "notebooky-windows", name: "Notebooky", sort: 1, parent: "notebooky" },
  { slug: "monitory", name: "Monitory", sort: 2, parent: "notebooky" },
  { slug: "gaming", name: "Gaming", sort: 7 },
  { slug: "playstation", name: "PlayStation 5", sort: 0, parent: "gaming" },
  { slug: "xbox", name: "Xbox", sort: 1, parent: "gaming" },
  { slug: "nintendo", name: "Nintendo Switch", sort: 2, parent: "gaming" },
  { slug: "ovladace", name: "Herní ovladače", sort: 3, parent: "gaming" },
  { slug: "smart", name: "Smart domácnost", sort: 8 },
  { slug: "vysavace", name: "Robotické vysavače", sort: 0, parent: "smart" },
  { slug: "osvetleni", name: "Chytré osvětlení", sort: 1, parent: "smart" },
  { slug: "foto-drony", name: "Foto a drony", sort: 9 },
  { slug: "drony", name: "Drony DJI", sort: 0, parent: "foto-drony" },
  { slug: "fotoaparaty", name: "Fotoaparáty", sort: 1, parent: "foto-drony" },
  { slug: "limitovane-nabidky", name: "Limitované nabídky", sort: 90 },
  { slug: "vykup", name: "Výkup telefonů", sort: 91 },
];

// price v haléřích; telefony mají varianty úložiště
const PRODUCTS = [
  { slug: "iphone-17-pro-256", title: "Apple iPhone 17 Pro 256GB", subtitle: "Titan, čip A19 Pro, ProMotion 120 Hz", cat: "iphone", brand: "Apple", price: 3299000, compare: 3699000, stock: 14, flags: { featured: true, new: true }, img: [P.iphoneBlue, P.iphoneBack], variants: ["256GB", "512GB", "1TB"] },
  { slug: "iphone-17-128", title: "Apple iPhone 17 128GB", subtitle: "Super Retina XDR, Dynamic Island", cat: "iphone", brand: "Apple", price: 2199000, stock: 22, flags: { featured: true, new: true }, img: [P.iphoneWhite, P.iphoneHome], variants: ["128GB", "256GB"] },
  { slug: "iphone-16e-128", title: "Apple iPhone 16e 128GB", subtitle: "Nejdostupnější iPhone s Apple Intelligence", cat: "iphone", brand: "Apple", price: 1649000, compare: 1799000, stock: 30, flags: { featured: true }, img: [P.iphoneBack, P.iphoneWhite] },
  { slug: "galaxy-s26-ultra-512", title: "Samsung Galaxy S26 Ultra 512GB", subtitle: "200Mpx foťák, S Pen, titanový rám", cat: "samsung", brand: "Samsung", price: 3499000, compare: 3999000, stock: 11, flags: { featured: true, new: true }, img: [P.samsung, P.samsungFlip], variants: ["256GB", "512GB", "1TB"] },
  { slug: "galaxy-s26-256", title: "Samsung Galaxy S26 256GB", subtitle: "Kompaktní vlajka s Galaxy AI", cat: "samsung", brand: "Samsung", price: 2249000, compare: 2499000, stock: 18, flags: { featured: true }, img: [P.samsungFlip, P.samsung] },
  { slug: "xiaomi-17t-pro", title: "Xiaomi 17T Pro 512GB", subtitle: "Leica optika, 144 Hz AMOLED, 120W nabíjení", cat: "xiaomi", brand: "Xiaomi", price: 1799000, compare: 2099000, stock: 25, flags: { featured: true, new: true }, img: [P.xiaomi], variants: ["256GB", "512GB"] },
  { slug: "google-pixel-10-pro", title: "Google Pixel 10 Pro 256GB", subtitle: "Tensor G5, nejlepší noční fotky", cat: "pixel", brand: "Google", price: 2549000, stock: 9, flags: { featured: true }, img: [P.pixel] },
  { slug: "cat-s75-rugged", title: "CAT S75 odolný telefon", subtitle: "IP68 + MIL-STD-810H, satelitní SOS", cat: "odolne-telefony", brand: "CAT", price: 1249000, compare: 1449000, stock: 12, img: [P.rugged] },
  { slug: "nokia-2660-flip", title: "Nokia 2660 Flip", subtitle: "Véčko s velkými tlačítky a XL sluchátkem", cat: "tlacitkove-telefony", brand: "Nokia", price: 179000, stock: 40, img: [P.buttonPhone] },
  { slug: "zanovni-iphone-15-128", title: "Zánovní iPhone 15 128GB", subtitle: "Stav A+ · nová baterie · záruka 2 roky", cat: "zanovni-iphone", brand: "Apple", price: 1349000, compare: 1899000, stock: 8, flags: { featured: true }, img: [P.iphoneHome, P.iphoneBack] },
  { slug: "zanovni-iphone-14-pro", title: "Zánovní iPhone 14 Pro 256GB", subtitle: "Stav A · kontrola 30 bodů · záruka 2 roky", cat: "zanovni-iphone", brand: "Apple", price: 1549000, compare: 2249000, stock: 5, flags: { featured: true }, img: [P.iphoneBack, P.iphoneHome] },
  { slug: "zanovni-galaxy-s24", title: "Zánovní Galaxy S24 256GB", subtitle: "Stav A+ · nová baterie · záruka 2 roky", cat: "zanovni-samsung", brand: "Samsung", price: 1099000, compare: 1649000, stock: 7, img: [P.samsungFlip] },
  { slug: "apple-watch-series-11", title: "Apple Watch Series 11 46mm", subtitle: "GPS, Always-On Retina, měření spánku", cat: "apple-watch", brand: "Apple", price: 1149000, compare: 1249000, stock: 20, flags: { featured: true, new: true }, img: [P.watchApple, P.watch], variants: ["42mm", "46mm"] },
  { slug: "galaxy-watch-8", title: "Samsung Galaxy Watch 8 44mm", subtitle: "BioActive senzor, spánkový coaching", cat: "galaxy-watch", brand: "Samsung", price: 749000, compare: 849000, stock: 16, flags: { featured: true }, img: [P.watchSamsung] },
  { slug: "garmin-fenix-8", title: "Garmin Fēnix 8 47mm", subtitle: "AMOLED, mapy, výdrž 16 dní", cat: "garmin", brand: "Garmin", price: 2399000, stock: 6, flags: { featured: true }, img: [P.watchGarmin, P.watch] },
  { slug: "xiaomi-band-10", title: "Xiaomi Smart Band 10", subtitle: "150+ sportovních režimů, výdrž 21 dní", cat: "chytre-naramky", brand: "Xiaomi", price: 99000, compare: 119000, stock: 60, img: [P.band] },
  { slug: "reminek-sport-loop", title: "Řemínek Sport Loop 46mm", subtitle: "Prodyšný nylon, suchý zip", cat: "reminky", brand: "Mobil Expres", price: 39000, stock: 80, img: [P.strap], variants: ["Půlnoční", "Mint", "Oranžová"] },
  { slug: "airpods-pro-3", title: "Apple AirPods Pro 3", subtitle: "Adaptivní ANC, srdeční tep, USB-C", cat: "bezdratova-sluchatka", brand: "Apple", price: 649000, compare: 699000, stock: 35, flags: { featured: true, new: true }, img: [P.earbuds] },
  { slug: "sony-wh-1000xm6", title: "Sony WH-1000XM6", subtitle: "Nejlepší ANC na trhu, 30 h výdrž", cat: "sluchatka-pres-hlavu", brand: "Sony", price: 999000, compare: 1149000, stock: 14, flags: { featured: true }, img: [P.headphones] },
  { slug: "jbl-charge-6", title: "JBL Charge 6", subtitle: "Vodotěsný, 24 h hraní, powerbanka", cat: "reproduktory", brand: "JBL", price: 449000, compare: 499000, stock: 28, img: [P.speaker] },
  { slug: "sonos-arc-ultra", title: "Sonos Arc Ultra", subtitle: "Dolby Atmos soundbar, hlasové ovládání", cat: "soundbary", brand: "Sonos", price: 2499000, stock: 5, img: [P.soundbar] },
  { slug: "ipad-air-11-m3", title: "Apple iPad Air 11\" M3 128GB", subtitle: "Liquid Retina, Apple Pencil Pro", cat: "ipad", brand: "Apple", price: 1749000, compare: 1899000, stock: 15, flags: { featured: true }, img: [P.ipad], variants: ["128GB", "256GB"] },
  { slug: "galaxy-tab-s10", title: "Samsung Galaxy Tab S10 11\"", subtitle: "AMOLED 120 Hz, S Pen v balení", cat: "galaxy-tab", brand: "Samsung", price: 1549000, stock: 12, img: [P.tabSamsung] },
  { slug: "kindle-paperwhite-12", title: "Amazon Kindle Paperwhite 12", subtitle: "7\" E-Ink, podsvícení, výdrž 12 týdnů", cat: "ctecky", brand: "Amazon", price: 429000, stock: 26, img: [P.reader] },
  { slug: "macbook-air-m4-13", title: "Apple MacBook Air 13\" M4 256GB", subtitle: "16GB RAM, 18 h výdrž, Midnight", cat: "macbook", brand: "Apple", price: 2999000, compare: 3199000, stock: 10, flags: { featured: true, new: true }, img: [P.macbook], variants: ["256GB", "512GB"] },
  { slug: "lenovo-yoga-slim-7", title: "Lenovo Yoga Slim 7 14\"", subtitle: "Ryzen AI 7, 32GB RAM, OLED", cat: "notebooky-windows", brand: "Lenovo", price: 2449000, stock: 8, img: [P.notebook] },
  { slug: "dell-monitor-27-4k", title: "Dell UltraSharp 27\" 4K", subtitle: "IPS Black, USB-C 90W, pivot", cat: "monitory", brand: "Dell", price: 1299000, compare: 1499000, stock: 11, img: [P.monitor] },
  { slug: "playstation-5-pro", title: "PlayStation 5 Pro 2TB", subtitle: "8K upscaling, ray tracing, DualSense", cat: "playstation", brand: "Sony", price: 1949000, stock: 9, flags: { featured: true }, img: [P.ps5, P.controller] },
  { slug: "xbox-series-x-2tb", title: "Xbox Series X 2TB Galaxy Black", subtitle: "Nejvýkonnější Xbox všech dob", cat: "xbox", brand: "Microsoft", price: 1599000, compare: 1749000, stock: 7, img: [P.xbox] },
  { slug: "nintendo-switch-2", title: "Nintendo Switch 2", subtitle: "8\" LCD, magnetické Joy-Con 2", cat: "nintendo", brand: "Nintendo", price: 1249000, stock: 13, flags: { new: true }, img: [P.nintendo] },
  { slug: "dualsense-edge", title: "DualSense Edge ovladač", subtitle: "Výměnné páčky, zadní tlačítka", cat: "ovladace", brand: "Sony", price: 549000, compare: 599000, stock: 21, img: [P.controller] },
  { slug: "kryt-iphone-17-pro", title: "Kryt Mobil Expres iPhone 17 Pro", subtitle: "MagSafe, mikrovlákno uvnitř", cat: "kryty", brand: "Mobil Expres", price: 69000, compare: 89000, stock: 90, img: [P.case], variants: ["Černá", "Mint", "Coral"] },
  { slug: "nabijecka-gan-65w", title: "Nabíječka GaN 65W + kabel", subtitle: "2× USB-C, 1× USB-A, kompaktní", cat: "nabijecky", brand: "Mobil Expres", price: 79000, stock: 70, img: [P.charger] },
  { slug: "powerbanka-20000", title: "Powerbanka 20 000 mAh 22,5W", subtitle: "USB-C PD, displej, letadlo-safe", cat: "powerbanky", brand: "Mobil Expres", price: 99000, compare: 129000, stock: 55, img: [P.powerbank] },
  { slug: "microsd-1tb", title: "MicroSD 1TB Extreme Pro", subtitle: "200 MB/s, A2, V30 — pro drony i Switch", cat: "pametove-karty", brand: "SanDisk", price: 249000, stock: 33, img: [P.sdcard] },
  { slug: "dji-mini-5-pro", title: "DJI Mini 5 Pro Fly More Combo", subtitle: "249 g, 4K/60, 45 min letu", cat: "drony", brand: "DJI", price: 2899000, compare: 3199000, stock: 6, flags: { featured: true }, img: [P.drone] },
  { slug: "sony-a7-iv", title: "Sony Alpha A7 IV tělo", subtitle: "33Mpx full-frame, 4K/60", cat: "fotoaparaty", brand: "Sony", price: 5799000, stock: 4, img: [P.camera] },
  { slug: "roborock-s9", title: "Roborock S9 MaxV Ultra", subtitle: "Vysává i vytírá, samočisticí stanice", cat: "vysavace", brand: "Roborock", price: 2599000, compare: 2999000, stock: 8, img: [P.vacuum] },
  { slug: "hue-startovaci-sada", title: "Philips Hue startovací sada E27", subtitle: "3 žárovky + Bridge, 16M barev", cat: "osvetleni", brand: "Philips", price: 349000, stock: 24, img: [P.smartlight] },
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

  let pc = 0, vc = 0;
  for (const p of PRODUCTS) {
    const variants = p.variants ?? ["Standard"];
    const optName = p.variants ? (p.variants[0].endsWith("GB") || p.variants[0].endsWith("TB") ? "Úložiště" : p.variants[0].endsWith("mm") ? "Velikost" : "Barva") : "Provedení";
    const desc = `${p.subtitle}. ${p.title} od značky ${p.brand} — ověřeno techniky Mobil Expres. Objednejte do 20:00 a zítra doručíme. 30 dní na vrácení, výkup starého zařízení na protiúčet.`;
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
        [tenantId, pid, catIds.get("limitovane-nabidky")]
      );
    }

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
      );
    }

    for (let i = 0; i < variants.length; i++) {
      // vyšší varianty úložiště jsou dražší
      const bump = optName === "Úložiště" || optName === "Velikost" ? i * Math.round(p.price * 0.12) : 0;
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase()}-${i}`, variants[i],
         JSON.stringify({ [optName]: variants[i] }), p.price + bump, p.compare ? p.compare + bump : null, p.stock, i === 0, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-09 seed')`,
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
