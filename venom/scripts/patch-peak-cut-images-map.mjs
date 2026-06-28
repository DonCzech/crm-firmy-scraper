/**
 * Patch 2: Fix 404 images + broken Google Maps in peak-cut-demo
 *
 * Problems:
 *  - contact_photo1/2/3.jpg never existed (404 even on live site)
 *  - Google Maps needs API key → shows gray / error without it
 *
 * Fixes:
 *  - Replace contact_photo1→contacts_image1.jpg, 2→contacts_image2.jpg, 3→about_image.jpg
 *  - Replace <div id="map"> with OpenStreetMap iframe (no API key needed)
 *  - Strip the initMap() JS block (avoids "google is not defined" console errors)
 */

import fs from "node:fs";
import { Pool } from "pg";

const env = fs.readFileSync(".env.local", "utf8");
const databaseUrl = env
  .split(/\r?\n/)
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length);

if (!databaseUrl) throw new Error("DATABASE_URL missing in .env.local");

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

// OpenStreetMap embed centred on Prague (demo — no real address)
const OSM_IFRAME = `<iframe
  src="https://www.openstreetmap.org/export/embed.html?bbox=14.39%2C50.07%2C14.48%2C50.10&amp;layer=mapnik&amp;marker=50.0837%2C14.4333"
  style="width:100%;height:100%;border:0;"
  loading="lazy"
  title="Mapa — Peak Cut demo"
  allowfullscreen>
</iframe>`;

function patch(html) {
  // 1. contact_photo1/2/3 → existing images
  html = html.replace(
    /\/clones\/peak-cut\/wp-content\/uploads\/2023\/07\/contact_photo1\.jpg/g,
    "/clones/peak-cut/wp-content/uploads/2023/07/contacts_image1.jpg"
  );
  html = html.replace(
    /\/clones\/peak-cut\/wp-content\/uploads\/2023\/07\/contact_photo2\.jpg/g,
    "/clones/peak-cut/wp-content/uploads/2023/07/contacts_image2.jpg"
  );
  html = html.replace(
    /\/clones\/peak-cut\/wp-content\/uploads\/2023\/07\/contact_photo3\.jpg/g,
    "/clones/peak-cut/wp-content/uploads/2023/07/about_image.jpg"
  );

  // 2. Replace empty #map div with OpenStreetMap iframe
  html = html.replace(
    /<div class="map__content js-map" id="map"><\/div>/,
    `<div class="map__content js-map" id="map" style="overflow:hidden;">${OSM_IFRAME}</div>`
  );

  // 3. Strip the google.maps initMap block so no JS errors pollute the console
  //    The block starts with `function initMap() {` and ends with `window.initMap = initMap;`
  html = html.replace(
    /function initMap\(\)\s*\{[\s\S]*?window\.initMap\s*=\s*initMap;\s*/,
    "// Google Maps removed — using OpenStreetMap embed\n    "
  );

  return html;
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

  if (!rows[0]) throw new Error("peak-cut-demo full-page-clone section not found");

  const section = rows[0];
  const settings = section.settings ?? {};
  const html = settings.html;
  if (typeof html !== "string") throw new Error("settings.html missing");

  const patched = patch(html);

  if (patched === html) {
    console.log("Nothing to patch (already applied or patterns not found).");
    return;
  }

  const diff = {
    contact_photo1: (html.match(/contact_photo1/g) || []).length,
    contact_photo2: (html.match(/contact_photo2/g) || []).length,
    contact_photo3: (html.match(/contact_photo3/g) || []).length,
    mapDiv: html.includes('<div class="map__content js-map" id="map"></div>') ? 1 : 0,
    initMap: html.includes("function initMap()") ? 1 : 0,
  };
  console.log("Patches applied:", diff);

  await pool.query(
    `UPDATE sections SET settings = $1::jsonb, updated_at = now() WHERE id = $2`,
    [JSON.stringify({ ...settings, html: patched }), section.id]
  );

  console.log(`Updated section ${section.id}. HTML: ${html.length} → ${patched.length} chars`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => pool.end());
