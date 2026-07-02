import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const services = {
  eyebrow: "Naše řešení",
  title: "Kompletní energetika pro váš dům",
  subtitle: "Od návrhu přes montáž až po servis — vše z jedné ruky. Vybírejte podle svých priorit: rychlá úspora, energetická nezávislost, nebo obojí zároveň.",
  cards: [
    {
      tag: "Vytápění",
      title: "Tepelná čerpadla vzduch-voda",
      subtitle: "pro rodinné i bytové domy",
      image: "/templates/solar-03/services-1.webp",
      bullets: [
        "Dotace NZÚ zajistíme",
        "COP až 5,1 při 7 °C",
        "Tiché venkovní jednotky (35 dB)"
      ],
      ctaText: "Prostudovat řešení",
      ctaHref: "/sortiment"
    },
    {
      tag: "Fotovoltaika",
      title: "Fotovoltaické elektrárny",
      subtitle: "s bateriovým úložištěm",
      image: "/templates/solar-03/services-2.webp",
      bullets: [
        "Panely s výkonem 550 Wp",
        "LiFePO4 baterie 10–20 kWh",
        "Vzdálený monitoring zdarma"
      ],
      ctaText: "Prostudovat řešení",
      ctaHref: "/sortiment"
    },
    {
      tag: "Hybrid",
      title: "Hybridní energetický systém",
      subtitle: "čerpadlo + FVE + baterie",
      image: "/templates/solar-03/services-3.webp",
      bullets: [
        "Soběstačnost až 80 %",
        "Chytré řízení spotřeby",
        "Jednoduchá mobilní aplikace"
      ],
      ctaText: "Prostudovat řešení",
      ctaHref: "/sortiment"
    }
  ]
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12275 RETURNING id",
  [JSON.stringify(services)]
);
console.log("Updated services section:", r.rows);
await c.end();
