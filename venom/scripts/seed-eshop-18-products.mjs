/**
 * Seed produktového katalogu pro eshop-18-v2 (Oktan — autodíly, Auto Kelly DNA).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Demo data: vlastní demo značky (LUBRA oleje, VOLTIX elektro/baterie, OKTAN Parts díly,
 * KRYSTAL autokosmetika, FEROX dílna, TREKA boxy a nosiče) — žádné originály z autokelly.cz,
 * ceny ±15–30 % od zadání. flags.featured = Probíhající akce, flags.new = Novinky.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-18-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-18-v2";

const U = (id, w = 800, h = 800) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;

// Motivy ověřeny kontaktním přehledem 2026-07-17 (žádná pláž/sladkosti)
const IMG = {
  engine: U("photo-1486262715619-67b85e0b08d3"),      // řemen motoru closeup
  oilPour: U("photo-1487754180451-c456f719a1fc"),      // mechanik dolévá olej
  sportRoad: U("photo-1503376780353-7e6692767b70"),    // černé kupé na silnici
  roadTrip: U("photo-1568605117036-5fe5e7bab0b7"),     // auto na cestě v západu slunce
  tireStack: U("photo-1578844251758-2f71da64c96f"),    // hromada pneumatik
  mechanicTool: U("photo-1558618666-fcd25c85cd64"),    // technik s nářadím
  whiteCar: U("photo-1600661653561-629509216228"),     // bílý moderní vůz
  mechanicDark: U("photo-1615906655593-ad0386982a0f"), // mechanik v dílně
  wash: U("photo-1607860108855-64acf2078ed9"),         // mytí černého auta
  openHood: U("photo-1625047509168-a7026f36de04"),     // otevřená kapota
  redForest: U("photo-1553440569-bcc63803a83d"),       // červené GT v lese
  snowAudi: U("photo-1517524008697-84bbe3c3fd98"),     // bílé auto ve sněhu
  greyBmw: U("photo-1580273916550-e323be2ae537"),      // šedý sedan, svítí světla
  yellowCar: U("photo-1511919884226-fd3cad34687c"),    // žlutý supersport (brand-fit)
  greyPorsche: U("photo-1592853625601-bb9d23da12fc"),  // šedé kupé, viditelná kola
  neonGarage: U("photo-1590362891991-f776e747a588"),   // vůz v neonové garáži
  redFerrari: U("photo-1583121274602-3e2820c69888"),   // červený supersport
  blueCamaro: U("photo-1552519507-da3b142c6e3d"),      // modré kupé
};

const CATEGORIES = [
  { slug: "akce", name: "Akce", sort: 90, desc: "Probíhající akce — díly a vybavení za akční ceny." },
  { slug: "novinky", name: "Novinky", sort: 91, desc: "Čerstvé přírůstky v sortimentu Oktan." },
  { slug: "vyprodej", name: "Výprodej", sort: 92, desc: "Doprodej dílů za zlomek ceny — jen dokud jsou skladem." },

  { slug: "naplne", name: "Náplně a oleje", sort: 1, desc: "Motorové a převodové oleje, kapaliny a aditiva pro každý motor." },
  { slug: "motorove-oleje", name: "Motorové oleje", sort: 0, parent: "naplne" },
  { slug: "prevodove-oleje", name: "Převodové oleje", sort: 1, parent: "naplne" },
  { slug: "nemrznouci-smesi", name: "Nemrznoucí směsi", sort: 2, parent: "naplne" },
  { slug: "smesi-do-ostrikovacu", name: "Směsi do ostřikovačů", sort: 3, parent: "naplne" },
  { slug: "brzdove-kapaliny", name: "Brzdové kapaliny", sort: 4, parent: "naplne" },
  { slug: "aditiva", name: "Aditiva a přísady", sort: 5, parent: "naplne" },

  { slug: "autobaterie", name: "Autobaterie", sort: 2, desc: "Baterie, nabíječky a startovací technika s okamžitým výdejem." },
  { slug: "baterie-osobni", name: "Baterie pro osobní vozy", sort: 0, parent: "autobaterie" },
  { slug: "nabijecky", name: "Nabíječky a startovací zdroje", sort: 1, parent: "autobaterie" },
  { slug: "startovaci-kabely", name: "Startovací kabely", sort: 2, parent: "autobaterie" },
  { slug: "prislusenstvi-baterii", name: "Testery a příslušenství", sort: 3, parent: "autobaterie" },

  { slug: "univerzalni-dily", name: "Univerzální díly", sort: 3, desc: "Žárovky, stěrače a díly, které sednou do většiny vozů." },
  { slug: "zarovky", name: "Žárovky", sort: 0, parent: "univerzalni-dily" },
  { slug: "sterace", name: "Stěrače", sort: 1, parent: "univerzalni-dily" },
  { slug: "podvozek-brzdy", name: "Podvozek a brzdy", sort: 2, parent: "univerzalni-dily" },
  { slug: "vyfukovy-system", name: "Výfukový systém", sort: 3, parent: "univerzalni-dily" },
  { slug: "spojovaci-material", name: "Spojovací materiál", sort: 4, parent: "univerzalni-dily" },

  { slug: "prislusenstvi", name: "Autopříslušenství", sort: 4, desc: "Od povinné výbavy po střešní boxy — všechno na cesty." },
  { slug: "stresni-boxy-nosice", name: "Střešní boxy a nosiče", sort: 0, parent: "prislusenstvi" },
  { slug: "povinna-vybava", name: "Povinná výbava", sort: 1, parent: "prislusenstvi" },
  { slug: "drzaky-elektro", name: "Držáky a elektro", sort: 2, parent: "prislusenstvi" },
  { slug: "kompresory", name: "Kompresory", sort: 3, parent: "prislusenstvi" },
  { slug: "vnitrni-doplnky", name: "Vnitřní doplňky", sort: 4, parent: "prislusenstvi" },

  { slug: "autokosmetika", name: "Autokosmetika", sort: 5, desc: "Detailing a péče o lak, interiér i disky." },
  { slug: "detailing", name: "Detailing", sort: 0, parent: "autokosmetika" },
  { slug: "interier-cisteni", name: "Čištění interiéru", sort: 1, parent: "autokosmetika" },
  { slug: "karoserie-cisteni", name: "Čištění karoserie", sort: 2, parent: "autokosmetika" },
  { slug: "disky-pneu-cisteni", name: "Péče o disky a pneu", sort: 3, parent: "autokosmetika" },

  { slug: "pneu-disky", name: "Pneumatiky a disky", sort: 6, desc: "Pneu, disky, řetězy a snímače tlaku pro celý rok." },
  { slug: "letni-pneu", name: "Letní pneumatiky", sort: 0, parent: "pneu-disky" },
  { slug: "zimni-pneu", name: "Zimní pneumatiky", sort: 1, parent: "pneu-disky" },
  { slug: "disky", name: "Disky", sort: 2, parent: "pneu-disky" },
  { slug: "snehove-retezy", name: "Sněhové řetězy", sort: 3, parent: "pneu-disky" },
  { slug: "tpms", name: "Snímače TPMS", sort: 4, parent: "pneu-disky" },

  { slug: "dilna", name: "Vybavení dílny", sort: 7, desc: "Nářadí, zvedáky a diagnostika pro hobby i profi dílnu." },
  { slug: "rucni-naradi", name: "Ruční nářadí", sort: 0, parent: "dilna" },
  { slug: "zvedaky", name: "Zvedáky a stojany", sort: 1, parent: "dilna" },
  { slug: "diagnostika", name: "Diagnostika", sort: 2, parent: "dilna" },
  { slug: "garazove-vybaveni", name: "Garážové vybavení", sort: 3, parent: "dilna" },
];

// price v haléřích; sub = balení / specifikace; featured = Probíhající akce, new = Novinky
const PRODUCTS = [
  // ── Motorové oleje (LUBRA — demo řady LongLife, HyperSyn, MolyTech, Silver) ──
  { slug: "lubra-longlife-c3-5w30-5l", title: "LUBRA LongLife C3 5W-30 — 5 l", sub: "5 l • plně syntetický • VW 504.00/507.00", cat: "motorove-oleje", brand: "LUBRA", price: 84900, compare: 109900, stock: 95, flags: { featured: true }, img: IMG.engine },
  { slug: "lubra-longlife-c3-5w30-1l", title: "LUBRA LongLife C3 5W-30 — 1 l", sub: "1 l • plně syntetický • VW 504.00/507.00", cat: "motorove-oleje", brand: "LUBRA", price: 16900, compare: 21900, stock: 320, img: IMG.engine },
  { slug: "lubra-hypersyn-5w40-5l", title: "LUBRA HyperSyn 5W-40 — 5 l", sub: "5 l • plně syntetický • MB 229.3", cat: "motorove-oleje", brand: "LUBRA", price: 64900, compare: 79900, stock: 140, flags: { featured: true }, img: IMG.oilPour },
  { slug: "lubra-hypersyn-5w40-1l", title: "LUBRA HyperSyn 5W-40 — 1 l", sub: "1 l • plně syntetický • MB 229.3", cat: "motorove-oleje", brand: "LUBRA", price: 15900, stock: 410, img: IMG.oilPour },
  { slug: "lubra-longlife-iv-0w20-5l", title: "LUBRA LongLife IV 0W-20 — 5 l", sub: "5 l • plně syntetický • VW 508.00/509.00", cat: "motorove-oleje", brand: "LUBRA", price: 99900, stock: 74, flags: { new: true }, img: IMG.sportRoad },
  { slug: "lubra-molytech-10w40-5l", title: "LUBRA MolyTech 10W-40 — 5 l", sub: "5 l • polosyntetický s MoS2", cat: "motorove-oleje", brand: "LUBRA", price: 139000, compare: 169000, stock: 51, flags: { new: true }, img: IMG.mechanicDark },
  { slug: "lubra-silver-15w40-5l", title: "LUBRA Silver 15W-40 — 5 l", sub: "5 l • minerální • starší motory", cat: "motorove-oleje", brand: "LUBRA", price: 59900, stock: 88, img: IMG.engine },
  { slug: "lubra-gear-75w90-1l", title: "LUBRA Gear GL-5 75W-90 — 1 l", sub: "1 l • syntetický převodový", cat: "prevodove-oleje", brand: "LUBRA", price: 27900, stock: 130, img: IMG.mechanicTool },

  // ── Kapaliny a aditiva ──
  { slug: "lubra-antifreeze-g12-3l", title: "LUBRA Antifreeze G12 EVO — 3 l", sub: "3 l • koncentrát do -72 °C", cat: "nemrznouci-smesi", brand: "LUBRA", price: 24900, stock: 210, img: IMG.roadTrip },
  { slug: "lubra-ostrikovac-letni-5l", title: "LUBRA letní směs do ostřikovačů — 5 l", sub: "5 l • proti hmyzu", cat: "smesi-do-ostrikovacu", brand: "LUBRA", price: 8900, stock: 540, img: IMG.wash },
  { slug: "lubra-dot4-500ml", title: "LUBRA brzdová kapalina DOT 4 — 500 ml", sub: "500 ml • ISO 4925", cat: "brzdove-kapaliny", brand: "LUBRA", price: 10900, stock: 260, img: IMG.tireStack },
  { slug: "lubra-benzin-aditiv-500ml", title: "LUBRA Super Benzin aditiv — 500 ml", sub: "500 ml • čistí vstřikování", cat: "aditiva", brand: "LUBRA", price: 18900, compare: 22900, stock: 175, flags: { featured: true }, img: IMG.redFerrari },

  // ── Autobaterie (VOLTIX) ──
  { slug: "voltix-start-74ah", title: "VOLTIX Start 74 Ah / 680 A", sub: "12 V • 74 Ah • 680 A EN", cat: "baterie-osobni", brand: "VOLTIX", price: 219000, compare: 259000, stock: 46, flags: { featured: true }, img: IMG.openHood },
  { slug: "voltix-start-60ah", title: "VOLTIX Start 60 Ah / 540 A", sub: "12 V • 60 Ah • 540 A EN", cat: "baterie-osobni", brand: "VOLTIX", price: 169000, stock: 72, img: IMG.openHood },
  { slug: "voltix-efb-70ah", title: "VOLTIX EFB Start-Stop 70 Ah / 760 A", sub: "12 V • 70 Ah • start-stop", cat: "baterie-osobni", brand: "VOLTIX", price: 289000, stock: 28, flags: { new: true }, img: IMG.neonGarage },
  { slug: "voltix-nabijecka-8a", title: "VOLTIX inteligentní nabíječka 8 A", sub: "12/24 V • 9 fází • IP65", cat: "nabijecky", brand: "VOLTIX", price: 129000, compare: 149000, stock: 63, img: IMG.mechanicDark },
  { slug: "voltix-powerstart-1200", title: "VOLTIX PowerStart 1200 — startovací zdroj", sub: "1200 A • powerbanka 16 000 mAh", cat: "nabijecky", brand: "VOLTIX", price: 249000, stock: 39, flags: { featured: true, new: true }, img: IMG.openHood },
  { slug: "voltix-solar-20w", title: "VOLTIX Solar 20 W — udržovací nabíječka", sub: "20 W • solární panel", cat: "nabijecky", brand: "VOLTIX", price: 109000, compare: 136900, stock: 33, flags: { new: true }, img: IMG.redForest },
  { slug: "voltix-kabely-400a", title: "VOLTIX startovací kabely 400 A — 3 m", sub: "400 A • 3 m • plně izolované", cat: "startovaci-kabely", brand: "VOLTIX", price: 39000, stock: 150, img: IMG.mechanicTool },

  // ── Univerzální díly (OKTAN Parts) ──
  { slug: "oktan-h7-longbeam-2ks", title: "OKTAN H7 LongBeam +130 % — 2 ks", sub: "H7 • 12 V 55 W • +130 % svítivosti", cat: "zarovky", brand: "OKTAN Parts", price: 24900, stock: 380, flags: { featured: true }, img: IMG.neonGarage },
  { slug: "oktan-h7-classic", title: "OKTAN H7 Classic — 1 ks", sub: "H7 • 12 V 55 W", cat: "zarovky", brand: "OKTAN Parts", price: 5900, stock: 900, img: IMG.neonGarage },
  { slug: "oktan-flatline-600-450", title: "OKTAN FlatLine stěrače 600 + 450 mm", sub: "sada 2 ks • flat beam", cat: "sterace", brand: "OKTAN Parts", price: 49900, compare: 59900, stock: 210, img: IMG.wash },
  { slug: "oktan-brzdove-desticky-b37", title: "OKTAN brzdové destičky B37 — přední", sub: "sada na nápravu", cat: "podvozek-brzdy", brand: "OKTAN Parts", price: 89900, stock: 64, img: IMG.tireStack },
  { slug: "oktan-lamelovy-kotouc-125", title: "OKTAN lamelový kotouč na hliník SL50/125", sub: "ø 125 mm • zrnitost 60", cat: "spojovaci-material", brand: "OKTAN Parts", price: 13900, stock: 420, flags: { new: true }, img: IMG.mechanicTool },

  // ── Autopříslušenství (TREKA + VOLTIX elektro) ──
  { slug: "treka-box-460", title: "TREKA střešní box 460 l — černý lesk", sub: "460 l • oboustranné otevírání", cat: "stresni-boxy-nosice", brand: "TREKA", price: 599000, compare: 749000, stock: 21, flags: { featured: true }, img: IMG.roadTrip },
  { slug: "treka-nosic-kol-2", title: "TREKA nosič kol na tažné zařízení — 2 kola", sub: "2 kola • sklopný", cat: "stresni-boxy-nosice", brand: "TREKA", price: 449000, stock: 17, flags: { new: true }, img: IMG.sportRoad },
  { slug: "treka-pricniky-alu", title: "TREKA ALU příčníky uzamykatelné", sub: "pár • aero profil", cat: "stresni-boxy-nosice", brand: "TREKA", price: 189000, stock: 44, img: IMG.greyBmw },
  { slug: "oktan-autolekarnicka", title: "OKTAN autolékárnička textilní", sub: "obsah dle EU-MDR", cat: "povinna-vybava", brand: "OKTAN Parts", price: 14900, compare: 18900, stock: 610, flags: { featured: true }, img: IMG.redForest },
  { slug: "voltix-drzak-iconiq-xxl", title: "VOLTIX držák do auta Iconiq XXL", sub: "přísavka • čelisti 55–95 mm", cat: "drzaky-elektro", brand: "VOLTIX", price: 34900, stock: 190, flags: { featured: true }, img: IMG.whiteCar },
  { slug: "voltix-drzak-crab", title: "VOLTIX držák na mobil Crab s antivibrací", sub: "řídítka • antivibrační", cat: "drzaky-elektro", brand: "VOLTIX", price: 79900, stock: 85, flags: { featured: true }, img: IMG.openHood },
  { slug: "voltix-inspekcni-kamera", title: "VOLTIX inspekční kamera FlexCam 5 m", sub: "ø 8 mm • LCD 4,3\" • IP67", cat: "drzaky-elektro", brand: "VOLTIX", price: 159000, compare: 229000, stock: 26, flags: { featured: true }, img: IMG.mechanicDark },
  { slug: "oktan-kompresor-12v", title: "OKTAN kompresor 12 V s manometrem", sub: "10 bar • LED svítilna", cat: "kompresory", brand: "OKTAN Parts", price: 69900, stock: 96, img: IMG.tireStack },
  { slug: "voltix-led-telescopic", title: "VOLTIX LEDinspect Telescopic 270", sub: "270 lm • teleskop + magnet", cat: "vnitrni-doplnky", brand: "VOLTIX", price: 49000, stock: 120, flags: { new: true }, img: IMG.neonGarage },

  // ── Autokosmetika (KRYSTAL) ──
  { slug: "krystal-autosampon-vosk-500", title: "KRYSTAL autošampon s voskem — 500 ml", sub: "500 ml • koncentrát 1:200", cat: "karoserie-cisteni", brand: "KRYSTAL", price: 7900, compare: 9900, stock: 340, flags: { featured: true }, img: IMG.wash },
  { slug: "krystal-detail-set", title: "KRYSTAL Detailing set — lak, okna, interiér", sub: "3× 500 ml + 2 utěrky", cat: "detailing", brand: "KRYSTAL", price: 59900, stock: 78, flags: { new: true }, img: IMG.greyPorsche },
  { slug: "krystal-ozivovac-plastu-400", title: "KRYSTAL oživovač plastů a pneu — 400 ml", sub: "400 ml • satén finish", cat: "disky-pneu-cisteni", brand: "KRYSTAL", price: 11900, stock: 260, flags: { featured: true }, img: IMG.wash },
  { slug: "krystal-kartac-disky", title: "KRYSTAL kartáč na disky kol", sub: "měkké vlákno • bez poškrábání", cat: "disky-pneu-cisteni", brand: "KRYSTAL", price: 4900, stock: 410, img: IMG.tireStack },
  { slug: "krystal-cistic-interieru-500", title: "KRYSTAL čistič interiéru — 500 ml", sub: "500 ml • textil i plasty", cat: "interier-cisteni", brand: "KRYSTAL", price: 12900, stock: 230, img: IMG.whiteCar },
  { slug: "krystal-tepovac-puzzi", title: "KRYSTAL tepovač ProClean 10/1", sub: "1200 W • 10 l nádrž", cat: "interier-cisteni", brand: "KRYSTAL", price: 1590000, stock: 8, flags: { new: true }, img: IMG.greyPorsche },

  // ── Pneu a disky ──
  { slug: "oktan-retezy-kn090", title: "OKTAN sněhové řetězy KN090", sub: "195/65 R15 – 205/55 R16", cat: "snehove-retezy", brand: "OKTAN Parts", price: 79000, compare: 99000, stock: 110, img: IMG.tireStack },
  { slug: "oktan-tpms-senzor", title: "OKTAN snímač tlaku TPMS univerzální", sub: "433 MHz • programovatelný", cat: "tpms", brand: "OKTAN Parts", price: 59000, stock: 140, img: IMG.tireStack },
  { slug: "oktan-pytel-na-pneu-4ks", title: "OKTAN pytle na pneumatiky — 4 ks", sub: "1000×1000 mm • igelit", cat: "pneu-disky", brand: "OKTAN Parts", price: 3900, stock: 800, img: IMG.tireStack },

  // ── Dílna (FEROX) ──
  { slug: "ferox-gola-108", title: "FEROX gola sada 108 dílů 1/4\"+1/2\"", sub: "108 dílů • CrV • kufr", cat: "rucni-naradi", brand: "FEROX", price: 199000, compare: 249000, stock: 37, flags: { featured: true }, img: IMG.mechanicTool },
  { slug: "ferox-zvedak-2t", title: "FEROX pojízdný zvedák 2 t nízkoprofilový", sub: "80–380 mm • 2 t", cat: "zvedaky", brand: "FEROX", price: 249000, stock: 19, img: IMG.mechanicDark },
  { slug: "ferox-obd-scan", title: "FEROX OBD-II diagnostika ScanPro BT", sub: "Bluetooth • CZ aplikace", cat: "diagnostika", brand: "FEROX", price: 119000, stock: 55, flags: { new: true }, img: IMG.openHood },
  { slug: "ferox-sroubovak-ventilku", title: "FEROX šroubovák ventilových vložek", sub: "s hrotem • pochromovaný", cat: "rucni-naradi", brand: "FEROX", price: 1500, stock: 950, img: IMG.mechanicTool },
  { slug: "ferox-ponk-organizer", title: "FEROX závěsný organizér na nářadí", sub: "120 × 60 cm • 24 háků", cat: "garazove-vybaveni", brand: "FEROX", price: 89000, stock: 42, img: IMG.mechanicDark },

  // ── Výprodej ──
  { slug: "oktan-montazni-kit-187", title: "OKTAN montážní kit patek 187098", sub: "4 ks • pro TREKA příčníky", cat: "vyprodej", brand: "OKTAN Parts", price: 39000, compare: 47000, stock: 12, img: IMG.greyBmw },
  { slug: "oktan-sroub-kola-m14", title: "OKTAN šroub kola M14×1,5", sub: "kužel • pozink", cat: "vyprodej", brand: "OKTAN Parts", price: 2500, compare: 3200, stock: 340, img: IMG.tireStack },
  { slug: "oktan-zpetny-ventil", title: "OKTAN zpětný ventil paliva", sub: "ø 8 mm", cat: "vyprodej", brand: "OKTAN Parts", price: 35000, compare: 45300, stock: 27, img: IMG.oilPour },
  { slug: "oktan-o-krouzek-sada", title: "OKTAN O-kroužky NBR — sada 50 ks", sub: "50 ks • box", cat: "vyprodej", brand: "OKTAN Parts", price: 1800, compare: 2300, stock: 480, img: IMG.mechanicTool },
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
    const desc = `${p.title} (${p.sub}). Skladem na centrálním skladu i pobočkách — dnes objednáte, zítra vyzvednete. Doprava zdarma nad 1 500 Kč, odborné poradenství na zákaznické lince 704 123 456.`;
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
    if (p.flags?.featured) await link(pid, "akce");
    if (p.flags?.new) await link(pid, "novinky");
    if (p.compare && p.cat !== "vyprodej") await link(pid, "vyprodej");

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
       VALUES ($1,$2,$3,$4,'import','eshop-18 seed')`,
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
