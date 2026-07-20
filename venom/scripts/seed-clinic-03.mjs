#!/usr/bin/env node
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'clinic-03-v2';
const EMAIL = 'demo@clinic-03.test';
const TEMPLATE_KEY = 'clinic-03';
const INDUSTRY = 'clinic';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} previous tenants with slug=${SLUG}`);

  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl, Referer: baseUrl + '/', 'X-Forwarded-For': '10.88.22.1' },
    body: JSON.stringify({
      businessName: 'Demo Yes Visage',
      email: EMAIL,
      templateKey: TEMPLATE_KEY,
      industry: INDUSTRY,
      slug: SLUG,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { console.error(`✗ onboarding ${res.status}:`, JSON.stringify(body)); process.exit(1); }
  console.log(`✓ ${TEMPLATE_KEY} tenant created — slug: ${SLUG}`);

  // Post-seed cleanup: remove the big fullscreen hero from all subpages.
  const heroDel = await pool.query(
    `DELETE FROM sections
     WHERE tenant_id = (SELECT id FROM tenants WHERE slug=$1)
       AND section_type = 'hero'
       AND page_id IN (SELECT id FROM pages WHERE tenant_id = (SELECT id FROM tenants WHERE slug=$1) AND is_homepage = false)
     RETURNING page_id`,
    [SLUG]
  );
  console.log(`✓ removed hero from ${heroDel.rowCount} subpages`);

  // Post-seed: give each subpage unique content.
  // Per-slug overrides. Merged INTO existing section.settings.content via jsonb ||.
  const SUBPAGE_CONTENT = {
    // ── PRIMARY NAV ─────────────────────────────────────────────────────────
    'akce': {
      section: 'promo', insertIfMissing: true, fallbackVariant: 'clinic-03-about',
      content: {
        title: 'Zvýhodněné akce · únor 2026',
        kicker: 'Sleva až 30 % · omezená kapacita termínů',
        body: '🌸 Botulotoxin 3 partie za cenu 2 (do 28. února). ✨ Diamond Glow™ ošetření + hydratační mask ZDARMA při konzultaci. 💎 Balíček 6 laserových epilací se slevou 25 % pro nové klientky. 💧 Kyselina hyaluronová 1 ml + 2 ml jehlová aplikace za 5 900 Kč (běžně 7 800 Kč). Nabídky nelze kombinovat a platí do vyprodání kapacity.',
        ctaText: 'Rezervovat akční termín', ctaHref: '/kontakt',
        stats: [ { value: '−30 %', label: 'na vybrané zákroky' }, { value: '48', label: 'dnů platnosti' }, { value: '100+', label: 'termínů měsíčně' } ],
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      },
    },
    'zakroky': {
      section: 'services',
      content: {
        title: 'Kompletní katalog zákroků',
        kicker: '80+ procedur v 9 kategoriích — vyberte si podle oblasti nebo cíle',
        ctaText: 'Nezávazná konzultace', ctaHref: '/kontakt',
      },
    },
    'cenik': {
      section: 'about', insertIfMissing: true,
      content: {
        title: 'Orientační ceník zákroků',
        kicker: 'Konečná cena vždy po osobní konzultaci',
        body: '💉 Botulotoxin (1 partie): od 3 500 Kč. 💧 Kyselina hyaluronová (1 ml): od 5 400 Kč. ⚡ Laserová epilace obličeje: od 1 200 Kč / série 6. 🔥 Radiofrekvenční lifting: od 8 900 Kč. 🩺 Liposukce bez narkózy (1 partie): od 24 000 Kč. 👄 Zvětšení rtů (1 ml): od 5 800 Kč. Ceny jsou orientační — každý plán připravujeme individuálně po vyšetření.',
        ctaText: 'Stáhnout kompletní ceník (PDF)', ctaHref: '/kontakt',
        stats: [ { value: '80+',  label: 'procedur v katalogu' }, { value: 'od 1 200 Kč',  label: 'začínají ceny' }, { value: '0 %',  label: 'skryté poplatky' } ],
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      },
    },
    'lekari': {
      section: 'about',
      content: {
        title: 'Naši lékaři — 40+ specialistů s evropskou praxí',
        kicker: 'Prim. MUDr. Alena Nováková vede tým',
        body: 'MUDr. Alena Nováková (plastická chirurgie, 22 let praxe, atestace v Miláně) · Dr. Michal Havlíček (dermatologie a laser, USA — Mayo Clinic stáž) · MUDr. Kateřina Šimková (estetická medicína, výplně a botulotoxin) · Dr. Jan Rozehnal (chirurgie prsou a hrudníku) · MUDr. Petra Dvořáková (dermatologie, kožní záněty a prevence). Každý lékař prochází ročně min. 3 mezinárodními školeními.',
        ctaText: 'Objednat konzultaci konkrétního lékaře', ctaHref: '/kontakt',
        stats: [ { value: '40+', label: 'specialistů' }, { value: '15+', label: 'atestací' }, { value: '3', label: 'mez. kongresy ročně' } ],
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
      },
    },
    'celebrity': {
      section: 'about', insertIfMissing: true,
      content: {
        title: 'Diamond Look pečuje o veřejně známé tváře',
        kicker: 'Diskrétnost · profesionalita · žádné kompromisy',
        body: 'Mezi našimi klienty jsou moderátorky, herečky, sportovkyně i podnikatelky. Fungujeme s maximální diskrétností — každá návštěva probíhá v soukromém apartmá s vlastním vchodem a asistentkou. Osobní údaje jsou chráněné a zveřejňujeme jen to, k čemu máme písemný souhlas klienta. Reference dostupné pouze při osobní konzultaci.',
        ctaText: 'Domluvit privátní konzultaci', ctaHref: 'mailto:vip@diamondlook.cz',
        stats: [ { value: '200+', label: 'VIP klientek' }, { value: '100 %', label: 'diskrétnost' }, { value: 'ISO', label: 'ochrana údajů' } ],
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      },
    },
    'promeny': {
      section: 'gallery',
      content: {
        title: 'Skutečné proměny našich klientek',
        kicker: 'Před a po — bez retuše, jen se souhlasem klientů',
        ctaText: 'Chci konzultaci a svou proměnu', ctaHref: '/kontakt',
      },
    },
    // ── TOP LINKS ───────────────────────────────────────────────────────────
    'o-nas': {
      section: 'about',
      content: {
        title: 'Diamond Look — přední středoevropská klinika estetické medicíny',
        kicker: 'Založeno 2004 · 3 pobočky · Praha, Brno, Bratislava',
        body: 'Za dvacet let jsme se stali synonymem prvotřídní estetické péče. Kombinujeme špičkovou vědu s citem pro individualitu každého klienta. V našich prostorech na Vinohradech, v Brně a Bratislavě najdete komplexní zákroky pod jednou střechou — od neinvazivních procedur po plastickou chirurgii. Podléháme normám ISO 9001 a jsme držiteli mezinárodní ceny Superbrands 2023.',
        ctaText: 'Prohlédnout zákroky', ctaHref: '/zakroky',
        stats: [ { value: '20+', label: 'let na trhu' }, { value: '3',   label: 'moderní pobočky' }, { value: '80+', label: 'nabízených procedur' } ],
        imageUrl: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?auto=format&fit=crop&w=800&q=80',
      },
    },
    'novinky': {
      section: 'about', insertIfMissing: true,
      content: {
        title: 'Novinky z kliniky',
        kicker: 'Aktuality · rozhovory · odborné články',
        body: '📰 Nové ošetření Diamond Glow™ v akční ceně — únor 2026. 🎓 Dr. Nováková přednášela na kongresu ESLD v Miláně o kombinaci laseru a hyaluronu. 💫 Otevřeli jsme rozšířenou pobočku v Bratislavě s novým laserovým centrem. 📅 Chystáme edukační webinář pro klienty na téma bezpečné výplně — přihlaste se přes newsletter.',
        ctaText: 'Přihlásit se k odběru', ctaHref: '#promo',
        stats: [ { value: '12',  label: 'článků za rok' }, { value: '5k+', label: 'čtenářů newsletteru' }, { value: 'ČT', label: 'partner pořadu Krása' } ],
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      },
    },
    'kariera': {
      section: 'about',
      content: {
        title: 'Kariéra u Diamond Look',
        kicker: 'Přidejte se k týmu, který mění životy',
        body: 'Hledáme kolegy, kteří mají cit pro detail, chuť růst a záleží jim na kvalitě péče. Nabízíme moderní pracoviště, kontinuální vzdělávání, podíl na ziscích a atmosféru, ve které jsou lidé první. Aktuálně obsazujeme pozice plastický chirurg, kosmetická sestra, koordinátorka klientské péče a marketing specialist. Zasílejte životopisy na kariera@diamondlook.cz — reagujeme do 3 pracovních dnů.',
        ctaText: 'Poslat CV', ctaHref: 'mailto:kariera@diamondlook.cz',
        stats: [ { value: '4',    label: 'otevřených pozic' }, { value: '25', label: 'dní dovolené' }, { value: '100 %', label: 'proplacené vzdělávání' } ],
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      },
    },
    'kontakt': {
      section: 'contact',
      content: {
        title: 'Přijeďte se k nám podívat',
        kicker: 'Tři pobočky · online konzultace · rezervace 24/7',
        address: 'Vinohradská 47, Praha 2 · Česká 12, Brno · Panská 3, Bratislava',
        phone: '+420 704 123 456',
        email: 'recepce@diamondlook.cz',
        hours: 'Po–Pá 9:00–20:00 · So 9:00–14:00',
        ctaText: 'Rezervovat termín online', ctaHref: '#kontakt',
      },
    },
  };

  const tenantRow = await pool.query('SELECT id FROM tenants WHERE slug=$1', [SLUG]);
  const tenantId = tenantRow.rows[0].id;

  let overridden = 0;
  let inserted = 0;
  for (const [slug, cfg] of Object.entries(SUBPAGE_CONTENT)) {
    const pageRow = await pool.query('SELECT id FROM pages WHERE tenant_id=$1 AND slug=$2', [tenantId, slug]);
    if (!pageRow.rowCount) continue;
    const pageId = pageRow.rows[0].id;

    const existing = await pool.query(
      'SELECT id, settings FROM sections WHERE tenant_id=$1 AND page_id=$2 AND section_type=$3 LIMIT 1',
      [tenantId, pageId, cfg.section]
    );

    if (existing.rowCount) {
      // Merge new content INTO existing settings.content
      const secId = existing.rows[0].id;
      const oldSettings = existing.rows[0].settings || {};
      const mergedContent = { ...(oldSettings.content ?? {}), ...cfg.content };
      const newSettings = { ...oldSettings, content: mergedContent };
      await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [newSettings, secId]);
      overridden++;
    } else if (cfg.insertIfMissing) {
      // Insert new section — placed AFTER navbar (order 1)
      // Find variant from home page's same-type section (fallback: null)
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
