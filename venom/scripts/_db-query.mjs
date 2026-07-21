// Usage: node scripts/_db-query.mjs "SELECT ..." [json]
import { Pool } from "pg";
import { readFileSync } from "node:fs";
const url = readFileSync(new URL("../.env.local", import.meta.url), "utf8").match(/^DATABASE_URL=(.+)$/m)[1].trim();
const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const [sql, mode] = process.argv.slice(2);
try {
  const r = await pool.query(sql);
  if (mode === "json") console.log(JSON.stringify(r.rows, null, 2));
  else console.table(r.rows);
} catch (e) {
  console.error("ERR:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
