import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const testimonials = {
  eyebrow: "Zákazníci o nás",
  title: "Ověřené hlasy od skutečných majitelů",
  subtitle: "Přes 15 000 realizací a stovky hodnocení na Google. Přečtěte si, jak SolarPro pomohl konkrétním rodinám a firmám snížit účty za energie.",
  ratingLabel: "Průměrné hodnocení",
  ratingValue: "4,9 / 5,0",
  ratingMeta: "1 240 recenzí na Google",
  reviews: [
    {
      name: "Petra Horáčková",
      role: "majitelka RD",
      city: "České Budějovice",
      text: "Celý proces od první schůzky přes projektovou dokumentaci až po spuštění systému proběhl naprosto hladce. Tým SolarPro byl vždy dostupný, odpovídal rychle a odborně. Tepelné čerpadlo funguje bezchybně a monitoring přes mobilní aplikaci je pohodlný. Vřele doporučuji všem, kdo uvažují o přechodu na obnovitelné zdroje."
    },
    {
      name: "Roman Blažek",
      role: "investor komerční nemovitosti",
      city: "Brno",
      text: "Měl jsem obavy z administrativy kolem dotace, ale SolarPro vyřídilo vše za mě. Bez starostí, v termínu a za cenu, která odpovídala nabídce. Kvalitní práce, čisté pracovní prostředí po montáži a skvělý servisní přístup."
    },
    {
      name: "Jana Kubešová",
      role: "majitelka rodinného domu",
      city: "Plzeň",
      text: "Po šesti měsících provozu kombinace tepelného čerpadla a fotovoltaiky šetřím na energiích přes 60 %. Instalace proběhla za dva dny, montéři byli precizní a uklidili po sobě. SolarPro splnilo vše, co slíbilo. Lepší investici jsem za poslední roky neudělala."
    }
  ]
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12278 RETURNING id",
  [JSON.stringify(testimonials)]
);
console.log("Updated testimonials section:", r.rows);
await c.end();
