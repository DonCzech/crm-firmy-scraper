# Venom Template Refactor — STATE

Centrální stav 87 šablon. Aktualizuje se po každém posunu fázi.

## Legenda
- `RES` — research (fáze 0–1)
- `WIP` — in-progress (fáze 2–5)
- `APR` — approved (4 brány PASS, čeká na manuální obsah/obrázky/SEO)
- `PUB` — published (živé v ekosystému)

## Brány (4× PASS = APR)
1. **Vizuál** — Playwright diff orig vs new ≤ 3 % na 3 viewportech (1440/768/375)
2. **Performance** — Lighthouse ≥ 90 perf / ≥ 95 SEO / ≥ 95 a11y; page weight < 500 kB
3. **Cleanup** — 0× jQuery / 0× wp-content / 0× external trackers / žádný inline `<script>` > 200 B
4. **Editor** — každý h1/h2/h3/p/img na homepage editovatelný klikem; drag-and-drop sekcí funguje

## Stav (per template)

| # | Slug | Stav | Váha před | Váha po | Vizuál | Perf | Cleanup | Editor | Datum | Memory |
|---|------|------|-----------|---------|--------|------|---------|--------|-------|--------|
| 1 | cafe-01 (orig: costa) | APR (F0–F6 done; vizuál n/a) | 2.3 MB | 54 KB | n/a | TBD | ✓ | ✓ | 2026-05-23 | project_venom_template_cafe-01.md |
| 1b | barber-01 (orig: barbershopurban) | APR (F0–FB done; Perf 97/A11y 100/SEO 100 prod) | n/a | 61 KB HTML | ✓ TBD | ✓ Perf97/A11y100/SEO100 | ✓ | ✓ | 2026-05-24 | — |
| 2 | acheating | — | — | — | — | — | — | — | — | — |
| 3 | amdenevents | — | — | — | — | — | — | — | — | — |
| 4 | antoninova | — | — | — | — | — | — | — | — | — |
| 5 | antoninpekarstvi | — | — | — | — | — | — | — | — | — |
| 6 | baurekstav | — | — | — | — | — | — | — | — | — |
| 7 | bestdrive | — | — | — | — | — | — | — | — | — |
| 8 | bomton | — | — | — | — | — | — | — | — | — |
| 9 | bytyjadra | — | — | — | — | — | — | — | — | — |
| 10 | cafesavoy | — | — | — | — | — | — | — | — | — |
| 11 | cathedral | — | — | — | — | — | — | — | — | — |
| 12 | cleancat | — | — | — | — | — | — | — | — | — |
| 13 | coffeeroom | — | — | — | — | — | — | — | — | — |
| 14 | corleone | — | — | — | — | — | — | — | — | — |
| 15 | costa | — | — | — | — | — | — | — | — | — |
| 16 | cutedogs | — | — | — | — | — | — | — | — | — |
| 17 | deratizace | — | — | — | — | — | — | — | — | — |
| 18 | elektrobohacek | — | — | — | — | — | — | — | — | — |
| 19 | engelvolkers | — | — | — | — | — | — | — | — | — |
| 20 | escape | — | — | — | — | — | — | — | — | — |
| 21 | fade-room | — | — | — | — | — | — | — | — | — |
| 22 | fermakleri | — | — | — | — | — | — | — | — | — |
| 23 | freja | — | — | — | — | — | — | — | — | — |
| 24 | fyziovsem | — | — | — | — | — | — | — | — | — |
| 25 | garant | — | — | — | — | — | — | — | — | — |
| 26 | gerberra | — | — | — | — | — | — | — | — | — |
| 27 | gpf | — | — | — | — | — | — | — | — | — |
| 28 | grantex | — | — | — | — | — | — | — | — | — |
| 29 | greensie | — | — | — | — | — | — | — | — | — |
| 30 | hairsalon-no1 | — | — | — | — | — | — | — | — | — |
| 31 | havel | — | — | — | — | — | — | — | — | — |
| 32 | honeygrebovka | — | — | — | — | — | — | — | — | — |
| 33 | honzakamenar | — | — | — | — | — | — | — | — | — |
| 34 | hotelatlantis | — | — | — | — | — | — | — | — | — |
| 35 | hybernska | — | — | — | — | — | — | — | — | — |
| 36 | instalateritopenari | — | — | — | — | — | — | — | — | — |
| 37 | jipka | — | — | — | — | — | — | — | — | — |
| 38 | karesarch | — | — | — | — | — | — | — | — | — |
| 39 | klempirzprahy | — | — | — | — | — | — | — | — | — |
| 40 | lacasalatina | — | — | — | — | — | — | — | — | — |
| 41 | lesarb | — | — | — | — | — | — | — | — | — |
| 42 | linda | — | — | — | — | — | — | — | — | — |
| 43 | magic | — | — | — | — | — | — | — | — | — |
| 44 | magicsmile | — | — | — | — | — | — | — | — | — |
| 45 | maidenstudio | — | — | — | — | — | — | — | — | — |
| 46 | malirstvibastar | — | — | — | — | — | — | — | — | — |
| 47 | modryzralok | — | — | — | — | — | — | — | — | — |
| 48 | nobe | — | — | — | — | — | — | — | — | — |
| 49 | okucera | — | — | — | — | — | — | — | — | — |
| 50 | ovocnysvetozor | — | — | — | — | — | — | — | — | — |
| 51 | palacehotel | — | — | — | — | — | — | — | — | — |
| 52 | peak-cut | — | — | — | — | — | — | — | — | — |
| 53 | perfectcatering | — | — | — | — | — | — | — | — | — |
| 54 | perfectsmile | — | — | — | — | — | — | — | — | — |
| 55 | petramechurova | — | — | — | — | — | — | — | — | — |
| 56 | petrovomalovani | — | — | — | — | — | — | — | — | — |
| 57 | polgarden | — | — | — | — | — | — | — | — | — |
| 58 | pragoclima | — | — | — | — | — | — | — | — | — |
| 59 | praha-masaze | — | — | — | — | — | — | — | — | — |
| 60 | prk | — | — | — | — | — | — | — | — | — |
| 61 | quantum | — | — | — | — | — | — | — | — | — |
| 62 | resetclinic | — | — | — | — | — | — | — | — | — |
| 63 | rowan | — | — | — | — | — | — | — | — | — |
| 64 | schlieger | — | — | — | — | — | — | — | — | — |
| 65 | scioles | — | — | — | — | — | — | — | — | — |
| 66 | selfbeauty | — | — | — | — | — | — | — | — | — |
| 67 | skolapopulo | — | — | — | — | — | — | — | — | — |
| 68 | skolkapropejska | — | — | — | — | — | — | — | — | — |
| 69 | soho | — | — | — | — | — | — | — | — | — |
| 70 | srubar | — | — | — | — | — | — | — | — | — |
| 71 | stavbadesign | — | — | — | — | — | — | — | — | — |
| 72 | studio-jarka | — | — | — | — | — | — | — | — | — |
| 73 | supellex | — | — | — | — | — | — | — | — | — |
| 74 | svetrov | — | — | — | — | — | — | — | — | — |
| 75 | tawan | tawan-01 | wellness | APR | PASS | — | — | — | 2026-06-01 | tawan-01-demo |
| 76 | the-barber | — | — | — | — | — | — | — | — | — |
| 77 | tkreko | — | — | — | — | — | — | — | — | — |
| 78 | tomas | — | — | — | — | — | — | — | — | — |
| 79 | tribo | — | — | — | — | — | — | — | — | — |
| 80 | ucetnictvispravne | — | — | — | — | — | — | — | — | — |
| 81 | usmev | — | — | — | — | — | — | — | — | — |
| 82 | vasdj | — | — | — | — | — | — | — | — | — |
| 83 | vestop | — | — | — | — | — | — | — | — | — |
| 84 | veterinafenix | — | — | — | — | — | — | — | — | — |
| 85 | victory | — | — | — | — | — | — | — | — | — |
| 86 | yesvisage | — | — | — | — | — | — | — | — | — |
| 87 | barber-barbershopurban | PUB | — | — | — | — | — | — | (původní pilot) | — |

> Poznámka: `fonts` v public/clones/ není šablona, je to sdílená font složka. Vynechána.

## NEEDS-RESCRAPE (chybí HTML, jen CSS/fonty/obrázky — nelze refaktorovat)
Audit 2026-05-23 — všech 6 z kategorie barber/salon, vypadá jako přerušený batch scrap.
- `barber-praha` (1.1 MB) — jen css/fonts/wp-content
- `fade-room` — jen css/fonts/wp-content
- `peak-cut` — jen css/fonts/wp-content
- `praha-masaze` — jen css/fonts/wp-content
- `studio-jarka` — jen css/fonts/wp-content
- `the-barber` — jen css/fonts/wp-content

→ Vyžadují nový scrape s HTML (homepage + 2 podstránky). Dokud se nedoscrapnou, nepatří do refaktoru. Po doscrapnutí přesunout do tabulky stavu.

**Použitelné: 80 z 87 šablon** (po vyloučení `fonts/` a 6 NEEDS-RESCRAPE).

## Workflow per template
1. **Fáze 0 — pre-flight**: přečíst docs/pravidla.md, audit původního mirroru (váha, scripty, fonty), screenshoty 3 viewportů
2. **Fáze 1 — extrakce designu**: DS tokeny, mapa sekcí → research/<slug>/sections.json
3. **Fáze 2 — přepis**: React komponenty, čistý kód, lokální assets, žádný jQuery/WP odpad
4. **Fáze 3 — podstránky**: homepage + 2 (typicky sluzby + kontakt)
5. **Fáze 4 — editor & builder**: inline edit, image picker, drag-and-drop sekcí
6. **Fáze 5 — ekosystém**: registrace v DB jako šablona s verzí, tenant overrides
7. **Fáze 6 — brány**: 4× PASS → APR
8. **Manuální schválení uživatelem** → PUB

## Pravidla
- Žádná fáze se nepřeskakuje
- Bez 4× PASS šablona nejde do `approved/`
- Po každé šabloně zápis do auto-memory `project_venom_template_<slug>.md` + update v `MEMORY.md`
- Po každé fázi commit s prefixem `venom-tpl(<slug>): faze<N> <stručně>`
