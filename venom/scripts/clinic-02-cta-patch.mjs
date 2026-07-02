import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();
const r = await c.query("SELECT content_overrides FROM sections WHERE id=3855");
const co = r.rows[0].content_overrides || {};
const patch = {
  gdprNote: "Souhlasím se zpracováním osobních údajů. Odhlásit se můžete kdykoli jedním kliknutím.",
};
await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=3855", [JSON.stringify({ ...co, ...patch })]);
console.log("✓ CTA (3855) GDPR note added");
await c.end();
