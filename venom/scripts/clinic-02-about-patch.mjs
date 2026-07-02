import pg from "pg";
import { readFileSync } from "fs";

const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();

const r = await c.query("SELECT content_overrides FROM sections WHERE id=3851");
const co = r.rows[0].content_overrides || {};

const patch = {
  statValue: "18",
  statLabel: "let zkušeností",
  statSub: "MUDr. Marie Hladíková · vedoucí lékařka kliniky",
};

await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=3851", [
  JSON.stringify({ ...co, ...patch }),
]);
console.log("✓ About (3851) patched with floating stat card content");

await c.end();
