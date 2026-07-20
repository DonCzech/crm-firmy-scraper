/** Naplní parametry produktů (commerce_param_definitions + commerce_product_params) pro tenant eshop-01-v2. */
import { Pool } from "pg";
import { readFileSync } from "fs";

for (const line of readFileSync("/Users/apple/DEV/CRM/venom/.env.local", "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TENANT_ID = 1275;

// [název parametru, jednotka|null, hodnota]
type P = [string, string | null, string];

const PARAMS: Record<string, P[]> = {
  "macbook-air-m3": [["Procesor", null, "Apple M3 (8 jader)"], ["Operační paměť", "GB", "16"], ["Úložiště", "GB", "512"], ["Úhlopříčka displeje", "palců", "15,3"], ["Rozlišení", null, "2880 × 1864"], ["Výdrž baterie", "h", "18"], ["Hmotnost", "kg", "1,51"], ["Operační systém", null, "macOS"]],
  "ipad-air-m2": [["Procesor", null, "Apple M2"], ["Úhlopříčka displeje", "palců", "11"], ["Úložiště", "GB", "256"], ["Konektor", null, "USB-C"], ["Podpora stylusu", null, "Apple Pencil Pro"], ["Hmotnost", "g", "462"]],
  "samsung-galaxy-s24-ultra": [["Úhlopříčka displeje", "palců", "6,8"], ["Rozlišení", null, "3120 × 1440 (QHD+)"], ["Operační paměť", "GB", "12"], ["Úložiště", "GB", "512"], ["Fotoaparát", "Mpx", "200"], ["Kapacita baterie", "mAh", "5000"], ["Odolnost", null, "IP68"], ["Operační systém", null, "Android 14"]],
  "xiaomi-14-ultra": [["Úhlopříčka displeje", "palců", "6,73"], ["Operační paměť", "GB", "16"], ["Úložiště", "GB", "512"], ["Fotoaparát", null, "Leica Quad 50 Mpx"], ["Kapacita baterie", "mAh", "5300"], ["Rychlé nabíjení", "W", "90"], ["Operační systém", null, "Android 14"]],
  "sony-wh-1000xm5": [["Konstrukce", null, "Přes uši (circumaurální)"], ["Aktivní potlačení hluku", null, "Ano, adaptivní"], ["Výdrž baterie", "h", "30"], ["Rychlé nabití", null, "3 min = 3 h přehrávání"], ["Kodeky", null, "LDAC, AAC, SBC"], ["Multipoint", null, "Ano, 2 zařízení"], ["Hmotnost", "g", "250"]],
  "bose-qc-ultra-earbuds": [["Konstrukce", null, "Špunty (TWS)"], ["Aktivní potlačení hluku", null, "Ano, CustomTune"], ["Výdrž baterie", "h", "6 + 18 (pouzdro)"], ["Odolnost", null, "IPX4"], ["Prostorový zvuk", null, "Bose Immersive Audio"], ["Hmotnost", "g", "6,2 / špunt"]],
  "jbl-flip-6": [["Výkon", "W", "30"], ["Výdrž baterie", "h", "12"], ["Odolnost", null, "IP67 (voda i prach)"], ["Bluetooth", null, "5.1, PartyBoost"], ["Hmotnost", "g", "550"], ["Rozměry", "cm", "17,8 × 6,8 × 7,2"]],
  "lenovo-tab-p12": [["Úhlopříčka displeje", "palců", "12,7"], ["Rozlišení", null, "2944 × 1840 (3K)"], ["Operační paměť", "GB", "8"], ["Úložiště", "GB", "256"], ["Kapacita baterie", "mAh", "10200"], ["Stylus", null, "Tab Pen Plus v balení"]],
  "usb-c-hub-7v1": [["Porty", null, "HDMI 4K, 2× USB-A 3.0, USB-C PD, SD, microSD, jack"], ["Napájení (PD)", "W", "100"], ["Rozlišení výstupu", null, "4K @ 60 Hz"], ["Materiál", null, "Hliník"], ["Délka kabelu", "cm", "15"]],
  "garmin-venu-3": [["Úhlopříčka displeje", "palců", "1,4 AMOLED"], ["Výdrž baterie", null, "až 14 dní"], ["GPS", null, "GPS, GLONASS, Galileo"], ["Voděodolnost", null, "5 ATM"], ["Senzory", null, "Tep, SpO2, EKG, spánek"], ["Hmotnost", "g", "47"]],
  "suunto-9-peak-pro": [["Úhlopříčka displeje", "palců", "1,2"], ["Výdrž baterie (GPS)", "h", "40"], ["Voděodolnost", "m", "100"], ["Materiál lunety", null, "Nerezová ocel"], ["Sportovní režimy", null, "97"], ["Hmotnost", "g", "64"]],
  "smart-zavlaha-wifi": [["Konektivita", null, "WiFi 2,4 GHz + aplikace"], ["Počet zón", null, "6"], ["Napájení", null, "230 V / 24 V AC"], ["Kompatibilita", null, "Google Home, Alexa"], ["Krytí", null, "IP44"]],
  "tricko-oversized-premium": [["Materiál", null, "100% česaná bavlna"], ["Gramáž", "g/m²", "240"], ["Střih", null, "Oversized"], ["Velikosti", null, "S–XXL"], ["Péče", null, "Praní 30 °C"], ["Původ", null, "Portugalsko"]],
  "polo-kosile-pique": [["Materiál", null, "100% bavlna piqué"], ["Gramáž", "g/m²", "220"], ["Střih", null, "Regular"], ["Límec", null, "Žebrovaný, 2 knoflíky"], ["Velikosti", null, "S–3XL"]],
  "mikina-zip-tech-fleece": [["Materiál", null, "69% bavlna, 31% polyester"], ["Technologie", null, "Tech Fleece — lehký termo úplet"], ["Kapuce", null, "Ano, strukturovaná"], ["Kapsy", null, "2 na zip"], ["Velikosti", null, "XS–XXL"]],
  "dziny-slim-fit": [["Materiál", null, "98% bavlna, 2% elastan"], ["Střih", null, "Slim fit"], ["Zapínání", null, "Zip + knoflík"], ["Gramáž denimu", "oz", "12"], ["Velikosti", null, "W28–W38"]],
  "zimni-bunda-parka": [["Zateplení", null, "Péřové 700 cuin (80/20)"], ["Vodní sloupec", "mm", "10 000"], ["Kapuce", null, "Odnímatelná s kožešinou"], ["Teplotní komfort", "°C", "do −25"], ["Kapsy", null, "6 vnějších, 2 vnitřní"], ["Velikosti", null, "S–XXL"]],
  "damske-saty-midi": [["Materiál", null, "100% viskóza LENZING™"], ["Délka", null, "Midi, pod kolena"], ["Střih", null, "Zavinovací (wrap)"], ["Rukáv", null, "3/4"], ["Velikosti", null, "XS–XL"]],
  "detske-tricko-dinosaurus": [["Materiál", null, "100% BIO bavlna"], ["Certifikace", null, "OEKO-TEX Standard 100"], ["Potisk", null, "Vodní barvy, bez ftalátů"], ["Velikosti", null, "98–152"]],
  "nike-air-max-90": [["Svršek", null, "Kůže + textil + syntetika"], ["Tlumení", null, "Air-Sole jednotka v patě"], ["Podrážka", null, "Guma, vzorek waffle"], ["Určení", null, "Volný čas"], ["Velikosti", null, "EU 38,5–47,5"]],
  "bezecke-boty-ultraboost": [["Tlumení", null, "BOOST™ mezipodešev"], ["Drop", "mm", "10"], ["Hmotnost", "g", "310 (vel. 42)"], ["Svršek", null, "PRIMEKNIT+ úplet"], ["Podrážka", null, "Continental™ guma"], ["Určení", null, "Silniční běh"]],
  "converse-chuck-70": [["Svršek", null, "12oz bavlněné plátno"], ["Podrážka", null, "Vulkanizovaná guma"], ["Stélka", null, "OrthoLite™"], ["Výška", null, "Kotníková (Hi)"], ["Velikosti", null, "EU 36–46"]],
  "dr-martens-1460": [["Svršek", null, "Hladká kůže Smooth"], ["Podrážka", null, "AirWair™ s olejivzdorností"], ["Šití", null, "Goodyear welt, žluté prošití"], ["Počet dírek", null, "8"], ["Velikosti", null, "EU 36–47"]],
  "salomon-x-ultra-4-gtx": [["Membrána", null, "GORE-TEX"], ["Podrážka", null, "Contagrip® MA"], ["Hmotnost", "g", "380 (polovina páru)"], ["Šněrování", null, "Quicklace™"], ["Určení", null, "Turistika, treking"]],
  "batoh-turisticky-40l": [["Objem", "l", "40"], ["Hmotnost", "kg", "1,3"], ["Zádový systém", null, "Odvětrávaný, nastavitelný"], ["Pláštěnka", null, "Integrovaná v balení"], ["Materiál", null, "Ripstop nylon 210D"]],
  "kettlebell-litina-16kg": [["Hmotnost", "kg", "16"], ["Materiál", null, "Litina, práškový lak"], ["Rukojeť", null, "Hladká, průměr 33 mm"], ["Základna", null, "Plochá, stabilní"]],
  "jogamatka-tpe-6mm": [["Tloušťka", "mm", "6"], ["Materiál", null, "TPE, bez latexu a PVC"], ["Rozměry", "cm", "183 × 61"], ["Hmotnost", "g", "900"], ["Povrch", null, "Oboustranný protiskluz"]],
  "cyklo-dres-letni": [["Materiál", null, "Recyklovaný polyester"], ["Střih", null, "Race fit"], ["Kapsy", null, "3 zadní + 1 na zip"], ["Zip", null, "Celorozepínací YKK"], ["UV ochrana", null, "UPF 50+"]],
  "protein-bar-box-12": [["Obsah bílkovin", "g", "20 / tyčinka"], ["Hmotnost tyčinky", "g", "60"], ["Počet kusů", null, "12"], ["Bez přidaného cukru", null, "Ano"], ["Příchutě", null, "Mix 4 příchutí"]],
  "lnene-povleceni-set": [["Materiál", null, "100% len, stone-washed"], ["Gramáž", "g/m²", "165"], ["Rozměry", null, "140 × 200 + 70 × 90 cm"], ["Certifikace", null, "OEKO-TEX"], ["Zapínání", null, "Skryté knoflíky"]],
  "svicka-sojova-amber": [["Vosk", null, "100% sójový"], ["Doba hoření", "h", "55"], ["Vůně", null, "Ambra & santalové dřevo"], ["Hmotnost", "g", "290"], ["Knot", null, "Bavlněný, bez olova"]],
  "keramicky-difuzer": [["Materiál", null, "Matná keramika"], ["Objem nádržky", "ml", "100"], ["Provoz", null, "Ultrazvukový, tichý <25 dB"], ["Časovač", null, "1/3/6 h"], ["LED podsvícení", null, "Teplé bílé, vypínatelné"]],
  "dekoracni-vaza-sklo": [["Materiál", null, "Ručně foukané sklo"], ["Výška", "cm", "24"], ["Průměr", "cm", "16"], ["Barva", null, "Kouřová jantarová"]],
  "stolni-lampa-led": [["Světelný tok", "lm", "450"], ["Teplota světla", "K", "2700–6500, plynulá"], ["Stmívání", null, "Dotykové, 5 úrovní"], ["Napájení", null, "USB-C"], ["Materiál", null, "Hliník + silikon"]],
  "french-press-skleneny": [["Objem", "l", "1"], ["Materiál", null, "Borosilikátové sklo + nerez"], ["Vhodné do myčky", null, "Ano"], ["Filtr", null, "Trojitý nerezový"]],
  "hydratacni-krem-50ml": [["Objem", "ml", "50"], ["Typ pleti", null, "Všechny, vč. citlivé"], ["Klíčové složky", null, "Kyselina hyaluronová, ceramidy"], ["Hydratace", "h", "72"], ["Bez parfemace", null, "Ano"]],
  "serum-vitamin-c": [["Objem", "ml", "30"], ["Koncentrace", "%", "20 (L-askorbová kyselina)"], ["Doplňkové složky", null, "Vitamin E, ferulová kyselina"], ["Aplikace", null, "Ráno, pod SPF"], ["Vegan", null, "Ano"]],
  "pleotva-maska-kolagen": [["Objem", "ml", "75"], ["Klíčové složky", null, "Mořský kolagen, aloe vera"], ["Doba působení", "min", "15"], ["Typ pleti", null, "Suchá a zralá"]],
  "sampon-bezsulfatovy": [["Objem", "ml", "300"], ["Bez sulfátů", null, "Ano (SLS/SLES free)"], ["Klíčové složky", null, "Keratin, arganový olej"], ["Typ vlasů", null, "Poškozené, barvené"], ["Vegan", null, "Ano"]],
  "parfem-acqua-di-gio": [["Objem", "ml", "100"], ["Koncentrace", null, "Eau de Parfum"], ["Vůňová rodina", null, "Svěží akvatická"], ["Hlava", null, "Bergamot, mořské tóny"], ["Základ", null, "Cedr, pačuli"]],
  "bio-olej-jojobovy": [["Objem", "ml", "100"], ["Certifikace", null, "COSMOS Organic"], ["Lisování", null, "Za studena, nerafinovaný"], ["Použití", null, "Pleť, vlasy, nehty"], ["Vegan", null, "Ano"]],
  "moleskine-classic-l": [["Formát", null, "L (13 × 21 cm)"], ["Počet stran", null, "240"], ["Papír", "g/m²", "70, ivory"], ["Linkování", null, "Linkovaný"], ["Vazba", null, "Tvrdá, kulaté rohy, gumička"]],
  "zapisnik-a5-teckovany": [["Formát", null, "A5 (14,5 × 21 cm)"], ["Počet stran", null, "251, číslované"], ["Papír", "g/m²", "80"], ["Linkování", null, "Tečkovaný (dotted)"], ["Doplňky", null, "2 záložky, kapsa, rejstřík"]],
  "zahradni-nuzky-bypass": [["Typ střihu", null, "Bypass (dvoubřité)"], ["Max. průměr větve", "mm", "25"], ["Materiál čepele", null, "Kalená ocel, nepřilnavý povlak"], ["Rukojeť", null, "Ergonomická, protiskluzová"], ["Pojistka", null, "Jednoruční"]],
  "zrnkova-kava-ethiopia": [["Hmotnost", "g", "500"], ["Původ", null, "Etiopie, Yirgacheffe"], ["Pražení", null, "Světlé — filtr"], ["Zpracování", null, "Promytá (washed)"], ["Chuťový profil", null, "Citrusy, bergamot, květiny"], ["Odrůda", null, "Heirloom, 1900–2200 m n. m."]],
  "caj-matcha-ceremonial": [["Hmotnost", "g", "30"], ["Kvalita", null, "Ceremonial Grade"], ["Původ", null, "Uji, Japonsko"], ["Sklizeň", null, "První (ichibancha)"], ["Skladování", null, "V chladu, bez světla"]],
  "cokolada-70-peru": [["Obsah kakaa", "%", "70"], ["Původ bobů", null, "Peru, single origin"], ["Hmotnost", "g", "70"], ["Zpracování", null, "Bean-to-bar"], ["Bez lecitinu", null, "Ano"]],
  "vino-prosecco-doc": [["Objem", "l", "0,75"], ["Apelace", null, "Prosecco DOC"], ["Odrůda", null, "Glera"], ["Zbytkový cukr", null, "Extra Dry (12–17 g/l)"], ["Obsah alkoholu", "%", "11"], ["Servírovat při", "°C", "6–8"]],
  "chia-seminka-bio": [["Hmotnost", "g", "500"], ["Certifikace", null, "BIO (CZ-BIO-001)"], ["Obsah vlákniny", "g", "34 / 100 g"], ["Obsah omega-3", "g", "18 / 100 g"], ["Původ", null, "Paraguay"]],
};

function slugify(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const products = (await pool.query(
    `SELECT id, slug FROM products WHERE tenant_id=$1`, [TENANT_ID]
  )).rows as { id: number; slug: string }[];
  const bySlug = new Map(products.map((p) => [p.slug, p.id]));

  // 1) Definice — unikátní podle názvu
  const defIds = new Map<string, number>();
  let pos = 0;
  const allDefs = new Map<string, string | null>();
  for (const params of Object.values(PARAMS)) {
    for (const [name, unit] of params) {
      if (!allDefs.has(name)) allDefs.set(name, unit);
    }
  }
  for (const [name, unit] of allDefs) {
    const slug = slugify(name);
    const r = await pool.query(
      `INSERT INTO commerce_param_definitions (tenant_id, slug, name, type, unit, filterable, position)
       VALUES ($1, $2, $3, 'text', $4, false, $5)
       ON CONFLICT (tenant_id, slug) DO UPDATE SET name=EXCLUDED.name, unit=EXCLUDED.unit
       RETURNING id`,
      [TENANT_ID, slug, name, unit, pos++]
    );
    defIds.set(name, r.rows[0].id);
  }
  console.log(`Definice: ${defIds.size}`);

  // 2) Hodnoty
  await pool.query(`DELETE FROM commerce_product_params WHERE tenant_id=$1`, [TENANT_ID]);
  let values = 0, missing = 0;
  for (const [slug, params] of Object.entries(PARAMS)) {
    const productId = bySlug.get(slug);
    if (!productId) { console.log(`⚠️ produkt nenalezen: ${slug}`); missing++; continue; }
    for (const [name, , value] of params) {
      const num = parseFloat(value.replace(",", "."));
      await pool.query(
        `INSERT INTO commerce_product_params (tenant_id, product_id, param_id, value, numeric_value)
         VALUES ($1, $2, $3, $4, $5)`,
        [TENANT_ID, productId, defIds.get(name), value, Number.isFinite(num) && /^[\d,.]+/.test(value) ? num : null]
      );
      values++;
    }
  }
  console.log(`Hodnoty: ${values}, chybějící produkty: ${missing}, produktů s parametry: ${Object.keys(PARAMS).length}`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
