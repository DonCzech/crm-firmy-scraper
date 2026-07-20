/**
 * Patch the-barber-demo: SVG logo, demo texty, upravené ceny, nový kontakt
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const r = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON p.id=s.page_id JOIN tenants t ON t.id=p.tenant_id WHERE t.slug='the-barber-demo' LIMIT 1`);
const { id, settings } = r.rows[0];
let html = settings.html;

// 1. LOGO — nahradit původní PNG za inline SVG
html = html.replace(
  `<img src="/clones/the-barber/img/logo.png" alt="The Barber" class="xvbel" width="120" height="80">`,
  `<svg width="110" height="52" viewBox="0 0 110 52" fill="none" xmlns="http://www.w3.org/2000/svg" class="xvbel" aria-label="The Cut Barbershop demo logo"><text x="55" y="20" text-anchor="middle" font-family="Libre Baskerville,Georgia,serif" font-size="13" letter-spacing="3" fill="#ffffff" font-weight="700">THE CUT</text><line x1="10" y1="26" x2="100" y2="26" stroke="#d4a96e" stroke-width="0.8"/><text x="55" y="40" text-anchor="middle" font-family="Source Sans Pro,sans-serif" font-size="8" letter-spacing="4" fill="#d4a96e">BARBERSHOP</text><text x="55" y="50" text-anchor="middle" font-family="Source Sans Pro,sans-serif" font-size="6" letter-spacing="2" fill="rgba(255,255,255,0.5)">DEMO SABLONA</text></svg>`
);

// Footer logo
html = html.replace(
  `<img src="/clones/the-barber/img/logo.png" alt="The Barber" class="xdgwg" width="90" height="60" loading="lazy">`,
  `<svg width="90" height="48" viewBox="0 0 90 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="xdgwg" aria-label="The Cut Barbershop demo logo"><text x="45" y="17" text-anchor="middle" font-family="Libre Baskerville,Georgia,serif" font-size="11" letter-spacing="2" fill="#ffffff" font-weight="700">THE CUT</text><line x1="8" y1="22" x2="82" y2="22" stroke="#d4a96e" stroke-width="0.7"/><text x="45" y="34" text-anchor="middle" font-family="Source Sans Pro,sans-serif" font-size="7" letter-spacing="3" fill="#d4a96e">BARBERSHOP</text><text x="45" y="44" text-anchor="middle" font-family="Source Sans Pro,sans-serif" font-size="5" letter-spacing="2" fill="rgba(255,255,255,0.4)">DEMO SABLONA</text></svg>`
);

// 2. HERO — subtitle + otevírací doba v hero
html = html.replace('Váš osobní holič v centru Prahy', 'Ukázka šablony pro prémiový barbershop');
html = html.replace('<p><strong>Po - Pá</strong> 10:00 - 19:00</p>', '<p><strong>Po - Pá</strong> 09:00 - 18:00</p>');
html = html.replace('<p><strong>So</strong> 11:00 - 17:00</p>', '<p><strong>So</strong> 10:00 - 15:00</p>');
html = html.replace('<p>Jilská 452/22, Praha 1</p>', '<p>Demo ulice 12, Praha 2</p>');

// 3. ABOUT — demo texty místo originálu
html = html.replace(
  'Prémiový privátní barber shop v naprostém srdci Prahy se skutečně individuálním přístupem ke každému muži.',
  'Tato sekce ukazuje, jak může šablona představit příběh a atmosféru studia. Stručný úvodní odstavec buduje důvěru a ladí tón celé stránky.'
);
html = html.replace(
  'The Barber je barber shop v malé postranní uličce, jen pár kroků od Staroměstského náměstí. Interiér odkazuje na tradici holického řemesla a stará dobrá časy. Užijte si během hektického dne prvotřídní péči, výborný rum, kožená křesla, krb a ruce jednoho z nejlepších holičů v Praze.',
  'Zde může podnikatel popsat svůj prostor, filozofii nebo přístup ke klientům. Šablona zobrazí text vedle fotografie a vytvoří vyvážené, přehledné rozvržení. Délka textu je plně na vašem uvážení — funguje krátký i delší popis.'
);

// 4. CENY — přeházené a upravené (ne originál)

// Střih
html = html.replace(
  `<li><span class="xfs34">Pánský střih (Dlouhé vlasy)</span><span class="xpwis">1000 Kč</span></li>
        <li><span class="xfs34">Klasický pánský střih</span><span class="xpwis">800 Kč</span></li>
        <li><span class="xfs34">Střih strojkem (s výtratem)</span><span class="xpwis">600 Kč</span></li>
        <li><span class="xfs34">Střih strojkem (jedna délka)</span><span class="xpwis">450 Kč</span></li>
        <li><span class="xfs34">Styling vlasů</span><span class="xpwis">350 Kč</span></li>`,
  `<li><span class="xfs34">Klasický pánský střih</span><span class="xpwis">750 Kč</span></li>
        <li><span class="xfs34">Pánský střih — delší vlasy</span><span class="xpwis">920 Kč</span></li>
        <li><span class="xfs34">Střih strojkem (s výtratem)</span><span class="xpwis">540 Kč</span></li>
        <li><span class="xfs34">Střih strojkem (jedna délka)</span><span class="xpwis">420 Kč</span></li>
        <li><span class="xfs34">Styling a finální úprava</span><span class="xpwis">310 Kč</span></li>`
);
html = html.replace(
  'Při návštěvě dostanete kávu a vodu.\n      </p>\n      <ul class="xvumo">',
  'Každá návštěva zahrnuje kávu, vodu a konzultaci zdarma.\n      </p>\n      <ul class="xvumo">'
);

// Holení
html = html.replace(
  `<li><span class="xfs34">Holení hlavy</span><span class="xpwis">550 Kč</span></li>
        <li><span class="xfs34">Holení tváře</span><span class="xpwis">550 Kč</span></li>
        <li><span class="xfs34">Úprava vousů</span><span class="xpwis">550 Kč</span></li>`,
  `<li><span class="xfs34">Úprava a tvarování vousů</span><span class="xpwis">480 Kč</span></li>
        <li><span class="xfs34">Holení tváře — klasické</span><span class="xpwis">510 Kč</span></li>
        <li><span class="xfs34">Holení hlavy</span><span class="xpwis">580 Kč</span></li>`
);
// Druhý p.x3z28 (holení)
html = html.replace(
  'Tradiční technika s horkým ručníkem a prémiovými produkty.',
  'Tradiční technika s horkým ručníkem a prémiovou pěnou.'
);

// Kompletní péče
html = html.replace(
  `<li><span class="xfs34">Pánský střih + úprava vousů nebo holení</span><span class="xpwis">1550 Kč</span></li>
        <li><span class="xfs34">Klasický střih + úprava vousů nebo holení</span><span class="xpwis">1350 Kč</span></li>
        <li><span class="xfs34">Střih strojkem (s výtratem) + vousů/holení</span><span class="xpwis">1150 Kč</span></li>
        <li><span class="xfs34">Střih strojkem (jedna délka) + vousů/holení</span><span class="xpwis">1000 Kč</span></li>
        <li><span class="xfs34">Kompletní holení (hlava a tvář)</span><span class="xpwis">1100 Kč</span></li>`,
  `<li><span class="xfs34">Klasický střih + holení</span><span class="xpwis">1220 Kč</span></li>
        <li><span class="xfs34">Střih + úprava vousů</span><span class="xpwis">1190 Kč</span></li>
        <li><span class="xfs34">Kompletní holení (hlava a tvář)</span><span class="xpwis">1070 Kč</span></li>
        <li><span class="xfs34">Strojkový střih + vousy</span><span class="xpwis">960 Kč</span></li>
        <li><span class="xfs34">Premium balíček — střih + holení + styling</span><span class="xpwis">1480 Kč</span></li>`
);
html = html.replace(
  'Při návštěvě dostanete kávu a vodu. Navíc ještě rum nebo whiskey dle vlastního výběru.',
  'Káva, voda a nápoj dle výběru v ceně. Ideální pro náročnější návštěvu.'
);

// 5. FOOTER — adresa a otevírací doba
html = html.replace('Jilská 452/22', 'Demo ulice 12');
html = html.replace('Praha 1, 110 00', 'Praha 2, 120 00');
html = html.replace('<tr><td>Pondělí – Pátek</td><td>10:00 – 19:00</td></tr>', '<tr><td>Pondělí – Pátek</td><td>09:00 – 18:00</td></tr>');
html = html.replace('<tr><td>Sobota</td><td>11:00 – 17:00</td></tr>', '<tr><td>Sobota</td><td>10:00 – 15:00</td></tr>');

settings.html = html;
await pool.query(`UPDATE sections SET settings = $1 WHERE id = $2`, [JSON.stringify(settings), id]);

console.log('Logo PNG gone:', !html.includes('logo.png') ? 'OK' : 'FAIL');
console.log('SVG logo present:', html.includes('THE CUT') ? 'OK' : 'FAIL');
console.log('Staromestske gone:', !html.includes('Starom') ? 'OK' : 'FAIL');
console.log('Original price 1550 gone:', !html.includes('1550 Kč') ? 'OK' : 'FAIL');
console.log('Original price 1000 gone:', !html.includes('>1000 Kč<') ? 'OK' : 'FAIL');
console.log('Jilska gone:', !html.includes('Jilská') ? 'OK' : 'FAIL');
console.log('Demo text present:', html.includes('Tato sekce ukazuje') ? 'OK' : 'FAIL');
console.log('Updated section', id);
await pool.end();
