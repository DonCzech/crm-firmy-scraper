# VENOM SAAS — DEVLOG

---

## Šablona 1: The Fade Room (fade-room-demo) — 2026-05-09

### Zdroj
- Originál: Barbershop Urban (MODX CMS, Praha)
- Scraping: `scripts/cleanup-clone.mjs`
- Demo slug: `fade-room-demo`

### Co bylo uděláno

**Fáze 1 — Scraping a cleanup**
- Staženo 7 stránek: home, sluzby, o-nas, akce, cenik, faq, galerie
- Uloženy do DB jako `full-page-clone` sections
- CSS: `styles.min.css` (163KB), JS: jQuery + ai8d-1.js + common.js

**Fáze 2 — Personalizace textů**
- Nahrazeny všechny reference na "Barbershop Urban" → "The Fade Room"
- Adresa: Korunní 47, Praha 2, 120 00
- Telefon: +420 702 456 789
- Instagram: @thefaderoom
- Otevírací doba: Po-Pá 9-20, So 9-18, Ne 10-16
- Copyright: The Fade Room 2025
- FAQ: přepsáno pro novou firmu

**Fáze 3 — Logo**
- SVG logo generováno: `public/clones/fade-room/theme/img/logo.svg`
- Gold gradient (#c9a96e → #a07840), scissors icon, Georgia serif font

**Fáze 4 — AI obrázky (gpt-image-1)**
- 20 obrázků vygenerováno: hero (desktop+mobile), gallery (8ks), thumbs (8ks), promo (2ks)
- Uloženy do `public/clones/fade-room/img/`
- Komprimováno přes sharp: 43,696KB → 2,383KB (95% redukce)

**Fáze 5 — CSS override pro zobrazení**
Klíčový problém: MODX smooth-scroll container blokuje obsah.

```css
body{overflow:auto!important;visibility:visible!important}
.xm1zu,.xrogr{display:none!important}
#vda40,.xdbjw{position:static!important;transform:none!important;will-change:auto!important}
```

**Fáze 6 — Nav cleanup**
- Odstraněny: BLOG, jazykový switcher (vlajky CZ/UK/EN/RU)
- Opraveno: `href="cz/#footer"` → `href="#footer"` pro Kontakty

**Fáze 7 — JS oprava**
- Odstraněny duplicitní `<script>` tagy z HTML (dangerouslySetInnerHTML je ignoroval)
- jsUrls pořadí: jQuery → ai8d-1.js → common.js

**Fáze 8 — Chybějící assets**
- Vytvořeny: `plus.svg`, `minus.svg` pro FAQ accordion

**Fáze 9 — Deploy**
- Produkce: https://venom-saas.vercel.app
- Demo URL: https://venom-saas.vercel.app/demo/fade-room-demo

### Naučené chyby (pro další šablony)

| Problém | Symptom | Řešení |
|---------|---------|--------|
| Fixed scroll container | Černá obrazovka pod headerem | CSS override: `#vda40{position:static!important}` |
| Hero height:0 na mobilu | Hero sekce neviditelná na mobilu | CSS: `.xn25c.xroiu{min-height:100svh}` + media queries |
| Duplicitní script tagy | jQuery undefined errors | Odstranit `<script>` z HTML kde jsou v jsUrls |
| Preloader spinner | Obsah skrytý | CSS: `.xm1zu,.xrogr{display:none!important}` |
| Nav dead links | Blog/kontakty 404 | Odstranit BLOG, opravit KONTAKTY na `#footer` |
| outputFileTracingRoot | Vercel build selhání | Podmíněné nastavení (ne hardcoded lokální cesta) |
| vercel.json cron | Deploy error na Hobby | schedule min 1x/den: `"0 8 * * *"` |
| Non-render-blocking CSS | FOUC (nestylovaná stránka) | Nepoužívat print trick — ponechat `precedence="default"` |
| Chybějící SVG ikony | "plus" text místo ikony | Vygenerovat SVG manuálně |

### PageSpeed výsledky (dev server)
- Performance: 48/100 (limitováno jQuery 89KB + velký CSS)
- SEO: 100/100 ✅
- Best Practices: 96/100 ✅
- LCP: 9.1s (dev, na produkci lepší)

---

## Šablona 2: [příště]

<!-- Přidat záznam po dokončení další šablony -->
