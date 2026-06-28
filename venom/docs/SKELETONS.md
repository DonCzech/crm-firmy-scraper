# SKELETONS — Pevná kostra sekcí per kategorie

**Datum:** 2026-05-27
**Účel:** Závazný pořadový rámec sekcí pro každou ze 6 kategorií šablon. Sonnet při převodu šablony **NEVYTVÁŘÍ** sekce v náhodném pořadí — řídí se kostrou své kategorie a originálním layoutem zároveň.

---

## 🧭 Pravidla použití skeletonu

1. **Skeleton definuje KATALOG dovolených section types pro danou kategorii** (např. service-personal smí mít navbar, hero, about, services, pricing, gallery, team, testimonials, cta, contact, faq, footer). Šablona nesmí používat type mimo tento katalog bez záznamu v `template.json:extraSections[]`.
2. **Pořadí sekcí v `template.json` SLEDUJE pořadí originálu** (1:1 vizuální parita s `/preview` je priorita). Skeleton uvádí *doporučené* pořadí pro kategorii, ne vynucené.
3. **Pokud se pořadí originálu liší od skeleton pořadí**, zaznamená se to v `template.json:sectionOrderNote` (textový důvod). Validátor varuje, ale neselže — parita > skeleton order.
4. **Pokud originál sekci ze skeletonu nemá**, vynechá se přes `manifest.skippedSections[]` (`{ "pos": N, "name": "...", "reason": "..." }`). Validátor pak danou skeleton pozici nevyžaduje.
5. **Pokud originál má sekci, kterou skeleton nezná**, zařadí se do `manifest.extraSections[]` s důvodem. Validátor ji povolí.
6. **Každá sekce má závazný `section type` ve sdíleném engine** (`src/sections/registry.ts`). Pokud type neexistuje, nejdřív se přidá do engine, pak teprve do šablony.

---

## 📚 6 kategorií + mapování na queue (91 šablon)

### 1. `service-personal`
**Pro koho:** služby s osobním kontaktem, kde klient přichází za řemeslem/péčí o tělo/vzhled.
**Kategorie z queue:** Barbershop, Kadeřnictví, Beauty & Wellness, Masáže, Tetování, Nehty, Kosmetické kliniky, Fitness, Fyzioterapie.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero (varianty: full-bleed | split | slider | video)
3.  About               about (kdo jsme, příběh)
4.  Services            services (co děláme — bez cen)
5.  Pricing             pricing (ceník)
6.  Gallery             gallery (fotky práce / interiér)
7.  Team                team (zaměstnanci / barbeři / terapeuti)
8.  Testimonials        testimonials (recenze)
9.  Booking / CTA       cta-booking
10. Locations           locations (pobočky, mapa, otevírací doba)
11. FAQ                 faq
12. Footer              footer
```

**Šablony z queue (id):** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 43, 44, 45

---

### 2. `gastro`
**Pro koho:** stravování — host přichází jíst/pít, hlavní obsah je menu + atmosféra.
**Kategorie z queue:** Restaurace, Kavárna, Pekárna, Cukrárna, Catering, Pizzerie.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero
3.  About               about (koncept, příběh)
4.  Menu                menu (jídelní/nápojový lístek = Services + Pricing v jednom)
5.  Gallery             gallery (interiér, jídlo)
6.  Reservations / CTA  cta-reservation (rezervace stolu)
7.  Locations           locations (adresa, mapa, otevírací doba)
8.  Testimonials        testimonials
9.  Events              events (volitelně — degustace, akce)
10. FAQ                 faq
11. Footer              footer
```

**Šablony z queue (id):** 26, 27, 28, 29, 30, 31, 32, 33, 53, 55, 56, 91

---

### 3. `b2b-trade`
**Pro koho:** řemeslo/služba pro domácnost/firmu, kde klient nepřichází osobně — objedná, řemeslník přijede.
**Kategorie z queue:** Autoservis, Stavebnictví, Rekonstrukce, Elektroinstalace, Instalatérství, Topenářství, Klimatizace, Fotovoltaika, Podlahy, Malíři, Klempíři, Zahradnictví, Arboristika, Úklid, Deratizace.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero
3.  Services            services (co děláme — výpis prací)
4.  About               about
5.  Process             process (jak to probíhá — kroky 1-4)
6.  Pricing / Estimate  pricing | cta-estimate (ceník nebo CTA na poptávku)
7.  Portfolio           portfolio (realizace, předtím/potom)
8.  Testimonials        testimonials
9.  Contact / CTA       cta-contact (poptávkový formulář)
10. Service area        service-area (mapa působnosti)
11. FAQ                 faq
12. Footer              footer
```

**Šablony z queue (id):** 40, 41, 42, 48, 49, 50, 51, 52, 54, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82

---

### 4. `professional`
**Pro koho:** odborné poradenství, kde se prodává důvěra/expertíza, ne hmatatelný produkt.
**Kategorie z queue:** Advokáti, Daňové poradenství, Účetnictví, Hypoteční/Finanční poradci, Architekti.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero
3.  Services            services (oblasti expertízy)
4.  About / Team        about-team (kombinovaná sekce — partneři + příběh)
5.  Cases               cases (reference, případové studie)
6.  Process             process
7.  CTA / Contact       cta-contact
8.  Testimonials        testimonials
9.  Insights / Blog     insights (volitelně — odborné články)
10. FAQ                 faq
11. Footer              footer
```

**Šablony z queue (id):** 46, 47, 64, 65, 66, 67, 68

---

### 5. `real-estate`
**Pro koho:** prodej/pronájem nemovitostí + ubytování. Hlavní obsah = výpis nabídek + kontakt na makléře.
**Kategorie z queue:** Realitní kanceláře, Realitní makléři, Ubytování, Hotely, Apartmány.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero-search (s vyhledávačem nemovitostí)
3.  Listings            listings (aktivní nabídky)
4.  About / Team        about-team
5.  Services            services (prodej / pronájem / odhad)
6.  Process             process
7.  Testimonials        testimonials
8.  CTA / Contact       cta-contact
9.  FAQ                 faq
10. Footer              footer
```

**Šablony z queue (id):** 34, 35, 36, 37, 38, 39, 83, 84, 86

---

### 6. `health`
**Pro koho:** zdravotní péče (humánní + veterinární). Důraz na kvalifikaci + tým + bezpečnost.
**Kategorie z queue:** Zubaři, Ortodoncie, Veterinární kliniky, Psí grooming, Psí hotely.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero
3.  Services            services (zákroky / služby)
4.  About / Team        about-team (lékaři, kvalifikace)
5.  Pricing             pricing (pokud má)
6.  Before/After        before-after (volitelně — gallery varianta)
7.  Booking / CTA       cta-booking
8.  Testimonials        testimonials
9.  Locations           locations
10. FAQ                 faq
11. Footer              footer
```

**Šablony z queue (id):** 61, 62, 63

---

### 7. `events-media` *(7. doplněná kategorie — vznikla z queue)*
**Pro koho:** kreativní služby pro eventy/produkci — fotograf, videograf, DJ, event agentura.
**Kategorie z queue:** Fotograf, Videograf, DJ, Event Agency.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero (často video/showreel)
3.  Portfolio           portfolio (klíčová sekce — práce/showreel)
4.  Services            services (svatby / firemní / soukromé)
5.  About               about
6.  Process             process
7.  Pricing / Packages  pricing
8.  Testimonials        testimonials
9.  CTA / Booking       cta-booking
10. FAQ                 faq
11. Footer              footer
```

**Šablony z queue (id):** 87, 88, 89, 90

---

### 8. `education` *(8. doplněná kategorie)*
**Pro koho:** autoškola, jazykové školy, doučování, dětské kroužky.

**Skeleton:**
```
1.  Header              navbar
2.  Hero                hero
3.  Courses             courses (Services varianta — kurzy/lekce)
4.  About / Team        about-team (lektoři)
5.  Process             process (jak studium probíhá)
6.  Pricing             pricing (cena kurzů)
7.  Testimonials        testimonials
8.  CTA / Enrollment    cta-enrollment (přihláška)
9.  Locations           locations
10. FAQ                 faq
11. Footer              footer
```

**Šablony z queue (id):** 57, 58, 59, 60

---

### 9. `e-shop` *(9. doplněná kategorie — pro Květinářství 54)*
Šablony které mají primárně e-shop integrovaný do prezentace.

**Skeleton:**
```
1.  Header              navbar (s košíkem)
2.  Hero                hero
3.  Categories          categories (kategorie produktů)
4.  Featured products   products-featured
5.  About               about
6.  Services            services (volitelně — donáška, dárkové balení)
7.  Testimonials        testimonials
8.  CTA / Newsletter    cta-newsletter
9.  Locations           locations
10. FAQ                 faq
11. Footer              footer
```

**Šablony z queue (id):** 54

---

## 📐 Tabulka: queue id → skeleton

| ID | Slug | Kategorie z queue | Skeleton |
|----|------|-------------------|----------|
| 1 | peak-cut | Barbershop | service-personal |
| 2 | the-barber | Barbershop | service-personal |
| 3 | fade-room | Barbershop | service-personal |
| 4 | barber-praha | Barbershop | service-personal |
| 5 | studio-jarka | Kadeřnictví | service-personal |
| 6 | hairsalon-no1 | Kadeřnictví | service-personal |
| 7 | petramechurova | Kadeřnictví | service-personal |
| 8 | selfbeauty | Beauty & Wellness | service-personal |
| 9 | praha-masaze | Masáže | service-personal |
| 10 | ananda | Ayurvéda & Wellness | service-personal |
| 11 | tawan | Thajské masáže | service-personal |
| 12 | escape | Thajské masáže | service-personal |
| 13 | tribo | Tetování & Piercing | service-personal |
| 14 | homie | Tetování & Piercing | service-personal |
| 15 | magic | Tetování & Piercing | service-personal |
| 16 | soho | Nehtové studio | service-personal |
| 17 | celebrate | Nehtové studio | service-personal |
| 18 | maidenstudio | Nehtové studio | service-personal |
| 19 | esthesia | Kosmetická klinika | service-personal |
| 20 | bomton | Kosmetická klinika | service-personal |
| 21 | yesvisage | Kosmetická klinika | service-personal |
| 22 | linda | Fitness | service-personal |
| 23 | victory | Fitness | service-personal |
| 24 | fyziovsem | Fyzioterapie | service-personal |
| 25 | resetclinic | Fyzioterapie | service-personal |
| 26 | ambi-bistro | Restaurace | gastro |
| 27 | hybernska | Restaurace | gastro |
| 28 | lacasa-latina | Restaurace | gastro |
| 29 | cafe-savoy | Kavárna | gastro |
| 30 | zrno-zrnko | Pekárna & Kavárna | gastro |
| 31 | costa-coffee | Kavárenský řetězec | gastro |
| 32 | coffee-room | Specialty kavárna | gastro |
| 33 | cathedral-cafe | Kavárna & Restaurace | gastro |
| 34 | lexxus-norton | Reality | real-estate |
| 35 | fer-makleri | Reality | real-estate |
| 36 | reality-skutovi | Reality | real-estate |
| 37 | quantum-reality | Reality | real-estate |
| 38 | jan-srubar | Reality makléř | real-estate |
| 39 | ondrej-kucera | Reality makléř | real-estate |
| 40 | best-drive | Autoservis | b2b-trade |
| 41 | autoservis-garant | Autoservis | b2b-trade |
| 42 | autoservis-tomas | Autoservis | b2b-trade |
| 43 | magic-smile | Zubní klinika | health |
| 44 | svet-rovnatek | Ortodoncie | health |
| 45 | perfect-smile | Ortodoncie | health |
| 46 | havel-partners | Advokátní kancelář | professional |
| 47 | rowan-legal | Advokátní kancelář | professional |
| 48 | stavbadesign | Stavební firma | b2b-trade |
| 49 | baurekstav | Rekonstrukce | b2b-trade |
| 50 | bytyjadra | Rekonstrukce | b2b-trade |
| 51 | elektrobohacek | Elektro | b2b-trade |
| 52 | instalateritopenari | Instalatér | b2b-trade |
| 53 | perfectcatering | Catering | gastro |
| 54 | freja | Květinářství | e-shop |
| 55 | ovocnysvetozor | Cukrárna | gastro |
| 56 | antoninova | Pekařství | gastro |
| 57 | nobe | Autoškola | education |
| 58 | jipka | Jazyková škola | education |
| 59 | skolapopulo | Vzdělávání | education |
| 60 | scioles | Dětské kroužky | education |
| 61 | veterinafenix | Veterinární klinika | health |
| 62 | cutedogs | Psí grooming | health |
| 63 | skolkapropejska | Psí hotel | health |
| 64 | ucetnictvispravne | Účetnictví | professional |
| 65 | grantex | Daňové poradenství | professional |
| 66 | gpf | Hypoteční poradce | professional |
| 67 | brokerconsulting | Finanční poradce | professional |
| 68 | karesarch | Architektonický ateliér | professional |
| 69 | schlieger | Fotovoltaika | b2b-trade |
| 70 | cleancat | Úklid | b2b-trade |
| 71 | vestop | Topenářství | b2b-trade |
| 72 | pragoclima | Klimatizace | b2b-trade |
| 73 | acheating | Tepelná čerpadla | b2b-trade |
| 74 | greensie | Fotovoltaika | b2b-trade |
| 75 | supellex | Podlahy & E-shop | b2b-trade |
| 76 | petrovomalovani | Malíř | b2b-trade |
| 77 | klempirzprahy | Klempíř | b2b-trade |
| 78 | gerberra | Zahradnictví | b2b-trade |
| 79 | polgarden | Realizace zahrad | b2b-trade |
| 80 | lesarb | Arboristika | b2b-trade |
| 81 | modryzralok | Úklid | b2b-trade |
| 82 | deratizace | Deratizace | b2b-trade |
| 83 | chaletmilada | Ubytování | real-estate |
| 84 | palacehotel | Boutique Hotel | real-estate |
| 85 | malirstvibastar | Malíř | b2b-trade |
| 86 | hotelatlantis | Hotel & Wellness | real-estate |
| 87 | zbiralova | Fotograf | events-media |
| 88 | honzakamenar | Videograf | events-media |
| 89 | vasdj | DJ | events-media |
| 90 | amdenevents | Event Agency | events-media |
| 91 | corleone | Pizzerie | gastro |

---

## 🛡️ Validace skeletonu

Skript `scripts/validate-template.mjs` musí ověřit:
- `template.json:sections[]` má sekce **v pořadí**, které odpovídá skeletonu kategorie šablony
- Žádná sekce není mimo skeleton (pokud ano — FAIL s vysvětlením, kam ji zařadit)
- Vynechané sekce jsou v `template.json:skippedSections[]` s textovým důvodem (auditní stopa)

Bez PASS validátoru = NENÍ DONE.

---

## ✏️ Demo jména (nevychází z originálu)

Demo jméno šablony se **nemůže odvozovat z originálního názvu firmy**. Konvence:
- **Engine slug:** `<kategorie>-NN` (např. `barber-02`, `barber-03`, `cafe-02`, `restaurant-01`, `dental-01`)
- **Demo název v UI:** vymyšlený, neutrální (např. „Studio Břitva", „Holičství Atelier", „Barber Loft")
- **Mapování originál → engine slug** vede `template-lab/audits/<original-slug>.md` (sloupec `Engine slug`)

Důvod: aby Sonnet podvědomě nekopíroval brand originálu do copy textů.
