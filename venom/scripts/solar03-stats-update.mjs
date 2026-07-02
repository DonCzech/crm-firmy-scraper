import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const stats = {
  eyebrow: "SolarPro v číslech",
  title: "Dvě dekády tichého závazku",
  subtitle: "Nechte mluvit fakta. Naše čísla nejsou marketing — jsou to reálné projekty, spokojení majitelé a technologie vyráběná v Jihočeském kraji.",
  stats: [
    { icon: "trophy",  value: "20", label: "let na českém trhu", description: "Od roku 2006 dodáváme vlastní tepelná čerpadla a fotovoltaiku pro rodinné i komerční projekty." },
    { icon: "house",   value: "15 000+", label: "hotových instalací", description: "Rodiny, firmy i SVJ, kteří nám svěřili své vytápění. Každá zakázka je pro nás referencí." },
    { icon: "factory", value: "100 %", label: "česká výroba", description: "Vývoj i výroba klíčových komponent probíhá v Jihočeském kraji. Kupujete českou preciznost." },
    { icon: "check",   value: "99 %", label: "úspěšnost dotací", description: "Zpracováváme žádosti NZÚ a Nová zelená úsporám. Bez dohodnutí nezaplatíte nic." }
  ]
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12279 RETURNING id",
  [JSON.stringify(stats)]
);
console.log("Updated stats section:", r.rows);
await c.end();
