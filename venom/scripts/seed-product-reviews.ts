/** Naseeduje schválené recenze všem produktům tenanta eshop-01-v2 (3–8 na produkt). */
import { Pool } from "pg";
import { readFileSync } from "fs";

for (const line of readFileSync("/Users/apple/DEV/CRM/venom/.env.local", "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TENANT_ID = 1275;

const NAMES = ["Petr K.", "Jana Novotná", "Martin Svoboda", "Lucie D.", "Tomáš Havel", "Eva Marková", "Jakub P.", "Veronika S.", "Ondřej Beneš", "Kateřina H.", "Michal Urban", "Tereza Křížová", "David N.", "Barbora Malá", "Filip Zeman", "Alena P.", "Roman Šimek", "Markéta V.", "Vojtěch Král", "Simona R."];

const FIVE = [
  ["Naprostá spokojenost", "Předčilo očekávání, kvalita zpracování je na jedničku. Doporučuji všem."],
  ["Skvělý nákup", "Rychlé dodání, pečlivě zabalené a produkt přesně podle popisu. Beru znovu."],
  ["Doporučuji", "Používám několik týdnů a nemám jedinou výtku. Poměr cena/výkon výborný."],
  ["Top kvalita", "Vidíte a cítíte kvalitu hned po vybalení. Za mě jasných pět hvězd."],
  ["Nejlepší volba", "Dlouho jsem vybíral a tohle byla správná volba. Funguje perfektně."],
];
const FOUR = [
  ["Spokojenost, drobné mínus", "Celkově výborné, jen balení mohlo být lepší. Jinak bez výhrad."],
  ["Dobrý produkt", "Funguje jak má, kvalita odpovídá ceně. Jednu hvězdu strhávám za delší dodání."],
  ["Téměř perfektní", "S produktem jsem spokojený, jen návod mohl být podrobnější."],
  ["Solidní koupě", "Za ty peníze velmi dobré. Po měsíci používání žádný problém."],
];
const THREE = [
  ["Průměr", "Očekával jsem trochu víc, ale svůj účel plní. Nic extra, nic hrozného."],
  ["Ujde", "Odpovídá ceně. Kdo čeká zázraky, bude zklamaný, ale funguje."],
];

function pick<T>(arr: T[], rnd: () => number): T { return arr[Math.floor(rnd() * arr.length)]; }

// Deterministický pseudo-random, ať je seed opakovatelný
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const products = (await pool.query(`SELECT id, slug FROM products WHERE tenant_id=$1 ORDER BY id`, [TENANT_ID])).rows as { id: number; slug: string }[];
  await pool.query(`DELETE FROM commerce_reviews WHERE tenant_id=$1`, [TENANT_ID]);

  let total = 0;
  for (const p of products) {
    const rnd = mulberry32(p.id * 7919);
    const count = 3 + Math.floor(rnd() * 6); // 3–8
    const usedNames = new Set<string>();
    for (let i = 0; i < count; i++) {
      const roll = rnd();
      const [rating, texts] = roll < 0.62 ? [5, FIVE] : roll < 0.9 ? [4, FOUR] : [3, THREE];
      const [title, body] = pick(texts as [string, string][], rnd);
      let name = pick(NAMES, rnd);
      while (usedNames.has(name)) name = pick(NAMES, rnd);
      usedNames.add(name);
      const daysAgo = Math.floor(rnd() * 180) + 2;
      await pool.query(
        `INSERT INTO commerce_reviews (tenant_id, product_id, author_name, rating, title, body, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'approved', now() - ($7 || ' days')::interval)`,
        [TENANT_ID, p.id, name, rating, title, body, String(daysAgo)]
      );
      total++;
    }
  }
  console.log(`Recenzí: ${total} pro ${products.length} produktů`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
