/**
 * FÁZE 1 — Mirror assets z thebarber.cz → public/clones/the-barber/
 *
 * Squarespace site → vlastní čistý HTML/CSS (bez Squarespace CDN závislostí)
 * Stáhne: fonty, logo, vytvoří HTML+CSS.
 * Obrázky budou nahrazeny AI v FÁZI 6.
 *
 * Spustit: node scripts/mirror-the-barber-assets.mjs
 * Výstup:  public/clones/the-barber/...
 *          /tmp/the-barber-home.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CLONE_DIR = path.join(ROOT, 'public/clones/the-barber');
const CLONE_PATH = '/clones/the-barber';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function download(url, destPath, binary = true) {
  if (existsSync(destPath)) { log(`  SKIP (exists): ${path.basename(destPath)}`); return; }
  mkdirSync(path.dirname(destPath), { recursive: true });
  log(`  GET: ${url.slice(0, 100)}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) { log(`  WARN: ${res.status} ${url}`); return; }
  if (binary) {
    const buf = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buf));
  } else {
    const text = await res.text();
    fs.writeFileSync(destPath, text, 'utf-8');
  }
  log(`  OK: ${path.basename(destPath)}`);
}

async function downloadFonts() {
  log('-- Fonty (Google Fonts → lokální) --');
  const fontsDir = path.join(CLONE_DIR, 'fonts');
  mkdirSync(fontsDir, { recursive: true });

  // Source Sans Pro weights needed: 300, 400, 700 (regular + italic)
  // Libre Baskerville weights: 400, 700 (regular + italic)
  const fontUrls = [
    { url: 'https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmhdu3cOWxy40.woff2', file: 'SourceSansPro-300.woff2', family: 'Source Sans Pro', weight: 300, style: 'normal' },
    { url: 'https://fonts.gstatic.com/s/sourcesanspro/v22/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2', file: 'SourceSansPro-400.woff2', family: 'Source Sans Pro', weight: 400, style: 'normal' },
    { url: 'https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmhdu3cOWxy40.woff2', file: 'SourceSansPro-700.woff2', family: 'Source Sans Pro', weight: 700, style: 'normal' },
    { url: 'https://fonts.gstatic.com/s/librebaskerville/v14/kmKhZrc3Hgbbcjq75U4uslyuy4kn0pNeYRI4CN2V.woff2', file: 'LibreBaskerville-400.woff2', family: 'Libre Baskerville', weight: 400, style: 'normal' },
    { url: 'https://fonts.gstatic.com/s/librebaskerville/v14/kmKiZrc3Hgbbcjq75U4uslyuy4kn0pNjVF8K.woff2', file: 'LibreBaskerville-700.woff2', family: 'Libre Baskerville', weight: 700, style: 'normal' },
    { url: 'https://fonts.gstatic.com/s/librebaskerville/v14/kmKnZrc3Hgbbcjq75U4uslyuy4kn0qNcaxYaDc2V2ro.woff2', file: 'LibreBaskerville-400i.woff2', family: 'Libre Baskerville', weight: 400, style: 'italic' },
  ];

  for (const font of fontUrls) {
    await download(font.url, path.join(fontsDir, font.file));
  }

  // Generate fonts.css
  const fontsCss = fontUrls.map(f => `@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url('${CLONE_PATH}/fonts/${f.file}') format('woff2');
}`).join('\n\n');

  writeFileSync(path.join(fontsDir, 'fonts.css'), fontsCss, 'utf-8');
  log('  fonts.css vygenerován');
}

async function downloadLogo() {
  log('-- Logo --');
  const logoDir = path.join(CLONE_DIR, 'img');
  mkdirSync(logoDir, { recursive: true });

  // Logo white PNG from Squarespace CDN
  await download(
    'https://images.squarespace-cdn.com/content/v1/5c9d58cffd67934b52574476/cb8e6a9b-2219-48f7-bab4-f67238301df9/the-barber_logo_white%404x.png',
    path.join(logoDir, 'logo.png')
  );
}

function buildHtml() {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="${CLONE_PATH}/fonts/fonts.css">
  <link rel="stylesheet" href="${CLONE_PATH}/css/style.css">
</head>
<body>

<!-- HEADER -->
<header class="site-header">
  <div class="header-inner">
    <a href="#thebarber-cs" class="logo-link">
      <img src="${CLONE_PATH}/img/logo.png" alt="The Barber" class="logo-img" width="120" height="80">
    </a>
    <nav class="main-nav">
      <a href="#onas-cs" class="nav-link">O nás</a>
      <a href="#galerie-cs" class="nav-link">Galerie</a>
      <a href="#cenik-cs" class="nav-link">Ceník</a>
    </nav>
    <button class="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<!-- HERO -->
<section class="hero-section" id="thebarber-cs">
  <div class="hero-bg">
    <img src="${CLONE_PATH}/img/hero.jpg" alt="The Barber" class="hero-img" loading="eager" fetchpriority="high">
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-content">
    <h1 class="hero-title">THE BARBER</h1>
    <p class="hero-subtitle">Váš osobní holič v centru Prahy</p>
    <a href="https://www.welns.io/product/booking/WFRCHN000016004?bk_src=LI103" class="btn-rezervovat" rel="nofollow" target="_blank">REZERVOVAT</a>
    <div class="hero-info">
      <p><strong>Po - Pá</strong> 10:00 - 19:00</p>
      <p><strong>So</strong> 11:00 - 17:00</p>
      <p>Jilská 452/22, Praha 1</p>
    </div>
  </div>
  <div class="hero-scroll">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>
</section>

<!-- O NÁS -->
<section class="about-section" id="onas-cs">
  <div class="about-inner">
    <div class="about-text">
      <p class="about-lead">Prémiový privátní barber shop v naprostém srdci Prahy se skutečně individuálním přístupem ke každému muži.</p>
      <p class="about-body">The Barber je barber shop v malé postranní uličce, jen pár kroků od Staroměstského náměstí. Interiér odkazuje na tradici holického řemesla a stará dobrá časy. Užijte si během hektického dne prvotřídní péči, výborný rum, kožená křesla, krb a ruce jednoho z nejlepších holičů v Praze.</p>
    </div>
    <div class="about-photo">
      <img src="${CLONE_PATH}/img/about.jpg" alt="The Barber — interiér" loading="lazy" width="600" height="450">
    </div>
  </div>
</section>

<!-- GALERIE -->
<section class="gallery-section" id="galerie-cs">
  <div class="gallery-grid">
    <img src="${CLONE_PATH}/img/gallery-01.jpg" alt="The Barber — pánský střih" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-02.jpg" alt="The Barber — holení" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-03.jpg" alt="The Barber — křeslo" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-04.jpg" alt="The Barber — interiér" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-05.jpg" alt="The Barber — nástroje" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-06.jpg" alt="The Barber — vousy" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-07.jpg" alt="The Barber — střih" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-08.jpg" alt="The Barber — péče" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-09.jpg" alt="The Barber — barber" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-10.jpg" alt="The Barber — detail" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-11.jpg" alt="The Barber — prostředí" loading="lazy" width="400" height="400">
    <img src="${CLONE_PATH}/img/gallery-12.jpg" alt="The Barber — nůžky" loading="lazy" width="400" height="400">
  </div>
</section>

<!-- CENÍK -->
<section class="pricing-section" id="cenik-cs">
  <div class="pricing-bg">
    <img src="${CLONE_PATH}/img/pricing-bg.jpg" alt="" class="pricing-bg-img" loading="lazy" aria-hidden="true">
    <div class="pricing-overlay"></div>
  </div>
  <div class="pricing-inner">
    <div class="pricing-col">
      <h2 class="pricing-title">STŘIH</h2>
      <p class="pricing-note">Při návštěvě dostanete kávu a vodu.</p>
      <ul class="pricing-list">
        <li><span class="service-name">Pánský střih (Dlouhé vlasy)</span><span class="service-price">1000 Kč</span></li>
        <li><span class="service-name">Klasický pánský střih</span><span class="service-price">800 Kč</span></li>
        <li><span class="service-name">Střih strojkem (s výtratem)</span><span class="service-price">600 Kč</span></li>
        <li><span class="service-name">Střih strojkem (jedna délka)</span><span class="service-price">450 Kč</span></li>
        <li><span class="service-name">Styling vlasů</span><span class="service-price">350 Kč</span></li>
      </ul>
    </div>
    <div class="pricing-col">
      <h2 class="pricing-title">HOLENÍ <span class="pricing-subtitle">(Hot towel)</span></h2>
      <p class="pricing-note">Při návštěvě dostanete kávu a vodu.</p>
      <ul class="pricing-list">
        <li><span class="service-name">Holení hlavy</span><span class="service-price">550 Kč</span></li>
        <li><span class="service-name">Holení tváře</span><span class="service-price">550 Kč</span></li>
        <li><span class="service-name">Úprava vousů</span><span class="service-price">550 Kč</span></li>
      </ul>
    </div>
    <div class="pricing-col">
      <h2 class="pricing-title">KOMPLETNÍ PÉČE</h2>
      <p class="pricing-note">Při návštěvě dostanete kávu a vodu. Navíc ještě rum nebo whiskey dle vlastního výběru.</p>
      <ul class="pricing-list">
        <li><span class="service-name">Pánský střih + úprava vousů nebo holení</span><span class="service-price">1550 Kč</span></li>
        <li><span class="service-name">Klasický střih + úprava vousů nebo holení</span><span class="service-price">1350 Kč</span></li>
        <li><span class="service-name">Střih strojkem (s výtratem) + vousů/holení</span><span class="service-price">1150 Kč</span></li>
        <li><span class="service-name">Střih strojkem (jedna délka) + vousů/holení</span><span class="service-price">1000 Kč</span></li>
        <li><span class="service-name">Kompletní holení (hlava a tvář)</span><span class="service-price">1100 Kč</span></li>
      </ul>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-col">
      <img src="${CLONE_PATH}/img/logo.png" alt="The Barber" class="footer-logo" width="90" height="60" loading="lazy">
      <p class="footer-address">Jilská 452/22<br>Praha 1, 110 00</p>
      <p class="footer-contact"><a href="tel:+420774352600">+420 774 352 600</a></p>
      <p class="footer-contact"><a href="mailto:info@demo.local">info@demo.local</a></p>
      <div class="footer-social">
        <a href="https://www.instagram.com/thebarberdemo/" aria-label="Instagram" rel="nofollow" target="_blank">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="https://www.facebook.com/thebarberdemo/" aria-label="Facebook" rel="nofollow" target="_blank">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-col footer-hours">
      <h3 class="footer-hours-title">Otevírací doba</h3>
      <table class="hours-table">
        <tr><td>Pondělí – Pátek</td><td>10:00 – 19:00</td></tr>
        <tr><td>Sobota</td><td>11:00 – 17:00</td></tr>
        <tr><td>Neděle</td><td>Zavřeno</td></tr>
      </table>
    </div>
  </div>
</footer>

<!-- Hamburger JS (no external dependency) -->
<script>
(function(){
  var btn = document.querySelector('.hamburger');
  var nav = document.querySelector('.main-nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', function(){
    var open = nav.classList.toggle('nav-open');
    btn.classList.toggle('hamburger-open', open);
    btn.setAttribute('aria-expanded', open);
  });
})();
</script>

</body>
</html>`;
}

function buildCss() {
  return `/* The Barber — clone CSS */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

body{
  font-family:'Source Sans Pro',sans-serif;
  font-weight:400;
  color:#1a1a1a;
  background:#fff;
  overflow-x:hidden;
}

/* HEADER */
.site-header{
  position:fixed;top:0;left:0;right:0;z-index:100;
  padding:18px 40px;
  display:flex;align-items:center;
  background:linear-gradient(to bottom,rgba(0,0,0,.55) 0%,transparent 100%);
  transition:background .3s;
}
.header-inner{
  width:100%;max-width:1200px;margin:0 auto;
  display:flex;align-items:center;justify-content:space-between;
}
.logo-link{display:block;}
.logo-img{width:90px;height:auto;filter:brightness(1);}
.main-nav{display:flex;gap:32px;}
.nav-link{
  font-family:'Source Sans Pro',sans-serif;
  font-size:13px;letter-spacing:.12em;text-transform:uppercase;
  color:#fff;text-decoration:none;font-weight:400;
  transition:opacity .2s;
}
.nav-link:hover{opacity:.7;}

/* HAMBURGER */
.hamburger{
  display:none;flex-direction:column;justify-content:space-between;
  width:28px;height:20px;background:none;border:none;cursor:pointer;padding:0;
}
.hamburger span{
  display:block;height:1.5px;background:#fff;transition:all .3s;
  transform-origin:center;
}
.hamburger-open span:nth-child(1){transform:translateY(9px) rotate(45deg);}
.hamburger-open span:nth-child(2){opacity:0;}
.hamburger-open span:nth-child(3){transform:translateY(-9px) rotate(-45deg);}

/* HERO */
.hero-section{
  position:relative;min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
.hero-bg{position:absolute;inset:0;}
.hero-img{width:100%;height:100%;object-fit:cover;display:block;}
.hero-overlay{
  position:absolute;inset:0;
  background:linear-gradient(to bottom,rgba(0,0,0,.2) 0%,rgba(0,0,0,.55) 60%,rgba(0,0,0,.75) 100%);
}
.hero-content{
  position:relative;z-index:2;
  text-align:center;color:#fff;
  padding:0 24px;max-width:800px;
}
.hero-title{
  font-family:'Libre Baskerville',serif;
  font-size:clamp(3rem,7vw,6rem);
  font-weight:400;letter-spacing:.18em;
  text-transform:uppercase;margin-bottom:16px;
}
.hero-subtitle{
  font-family:'Source Sans Pro',sans-serif;
  font-size:clamp(1rem,2.5vw,1.4rem);
  font-weight:300;letter-spacing:.06em;
  margin-bottom:40px;color:rgba(255,255,255,.9);
}
.btn-rezervovat{
  display:inline-block;
  border:1.5px solid rgba(255,255,255,.8);
  color:#fff;
  font-family:'Source Sans Pro',sans-serif;
  font-size:12px;letter-spacing:.2em;text-transform:uppercase;
  padding:14px 36px;text-decoration:none;
  border-radius:50px;
  transition:background .25s,border-color .25s;
  margin-bottom:48px;
}
.btn-rezervovat:hover{background:rgba(255,255,255,.15);}
.hero-info{font-size:.95rem;line-height:2;color:rgba(255,255,255,.85);}
.hero-info strong{color:#fff;}
.hero-scroll{
  position:absolute;bottom:32px;left:50%;transform:translateX(-50%);
  z-index:2;opacity:.7;animation:bounce 2s infinite;
}
@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(8px);}}

/* ABOUT */
.about-section{
  padding:100px 40px;background:#f9f7f5;
}
.about-inner{
  max-width:1100px;margin:0 auto;
  display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;
}
.about-lead{
  font-family:'Libre Baskerville',serif;
  font-size:clamp(1.1rem,2vw,1.4rem);
  font-style:italic;color:#9a7a50;
  line-height:1.7;margin-bottom:24px;
}
.about-body{
  font-size:1rem;line-height:1.85;color:#444;font-weight:300;
}
.about-photo img{
  width:100%;height:auto;object-fit:cover;display:block;
  border-radius:2px;
}

/* GALLERY */
.gallery-section{padding:0;background:#1a1a1a;}
.gallery-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:3px;
}
.gallery-grid img{
  width:100%;aspect-ratio:1;object-fit:cover;display:block;
  transition:transform .4s ease;
}
.gallery-grid img:hover{transform:scale(1.04);}

/* PRICING */
.pricing-section{
  position:relative;padding:100px 40px;
  overflow:hidden;
}
.pricing-bg{position:absolute;inset:0;}
.pricing-bg-img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.25);}
.pricing-overlay{position:absolute;inset:0;background:rgba(10,8,6,.75);}
.pricing-inner{
  position:relative;z-index:2;
  max-width:1200px;margin:0 auto;
  display:grid;grid-template-columns:repeat(3,1fr);gap:60px;
}
.pricing-title{
  font-family:'Libre Baskerville',serif;
  font-size:1.2rem;letter-spacing:.15em;text-transform:uppercase;
  color:#d4a96e;margin-bottom:8px;font-weight:400;
}
.pricing-subtitle{font-size:.85rem;letter-spacing:.05em;color:#b89060;}
.pricing-note{font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:24px;font-weight:300;}
.pricing-list{list-style:none;}
.pricing-list li{
  display:flex;justify-content:space-between;align-items:baseline;
  padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);
  gap:12px;
}
.service-name{font-size:.9rem;color:rgba(255,255,255,.85);font-weight:300;}
.service-price{font-size:.9rem;color:#d4a96e;white-space:nowrap;font-weight:400;}

/* FOOTER */
.site-footer{background:#111;padding:60px 40px;color:rgba(255,255,255,.65);}
.footer-inner{
  max-width:1100px;margin:0 auto;
  display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;
}
.footer-logo{width:80px;height:auto;margin-bottom:20px;filter:brightness(.85);}
.footer-address,.footer-contact{font-size:.9rem;line-height:1.8;margin-bottom:8px;}
.footer-contact a{color:rgba(255,255,255,.65);text-decoration:none;}
.footer-contact a:hover{color:#d4a96e;}
.footer-social{display:flex;gap:16px;margin-top:20px;}
.footer-social a{color:rgba(255,255,255,.5);transition:color .2s;}
.footer-social a:hover{color:#d4a96e;}
.footer-hours-title{
  font-family:'Libre Baskerville',serif;
  font-size:1rem;letter-spacing:.1em;text-transform:uppercase;
  color:rgba(255,255,255,.85);margin-bottom:20px;font-weight:400;
}
.hours-table{border-collapse:collapse;font-size:.9rem;}
.hours-table td{padding:6px 20px 6px 0;color:rgba(255,255,255,.65);}
.hours-table td:last-child{color:#d4a96e;}

/* MOBILE */
@media(max-width:900px){
  .about-inner{grid-template-columns:1fr;gap:40px;}
  .pricing-inner{grid-template-columns:1fr;gap:48px;}
  .footer-inner{grid-template-columns:1fr;gap:40px;}
  .gallery-grid{grid-template-columns:repeat(3,1fr);}
}
@media(max-width:600px){
  .site-header{padding:14px 20px;}
  .main-nav{
    display:none;
    position:fixed;inset:0;background:rgba(10,8,6,.97);
    flex-direction:column;align-items:center;justify-content:center;gap:32px;
    z-index:90;
  }
  .main-nav.nav-open{display:flex;}
  .nav-link{font-size:1.1rem;}
  .hamburger{display:flex;}
  .about-section{padding:60px 24px;}
  .pricing-section{padding:60px 24px;}
  .site-footer{padding:48px 24px;}
  .gallery-grid{grid-template-columns:repeat(2,1fr);}
  .hero-title{letter-spacing:.08em;}
}
`;
}

async function main() {
  log('=== FÁZE 1: Mirror the-barber (thebarber.cz) — vlastní HTML/CSS ===');

  // Directories
  mkdirSync(path.join(CLONE_DIR, 'css'), { recursive: true });
  mkdirSync(path.join(CLONE_DIR, 'img'), { recursive: true });
  mkdirSync(path.join(CLONE_DIR, 'fonts'), { recursive: true });

  // 1. Fonts
  await downloadFonts();

  // 2. Logo
  await downloadLogo();

  // 3. CSS
  log('-- CSS --');
  const cssPath = path.join(CLONE_DIR, 'css', 'style.css');
  writeFileSync(cssPath, buildCss(), 'utf-8');
  log('  style.css vygenerován');

  // 4. HTML
  log('-- HTML --');
  const html = buildHtml();
  writeFileSync('/tmp/the-barber-home.html', html, 'utf-8');
  log(`  /tmp/the-barber-home.html (${html.length} chars)`);

  // 5. Placeholder images (budou přepsány AI v FÁZE 6)
  log('-- Image placeholders (AI v FÁZE 6) --');
  const imgList = [
    'hero.jpg', 'about.jpg', 'pricing-bg.jpg',
    ...Array.from({length:12}, (_,i) => `gallery-${String(i+1).padStart(2,'0')}.jpg`),
  ];
  for (const img of imgList) {
    const p = path.join(CLONE_DIR, 'img', img);
    if (!existsSync(p)) {
      // Create tiny placeholder (1px transparent)
      writeFileSync(p, Buffer.from(''), 'binary');
      log(`  placeholder: ${img}`);
    }
  }

  log('\n=== FÁZE 1 HOTOVA ===');
  log(`Assets v: ${CLONE_DIR}`);
  log('HTML pro seed: /tmp/the-barber-home.html');
  log('\nDalší kroky:');
  log('1. node scripts/seed-the-barber-demo.mjs');
  log('2. node scripts/generate-the-barber-images.mjs');
  log('3. node scripts/seed-the-barber-demo.mjs  (znovu po AI obrázcích)');
  log('4. node scripts/obfuscate-clone.mjs the-barber the-barber-demo');
}

main().catch(e => { console.error(e); process.exit(1); });
