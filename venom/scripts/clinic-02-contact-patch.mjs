import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();
const r = await c.query("SELECT content_overrides FROM sections WHERE id=3856");
const co = r.rows[0].content_overrides || {};

// Split address into address + city for proper 2-line render
const patch = {
  address: "Vinohradská 2828/151",
  city: "130 00 Praha 3 — Vinohrady",
  ctaCardTitle: "Rezervujte si návštěvu",
  ctaCardBody: "Vyberte si termín, který vám vyhovuje. Naše recepce je vám k dispozici po celý pracovní den a odpoví na všechny vaše otázky.",
  ctaCardBtn: "Online rezervace",
};

await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=3856", [JSON.stringify({ ...co, ...patch })]);
console.log("✓ Contact (3856) patched: address split + CTA card content");
await c.end();
