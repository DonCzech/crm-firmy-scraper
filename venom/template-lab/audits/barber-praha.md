# Audit šablony: barber-praha

## Identifikace

| Pole | Hodnota |
|------|---------|
| Original slug (queue id 4) | `barber-praha` |
| Original název firmy | **Barber shop Smíchov** (queue uvádí "Barber Praha" — fakticky brand "Smíchov") |
| Originální doména | `barberpraha.online` |
| Kategorie (z queue) | Barbershop |
| **Skeleton** | `service-personal` |
| **Engine slug** | `barber-04` |
| **Engine tenant slug** | `barber-04-v2` |
| **Demo název** | Černý Fade |
| **s.r.o. forma** | Černý Fade s.r.o. |
| Předchozí DONE šablona stejné kategorie | `barber-03` Studio Břitva (z `fade-room`, 2026-05-28) — předtím `barber-02` Holičství Atelier |
| URL na `/preview` kartu | `http://localhost:3015/preview` (slug: `barber-praha-demo`) |
| URL na `/demo/barber-praha-demo` (clone) | `http://localhost:3015/demo/barber-praha-demo` |
| Originál live | `https://barberpraha.online` |
| Zdrojový mirror | `public/clones/barber-praha/` (pouze CSS + fonts; HTML clonu se servuje z DB tenantu — částečně demo-fied) |
| Mirror velikost (rendered) | 742 KB / 4896 řádků — Divi/WordPress generovaný DOM |
| Mirror fonty | **Bebas Neue** (400), **Lato** (100/300/400/700/900), **Open Sans** (300/400/500/600/700/800) — WOFF2 lokálně v `clones/barber-praha/fonts/` |
| CSS framework | **Divi (WordPress)** + plugin Divi Plus (`dipi-*`: counter, lottie, carousel, team) |

## Identifikované podstránky originálu

Originál `barberpraha.online` je **multi-page WordPress / Divi** site. Mirror v `public/clones/barber-praha/` má pouze CSS+fonts; rendered HTML clone tenantu pokrývá pouze homepage (`single-page`). Pro 1:1 paritu šablona MUSÍ obsahovat všechny podstránky:

| Slug | Název | Sekce v pořadí | Implementovat? | Důvod |
|------|-------|----------------|----------------|-------|
| `/` | Domů | hero(slider) → about → team(stats) → "ukázka naší práce" (testimonial) → CTA rezervace → footer | ✅ | povinné |
| `/o-nas/` | O nás | header → page-hero → about-extended → team → footer | ✅ | hlavní storytelling |
| `/sluzby/` | Služby | header → page-hero → services-list (4 hlavní + popisy) → CTA → footer | ✅ | core obsah |
| `/galerie/` | Galerie | header → page-hero → gallery-grid + carousel → footer | ✅ | core obsah |
| `/cenik/` | Ceník | header → page-hero → pricing-list (16+4 položek) → CTA → footer | ✅ | core obsah |
| `/kategorie/aktuality/` | Blog (Aktuality) | header → blog-index → footer | ⚠️ SKIP (volitelně later) | Engine momentálně nemá blog section; varianta: jednoduchý placeholder s "připravujeme" |
| `/kontakty/` | Kontakty | header → page-hero → contact-blurbs (adresa/telefon/email) + mapa → footer | ✅ | core obsah |
| `/prijmu-barbera/` | Přijmu barbera | header → page-hero → job-description + CTA → footer | ✅ jednoduchá stránka | nábor barberů |

**Rozhodnutí o blogu:** Engine zatím nemá `blog-index` shared section. Pro FÁZI C navrhuji: 
- (A) BUILD jednoduchý placeholder `/blog` s textem "Připravujeme" + odkaz domů, NEBO
- (B) `nav` link `/blog` v headeru SKIP a odebrat z menu (8 linků místo 9).

Doporučení: **(A)** — pro paritu menu i UX.

**Pozn. k podstránkám:** Mirror je homepage-only. FÁZE C bude muset rekonstruovat podstránky **z live originálu** (`barberpraha.online/o-nas/` atd.). Snap:clone musí zachytit i podstránky (viz `pnpm snap:clone barber-praha --pages all`, pokud script podporuje; jinak ručně URL po URL).

## Layout — sekce v pořadí (homepage)

⚠️ **Pořadí v originále vs. skeleton `service-personal`:**
- Skeleton: `Header → Hero → About → Services → Pricing → Gallery → Team → Testimonials → Booking → Locations → FAQ → Footer`
- Originál (homepage): `Header → Hero(slider 2) → O nás (about + 8 fotek) → Tým (stats) → Ukázka naší práce (testimonial) → Objednejte se on-line (CTA) → Footer`
- Originál (celý site): Services & Pricing & Gallery jsou na samostatných **podstránkách** (`/sluzby/`, `/cenik/`, `/galerie/`), ne na homepage.
- Precedent: visual parity > skeleton order (potvrzeno u barber-02). Šablona zachová pořadí originálu, ale **homepage je úmyslně minimalistická** — krátký funnel ke CTA rezervaci.

### Homepage sekce

| Skeleton pos | Sekce | Originál (homepage) má? | Pozice | Variant (Reuse/Extend/New) | Poznámka |
|---|----------------|--------------|--------|----------------------------|----------|
| 1 | Header | ✅ | 1 | navbar **Reuse `barber-transparent-fixed`** (z barber-02/03) | Transparent fixed přes hero, logo "Barber shop Smíchov" (webp) vlevo, **9 nav linků**: Domů, O nás, Služby, Galerie, Ceník, Blog, Kontakty, Přijmu barbera, **Vytvořte si rezervaci** (CTA pill button v gold). Hamburger < 980px. |
| 2 | Hero | ✅ slider 2 | 2 | hero **Extend → nová `barber-fullwidth-slider`** | Full-bleed slider 2 slides: (a) "Barber shop pro pány teenagery a chlapce", (b) "Tradiční holičství PRO MUŽE a chlapce". Společný podtitulek "U nás jste celebrita Vy" / "Jsme tým zkušených holičů s dlouholetou praxí". CTA "vytvořit rezervaci" → externí myfox rezervační systém. Engine: 2 slides, auto-play 6s, gradient overlay, CTA → `https://demo.cz/rezervace`. |
| 3 | About | ✅ "O nás" + 8 fotek | 3 | about **Extend → nová `barber-about-with-gallery-strip`** | H2 "O nás" + lead text + decorative SVG separator + 8 fotografií "O NÁS" v carousel/grid layoutu se číselným badge 01–08. Toto je hybrid about + mini-gallery; engine řeší jako `about` sekci s vnitřním `gallery-strip` slot. |
| 4 | Services | ❌ (na /sluzby/) | — | — | Homepage nemá services grid. SKIP v `skippedSections[]` s důvodem "obsah na /sluzby/". |
| 5 | Pricing | ❌ (na /cenik/) | — | — | SKIP — obsah na /cenik/. |
| 6 | Gallery | ⚠️ částečně v About | — | — | "Ukázka našich střihů" je integrovaná do about jako 8-strip. Samostatná galerie je až na /galerie/. SKIP samostatné gallery sekce na homepage. |
| 7 | Team (stats varianta) | ✅ "náš tým" + 4 stats | 4 | team **Extend → nová `barber-team-stats-counter`** | H2 "náš tým" v gold + lead "Jsme tým vyučených holičů s pokorou k řemeslu i k Vám" + 4-col counter sekce (`dipi_counter`): "spokojených zákazníků / počet barberů / počet stylů / barbershop". Lottie ikony nad čísly. **Originál NEMÁ na homepage seznam jmen barberů** — to je až na `/o-nas/` a `/sluzby/`. |
| 8 | Testimonials | ✅ "Ukázka naší práce" | 5 | testimonials **Extend → nová `barber-testimonial-single-stars`** | Single testimonial s 5 hvězdami + jméno reviewer (originál: "Adam Žofák" ★★★★★). Engine: 1 demo testimonial od `Jan Novák ★★★★★` + krátký text. Možná rozšířit na 3 testimonials (carousel) pro vizuální váhu. |
| 9 | Booking / CTA | ✅ "Objednejte se teď hned on-line" | 6 | cta **Extend → nová `barber-cta-reservation-dark`** | Tmavá sekce + H2 "Objednejte se teď hned on-line" bílá + button "vytvořit rezervaci" → externí myfox. Engine: `https://demo.cz/rezervace`. |
| 10 | Locations | ✅ ve footeru | (footer) | — | Footer obsahuje adresu + mapa link (Metro Anděl). Není samostatná `locations` sekce. |
| 11 | FAQ | ❌ | — | — | SKIP. |
| 12 | Footer | ✅ | 7 | footer **Extend → nová `barber-footer-multi-blurb-legal`** | Multi-blurb: lokalita (Ostrovského 1332/4, Praha 5 Smíchov 150 00, Metro Anděl), Otevírací doba (Po–Ne 9:00–20:00), Kontakt (+420 778 553 280, barbersmichov@gmail.com), Social (FB/IG/YT/TikTok). Legal řádek: IČ + DIČ + číslo účtu + DPH plátce status. |

**Pořadí v `template.json:pages[home].sections[]`:**
`[navbar, hero, about, team-stats, testimonial, cta-reservation, footer]` (7 sekcí na homepage). 
SKIP: Services(4), Pricing(5), Gallery(6), FAQ(11) — **důvod: na podstránkách, ne homepage**.

### Podstránky — sekce na podstránku (zkrácený přehled)

| Slug | Sekce v pořadí |
|------|----------------|
| `/sluzby/` | navbar → page-hero(H1 "Služby") → services-list-detail → cta-reservation → footer |
| `/cenik/` | navbar → page-hero(H1 "Ceník") → pricing-list (16 hlavních + 4 doplňkové) → cta-reservation → footer |
| `/galerie/` | navbar → page-hero(H1 "Galerie") → gallery-grid (N fotek) + carousel → footer |
| `/o-nas/` | navbar → page-hero(H1 "O nás") → about-extended → team-grid (seznam jmen — TBD ze /o-nas/) → footer |
| `/kontakty/` | navbar → page-hero(H1 "Kontakty") → contact-blurbs (adresa/tel/email) + mapa iframe → footer |
| `/prijmu-barbera/` | navbar → page-hero(H1 "Přijmu barbera") → job-description-prose + CTA "napsat" → footer |
| `/blog/` | navbar → page-hero(H1 "Aktuality") → placeholder "Připravujeme" → footer |

## Vizuální identita

### Fonty

| Role | Font | Váhy | Letter-spacing |
|------|------|------|----------------|
| Display (H1 hero, H2 sekce, H4 service title) | **Bebas Neue** (400) | 400 | 2–6px uppercase |
| Body (P, blurb, nav, button) | **Open Sans** (300–800) (Lato fallback) | 400, 500, 600, 700 | 0–0.5px |

WOFF2 lokálně, `font-display:swap`. Engine překopíruje do `public/templates/barber-04/fonts/` (subset na používané váhy: Bebas 400, Open Sans 400/600/700).

### Barvy (extrahované HEX)

| Token | Hodnota | Použití | Frekvence v CSS |
|-------|---------|---------|-----------------|
| `primary` (gold) | `#d5b981` | H2 nadpisy, counter čísla, button bg, gallery item title | 110× |
| `text-light` | `#ffffff` | hero, dark section text | 78× |
| `background-dark` | `#000000` | dark sections, button bg hover | 60× |
| `primary-alt-gold` | `#c59d5f` / `#c9a84c` | tlumené gold akcenty | 26× |
| `slate-dark` | `#2c3d49` | tmavé pozadí services / hero overlay | 18× |
| `accent-blue` (Divi default) | `#2ea3f2` | **ODSTRANIT v engine** (Divi reset, ne brand) | 22× |
| `cream-bg` | `#f4f6f7` | light bg about / stats | 8× |
| `body-text` | `#666` | default body | (default) |

### Button styl

- Bg: gold `#d5b981` nebo transparent + 1.5px border
- Color: `#000` (na gold) nebo `#fff` (na transparent)
- Padding: `14px 36px`
- Font: Bebas Neue uppercase, letter-spacing 2–4px
- Border-radius: `0` (sharp/squared — rozdíl od barber-02 pill)
- Hover: invert bg/color, transition `.25s`

### Spacing personality

**Vzdušné, ne extrémní** — sekce `padding: 80–100px 0` desktop, `48–60px 24px` mobile. Stats counter 4-col tight grid. Header bar transparent přes hero. Gallery carousel gap ~16px.

### Atmosféra

**Premium urban / průmyslový barbershop** — gold + black + slate, Bebas Neue (uppercase, condensed geometric), Lottie animace + animated counter. Vibe: moderní WordPress prémium barbershop s důrazem na velké uppercase displeje. Méně "speakeasy" než barber-02 (cream tones), víc "Berlin/Smíchov barbershop".

## UX patterny

- **Navigation:** fixed transparent přes hero. 9 nav linků (poslední = CTA "Vytvořte si rezervaci" jako gold pill button). Hamburger < 980px.
- **Hero CTA:** "vytvořit rezervaci" → externí myfox rezervační systém. Engine: `https://demo.cz/rezervace`.
- **Slider:** `et_pb_fullwidth_slider` 2 slides s gradient overlay. Engine: Swiper s autoplay 6000ms, fade efekt, dots indikátor.
- **Gallery carousel s číselným badge:** `dipi-carousel` 8 položek, na každé image velký gold H2 "01–08" overlay. Engine: shared Swiper variant + číselný overlay slot.
- **Counter animace:** `dipi_counter` animované počítadlo + Lottie ikona. Engine: IntersectionObserver + requestAnimationFrame + statická SVG ikona (vyhodit Lottie pro perf).
- **Testimonial:** single review s 5 hvězdami + jméno. Engine: variant `barber-testimonial-single-stars` nebo carousel 3 items.
- **Forms:** **žádný** kontaktní formulář inline na homepage. `/kontakty/` má statické info + mapa iframe.
- **Social:** Facebook, Instagram, YouTube, TikTok ikony (4 platformy) v headeru i footeru.

## Demo data — originál → demo (kompletní mapping)

### Brand / značka

| Originální hodnota | Kde | Demo hodnota |
|--------------------|-----|--------------|
| `Barber shop Smíchov` | header logo alt, hero, footer, OG, schema.org, title | `Černý Fade` |
| `Barber Praha` (queue alias) | meta data | `Černý Fade` |
| `barberpraha.online` (canonical URL) | meta canonical, OG | `https://demo.cz` |
| Logo file `barber-shop-smichov-logo.webp` (cca) | header + footer | demo SVG `public/templates/barber-04/logo.svg` (wordmark "ČERNÝ FADE" v Bebas Neue, gold `#d5b981` na transparent) |

### Kontakty

| Originální hodnota | Kde | Demo hodnota |
|--------------------|-----|--------------|
| `Ostrovského 1332/4` | footer adresa, /kontakty/ | `Ukázková 123` |
| `Praha 5 Smíchov 150 00` | footer adresa, /kontakty/ | `110 00 Praha 1` |
| `Metro Anděl` (link na mapu) | footer | `Metro Náměstí Republiky` |
| `+420 778 553 280` | footer, /kontakty/, hero CTA tel | `+420 704 123 456` (tel link `+420704123456`) |
| `barbersmichov@gmail.com` | footer, /kontakty/ | `info@demo.cz` (+ `rezervace@demo.cz` pro hero CTA) |
| Facebook URL | header/footer | `https://facebook.com/demo` |
| Instagram URL | header/footer | `https://instagram.com/demo` |
| YouTube URL | header/footer | `https://youtube.com/@demo` |
| TikTok URL | header/footer | `https://tiktok.com/@demo` |
| External myfox booking URL | hero CTA + CTA sekce | `https://demo.cz/rezervace` (placeholder) |

### Legal blok (footer)

| Originální hodnota | Demo hodnota |
|--------------------|--------------|
| `IČ: 70357412` | `IČO: 12345678` |
| `DIČ: 7157156094` | `DIČ: CZ12345678` |
| `Číslo účtu: 2702511496 / 2010` | `Číslo účtu: 123456789 / 0100` |
| `DPH plátce` | zachovat (generické) |
| `Platba: hotovost + karty` | zachovat (generické) |

### Otevírací doba

| Originální | Demo (jednotná z DEMO_NAMES) |
|------------|-------------------------------|
| `Po–Ne 9:00–20:00` | `Po–Pá 9:00–18:00`, `So 9:00–14:00`, `Ne zavřeno` |

Pozn.: Originál má 7-day operace; demo má 6-day. Engine zachová strukturu blurb-table 7 řádků (Po/Út/St/Čt/Pá/So/Ne) ale s demo hodinami.

### Hero (2 slides)

| Originál | Demo |
|----------|------|
| Slide 1 H1 "Barber shop pro pány teenagery a chlapce" | "Pánský barbershop pro každý den" |
| Slide 2 H1 "Tradiční holičství PRO MUŽE a chlapce" | "Holení horkým ručníkem od profesionálů" |
| Společný podtitulek "U nás jste celebrita Vy / Jsme tým zkušených holičů s dlouholetou praxí" | "Klasické řemeslo, čistý fade, péče o vousy. Centrum Prahy, otevřeno 6 dní v týdnu." |
| CTA "vytvořit rezervaci" | zachovat (generické) → `https://demo.cz/rezervace` |

### About (homepage "O nás")

**Originál (krátký):** "Představení týmu" + 8 fotek "01–08".

**Demo H2:** `O nás` (gold accent)

**Demo body:**
> Černý Fade vznikl ze záliby ve klasickém řemesle a chuti dělat barbershop, kam se klienti vrací roky. Pracujeme v moderním, vzdušném prostředí v centru Prahy. Vyučení holiči, pokora k řemeslu a respekt k zákazníkovi.

8 fotek → 8 demo placeholderů `public/templates/barber-04/images/about-{01-08}.{webp,jpg}` (1000×1200 portrait, tmavá barber atmosféra).

### Team-stats (homepage)

**Originál:**
- H2 "náš tým" (gold)
- Lead "Jsme tým vyučených holičů s pokorou k řemeslu i k Vám"
- 4 stats counter (originál ukazuje `0 / 0 / 0 / 0` — pravděpodobně nezvládl render): "spokojených zákazníků / počet barberů / počet stylů / barbershop"

**Demo H2:** `Náš tým` (gold)

**Demo lead:** "Vyučení holiči s pokorou k řemeslu a respektem k zákazníkovi. Tradiční techniky kombinujeme s moderními trendy."

**Demo stats (čísla):**
- `5 200+` spokojených zákazníků
- `4` počet barberů
- `28` počet stylů
- `1` barbershop

### Testimonial (homepage "Ukázka naší práce")

| Originál | Demo |
|----------|------|
| Reviewer "Adam Žofák" | `Jan Novák` |
| Hvězdy `★★★★★` | zachovat |
| Text recenze (originální) | "Profesionální přístup, čistý střih, příjemná atmosféra. Adam mě zaujal precizní prací s vousy. Určitě se vrátím." |

### CTA "Objednejte se teď hned on-line"

| Originál | Demo |
|----------|------|
| H2 "Objednejte se teď hned on-line" | zachovat (generické) |
| Button "vytvořit rezervaci" → myfox | "vytvořit rezervaci" → `https://demo.cz/rezervace` |

### /sluzby/ — Services list

Originál má 4 hlavní služby s detailem (z clone HTML mirror):
- **STŘIH vlasů / a vousů** — "Precizní střih na míru…"
- **HOLENÍ vousů / A hlavy** — "Tradiční holení břitvou s napařením horkým ručníkem…"
- **Barvení / melír balayage** — "Barbeři se postarají o barvení vlasů i vousů…"
- **Bio trvalá ondulace** — "Kompletní trvalá ondulace se střihem…"

Engine: 4 service cards, demo copy přepsat (2–3 věty každé, bez REUZEL značky), zachovat 4-grid layout dark bg.

### /cenik/ — Pricing list (16 hlavních + 4 doplňkové)

| Originální položka | Originální cena | Demo cena (±15–30%, zaokrouh. 50 Kč) |
|--------------------|-----------------|---------------------------------------|
| **Úprava vlasů a vousů** (kategorie header) | — | zachovat |
| PÁNSKÝ STŘIH | 650 Kč | `550 Kč` (−15%) |
| CHLAPECKÝ STŘIH | 550 Kč | `450 Kč` (−18%) |
| Střih vousů | 550 Kč | `450 Kč` (−18%) |
| Holení | 550 Kč | `650 Kč` (+18%) |
| Střih vousů + barvení vousů | 750 Kč | `650 Kč` (−13%, zaokrouhleno) |
| Barvení vousů | 350 Kč | `300 Kč` (−14%) |
| Střih vlasů pouze nůžkami | 750 Kč | `850 Kč` (+13%) |
| Střih vlasů + střih vousů | 950 Kč | `850 Kč` (−10%, zaokrouhleno) |
| Kompletní péče | 1500 Kč | `1300 Kč` (−13%) |
| Trvalá ondulace | 1450 Kč | `1200 Kč` (−17%) |
| Trvalá ondulace + střih vlasů | 1950 Kč | `1700 Kč` (−13%) |
| Barvení vlasů tmavé odstíny, tonery | 1000 Kč | `850 Kč` (−15%) |
| Odbarvení vlasů, bílé studené odstíny | 2000 Kč | `1700 Kč` (−15%) |
| Melír vlasů, blond odstíny | 1500 Kč | `1300 Kč` (−13%) |
| Balayage | 2000 Kč | `1700 Kč` (−15%) |
| Odbarvení vlasů na blond odstíny | 1500 Kč | `1300 Kč` (−13%) |
| **Doplňkové služby** (kategorie header) | — | zachovat |
| Peelingová maska na obličej | 250 Kč | `200 Kč` (−20%) |
| Depilace nos/uši + obočí břitvou | 250 Kč | `300 Kč` (+20%) |
| Masáž hlavy/ramen/krku/obličeje | 250 Kč | `300 Kč` (+20%) |
| Regenerační zábal rukou | 250 Kč | `200 Kč` (−20%) |

**Značka REUZEL v originálních popisech** → odstranit ("welcome drink zdarma" zachovat jako generic benefit). Popisy přepsat vlastními slovy (2–3 věty každý).

### /galerie/ — Gallery

Engine: gallery grid (12–16 demo placeholders 1000×1200 portrait) + carousel (8 položek s číselným badge 01–08 jako na homepage about-strip). Demo placeholdery, žádné fotky z originálu.

### /o-nas/ — About extended + team

Originál pravděpodobně obsahuje seznam barberů s jmény a portrétem. Z mirror clone bylo zachyceno "Adam Žofák Master" — pravděpodobně původně full team listing.

**Demo team (4 členové):**
- `Jan Demo` — Master Barber
- `Petr Vzor` — Senior Stylist
- `Tomáš Vzor` — Holič
- `Adam Demo` — Junior Stylist

### /kontakty/

Demo blurbs (adresa, telefon, email — viz tabulka Kontakty) + mapa iframe `https://maps.google.com/?q=Námestí+Republiky+Praha` (placeholder demo lokace, ne reálný Smíchov).

### /prijmu-barbera/

Originál: nábor barberů s job description + CTA "napsat".

**Demo:**
> Hledáme zkušeného barbera do Černý Fade. Nabízíme moderní prostředí v centru Prahy, kvalitní vybavení, podporu při profesním růstu. Mzda dohodou. Pošli životopis na `info@demo.cz`.

### /blog/ (Aktuality)

Placeholder "Připravujeme" + button "zpět na hlavní" → `/`.

## Defekty originálu k opravě

```
Homepage:
- Stats counter (originál ukazuje 0/0/0/0 v rendered HTML) — broken animace nebo prázdná data. Engine: PLATNÉ čísla (5 200 / 4 / 28 / 1).
- Hero slider auto-play interval 50ms je nesmyslně rychlý (Divi default speed step). Engine: 6000ms.
- Lottie ikony nad stats counter — náhrada za statické SVG (perf, žádná dependency).
- Divi default accent #2ea3f2 (modrá) prosakuje do default selektorů. Engine: ODSTRANIT.
- Inline CSS overrides (~120 KB) v rendered HTML s `!important` — engine NEKOPÍRUJE, rewrite z čistého layoutu.
- Hero CTA + CTA sekce odkazují na externí myfox. Engine: placeholder `https://demo.cz/rezervace`.
- Single testimonial bez fotky / loga reviewera → engine zvětší na 3 testimonials carousel pro vizuální váhu (decision: confirm s userem).

/cenik:
- 16 hlavních položek + 4 doplňkové — ne v kartách, ale v plochém seznamu. Engine: 2 sekce (Úprava + Doplňkové) s plain list layout, item: název / popis / cena. Mobile: zachovat 1-col.
- Značka REUZEL v každém popisu → odstranit, zachovat generický "welcome drink zdarma" benefit.

/o-nas:
- Mirror nestáhl tuto stránku. FÁZE C musí načíst z live originálu nebo vytvořit demo about z 4 členů.

/galerie:
- Mirror nestáhl. Engine vytvoří demo grid 12–16 placeholders.

/kontakty:
- Mapa iframe odkazuje na originální Smíchov. Engine: demo lokace (Náměstí Republiky).

WP/Divi:
- WordPress runtime + Divi plugins generují stovky inline CSS overrides s `!important`. Engine používá React + skin.css bez `!important`.
- dipi-* Divi Plus moduly — žádný shared engine ekvivalent. Engine vytvoří vlastní React varianty.
- Lato font-family váhy 100/500/900 nepoužité — subsetovat.
- Inline JS bloky (Divi i18n, lazy-load) — vyhodit.

Header:
- 9 nav linků je mnoho — engine zachovává, ale poslední "Vytvořte si rezervaci" jako gold pill CTA stranou (visually separated).
- Hamburger break 980px → engine 1024px (drobné rozšíření breakpoint).
```

## Risks & pasti

- **Multi-page šablona** — 7 podstránek je víc než barber-02 (single-page) i barber-03. Časově náročnější. FÁZE C bude muset extendovat shared `page-hero` + případně přidat `pricing-list-flat` variant (16+4 položek bez karet).
- **Divi runtime** — clone obsahuje ~120 KB inline CSS overrides. Engine rewrite z čistého layoutu, ne kopie.
- **dipi_* moduly (Divi Plus)** — `dipi_counter`, `dipi_lottie_icon`, `dipi-carousel`, `dipi-team`: žádný shared engine ekvivalent. Plán: 5 nových variant (hero-slider, team-stats-counter, gallery-carousel-numbered, testimonial-single-stars, cta-reservation-dark) + extend nějakých z barber-02/03.
- **Hero slider** — 2 slides potvrzeno. Engine: Swiper-based variant.
- **Lottie animace** — náhrada za statické SVG (~70 KB JS úspora).
- **Multi-page snap:clone** — script `pnpm snap:clone barber-praha` musí podporovat snapování všech podstránek (TBD: ověřit). Pokud ne, manuální screenshot per page přes Playwright.
- **REUZEL značka v popisech ceníku** — riziko, že zůstane v copy → grep audit pro "REUZEL" = 0 výskytů.
- **Reálné jméno reviewera "Adam Žofák"** v clone — engine MUSÍ přepsat na demo (Jan Novák).
- **Reálné IČ/DIČ/účet** ve footeru — engine MUSÍ přepsat na demo (12345678 / CZ12345678 / 123456789/0100).
- **Inline `!important`** — engine NESMÍ kopírovat z Divi.
- **Mobile breakpointy** — engine 768px/1024px namísto Divi 767px/980px.
- **Hero `min-height:100vh`** — engine použije `100svh` fallback.
- **Bebas Neue licence** — OFL 1.1 (free), lokálně z `fonts/`.
- **Hero CTA = externí myfox** — engine: `https://demo.cz/rezervace` placeholder.

## Plán implementace pro FÁZI C (skeleton sequence)

Závazné pořadí dle SECTION_WORKFLOW.md — jedna sekce na iteraci, 6 mikro-fází per sekci. Homepage nejprve, podstránky pak.

### Část 1 — Homepage (10 sekcí včetně page-spanning header+footer)

```
Krok 1   Sekce 1   Header (navbar 9 links)        BUILD → DIFF → DEMO → STUDIO → PARITY (UŽIVATEL) → COMMIT
Krok 2   Sekce 2   Hero (2-slide slider)          BUILD → DIFF → DEMO → STUDIO → PARITY (slider decision) → COMMIT
Krok 3   Sekce 3   About + 8-strip               BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 4   Sekce 4   Team-stats counter             BUILD → DIFF → DEMO → STUDIO → PARITY (Lottie→SVG) → COMMIT
Krok 5   Sekce 5   Testimonial single             BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 6   Sekce 6   CTA Reservation                BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 7   Sekce 7   Footer (multi-blurb + legal)   BUILD → DIFF → DEMO → STUDIO → PARITY (UŽIVATEL) → COMMIT
```

### Část 2 — Podstránky

```
Krok 8   /sluzby/    services-list-detail        BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 9   /cenik/     pricing-list-flat (16+4)    BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 10  /galerie/   gallery-grid + carousel     BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 11  /o-nas/     about-extended + team-grid  BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 12  /kontakty/  contact-blurbs + mapa       BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 13  /prijmu-barbera/  job-description-prose  BUILD → DIFF → DEMO → STUDIO → COMMIT
Krok 14  /blog/      placeholder "Připravujeme"  BUILD → DIFF → DEMO → STUDIO → COMMIT
```

### SKIP sekce (na homepage, zaznamenat v `template.json:pages[home].skippedSections[]`):
```json
[
  { "pos": 4,  "name": "Services",      "reason": "obsah na /sluzby/ podstránce, ne homepage" },
  { "pos": 5,  "name": "Pricing",       "reason": "obsah na /cenik/ podstránce" },
  { "pos": 6,  "name": "Gallery",       "reason": "samostatná galerie na /galerie/; homepage má jen 8-strip v about" },
  { "pos": 11, "name": "FAQ",           "reason": "originál nemá FAQ" }
]
```

### EXTRA sekce (zaznamenat v `template.json:extraSections[]`):
```json
[
  { "name": "team-stats", "type": "team-stats-counter", "reason": "originál má 4-col animovaný counter sekce místo team gridu na homepage" }
]
```

### Nové shared variants (kandidáti pro engine extension)

- `hero:barber-fullwidth-slider` (Swiper 1–N slides, gradient overlay, autoplay 6s)
- `about:barber-about-with-gallery-strip` (about + vnitřní 8-strip carousel s číselným badge)
- `team:barber-team-stats-counter` (4-col animated counter + SVG icon + label) — **nový section type**
- `testimonial:barber-testimonial-single-stars` (single review s 5 hvězdami + jméno)
- `cta:barber-cta-reservation-dark` (tmavá sekce + H2 + button)
- `footer:barber-footer-multi-blurb-legal` (3-col blurbs + legal řádek s IČO/DIČ/účet)
- `pricing:barber-pricing-list-flat` (plain list 2-kategorie, item: název / popis / cena)
- `services:barber-services-list-detail` (na /sluzby/ podstránce — 4 cards extended)
- `gallery:barber-gallery-carousel-numbered` (Swiper s číselným overlay)
- `gallery:barber-gallery-page-grid` (na /galerie/ podstránce — masonry/grid)
- `contact:barber-contact-blurbs-map` (na /kontakty/ — 3 blurbs + iframe mapa)
- `page-hero:simple-title-only` (univerzální page hero pro podstránky)
- `prose:job-description` (na /prijmu-barbera/)
- `placeholder:coming-soon` (na /blog/)

### Reuse z barber-02/03

- `navbar:barber-transparent-fixed` (možná Extend pro 9 linků + pill CTA)

## Závazný checklist FÁZE C

### Homepage
- [ ] Sekce 1 Header (9 nav links + CTA pill)
- [ ] Sekce 2 Hero (2-slide slider, autoplay 6s)
- [ ] Sekce 3 About + 8-strip
- [ ] Sekce 4 Team-stats counter (4-col, SVG ikony)
- [ ] Sekce 5 Testimonial single (5 stars)
- [ ] Sekce 6 CTA Reservation
- [ ] Sekce 7 Footer (multi-blurb + legal)

### Podstránky
- [ ] /sluzby/ — services list detail
- [ ] /cenik/ — pricing list 16+4
- [ ] /galerie/ — gallery grid + carousel
- [ ] /o-nas/ — about extended + team grid
- [ ] /kontakty/ — contact blurbs + mapa iframe
- [ ] /prijmu-barbera/ — job description prose
- [ ] /blog/ — placeholder

### Final
- [ ] `pnpm validate:template barber-04` PASS
- [ ] `pnpm build` + `pnpm typecheck` PASS
- [ ] Negativní grep audit (=0 výskytů):
  - `Barber shop Smíchov`, `Barber Praha`, `barberpraha.online`
  - `Adam Žofák`, `Ostrovského`, `Smíchov`, `Anděl`
  - `778 553 280`, `608 288 777`
  - `barbersmichov@gmail.com`, `@gmail.com`, `info@demo.local`
  - `70357412` (IČ), `7157156094` (DIČ), `2702511496` (účet)
  - `REUZEL`, `myfox`
- [ ] Pozitivní grep audit (≥1 výskyt):
  - `704 123 456`, `@demo.cz`, `Černý Fade`
- [ ] `/preview-2` karta viditelná, link `/demo/barber-04-v2` funguje
- [ ] `/demo/barber-praha-demo` (clone) nezměněn — sanity check
- [ ] `pnpm seed:showcase barber-04` → tab "Ukázková" v `/preview-2`

## Otevřené otázky pro uživatele (před FÁZÍ C)

1. **Hero slider** — potvrzeno 2 slides z originálu. Zachovat slider (Swiper autoplay 6s) — **OK?**
2. **Lottie animace** ve stats sekci — náhrada za statické SVG ikony (perf, ne dependency). **OK?**
3. **Testimonial** — originál má 1 review. Engine zvětší na 3 demo reviews (carousel) pro vizuální váhu? Nebo zachovat 1?
4. **Podstránky** — implementovat všech 7 (`/o-nas/`, `/sluzby/`, `/galerie/`, `/cenik/`, `/kontakty/`, `/prijmu-barbera/`, `/blog/`)? Nebo MVP jen 4 core (Sluzby, Cenik, Galerie, Kontakty)?
5. **Blog** — placeholder "Připravujeme" NEBO odebrat link z menu? Doporučení: placeholder pro paritu.
6. **Otevírací doba** — originál Po–Ne 9–20 (7 dní). Demo standard je Po–Pá 9–18 + So 9–14 (6 dní). Zachovat strukturu 7 řádků v footer table ale s demo hodinami (Ne = "zavřeno")?
7. **Skeleton order vs originál** — homepage skeleton chce Services/Pricing/Gallery, ale originál je má na podstránkách. Skip kompliance precedent z barber-02. **Potvrdit?**

## Status

`READY_FOR_PHASE_C` — po schválení auditu uživatelem.
