#!/usr/bin/env node
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'clinic-02-v2';
const EMAIL = 'demo@clinic-02.test';
const TEMPLATE_KEY = 'clinic-02';
const INDUSTRY = 'clinic';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} previous tenants with slug=${SLUG}`);

  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl, Referer: baseUrl + '/', 'X-Forwarded-For': '10.88.22.1' },
    body: JSON.stringify({
      businessName: 'Demo Bomton Clinic',
      email: EMAIL,
      templateKey: TEMPLATE_KEY,
      industry: INDUSTRY,
      slug: SLUG,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { console.error(`✗ onboarding ${res.status}:`, JSON.stringify(body)); process.exit(1); }
  console.log(`✓ ${TEMPLATE_KEY} tenant created — slug: ${SLUG}`);

  // Per-slug unique content. Merges INTO existing section.settings.content
  // via jsonb spread. Inserted-if-missing for slugs whose thematic type
  // wasn't cloned by tenant-factory.
  const SUBPAGE_CONTENT = {
    'zakroky': {
      section: 'services',
      content: {
        title:  'Kompletní katalog zákroků',
        kicker: '80+ procedur ve 12 kategoriích — vyberte podle oblasti',
        ctaText: 'Nezávazná konzultace', ctaHref: '/kontakt',
      },
    },
    'sluzby': {
      section: 'about', insertIfMissing: true,
      content: {
        title:  'Naše komplexní služby a péče',
        kicker: 'Od první konzultace po pooperační kontrolu',
        body:   'Nabízíme komplexní balíček péče: 1) první konzultace zdarma s odborným lékařem, 2) individuální plán zákroku s cenovou kalkulací, 3) samotný zákrok v moderních prostorech s certifikovanými preparáty, 4) pooperační kontroly bez příplatku po dobu 12 měsíců, 5) 24/7 helpdesk pro dotazy klientů. Věříme, že kvalitní péče je víc než jen zákrok.',
        ctaText: 'Rezervovat konzultaci', ctaHref: '/rezervace',
        stats: [
          { value: '18',   label: 'let praxe' },
          { value: '5,0 ★',label: 'Google recenze' },
          { value: '24/7', label: 'helpdesk' },
        ],
        imageUrl: '/templates/clinic-02/page-sluzby.webp',
      },
    },
    'o-nas': {
      section: 'about',
      content: {
        title:  'Aurélie Clinic — od roku 2007',
        kicker: 'Prim. MUDr. Aurélie Havlíčková vede tým 22 specialistů',
        body:   'Jsme rodinná klinika s 18letou tradicí. Zakladatelka prim. MUDr. Aurélie Havlíčková absolvovala stáže v Miláně a Curychu, publikuje v odborných časopisech a je členkou České společnosti estetické medicíny. Věříme v citlivý přístup, kdy zákrok slouží k tomu, abyste se cítili sami sebou — jen krásnější. Bez tlaku, bez nadbytečných procedur, bez zbytečných kompromisů.',
        ctaText: 'Poznat tým', ctaHref: '/kontakt',
        stats: [
          { value: '18+',   label: 'let na trhu' },
          { value: '22',    label: 'specialistů' },
          { value: '18k+',  label: 'spokojených klientek' },
        ],
        imageUrl: '/templates/clinic-02/page-o-nas.webp',
      },
    },
    'cenik': {
      section: 'about', insertIfMissing: true,
      content: {
        title:  'Přehledný ceník zákroků',
        kicker: 'Transparentní ceny · žádné skryté poplatky',
        body:   '💧 Kyselina hyaluronová 1 ml: od 4 900 Kč · 💉 Botulotoxin 1 partie: od 3 200 Kč · ✨ Chemický peeling: od 2 800 Kč · ⚡ Laserová epilace obličeje (série 6): od 8 400 Kč · 💎 Diamond Glow ošetření: od 3 900 Kč · 🌸 Mezoterapie obličeje: od 4 200 Kč · 🩺 Konzultace zdarma při rezervaci zákroku. Konečná cena vždy po osobní konzultaci a vyšetření.',
        ctaText: 'Stáhnout kompletní ceník (PDF)', ctaHref: '/kontakt',
        stats: [
          { value: '80+',      label: 'procedur v katalogu' },
          { value: 'od 2 800 Kč', label: 'nejnižší cena' },
          { value: '0 %',      label: 'skryté poplatky' },
        ],
        imageUrl: '/templates/clinic-02/page-cenik.webp',
      },
    },
    'kontakt': {
      section: 'contact',
      content: {
        title:  'Přijeďte se k nám podívat',
        kicker: 'Pražská 4, klimatizované prostory, snadné parkování',
        address:'Vinohradská 47, 120 00 Praha 2',
        phone:  '+420 704 123 456',
        email:  'recepce@aurelieclinic.cz',
        hours:  'Po–Pá 9:00–20:00 · So 9:00–14:00',
        ctaText:'Rezervovat termín online', ctaHref: '/rezervace',
      },
    },
    'voucher': {
      section: 'promo',
      content: {
        title:  'Darujte krásu — voucher Aurélie Clinic',
        kicker: 'Elegantní dárek s termínem platnosti až 12 měsíců',
        body:   'Voucher lze čerpat na libovolný zákrok nebo balíček péče. Nabízíme papírové vouchery v luxusním obalu i elektronické verze pro okamžité obdarování e-mailem. Populární hodnoty: 3 000 Kč, 5 000 Kč, 10 000 Kč nebo vlastní částka. Platnost 12 měsíců od nákupu, nevyužitou částku lze převést na jiný zákrok.',
        ctaText: 'Objednat voucher', ctaHref: 'mailto:voucher@aurelieclinic.cz',
      },
    },
    'rezervace': {
      section: 'contact', insertIfMissing: true,
      content: {
        title:  'Rezervujte si svůj termín',
        kicker: 'Online 24/7 · první konzultace zdarma',
        address:'Vinohradská 47, 120 00 Praha 2 · vchod z Balbínovy ulice',
        phone:  '+420 704 123 456',
        email:  'rezervace@aurelieclinic.cz',
        hours:  'Rezervace online 24/7 · Osobní návštěvy Po–Pá 9:00–20:00',
        ctaText:'Otevřít rezervační systém', ctaHref: 'mailto:rezervace@aurelieclinic.cz',
      },
    },
  };

  // Delete cloned hero from subpages (fullscreen hero looks wrong on internal pages).
  const heroDel = await pool.query(
    `DELETE FROM sections
     WHERE tenant_id = (SELECT id FROM tenants WHERE slug=$1)
       AND section_type = 'hero'
       AND page_id IN (SELECT id FROM pages WHERE tenant_id = (SELECT id FROM tenants WHERE slug=$1) AND is_homepage = false)
     RETURNING page_id`,
    [SLUG]
  );
  console.log(`✓ removed hero from ${heroDel.rowCount} subpages`);

  // Apply per-slug content
  const tenantRow = await pool.query('SELECT id FROM tenants WHERE slug=$1', [SLUG]);
  const tenantId = tenantRow.rows[0].id;
  let overridden = 0, inserted = 0;
  for (const [slug, cfg] of Object.entries(SUBPAGE_CONTENT)) {
    const pageRow = await pool.query('SELECT id FROM pages WHERE tenant_id=$1 AND slug=$2', [tenantId, slug]);
    if (!pageRow.rowCount) continue;
    const pageId = pageRow.rows[0].id;
    const existing = await pool.query(
      'SELECT id, settings FROM sections WHERE tenant_id=$1 AND page_id=$2 AND section_type=$3 LIMIT 1',
      [tenantId, pageId, cfg.section]
    );
    if (existing.rowCount) {
      const secId = existing.rows[0].id;
      const oldSettings = existing.rows[0].settings || {};
      const mergedContent = { ...(oldSettings.content ?? {}), ...cfg.content };
      const newSettings = { ...oldSettings, content: mergedContent };
      await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [newSettings, secId]);
      overridden++;
    } else if (cfg.insertIfMissing) {
      const variantRow = await pool.query(
        `SELECT section_variant FROM sections
         WHERE tenant_id=$1 AND section_type=$2 AND page_id=(SELECT id FROM pages WHERE tenant_id=$1 AND is_homepage=true)
         LIMIT 1`,
        [tenantId, cfg.section]
      );
      const variant = variantRow.rows[0]?.section_variant ?? null;
      await pool.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides)
         VALUES ($1, $2, $3, $4, 1, true, $5, '{}'::jsonb)`,
        [tenantId, pageId, cfg.section, variant, { content: cfg.content }]
      );
      inserted++;
    }
  }
  console.log(`✓ subpage content: ${overridden} overridden, ${inserted} inserted`);

  console.log(`  preview: ${baseUrl}${body.previewUrl ?? '/demo/' + SLUG}`);
  console.log(`  editor:  ${baseUrl}${body.editorUrl ?? '/demo/' + SLUG + '/admin'}`);
  await pool.end();
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
