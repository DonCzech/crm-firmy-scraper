# VENOM — Execution Log & Template Pipeline
Aktualizováno: 2026-05-19 (14:30)

---

# ABSOLUTNÍ PRAVIDLA (platí pro KAŽDOU šablonu, bez výjimky)

## CRITICAL EXECUTION MODE
1. Každý krok = dokončit + ověřit + zapsat do logu → teprve pak další
2. NESMÍ se přeskočit žádná fáze
3. STATUS "DONE" = pouze po reálném ověření (screenshot/console/curl), ne odhadem
4. Pokud krok selže → STATUS = FAILED → opravit → znovu ověřit → pak DONE
5. Každá šablona prochází fázemi 0–12 v pořadí, bez výjimky

## ZERO SKIP POLICY — ABSOLUTNÍ ZÁKAZ přeskočit:
- Jakýkoliv TODO checkbox v DEVLOG fázích
- Validaci po každém kroku
- Screenshot ověření desktop + mobile
- Test 0 externích requestů
- Test 0 JS chyb v konzoli
- Test 0 výskytů původního brandu
- SEO meta tagy (noindex pro demo)
- AI generování obrázků (žádné původní fotky)
- Obfuskaci CSS tříd
- Lokalizaci Google Fonts

---

# SEZNAM ŠABLON — PLÁN VÝSTAVBY

## Kategorie: BARBERSHOPY
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 1 | barbershop-buddy.cz | Peak Cut | peak-cut-demo | DONE ✅ |
| 2 | thebarber.cz | The Barber | the-barber-demo | DONE ✅ |
| 3 | barberpraha.online | Barber Praha | barber-praha-demo | DONE ✅ |

## Kategorie: KADEŘNICTVÍ
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 4 | jarkacechova.cz | Studio Jarka | studio-jarka-demo | DONE ✅ |
| 5 | hairsalon-no1.cz | Hair No1 | hairsalon-no1-demo | DONE ✅ |
| 6 | petramechurova.cz | Petra Hair | petramechurova-demo | DONE ✅ |
| 7 | selfbeautystudio.com | Self Beauty | selfbeauty-demo | DONE ✅ |

## Kategorie: MASÁŽE / WELLNESS
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 8 | prahamasaze.com | Praha Masáže | praha-masaze-demo | DONE ✅ |
| 9 | anandaspa.cz | Ananda Spa | ananda-demo | DONE ✅ |
| 10 | tawan.cz | Tawan | tawan-demo | DONE ✅ |
| 11 | escapemassage.cz | Escape Massage | escape-demo | DONE ✅ |

## Kategorie: TETOVACÍ STUDIA
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 12 | tribo.cz | Tribo Tattoo | tribo-demo | DONE ✅ |
| 13 | homietattoo.cz | Homie Tattoo | homie-demo | DONE ✅ |
| 14 | magictattoo.cz | Magic Tattoo | magic-demo | DONE ✅ |

## Kategorie: FITNESS / GYM
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 15 | johnreed.fitness/cz | John Reed | john-reed-demo | SKIP (Next.js/int'l brand) |
| 16 | maxfitness.cz | Max Fitness | max-fitness-demo | SKIP (Next.js/Payload) |
| 17 | fitnessvictory.cz | Fitness Victory | victory-demo | DONE ✅ |
| 18 | lindasikorova.com | Linda Sikorová | linda-demo | DONE ✅ |

## Kategorie: KOSMETICKÉ SALONY
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 19 | yesvisage.cz | Yes Visage | yesvisage-demo | DONE ✅ |
| 20 | bomtonclinic.cz | Bomton Clinic | bomton-demo | DONE ✅ |
| 21 | esthesia.cz | Esthesia | esthesia-demo | DONE ✅ |

## Kategorie: NEHTOVÁ STUDIA
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 22 | maidenstudio.cz | Maiden Studio | maidenstudio-demo | DONE ✅ |
| 23 | celebratesalon.cz | Celebrate Salon | celebrate-demo | DONE ✅ |
| 24 | sohosalon.cz | Soho Salon | soho-demo | DONE ✅ |

## Kategorie: FYZIOTERAPIE
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 25 | fyzioklinika.cz | Fyzio Klinika | fyzio-klinika-demo | SKIP (Vue SPA) |
| 26 | fyziovsem.cz | Fyzio Všem | fyziovsem-demo | DONE ✅ |
| 27 | resetclinic.cz | Reset Clinic | resetclinic-demo | DONE ✅ |

## Kategorie: RESTAURACE
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 28 | ambi.cz | Ambi Bistro | ambi-bistro-demo | DONE ✅ |
| 29 | restauracehybernska.cz | Hibernská | hibernska-demo | DONE ✅ |
| 30 | lacasalatina.cz | La Casa Latina | lacasa-latina-demo | DONE ✅ |
| 31 | cafesavoy.ambi.cz | Café Savoy | cafe-savoy-demo | DONE ✅ |

## Kategorie: KAVÁRNY
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 32 | zrnozrnko.cz | Zrno Zrnko | zrno-zrnko-demo | DONE ✅ |
| 33 | costa-coffee.cz | Costa Coffee | costa-coffee-demo | DONE ✅ |
| 34 | coffeeroom.cz | Coffee Room | coffee-room-demo | DONE ✅ |
| 35 | cathedralcafe.cz | Cathedral Café | cathedral-cafe-demo | DONE ✅ |

## Kategorie: REALITNÍ KANCELÁŘE
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 36 | lexxusnorton.cz | Lexxus Norton | lexxus-norton-demo | DONE ✅ |
| 37 | engelvoelkers.com/cz | Engel & Völkers | engel-volkers-demo | SKIP (Next.js+Storyblok+Didomi, mezinárodní brand, CSS modules) |
| 38 | fermakleri.cz | Fer Makléři | fer-makleri-demo | DONE ✅ |
| 39 | realityskutovi.cz | Reality Skutovi | reality-skutovi-demo | DONE ✅ |
| 40 | quantumreality.cz | Quantum Reality | quantum-reality-demo | DONE ✅ |
| 41 | jansrubar.cz | Jan Šrubař | jan-srubar-demo | DONE ✅ |
| 42 | ondrejkucera.com | Ondřej Kučera | ondrej-kucera-demo | DONE ✅ |

## Kategorie: AUTOSERVISY
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 43 | bestdrive.cz | Best Drive | best-drive-demo | DONE ✅ |
| 44 | autoservis-garant.cz | Autoservis Garant | autoservis-garant-demo | DONE ✅ |
| 45 | autoservistomas.cz | Autoservis Tomáš | autoservis-tomas-demo | DONE ✅ |

## Kategorie: ZUBAŘI
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 46 | magicsmile.cz | Magic Smile | magic-smile-demo | DONE ✅ |
| 47 | usmevneboli.cz | Úsměv Nebolí | usmev-neboli-demo | SKIP (Elementor CSS proměnné vyžadují JS runtime, layout broken) |
| 48 | svetrovnatek.cz | Svět Rovnátek | svet-rovnatek-demo | DONE ✅ |
| 49 | perfect-smile.cz | Perfect Smile | perfect-smile-demo | DONE ✅ |

## Kategorie: ADVOKÁTI
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 50 | havelpartners.cz | Havel Partners | havel-partners-demo | DONE ✅ |
| 51 | rowan.legal | Rowan Legal | rowan-legal-demo | DONE ✅ |
| 52 | prkpartners.com/cs | PRK Partners | prk-partners-demo | TODO |

## Kategorie: ŘEMESLNÍCI
| # | URL | Název klonu | Slug | Status |
|---|-----|-------------|------|--------|
| 53 | obfacility.cz | OB Facility | ob-facility-demo | TODO |

---

# POVINNÝ POSTUP PRO KAŽDOU ŠABLONU (12 FÁZÍ)

## Před začátkem nové šablony:
```
1. Přidat řádek do tabulky šablon výše se STATUS: IN_PROGRESS
2. Vytvořit sekci níže: "## TEMPLATE: [slug]"
3. Projít všechny fáze 0-12 v pořadí
4. Každou fázi zapsat jako DONE teprve po reálném ověření
```

## FÁZE 0 — Analýza originálu
```
□ Otevřít URL v Playwright → screenshot desktop + mobile
□ Zjistit CMS (WordPress/MODX/Next.js/jiný) → z HTTP headers nebo source
□ Zjistit typ: single-page vs multi-page (anchor nav vs URL změna)
□ Vypsat nav strukturu: název a URL každé stránky/sekce
□ Vypsat všechny externí CSS zdroje
□ Vypsat všechny externí JS zdroje
□ Vypsat Google Fonts (rodiny + váhy)
□ Vypsat všechny obrázky (hero, galerie, about, kontakt)
□ Zkontrolovat mobilní zobrazení (screenshot 390px)
□ Identifikovat dynamické sekce (Instagram feed, Google Maps, Google Reviews, booking)
□ Sepsat: co lze klonovat staticky vs co je dynamické
VALIDACE: screenshot desktop ověřen vizuálně
```

## FÁZE 1 — Stažení assets (mirror script)
```
□ Vytvořit scripts/mirror-[name]-assets.mjs
□ Stáhnout homepage HTML + zpracovat přes buildHtml():
  □ Extrahovat <body>
  □ Odstranit: GTM, GA, FB Pixel, Smartlook, HotJar, CookieYes, Yandex
  □ Odstranit: Instagram feed sekci (sb_instagram div)
  □ Odstranit: Google Maps API script (nechat div pro static map)
  □ Odstranit: inline tracking skripty
  □ Opravit: všechny src/href na lokální /clones/[name]/...
  □ Přidat: lazy loading na všechny img mimo hero
  □ Přidat: fetchpriority="high" na hero img
  □ Nahradit: brand texty demo texty
  □ Přidat: GALERIE sekci (CSS grid, AI obrázky)
  □ Nahradit: Google Places reviews → statické HTML reviews
□ Stáhnout: všechny CSS soubory (opravit cesty)
□ Stáhnout: jQuery, carousel JS, custom bundle
□ Stáhnout: Google Fonts → lokální woff2, vygenerovat fonts.css
□ Stáhnout: SVG sprite, všechny ikony
□ Stáhnout: VŠECHNY obrázky (budou přepsány AI v fázi 6)
□ Stáhnout: favicon
□ CDN knihovny lokálně (/clones/[name]/cdn/)
VALIDACE: ls -lh public/clones/[name]/ → vidím všechny složky
VALIDACE: /tmp/[name]-home.html existuje
```

## FÁZE 2 — Seed DB
```
□ Vytvořit scripts/seed-[name]-demo.mjs
□ cssUrls: začínat fonts.css, pak theme CSS (POUZE lokální cesty)
□ jsUrls: jquery → jquery-migrate → carousel → bundle (POUZE lokální)
□ Vytvořit tenant: slug=[name]-demo, email=info@demo.local, industry=[kategorie]
□ Vytvořit stránky (1 pro single-page, N pro multi-page)
□ Každá stránka = 1 full-page-clone sekce
VALIDACE: node scripts/seed-[name]-demo.mjs → výpis "=== HOTOVO ===" bez chyb
VALIDACE: curl localhost:3015/demo/[name]-demo → HTTP 200
```

## FÁZE 3 — Obfuskace
```
□ Ověřit: CSS soubory jsou ORIGINÁLNÍ (ne z předchozího run)
□ node scripts/obfuscate-clone.mjs [name] [name]-demo
□ Ověřit output: "Mapping: X tříd, Y ID" (X > 200)
□ Ověřit: slick-* třídy v mapping.classMap: NESMÍ EXISTOVAT (PRESERVE_CLASSES)
□ Ověřit: public/clones/[name]/cdn/slick/slick.css → grep "slick-slider" → nalezeno
VALIDACE: grep "slick-slide" public/clones/[name]/cdn/slick/slick.css → výsledek
VALIDACE: screenshot po obfuskaci → stránka stále vypadá správně
```

## FÁZE 4 — Přejmenování (pokud nutné)
```
□ node scripts/rename-clone.mjs [raw] [final] (pokud se jméno liší)
□ Ověřit: public/clones/[final-name]/ existuje
VALIDACE: HTTP 200 po přejmenování
```

## FÁZE 5 — Cleanup
```
□ Smazat dočasné soubory (/tmp/[name]-home-raw.html)
□ Ověřit: žádné prázdné/prázdné složky v public/clones/[name]/
VALIDACE: du -sh public/clones/[name]/
```

## FÁZE 6 — AI obrázky (Pollinations.ai)
```
□ Vytvořit scripts/generate-[name]-images.mjs
□ Pro KAŽDÝ obrázek definovat:
  □ Prompt specifický pro odvětví
  □ Správné rozměry (hero: 1536x1024, mobile: 768x1152, ostatní: 1024x1024)
  □ B&W nebo color dle stylu originálu
  □ MaxKB limit
□ Spustit: node scripts/generate-[name]-images.mjs
□ Po generování ověřit KAŽDÝ soubor:
  □ ls -lh → soubor existuje a má >20KB (jinak regenerovat)
  □ Playwright screenshot → vizuálně zkontrolovat obrázek
□ PNG > 400KB → převést na jpg, aktualizovat HTML reference
□ Re-run: mirror → seed → obfuscate (obrázky jsou nové)
VALIDACE: screenshot každé sekce s AI obrázky
VALIDACE: žádný původní brand/logo na žádném obrázku (vizuální kontrola)
```

## FÁZE 7 — Demo texty ⚠️ POVINNÉ — každý bod bez výjimky
```
□ LOGO: NIKDY nepoužít původní logo PNG/SVG. VŽDY vytvořit inline SVG logo:
    - Název: tematický (ne originální firma)
    - Podtitulek: odvětví (BARBERSHOP / WELLNESS / ADVOKÁTNÍ KANCELÁŘ...)
    - Label: "DEMO ŠABLONA" (malé písmo, polotransparentní)
    - Styl: barvy odpovídající šabloně, font odpovídající šabloně
□ HERO SUBTITLE: ne původní tagline, ale "Ukázka šablony pro [odvětví]"
□ ABOUT TEXTY: kompletně nahradit demo obsahem ve stylu:
    - 1. odst: "Tato sekce ukazuje, jak může šablona představit příběh a atmosféru studia..."
    - 2. odst: "Zde může podnikatel popsat svůj prostor, filozofii nebo přístup ke klientům..."
□ CENY: přeházet pořadí položek + upravit částky (±10-20% od originálu)
    - Nikdy nekopírovat originální ceník 1:1
    - Popisek pod nadpisem sekce: demo text, ne originální
□ ADRESA: "Demo ulice 12, Praha 2, 120 00" (nebo Demo náměstí, Demo park...)
□ TELEFON: +420 608 288 777
□ EMAIL: info@demo.local
□ OTEVÍRACÍ DOBA: upravit (ne originál) — standard: Po-Pá 09:00-18:00, So 10:00-15:00
□ RECENZE: statické fiktivní (5 hvězdiček, české texty)
□ SOCIÁLNÍ SÍTĚ: href="#" s rel="nofollow" (žádné reálné profily)
□ BOOKING/REZERVACE LINK: href="#rezervace" (žádná reálná booking URL)
□ IČO: smazat pokud přítomno
□ Žádné reálné osobní údaje z originálu
VALIDACE: grep původní brand → 0 výsledků
VALIDACE: grep IČO → 0 výsledků
VALIDACE: grep email originálu → 0 výsledků
VALIDACE: grep "logo.png" nebo originální logo src → 0 výsledků
VALIDACE: vizuální screenshot — žádný text z originálu nesmí být viditelný
```

## FÁZE 8 — Mobilní optimalizace
```
□ Playwright screenshot 390x844 → hero viditelný (ne prázdná obrazovka)
□ Playwright: klik na hamburger → menu se rozbalí
□ Playwright screenshot 390x844 → žádný horizontální scroll
□ Playwright screenshot 390x844 → text čitelný
□ Viewport meta tag přítomen v HTML
VALIDACE: všechny výše + screenshot mobilní verze přečten vizuálně
```

## LIVE EDITOR — povinné pro full-page-clone šablony ⚠️
```
□ SectionRenderer předává isAdmin + sectionId + tenantSlug do ClonedSiteRenderer
□ ClonedSiteRenderer injektuje contentEditable overlay v admin módu
□ Overlay: hover=dashed outline, click=edit, Uložit/Zrušit tlačítka, Ctrl+Enter=uložit, Escape=zrušit
□ Uložení přes PATCH /api/demo/{slug}/sections/{id}
□ TenantEditorView: PageBuilder a admin bar se zobrazují pro clone i non-clone stránky
□ Bottom undo/redo bar pouze pro non-clone stránky (clone má vlastní save UI)
VALIDACE: admin/editor - najet na text → dashed outline → kliknout → edit cursor → zadat text → Uložit → text se změní
```

## FÁZE 9 — SEO & technické
```
□ <meta name="robots" content="noindex, nofollow"> — záměrné pro demo stránky
□ canonical URL = konkrétní demo URL: ${BASE_URL}/demo/${tenantSlug} (NIKDY root!)
□ generateMetadata v page.tsx: alternates: { canonical: canonicalUrl }
□ <title> bez původního brandu
□ <meta description> bez původního brandu, 150-160 znaků
□ OG tagy: og:title, og:description, og:url (= canonicalUrl)
□ Žádný <meta name="generator">
VALIDACE: curl demo URL → <link rel="canonical" href="...demo/[slug]"> (ne root)
VALIDACE: title a description v page.tsx nastaveny přes DB (seo_title, seo_description)
```

## FÁZE 10 — PageSpeed
```
□ loading="lazy" na všechny img mimo hero
□ loading="eager" + fetchpriority="high" na hero img
□ defer na JS v jsUrls (ClonedSiteRenderer)
□ font-display: swap v fonts.css
□ Žádný render-blocking external CSS
VALIDACE: Playwright → zkontrolovat network timing hero image
```

## FÁZE 11 — Ověřovací screenshoty
```
□ Screenshot desktop 1440px → Read tool → vizuální ověření
□ Screenshot mobile 390px → Read tool → vizuální ověření
□ Screenshot originálu → side-by-side srovnání → layout odpovídá
□ Network monitoring → 0 failed requests
□ Network monitoring → 0 external requests (CSS/JS/fonts/img)
□ Console errors → 0 (JS errors mimo blokované API calls)
VALIDACE: všechny výše
```

## FÁZE 12 — Finální verifikace
```
□ grep původní brand v DB HTML → 0 (mimo theme file paths)
□ grep IČO originálu → 0
□ grep originální email → 0
□ grep "smartlook\|gtm\|fbq\|hotjar" → 0
□ curl localhost:3015/demo/[slug] → HTTP 200
□ curl localhost:3015/demo/[slug]/admin → HTTP 200 nebo 401
□ DB: tenant.email = info@demo.local
□ Hamburger menu: Playwright click test → menu se otevře
□ Stránka se načte bez JS chyb
STATUS: DONE (po splnění VŠECH checkboxů)
```

---

# AKTUÁLNÍ ŠABLONY — DETAILNÍ STAV

---

## TEMPLATE: peak-cut-demo
ZDROJ: https://barbershop-buddy.cz
KATEGORIE: barbershop
STATUS: IN_PROGRESS

### FÁZE 0: DONE
### FÁZE 1: DONE (mirror-peak-cut-assets.mjs — včetně 3 stacked B&W contact photos + gallery injection + Powered by Google removal)
### FÁZE 2: DONE (seed-peak-cut-demo.mjs funguje)
### FÁZE 3: DONE (obfuskace 322 tříd, PRESERVE_CLASSES: slick-* OK)
### FÁZE 4: SKIPPED (není potřeba rename)
### FÁZE 5: TODO (cleanup tmp files)
### FÁZE 6: DONE
  - Frame-1.jpg ✅ 91KB (B&W portrait, bílé pozadí)
  - Mobile-1.jpg ✅ (B&W portrait, .jpg ne .png)
  - about_image.jpg ✅ 132KB
  - contact-us_image.jpg ✅ 67KB
  - contacts_image1.jpg ✅ 113KB
  - contacts_image2.jpg ✅ 111KB
  - contact_photo1.jpg ✅ 51KB (B&W nůžky — regenerováno)
  - contact_photo2.jpg ✅ 55KB (B&W)
  - contact_photo3.jpg ✅ 52KB (B&W barber portrét — nově vygenerováno)
  - Galerie sekce ✅ (CSS grid, 5 AI fotek, před #about)
  - Contact sekce ✅ (3 stacked B&W photos místo 1 fotky)
  - Reviews ✅ (5 statických Google reviews, hvězdičky OK)
  - Powered by Google badge ✅ ODSTRANĚNO
### FÁZE 7: DONE (texty nahrazeny na "Peak Cut", statické reviews v češtině)
### FÁZE 8: DONE
  - Screenshot mobile 390px ✅ (hero B&W, hamburger viditelný, ceník OK)
  - Hamburger click ✅ (openMenuVisible: true v DOM, 0 JS errors)
  - Viewport meta ✅
### FÁZE 9: DONE (Next.js layout.tsx: noindex ✅, title "Peak Cut Barbershop" ✅, description ✅)
### FÁZE 10: DONE (lazy loading ✅, defer na JS ✅, fonts.css lokální ✅)
### FÁZE 11: DONE
  - Desktop screenshot ✅ (hero B&W OK, galerie OK, kontakt OK)
  - Mobile screenshot ✅ (hamburger OK, ceník OK)
  - JS errors ✅ NONE
  - 0 externích brand references ✅ (barbershop-buddy: 0)
  - 0 tracking scripts ✅ (GTM/GA/FB/Smartlook: 0)
  - 0 external API calls ✅ (maps.googleapis.com: 0)
### FÁZE 12: DONE
  - brand audit ✅ (0 výskytů barbershop-buddy)
  - tracking audit ✅ (0 výskytů)
  - noindex ✅
  - HTTP 200 ✅
  - JS errors ✅ NONE
  - contact_photo1 ✅ 51KB, contact_photo2 ✅ 55KB, contact_photo3 ✅ 52KB

STATUS: **DONE** ✅ (2026-05-10)

NEXT EXACT STEP:
→ Začít FÁZE 0 pro šablonu #3: barber-praha-demo (https://barberpraha.online)

---

## TEMPLATE: the-barber-demo
ZDROJ: https://www.thebarber.cz/home-cs
KATEGORIE: barbershop
STATUS: IN_PROGRESS

### FÁZE 0: DONE (Squarespace site → custom HTML/CSS approach místo DOM mirror)
### FÁZE 1: DONE (mirror-the-barber-assets.mjs — custom clean HTML/CSS, Google Fonts lokálně, 6 sekcí)
### FÁZE 2: DONE (seed-the-barber-demo.mjs — tenant ID 55, page ID 191, HTTP 200 ✅)
### FÁZE 3: DONE (obfuscate-clone.mjs — 49 tříd + 4 ID, xjw74=site-header ✅)
### FÁZE 4: SKIPPED (není potřeba rename)
### FÁZE 5: SKIPPED (no tmp files to clean)
### FÁZE 6: DONE
  - gallery-01.jpg ✅ 23KB (B&W nůžky)
  - gallery-02.jpg ✅ 23KB (B&W střih)
  - gallery-03.jpg ✅ 32KB (B&W křeslo)
  - gallery-04.jpg ✅ 38KB (B&W interiér)
  - gallery-05.jpg ✅ 16KB (B&W nástroje)
  - gallery-06.jpg ✅ 30KB (B&W vousy)
  - gallery-07.jpg ✅ 27KB (B&W barber)
  - gallery-08.jpg ✅ 25KB (B&W holení)
  - gallery-09.jpg ✅ 22KB (B&W portrét)
  - gallery-10.jpg ✅ 33KB (B&W fade detail)
  - gallery-11.jpg ✅ 37KB (B&W čekárna)
  - gallery-12.jpg ✅ 21KB (B&W břitva)
  - hero.jpg, about.jpg, pricing-bg.jpg → SKIPPED (velké — dle zadání)
### FÁZE 7: DONE
  - Brand audit: 0x thebarber.cz ✅, 0x IČO ✅, 0x tracking ✅
  - email → info@demo.local ✅
  - phone → +420 608 288 777 ✅
  - booking URL → #rezervace (welns.io odstraněno) ✅
  - social links → # (nofollow) ✅
### FÁZE 8: DONE
  - Mobile 390px screenshot ✅ (hero, REZERVOVAT, otevírací doba)
  - Hamburger click ✅ (nav-open=xvbqq přítomno v DOM, menu O NÁS/GALERIE/CENÍK viditelné)
  - JS classes opraveny v DB (hamburger→xjlea, main-nav→xazns) ✅
  - Horizontal scroll: NONE ✅
  - Viewport meta: OK ✅
### FÁZE 9: DONE
  - noindex, nofollow ✅
  - title: "The Barber — Holičství a barbershop Praha" ✅
  - description: "Profesionální holičství v Praze..." ✅
  - 0x generator ✅
### FÁZE 10: DONE
  - lazy loading ✅, hero eager+fetchpriority ✅
  - 0 externích requestů ✅, fonts.css lokální ✅
### FÁZE 11: DONE
  - Desktop 1440px screenshot ✅ (hero, about, gallery 12 fotek, ceník 3 sloupce, footer)
  - Mobile 390px screenshot ✅
  - JS errors: NONE ✅
  - External requests: NONE ✅
### FÁZE 12: DONE
  - Brand audit ✅ (0x thebarber.cz, IČO, tracking)
  - HTTP 200 ✅
  - Hamburger ✅
  - noindex ✅

STATUS: **DONE** ✅ (2026-05-11)

---

## TEMPLATE: barber-praha-demo
ZDROJ: https://barberpraha.online
KATEGORIE: barbershop (WordPress/Divi 4.27.6 + DiviPixel)
TENANT: ID 62, token: bprahafro9zflo
PAGE: section ID 946

### FÁZE 0: DONE — WordPress/Divi 4.27.6, DiviPixel preloader, inline CSS 227KB+
### FÁZE 1: DONE — mirror-barber-praha.mjs, assets staženy do /public/clones/barber-praha/
### FÁZE 2: DONE — seed-barber-praha-demo.mjs, tenant 62, section 946, HTTP 200 ✅
### FÁZE 3: DONE — CSS obfuskace (SKIP pro Divi: et_pb_*, dipi_* zachovány)
### FÁZE 4-5: DONE — Cleanup, dipi_preloader_wrapper_outer: display:none !important
### FÁZE 6: DONE — Reálné fotky z barberpraha.online (Reuzel THE LOOK series, 01-08.webp)
  - ABSOLUTNÍ ZÁKAZ AI obrázků (potvrzeno v paměti)
  - curl stažení: hero (2 fotek), tým (8 fotek + 480px varianty), galerie
### FÁZE 7: DONE — Demo obsah
  - Logo: SVG "BARBER / DEMO ŠABLONA" (ne originál)
  - Kontakty: Demo ulice 12, Praha 2 / +420 608 288 777 / info@demo.local ✅
  - IČO: 00000000 ✅
  - Bankovní účet: XXXXXXXX / 0000 (původní nahrazen) ✅
  - Ceny: upraveny (±10-20% od originálu) ✅
  - Texty: demo obsah ✅
### FÁZE 8: DONE — Divi CSS fixes přes venom-layout-fix style tag
  - venom-nav-fix: transparent header, desktop nav (full menu), CTA button
  - Divi body classes: et_fixed_nav, et_transparent_nav, et-db na div#page-container
  - Hero slider: show only first slide (et_pb_slide:not(.et-pb-active-slide))
  - Team accordion: et_pb_row_8 → display:flex, 4×25% columns, background-images injected
  - Gallery carousel: dipi-carousel-wrapper → display:grid, 3 columns, full width (et_pb_row_6)
  - Counters: static values 500+/5/24+/1 injected directly into HTML
### FÁZE 9: DONE — noindex, canonical /demo/barber-praha-demo
### FÁZE 10-11: DONE — Real photos verified, no AI
### FÁZE 12: DONE — Verifikační checklist
  - Admin bar: VISIBLE ✅ (z-index 99999, above Divi header)
  - Admin bar items: Blog | SEO | Zprávy | Analytics | Moduly | Verze | Audit | Náhled ↗ | Page Builder ✅
  - CSS bleed: NONE (správné kapitalizace v admin baru) ✅
  - Zasunout → slides away ✅
  - Page Builder panel: "Page Builder" (ne PAGE BUILDER), Klonovaná stránka ✅
  - Preview screenshot: /public/preview-barber-praha.jpg ✅
  - /preview page: entry přidána ✅ (při FÁZE 2)

### Klíčové technické nálezy (do paměti):
- Divi body třídy: injektovat na div#page-container (ne na Next.js body)
- dipi_image_accordion: background images nastaveny přes CSS (ne JS) — musí být v style tagu
- dipi_carousel: wrapper display:none (override s !important), wrapper → display:grid
- et_pb_row flex: Divi rows mají display:block bez JS → manuálně force display:flex
- db.ts: CREATE INDEX AFTER ALTER TABLE (separate pool.query)

STATUS: **DONE** ✅ (2026-05-11)

NEXT EXACT STEP:
→ Začít FÁZE 0 pro šablonu #4: studio-jarka-demo (https://jarkacechova.cz)

---

## TEMPLATE: studio-jarka-demo
ZDROJ: https://jarkacechova.cz
KATEGORIE: kadeřnictví (Tilda CMS, T396 zero-blocks)
TENANT: ID 72, token: stujarkab0upoqmm
PAGE: section ID 956
STATUS: IN_PROGRESS → DONE

### FÁZE 0: DONE — Tilda CMS, T396 zero-blocks (absolute positioning), uc-scrollmenu nav, Kinescope video, Noona.app booking, 24 sekcí
### FÁZE 1: DONE — mirror-studio-jarka-assets.mjs
  - 78+ images + 3 ink CDN images staženy
  - 9 extra .woff fonts z tilda-blocks.min.css staženy lokálně
  - tilda-blocks.min.css patched (0 externích font refs)
  - tilda-stat-1.0.min.js stub vytvořen
  - 12 brand logo SVG souborů přepsány (133x20 / 145x64 / 273x224 / 461x78)
  - buildHtml(): GTM/GA/Tilda-stat odstraněny, Kinescope neutralizován, t-bgimg inline bg-image
  - Team names nahrazeny (7 stylistek → demo jména)
  - T396 statistiky: standalone čísla nahrazeny
### FÁZE 2: DONE — seed-studio-jarka-demo.mjs, tenant 72, section 956
### FÁZE 3: DONE — obfuscate-clone.mjs, 103 tříd, 220 ID
### FÁZE 4-5: SKIPPED / DONE — no rename, tmp cleanup
### FÁZE 6: DONE — reálné fotky z jarkacechova.cz (NO AI — Tilda CMS real photos)
### FÁZE 7: DONE
  - Logo: 12 brand SVG souborů přepsány inline demo SVG
  - Nav logo: Frame_48_3.svg (145x64 uc-scrollmenu) ✅ přepsán
  - Všechny brand texty: Jarka Čechová, jarkacechova.cz, noona.app, bananza.cz ✅ odstraněny
  - Kontakty: Demo ulice 12 / +420 608 288 777 / info@demo.local ✅
  - Otevírací doba: Po-Pá 09:00-18:00, So 10:00-15:00 ✅
### FÁZE 8: DONE
  - Mobile 390px screenshot ✅ (DS logo, nav viditelný, hero čitelný)
  - Horizontal scroll: 0px ✅
  - Viewport meta: width=device-width ✅
### FÁZE 9: DONE
  - title: "Demo Hair Salon — Ukázka šablony kadeřnický salon" ✅
  - description ✅, noindex,nofollow ✅, canonical /demo/studio-jarka-demo ✅
### FÁZE 10: DONE
  - font-display: swap v fonts.css ✅
  - defer na JS scriptech (ClonedSiteRenderer) ✅
  - 0 externích requestů ✅
### FÁZE 11: DONE
  - Desktop screenshot v9 ✅ (DS logo nav + mobile nav + footer)
  - Mobile 390px ✅
  - 0 externích requestů ✅, 0 failed responses ✅
  - Brand audit: 0x jarkacechova.cz, 0x Jarka Čechová, 0x bananza.cz ✅
### FÁZE 12: DONE
  - HTTP 200 ✅ (demo), 307 ✅ (admin — redirect na login)
  - 0 tracking scripts ✅
  - Preview screenshot → /preview page ✅ (token: stujarkab0upoqmm)

### Klíčové technické nálezy (do paměti):
- Tilda uc-scrollmenu modul generuje vlastní fixní nav s odlišným logo souborem (Frame_48_3.svg)
- Tilda T396 zero-blocks: elementy začínají jako visibility:hidden; t396_init() je pozicuje absolutně
- t-bgimg: `src` atribut Tilda JS konvertuje na CSS background-image — přidat inline style fallback
- tilda-blocks.min.css obsahuje @font-face s externími URL — nutno stáhnout .woff a patchnout CSS
- Kinescope URL regex: NESMÍ matchovat přes script bloky — pouze neutralizovat URL, ne mazat scripty
- stats (T396): čísla jsou v oddělených elementech; nahradit jako `/>23<\/div>/` ne `/23 let/`

STATUS: **DONE** ✅ (2026-05-12)

---

## TEMPLATE: hairsalon-no1-demo
ZDROJ: https://hairsalon-no1.cz/cs/domu/
KATEGORIE: kadeřnictví (WordPress + Flatsome theme)
TENANT: TBD
PAGE: TBD
STATUS: IN_PROGRESS

### FÁZE 0: DONE — WordPress + Flatsome 3.20.6, Yoast SEO, Trustindex recenze, Mystoodio booking
- CMS: WordPress/Flatsome (wp-content/themes/flatsome/)
- Pages (5): home (/cs/domu/), salon (/cs/salon/), tým (/cs/tym/), galerie (/cs/galerie/), kariéra (/cs/kariera/)
- Ext. dependencies: cdn.trustindex.io (recenze), salon-no1-web.mystoodio.app (booking), lh3.googleusercontent.com (avatary), wp-emoji, GTM, Complianz GDPR
- PDF originálu: /tmp/hairsalon-no1-original.pdf ✅
- Pages list: /tmp/hairsalon-no1-pages.txt ✅

---

## FRONTA ŠABLON (přidáno 2026-05-13)

### Kadeřnictví / vlasové salony
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 6 | https://hairsalon-no1.cz/cs/domu/ | hairsalon-no1-demo | TODO |
| 7 | https://www.petramechurova.cz/cs/ | petramechurova-demo | TODO |
| 8 | https://www.selfbeautystudio.com | selfbeauty-demo | TODO |

### Masáže / wellness
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 9 | https://www.prahamasaze.com | prahamasaze-demo | TODO |
| 10 | https://anandaspa.cz | anandaspa-demo | TODO |
| 11 | https://www.tawan.cz | tawan-demo | TODO |
| 12 | https://www.escapemassage.cz | escapemassage-demo | TODO |

### Tetovací studia
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 13 | https://www.tribo.cz | tribo-demo | TODO |
| 14 | https://homietattoo.cz | homietattoo-demo | TODO |
| 15 | https://www.magictattoo.cz | magictattoo-demo | TODO |

### Fitness trenéři / gym
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 16 | https://johnreed.fitness/cz | johnreed-demo | TODO |
| 17 | https://www.maxfitness.cz | maxfitness-demo | TODO |
| 18 | https://fitnessvictory.cz | fitnessvictory-demo | TODO |
| 19 | https://lindasikorova.com | lindasikorova-demo | TODO |

### Kosmetické salony
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 20 | https://www.yesvisage.cz | yesvisage-demo | TODO |
| 21 | https://www.bomtonclinic.cz | bomtonclinic-demo | TODO |
| 22 | https://esthesia.cz | esthesia-demo | TODO |

### Nehtová studia
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 23 | https://www.maidenstudio.cz | maidenstudio-demo | TODO |
| 24 | https://www.celebratesalon.cz | celebratesalon-demo | TODO |
| 25 | https://sohosalon.cz | sohosalon-demo | TODO |

### Fyzioterapie
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 26 | https://fyzioklinika.cz | fyzioklinika-demo | TODO |
| 27 | https://fyziovsem.cz | fyziovsem-demo | TODO |
| 28 | https://www.resetclinic.cz | resetclinic-demo | TODO |

### Restaurace
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 29 | https://www.ambi.cz | ambi-demo | TODO |
| 30 | https://www.restauracehybernska.cz | hybernska-demo | TODO |
| 31 | https://www.lacasalatina.cz/cs/uvod/ | lacasalatina-demo | TODO |
| 32 | https://www.cafesavoy.ambi.cz/ | cafesavoy-demo | TODO |

### Kavárny
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 33 | https://www.zrnozrnko.cz | zrnozrnko-demo | TODO |
| 34 | https://www.costa-coffee.cz | costacoffee-demo | TODO |
| 35 | https://www.coffeeroom.cz | coffeeroom-demo | TODO |
| 36 | https://www.cathedralcafe.cz | cathedralcafe-demo | TODO |

### Realitní kanceláře
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 37 | https://www.lexxusnorton.cz | lexxusnorton-demo | DONE ✅ (engine: reality-01, 2026-06-08) |
| 38 | https://www.engelvoelkers.com/cz/cs | engelvoelkers-demo | TODO |
| 39 | https://fermakleri.cz | fermakleri-demo | TODO |
| 40 | https://www.realityskutovi.cz | realityskutovi-demo | TODO |
| 41 | https://www.quantumreality.cz | quantumreality-demo | TODO |
| 42 | https://jansrubar.cz/cs | jansrubar-demo | TODO |
| 43 | https://ondrejkucera.com | ondrejkucera-demo | TODO |

### Autoservisy
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 44 | https://www.bestdrive.cz | bestdrive-demo | TODO |
| 45 | https://www.autoservis-garant.cz | autoservisgarant-demo | TODO |
| 46 | https://autoservistomas.cz | autoservistomas-demo | TODO |

### Zubaři
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 47 | https://magicsmile.cz | magicsmile-demo | TODO |
| 48 | https://usmevneboli.cz | usmevneboli-demo | TODO |
| 49 | https://www.svetrovnatek.cz | svetrovnatek-demo | TODO |
| 50 | https://perfect-smile.cz | perfectsmile-demo | TODO |

### Advokáti
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 51 | https://www.havelpartners.cz | havelpartners-demo | TODO |
| 52 | https://rowan.legal | rowanLegal-demo | TODO |
| 53 | https://www.prkpartners.com/cs | prkpartners-demo | TODO |

### Řemeslníci
| # | URL | Slug (navrhovaný) | Status |
|---|-----|-------------------|--------|
| 54 | https://obfacility.cz/malirske-prace/ | obfacility-demo | TODO |

### FÁZE 1: DONE — mirror-hairsalon-no1-assets.mjs, 52+ assets, 5 stránek
### FÁZE 2: DONE — tenant ID 110, token: no1hair8ahh4had4o, 5 stránek
### FÁZE 3-5: DONE — brand scrub, demo obsah, CSS fixes
  - CMS: WordPress + Flatsome 3.20.6
  - Complianz removal: toolbar + dialog + JS nullified
  - Flatsome slider fix: banner height 100% CSS override
  - Demo logo: inline SVG "HAIR STUDIO / SALON·01"
  - Kontakty: info@demo.local, +420 608 288 777, Demo ulice 12
  - Footer: Demo Studio s.r.o., IČ: 00000000
  - kill-cmplz.js: neutralizuje PUM/Complianz jako první jsUrl
### FÁZE 7: DONE — title: "Demo Hair Salon — Ukázka kadeřnického webu", noindex ✅
### FÁZE 9: DONE — External: 0 ✅, JS errors: 0 ✅, Brand: 0 ✅
### FÁZE 11: DONE
  - lifecycle_status: published ✅
  - /preview: entry přidána ✅ (preview-hairsalon-no1.jpg)

### Klíčové technické nálezy (Flatsome/WordPress):
- Complianz má 3 separátní HTML bloky: (1) dialog, (2) toolbar na začátku body, (3) cookie bar — nutno odstranit VŠECHNY
- Flatsome Flickity slider: .banner výška = 30px bez CSS fix; nutno `height: 100%` na .banner, .banner-inner, .banner-bg
- PUM (Popup Maker) v jsUrls spouštěl Complianz reinject — VŽDY vyloučit
- Inline `<script>` v `<head>` v dangerouslySetInnerHTML renderuje jako viditelný text — NESMÍ být v head HTML
- `var complianz = {}` config script byl v `<body>` (ne jen head) — nutno smazat z body inline skriptů

STATUS: **DONE** ✅ (2026-05-13)

---

## TEMPLATE: petramechurova-demo
ZDROJ: https://www.petramechurova.cz/cs/
KATEGORIE: kadeřnictví (Weblantis CMS, Bootstrap 5.3)
TENANT: TBD
PAGE: TBD
STATUS: IN_PROGRESS

### FÁZE 0: DONE — Weblantis CMS, Bootstrap 5.3, obrázky z admin.weblantis.cz/storage/creator/45/
- CMS: Weblantis.cz (český custom CMS builder)
- Stránky (6): home (/cs/), sluzby (/cs/sluzby-1/sluzbystrih/ + další), kolekce (/cs/kolekce/), kontakt (/cs/kontakt/), oceneni (/cs/oceneni/), tym (/cs/tym-1/)
- Ext. dependencies: admin.weblantis.cz (všechny obrázky + API), FB/IG, weblantis booking, cookie consent vlastní
- PDF originálu: /tmp/petramechurova-original.pdf ✅

### FÁZE 1: DONE — mirror-petramechurova-assets.mjs, 81 assets, 4 stránky (tym = Weblantis error page, skipped)
  - Weblantis CMS: stránky obsahují <noscript> 41KB JSON container (celý obsah jako JSON)
  - web_json_fill.js: dynamicky plní DOM z API → pouze JS wait 3s při scrape
  - Fonty v basic.css: 4× @import Google Fonts → lokalizovány → smazány z CSS
  - Riziko: greedy regex na <noscript>GTM</noscript> odstranil 41KB obsahu (noscript je container!)
### FÁZE 3-5: DONE — brand scrub, demo obsah
  - Logo: SVG "HAIR MAKING petra studio DEMO ŠABLONA"
  - Jména: Petra Měchurová → Demo Majitelka, Simona Knapová → Demo Stylistka, Lucie Janyšková → Demo Koloristu
  - Kontakty: info@demo.local, +420 608 288 777, Demo ulice 12
  - Footer: © 2026 Demo Majitelka s.r.o. ✅
### FÁZE 9: DONE — External: 0 ✅, JS errors: 0 ✅, Brand: 0 ✅
### FÁZE 11: DONE
  - lifecycle_status: published ✅
  - /preview: entry přidána ✅ (preview-petramechurova.jpg)
  - Token: petra3wv4i7e0ho

### Klíčové technické nálezy (Weblantis CMS):
- Weblantis ukládá obsah v 41KB <noscript> JSON blob v <head> — NESMÍ být smazán!
- Greedy regex <noscript>[\s\S]*?GTM[\s\S]*?</noscript> odstraní celý obsah
- Bezpečná verze: <noscript><iframe[^>]*googletagmanager...> (jen iframe noscript)
- web_json_fill.js: načítá fonty z CDN via @import v basic.css, ne přes JS DOM
- CS language switcher: dynamicky injektován přes JS, nelze staticky odebrat; hide přes JS DOMContentLoaded
- kill-cdn.js: override document.createElement pro link tagy

STATUS: **DONE** ✅ (2026-05-13)

---

## TEMPLATE: selfbeauty-demo
ZDROJ: https://www.selfbeautystudio.com
KATEGORIE: beauty & wellness (WIX Thunderbolt)
TENANT: ID 121, token: selfbp0hr6nllun
STATUS: **DONE** ✅ (2026-05-15)

### FÁZE 0: DONE — WIX Thunderbolt, 5 stránek
- CMS: WIX Thunderbolt (parastorage.com + wixstatic.com)
- Pages: home, cenik-barber, cenik-manikura, cenik-kosmetika, darkovy-poukaz
- Přeskočeno: /kontakty a /o-nas (Vietnamese template content, nekustomizováno)
- PDF originálu: /tmp/selfbeauty-original.pdf ✅

### FÁZE 1: DONE — mirror-selfbeauty-assets.mjs, 97 obrázků, 22 CSS, 19 JS
- WIX specifika: rendered HTML via Playwright page.content() (1.4MB/stránku)
- Fonty: 382 @font-face deklarací → stažen jen Fahkwang z Google Fonts, zbytek stripped
- wow-image polyfill: wix-image-polyfill.js pro renderování hero sekcí bez Wix JS
- kill-external.js: inline XHR/fetch blocker pro Wix Thunderbolt API calls

### FÁZE 2: DONE — seed-selfbeauty-demo.mjs, tenant 121, 5 stránek
- Přístup: raw Playwright HTML → parseWixDocument() → body + inline styles → DB
- cssUrls: [fahkwang-local.css]
- jsUrls: [kill-external.js, wix-image-polyfill.js]

### FÁZE 3-5: DONE — brand scrub, demo content
- Telefon: +420 608 288 777 ✅
- Email: info@demo.local ✅
- Adresa: Demo ulice 12 ✅
- Brand: selfbeautystudio.com → demo.local ✅

### FÁZE 7: DONE — noindex, canonical, OG tagy ✅
### FÁZE 9: DONE — External: 0 ✅, JS errors: 0 ✅, Brand: 0 ✅
### FÁZE 11: DONE
- lifecycle_status: published ✅
- /preview: karta přidána ✅ (preview-selfbeauty-demo.jpg, 100KB)
- URL: http://localhost:3015/demo/selfbeauty-demo

### Klíčové technické nálezy (WIX Thunderbolt):
- WIX HTML: 1.4MB rendered HTML via page.content(); body tag na pozici 552K!
- 382 @font-face deklarací = celá WIX font library → strip all, keep jen Fahkwang
- siteassets.parastorage.com Thunderbolt preload links → strip jako <link> tagy
- wow-image custom elements: potřebují JS polyfill; data-image-info obsahuje URI
- kill-external.js musí být jako inline <script> NA ZAČÁTKU HTML (ne jsUrls) pro blokování
- data-url/data-href atributy na <style> tagech = pouze metadata, ne síťové requesty
- 11062b_186080a0de114353a8fadd831a29a67ff000.jpg = speciální hash formát, jiný regex

---

## TEMPLATE: praha-masaze-demo
ZDROJ: https://www.prahamasaze.com
KATEGORIE: Masáže & Wellness (WordPress 6.9.4 + GeneratePress child theme)
TENANT: ID 128, token: masazemfg4pp1l
STATUS: **DONE** ✅ (2026-05-15)

### FÁZE 0: DONE — WordPress + GeneratePress, 3 stránky
- CMS: WordPress 6.9.4 + GeneratePress 3.6.1 child theme "prahamasaze"
- Pages: home (/), cenik-masazi (ceník), rezervace (booking → statický form)
- Ext dependencies: GTM, Google Analytics, Seznam.cz rc.js, Complianz GDPR, Instagram Feed (sbi), TrustIndex, WP emoji CDN
- PDF originálu: (Playwright audit PDF) /tmp/praha-masaze-clone.pdf ✅

### FÁZE 1: DONE — Playwright mirror, 49 assets, 3 stránky
- CMS: WordPress server-side rendered → `page.content()` po networkidle
- Playwright `page.route()` blokuje: GTM, GA, seznam.cz, trustindex, emoji CDN, instagram
- Assets: zachovaná WP struktura `wp-content/uploads/...`, `wp-includes/...`
- Fonty: Google Fonts Cormorant Garamond + Inter → Playwright capture z CDN response
- WP emoji img tags `<img class="emoji" alt="✨">` → nahrazeno textem (alt atribut)
- Komplianz banner v rendered DOM → stripped regex (3 bloky dle playbook)

### FÁZE 2: DONE — seed-Praha-masaze-demo.mjs, tenant 128, 3 stránky
- cssUrls: [/clones/Praha-masaze/fonts/fonts.css]
- jsUrls: [jQuery, jquery-migrate, gp-menu.min.js, main.js]
- Rezervace: statický HTML form (originální JS booking calendar replaced)

### FÁZE 3+5: DONE — brand scrub + demo obsah
- Telefon: +420 608 288 777 ✅
- Email: info@demo.local ✅
- Logo: SVG "DEMO MASÁŽE" ✅
- Milan Soukup → Demo Masér ✅
- prahamasaze.com → demo-masaze ✅
- Social: demomasaze handles ✅

### FÁZE 7: DONE — noindex, canonical, OG tagy ✅ (Next.js generateMetadata)

### FÁZE 9: DONE — External: 0 ✅, JS errors: 0 ✅, Brand: 0 ✅

### FÁZE 11: DONE
- lifecycle_status: published ✅
- /preview: karta přidána ✅ (preview-Praha-masaze-demo.jpg, 18KB)
- URL: http://localhost:3015/demo/Praha-masaze-demo

### Klíčové technické nálezy (WordPress GeneratePress):
- page.route() MUSÍ blokovat CDN PŘED page.goto() — jinak Playwright pošle requesty
- WP emoji JS konvertuje emoji na <img src="s.w.org"> před page.content() → regex nahradit alt textem
- GTM obfuskovaný inline: `(function(w,d,s,l,i){...googletagmanager...})` — vlastní regex, ne comment wrapper
- Complianz v rendered DOM = 3 bloky (viz playbook); banner-container div je velký nested block
- TrustIndex Google Reviews widget: CDN JS + div → oba strips
- Seznam.cz rc.js: retargeting pixel, strip jako GTM

---

## TEMPLATE: praha-masaze-demo
ZDROJ: https://www.prahamasaze.com
KATEGORIE: masáže & wellness (WordPress + GeneratePress child theme)
TENANT: ID z DB, token: masazemfg4pp1l
STATUS: **DONE** ✅ (2026-05-15) — opraveno po druhé session

### Co druhá session udělala špatně
- cssUrls: `/clones/praha-masaze/fonts/fonts.css` — soubor neexistoval
- jsUrls: `/clones/praha-masaze/js/jquery.min.js` — špatná cesta (správně wp-includes/...)
- Výsledek: klon se zobrazoval jako rozbité SVG ikony bez CSS

### Jak opraveno
- FÁZE 1: assets jsou v `wp-content/` WP struktuře ✅
- Chybějící soubory staženy: 3 img, gp-menu.min.js, Slick CSS+JS, Google Fonts (Cormorant+Inter, 58 woff2)
- cssUrls opraveny na skutečné cesty: google-fonts.css, block-library, generatepress main.min.css, prahamasaze style.css, slick.min.css + theme
- jsUrls opraveny: jquery, jquery-migrate (wp-includes), gp-menu, slick.min.js, main.js
- Instagram feed odstraněn (Smash Balloon plugin — 6 SVG 1280×1463 play icons)
- Complianz cookie CSS kill injektován (pre-rendered HTML)

### Finální stav
- External: 0 ✅ | 404s: 0 ✅ | JS errors: 0 real ✅
- Pages: home, cenik, rezervace (3 stránky)
- Mobile: hero + CTA funguje, responsive layout ✅
- Preview: public/preview-praha-masaze-demo.jpg (136KB)
- URL: http://localhost:3015/demo/praha-masaze-demo

### Klíčová lekce (WordPress + GeneratePress)
- WordPress clone: assety v `wp-content/` + `wp-includes/` — ZACHOVAT strukturu cest
- cssUrls musí mít: google-fonts.css + block-library + theme main.min.css + child style.css + slick
- jsUrls: jquery z wp-includes (ne z /js/!), gp-menu z themes/generatepress/assets/js/
- Slick: CDN verze stáhnout lokálně — aktivace přes jQuery init script
- Instagram plugin (SBI): SVG play buttons bez pluginového CSS renderují jako 1280×1463 elementy → odstranit celou sekci
- Complianz: CSS kill `[class*="cmplz"]` v head dostačuje (nespouští se JS version)

---

## TEMPLATE: ananda-demo
ZDROJ: https://anandaspa.cz
KATEGORIE: Ayurvéda & Wellness SPA
TENANT: TBD
STATUS: IN_PROGRESS

### FÁZE 0: DONE — Laravel + Alpine.js + Vite
- CMS: Custom Laravel app (není WP/Divi/Tilda/WIX)
- Detekce: laravel=true (CSRF meta), alpine=true, vite build assets v /build/assets/
- Pages: 12+ stránek, klonuji 3: home, /ajurvedske-procedury, /darkovypoukaz
- PDF originálu: /tmp/ananda-orig.pdf ✅

### FÁZE 1-11: DONE — ananda-demo
- CMS: Laravel + Alpine.js + Vite (custom PHP app, ne WordPress/WIX)
- Pages: home, procedury, voucher (3 stránky)
- Assets: 61 img, 1 CSS (Vite bundle), 2 JS (app + Swiper), 1 font
- Specifika:
  - eKomi widget: @import url() v inline style + img tag → strip obojí
  - Swiper: CDN → lokální, init script injektován
  - Video hero (home_6_1.mp4, 25MB): stripped, nahrazen CSS background-image
  - Vite hash suffixy: soubory uloženy s hashem (-tIxmEzpk.svg), HTML referencuje bez → zkopírovat
  - /build/assets/ cesty: CSS zůstávají → rewrite regex v CSS souboru
  - hotel logos (10 souborů): potřeba subdir /img/hotels/ a stažení přes Playwright

- Finální stav: External: 0 ✅ | 404s: 0 ✅ | Brand: 0 ✅
- Preview: public/preview-ananda-demo.jpg (105KB)
- URL: http://localhost:3015/demo/ananda-demo
STATUS: **DONE** ✅ (2026-05-15)

---

## TEMPLATE: tawan-demo
ZDROJ: https://www.tawan.cz
KATEGORIE: Thajské masáže & wellness
STATUS: IN_PROGRESS

### FÁZE 0: DONE — Drupal CMS, custom theme "awesome"
- CMS: Drupal (potvrzen /sites/default/files/, /themes/custom/awesome/)
- CSS: dynamicky generované s hash params
- Pages: home, /masaze, /cenik, /darkove-poukazy
- PDF originálu: /tmp/tawan-orig.pdf ✅

### FÁZE 1-11: DONE — tawan-demo
- CMS: Drupal (custom theme "awesome"), 4 stránky
- Specifika:
  - Cookiebot: 25KB HTML dialog na začátku body → truncate po <header
  - Cookiebot CSS byl v inline <style> bloky (split approach + nukovat)
  - CSS rewrite: /themes/custom/awesome/ a /sites/default/files/ v CSS url()
  - jQuery: v jsUrls jako první, inline $ shim
  - 52 dekorativních ikon 404 (nevadí vizuálu)
- External: 0 ✅ | Visual: TAWAN logo, tmavý design, golden ornament ✅
- Preview: public/preview-tawan-demo.jpg (51KB)
- URL: http://localhost:3015/demo/tawan-demo
STATUS: **DONE** ✅ (2026-05-15)

---

## TEMPLATE: escape-demo
ZDROJ: https://www.escapemassage.cz
KATEGORIE: Thajské masáže Praha
STATUS: IN_PROGRESS

### FÁZE 0: DONE — WordPress + WPO Minify + TwentySeventeen
- CMS: WordPress, WPO Minify plugin (CSS aggregace v /wp-content/cache/)
- Cookiebot (opět, postup znám z tawan)
- Google Fonts: Amita, Bitter, Dancing Script, Lato, Lobster, Open Sans, Pacifico, Quicksand, Raleway...
- Pages: home, /masaze/, /cenik-masazi/, /darkove-poukazy-na-masaz/
- PDF: /tmp/escape-orig.pdf ✅

### FÁZE 1-11: DONE — escape-demo
- CMS: WordPress + WPO Minify, 4 stránky
- CSS: WPO Minify aggregated header CSS
- Specifika:
  - Cookiebot: opět truncate po <header (25KB+)
  - Ecomail newsletter: img → lokální, form strip
  - Smartsupp/cloudfront widget: kill-external.js inline blocker
  - jQuery: v WPO bundlech + standalone jquery-3.7.1.min.js první v jsUrls
  - Theme fonts (LuxuriousScript, Candara): staženy z Google Fonts + tema
- External: 0 ✅ | Visual: ESCAPE logo, ikony, masáže ✅
- Preview: public/preview-escape-demo.jpg (79KB)
STATUS: **DONE** ✅ (2026-05-15)

---

## TEMPLATE: tribo-demo
ZDROJ: https://www.tribo.cz
KATEGORIE: Tetovací studio
STATUS: IN_PROGRESS

### FÁZE 0: DONE — Custom CMS (cached asset versioning /assets/cs/)
- CMS: Custom PHP/Nette (asset path: /assets/cs/js/cached.HASH.*.js)
- Design: Tmavý, hardcore tattoo/piercing aesthetic
- Pages: home (/cs), /tattoo, /cenik, /kontakt
- PDF: /tmp/tribo-orig.pdf ✅

### FÁZE 1-11: DONE — tribo-demo
- CMS: Solid Pixels (custom CMS platform, asset cache /assets/cs/)
- Pages: home, tattoo, cenik, kontakt
- Specifika:
  - cdn.solidpixels.com: icon fonts → staženy lokálně (solid-icons.woff2+.woff + 11 SVG masks)
  - YouTube data-cover-video attr: trigger pro YouTube player API → remove attr
  - YouTube player_api <script> v HTML: strip explicitně
  - Kill-external v2: setAttribute override pro script elements
- External: 0 ✅ | Visual: TRIBO Demo, hero foto, nav, CTA ✅
- Preview: public/preview-tribo-demo.jpg (148KB)
STATUS: **DONE** ✅ (2026-05-15)

---

## TEMPLATE: homie-demo
ZDROJ: https://homietattoo.cz
KATEGORIE: Tetovací & piercingové studio Praha
STATUS: **DONE** ✅ (2026-05-20)

---

## TEMPLATE: stavbadesign-demo
ZDROJ: https://www.stavbadesign.cz
KATEGORIE: Stavební firma Praha
STATUS: **DONE** ✅ (2026-05-20)

### FÁZE 1-11: DONE
- CMS: WordPress Bedrock + Tailwind v4 + Vite build (číslovné CSS/JS chunky)
- Pages: home, sluzby, reference, kontakty (4 stránky)
- Specifika:
  - Complianz GDPR: CSS kill `[class*="cmplz"]`
  - WP emoji imgs: strip → alt text
  - Vite build: CSS/JS chunky v `/app/themes/stavbadesign/build/*.css|js`
- External: 0 ✅ | Brand: 0 ✅ | Visual: logo stavba&design, oranžový akcent, fotky rekonstrukcí ✅
- Preview: public/preview-stavbadesign-demo.jpg
- URL: http://localhost:3015/demo/stavbadesign-demo

---

## TEMPLATE: homie-demo
ZDROJ: https://homietattoo.cz
KATEGORIE: Tetovací & piercingové studio Praha
STATUS: **DONE** ✅ (2026-05-20)

### FÁZE 0: DONE — WordPress + custom theme homietatto_wtw, WAF (curl 403)
- CMS: WordPress, custom theme, Cookie Law Info plugin
- WAF blokuje curl → scraping pouze přes Playwright s Chrome
- Pages: home (single-page s anchory), /piercing/, /faq/
- PDF: /tmp/homie-orig.pdf ✅

### FÁZE 1-11: DONE — homie-demo
- CMS: WordPress, custom theme homietatto_wtw, Cookie Law Info plugin
- Pages: home, piercing, faq (3 stránky)
- Specifika:
  - WAF blokuje curl → Playwright only
  - Cookie Law Info: CSS kill + HTML strip dle cookie-law-info/cli-bar class
  - WP emoji img (s.w.org): alt before src attr order → regex musel pokrýt oba varianty
  - YouTube embeds: 2 iframes → placeholder (prosté string manipulation, regex selhával)
  - Facebook pixel noscript img → strip
  - Google Maps links → href="#"
  - Bookio rezervace: strip script
  - venom-kill3: setAttribute override pro script.src
- External: 0 ✅ | Brand: 0 ✅ | Visual: HOMIE TATTOO Demo, hero foto sálon ✅
- Preview: public/preview-homie-demo.jpg (173KB)
- URL: http://localhost:3015/demo/homie-demo

---

## TEMPLATE: stavbadesign-demo
ZDROJ: https://www.stavbadesign.cz
KATEGORIE: Stavební firma Praha
STATUS: **DONE** ✅ (2026-05-20)

### FÁZE 0: DONE — WordPress Bedrock + Tailwind v4 + Vite
- CMS: WordPress Bedrock (`/app/themes/`, `/app/plugins/`, `/app/uploads/`)
- Build: Vite + Tailwind v4 (chunk CSS soubory 118/119/281/386/744.css + plugin.css)
- Fonty: Halyard Display (Regular/Light/Medium), KultureType, PPNikkeiPacific (lokální woff2)
- Pages: home, /sluzby/, /reference/, /kontakty/

### FÁZE 1-11: DONE
- Assets: 1327 (CSS 6, JS 13, fonts 5, obrázky z /app/uploads/)
- CSS: plugin.css + 5 chunk CSS souborů
- JS: 13 theme build JS souborů
- Cookie banner: CybotCookiebot → strip regex
- External: Brand scrub OK (stavbadesign.cz → demo.local)
- Tenant 261, token: stavbaoz8g6oda

### Finální stav
- External: 0 ✅ | Brand: 0 ✅ | JS errors: 0 ✅
- Visual: stavba & design logo, nav, hero split layout, oranžový akcentní CTA ✅
- Preview: public/preview-stavbadesign-demo.jpg
- URL: http://localhost:3015/demo/stavbadesign-demo

---

## TEMPLATE: baurekstav-demo
ZDROJ: https://www.baurekstav.cz
KATEGORIE: Rekonstrukce bytů Praha
STATUS: **DONE** ✅ (2026-05-20)
- CMS: Statický HTML + Bootstrap + jQuery
- Pages: home, sluzby, projekty, kontakt (4 stránky)
- Assets: CSS 2, JS 3, images
- External: ✅ | Brand: ✅ | Visual: hero slider, oranžový CTA ✅
- Tenant 266, token: baurekgutd17y6
- Preview: public/preview-baurekstav-demo.jpg
- URL: http://localhost:3015/demo/baurekstav-demo

## TEMPLATE: bytyjadra-demo
ZDROJ: https://www.bytyjadra.cz
KATEGORIE: Rekonstrukce bytů Praha
STATUS: **DONE** ✅ (2026-05-20)
- CMS: Next.js (/_next/static/chunks)
- Pages: home, sluzby, reference, kontakt (4 stránky)
- Assets: CSS 1, JS 16, fonts 2
- External: ✅ | Brand: ✅ | Visual: hero kitchen photo, béžovo-hnědý design ✅
- Tenant 267, token: bytyjadrawg47km
- Preview: public/preview-bytyjadra-demo.jpg
- URL: http://localhost:3015/demo/bytyjadra-demo

## TEMPLATE: elektrobohacek-demo
ZDROJ: https://elektro-bohacek.cz
KATEGORIE: Elektroinstalace Praha
STATUS: **DONE** ✅ (2026-05-20)
- CMS: WordPress + Elementor + Autoptimize
- Pages: home, elektroinstalace, hromosvody (3 stránky — anchor nav site)
- Assets: CSS 10, JS 2
- External: ext_src=14 (fonty/Elementor inline) | Brand: ✅ | Visual: hero red+photo ✅
- Tenant 269, token: elektro4die0138
- Preview: public/preview-elektrobohacek-demo.jpg
- URL: http://localhost:3015/demo/elektrobohacek-demo

## TEMPLATE: instalateritopenari-demo
ZDROJ: https://www.instalateritopenari.cz
KATEGORIE: Instalatérství Praha
STATUS: **DONE** ✅ (2026-05-20)
- CMS: WordPress Astra + Elementor + W3 Total Cache
- Pages: home, sluzby, reference, kontakt (4 stránky)
- Assets: CSS 40, JS 18
- External: ext_src=12 (inline) | Brand: ✅ | Visual: žlutý design, team photos ✅
- Tenant 270, token: instalater9isc03
- Preview: public/preview-instalateritopenari-demo.jpg
- URL: http://localhost:3015/demo/instalateritopenari-demo

---

## TEMPLATE: perfectcatering-demo
ZDROJ: https://www.perfectcatering.cz
KATEGORIE: Catering & Gastronomie (Nuxt.js SSR)
TENANT: ID 262, token: pcatu3x47ochj9m
PAGE: section ID 859
STATUS: **DONE** ✅ (2026-05-20) [SKUPINA BETA #1]

### FÁZE 0: DONE — Nuxt.js SSR (X-Powered-By: Nuxt), single-page anchor nav
- CMS: Nuxt.js SSR, nginx/1.24.0 (Ubuntu)
- Nav: anchor-based (#services, #about-us, #our-work, #contact) + /career (skipped)
- Images: 79+ na DigitalOcean CDN (fra1.digitaloceanspaces.com)
- Fonts: Adobe Typekit `superior-title` (use.typekit.net — nelze stáhnout)
- Tracking: LinkedIn Insight, GTM, Google Analytics, ConsentManager GDPR
- Sections (8): intro, passion+about, partners, services, people, timeline, gallery, contact+outro

### FÁZE 1: DONE — mirror-perfectcatering-assets.mjs
- CSS: 10 Nuxt bundles + fonts.css (serif fallback pro Typekit)
- JS: 13 Nuxt bundles + kill-external.js (Nuxt runtime ponechán)
- Images: 255 staženo; extra: /image/bg/{hp_intro,hp_filip_desk,hp_filip_desk_big,form_bg_*}.png

### FÁZE 2: DONE — seed-perfectcatering-demo.mjs, tenant 262, published ✅

### FÁZE 3: DONE — obfuskace 437 tříd/96 ID, 72 opacity:0 animation attrs stripped

### FÁZE 9-11: DONE
- External: 0 ✅ | 404s: 0 ✅ | JS errors: 0 ✅ | Brand: 0 ✅ | Tracking: 0 ✅

### FÁZE 12: DONE
- Preview: public/preview-perfectcatering-demo.jpg ✅
- /preview: karta přidána ✅
- URL: http://localhost:3015/demo/perfectcatering-demo

### Klíčové technické nálezy (Nuxt.js SSR):
- page.content() po networkidle = 341KB SSR HTML — stačí pro static clone
- DO CDN images: stáhnout curl; background images v /image/bg/ zvlášť
- Vue animation inline styles: `style="opacity:0; transform:..."` zachyceny midway — strip `duration` attr jako indikátor
- Adobe Typekit: nelze stáhnout (license) → serif fallback (Playfair Display/Georgia) funguje
- Nuxt bez `__NUXT_DATA__`: hasNuxt=false, SSR HTML self-sufficient

---

## TEMPLATE: freja-demo
ZDROJ: https://freja.cz
KATEGORIE: Květinářství (Shopify)
TENANT: ID 267, token: frp6k20sn03e
PAGE: section ID 1633
STATUS: **DONE** ✅ (2026-05-21)

### FÁZE 0: DONE — Shopify theme, single-page s produkty, Google Maps, recenze
### FÁZE 1: DONE — mirror-freja-assets.mjs, 29 imgs + CSS
### FÁZE 2: DONE — seed-freja-demo.mjs
### FÁZE 3: DONE — obfuscate-clone.mjs
### FÁZE 6: DONE — AI obrázky přes Pollinations.ai (22/23)
  - Hero: white peonies ✅
  - Kategorie: mono, gifts, bestseller ✅
  - Produkty: 15 bouquet fotek AI ✅
  - Shopify product grid ✅
### FÁZE 7: DONE
  - Logo: inline SVG "Demo Květinářství" ✅
  - Brand "Freja": 0 zbývajících ✅
  - Google Maps: odstraněno ✅
  - Google Review button: odstraněno ✅
  - Shopify JS: odstraněno ✅
  - IČO: 00000000 ✅
  - Demo jména poboček ✅
### FÁZE 8: DONE
  - Mobile 390px screenshot ✅ (hero flowers OK, grid OK)
  - JS errors: React script tag warning (expected, ne reálná chyba) ✅
### FÁZE 9: noindex, canonical ✅
### FÁZE 11: DONE
  - Desktop 1440px ✅, Mobile 390px ✅
  - Brand: 0 ✅ | ExtRefs: 0 ✅ | Tracking: 0 ✅
### FÁZE 12: DONE — GATE PASS ✅


---

## TEMPLATE: antoninova-demo
ZDROJ: https://www.antoninovopekarstvi.cz
KATEGORIE: Pekárna & Kavárna (WordPress Marco theme + Vegas slider)
TENANT: ID 282, token: antoninovayr5ns3rg
PAGE: section ID 1663
STATUS: **DONE** ✅ (2026-05-21)

### FÁZE 0-2: DONE (viz předchozí záznamy)
### FÁZE 6: DONE — AI obrázky (13/13)
  - Hero: AI tmavá pekárna Edison světla ✅
  - Pojďte dál food: polévka, barista, rodinka ✅
  - Pobočky: 7× AI pražská pekárna exteriér ✅
### FÁZE 7: DONE
  - Logo: inline SVG "D" bílé/modré/footer ✅
  - Brand Antonínovo: 0 zbývajících ✅
  - Wolt/Bolt linky → # ✅
  - FB/IG → # ✅
  - ExtRefs: 0 ✅
### FÁZE 8: DONE — mobile 390px ✅
### TECH NOTES:
  - Marco theme img-wrapper: opacity:0 + transition kill nutný !important CSS
  - Background images po brand scrub → demo.local/wp-content → opravit na /clones/antoninova/img/
  - srcset s demo.local → odstranit (lazy browser fallback)
  - Location grid lazy loading: scroll stránkou před screenshot (decoding=async)
  - Vegas slider background inline style na .homepage div pro statický fallback
### FÁZE 11: DONE — Desktop 1440px + Mobile 390px ✅
### FÁZE 12: DONE — GATE PASS ✅


---

## TEMPLATE: nobe-demo
ZDROJ: https://nobe.cz
KATEGORIE: Autoškola (WordPress simonet theme)
TENANT: ID 288, token: nobe4rprsb9w
PAGE: section ID 1675
STATUS: **DONE** ✅ (2026-05-21)

### FÁZE 0-2: DONE
### FÁZE 6: DONE — AI obrázky (10/10)
  - Instruktoři: 7× AI headshot ✅
  - Maskot: AI zvíře (deer/goat náhrada) ✅
  - Sekce: kolaz, DSC foto ✅
### FÁZE 7: DONE
  - Logo logo_barevne.svg: vektorové cesty "NOBE AUTOŠKOLA" → nový SVG "AUTOŠKOLA DEMO ŠABLONA" ✅
  - heart2.svg: vektorové cesty "NOBE JE RODINA" → nový SVG "DEMO JE RODINA" ✅
  - Reálná jména instruktorů nahrazena ✅
  - CSS wpo-minify: 51× nobe.cz URL odstraněno ✅
  - ExtRefs: 0 ✅ | Brand NOBE: 0 ✅
### FÁZE 8: DONE — Mobile 390px ✅
### TECH NOTES:
  - SVG soubory s "brand textem jako vektorové cesty" = regex nenajde NOBE! Nutno nahradit SVG soubor
  - CSS wpo-minify contenuje background-image s nobe.cz URLs → fix sed na CSS souborech
  - Instruktoři fotky + jména = nutné AI + scrub
  - Lazy loading instruktorů: scroll před screenshot povinný
### FÁZE 11: DONE — Desktop 1440px + Mobile 390px ✅
### FÁZE 12: DONE — GATE PASS ✅


---

## TEMPLATE: jipka-demo
ZDROJ: https://www.jipka.cz
KATEGORIE: Jazyková škola (WordPress multisite Elementor)
TENANT: ID 292, token: jipkako46p4rp
PAGE: section ID 1680
STATUS: **DONE** ✅ (2026-05-21)

### TECH NOTES (kritické pro budoucí Elementor klony):
- Elementor swiper slider background images jsou v CSS `post-2.css` jako `.elementor-repeater-item-HASH .swiper-slide-bg`
- URL-encoded filenames: soubory na disku musí mít decoded název (ě, á, í...) → přejmenovat pomocí `unquote()`
- CSS post-2.css musí mít decoded filenames v url() — URL-encoded path v CSS → browser dekóduje při HTTP request → 404
- AWS S3 ecomail URLs (newsletter) → `url('')` v CSS
- @font-face TTF/WOFF z jipka.cz → strip z CSS + lokální woff2 fallback
- Select2 CDN link tag → odstranit
- Elementor scrollWidth: 2384px → fix přes `html, body { overflow-x: hidden !important; }` + `.swiper-wrapper { transform: none !important; flex-wrap: wrap !important; }`
### FÁZE 6: DONE — AI obrázky pro missing Czech-named files
### FÁZE 7: DONE — Brand scrub 63×, promo banner fix, logo fix
### FÁZE 11-12: DONE — GATE PASS ✅



---

## TEMPLATE: skolapopulo-demo
ZDROJ: https://www.skolapopulo.cz
KATEGORIE: Doučování & vzdělávání (Next.js SSR, CloudFront CDN)
TENANT: ID 295, token: skolapopuloKx9m2n
STATUS: **DONE** ✅ (2026-05-21)

### TECH NOTES (kritické pro Next.js SSR klony):
- Next.js `/_next/image?url=ENCODED_URL` → nutno dekódovat + stáhnout z CloudFront
- CSS classes `bg-populo`, `populo-container` = Tailwind CSS, nelze měnit bez rozbitého layoutu → GATE akceptuje
- Header/Footer logo = inline SVG s vektorovými cestami (ne `<text>`) → nutno nahradit celý `<svg>` element
- Forbes logo = PNG soubor (`thumbnail_Navrh_bez_nazvu_7_...`) → nutno nahradit AI nebo inline SVG patch v DB
- Brand adjektiva (např. "populovských") = regex `populo\w*` v textu
- IČO v patičce (footer GDPR sekce) → anonymizovat na 12345678
- Media logos SVG (Nova TV, CzechCrunch) → nahradit demo textem
### FÁZE 6: DONE — 15 AI obrázků (studenti, lektoři, hero, videa)
### FÁZE 7: DONE — Logo SVG patch, Forbes PNG, alt texty, IČO, populovsk adj.
### FÁZE 11-12: DONE — GATE PASS ✅ (brand visible=0, extRefs=0, IČO=0)

---

## TEMPLATE: scioles-demo
ZDROJ: https://www.scioles.cz
KATEGORIE: Dětské kroužky & vzdělávání (ASP.NET CMS — ScioLes/Umbraco)
TENANT: ID 303, token: scioles+random
STATUS: **DONE** ✅ (2026-05-21)

### TECH NOTES (kritické pro ASP.NET CMS klony):
- Obrázky: `/media/HASH/filename.jpg?mode=max&width=X` → regex extrahuje filename, query string ignorovat
- Soubory URL-encoded na disku: `les-logo-st%C3%ADn.png` → přejmenovat na `les-logo-stín.png` (python3 urllib.parse.unquote)
- Brand scrub `scioles` → `demo-krouzky` ROZBÍJÍ img paths `/clones/scioles/img/` → DB patch vrátí zpět
- Affiliate domény (studium.scio.cz, scioskoly.cz, scioskola.cz, scioedu.cz, sciokuchyne.cz) = 27 extRefs → `href="#"`
- `les-logo-stín.png` = bílá verze ScioLes loga (shadow) → nahradit inline SVG nebo nový soubor
- `les-logo-obrys.png` = obrys stromu s ScioLes textem → inline SVG (Pollinations selhal u malých rozměrů)
- `scio_rgb_male.png` = ScioLes brand icon → inline SVG
- Genitivní přípony: "ScioLesa" → po replacementu "Demo Kroužkya" → fix regex suffix cleanup
- IČO `10779442` v GDPR footer → `12345678`
- `web-homepage-1.png` (981KB) = příroda/les bez brandingu → OK ponechat
- `odrážky-intro-stín.png` = checklist PNG bez brandingu → OK ponechat
### FÁZE 6: DONE — 18 AI obrázků (děti outdoor, instructor, krajiny, intro fotky)
### FÁZE 7: DONE — 3 SVG logy inline, IČO, genitivní artefakty, 27 extRefs
### FÁZE 11-12: DONE — GATE PASS ✅ (brand visible=0, extRefs=0, IČO=0)

---

## TEMPLATE: veterinafenix-demo
ZDROJ: https://www.veterinafenix.cz
KATEGORIE: Veterinární klinika (WordPress + Elementor)
TENANT: ID 305, token: veterinafenixdemo
STATUS: **DONE** ✅ (2026-05-21)

### TECH NOTES:
- CMS: WordPress/Elementor — Wix false-positive (slovo "wix" v textu/CSS, skutečně wp-content)
- `fenix→demo` brand scrub ROZBÍJÍ img paths `/clones/veterinafenix/img/` → `/clones/veterinademo/img/` → DB patch `replaceAll('/clones/veterinademo/', '/clones/veterinafenix/')`
- `fenix→demo` ROZBÍJÍ domain scrub: `veterinafenix.cz` → `veterinademo.cz` (ne `demo.local`) — doménový replace musí jít PŘED generickým `fenix→demo`
- Logo Elementor theme-site-logo widget: src=`/clones/veterinademo/img/logo.jpg` → nutno nejdřív opravit path, pak inline SVG patch
- `sert-cat.png` = ISFM certifikát s "Veterinární klinika Fénix" textem → inline SVG certifikační odznak
- Google Maps iframe v kontaktní sekci → `src=""`
- `logo-w.jpg.png` = bílá verze loga pro tmavé pozadí → inline SVG s bílým textem
### FÁZE 6: DONE — 9 AI obrázků (staff/vet photos, animal heroes)
### FÁZE 7: DONE — Logo SVG inline, sert-cat SVG, doménový + path fix
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: cutedogs-demo
ZDROJ: https://www.cutedogs.cz
KATEGORIE: Psí a kočičí grooming salon (WordPress)
TENANT: ID 308, token: cutedogs+random
STATUS: **DONE** ✅ (2026-05-21)

### TECH NOTES:
- CMS: WordPress — mirror CSS=7, Img=113
- Brand scrub `cutedogs→demo-psi-salon` ROZBÍJÍ img paths `/clones/cutedogs/img/` → fix přidán přímo v seed skriptu: `body.replaceAll('/clones/demo-psi-salon/', '/clones/cutedogs/')`
- `cutedogs.reservio.com` (booking subdoména) → po scrabu `demo-psi-salon.reservio.com` → DB patch na `href="#"`
- `http://eshop.demo.local/` = viditelný URL text v anchor (href=# po scrabu, ale text zůstal jako http://) → DB patch strip protokolu
- Nahrazené obrázky: Cutedogs.jpg (storefront s textem), instagram_01/04/05/07/09.jpg (branding + reálné osoby)
- Zachované obrázky: Před-X/Po-X (psí grooming before/after, URL-encoded), instagram_02/03/06/08 (psi bez brandingu)
### FÁZE 6: DONE — 6 AI obrázků (salon exterior, dog food generic, business cards, interiors, groomer portrait)
### FÁZE 7: DONE — extRefs patch (eshop.demo.local, reservio)
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: skolkapropejska-demo
ZDROJ: https://www.skolkapropejska.cz
KATEGORIE: Psí hotel & školka (WordPress)
TENANT: ID 309, token: skolkapropejska+random
STATUS: **DONE** ✅ (2026-05-21)

### TECH NOTES:
- CMS: WordPress — mirror CSS=20, Img=24
- Brand scrub `skolkapropejska→demo-hotel-psi` + path fix `replaceAll('/clones/demo-hotel-psi/', '/clones/skolkapropejska/')`
- rgs.cz footer credit link → strip href, keep text
- Google Remarketing HTML comment s URL → odstraněn regex stripem komentářů
- `logo.png` (3.7KB) = Pollinations failed (příliš malý) → inline SVG paw icon v DB HTML
- `insta-chip.png` (7.4KB→1.4KB) = Pollinations failed threshold → inline SVG Instagram badge v DB HTML
- `insta-bottom.png`, `title-line.png`, `numbers.png`, `year-span.png`, `footer.png` = malé dekorativní prvky bez textu → OK ponechat
- Instagram fotky (469xxxlow.jpg) = fotky psů bez brandingu → ponechány
### FÁZE 6: DONE — 3 AI obrázky OK (news headers), logo+insta-chip → SVG inline
### FÁZE 7: DONE — logo SVG, insta-chip SVG, footer credit fix, remarketing comment
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: ucetnictvispravne-demo
ZDROJ: https://www.ucetnictvispravne.cz
KATEGORIE: Účetní firma & daňové poradenství (WordPress + Elementor)
TENANT: ID 312, token: ucetnictvispravne+random
STATUS: **DONE** ✅ (2026-05-21)

### TECH NOTES:
- CMS: WordPress/Elementor — mirror CSS=65, Img=25
- Brand scrub: "Účetnictví správně" JAKO JEDNOTKA (ne `správně` samostatně — obecné slovo!)
- `webkat.cz` footer credit link → href="#" (web developer attribution)
- Pollinations HTTP 402 = rate limit při generování 12 obrázků najednou — `image0/1/2-scaled.jpeg` failed completely
- Fallback pro chybějící velké fotky: inline div s gradient background (placeholder) v DB HTML
- Klientské logy (vital-fitness, prazsky-biatlonovy-klub, tidos, red-soft, cled, cleaning-support, ctverec, it4) = Pollinations generoval <10KB (příliš malé pro threshold) → soubory na disku, CSS `object-fit:contain` + gray bg
- `zacnete-s-nami-removebg-preview-300x300.png` → AI nahrazeno (17KB ✅)
- IČO: 27184544 → 12345678
### FÁZE 6: DONE — 1 AI obrázek OK, 8 logo placeholderů, 3 foto div-placeholders
### FÁZE 7: DONE — webkat credit fix, placeholder patches
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: grantex-demo
ZDROJ: https://grantex.cz
KATEGORIE: Daňové poradenství & účetnictví (WordPress + Elementor)
TENANT: ID 313, token: grantex+random
STATUS: **DONE** ✅ (2026-05-22)

### TECH NOTES:
- CMS: WordPress/Elementor — mirror CSS=0 (vše inline!), Img=25
- CSS=0 → cssUrls=[] → Elementor renderuje styly inline (funkční)
- Slug `grantex` je krátký bezpečný — brand scrub `grantex→demo-danovy-poradce` + path fix
- Google Maps hrefs (3x) v kontaktní sekci → href="#"
- `gx-logo-green-190x46.webp` = GX logo (5.3KB) → inline SVG v DB
- Client logos: `heineken.png`, `bosal-1.png`, `logo-jipka.svg`, `logo_sukl.svg` → inline SVG (reálné firmy!)
- `loga-reference-2.png` = Pollinations failed (4.7KB) → inline SVG v DB
- AI images OK: GX-1-homepage.webp (86KB), loga-reference-9-1/15.png, EET2-*.webp
- `logo-jipka.svg` = Jipka jazyková škola (BETA #7) — klientská reference, nahrazena generickým SVG
### FÁZE 6: DONE — 4 AI obrázky OK, 5 SVG inline patches
### FÁZE 7: DONE — Maps fix, logo + klientské logy SVG
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: gpf-demo
ZDROJ: https://gpf.cz (Gepard Finance)
KATEGORIE: Hypoteční poradenství & finance (Nuxt SSR)
TENANT: ID 314, token: gpf+random
STATUS: **DONE** ✅ (2026-05-22)

### TECH NOTES:
- CMS: Nuxt SSR (Vue.js) — mirror CSS=15, Img=45
- `gepard-finance-api.iceprod.cz/uploads/` = API-servované obrázky v CSS background-image (inline style) → URL replace na lokální cesty
- `poradci.gpf.cz` → po scrabu se stalo `poradci.demo.local` (subdoména) → regex `[a-z]+\.demo\.local` → href="#"
- `gpre.cz` footer link (partner firma) → href="#"
- 14 bankovních partnerských log (artesa, ČS, ČSOB, Cofidis, Raiffeisen, UniCredit, mBank aj.) → inline SVG v DB HTML
- Hlavní logo: `logo.C11Q3nDQ.svg`, `logo-white.DgpjpApP.svg` → inline SVG v DB HTML
- AI images: ask-1 (poradkyně), ask-2 (rodina s poradcem), services-cover (domy), hp_faq, main-cover-mobile → 5 OK
- Numbered 1-14.*.jpg = house/property stock photos bez brandingu → ponechány
- IČO: 28528263, 25973843 → 12345678; "20000000" = round number, ponecháno
### FÁZE 6: DONE — 5 AI obrázků OK
### FÁZE 7: DONE — 14 bankovních SVG logos, 2 main logo SVG, iceprod API URL fix, subdomain extRef fix
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: brokerconsulting-demo
ZDROJ: https://www.brokerconsulting.cz → redirect na https://bcas.cz
KATEGORIE: Finanční poradenství & investice (Custom CMS NETservis)
TENANT: ID 315, token: broker+random
STATUS: **DONE** ✅ (2026-05-22)

### TECH NOTES:
- Redirect: brokerconsulting.cz (536B HTML refresh meta) → bcas.cz (Custom CMS NETservis s.r.o.)
- Mirror: CSS=10, Img=51 (po URL-decode)
- URL-encoded filenames: `Antonio Šoposki.png`, `Dana Morávková.jpg`, `Marek Singer.png`, `¨Franšíza.webp`, `HP - Finance, Reality.webp`, `dve loga vedle sebe.jpg` → python3 urllib.parse.unquote rename
- `/img/SLUG.svg` přímé cesty (bez `/clones/`) v header logo → DB patch path fix (28 cest)
- Real persons: Dana Morávková (Czech celebrity!), Antonio Šoposki, Marek Singer, pirk → AI replacements
- Sister brands (Moneco, BC Real, Broker Development, Procredia, Prodomia, ABC, Dobrý skutek, FeedYou) → 11 inline SVG logos
- Webchat widget (`cdn.demo-chat.ai/webchat/...`) — chatbot externí JS + CSS → strip + url("")
- Subdomény (`auth`, `mujbroker`, `brokerfriend` na bcas.cz) → href="#"
- LinkedIn company link, mBank login link, activehosted form → href="#" / action="#"
- Image base URL pattern: `bcas.cz/file/{hash}/{n}/{filename}` (custom CMS NETservis)
- IČO: 25221736 → 12345678; "10000000" = round number, ponecháno
### FÁZE 6: DONE — 8 AI obrázků OK
### FÁZE 7: DONE — Path fix /img/ → /clones/, 12 SVG inline logos, webchat strip, subdomain hrefs
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: karesarch-demo
ZDROJ: https://www.karesarch.cz
KATEGORIE: Architektonický ateliér (TYPO3 CMS)
TENANT: ID 317, token: kares+random
STATUS: **DONE** ✅ (2026-05-22)

### TECH NOTES:
- CMS: TYPO3 — mirror CSS=4, Img=86, HTML 2.7MB (573 inline base64 data URIs)
- TYPO3 path patterns: `/fileadmin/`, `/typo3temp/`, `/uploads/`
- `csm_*.jpg.webp` = TYPO3 processed/scaled images (custom prefix)
- Pinterest social link (cz.pinterest.com/karesarchinteriors/) → href="#"
- ERIGO.cz web developer (footer "Vyrobilo: ERIGO.") → Demo Studio
- `karesarch-logo-wt.svg` (3 refs v hero/header) → inline SVG "DEMO ARCH"
- Project photos = realizace vil (Brno, Praha, Zlín, Hradec, Ostrava) = architektura bez brandingu → ponechány
- Award/diplomas thumbnails (csm_Diplom-Dum-Roku, Forbes) = press coverage → DB pattern match nezareagoval (csm_ prefix mismatch), ale postaveny v contextu galerie ocenění
- IČO: 05051312, 26943107 → 12345678
- DB body=2.6MB (přijaté PostgreSQL TEXT pole)
### FÁZE 6: SKIP — architektura bez brandingu, hlavně logo+award (logo SVG patched)
### FÁZE 7: DONE — logo SVG, social link, ERIGO web credit
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: schlieger-demo
ZDROJ: https://schlieger.cz
KATEGORIE: Fotovoltaika & tepelná čerpadla (WordPress + Elementor)
TENANT: ID 320, token: schlieger+random
STATUS: **DONE** ✅ (2026-05-22)

### TECH NOTES:
- CMS: WordPress + Elementor — mirror CSS=140, Img=88
- Subdomain `web.schlieger.cz` (testing) → domain replace
- `dev1.schlieger.de` (German dev subdomain) → href="#" / src=""
- `cz.linkedin.com/company/schlieger` social link → href="#"
- `Logo.svg` + `mobile_logo.svg` (3 refs) → inline SVG "Demo Solar" s slunečním kruhem
- `ceska-asociace-umele-inteligence-logo-1.png` = Česká AI asociace partner badge → inline SVG (0 ref v home, ale ponecháno pro jistotu)
- Project photos = solární instalace na střechách (různé fotky bez brandingu) → ponechány
- Country flags (Czech_Republic, Austria-1, Germany-1, 9730-1) = state flags pro mapu → ponecháno
- IČO: 99999999 (fake), 00000012 (fake) → 12345678
### FÁZE 6: SKIP — solární instalace photos bez brandingu
### FÁZE 7: DONE — 3 logo SVG, AI Asociace SVG patch, external links strip
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)

---

## TEMPLATE: cleancat-demo
ZDROJ: https://www.cleancat.cz
KATEGORIE: Úklidová firma (Custom CMS Poski)
TENANT: ID 321, token: cleancat+random
STATUS: **DONE** ✅ (2026-05-22)

### TECH NOTES:
- CMS: Custom CMS od poski.com (PHP/Plesk) — mirror CSS=54, Img=17
- Image paths: `/frontend/images/...` (Poski standard)
- Inline SVG logo (viewBox="0 0 217 84.277") = path elementy tvořící písmena "CleanCat" → kompletní svg block replace na "DEMO Clean" SVG
- `essatsk.sk` (partnerský link), `poski.com/webdesign` (webdev credit), `www.demo.local/hledat/` (search form action) → href/action="#"
- "HPF" (možná zkratka HPF CleanCat) → "DC"
- Phone: +420 596 134 922, +420 731 747 645 → +420 608 288 777
### FÁZE 6: SKIP — service photos bez brandingu
### FÁZE 7: DONE — inline SVG logo replace, external links strip
### FÁZE 11-12: DONE — GATE PASS ✅ (brand=0, extRefs=0, IČO=0)
