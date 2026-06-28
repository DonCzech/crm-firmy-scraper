/**
 * Demo-data patch pro peak-cut-demo (full-page-clone)
 * Nahrazuje VEŠKERÁ originální data za demo hodnoty.
 */

import fs from "node:fs";
import { Pool } from "pg";

const env = fs.readFileSync(".env.local", "utf8");
const databaseUrl = env.split(/\r?\n/).find(l => l.startsWith("DATABASE_URL="))?.slice("DATABASE_URL=".length);
if (!databaseUrl) throw new Error("DATABASE_URL missing");

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

function patch(html) {

  // ── 1. Sociální sítě ──────────────────────────────────────────────────────
  html = html.replace(/https:\/\/instagram\.com\/peakcut\.barbershop[^"']*/g, "https://instagram.com/demo");
  html = html.replace(/https:\/\/www\.facebook\.com\/peakcutbarbershop/g, "https://facebook.com/demo");

  // ── 2. Telefon ────────────────────────────────────────────────────────────
  html = html.replace(/\+420 608 288 777/g, "+420 704 123 456");
  html = html.replace(/tel:\+420 608 288 777/g, "tel:+420704123456");

  // ── 3. Legal blok (původní 2 firmy) ──────────────────────────────────────
  html = html.replace(
    /Pashkov s\.r\.o\. , Praha IČO 19446969 - Čerpadlová 1034\/2, Vysočany \(Praha 9\), 190 00 Praha[\s\S]*?Vlkova 479\/9, 13000/,
    "Demo Studio s.r.o. IČO 12345678 DIČ CZ12345678 — Ukázková 123, 110 00 Praha 1. Jednatel: Jan Demo."
  );

  // ── 4. Jméno + IČO (zbytky) ───────────────────────────────────────────────
  html = html.replace(/Illia Pashkov/g, "Jan Demo");
  html = html.replace(/Pashkov s\.r\.o\./g, "Demo Studio s.r.o.");
  html = html.replace(/IČO 04674073/g, "IČO 12345678");
  html = html.replace(/IČO 19446969/g, "IČO 12345678");
  html = html.replace(/04674073/g, "12345678");

  // ── 5. Adresy poboček ─────────────────────────────────────────────────────
  // Pobočka 1: Žižkov → Ukázková
  html = html.replace(/Vlkova 9, Žižkov, Praha 3/g, "Ukázková 123, Praha 1");
  html = html.replace(/Vlkova 479\/9, 13000/g, "Ukázková 123, Praha 1");
  html = html.replace(/>ŽIŽKOV</g, ">UKÁZKOVÁ<");
  html = html.replace(/class="title-2 contacts__title">Žižkov</g, 'class="title-2 contacts__title">Ukázková');

  // Pobočka 2: Dejvice → Vzorová
  html = html.replace(/Wuchterlova 584\/16, 160 00 Praha 6/g, "Vzorová 456, Praha 2");
  html = html.replace(/>DEJVICE</g, ">VZOROVÁ<");
  html = html.replace(/class="title-2 contacts__title">Dejvice</g, 'class="title-2 contacts__title">Vzorová');

  // Google Maps route URL hrefs pro obě pobočky → OSM demo
  html = html.replace(
    /https:\/\/www\.google\.com\/maps\/dir\/\/Vlkova[^"']*/g,
    "https://www.openstreetmap.org/search?query=Praha+1"
  );
  html = html.replace(
    /https:\/\/www\.google\.com\/maps\/dir\/\/Wuchterlova[^"']*/g,
    "https://www.openstreetmap.org/search?query=Praha+2"
  );

  // routeArray JSON v inline skriptu
  html = html.replace(
    /const routeArray = Object\.values\(JSON\.parse\('[^']+'\)\);/,
    "const routeArray = ['https://www.openstreetmap.org/search?query=Praha+1', 'https://www.openstreetmap.org/search?query=Praha+2'];"
  );

  // ── 6. Hodnocení ─────────────────────────────────────────────────────────
  html = html.replace(/>4,9</g, ">4,8<");
  html = html.replace(/477 recenze/g, "127 recenzí");

  // ── 7. Recenze — jména a avatary ─────────────────────────────────────────
  // Tomáš N. → Jan N.
  html = html.replace(
    /<circle[^>]*fill="#1a73e8"[^>]*><\/circle><text[^>]*>TN<\/text>/,
    '<circle cx="25" cy="25" r="25" fill="#1a73e8"></circle><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Oswald,sans-serif" font-size="18" fill="#fff">JN</text>'
  );
  html = html.replace(/class="reviews__name">Tomáš N\.</, 'class="reviews__name">Jan N.<');
  html = html.replace(
    /Naprosto profesionální přístup\. Přišel jsem bez předchozí zkušenosti s tradičním holením a odcházel jsem nadšený\. Výsledek byl precizní, atmosféra barbershopu příjemná\. Určitě se vrátím\./,
    "Nejlepší barber v Praze. Fade mám pokaždé přesně tak, jak si představuju — bez zbytečného vysvětlování. Jasná volba pro každého, kdo bere svůj střih vážně."
  );

  // Marek H. → Tomáš D.
  html = html.replace(
    /<circle[^>]*fill="#34a853"[^>]*><\/circle><text[^>]*>MH<\/text>/,
    '<circle cx="25" cy="25" r="25" fill="#34a853"></circle><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Oswald,sans-serif" font-size="18" fill="#fff">TD</text>'
  );
  html = html.replace(/class="reviews__name">Marek H\.</, 'class="reviews__name">Tomáš D.<');
  html = html.replace(
    /Jedna z nejlepších zkušeností s barberstvím v Praze\. Střih přesně podle mých představ, barbér věděl co dělá\. Ceny odpovídají kvalitě\. Mohu jen doporučit\./,
    "Přišel jsem poprvé a hned věděl, že budu chodit pravidelně. Příjemná atmosféra, profíci co vědí co dělají. Holení břitvou je prostě rituál sám o sobě."
  );

  // Pavel K. → Martin Č.
  html = html.replace(
    /<circle[^>]*fill="#ea4335"[^>]*><\/circle><text[^>]*>PK<\/text>/,
    '<circle cx="25" cy="25" r="25" fill="#ea4335"></circle><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Oswald,sans-serif" font-size="18" fill="#fff">MČ</text>'
  );
  html = html.replace(/class="reviews__name">Pavel K\.</, 'class="reviews__name">Martin Č.<');
  html = html.replace(
    /Skvělé místo, příjemný personál\. Tradiční holení hot towel bylo zkušeností, jakou jsem nečekal — prémium servis za rozumnou cenu\. Barbershop s pravou americkou atmosférou\./,
    "Konečně barbershop, kde vám poradí a nesnaží se prodat víc, než potřebujete. Vousy upravené na míru, precizní finish — 100 % doporučuji."
  );

  // Ondřej M. → Petr S. (odstraníme zmínku Žižkova)
  html = html.replace(
    /<circle[^>]*fill="#fbbc04"[^>]*><\/circle><text[^>]*>OM<\/text>/,
    '<circle cx="25" cy="25" r="25" fill="#fbbc04"></circle><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Oswald,sans-serif" font-size="18" fill="#fff">PS</text>'
  );
  html = html.replace(/class="reviews__name">Ondřej M\.</, 'class="reviews__name">Petr S.<');
  html = html.replace(
    /Chodím sem pravidelně už přes rok\. Vždy profesionální, vždy přesný výsledek\. Nejlepší barber v okolí Žižkova\. Rezervace online funguje perfektně\./,
    "Chodím sem pravidelně přes rok. Vždy profesionální, vždy přesný výsledek. Rezervace online funguje perfektně, nikdy jsem nečekal."
  );

  // Jan Š. → Eva P.
  html = html.replace(
    /<circle[^>]*fill="#9c27b0"[^>]*><\/circle><text[^>]*>JŠ<\/text>/,
    '<circle cx="25" cy="25" r="25" fill="#9c27b0"></circle><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Oswald,sans-serif" font-size="18" fill="#fff">EP</text>'
  );
  html = html.replace(/class="reviews__name">Jan Š\.</, 'class="reviews__name">Eva P.<');
  html = html.replace(
    /Příjemná atmosféra, rychlá obsluha a perfektní výsledek\. Přišel jsem na doporučení kolegy a nelituji\. Prostředí je útulné, cítíte se jako na správném místě\./,
    "Příjemná atmosféra a perfektní výsledek. Přišla jsem na doporučení a nelituji. Prostředí je útulné, cítíte se vítáni."
  );

  // ── 8. Ceny služeb (±15–30 %) ────────────────────────────────────────────
  html = html.replace(/>850 CZK ?</g, ">750 Kč<");
  html = html.replace(/>1300 CZK ?</g, ">1 100 Kč<");
  html = html.replace(/>1200 CZK</g, ">1 050 Kč<");
  // 700 CZK se vyskytuje pro holení i dětský střih — ošetříme kontextem
  html = html.replace(/class="services__item-price text-2">700 CZK</g, 'class="services__item-price text-2">600 Kč<');
  html = html.replace(/>650 CZK ?</g, ">550 Kč<");
  html = html.replace(/>600 CZK ?</g, ">500 Kč<");
  html = html.replace(/>2000 CZK ?</g, ">1 700 Kč<");
  html = html.replace(/>300-600 CZK ?</g, ">250–500 Kč<");
  html = html.replace(/>150 CZK ?</g, ">130 Kč<");

  return html;
}

async function main() {
  const { rows } = await pool.query(
    `SELECT s.id, s.settings
     FROM tenants t
     JOIN pages p ON p.tenant_id = t.id AND p.slug = 'home'
     JOIN sections s ON s.page_id = p.id AND s.tenant_id = t.id
     WHERE t.slug = 'peak-cut-demo' AND s.section_type = 'full-page-clone'
     LIMIT 1`
  );
  if (!rows[0]) throw new Error("peak-cut-demo full-page-clone section not found");

  const section = rows[0];
  const settings = section.settings ?? {};
  const html = settings.html;

  const patched = patch(html);

  if (patched === html) {
    console.log("Žádné změny — patch již aplikován nebo patterny nenalezeny.");
    return;
  }

  await pool.query(
    `UPDATE sections SET settings = $1::jsonb, updated_at = now() WHERE id = $2`,
    [JSON.stringify({ ...settings, html: patched }), section.id]
  );

  // Shrnutí
  const checks = [
    ["Pashkov", !patched.includes("Pashkov")],
    ["04674073", !patched.includes("04674073")],
    ["Illia", !patched.includes("Illia")],
    ["+420 608 288 777", !patched.includes("+420 608 288 777")],
    ["Vlkova 9, Žižkov", !patched.includes("Vlkova 9, Žižkov")],
    ["Wuchterlova", !patched.includes("Wuchterlova")],
    ["peakcutbarbershop (FB)", !patched.includes("peakcutbarbershop")],
    ["peakcut.barbershop (IG)", !patched.includes("peakcut.barbershop")],
    ["Žižkova (recenze)", !patched.includes("Žižkova")],
    ["477 recenze", !patched.includes("477 recenze")],
    ["4,9 rating", !patched.includes(">4,9<")],
  ];

  console.log(`\nPatch aplikován (sekce ${section.id}): ${html.length} → ${patched.length} znaků\n`);
  console.log("AUDIT — originál nesmí existovat:");
  checks.forEach(([label, ok]) => console.log(`  ${ok ? "✅" : "❌"} ${label}`));
}

main()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(() => pool.end());
