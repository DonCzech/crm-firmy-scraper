/**
 * Konvertuje the-barber-demo z full-page-clone na strukturované sekce
 * s funkčním live editorem a page builderem.
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const log = (m) => console.log(`[${new Date().toISOString()}] ${m}`);

// Barbershop design tokens — tmavý zlatý styl
const designTokens = {
  colorPrimary: '#d4a96e',
  colorSecondary: '#111111',
  colorBackground: '#1a1a1a',
  colorSurface: '#222222',
  colorText: '#f0ece4',
  colorTextMuted: '#a09070',
  colorAccent: '#d4a96e',
  colorBorder: '#333333',
  fontHeading: "'Libre Baskerville', Georgia, serif",
};

async function main() {
  log('=== Konverze the-barber-demo: full-page-clone → structured sections ===');

  // Najdi tenant + page
  const tenantRes = await pool.query(`SELECT id FROM tenants WHERE slug = 'the-barber-demo'`);
  const tenantId = tenantRes.rows[0].id;
  const pageRes = await pool.query(`SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true`, [tenantId]);
  const pageId = pageRes.rows[0].id;
  log(`Tenant: ${tenantId}, Page: ${pageId}`);

  // Smaž všechny stávající sekce
  await pool.query(`DELETE FROM sections WHERE page_id = $1`, [pageId]);
  log('Smazány staré sekce');

  // Sekce v pořadí
  const sections = [
    // 0. NAVBAR
    {
      section_type: 'navbar',
      section_variant: 'default',
      order_index: 0,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          siteName: 'THE CUT',
          logoUrl: '',
          links: [
            { label: 'O nás', href: '#o-nas' },
            { label: 'Galerie', href: '#galerie' },
            { label: 'Ceník', href: '#cenik' },
            { label: 'Kontakt', href: '#kontakt' },
          ],
          ctaText: 'Rezervovat',
          ctaHref: '#rezervace',
        },
      },
    },
    // 1. HERO
    {
      section_type: 'hero',
      section_variant: 'hero-luxury-dark',
      order_index: 1,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'THE CUT\nBARBERSHOP',
          subtitle: 'Ukázka šablony pro prémiový barbershop. Tento text můžete editovat kliknutím.',
          ctaText: 'REZERVOVAT TERMÍN',
          ctaHref: '#rezervace',
          backgroundImage: '/clones/the-barber/img/hero.jpg',
        },
      },
    },
    // 2. ABOUT
    {
      section_type: 'about',
      section_variant: 'two-col',
      order_index: 2,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'O nás',
          body: 'Tato sekce ukazuje, jak může šablona představit příběh a atmosféru studia. Stručný úvodní odstavec buduje důvěru a ladí tón celé stránky.',
          highlight: 'Zde může podnikatel popsat svůj prostor, filozofii nebo přístup ke klientům.',
          image: '/clones/the-barber/img/about.jpg',
        },
      },
    },
    // 3. GALERIE
    {
      section_type: 'gallery',
      section_variant: 'masonry',
      order_index: 3,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'Galerie',
          images: [1,2,3,4,5,6,7,8,9,10,11,12].map(i => ({
            url: `/clones/the-barber/img/gallery-${String(i).padStart(2,'0')}.jpg`,
            alt: `Barbershop ukázka ${i}`,
          })),
        },
      },
    },
    // 4. CENÍK — STŘIH
    {
      section_type: 'services',
      section_variant: 'pricing-list',
      order_index: 4,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'STŘIH',
          subtitle: 'Každá návštěva zahrnuje kávu, vodu a konzultaci zdarma.',
          services: [
            { name: 'Klasický pánský střih', description: '', price: '750 Kč' },
            { name: 'Pánský střih — delší vlasy', description: '', price: '920 Kč' },
            { name: 'Střih strojkem (s výtratem)', description: '', price: '540 Kč' },
            { name: 'Střih strojkem (jedna délka)', description: '', price: '420 Kč' },
            { name: 'Styling a finální úprava', description: '', price: '310 Kč' },
          ],
        },
      },
    },
    // 5. CENÍK — HOLENÍ
    {
      section_type: 'services',
      section_variant: 'pricing-list',
      order_index: 5,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'HOLENÍ (Hot towel)',
          subtitle: 'Tradiční technika s horkým ručníkem a prémiovou pěnou.',
          services: [
            { name: 'Úprava a tvarování vousů', description: '', price: '480 Kč' },
            { name: 'Holení tváře — klasické', description: '', price: '510 Kč' },
            { name: 'Holení hlavy', description: '', price: '580 Kč' },
          ],
        },
      },
    },
    // 6. CENÍK — KOMPLETNÍ
    {
      section_type: 'services',
      section_variant: 'pricing-list',
      order_index: 6,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'KOMPLETNÍ PÉČE',
          subtitle: 'Káva, voda a nápoj dle výběru v ceně. Ideální pro náročnější návštěvu.',
          services: [
            { name: 'Klasický střih + holení', description: '', price: '1 220 Kč' },
            { name: 'Střih + úprava vousů', description: '', price: '1 190 Kč' },
            { name: 'Kompletní holení (hlava a tvář)', description: '', price: '1 070 Kč' },
            { name: 'Strojkový střih + vousy', description: '', price: '960 Kč' },
            { name: 'Premium balíček — střih + holení + styling', description: '', price: '1 480 Kč' },
          ],
        },
      },
    },
    // 7. OTEVÍRACÍ DOBA
    {
      section_type: 'opening-hours',
      section_variant: 'default',
      order_index: 7,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'Otevírací doba',
          openingHours: [
            { day: 'Pondělí – Pátek', hours: '09:00 – 18:00' },
            { day: 'Sobota', hours: '10:00 – 15:00' },
            { day: 'Neděle', hours: 'Zavřeno' },
          ],
        },
      },
    },
    // 8. KONTAKT
    {
      section_type: 'contact',
      section_variant: 'default',
      order_index: 8,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          title: 'Kontakt',
          address: 'Demo ulice 12, Praha 2, 120 00',
          phone: '+420 608 288 777',
          email: 'info@demo.local',
        },
      },
    },
    // 9. FOOTER
    {
      section_type: 'footer',
      section_variant: 'default',
      order_index: 9,
      is_visible: true,
      settings: {
        designTokens,
        content: {
          siteName: 'THE CUT Barbershop',
          tagline: 'Ukázka šablony — demo obsah',
          phone: '+420 608 288 777',
          email: 'info@demo.local',
          address: 'Demo ulice 12, Praha 2',
          links: [
            { label: 'O nás', href: '#o-nas' },
            { label: 'Galerie', href: '#galerie' },
            { label: 'Ceník', href: '#cenik' },
          ],
        },
      },
    },
  ];

  // Vlož všechny sekce
  for (const s of sections) {
    await pool.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tenantId, pageId, s.section_type, s.section_variant, s.order_index, s.is_visible, JSON.stringify(s.settings)]
    );
    log(`  ✅ ${s.section_type} (${s.section_variant}) order:${s.order_index}`);
  }

  // Ověř
  const check = await pool.query(`SELECT section_type, order_index FROM sections WHERE page_id = $1 ORDER BY order_index`, [pageId]);
  log(`\nCelkem ${check.rows.length} sekcí:`);
  check.rows.forEach(r => log(`  ${r.order_index}. ${r.section_type}`));

  await pool.end();
  log('\n=== HOTOVO — zkontroluj http://localhost:3015/demo/the-barber-demo ===');
}

main().catch(e => { console.error(e); process.exit(1); });
