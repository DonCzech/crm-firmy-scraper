#!/usr/bin/env node
/**
 * Installs the universal demo blog posts (src/lib/blog/demo-posts.ts) into
 * tenants and switches the `blog` module on for them.
 *
 * Usage:
 *   node scripts/seed-blog-demo.mjs <slug> [<slug> …]   seed specific tenants
 *   node scripts/seed-blog-demo.mjs --all               every template demo tenant
 *   node scripts/seed-blog-demo.mjs --all --dry         show what would happen
 *
 * Re-running is safe: posts are upserted on (tenant_id, slug), so existing
 * demo posts are refreshed rather than duplicated. Posts a user wrote
 * themselves are never touched — only the five demo slugs are managed here.
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB_URL =
  process.env.DATABASE_URL ||
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .match(/^DATABASE_URL=(.*)$/m)[1]
    .replace(/^["']|["']$/g, '');

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const DRY = args.includes('--dry');
const slugs = args.filter((a) => !a.startsWith('--'));

if (!ALL && slugs.length === 0) {
  console.error('Usage: seed-blog-demo.mjs <slug> … | --all [--dry]');
  process.exit(1);
}

// The posts live in TypeScript so the app can import them too. Transpile that
// single file with esbuild at runtime rather than keeping a second copy here —
// one source of truth beats a mirror that silently drifts.
const { build } = await import('esbuild');
const bundled = await build({
  entryPoints: [path.join(ROOT, 'src/lib/blog/demo-posts.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  external: ['./content'],
});
const { DEMO_POSTS, DEMO_AUTHOR, personalizeDemoPost } = await import(
  'data:text/javascript;base64,' +
    Buffer.from(bundled.outputFiles[0].text).toString('base64')
);

const pool = new pg.Pool({ connectionString: DB_URL });
const q = async (sql, params) => (await pool.query(sql, params)).rows;

// Mirrors isPlaceholderName() in src/lib/blog/theme.ts — some template scaffolds
// leave `brand.name` holding a literal placeholder, which would otherwise be
// written straight into article copy ("Jak u Název podniku pracujeme…").
const PLACEHOLDER_NAMES = new Set([
  'název podniku', 'nazev podniku', 'vaše firma', 'váš podnik', 'název firmy',
]);
const realName = (v) => {
  const s = (v == null ? '' : String(v)).trim();
  return s && !PLACEHOLDER_NAMES.has(s.toLowerCase()) ? s : null;
};

function wordCount(blocks) {
  return blocks
    .map((b) => [b.text ?? '', ...(b.items ?? []), b.caption ?? ''].join(' '))
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}
const readingTime = (blocks) => Math.max(1, Math.round(wordCount(blocks) / 200));

const targets = ALL
  ? await q(
      `SELECT id, slug, business_name FROM tenants
       WHERE status <> 'suspended' AND slug LIKE '%-v2'
       ORDER BY slug`
    )
  : await q(
      `SELECT id, slug, business_name FROM tenants WHERE slug = ANY($1)`,
      [slugs]
    );

if (targets.length === 0) {
  console.error('No matching tenants.');
  process.exit(1);
}

console.log(`${DRY ? '[dry] ' : ''}Seeding blog demo into ${targets.length} tenant(s)\n`);

for (const t of targets) {
  // Prefer the brand.name data slot — business_name is often empty on demos.
  const slot = await q(
    `SELECT value FROM tenant_data_slots WHERE tenant_id = $1 AND slot_key = 'brand.name' LIMIT 1`,
    [t.id]
  );
  const raw = slot[0]?.value;
  const slotName = realName(typeof raw === 'string' ? raw : raw?.value ?? raw);

  // Navbar siteName wins over the brand.name slot — it's the name shown at the
  // top of the site, so article copy matches what the visitor reads. Mirrors the
  // precedence in getBlogTheme(). Always looked up, not just as a fallback.
  const nav = await q(
    `SELECT s.settings->'content'->>'siteName' AS name
       FROM sections s
       JOIN pages p ON p.id = s.page_id
      WHERE s.tenant_id = $1 AND p.slug = 'home' AND s.section_type = 'navbar'
      LIMIT 1`,
    [t.id]
  );
  const navName = realName(nav[0]?.name);

  // v2 sections keep an empty settings.content and resolve their copy from the
  // template at render time, so the DB lookup above finds nothing. Fall back to
  // the template's own content file.
  let tplName = null;
  if (!navName && !slotName && !t.business_name) {
    const tpl = (await q(
      `SELECT key FROM templates WHERE id = (SELECT template_id FROM tenants WHERE id = $1)`,
      [t.id]
    ))[0];
    if (tpl?.key) {
      const file = path.join(ROOT, 'src/templates', tpl.key, 'content/cs.json');
      if (fs.existsSync(file)) {
        try {
          const c = JSON.parse(fs.readFileSync(file, 'utf8'));
          tplName = realName(c?.navbar?.siteName) || realName(c?.footer?.siteName);
        } catch { /* malformed template content — fall through to slug */ }
      }
    }
  }

  const brand = navName || slotName || realName(t.business_name) || tplName || t.slug;

  if (DRY) {
    console.log(`  ${t.slug.padEnd(28)} → "${brand}"`);
    continue;
  }

  for (const base of DEMO_POSTS) {
    const p = personalizeDemoPost(base, String(brand));
    const publishedAt = new Date(Date.now() - p.daysAgo * 86400000);
    await q(
      `INSERT INTO blog_posts
         (tenant_id, slug, title, excerpt, content, featured_image, author,
          category, tags, status, published_at, seo_title, seo_description,
          noindex, reading_time_min, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10,$11,$12,false,$13,NOW(),NOW())
       ON CONFLICT (tenant_id, slug) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         content = EXCLUDED.content,
         featured_image = EXCLUDED.featured_image,
         author = EXCLUDED.author,
         category = EXCLUDED.category,
         tags = EXCLUDED.tags,
         seo_title = EXCLUDED.seo_title,
         seo_description = EXCLUDED.seo_description,
         reading_time_min = EXCLUDED.reading_time_min,
         updated_at = NOW()`,
      [
        t.id, p.slug, p.title, p.excerpt, JSON.stringify(p.content),
        p.featured_image, DEMO_AUTHOR.replaceAll('{{brand}}', String(brand)),
        p.category, p.tags, publishedAt, p.seo_title, p.seo_description,
        readingTime(p.content),
      ]
    );
  }

  await q(
    `UPDATE tenants
        SET active_modules = (
          SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(active_modules, '{}') || ARRAY['blog']))
        )
      WHERE id = $1`,
    [t.id]
  );

  console.log(`  ✓ ${t.slug.padEnd(28)} ${DEMO_POSTS.length} posts, module on  ("${brand}")`);
}

await pool.end();
console.log('\nDone.');
