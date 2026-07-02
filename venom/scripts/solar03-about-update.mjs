import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const about = {
  eyebrow: "Proč SolarPro",
  title: "Deset důvodů, které mluví za nás",
  subtitle: "Nejsme montážní firma bez odpovědnosti. Jsme český výrobce s dvacetiletou historií, vlastní servisní sítí a jasnou odpovědností za výsledek — od návrhu až po poslední den záruky.",
  items: [
    { title: "Česká výroba v Jihočeském kraji", description: "Vlastní výrobní závod s přísnou kontrolou kvality každého kusu." },
    { title: "Montáž do šesti týdnů od podpisu", description: "Držíme klíčové komponenty skladem. Domluvíme termín a přijedeme přesně kdy slíbíme." },
    { title: "Dotaci NZÚ vyřídíme za vás", description: "Specializujeme se na programy NZÚ, OP TAK a Nová zelená úsporám Light. Úspěšnost 99 %." },
    { title: "Prémiové komponenty s evropskou certifikací", description: "Používáme výhradně komponenty s certifikací CE, TÜV a ověřenou životností nad 25 let." },
    { title: "Prodloužená záruka až 10 let", description: "Naše záruka nekončí předáním. Servisujeme i po skončení záruční doby s garantovanou cenou." },
    { title: "Nejvyšší COP ve své kategorii", description: "Vlastní vývoj řídicí elektroniky zajišťuje špičkovou účinnost i za mrazu −25 °C." },
    { title: "Vlastní servisní síť po celé ČR", description: "Vlastní technici v každém kraji. Reakční doba do 24 hodin ve všední den, o víkendu do 48 hodin." },
    { title: "Zkušenosti od roku 2006", description: "Dvacet let na trhu, přes 15 000 spokojených zákazníků — to je naše nejsilnější reference." },
    { title: "Individuální projekt každé zakázce", description: "Žádný typový projekt. Každé řešení navrhujeme podle vašeho objektu, spotřeby a rozpočtu." },
    { title: "Ekologický provoz bez emisí", description: "Nulové přímé emise CO₂. Pomáháme snižovat vaši uhlíkovou stopu i účty za energie." }
  ]
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12276 RETURNING id",
  [JSON.stringify(about)]
);
console.log("Updated about section:", r.rows);
await c.end();
