import fs from "node:fs";
import { Pool } from "pg";
import * as cheerio from "cheerio";

const env = fs.readFileSync(".env.local", "utf8");
const databaseUrl = env
  .split(/\r?\n/)
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length);

if (!databaseUrl) {
  throw new Error("DATABASE_URL missing in .env.local");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const FIX_STYLE = `
<style data-peak-cut-render-fix="2026-05-20">
  @media (max-width: 767px) {
    .x0njg {
      background: #fff;
      color: var(--color-black);
      box-shadow: 0 1px 0 rgba(0,0,0,.08);
    }
    .x0njg .x25m3 svg,
    body.x20t6 .x0njg .x25m3 svg {
      fill: var(--color-accent);
    }
  }
  .xymbs .xcpeg {
    min-height: 655px;
  }
  .xymbs .xcpeg img {
    background: #f5f5f5;
  }
</style>
`.trim();

function fixHtml(html) {
  const $ = cheerio.load(html, { decodeEntities: false });

  $('[data-peak-cut-render-fix]').remove();
  $.root().prepend(`${FIX_STYLE}\n`);

  $("img").each((_, img) => {
    const $img = $(img);
    const src = $img.attr("src") ?? "";
    if (!src.includes("/clones/peak-cut/")) return;

    $img.attr("loading", "eager");
    $img.attr("decoding", "sync");

    if (src.includes("Frame-1.jpg") || src.includes("Mobile-1.jpg")) {
      $img.attr("fetchpriority", "high");
    } else {
      $img.attr("fetchpriority", "low");
    }
  });

  return $.html();
}

async function main() {
  const { rows } = await pool.query(
    `SELECT s.id, s.settings
     FROM tenants t
     JOIN pages p ON p.tenant_id = t.id AND p.slug = 'home'
     JOIN sections s ON s.page_id = p.id AND s.tenant_id = t.id
     WHERE t.slug = 'peak-cut-demo' AND s.section_type = 'full-page-clone'
     LIMIT 1`
  );

  if (!rows[0]) {
    throw new Error("peak-cut-demo full-page-clone section not found");
  }

  const section = rows[0];
  const settings = section.settings ?? {};
  const html = settings.html;
  if (typeof html !== "string") {
    throw new Error("Section settings.html is missing");
  }

  const nextHtml = fixHtml(html);
  if (nextHtml === html) {
    console.log("No changes needed.");
    return;
  }

  const nextSettings = { ...settings, html: nextHtml };

  await pool.query(
    `UPDATE sections
     SET settings = $1::jsonb, updated_at = now()
     WHERE id = $2`,
    [JSON.stringify(nextSettings), section.id]
  );

  console.log(`Updated peak-cut-demo section ${section.id}`);
  console.log(`HTML length: ${html.length} -> ${nextHtml.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
