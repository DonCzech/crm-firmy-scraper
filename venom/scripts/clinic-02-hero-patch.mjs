import pg from "pg";
import { readFileSync } from "fs";

const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();

const r = await c.query("SELECT content_overrides FROM sections WHERE id=3850");
const co = r.rows[0].content_overrides || {};

const patch = {
  kicker: "Klinika doporučená dermatology · 18. rok na trhu",
  title: "Přirozená krása v rukou špičkových lékařů",
  tagline:
    "Zvýrazněte svůj osobitý charakter a každý den se probouzejte s pocitem, že vypadáte přesně tak, jak se cítíte. Nepřetváříme — umně podtrhujeme.",
  ctaText: "Online rezervace",
  ctaHref: "/kontakt",
  ctaSecondaryText: "Konzultace zdarma",
  ctaSecondaryHref: "/kontakt",
  trust: [
    "5,0 ★ Google · 482 recenzí",
    "18 000+ spokojených klientek",
    "Originální Allergan, Galderma, Merz",
  ],
  bgImage: "/images/clinic-02/hero.webp",
};

const merged = { ...co, ...patch };
await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=3850", [JSON.stringify(merged)]);
console.log("✓ Hero (3850) patched with kicker + secondary CTA + trust strip");

await c.end();
