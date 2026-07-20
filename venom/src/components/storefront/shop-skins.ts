/**
 * Storefront skiny — per-šablonová vizuální identita sdíleného storefrontu.
 *
 * Sdílené komponenty (ShopHeader, ProductListing, detail, košík, pokladna…)
 * jsou stylované neutral-* utilitami (monochrom eshop-01). Skin je scoped
 * CSS pod [data-shop-skin="<key>"], které tuto paletu přemapuje na identitu
 * šablony — bez zásahu do komponent a bez vlivu na ostatní tenanty.
 * Bez skinu (eshop-01, neznámý klíč) se nerenderuje nic.
 */

const ESHOP_02_CSS = `
/* eshop-02 "Modrý Košík" — Shoptet Classic DNA: modrá #1266cc, navy #142b45,
   oranžový akcent #f0803c, Open Sans, světle modré plochy. */
[data-shop-skin="eshop-02"] {
  font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif;
}
[data-shop-skin="eshop-02"] button,
[data-shop-skin="eshop-02"] input,
[data-shop-skin="eshop-02"] select,
[data-shop-skin="eshop-02"] textarea {
  font-family: inherit;
}

/* ── Primární akce a tmavé bloky: monochrom čerň → modrá ── */
[data-shop-skin="eshop-02"] .bg-neutral-950,
[data-shop-skin="eshop-02"] .bg-neutral-900 {
  background-color: #1266cc !important;
}
[data-shop-skin="eshop-02"] .hover\\:bg-neutral-800:hover,
[data-shop-skin="eshop-02"] .hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-02"] .hover\\:bg-neutral-900:hover,
[data-shop-skin="eshop-02"] .hover\\:bg-neutral-950:hover {
  background-color: #0e51a3 !important;
}
[data-shop-skin="eshop-02"] .bg-neutral-800 {
  background-color: #0e51a3 !important;
}
[data-shop-skin="eshop-02"] .border-neutral-950,
[data-shop-skin="eshop-02"] .border-neutral-900 {
  border-color: #1266cc !important;
}
[data-shop-skin="eshop-02"] .hover\\:border-neutral-950:hover {
  border-color: #1266cc !important;
}
[data-shop-skin="eshop-02"] .ring-neutral-900 {
  --tw-ring-color: #1266cc !important;
}

/* ── Texty: čerň → navy, šedé → slate ── */
[data-shop-skin="eshop-02"] .text-neutral-950,
[data-shop-skin="eshop-02"] .text-neutral-900 {
  color: #142b45 !important;
}
[data-shop-skin="eshop-02"] .text-neutral-800,
[data-shop-skin="eshop-02"] .text-neutral-700 {
  color: #33445c !important;
}
[data-shop-skin="eshop-02"] .text-neutral-600,
[data-shop-skin="eshop-02"] .text-neutral-500 {
  color: #64748b !important;
}
[data-shop-skin="eshop-02"] .text-neutral-400 {
  color: #8296ac !important;
}
[data-shop-skin="eshop-02"] .hover\\:text-neutral-950:hover,
[data-shop-skin="eshop-02"] .hover\\:text-neutral-900:hover,
[data-shop-skin="eshop-02"] .hover\\:text-neutral-800:hover,
[data-shop-skin="eshop-02"] .hover\\:text-neutral-700:hover {
  color: #1266cc !important;
}

/* ── Plochy a rámečky: šedá → světle modrá ── */
[data-shop-skin="eshop-02"] .bg-neutral-50,
[data-shop-skin="eshop-02"] .bg-neutral-100 {
  background-color: #f5f8fb !important;
}
[data-shop-skin="eshop-02"] .bg-neutral-200 {
  background-color: #e3e9f0 !important;
}
[data-shop-skin="eshop-02"] .hover\\:bg-neutral-50:hover,
[data-shop-skin="eshop-02"] .hover\\:bg-neutral-100:hover {
  background-color: #e9f1fa !important;
}
[data-shop-skin="eshop-02"] .hover\\:bg-neutral-200:hover {
  background-color: #d9e4ef !important;
}
[data-shop-skin="eshop-02"] .border-neutral-100,
[data-shop-skin="eshop-02"] .border-neutral-200,
[data-shop-skin="eshop-02"] .border-neutral-300 {
  border-color: #e3e9f0 !important;
}
[data-shop-skin="eshop-02"] .hover\\:border-neutral-300:hover,
[data-shop-skin="eshop-02"] .hover\\:border-neutral-400:hover {
  border-color: #1266cc !important;
}
[data-shop-skin="eshop-02"] .divide-neutral-100 > :not([hidden]) ~ :not([hidden]),
[data-shop-skin="eshop-02"] .divide-neutral-200 > :not([hidden]) ~ :not([hidden]) {
  border-color: #e3e9f0 !important;
}

/* ── Karty produktů: modrý hover ring + lift (jazyk homepage sekcí) ── */
[data-shop-skin="eshop-02"] a[href*="/obchod/"].group,
[data-shop-skin="eshop-02"] .group\\/card {
  transition: box-shadow .25s, transform .25s, border-color .2s;
}
[data-shop-skin="eshop-02"] a[href*="/obchod/"].group:hover,
[data-shop-skin="eshop-02"] .group\\/card:hover {
  box-shadow: 0 10px 28px rgba(18, 102, 204, 0.14);
  transform: translateY(-2px);
  border-color: #1266cc;
}

/* ── Skladem/úspěch: emerald → svěží zelená z šablony ── */
[data-shop-skin="eshop-02"] .text-emerald-600,
[data-shop-skin="eshop-02"] .text-emerald-700 {
  color: #1f9d55 !important;
}
[data-shop-skin="eshop-02"] .bg-emerald-500,
[data-shop-skin="eshop-02"] .bg-emerald-600 {
  background-color: #1f9d55 !important;
}

/* ── Akcenty: focus ring, výběry, odkazy ── */
[data-shop-skin="eshop-02"] input:focus,
[data-shop-skin="eshop-02"] select:focus,
[data-shop-skin="eshop-02"] textarea:focus {
  border-color: #1266cc !important;
  box-shadow: 0 0 0 3px rgba(18, 102, 204, 0.12) !important;
  outline: none;
}
[data-shop-skin="eshop-02"] ::selection {
  background: rgba(18, 102, 204, 0.18);
}
[data-shop-skin="eshop-02"] .underline {
  text-decoration-color: #1266cc;
}

/* ── Slevové badge → oranžový akcent šablony ── */
[data-shop-skin="eshop-02"] .bg-\\[\\#ef4444\\] {
  background-color: #f0803c !important;
}
`;

const ESHOP_03_CSS = `
/* eshop-03 "Pohodář" — Shoptet Disco DNA: bílé plátno, čerň #000, žlutá
   #FFC500 na akcích (černý text), Nunito, radius 0, flat. */
[data-shop-skin="eshop-03"] {
  font-family: 'Nunito', 'Segoe UI', Arial, sans-serif;
}
[data-shop-skin="eshop-03"] button,
[data-shop-skin="eshop-03"] input,
[data-shop-skin="eshop-03"] select,
[data-shop-skin="eshop-03"] textarea {
  font-family: inherit;
}

/* ── PDP: Disco poměr — galerie ~45 %, širší info sloupec s buy boxem ── */
@media (min-width: 1024px) {
  [data-shop-skin="eshop-03"] div[class*="minmax(360px,440px)"] {
    grid-template-columns: minmax(0, 45fr) minmax(0, 55fr) !important;
  }
}

/* ── Kontejner: listing/PDP mají sdílený max-w 1400px — Disco drží 1280px
   jako homepage sekce ── */
[data-shop-skin="eshop-03"] .max-w-\\[1400px\\] {
  max-width: 1280px !important;
}

/* ── Disco je hranaté: radius 0 (kruhové badge zůstávají) ── */
[data-shop-skin="eshop-03"] .rounded,
[data-shop-skin="eshop-03"] .rounded-md,
[data-shop-skin="eshop-03"] .rounded-lg,
[data-shop-skin="eshop-03"] .rounded-xl,
[data-shop-skin="eshop-03"] .rounded-2xl,
[data-shop-skin="eshop-03"] .rounded-3xl {
  border-radius: 0 !important;
}

/* ── Tmavé prvky zůstávají černé (Disco primary = #000); žlutá patří jen
   konverzním tlačítkům ── */
[data-shop-skin="eshop-03"] button.bg-neutral-950,
[data-shop-skin="eshop-03"] button.bg-neutral-900,
[data-shop-skin="eshop-03"] a.bg-neutral-950,
[data-shop-skin="eshop-03"] a.bg-neutral-900 {
  background-color: #FFC500 !important;
  color: #000 !important;
}
[data-shop-skin="eshop-03"] button.bg-neutral-950 *,
[data-shop-skin="eshop-03"] button.bg-neutral-900 *,
[data-shop-skin="eshop-03"] a.bg-neutral-950 *,
[data-shop-skin="eshop-03"] a.bg-neutral-900 * {
  color: #000 !important;
}
[data-shop-skin="eshop-03"] button.hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-03"] button.hover\\:bg-neutral-800:hover,
[data-shop-skin="eshop-03"] a.hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-03"] a.hover\\:bg-neutral-800:hover {
  background-color: #e6b200 !important;
  color: #000 !important;
}
/* outline tlačítka (kupón, poznámka) — hover z černé výplně na žlutou */
[data-shop-skin="eshop-03"] button.hover\\:bg-neutral-900:hover,
[data-shop-skin="eshop-03"] a.hover\\:bg-neutral-900:hover {
  background-color: #FFC500 !important;
  color: #000 !important;
  border-color: #FFC500 !important;
}

[data-shop-skin="eshop-03"] .from-\\[\\#26b854\\] {
  background: #FFC500 !important;
  color: #000 !important;
  box-shadow: none !important;
}
[data-shop-skin="eshop-03"] .from-\\[\\#26b854\\]:hover {
  background: #e6b200 !important;
}
[data-shop-skin="eshop-03"] .ring-neutral-900 {
  --tw-ring-color: #FFC500 !important;
}

/* ── Texty: Disco čerň a šedé ── */
[data-shop-skin="eshop-03"] .text-neutral-950,
[data-shop-skin="eshop-03"] .text-neutral-900 {
  color: #000 !important;
}
[data-shop-skin="eshop-03"] .text-neutral-800,
[data-shop-skin="eshop-03"] .text-neutral-700 {
  color: #1f1f1f !important;
}
[data-shop-skin="eshop-03"] .text-neutral-600,
[data-shop-skin="eshop-03"] .text-neutral-500 {
  color: #767676 !important;
}
[data-shop-skin="eshop-03"] .text-neutral-400 {
  color: #999 !important;
}
[data-shop-skin="eshop-03"] .hover\\:text-neutral-950:hover,
[data-shop-skin="eshop-03"] .hover\\:text-neutral-900:hover,
[data-shop-skin="eshop-03"] .hover\\:text-neutral-800:hover,
[data-shop-skin="eshop-03"] .hover\\:text-neutral-700:hover {
  color: #b58a00 !important;
}

/* ── Plochy a rámečky: Disco light gray ── */
[data-shop-skin="eshop-03"] .bg-neutral-50,
[data-shop-skin="eshop-03"] .bg-neutral-100 {
  background-color: #f6f6f6 !important;
}
[data-shop-skin="eshop-03"] .bg-neutral-200 {
  background-color: #e6e6e6 !important;
}
[data-shop-skin="eshop-03"] .hover\\:bg-neutral-50:hover,
[data-shop-skin="eshop-03"] .hover\\:bg-neutral-100:hover {
  background-color: #efefef !important;
}
[data-shop-skin="eshop-03"] .hover\\:bg-neutral-200:hover {
  background-color: #e0e0e0 !important;
}
[data-shop-skin="eshop-03"] .border-neutral-100,
[data-shop-skin="eshop-03"] .border-neutral-200,
[data-shop-skin="eshop-03"] .border-neutral-300 {
  border-color: #e6e6e6 !important;
}
[data-shop-skin="eshop-03"] .hover\\:border-neutral-300:hover,
[data-shop-skin="eshop-03"] .hover\\:border-neutral-400:hover {
  border-color: #000 !important;
}
[data-shop-skin="eshop-03"] .divide-neutral-100 > :not([hidden]) ~ :not([hidden]),
[data-shop-skin="eshop-03"] .divide-neutral-200 > :not([hidden]) ~ :not([hidden]) {
  border-color: #e6e6e6 !important;
}

/* ── Karty produktů: Disco flat shadow hover ── */
[data-shop-skin="eshop-03"] a[href*="/obchod/"].group,
[data-shop-skin="eshop-03"] .group\\/card {
  transition: box-shadow .2s;
}
[data-shop-skin="eshop-03"] a[href*="/obchod/"].group:hover,
[data-shop-skin="eshop-03"] .group\\/card:hover {
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.16);
}

/* ── Skladem/úspěch: Disco zelená ── */
[data-shop-skin="eshop-03"] .text-emerald-600,
[data-shop-skin="eshop-03"] .text-emerald-700 {
  color: #3a800e !important;
}
[data-shop-skin="eshop-03"] .bg-emerald-500,
[data-shop-skin="eshop-03"] .bg-emerald-600 {
  background-color: #3a800e !important;
}

/* ── Akcenty: focus, výběry, odkazy ── */
[data-shop-skin="eshop-03"] input:focus,
[data-shop-skin="eshop-03"] select:focus,
[data-shop-skin="eshop-03"] textarea:focus {
  border-color: #FFC500 !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.16) !important;
  outline: none;
}
[data-shop-skin="eshop-03"] ::selection {
  background: rgba(255, 197, 0, 0.4);
}
[data-shop-skin="eshop-03"] .underline {
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

/* ── Slevové badge → Disco červená ── */
[data-shop-skin="eshop-03"] .bg-\\[\\#ef4444\\] {
  background-color: #d00000 !important;
}
`;


const ESHOP_04_CSS = `
/* eshop-04 "Pastelka" — Shoptet Samba DNA: bílé plátno, periwinkle #6883ba,
   lososová #fdbcb4 akcent, Raleway, radius 8-12, měkké stíny. */
[data-shop-skin="eshop-04"] {
  font-family: 'Raleway', 'Segoe UI', Arial, sans-serif;
}
[data-shop-skin="eshop-04"] button,
[data-shop-skin="eshop-04"] input,
[data-shop-skin="eshop-04"] select,
[data-shop-skin="eshop-04"] textarea {
  font-family: inherit;
}

/* ── Kontejner: 1280px jako homepage ── */
[data-shop-skin="eshop-04"] .max-w-\\[1400px\\] {
  max-width: 1280px !important;
}

/* ── PDP: galerie ~45 % / širší info sloupec s buy boxem (Samba poměr) ── */
@media (min-width: 1024px) {
  [data-shop-skin="eshop-04"] div[class*="minmax(360px,440px)"] {
    grid-template-columns: minmax(0, 45fr) minmax(0, 55fr) !important;
  }
}

/* ── Tmavá tlačítka → periwinkle ── */
[data-shop-skin="eshop-04"] button.bg-neutral-950,
[data-shop-skin="eshop-04"] button.bg-neutral-900,
[data-shop-skin="eshop-04"] a.bg-neutral-950,
[data-shop-skin="eshop-04"] a.bg-neutral-900 {
  background-color: #6883ba !important;
  color: #fff !important;
}
[data-shop-skin="eshop-04"] button.hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-04"] button.hover\\:bg-neutral-800:hover,
[data-shop-skin="eshop-04"] a.hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-04"] a.hover\\:bg-neutral-800:hover {
  background-color: #566fa3 !important;
  color: #fff !important;
}
[data-shop-skin="eshop-04"] button.hover\\:bg-neutral-900:hover,
[data-shop-skin="eshop-04"] a.hover\\:bg-neutral-900:hover {
  background-color: #6883ba !important;
  color: #fff !important;
  border-color: #6883ba !important;
}
[data-shop-skin="eshop-04"] .border-neutral-950,
[data-shop-skin="eshop-04"] .border-neutral-900 {
  border-color: #6883ba !important;
}
[data-shop-skin="eshop-04"] .ring-neutral-900 {
  --tw-ring-color: #6883ba !important;
}

/* ── Konverzní CTA (zelený gradient) → periwinkle ── */
[data-shop-skin="eshop-04"] .from-\\[\\#26b854\\] {
  background: #6883ba !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(104,131,186,0.35) !important;
}
[data-shop-skin="eshop-04"] .from-\\[\\#26b854\\]:hover {
  background: #566fa3 !important;
}

/* ── Texty a hovery ── */
[data-shop-skin="eshop-04"] .text-neutral-950,
[data-shop-skin="eshop-04"] .text-neutral-900 {
  color: #161616 !important;
}
[data-shop-skin="eshop-04"] .hover\\:text-neutral-950:hover,
[data-shop-skin="eshop-04"] .hover\\:text-neutral-900:hover,
[data-shop-skin="eshop-04"] .hover\\:text-neutral-800:hover,
[data-shop-skin="eshop-04"] .hover\\:text-neutral-700:hover {
  color: #6883ba !important;
}

/* ── Plochy a rámečky ── */
[data-shop-skin="eshop-04"] .bg-neutral-50,
[data-shop-skin="eshop-04"] .bg-neutral-100 {
  background-color: #f9f9f9 !important;
}
[data-shop-skin="eshop-04"] .border-neutral-100,
[data-shop-skin="eshop-04"] .border-neutral-200,
[data-shop-skin="eshop-04"] .border-neutral-300 {
  border-color: #e8e8e8 !important;
}
[data-shop-skin="eshop-04"] .hover\\:border-neutral-300:hover,
[data-shop-skin="eshop-04"] .hover\\:border-neutral-400:hover {
  border-color: #6883ba !important;
}

/* ── Kategorie: Samba má plochý nadpis + perex, žádný foto-banner ── */
[data-shop-skin="eshop-04"] header.bg-neutral-950 {
  background: #fff !important;
  border-radius: 0 !important;
}
[data-shop-skin="eshop-04"] header.bg-neutral-950 > img,
[data-shop-skin="eshop-04"] header.bg-neutral-950 > div.absolute {
  display: none !important;
}
[data-shop-skin="eshop-04"] header.bg-neutral-950 h1 {
  color: #161616 !important;
}
[data-shop-skin="eshop-04"] header.bg-neutral-950 p {
  color: #6f6f6f !important;
}
[data-shop-skin="eshop-04"] header.bg-neutral-950 > div.relative {
  padding: 4px 0 10px !important;
}

/* ── Subkategorie dlaždice bez orámování (Samba čistota) ── */
[data-shop-skin="eshop-04"] a.rounded-2xl.border-neutral-100 {
  border-color: transparent !important;
  background: #f9f9f9 !important;
}
[data-shop-skin="eshop-04"] a.rounded-2xl.border-neutral-100:hover {
  border-color: transparent !important;
  background: #f1f1f1 !important;
}

/* ── Akcenty ── */
[data-shop-skin="eshop-04"] input:focus,
[data-shop-skin="eshop-04"] select:focus,
[data-shop-skin="eshop-04"] textarea:focus {
  border-color: #6883ba !important;
  box-shadow: 0 0 0 3px rgba(104,131,186,0.14) !important;
  outline: none;
}
[data-shop-skin="eshop-04"] ::selection {
  background: rgba(253,188,180,0.5);
}
[data-shop-skin="eshop-04"] .bg-\\[\\#ef4444\\] {
  background-color: #fdbcb4 !important;
  color: #161616 !important;
}
`;

const ESHOP_05_CSS = `
/* eshop-05 "Hračkolandia" — Pompo.cz DNA: melounová #ff3b5c, navy #0e1b2c,
   žlutá #ffc233, zelená dostupnost #12b76a, Nunito Sans, radius 8-10px. */
[data-shop-skin="eshop-05"] {
  font-family: 'Nunito Sans', 'Segoe UI', Arial, sans-serif;
  color: #0e1b2c;
}
[data-shop-skin="eshop-05"] button,
[data-shop-skin="eshop-05"] input,
[data-shop-skin="eshop-05"] select,
[data-shop-skin="eshop-05"] textarea {
  font-family: inherit;
}
[data-shop-skin="eshop-05"] h1,
[data-shop-skin="eshop-05"] h2,
[data-shop-skin="eshop-05"] h3,
[data-shop-skin="eshop-05"] h4,
[data-shop-skin="eshop-05"] .font-serif {
  font-family: 'Nunito Sans', 'Segoe UI', Arial, sans-serif !important;
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* ── Primární akce a tmavé bloky: monochrom čerň → melounová ── */
[data-shop-skin="eshop-05"] .bg-neutral-950,
[data-shop-skin="eshop-05"] .bg-neutral-900 {
  background-color: #ff3b5c !important;
}
[data-shop-skin="eshop-05"] .hover\\:bg-neutral-800:hover,
[data-shop-skin="eshop-05"] .hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-05"] .hover\\:bg-neutral-900:hover,
[data-shop-skin="eshop-05"] .hover\\:bg-neutral-950:hover {
  background-color: #e62b4c !important;
}
[data-shop-skin="eshop-05"] .bg-neutral-800 {
  background-color: #e62b4c !important;
}
[data-shop-skin="eshop-05"] .border-neutral-950,
[data-shop-skin="eshop-05"] .border-neutral-900 {
  border-color: #ff3b5c !important;
}
[data-shop-skin="eshop-05"] .hover\\:border-neutral-950:hover,
[data-shop-skin="eshop-05"] .hover\\:border-neutral-900:hover {
  border-color: #ff3b5c !important;
}
[data-shop-skin="eshop-05"] .ring-neutral-900 {
  --tw-ring-color: #ff3b5c !important;
}

/* ── Texty: čerň → navy, šedé → slate ── */
[data-shop-skin="eshop-05"] .text-neutral-950,
[data-shop-skin="eshop-05"] .text-neutral-900 {
  color: #0e1b2c !important;
}
[data-shop-skin="eshop-05"] .text-neutral-800,
[data-shop-skin="eshop-05"] .text-neutral-700 {
  color: #22344a !important;
}
[data-shop-skin="eshop-05"] .text-neutral-600,
[data-shop-skin="eshop-05"] .text-neutral-500 {
  color: #64748b !important;
}
[data-shop-skin="eshop-05"] .hover\\:text-neutral-950:hover,
[data-shop-skin="eshop-05"] .hover\\:text-neutral-900:hover {
  color: #ff3b5c !important;
}

/* ── Plochy: neutral šedé → chladná surface ── */
[data-shop-skin="eshop-05"] .bg-neutral-50 {
  background-color: #f8fafc !important;
}
[data-shop-skin="eshop-05"] .bg-neutral-100 {
  background-color: #f2f4f7 !important;
}
[data-shop-skin="eshop-05"] .border-neutral-200,
[data-shop-skin="eshop-05"] .border-neutral-300 {
  border-color: #e7eaee !important;
}

/* ── Zaoblení: měkčí hračkářský vzhled ── */
[data-shop-skin="eshop-05"] .rounded-md { border-radius: 8px !important; }
[data-shop-skin="eshop-05"] .rounded-lg { border-radius: 10px !important; }
[data-shop-skin="eshop-05"] .rounded-xl { border-radius: 14px !important; }

/* ── Formuláře: focus melounová ── */
[data-shop-skin="eshop-05"] input:focus,
[data-shop-skin="eshop-05"] select:focus,
[data-shop-skin="eshop-05"] textarea:focus {
  border-color: #ff3b5c !important;
  box-shadow: 0 0 0 3px rgba(255,59,92,0.13) !important;
  outline: none;
}
[data-shop-skin="eshop-05"] ::selection {
  background: rgba(255,194,51,0.45);
}

/* ── Slevové badge a ceny ── */
[data-shop-skin="eshop-05"] .bg-\\[\\#ef4444\\] {
  background-color: #ff3b5c !important;
}
[data-shop-skin="eshop-05"] .text-red-600,
[data-shop-skin="eshop-05"] .text-red-500 {
  color: #ff3b5c !important;
}

/* ── Dostupnost: zelená značky ── */
[data-shop-skin="eshop-05"] .text-green-600,
[data-shop-skin="eshop-05"] .text-emerald-600 {
  color: #12b76a !important;
}

/* ── PDP galerie (pompo): širší sloupec obrázku + náhledy vlevo ── */
@media (min-width: 1024px) {
  [data-shop-skin="eshop-05"] div[class*="minmax(360px,440px)"] {
    grid-template-columns: minmax(0, 55fr) minmax(0, 45fr) !important;
  }
}
[data-shop-skin="eshop-05"] div:has(> div > .pg-thumb) {
  display: grid !important;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
[data-shop-skin="eshop-05"] div:has(> div > .pg-thumb) > div:first-child {
  grid-column: 2;
  grid-row: 1;
}
[data-shop-skin="eshop-05"] div:has(> .pg-thumb) {
  grid-column: 1 !important;
  grid-row: 1;
  flex-direction: column !important;
  margin-top: 0 !important;
  overflow-x: visible !important;
  overflow-y: auto;
  max-height: 560px;
}
[data-shop-skin="eshop-05"] .pg-thumb {
  width: 78px !important;
  height: 78px !important;
  flex-shrink: 0;
}

/* ── Košík + pokladna: melounové ovládací prvky ── */
[data-shop-skin="eshop-05"] input[type="radio"],
[data-shop-skin="eshop-05"] input[type="checkbox"] {
  accent-color: #ff3b5c;
}

/* ── Toast "přidáno do košíku" skryt — eshop-05 má vlastní cart drawer ── */
[data-shop-skin="eshop-05"] .wc-toast-enter,
[data-shop-skin="eshop-05"] .wc-toast-exit {
  display: none !important;
}
`;


const ESHOP_06_CSS = `
/* eshop-06 "Ořeškárna" — svetplodu DNA: charcoal #1d1d1b, zelená #21a95c,
   žlutá #f6c500, růžové slevy #f8cede, Archivo headings + Figtree body. */
[data-shop-skin="eshop-06"] {
  font-family: 'Figtree', 'Segoe UI', Arial, sans-serif;
  color: #1d1d1b;
}
[data-shop-skin="eshop-06"] button,
[data-shop-skin="eshop-06"] input,
[data-shop-skin="eshop-06"] select,
[data-shop-skin="eshop-06"] textarea {
  font-family: inherit;
}
[data-shop-skin="eshop-06"] h1,
[data-shop-skin="eshop-06"] h2,
[data-shop-skin="eshop-06"] h3,
[data-shop-skin="eshop-06"] h4,
[data-shop-skin="eshop-06"] .font-serif {
  font-family: 'Archivo', 'Helvetica Neue', Arial, sans-serif !important;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* ── Primární akce: čerň zůstává charcoal, CTA košíku zelené ── */
[data-shop-skin="eshop-06"] .bg-neutral-950,
[data-shop-skin="eshop-06"] .bg-neutral-900 {
  background-color: #1d1d1b !important;
}
[data-shop-skin="eshop-06"] .hover\\:bg-neutral-800:hover,
[data-shop-skin="eshop-06"] .hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-06"] .hover\\:bg-neutral-900:hover,
[data-shop-skin="eshop-06"] .hover\\:bg-neutral-950:hover {
  background-color: #000 !important;
}
[data-shop-skin="eshop-06"] .text-neutral-600,
[data-shop-skin="eshop-06"] .text-neutral-500 {
  color: #7a776f !important;
}
[data-shop-skin="eshop-06"] .hover\\:text-neutral-950:hover,
[data-shop-skin="eshop-06"] .hover\\:text-neutral-900:hover {
  color: #188a49 !important;
}

/* ── Plochy a bordery: teplé odstíny ── */
[data-shop-skin="eshop-06"] .bg-neutral-50 { background-color: #faf9f6 !important; }
[data-shop-skin="eshop-06"] .bg-neutral-100 { background-color: #f5f5f2 !important; }
[data-shop-skin="eshop-06"] .border-neutral-200,
[data-shop-skin="eshop-06"] .border-neutral-300 { border-color: #eceae6 !important; }

/* ── Zaoblení ── */
[data-shop-skin="eshop-06"] .rounded-md { border-radius: 10px !important; }
[data-shop-skin="eshop-06"] .rounded-lg { border-radius: 12px !important; }
[data-shop-skin="eshop-06"] .rounded-xl { border-radius: 14px !important; }

/* ── Formuláře ── */
[data-shop-skin="eshop-06"] input:focus,
[data-shop-skin="eshop-06"] select:focus,
[data-shop-skin="eshop-06"] textarea:focus {
  border-color: #1d1d1b !important;
  box-shadow: 0 0 0 3px rgba(29,29,27,0.08) !important;
  outline: none;
}
[data-shop-skin="eshop-06"] ::selection { background: rgba(246,197,0,0.45); }

/* ── Slevy: růžová badge, ceny charcoal ── */
[data-shop-skin="eshop-06"] .bg-\\[\\#ef4444\\] {
  background-color: #f8cede !important;
  color: #1d1d1b !important;
}
[data-shop-skin="eshop-06"] .text-red-600,
[data-shop-skin="eshop-06"] .text-red-500 { color: #1d1d1b !important; }

/* ── Dostupnost + košíkové CTA: zelená ── */
[data-shop-skin="eshop-06"] .text-green-600,
[data-shop-skin="eshop-06"] .text-emerald-600 { color: #21a95c !important; }
[data-shop-skin="eshop-06"] input[type="radio"],
[data-shop-skin="eshop-06"] input[type="checkbox"] { accent-color: #21a95c; }

/* ── Toast skryt — eshop-06 má vlastní cart drawer ── */
[data-shop-skin="eshop-06"] .wc-toast-enter,
[data-shop-skin="eshop-06"] .wc-toast-exit { display: none !important; }
`;


/* eshop-07 "Néroli parfumerie" — kosmetika-zdravi.cz DNA: ink #16161d,
   tyrkys #14a99a (skladem, akcenty), růžová #e84393 (slevové ceny),
   mint badge, Hanken Grotesk všude. */
const ESHOP_07_CSS = `
[data-shop-skin="eshop-07"] {
  font-family: 'Hanken Grotesk', 'Segoe UI', Arial, sans-serif;
}
[data-shop-skin="eshop-07"] button,
[data-shop-skin="eshop-07"] input,
[data-shop-skin="eshop-07"] select,
[data-shop-skin="eshop-07"] textarea {
  font-family: 'Hanken Grotesk', 'Segoe UI', Arial, sans-serif;
}
[data-shop-skin="eshop-07"] h1,
[data-shop-skin="eshop-07"] h2,
[data-shop-skin="eshop-07"] h3,
[data-shop-skin="eshop-07"] h4 {
  font-family: 'Hanken Grotesk', 'Segoe UI', Arial, sans-serif;
  letter-spacing: -0.01em;
}
[data-shop-skin="eshop-07"] ::selection { background: rgba(31,191,174,0.3); }

/* ── Nákupní CTA: tyrkys (kosmetika-zdravi „Vložit do košíku") ── */
[data-shop-skin="eshop-07"] .bg-neutral-950,
[data-shop-skin="eshop-07"] .bg-neutral-900 { background-color: #1fbfae !important; }
[data-shop-skin="eshop-07"] .hover\\:bg-neutral-800:hover,
[data-shop-skin="eshop-07"] .hover\\:bg-neutral-700:hover { background-color: #14a99a !important; }

/* ── Slevy: růžové ceny, mint badge ── */
[data-shop-skin="eshop-07"] .bg-\\[\\#ef4444\\] {
  background-color: #d9f3ee !important;
  color: #16161d !important;
}
[data-shop-skin="eshop-07"] .text-red-600,
[data-shop-skin="eshop-07"] .text-red-500 { color: #e84393 !important; }

/* ── Dostupnost + formulářové akcenty: tyrkys ── */
[data-shop-skin="eshop-07"] .text-green-600,
[data-shop-skin="eshop-07"] .text-emerald-600 { color: #14a99a !important; }
[data-shop-skin="eshop-07"] input[type="radio"],
[data-shop-skin="eshop-07"] input[type="checkbox"] { accent-color: #16161d; }

/* ── AddToCart: tyrkys místo zeleného gradientu ── */
[data-shop-skin="eshop-07"] button.bg-gradient-to-b,
[data-shop-skin="eshop-07"] a.bg-gradient-to-b {
  background-image: none !important;
  background-color: #1fbfae !important;
  box-shadow: 0 2px 10px rgba(31,191,174,0.3) !important;
}
[data-shop-skin="eshop-07"] button.bg-gradient-to-b:hover,
[data-shop-skin="eshop-07"] a.bg-gradient-to-b:hover { background-color: #14a99a !important; }

/* ── Galerie: aktivní náhled ink místo modré ── */
[data-shop-skin="eshop-07"] .pg-thumb:hover,
[data-shop-skin="eshop-07"] .pg-thumb[data-active] { border-color: #16161d !important; }

/* ── Related products: ceny ink ── */
[data-shop-skin="eshop-07"] .rp-price { color: #16161d !important; }

/* ── Toast skryt — eshop-07 má vlastní cart drawer ── */
[data-shop-skin="eshop-07"] .wc-toast-enter,
[data-shop-skin="eshop-07"] .wc-toast-exit { display: none !important; }
`;


/* eshop-08 "Domea" — bonami.cz DNA: DM Sans, ink #2b2b2b, zelená #3d9a50,
   červená #d64541 slevy, pill radius, světlé #f4f4f2 plochy. */
const ESHOP_08_CSS = `
[data-shop-skin="eshop-08"] {
  font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif;
  color: #2b2b2b;
}
[data-shop-skin="eshop-08"] button,
[data-shop-skin="eshop-08"] input,
[data-shop-skin="eshop-08"] select,
[data-shop-skin="eshop-08"] textarea { font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif; }

/* ── Tmavé CTA → Domea zelená, pill ── */
[data-shop-skin="eshop-08"] .bg-neutral-900,
[data-shop-skin="eshop-08"] .bg-black { background-color: #3d9a50 !important; border-radius: 999px !important; }
[data-shop-skin="eshop-08"] .hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-08"] .hover\\:bg-neutral-800:hover { background-color: #2f7d3f !important; }
[data-shop-skin="eshop-08"] .text-neutral-900 { color: #2b2b2b !important; }
[data-shop-skin="eshop-08"] .border-neutral-200 { border-color: #e6e6e3 !important; }
[data-shop-skin="eshop-08"] .bg-neutral-50,
[data-shop-skin="eshop-08"] .bg-neutral-100 { background-color: #f4f4f2 !important; }

/* ── Slevy červeně, dostupnost zeleně ── */
[data-shop-skin="eshop-08"] .text-red-600,
[data-shop-skin="eshop-08"] .text-red-500 { color: #d64541 !important; }
[data-shop-skin="eshop-08"] .bg-\\[\\#ef4444\\] { background-color: #d64541 !important; border-radius: 999px !important; }
[data-shop-skin="eshop-08"] .text-green-600,
[data-shop-skin="eshop-08"] .text-emerald-600 { color: #3d9a50 !important; }
[data-shop-skin="eshop-08"] input[type="radio"],
[data-shop-skin="eshop-08"] input[type="checkbox"] { accent-color: #3d9a50; }

/* ── Toast skryt — eshop-08 má vlastní cart drawer ── */
[data-shop-skin="eshop-08"] .wc-toast-enter,
[data-shop-skin="eshop-08"] .wc-toast-exit { display: none !important; }
`;


const ESHOP_14_CSS = `
/* eshop-14 "Zahradia" — mountfield/marimex DNA: smaragd #1f7a4e, grafit #30363b,
   terakota #d96f32, Poppins, hranaté rohy 4px. */
[data-shop-skin="eshop-14"] {
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
}
[data-shop-skin="eshop-14"] button,
[data-shop-skin="eshop-14"] input,
[data-shop-skin="eshop-14"] select,
[data-shop-skin="eshop-14"] textarea {
  font-family: inherit;
}

/* ── Primární akce a tmavé bloky: monochrom čerň → smaragd ── */
[data-shop-skin="eshop-14"] .bg-neutral-950,
[data-shop-skin="eshop-14"] .bg-neutral-900 {
  background-color: #1f7a4e !important;
}
[data-shop-skin="eshop-14"] .hover\\:bg-neutral-800:hover,
[data-shop-skin="eshop-14"] .hover\\:bg-neutral-700:hover,
[data-shop-skin="eshop-14"] .hover\\:bg-neutral-900:hover,
[data-shop-skin="eshop-14"] .hover\\:bg-neutral-950:hover {
  background-color: #175e3c !important;
}
[data-shop-skin="eshop-14"] .bg-neutral-800 {
  background-color: #175e3c !important;
}
[data-shop-skin="eshop-14"] .border-neutral-950,
[data-shop-skin="eshop-14"] .border-neutral-900 {
  border-color: #1f7a4e !important;
}
[data-shop-skin="eshop-14"] .hover\\:border-neutral-950:hover {
  border-color: #1f7a4e !important;
}
[data-shop-skin="eshop-14"] .ring-neutral-900 {
  --tw-ring-color: #1f7a4e !important;
}

/* ── Texty: čerň → grafit ── */
[data-shop-skin="eshop-14"] .text-neutral-950,
[data-shop-skin="eshop-14"] .text-neutral-900 {
  color: #30363b !important;
}
[data-shop-skin="eshop-14"] .text-neutral-800,
[data-shop-skin="eshop-14"] .text-neutral-700 {
  color: #43484d !important;
}
[data-shop-skin="eshop-14"] .text-neutral-600,
[data-shop-skin="eshop-14"] .text-neutral-500 {
  color: #7a8187 !important;
}

/* ── Slevy terakotově, dostupnost smaragdově ── */
[data-shop-skin="eshop-14"] .text-red-600,
[data-shop-skin="eshop-14"] .text-red-500 { color: #d96f32 !important; }
[data-shop-skin="eshop-14"] .text-green-600,
[data-shop-skin="eshop-14"] .text-emerald-600 { color: #259455 !important; }
[data-shop-skin="eshop-14"] input[type="radio"],
[data-shop-skin="eshop-14"] input[type="checkbox"] { accent-color: #1f7a4e; }
`;

export function getShopSkinCss(templateKey: string | null | undefined): string | null {
  if (templateKey === "eshop-02") return ESHOP_02_CSS;
  if (templateKey === "eshop-03") return ESHOP_03_CSS;
  if (templateKey === "eshop-04") return ESHOP_04_CSS;
  if (templateKey === "eshop-05") return ESHOP_05_CSS;
  if (templateKey === "eshop-06") return ESHOP_06_CSS;
  if (templateKey === "eshop-07") return ESHOP_07_CSS;
  if (templateKey === "eshop-08") return ESHOP_08_CSS;
  if (templateKey === "eshop-14") return ESHOP_14_CSS;
  return null;
}
