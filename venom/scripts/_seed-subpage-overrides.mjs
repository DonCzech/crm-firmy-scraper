// Zapíše obsah PODSTRÁNEK do sections.content_overrides podle template.json + cs.json.
//
// PROČ: `template_versions.default_sections` obsahuje jen HOMEPAGE. Renderer páruje obsah
// přes (section_type, order_index) a když nenajde shodu, spadne na první sekci téhož typu —
// tedy na homepage. Podstránka s `hero` na pozici 1 proto zobrazí HERO Z HOMEPAGE.
// Historicky to fungovalo jen náhodou: staré tenanty měly titulky podstránek v
// content_overrides. Jakmile se overrides resetnou (remaster), podstránky se rozpadnou.
//
// Tenhle skript je proto povinný krok po `_align-tenant-sections.mjs`.
// Usage: export $(grep -E '^DATABASE_URL=' .env.local|head -1) && node scripts/_seed-subpage-overrides.mjs <key>
import { Client } from "pg";
import fs from "fs";
import path from "path";

const key = process.argv[2];
if (!key) throw new Error("chybí <templateKey>");
const dir = path.join(process.cwd(), "src/templates", key);
const tpl = JSON.parse(fs.readFileSync(path.join(dir, "template.json"), "utf8"));
const cs = JSON.parse(fs.readFileSync(path.join(dir, "content/cs.json"), "utf8"));

const at = (ref) => ref.split(".").reduce((o, k) => (o == null ? undefined : o[k]), cs);

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const { rows: tenants } = await c.query(
  `SELECT t.id, t.slug FROM tenants t JOIN templates tp ON tp.id = t.template_id WHERE tp.key = $1 ORDER BY t.id`,
  [key]
);
console.log(`šablona ${key} → ${tenants.length} tenantů`);

for (const t of tenants) {
  let written = 0, skipped = 0;
  for (const page of tpl.pages) {
    if (page.isHomepage) continue; // homepage má default_sections, nesahat
    const { rows: prows } = await c.query(`SELECT id FROM pages WHERE tenant_id = $1 AND slug = $2`, [t.id, page.slug]);
    if (!prows.length) continue;
    const { rows: secs } = await c.query(
      `SELECT id, section_type, order_index FROM sections WHERE page_id = $1 ORDER BY order_index`,
      [prows[0].id]
    );
    for (let i = 0; i < page.sections.length; i++) {
      const want = page.sections[i];
      const row = secs.find((s) => s.order_index === i && s.section_type === want.type);
      if (!row || !want.contentRef) { skipped++; continue; }
      const content = at(want.contentRef);
      if (!content || typeof content !== "object") { skipped++; continue; }
      // navbar/footer nechat na defaultech (jsou na všech stránkách stejné)
      if (want.type === "navbar" || want.type === "footer") continue;
      await c.query(`UPDATE sections SET content_overrides = $2::jsonb, updated_at = now() WHERE id = $1`,
        [row.id, JSON.stringify(content)]);
      written++;
    }
  }
  console.log(`  ${t.slug}: obsah podstránek zapsán do ${written} sekcí${skipped ? ` (${skipped} přeskočeno)` : ""}`);
}
await c.end();
console.log("hotovo — touch src/lib/section-resolver.ts");
