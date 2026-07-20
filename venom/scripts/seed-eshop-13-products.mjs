/**
 * Seed produktového katalogu pro eshop-13-v2 (LUNELA — milagro DNA, šperky).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Fiktivní značky (brand purge): AURELLE, PALMERA, LUNELA Atelier.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-13-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-13-v2";

const U = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// Všechna ID vizuálně ověřena kontaktními archy (navbar mega + hero sheet)
const P = {
  pendantSilver: "1611652022419-a9419f74343d",
  pendantGold: "1599643478518-a784e5dc4c8f",
  pendantSymbol: "1602173574767-37ac01994b2a",
  ringsPaper: "1617038220319-276d3cfab638",
  braceletChain: "1611591437281-460bfbe1220a",
  braceletBangle: "1573408301185-9146fe634ad0",
  braceletCord: "1590548784585-643d2b9f2925",
  braceletPearl: "1535632066927-ab7c9ab60908",
  ringSilverDark: "1605100804763-247f67b3557e",
  ringPinkStone: "1603561591411-07134e71a2a9",
  pendantDiamond: "1598560917505-59a3ad559071",
  ringsWedding: "1606800052052-a08af7148866",
  earringsBlueHeart: "1630019852942-f89202989a59",
  chainsLayered: "1635767798638-3e25273a8236",
  necklaceSkin: "1610694955371-d4a3e0ce4b52",
  earringsDrop: "1629224316810-9d8805b95e76",
  necklaceSatin: "1599459183200-59c7687a0275",
  pearlPendant: "1611085583191-a3b181a88401",
  chokerGold: "1601121141461-9d6647bca1ed",
  pearlsBox: "1515562141207-7a88fb7ce338",
  modelRing: "1620656798579-1984d9e87df7",
  heartPendant: "1588444837495-c6cfeb53f32d",
  necklacesGold: "1601821765780-754fa98637c1",
  earGold: "1590166223826-12dee1677420",
  rubyRing: "1617117811969-97f441511dee",
  giftPink: "1549465220-1a8b9238cd48",
  giftRed: "1513885535751-8b9238bd345a",
  giftBlack: "1607344645866-009c320b63e0",
};

const CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 0, desc: "Nejnovější přírůstky kolekcí AURELLE a PALMERA.", img: P.earringsDrop },
  { slug: "vyprodej", name: "Výprodej", sort: 95, desc: "Zvýhodněné šperky — dokud zásoby stačí.", img: P.chainsLayered },

  { slug: "privesky", name: "Přívěsky", sort: 1, desc: "Přívěsky ze stříbra i pozlacené — symboly, které vyprávějí váš příběh.", img: P.pendantSilver },
  { slug: "privesky-stribrne", name: "Stříbrné přívěsky", sort: 0, parent: "privesky", img: P.pendantSilver },
  { slug: "privesky-pozlacene", name: "Pozlacené přívěsky", sort: 1, parent: "privesky", img: P.pendantGold },
  { slug: "privesky-symboly", name: "Přívěsky se symbolem", sort: 2, parent: "privesky", img: P.pendantSymbol },
  { slug: "privesky-murano", name: "Sklo Murano", sort: 3, parent: "privesky", img: P.ringsPaper },

  { slug: "naramky", name: "Náramky", sort: 2, desc: "Článkové, pevné i šňůrkové náramky pro každodenní eleganci.", img: P.braceletChain },
  { slug: "naramky-clankove", name: "Článkové náramky", sort: 0, parent: "naramky", img: P.braceletChain },
  { slug: "naramky-pevne", name: "Pevné náramky", sort: 1, parent: "naramky", img: P.braceletBangle },
  { slug: "naramky-snurka", name: "Náramky se šňůrkou", sort: 2, parent: "naramky", img: P.braceletCord },
  { slug: "naramky-perlove", name: "Perlové náramky", sort: 3, parent: "naramky", img: P.braceletPearl },

  { slug: "prsteny", name: "Prsteny", sort: 3, desc: "Stříbrné i pozlacené prsteny, s kameny i hladké.", img: P.ringSilverDark },
  { slug: "prsteny-stribrne", name: "Stříbrné prsteny", sort: 0, parent: "prsteny", img: P.ringSilverDark },
  { slug: "prsteny-pozlacene", name: "Pozlacené prsteny", sort: 1, parent: "prsteny", img: P.ringPinkStone },
  { slug: "prsteny-kameny", name: "Prsteny s kameny", sort: 2, parent: "prsteny", img: P.rubyRing },
  { slug: "prsteny-snubni", name: "Snubní a zásnubní", sort: 3, parent: "prsteny", img: P.ringsWedding },

  { slug: "nausnice", name: "Náušnice", sort: 4, desc: "Kruhy, pecky i visací náušnice — od jemných po výrazné.", img: P.earringsDrop },
  { slug: "nausnice-kruhy", name: "Kruhové náušnice", sort: 0, parent: "nausnice", img: P.earGold },
  { slug: "nausnice-pecky", name: "Pecky", sort: 1, parent: "nausnice", img: P.earringsBlueHeart },
  { slug: "nausnice-visaci", name: "Visací náušnice", sort: 2, parent: "nausnice", img: P.earringsDrop },
  { slug: "nausnice-perlove", name: "Perlové náušnice", sort: 3, parent: "nausnice", img: P.pearlsBox },

  { slug: "nahrdelniky", name: "Náhrdelníky", sort: 5, desc: "Řetízky, chokery a náhrdelníky s přívěskem.", img: P.necklaceSatin },
  { slug: "nahrdelniky-retizky", name: "Řetízky", sort: 0, parent: "nahrdelniky", img: P.chainsLayered },
  { slug: "nahrdelniky-privesek", name: "Náhrdelníky s přívěskem", sort: 1, parent: "nahrdelniky", img: P.pearlPendant },
  { slug: "nahrdelniky-chokery", name: "Chokery", sort: 2, parent: "nahrdelniky", img: P.chokerGold },
  { slug: "nahrdelniky-perlove", name: "Perlové náhrdelníky", sort: 3, parent: "nahrdelniky", img: P.pearlsBox },

  { slug: "kolekce", name: "Kolekce", sort: 6, desc: "Ucelené kolekce AURELLE a PALMERA.", img: P.modelRing },
  { slug: "kolekce-aurelle", name: "AURELLE", sort: 0, parent: "kolekce", img: P.pearlsBox },
  { slug: "kolekce-palmera", name: "PALMERA", sort: 1, parent: "kolekce", img: P.modelRing },
  { slug: "kolekce-laska", name: "Láska", sort: 2, parent: "kolekce", img: P.heartPendant },
  { slug: "kolekce-elegance", name: "Elegance", sort: 3, parent: "kolekce", img: P.necklacesGold },

  { slug: "darky", name: "Dárky", sort: 7, desc: "Šperk jako dárek — s dárkovým balením zdarma.", img: P.giftPink },
  { slug: "darky-partnerka", name: "Pro partnerku", sort: 0, parent: "darky", img: P.giftPink },
  { slug: "darky-maminka", name: "Pro maminku", sort: 1, parent: "darky", img: P.rubyRing },
  { slug: "darky-narozeniny", name: "K narozeninám", sort: 2, parent: "darky", img: P.giftRed },
  { slug: "darkove-poukazy", name: "Dárkové poukazy", sort: 3, parent: "darky", img: P.giftBlack },

  { slug: "gravirovani", name: "Gravírování", sort: 8, desc: "Šperky s gravírováním na míru — věnování, datum či iniciály.", img: P.pendantSymbol },
];

// price v haléřích; `variants` = [{ t: label, price, compare? }]
const PRODUCTS = [
  // ── Přívěsky ──
  { slug: "aurelle-stribrny-privesek-mesic", title: "AURELLE stříbrný přívěsek Měsíc", subtitle: "Stříbro 925 s kubickými zirkony, motiv půlměsíce", cat: "privesky-stribrne", brand: "AURELLE", flags: { new: true, featured: true }, img: [P.pendantSilver, P.pendantSymbol], price: 96900, stock: 26 },
  { slug: "aurelle-pozlaceny-privesek-vlnka", title: "AURELLE pozlacený přívěsek Vlnka", subtitle: "Pozlacené stříbro 14k, organický tvar vlny", cat: "privesky-pozlacene", brand: "AURELLE", flags: { featured: true }, img: [P.pendantGold], price: 129900, stock: 31 },
  { slug: "aurelle-privesek-modre-sklo", title: "AURELLE přívěsek modré sklo Murano", subtitle: "Ručně foukané benátské sklo s třpytem", cat: "privesky-murano", brand: "AURELLE", flags: { new: true, featured: true }, img: [P.earringsBlueHeart], price: 96900, stock: 18 },
  { slug: "lunela-privesek-srdce", title: "LUNELA Atelier přívěsek Srdce", subtitle: "Stříbro 925 s možností gravírování věnování", cat: "privesky-symboly", brand: "LUNELA Atelier", flags: { featured: true }, img: [P.heartPendant], price: 149900, compare: 179900, stock: 22 },

  // ── Náramky ──
  { slug: "aurelle-clankovy-naramek-oval", title: "AURELLE článkový náramek Oval", subtitle: "Pozlacené stříbro s oválnými články a perlou", cat: "naramky-clankove", brand: "AURELLE", flags: { new: true, featured: true }, img: [P.braceletChain], price: 294900, stock: 14 },
  { slug: "aurelle-pevny-naramek-organic", title: "AURELLE pevný náramek Organic", subtitle: "Pevný náramek organického tvaru osazený kameny", cat: "naramky-pevne", brand: "AURELLE", flags: { new: true, featured: true }, img: [P.braceletBangle], price: 463900, stock: 9 },
  { slug: "palmera-naramek-cordell", title: "PALMERA náramek Cordell", subtitle: "Bavlněná šňůrka s pozlaceným otevíratelným článkem", cat: "naramky-snurka", brand: "PALMERA", img: [P.braceletCord], price: 119900, compare: 149900, stock: 27 },
  { slug: "lunela-perlovy-naramek", title: "LUNELA Atelier perlový náramek", subtitle: "Sladkovodní kultivované perly na hedvábné šňůře", cat: "naramky-perlove", brand: "LUNELA Atelier", img: [P.braceletPearl], price: 219900, stock: 16 },

  // ── Prsteny ──
  { slug: "aurelle-prsten-srdce", title: "AURELLE prsten Srdce", subtitle: "Prsten s organickým tvarem srdce, osazené kameny", cat: "prsteny-stribrne", brand: "AURELLE", flags: { new: true, featured: true }, img: [P.ringSilverDark], optName: "Velikost", variants: [{ t: "52", price: 269900 }, { t: "54", price: 269900 }, { t: "56", price: 269900 }], stock: 24 },
  { slug: "aurelle-pozlaceny-prsten-rose", title: "AURELLE pozlacený prsten Rosé", subtitle: "Růžově pozlacený prsten s broušeným kamenem", cat: "prsteny-pozlacene", brand: "AURELLE", flags: { featured: true }, img: [P.ringPinkStone], optName: "Velikost", variants: [{ t: "52", price: 319900 }, { t: "54", price: 319900 }], stock: 12 },
  { slug: "palmera-prsten-rubin", title: "PALMERA prsten Vino", subtitle: "Pozlacený prsten s granátově červeným kamenem", cat: "prsteny-kameny", brand: "PALMERA", img: [P.rubyRing], optName: "Velikost", variants: [{ t: "52", price: 249900, compare: 289900 }, { t: "54", price: 249900, compare: 289900 }], stock: 11 },
  { slug: "lunela-snubni-prsteny-uni", title: "LUNELA Atelier snubní prsteny Uni", subtitle: "Pár hladkých prstenů ze žlutého zlata s gravírováním zdarma", cat: "prsteny-snubni", brand: "LUNELA Atelier", flags: { featured: true }, img: [P.ringsWedding], price: 1290000, stock: 6 },

  // ── Náušnice ──
  { slug: "aurelle-kruhove-nausnice-srdce", title: "AURELLE kruhové náušnice Srdce", subtitle: "Kruhové náušnice s organickým tvarem srdce, osazené kameny", cat: "nausnice-kruhy", brand: "AURELLE", flags: { new: true, featured: true }, img: [P.earGold], price: 269900, stock: 19 },
  { slug: "aurelle-pecky-trpyt", title: "AURELLE pecky Třpyt", subtitle: "Drobné pecky se zirkony, stříbro 925", cat: "nausnice-pecky", brand: "AURELLE", img: [P.earringsBlueHeart], price: 96900, compare: 119900, stock: 42 },
  { slug: "palmera-visaci-nausnice-drop", title: "PALMERA visací náušnice Drop", subtitle: "Kapkovité visací náušnice s krystaly, růžové zlacení", cat: "nausnice-visaci", brand: "PALMERA", flags: { new: true, featured: true }, img: [P.earringsDrop], price: 189900, stock: 15 },
  { slug: "lunela-perlove-nausnice", title: "LUNELA Atelier perlové náušnice", subtitle: "Klasické perlové náušnice se sladkovodní perlou", cat: "nausnice-perlove", brand: "LUNELA Atelier", img: [P.pearlsBox], price: 159900, stock: 21 },

  // ── Náhrdelníky ──
  { slug: "aurelle-nahrdelnik-vrstveny", title: "AURELLE vrstvený řetízek Trio", subtitle: "Tři pozlacené řetízky různých délek v jednom", cat: "nahrdelniky-retizky", brand: "AURELLE", flags: { new: true, featured: true }, img: [P.chainsLayered, P.necklaceSatin], price: 294900, stock: 13 },
  { slug: "aurelle-nahrdelnik-perla", title: "AURELLE náhrdelník s perlou", subtitle: "Jemný řetízek s přívěskem sladkovodní perly", cat: "nahrdelniky-privesek", brand: "AURELLE", flags: { featured: true }, img: [P.pearlPendant], price: 219900, stock: 25 },
  { slug: "palmera-pozlaceny-choker", title: "PALMERA pozlacený dutý choker", subtitle: "Výrazný pozlacený choker organického tvaru", cat: "nahrdelniky-chokery", brand: "PALMERA", flags: { new: true, featured: true }, img: [P.chokerGold, P.necklaceSkin], price: 363900, stock: 8 },
  { slug: "lunela-perlovy-nahrdelnik", title: "LUNELA Atelier perlový náhrdelník", subtitle: "Šňůra kultivovaných perel s uzávěrem z bílého zlata", cat: "nahrdelniky-perlove", brand: "LUNELA Atelier", img: [P.pearlsBox], price: 549900, compare: 649900, stock: 5 },
  { slug: "palmera-nahrdelnik-luna", title: "PALMERA náhrdelník Luna", subtitle: "Pozlacený náhrdelník s měsíčním obloučkem", cat: "nahrdelniky-privesek", brand: "PALMERA", img: [P.necklacesGold], price: 266000, stock: 17 },

  // ── Dárky ──
  { slug: "lunela-darkovy-poukaz", title: "LUNELA dárkový poukaz", subtitle: "Elektronický i tištěný poukaz v dárkové obálce", cat: "darkove-poukazy", brand: "LUNELA Atelier", img: [P.giftBlack], optName: "Hodnota", variants: [{ t: "1 000 Kč", price: 100000 }, { t: "2 000 Kč", price: 200000 }, { t: "5 000 Kč", price: 500000 }], stock: 999 },
  { slug: "lunela-darkove-baleni", title: "LUNELA dárkové balení Premium", subtitle: "Sametová krabička se saténovou stuhou a přáním", cat: "darky-narozeniny", brand: "LUNELA Atelier", img: [P.giftPink, P.giftRed], price: 19900, stock: 120 },
];

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
  if (!t.rows.length) throw new Error(`Tenant ${TENANT_SLUG} neexistuje`);
  const tenantId = t.rows[0].id;

  // wipe
  await client.query("DELETE FROM stock_movements WHERE tenant_id = $1", [tenantId]);
  await client.query("DELETE FROM product_category_links WHERE tenant_id = $1", [tenantId]);
  await client.query("DELETE FROM product_images WHERE tenant_id = $1", [tenantId]);
  await client.query("DELETE FROM product_variants WHERE tenant_id = $1", [tenantId]);
  await client.query("DELETE FROM products WHERE tenant_id = $1", [tenantId]);
  await client.query("DELETE FROM product_categories WHERE tenant_id = $1", [tenantId]);

  const catIds = new Map();
  for (const cat of CATEGORIES) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id, image_url)
       VALUES ($1,$2,$3,$4,$5,true,$6,$7) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, catIds.get(cat.parent), cat.img ? U(cat.img, 200, 200) : null]
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
    const variants = p.variants ?? [{ t: "Standard", price: p.price, compare: p.compare }];
    const optName = p.optName ?? "Provedení";
    const hasCompare = p.compare != null || variants.some(v => v.compare != null);
    const desc = `${p.subtitle}. ${p.title} — šperk z nabídky LUNELA s garancí pravosti a původu. Dárkové balení zdarma, doprava zdarma nad 1 500 Kč a výměna či vrácení do 30 dní.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.subtitle, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: optName, values: variants.map(v => v.t) }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (hasCompare) await link(pid, "vyprodej");
    if (p.flags?.new) await link(pid, "novinky");
    if (p.brand === "AURELLE") await link(pid, "kolekce-aurelle");
    if (p.brand === "PALMERA") await link(pid, "kolekce-palmera");

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase().slice(0, 22)}-${i}`, v.t,
         JSON.stringify({ [optName]: v.t }), v.price, v.compare ?? p.compare ?? null, p.stock, i === 0, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-13 seed')`,
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
