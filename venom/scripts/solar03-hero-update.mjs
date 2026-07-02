import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const hero = {
  eyebrow: "Tepelná čerpadla · Fotovoltaika · Rekuperace",
  title: "Energetická nezávislost pro váš dům i firmu",
  titleAccent: "",
  subtitle: "Kompletní energetická řešení od českého výrobce. Vlastní servisní síť po celé ČR, vyřízení dotace NZÚ i Nová Zelená úsporám a garantovaná návratnost do sedmi let.",
  items: [
    "Pro rodinné i komerční objekty",
    "Dotaci NZÚ vyřídíme za vás",
    "Vlastní servisní síť po celé ČR"
  ],
  ctaText: "Bezplatná konzultace",
  ctaHref: "/kontakt",
  ctaText2: "Prohlédnout realizace",
  ctaHref2: "/realizace",
  image: "/templates/solar-03/hero.webp",
  badge1: "20 let na trhu",
  badge2: "4,9 ★ Google (1 240 recenzí)",
  badge3: "1 200+ instalací ročně",
  specLabel: "Úspora energií",
  specValue: "až 78 %",
  specNote: "měřeno v provozu 2025"
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12274 RETURNING id",
  [JSON.stringify(hero)]
);
console.log("Updated hero section:", r.rows);
await c.end();
