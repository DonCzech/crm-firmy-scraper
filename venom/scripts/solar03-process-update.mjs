import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const process = {
  eyebrow: "Jak to u nás funguje",
  title: "Postaráme se o vás od konzultace až po dohled nad provozem",
  subtitle: "Čtyři kroky, jasné termíny, jeden partner. Bez subdodavatelů, bez přehazování zodpovědnosti — dodáváme přesně to, co si odsouhlasíme na první schůzce.",
  image: "/templates/solar-03/process.webp",
  specValue: "48 h",
  specLabel: "reakční doba na první poptávku",
  steps: [
    {
      title: "Bezplatná konzultace a návrh systému do 48 hodin",
      description: "Zavolejte nebo vyplňte poptávkový formulář. Energetický poradce vás kontaktuje, prohlédne váš objekt a připraví nezávazný návrh systému na míru."
    },
    {
      title: "Kompletní dotační servis bez starostí",
      description: "Postaráme se o veškerou byrokracii NZÚ i Nová Zelená úsporám. Připravíme žádost, doložíme dokumentaci a dotaci dotáhneme do úspěšné výplaty."
    },
    {
      title: "Odborná montáž a zprovoznění na klíč",
      description: "Certifikovaní technici provedou instalaci s maximální pečlivostí. Po montáži systém nastavíme, otestujeme a zaškolíme vás k obsluze."
    },
    {
      title: "Dlouhodobá záruční i pozáruční péče",
      description: "Poskytujeme prodlouženou záruku až 10 let a doživotní technickou podporu. Vzdálený monitoring odhalí případné problémy dřív, než je zaznamenáte."
    }
  ]
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12277 RETURNING id",
  [JSON.stringify(process)]
);
console.log("Updated process section:", r.rows);
await c.end();
