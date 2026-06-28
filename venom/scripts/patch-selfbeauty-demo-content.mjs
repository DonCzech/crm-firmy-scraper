/**
 * FÁZE 3-5: Brand scrub + demo content
 * Replaces real contacts, brand name, social links with demo data
 */
import pg from 'pg';
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

// Demo logo SVG — replaces "self. beauty studio" text/image
const DEMO_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="140" height="42">
  <text x="6" y="28" font-family="Fahkwang,Georgia,serif" font-size="22" font-weight="600" fill="currentColor" letter-spacing="1">BEAUTY</text>
  <text x="6" y="50" font-family="Fahkwang,Georgia,serif" font-size="12" font-weight="300" fill="currentColor" letter-spacing="4">STUDIO DEMO</text>
</svg>`;

function scrubBrand(html) {
  // 1. Phone number
  html = html.replace(/\+420[\s ]?720[\s ]?014[\s ]?682/g, '+420 608 288 777');
  html = html.replace(/\+420[\s ]?720[\s ]?314[\s ]?682/g, '+420 608 288 777');
  html = html.replace(/720[\s ]014[\s ]682/g, '608 288 777');
  html = html.replace(/720[\s ]314[\s ]682/g, '608 288 777');

  // 2. Email
  html = html.replace(/rezervace@selfbeautystudio\.com/gi, 'info@demo.local');
  html = html.replace(/info@selfbeautystudio\.com/gi, 'info@demo.local');
  html = html.replace(/[a-z.]+@selfbeautystudio\.com/gi, 'info@demo.local');

  // 3. Business name — keep "self." as brand in logo but replace in text
  html = html.replace(/Self Beauty Studio/gi, 'Demo Beauty Studio');
  html = html.replace(/SELF BEAUTY STUDIO/g, 'DEMO BEAUTY STUDIO');

  // 4. Address — replace real Prague address if present
  html = html.replace(/(?:Benediktská|Hybernská|Náměstí Míru|Žitná|Slezská|Mánesova|Korunní)\s+\d+[^<,]*Praha\s*\d*/gi, 'Demo ulice 12, Praha 2');
  html = html.replace(/IČ[Oː:\s]+\d{6,8}/gi, '');
  html = html.replace(/DIČ[:\s]+CZ\d{6,10}/gi, '');

  // 5. Social media links — neutralize
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|tiktok)\.com[^"]*"/gi, 'href="#"');

  // 6. Wix booking links → #rezervace
  html = html.replace(/href="#rezervace"/g, 'href="#rezervace"'); // keep already replaced
  html = html.replace(/href="https?:\/\/[^"]*(?:reservations|booking|rezervace)[^"]*"/gi, 'href="#rezervace"');

  // 7. Copyright year
  html = html.replace(/©\s*\d{4}\s*Self/gi, '© 2026 Demo Beauty Studio');
  html = html.replace(/© \d{4} selfbeautystudio/gi, '© 2026 Demo Beauty Studio');

  // 8. Hero subtitle — add demo label
  html = html.replace(/(Vyberte si ze\s+[^<]{0,60}procedur[^<]{0,100})/i,
    'Ukázka šablony pro beauty & wellness studio. Všechny sekce jsou editovatelné.');

  // 9. Replace "selfbeautystudio.com" domain refs in text (not already rewritten links)
  html = html.replace(/selfbeautystudio\.com(?![^"<>]*["<>])/gi, 'demo.local');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`
  SELECT s.id, s.settings, p.slug as page_slug
  FROM sections s JOIN pages p ON s.page_id = p.id
  WHERE s.tenant_id = $1 ORDER BY s.id
`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const orig = s.html || '';
  const patched = scrubBrand(orig);

  await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);

  // Verify brand removed
  const phoneCheck = patched.match(/720\s?014|720\s?314/g)?.length || 0;
  const emailCheck = patched.match(/selfbeautystudio\.com/gi)?.length || 0;
  console.log(`${row.page_slug}: phone=${phoneCheck === 0 ? '✅' : phoneCheck}, email_domain=${emailCheck === 0 ? '✅' : emailCheck}`);
}

// Update tenant business name
await pool.query(`UPDATE tenants SET business_name = 'Demo Beauty Studio', updated_at = NOW() WHERE id = $1`, [tid]);
console.log('\nTenant business_name updated ✅');

await pool.end();
console.log('Brand scrub done ✅');
