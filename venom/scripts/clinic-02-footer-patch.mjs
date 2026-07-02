import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();
const r = await c.query("SELECT content_overrides FROM sections WHERE id=3857");
const co = r.rows[0].content_overrides || {};
const patch = {
  siteName: "AURÉLIE",
  siteTagline: "CLINIC",
  tagline: "Klinika estetické dermatologie & medicínské kosmetiky v centru Prahy. Vstupní konzultace s lékařem zdarma.",
};
await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=3857", [JSON.stringify({ ...co, ...patch })]);
console.log("✓ Footer (3857) patched with siteName + tagline");
await c.end();
