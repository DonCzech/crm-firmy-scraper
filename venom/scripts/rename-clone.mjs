/**
 * rename-clone.mjs
 * Přejmenuje klon + tenant + template v DB a na disku.
 * Žádné původní identifikátory nesmí zůstat v kódu, DB ani cestách.
 *
 * Použití:
 *   node scripts/rename-clone.mjs <starý-slug> <nový-slug>
 *   node scripts/rename-clone.mjs barber-urban fade-room
 *   (tenant slug: <starý>-demo → <nový>-demo)
 */

import { renameSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const [,, oldName, newName] = process.argv;
if (!oldName || !newName) {
  console.error('Usage: node rename-clone.mjs <old-name> <new-name>');
  process.exit(1);
}

const oldTenantSlug = `${oldName}-demo`;
const newTenantSlug = `${newName}-demo`;
const oldCloneDir = join(ROOT, 'public', 'clones', oldName);
const newCloneDir = join(ROOT, 'public', 'clones', newName);
const OLD_LOCAL = `/clones/${oldName}`;
const NEW_LOCAL = `/clones/${newName}`;
const OLD_DEMO = `/demo/${oldTenantSlug}`;
const NEW_DEMO = `/demo/${newTenantSlug}`;

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function copyDirSync(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function findFiles(dir, ext) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...findFiles(full, ext));
    else if (!ext || entry.endsWith(ext)) results.push(full);
  }
  return results;
}

async function main() {
  console.log(`\n🔄 Přejmenování: "${oldName}" → "${newName}"`);
  console.log(`   tenant: ${oldTenantSlug} → ${newTenantSlug}`);
  console.log(`   cesta: ${OLD_LOCAL} → ${NEW_LOCAL}\n`);

  // ── 1. Rename public/clones/[old] → public/clones/[new] ──────────────────
  if (!existsSync(oldCloneDir)) {
    console.error(`❌ Adresář ${oldCloneDir} neexistuje`);
    process.exit(1);
  }
  if (existsSync(newCloneDir)) {
    console.log(`⚠️  ${newCloneDir} již existuje — přepisuji`);
  }
  copyDirSync(oldCloneDir, newCloneDir);
  console.log(`✅ Zkopírován adresář → ${newCloneDir}`);

  // ── 2. Rewrite all CSS files in new clone dir ─────────────────────────────
  const cssFiles = findFiles(newCloneDir, '.css');
  for (const f of cssFiles) {
    let content = readFileSync(f, 'utf-8');
    content = content.split(OLD_LOCAL).join(NEW_LOCAL);
    writeFileSync(f, content);
  }
  console.log(`✅ CSS soubory přepsány (${cssFiles.length} souborů)`);

  // Also rewrite .bak if it exists
  const bakFile = join(newCloneDir, 'assets/templates/barbershop/css/styles.min.css.bak');
  if (existsSync(bakFile)) {
    let bak = readFileSync(bakFile, 'utf-8');
    bak = bak.split(OLD_LOCAL).join(NEW_LOCAL);
    writeFileSync(bakFile, bak);
  }

  // ── 3. Update DB ──────────────────────────────────────────────────────────
  const client = await pool.connect();
  try {
    // Tenant slug
    const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [oldTenantSlug]);
    const tenantId = t.rows[0]?.id;
    if (!tenantId) throw new Error(`Tenant '${oldTenantSlug}' not found in DB`);

    await client.query("UPDATE tenants SET slug = $1 WHERE id = $2", [newTenantSlug, tenantId]);
    console.log(`✅ Tenant slug: ${oldTenantSlug} → ${newTenantSlug}`);

    // Template key (barber-barbershopurban → fade-room, etc.)
    const tmplKey = await client.query("SELECT id, key FROM templates WHERE key LIKE $1", [`${oldName}%`]);
    for (const row of tmplKey.rows) {
      if (row.key === 'barber' || row.key === 'wellness' || row.key === 'lawyer' || row.key === 'astera') continue;
      const newKey = row.key.replace(oldName, newName);
      await client.query("UPDATE templates SET key = $1 WHERE id = $2", [newKey, row.id]);
      console.log(`✅ Template key: ${row.key} → ${newKey}`);
    }

    // HTML in sections: replace /clones/old → /clones/new and /demo/old-demo → /demo/new-demo
    const sections = await client.query(
      "SELECT s.id, s.settings FROM sections s WHERE s.tenant_id = $1 AND s.section_type = 'full-page-clone'",
      [tenantId]
    );
    let updatedCount = 0;
    for (const row of sections.rows) {
      const settings = row.settings;
      let html = settings.html ?? '';
      let cssUrls = settings.cssUrls ?? [];

      // Replace all old references
      html = html.split(OLD_LOCAL).join(NEW_LOCAL);
      html = html.split(OLD_DEMO).join(NEW_DEMO);
      html = html.split(oldName).join(newName); // catch any remaining (e.g. in data attrs)
      html = html.split(oldTenantSlug).join(newTenantSlug);

      cssUrls = cssUrls.map(u => u.split(OLD_LOCAL).join(NEW_LOCAL));

      const newSettings = { ...settings, html, cssUrls };
      await client.query("UPDATE sections SET settings = $1 WHERE id = $2", [JSON.stringify(newSettings), row.id]);
      updatedCount++;
    }
    console.log(`✅ HTML v ${updatedCount} sekcích přepsáno`);

  } finally {
    client.release();
    await pool.end();
  }

  // ── 4. Rename script files ────────────────────────────────────────────────
  const scriptRenames = [
    [`mirror-${oldName}-assets.mjs`, `mirror-${newName}-assets.mjs`],
    [`mirror-${oldName}-subpages.mjs`, `mirror-${newName}-subpages.mjs`],
    [`seed-${oldName}-demo.mjs`, `seed-${newName}-demo.mjs`],
    [`seed-barber-demo.mjs`, `seed-${newName}-demo.mjs`], // fallback old name
  ];
  const scriptsDir = join(ROOT, 'scripts');
  for (const [oldFile, newFile] of scriptRenames) {
    const oldPath = join(scriptsDir, oldFile);
    const newPath = join(scriptsDir, newFile);
    if (existsSync(oldPath) && !existsSync(newPath)) {
      let content = readFileSync(oldPath, 'utf-8');
      content = content.split(oldName).join(newName).split(oldTenantSlug).join(newTenantSlug);
      writeFileSync(newPath, content);
      console.log(`✅ Script: ${oldFile} → ${newFile}`);
    }
  }

  // ── 5. Rename obfuscation map ─────────────────────────────────────────────
  const mapDir = join(ROOT, 'template-lab', 'obfuscation-maps');
  const oldMap = join(mapDir, `${oldName}.json`);
  const newMap = join(mapDir, `${newName}.json`);
  if (existsSync(oldMap)) {
    let content = readFileSync(oldMap, 'utf-8');
    content = content.split(oldName).join(newName).split(oldTenantSlug).join(newTenantSlug);
    writeFileSync(newMap, content);
    console.log(`✅ Obfuscation map: ${oldName}.json → ${newName}.json`);
  }

  // ── 6. Summary ────────────────────────────────────────────────────────────
  console.log(`\n✅ Přejmenování dokončeno!`);
  console.log(`   Veřejná URL: http://localhost:3015/demo/${newTenantSlug}`);
  console.log(`   Admin URL:   http://localhost:3015/demo/${newTenantSlug}/admin`);
  console.log(`\n⚠️  Staré skripty (mirror-${oldName}-*.mjs, seed-barber-demo.mjs) ZACHOVÁNY — smaž ručně pokud nepotřebuješ.`);
  console.log(`⚠️  Starý adresář public/clones/${oldName}/ ZACHOVÁN — smaž ručně po ověření.`);
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
