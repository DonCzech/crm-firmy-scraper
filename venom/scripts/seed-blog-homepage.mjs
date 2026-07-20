#!/usr/bin/env node
/**
 * Adds a homepage "blog-preview" section (token-driven default variant) to
 * tenants that don't already have a blog section on their homepage. The default
 * variant inherits each template's colors/fonts/radius and fetches the tenant's
 * real published posts, so it looks native with zero per-template design work.
 *
 * Templates that already ship a bespoke blog section (blog-preview/<tpl>-blog,
 * or an about/<tpl>-blog block) are left untouched.
 *
 * Usage:
 *   node scripts/seed-blog-homepage.mjs <slug> …
 *   node scripts/seed-blog-homepage.mjs --all [--dry]
 *
 * Idempotent: skips a tenant whose homepage already has any blog-ish section.
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB_URL =
  process.env.DATABASE_URL ||
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .match(/^DATABASE_URL=(.*)$/m)[1].replace(/^["']|["']$/g, '');

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const DRY = args.includes('--dry');
const slugs = args.filter((a) => !a.startsWith('--'));
if (!ALL && slugs.length === 0) {
  console.error('Usage: seed-blog-homepage.mjs <slug> … | --all [--dry]');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DB_URL });
const q = async (s, p) => (await pool.query(s, p)).rows;

const DEFAULT_CONTENT = {
  title: 'Z našeho blogu',
  subtitle: 'Články, novinky a tipy z našeho oboru.',
  count: 3,
  buttonText: 'Všechny články →',
};

const targets = ALL
  ? await q(`SELECT id, slug FROM tenants
             WHERE status <> 'suspended' AND slug LIKE '%-v2'
               AND 'blog' = ANY(active_modules)
             ORDER BY slug`)
  : await q(`SELECT id, slug FROM tenants WHERE slug = ANY($1)`, [slugs]);

if (!targets.length) { console.error('No matching tenants.'); process.exit(1); }
console.log(`${DRY ? '[dry] ' : ''}Homepage blog section for ${targets.length} tenant(s)\n`);

let added = 0, skipped = 0;
for (const t of targets) {
  const home = (await q("SELECT id FROM pages WHERE tenant_id=$1 AND slug='home'", [t.id]))[0];
  if (!home) { console.log(`  ?  ${t.slug.padEnd(26)} no home page`); continue; }

  // A blog section already present? blog-preview of any variant, or an
  // about/cta/whatever whose variant name contains "blog".
  const existing = await q(
    `SELECT 1 FROM sections
      WHERE tenant_id=$1 AND page_id=$2
        AND (section_type='blog-preview' OR section_variant ILIKE '%blog%')
      LIMIT 1`,
    [t.id, home.id]
  );
  if (existing.length) {
    skipped++;
    console.log(`  ·  ${t.slug.padEnd(26)} already has a blog section`);
    continue;
  }

  const footer = (await q(
    `SELECT id, order_index FROM sections
      WHERE tenant_id=$1 AND page_id=$2 AND section_type='footer'
      ORDER BY order_index DESC LIMIT 1`,
    [t.id, home.id]
  ))[0];
  const insertAt = footer ? footer.order_index : (await q(
    `SELECT COALESCE(MAX(order_index),0)+1 AS n FROM sections WHERE tenant_id=$1 AND page_id=$2`,
    [t.id, home.id]
  ))[0].n;

  if (DRY) { added++; console.log(`  +  ${t.slug.padEnd(26)} would insert blog-preview at ${insertAt}`); continue; }

  // Open a slot right before the footer.
  if (footer) {
    await q(`UPDATE sections SET order_index = order_index + 1
              WHERE tenant_id=$1 AND page_id=$2 AND order_index >= $3`,
      [t.id, home.id, insertAt]);
  }

  await q(
    `INSERT INTO sections
       (tenant_id, page_id, section_type, section_variant, order_index,
        is_visible, settings, content_source, created_at, updated_at)
     VALUES ($1,$2,'blog-preview','default',$3,true,$4,'v2',NOW(),NOW())`,
    [t.id, home.id, insertAt, JSON.stringify({ content: DEFAULT_CONTENT })]
  );

  added++;
  console.log(`  ✓  ${t.slug.padEnd(26)} inserted blog-preview at ${insertAt}`);
}

await pool.end();
console.log(`\nDone. added=${added} skipped=${skipped}`);
