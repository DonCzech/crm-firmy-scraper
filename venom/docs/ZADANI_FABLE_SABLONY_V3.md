# ZADÁNÍ PRO FABLE — PREMIUM ŠABLONY V3

**Projekt:** Venom / Webero  
**Pracovní adresář:** `/Users/apple/DEV/CRM/venom`  
**Datum zadání:** 2026-07-20  
**Počet nových šablon:** 10  
**Cíl:** vytvořit novou prémiovou generaci univerzálních šablon, která bude designem, konverzní logikou, úplností a editovatelností konkurenceschopná proti Wix, Squarespace, Webflow, Framer, Shopify a Webnode.

---

## 1. Kontext a hlavní rozhodnutí

Venom/Webero už má více než 100 šablon vytvořených předchozí generací. Lokální audit `src/templates` v době přípravy tohoto zadání našel 114 manifestových šablon, z toho 20 e-shopových.

Současné portfolio velmi dobře pokrývá konkrétní české obory:

- lokální služby a řemesla,
- beauty a wellness,
- restaurace, kavárny a gastro,
- zdravotnictví,
- reality,
- účetnictví, finance a právo,
- ubytování,
- vzdělávání,
- 20 e-shopových směrů.

Nová prémiová desítka proto **NESMÍ** být dalších deset úzce oborových webů typu „další instalatér“, „další barber“ nebo „další restaurace“.

Nová kolekce bude založená na **business archetypech** — na tom, čeho má web dosáhnout:

- získat poptávku,
- rezervovat termín,
- prodat produkt,
- získat registraci,
- prezentovat práci,
- budovat autoritu,
- publikovat obsah,
- získat členy,
- prodat vstupenky,
- získat dary nebo dobrovolníky.

Každá šablona musí být použitelná napříč více obory. Oborovou adaptaci zajistí content, fotografie, theme tokens, mood presety a volitelné varianty sekcí.

### Hlavní positioning kolekce

> Ne dalších deset podobných webů. Deset profesionálních systémů navržených podle toho, čeho má web dosáhnout.

---

## 2. Tržní závěry

Průzkum největších platforem ukazuje, že špičkové šablony se už netřídí jen podle vzhledu nebo oboru:

- Squarespace pracuje s funkčními typy jako Online Store, Portfolio, Memberships, Blog, Scheduling, Courses, Services a Donations.
- Wix staví šablony kolem hlavních akcí „book, buy or get in touch“ a propojuje je s rezervacemi, formuláři a obchodem.
- Webflow má nejsilnější nabídku v Portfolio & Agency, Technology, Professional Services, E-commerce a Editorial.
- Framer má silný prémiový marketplace zejména pro landing pages, SaaS, agentury a portfolia.
- Webnode na českém trhu kombinuje oborové šablony s AI, rezervacemi, blogem, vícejazyčností a členskými stránkami.

Designový směr pro rok 2026 není další generická AI estetika. Webflow ve svém trend reportu upozorňuje na „algorithmic sameness“ a zdůrazňuje vlastní vizuální systémy, záměrnost a lidské řemeslo.

### Praktický závěr pro Webero

Webero už nemusí soutěžit počtem šablon. Musí ukázat:

1. deset jasně rozpoznatelných vizuálních systémů,
2. deset rozdílných obchodních účelů,
3. lepší připravenost k reálnému spuštění než běžná marketplace šablona,
4. plnou editovatelnost ve Studiu,
5. český a evropský produktový detail.

---

## 3. Povinný technický kontext

Před návrhem nebo implementací přečti:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/TEMPLATE_STANDARD.md`
4. `docs/LIVE_EDITOR_STANDARD.md`
5. `docs/PAGE_BUILDER_STANDARD.md`
6. `docs/COMPONENT_ARCHITECTURE.md`
7. `docs/IMAGE_PIPELINE_STANDARD.md`
8. `docs/TENANT_DEPLOYMENT_FLOW.md`
9. `docs/SEO_PERFORMANCE_CHECKLIST.md`
10. `docs/WEBERO_COMMERCE_CLAUDE_BRIEF.md` pro commerce šablonu
11. `src/templates/*/template.json`
12. `src/sections/registry.ts`
13. `src/sections/variants.ts`
14. relevantní komponenty ve `src/components/studio`

### Architektonický princip

Šablona je:

- deklarativní `template.json`,
- jednotný `theme.json`,
- oddělený obsah v `content/cs.json`,
- volitelný template-scoped `skin.css`,
- odkazy na shared sekce a jejich varianty.

Šablona není izolovaný TypeScript web ani kopie shared business logiky.

Pokud nová generace potřebuje variantu, kterou engine neumí:

1. navrhni obecně použitelnou variantu,
2. přidej ji do shared registry a shared rendereru,
3. zajisti editovatelnost ve Studiu,
4. teprve potom ji použij v manifestu šablony.

Nevytvářej deset soukromých rendererů, které nepůjdou znovu použít.

---

# 4. Deset prémiových šablon

## 4.1 PROOF — Universal Service Engine

**Priorita:** 1  
**Hlavní cíl:** poptávka nebo rezervace  
**Role v portfoliu:** nejuniverzálnější a obchodně nejdůležitější šablona celé kolekce

### Použití

- lokální služby,
- stavebnictví a řemesla,
- kliniky a zdravotní služby,
- autoservisy,
- právníci a poradci,
- úklid,
- zahrady,
- servisní a instalační firmy,
- B2C i menší B2B služby.

### Povinná struktura

- výsledkový hero: problém → řešení → CTA,
- jasný výběr služby,
- důvěryhodnost, hodnocení, certifikace a partnerství,
- portfolio, realizace nebo before/after,
- proces spolupráce,
- ceník nebo orientační kalkulace,
- reference,
- mapa působnosti nebo pobočky,
- FAQ,
- kontaktní/poptávkový formulář,
- sticky mobilní CTA pro zavolání, rezervaci nebo poptávku.

### Doporučené stránky

- Domů
- Služby
- Detail služby
- Realizace / případové studie
- Detail realizace
- Ceník
- O nás
- Kontakt / poptávka
- Blog / poradna

### Vizuální směr

Confident minimalism. Velká typografie, jasná hierarchie, kvalitní fotografie realizací a jedna výrazná akcentní barva. Žádné generické modré karty s ikonami.

### Signature interaction

Interaktivní předvýběr poptávky nebo kalkulace přímo na homepage.

---

## 4.2 SIGNAL — B2B Authority

**Priorita:** 2  
**Hlavní cíl:** kvalifikovaný lead nebo rezervace konzultace  
**Role v portfoliu:** důvěryhodný web pro střední firmy a profesionální služby

### Použití

- consulting,
- IT a cybersecurity,
- finance,
- právní a daňové služby,
- HR a recruitment,
- logistika,
- výroba,
- energetika,
- průmyslové firmy,
- B2B služby.

### Povinná struktura

- silný positioning a jasná hodnota,
- řešení podle problému nebo role klienta,
- obory a use cases,
- důkazy: čísla, certifikace, klienti a ocenění,
- případové studie s měřitelnými výsledky,
- metodika nebo proces,
- leadership a tým,
- insights / odborný obsah,
- kariéra,
- lead magnet,
- rezervace konzultace.

### Doporučené stránky

- Domů
- Řešení
- Detail řešení
- Obory
- Případové studie
- Detail případové studie
- Insights
- Detail článku
- O firmě / leadership
- Kariéra
- Kontakt

### Vizuální směr

Švýcarská editorial typografie, precizní modulární mřížka, charcoal nebo deep navy, střízlivý datový vizuální jazyk.

### Signature interaction

Interaktivní přepínač řešení podle role, problému nebo odvětví návštěvníka.

---

## 4.3 ORBIT — SaaS / AI Product

**Priorita:** 3  
**Hlavní cíl:** trial, registrace do waitlistu nebo rezervace dema  
**Role v portfoliu:** zaplnit zásadní mezeru v kategorii Technology

### Použití

- SaaS,
- AI nástroje,
- mobilní a webové aplikace,
- fintech,
- productivity,
- devtools,
- startupy,
- digitální platformy.

### Povinná struktura

- interaktivní produktový hero,
- produktový UI mockup nebo živé demo,
- feature bento s reálnou hierarchií,
- use cases podle rolí,
- workflow,
- integrace,
- bezpečnost a compliance,
- srovnání plánů,
- pricing,
- reference a zákaznické výsledky,
- FAQ,
- odkazy na dokumentaci, changelog a status.

### Doporučené stránky

- Domů
- Produkt
- Use cases
- Integrace
- Pricing
- Customers
- Detail case study
- Security
- Changelog
- Dokumentace landing page
- Kontakt / demo

### Vizuální směr

Čistý technický základ s vlastním rozpoznatelným signature effectem. Výslovně se vyhnout stereotypu „fialový gradient + několik zářících karet“.

### Signature interaction

Klikatelné produktové demo nebo animovaný workflow, který vysvětluje hodnotu produktu bez videa.

---

## 4.4 ATELIER — Creative Agency & Portfolio

**Priorita:** 4  
**Hlavní cíl:** poptávka projektu  
**Role v portfoliu:** designový showcase schopností Fable a Webero

### Použití

- kreativní a marketingové agentury,
- designová studia,
- architekti,
- interiéroví designéři,
- fotografové,
- filmaři,
- produkční studia,
- freelance creative professionals.

### Povinná struktura

- art-directed hero nebo showreel,
- filtrovatelné portfolio,
- velké případové studie,
- obchodní výsledky projektů,
- služby a capabilities,
- proces,
- klienti,
- ocenění a press,
- tým,
- detailní poptávkový brief.

### Doporučené stránky

- Domů
- Projekty
- Detail projektu
- Služby
- O studiu
- Tým
- Journal
- Kontakt / project brief

### Vizuální směr

Asymetrický editorial grid, výrazná typografie, art direction obrázků, kvalitní přechody mezi projekty a volitelný light/dark mód.

### Signature interaction

Plynulý přechod z portfolio gridu do detailu projektu se zachováním vizuálního kontextu.

---

## 4.5 MAISON — Editorial Commerce

**Priorita:** 5  
**Hlavní cíl:** nákup  
**Role v portfoliu:** flagship pro Webero Commerce, nikoliv další generický katalog

### Použití

- móda,
- kosmetika,
- šperky,
- designový nábytek,
- bytové doplňky,
- specialty food,
- prémiové dárky,
- lifestyle DTC značky.

### Povinná struktura

- editorial homepage,
- collections,
- shoppable lookbook,
- produktové storytelling bloky,
- výpis produktů s filtry,
- plnohodnotný product detail,
- varianty,
- sticky add-to-cart,
- bundles a cross-sell,
- recenze a UGC,
- subscription/replenishment blok,
- brand journal,
- cart, checkout, account a order confirmation.

### Povinné commerce stránky

- Domů
- Kolekce / kategorie
- Listing
- Product detail
- Lookbook
- Journal
- Cart
- Checkout
- Customer account
- Order confirmation
- Delivery & returns
- Legal pages

### Vizuální směr

Luxusní módní magazín, výrazná produktová fotografie a velmi klidné UI. Design musí podporovat produkt, ne jej přehlušit.

### Signature interaction

Shoppable lookbook s rychlým nákupem produktů přímo z editorial scény.

### Kritické pravidlo

Commerce data musí používat skutečný commerce domain model. Nevytvářej statické produktové karty jako náhradu za produkty, kategorie, varianty, košík a checkout.

---

## 4.6 PERSONA — Expert & Personal Brand

**Priorita:** 6  
**Hlavní cíl:** konzultace, nákup služby nebo newsletter  
**Role v portfoliu:** univerzální web pro podnikání postavené na konkrétní osobě

### Použití

- konzultanti,
- kouči,
- lektoři,
- realitní makléři,
- odborní lékaři,
- autoři,
- speakeři,
- freelanceři,
- creators.

### Povinná struktura

- osobní positioning,
- příběh a expertiza,
- služby nebo balíčky,
- výsledky klientů,
- reference,
- publikace a vystoupení,
- odborný obsah,
- newsletter,
- kalendář konzultací,
- media kit.

### Doporučené stránky

- Domů
- O mně
- Služby
- Detail služby
- Reference / výsledky
- Články / resources
- Speaking / média
- Kontakt / rezervace

### Vizuální směr

Osobní, sebevědomý editorial design s kvalitním portrétem. Méně korporátního webu, více rozpoznatelné osobnosti.

### Mood presety

- Executive
- Editorial
- Creator

### Signature interaction

Narrative scroll kombinující příběh, expertizu a výsledky bez pocitu běžné „about me“ stránky.

---

## 4.7 ACADEMY — Education, Course & Membership

**Priorita:** 7  
**Hlavní cíl:** nákup kurzu, registrace nebo členství  
**Role v portfoliu:** produktový systém pro prodej znalostí

### Použití

- online akademie,
- jazykové školy,
- odborné školy,
- mentoring,
- trenéři,
- cohort programy,
- certifikační programy,
- placené komunity.

### Povinná struktura

- katalog kurzů,
- detail kurzu,
- osnova,
- lektoři,
- výsledky absolventů,
- termíny cohort,
- pricing a membership,
- ukázková lekce nebo webinar,
- FAQ,
- členská/login část,
- resources a blog.

### Doporučené stránky

- Domů
- Kurzy
- Detail kurzu
- Lektoři
- Výsledky absolventů
- Membership
- Events / webináře
- Resources
- Přihlášení
- Kontakt

### Vizuální směr

Energický, ale důvěryhodný vzdělávací systém. Nesmí působit ani jako dětská škola, ani jako generický SaaS.

### Signature interaction

Interaktivní osnova kurzu s ukázkami lekcí, výsledky a jasným postupem studenta.

---

## 4.8 JOURNAL — Editorial, Blog & Podcast

**Priorita:** 8  
**Hlavní cíl:** odběr, opakovaná návštěva a konzumace obsahu  
**Role v portfoliu:** CMS-first šablona, jejímž hlavním produktem je obsah

### Použití

- magazín,
- odborný blog,
- firemní knowledge hub,
- podcast,
- niche media,
- newsroom,
- obsahový projekt.

### Povinná struktura

- featured story,
- kategoriální a tematické huby,
- autoři,
- kvalitní article detail,
- seriály a related content,
- podcast a video,
- fulltextové vyhledávání,
- newsletter,
- sponsor/ad slots,
- reading progress,
- obsah článku,
- sdílení a doporučené čtení.

### Doporučené stránky

- Homepage magazínu
- Kategorie
- Téma
- Article detail
- Autor
- Podcast / video
- Search results
- Newsletter landing page
- O projektu
- Kontakt

### Vizuální směr

Výrazná redakční typografie a charakteristická titulní mřížka. Velké množství obsahu nesmí způsobit vizuální chaos ani pomalé načítání.

### Signature interaction

Adaptivní editorial homepage, která umí pracovat s jedním velkým tématem i s hustým denním obsahem.

---

## 4.9 SUMMIT — Event, Conference & Product Launch

**Priorita:** 9  
**Hlavní cíl:** prodej vstupenky nebo registrace  
**Role v portfoliu:** časově orientovaný event systém

### Použití

- konference,
- festivaly,
- meetupy,
- workshopy,
- veletrhy,
- kulturní akce,
- produktové launch eventy.

### Povinná struktura

- countdown,
- registrace nebo ticket CTA,
- program po dnech a tracích,
- speakers,
- tickets/pricing,
- partneři,
- venue a doprava,
- FAQ,
- aktuality,
- live/stream odkazy,
- post-event galerie a záznamy.

### Doporučené stránky

- Domů
- Program
- Speakers
- Detail speakera
- Tickets
- Venue
- Partneři
- Aktuality
- Live / stream
- Záznamy / galerie
- Kontakt

### Vizuální směr

Výrazná typografie, pohyb a vlastní „poster identity“. Vizuální odvaha nesmí snižovat čitelnost programu ani komplikovat nákup vstupenky.

### Signature interaction

Interaktivní program s filtrováním podle dne, stage a tématu a možností vytvořit si vlastní plán.

---

## 4.10 COMMON — Community, Nonprofit & Impact

**Priorita:** 10  
**Hlavní cíl:** dar, členství, registrace dobrovolníka nebo účast  
**Role v portfoliu:** pokrytí komunitního a neziskového segmentu

### Použití

- neziskové organizace,
- nadace,
- spolky,
- sportovní kluby,
- lokální komunity,
- kulturní instituce,
- občanské iniciativy,
- environmentální projekty.

### Povinná struktura

- mise,
- programy,
- měřitelný dopad,
- příběhy lidí,
- události,
- transparentní financování,
- výroční zprávy,
- dobrovolnictví,
- členství,
- jednorázový a pravidelný dar.

### Doporučené stránky

- Domů
- Mise
- Programy
- Detail programu
- Dopad
- Příběhy
- Události
- Transparentnost / reporty
- Zapojte se
- Darovat
- Kontakt

### Vizuální směr

Humanistický editorial styl, skutečné příběhy a fotografie, vysoká přístupnost a důvěryhodná práce s čísly.

### Signature interaction

Impact explorer ukazující konkrétní výsledky podle programu, regionu nebo období.

---

# 5. Společný standard „Premium V3“

Fable nesmí dodat deset hezkých homepage nebo deset statických mockupů.

Každá šablona musí být hotový produktový systém.

## 5.1 Obsahová úplnost

Každá šablona musí mít:

- smysluplnou homepage,
- 6–10 relevantních stránek podle archetypu,
- alespoň jeden CMS/listing model,
- detail CMS položky,
- kontaktní nebo konverzní flow,
- 404,
- prázdný/no-results stav,
- loading stav tam, kde je relevantní,
- success a error stav formulářů,
- legal pages,
- kompletní navbar a footer.

Ne každá šablona musí mít stejný počet stránek. Stránky se volí podle skutečného účelu archetypu, ne kvůli číslu.

## 5.2 Designová originalita

Každá šablona musí mít:

- vlastní kompoziční logiku,
- vlastní typografickou hierarchii,
- vlastní image art direction,
- vlastní motion language,
- vlastní signature interaction,
- rozpoznatelnou vizuální identitu i bez loga,
- kvalitní desktop, tablet a mobile variantu.

Zakázané zkratky:

- deset šablon se stejným layoutem a jinou barvou,
- generické gradientové blob pozadí,
- náhodné skleněné karty,
- stejné bento gridy napříč celou kolekcí,
- falešné dashboard mockupy bez významu,
- dekorativní animace, které nepomáhají porozumění,
- převzetí cizího layoutu 1:1.

## 5.3 Univerzálnost

Každá šablona musí mít tři promyšlené mood presety.

Preset není pouze změna primary barvy. Musí koordinovaně měnit:

- barvy,
- typografii,
- radius,
- shadows,
- spacing personality,
- fotografický styl,
- dekorativní motiv,
- intenzitu animací.

Struktura a business logika zůstávají stabilní.

## 5.4 Content

- Výchozí jazyk je čeština.
- Texty musí být přirozené, profesionální a specifické pro demo použití.
- Žádné lorem ipsum.
- Žádná kopie textů reálných značek.
- Žádné falešné neurčité fráze typu „měníme budoucnost inovacemi“ bez vysvětlení hodnoty.
- Čísla, reference a case studies musí být zřetelně demo data.
- Struktura musí být připravená pro CS, EN a SK.

## 5.5 Obrázky a média

- Používat WebP a JPEG fallback podle `IMAGE_PIPELINE_STANDARD.md`.
- AVIF je v projektu zakázán.
- Každý obrázek musí mít vhodný aspect ratio, responsive sizes a smysluplný alt text.
- Nepoužívat náhodné stock fotografie bez jednotného art direction.
- Každá šablona musí mít vlastní konzistentní fotografický brief.
- Animace a video musí mít poster/fallback a respektovat reduced motion.

## 5.6 Konverzní logika

Každá šablona musí mít:

- jeden primární obchodní cíl,
- jeden konzistentní primární CTA label,
- sekundární CTA pouze tam, kde pomáhá rozhodnutí,
- důkazy před hlavní bariérou rozhodnutí,
- mobilní konverzní flow,
- smysluplný formulář,
- jasný success stav,
- měřitelné konverzní události připravené pro analytics.

## 5.7 Studio a editovatelnost

Uživatel musí být schopen bez zásahu do kódu:

- upravit všechny texty,
- vyměnit všechny obrázky,
- změnit logo,
- změnit theme preset,
- upravit barvy a typografii,
- přidat, odebrat, skrýt a přesunout sekce,
- duplikovat sekci,
- změnit dostupnou variantu sekce,
- upravit odkazy a CTA,
- spravovat CMS položky,
- zkontrolovat desktop, tablet a mobile,
- publikovat web.

Tento požadavek se netýká pouze „hlavního obsahu“. **Editovatelné musí být úplně všechno, co uživatel ve výsledné šabloně vidí nebo používá**, včetně:

- eyebrow a pomocných labelů,
- ikon, badge, dekorativních značek a oddělovačů,
- barev jednotlivých prvků,
- pozadí, gradientů, borderů, radiusů a shadows,
- rozměrů, paddingů, gapů, zarovnání a šířek kontejnerů,
- pořadí a počtu položek,
- breakpointového chování,
- visibility pro desktop, tablet a mobile,
- hover, focus, active a disabled stavů,
- animací, transition, scroll efektů a jejich intenzity,
- sliderů, carouselů, tabs, accordions a jejich nastavení,
- formulářových polí, labelů, validace a success/error zpráv,
- menu, submenu, mega menu, dropdownů a mobilní navigace,
- CMS vazeb, filtrů, sortingu, pagination a empty states,
- videí, posterů, map, embeds, sociálních odkazů a dalších médií,
- SEO polí, alt textů, odkazů, aria labelů a analytics identifikátorů.

Žádný viditelný nebo funkční prvek nesmí být napevno uzamčený ve shared rendereru nebo `skin.css`, pokud jeho úpravu může uživatel rozumně očekávat. Technické konstanty mohou zůstat v kódu pouze tehdy, když nejde o obsah, vzhled ani chování ovladatelné uživatelem.

Editor musí pro každý podporovaný prvek nabídnout srozumitelné ovládání. Nestačí, že lze hodnotu změnit ruční editací JSON, databáze nebo CSS.

### Nulová tolerance k nefunkčním detailům

Nemůže nastat situace, kdy:

- tlačítko nic nedělá,
- odkaz vede na neexistující stránku,
- slider, filtr, dropdown, tab nebo accordion funguje jen někdy,
- animace rozbije layout nebo mobil,
- formulář nemá validaci nebo odezvu,
- editor hodnotu zobrazí, ale neuloží ji,
- změna po reloadu zmizí,
- duplikace či reorder poškodí data,
- prvek funguje na veřejném webu, ale nejde upravit ve Studiu,
- prvek jde upravit ve Studiu, ale veřejný web změnu nevykreslí,
- desktop funguje, ale tablet nebo mobil ne,
- placeholder nebo demo ovládací prvek předstírá funkci, která není implementovaná.

I malý dekorativní nebo interaktivní prvek je součástí akceptace. Tato kolekce je výkladní skříní Webero; „téměř hotovo“ není stav `DONE`.

## 5.8 Performance, SEO a accessibility

Povinná gate pro homepage a reprezentativní detail:

- Lighthouse Performance minimálně 90,
- Lighthouse SEO minimálně 95,
- Lighthouse Accessibility minimálně 95,
- žádný horizontální overflow na 320, 390, 768, 1024 a 1440 px,
- správná heading hierarchie,
- klávesová navigace,
- viditelné focus states,
- dostatečný kontrast,
- reduced motion,
- správné metadata,
- canonical,
- sitemap,
- relevantní schema.org data,
- OG image.

## 5.9 Připravenost k reálnému spuštění

Prémiová šablona není hotová, pokud vypadá dobře pouze s perfektními demo daty.

Ověř také:

- dlouhé české nadpisy,
- chybějící obrázek,
- dlouhý název služby nebo produktu,
- více položek než v demu,
- méně položek než v demu,
- prázdný CMS,
- dlouhou navigaci,
- mobilní formuláře,
- neúspěšné odeslání formuláře.

## 5.10 Wix-level capabilities a rozšíření enginu

Nové šablony mohou a mají používat moderní prvky a schopnosti známé z Wix/Wix Studio, včetně těch, které v předchozí generaci šablon nešlo vytvořit kvůli omezením Venom enginu nebo editoru.

**Omezení současného editoru není důvod prvek vynechat nebo design zjednodušit.** Pokud prémiový návrh potřebuje schopnost, kterou Webero zatím nemá, Fable musí:

1. přesně popsat chybějící capability,
2. navrhnout její obecný datový model,
3. implementovat ji ve shared enginu,
4. přidat plnohodnotné ovládání do Studia,
5. přidat responsive a accessibility chování,
6. přidat persistenci, validaci a bezpečné defaulty,
7. přidat testy,
8. použít ji v šabloně,
9. ověřit ji na veřejném webu i ve Studiu.

Nejde o vizuální kopírování Wixu ani o převzetí proprietárního kódu. Cílem je dosáhnout minimálně stejné kategorie tvůrčích možností, použitelnosti a spolehlivosti vlastním, znovupoužitelným řešením Webero.

### Povinný capability audit proti Wix/Wix Studio

Před implementací první šablony proveď aktuální audit schopností Wix/Wix Studio a vytvoř matici:

| Oblast | Wix capability | Webero stav | Chybějící část | Rozhodnutí | Test |
|---|---|---|---|---|---|
| Příklad | Responsive stack/grid | supported / partial / missing | popis | reuse / extend / build | test/QA cesta |

Audit nesmí být jednorázový marketingový seznam. Musí sloužit jako technický backlog a průběžně se aktualizovat při stavbě všech deseti šablon.

### Minimální rozsah Wix-level prvků a možností

Fable musí prověřit a podle relevance pro V3 kolekci implementovat či dorovnat zejména:

#### Layout a responsive design

- volné i strukturované layouty,
- section, container, stack, grid a repeater,
- flex a CSS grid řízení,
- docking, alignment, gaps, padding a margins,
- min/max width a fluid sizing,
- breakpoint-specific hodnoty,
- hide/show podle breakpointu,
- sticky a fixed prvky,
- full-height a viewport sekce,
- overlap a vrstvení prvků,
- z-index a layers panel,
- bezpečné responsive přeskupení bez rozbití obsahu.

#### Typografie a vizuální styl

- globální i lokální typography styles,
- fluid type scale,
- text spans a zvýraznění části nadpisu,
- gradient text a text mask tam, kde jsou přístupné,
- borders, radius, shadows, opacity a blend chování,
- background image, video, gradient a overlay,
- theme colors a reusable design tokens,
- reusable component styles a varianty.

#### Interaktivní komponenty

- slider a carousel,
- tabs,
- accordion,
- modal, lightbox a drawer,
- tooltip a popover,
- announcement bar,
- dropdown a mega menu,
- breadcrumbs,
- pagination,
- before/after,
- comparison table,
- countdown,
- progress indikátory,
- filter a sort controls,
- search a no-results stav,
- sticky CTA,
- gallery grid, masonry a lightbox,
- testimonial, logo a content marquee s korektním reduced-motion fallbackem.

#### Animace a efekty

- entrance a reveal animace,
- hover a interaction states,
- scroll-triggered animace,
- parallax a sticky scroll storytelling,
- text reveal,
- image reveal a mask transitions,
- page/route transitions tam, kde jsou technicky bezpečné,
- motion timeline nebo sekvence,
- přesné řízení duration, easing, delay a intensity,
- vypnutí nebo omezení efektů přes `prefers-reduced-motion`,
- editorový preview animací bez poškození editace.

#### Obsah, CMS a dynamická data

- opakovatelné položky,
- collections,
- dynamické listing a detail stránky,
- reference mezi kolekcemi,
- filtry, sorting, pagination a search,
- author, category a tag modely,
- conditional visibility podle dat,
- empty, loading a error stavy,
- dataset preview ve Studiu,
- bezpečné přidávání, mazání a změna pořadí položek.

#### Formuláře a konverzní prvky

- text, email, telefon, textarea, select, multiselect, checkbox a radio,
- file upload, pokud je bezpečně podporovaný,
- vícekrokový formulář,
- podmíněná pole,
- klientská i serverová validace,
- inline chyby,
- loading, success a failure stav,
- spam ochrana,
- souhlas, GDPR a marketing permissions,
- rezervace, poptávka, newsletter, waitlist a registrace,
- analytics events a attribution data.

#### Média a embeds

- responsive image a art direction,
- video s posterem a ovládáním,
- background video s bezpečným mobile fallbackem,
- audio/podcast player,
- mapa,
- social embeds,
- bezpečný custom embed/code component pouze v jasně vymezeném sandboxu,
- download soubory a dokumenty,
- ikony a SVG s editovatelnými barvami tam, kde to dává smysl.

#### Navigace, stránky a globální prvky

- víceúrovňová navigace,
- mega menu,
- desktop/tablet/mobile varianty navigace,
- globální header a footer,
- reusable sections/components,
- page templates,
- anchor navigation,
- search,
- utility a legal stránky,
- 404 a maintenance/coming soon,
- locale switcher,
- konzistentní globální změny napříč stránkami.

#### Produktové moduly

- blog a editorial CMS,
- portfolio a case studies,
- events a program,
- membership a gated content,
- bookings a termíny,
- pricing plans,
- donations,
- ecommerce listing, PDP, cart, checkout a account,
- multilingual content,
- analytics a marketing integrations.

Produktový modul se nesmí napodobit nefunkčním statickým UI. Pokud backendová schopnost ještě neexistuje a je pro konkrétní šablonu povinná, musí být implementována end-to-end nebo musí být transparentně označena jako blocker. Šablona bez povinné end-to-end funkce není `DONE`.

### Požadavky na Studio při rozšíření

Každá nová capability musí ve Studiu obsahovat:

- přidání prvku,
- výběr a spolehlivý focus,
- layers zobrazení,
- pojmenování,
- reorder a nesting, pokud je relevantní,
- duplicate,
- hide/show,
- delete a bezpečné undo,
- content nastavení,
- style nastavení,
- layout nastavení,
- interaction nastavení,
- breakpoint overrides,
- accessible labely a nápovědu,
- validaci chybných kombinací,
- persistenci po reloadu,
- reset na default,
- preview výsledku bez nutnosti publikace.

Nestačí přidat nový renderer na veřejný web. Capability bez odpovídajícího editorového UX je nedokončená.

## 5.11 Nejvyšší úroveň designu a kvality kódu

Těchto deset šablon je **výkladní skříní Webero**. Kvalita se neposuzuje relativně vůči starším šablonám, ale proti nejlepším současným výstupům prémiových digitálních agentur a nejlepším šablonám Wix Studio, Webflow a Framer.

### Design quality bar

- Každá stránka musí působit art-directed, nikoliv automaticky poskládaná.
- Design musí být konzistentní od homepage přes detail až po formuláře, utility a error states.
- Typografie, spacing, barvy, média, motion a interakce musí tvořit jeden systém.
- Každý breakpoint musí působit záměrně navržený, ne pouze zmenšený desktop.
- Design musí zůstat kvalitní i po výměně obsahu ve Studiu.
- Vizuální efekt nesmí být použit pouze proto, že je technicky možný.
- Detail komponent, focus states, hover states, transitions, skeletons a empty states je stejně důležitý jako hero.
- Finální výsledek musí obstát při přímém srovnání s nejlepšími prémiovými marketplace šablonami.

### Code quality bar

- strict TypeScript bez zbytečných `any`,
- žádné ignorované chyby nebo umlčené warningy bez zdůvodnění,
- žádné duplicitní business logiky mezi šablonami,
- žádné obří monolitické komponenty, pokud lze logiku bezpečně rozdělit,
- jasné typy pro content, settings, variants a editor state,
- schema validace na hranicích dat,
- bezpečná migrace existujících tenantů při změně schématu,
- zpětná kompatibilita se stávajícími šablonami,
- stabilní IDs a deterministická persistence,
- error boundaries a bezpečné fallbacky,
- žádné memory leaks, nekonečné effect loopy nebo hydration chyby,
- žádné console errors ani neošetřené promise rejections,
- testy pro renderer, editor, persistence a kritické interakce,
- reusable capability musí mít dokumentovaný kontrakt a příklad použití,
- změny shared enginu nesmí regresně poškodit existující šablony.

### Definice „bezchybné“

Před `DONE` musí být každý interaktivní prvek inventarizován a otestován. Nestačí namátkový průchod homepage. QA checklist musí obsahovat každé:

- tlačítko,
- odkaz,
- menu a submenu,
- input a formulář,
- slider a carousel,
- tab a accordion,
- modal a drawer,
- filtr, sort a search,
- CMS listing a detail,
- animaci a scroll interaction,
- breakpointovou variantu,
- editorový control,
- save, reload, undo a publish flow.

U každého prvku ověř:

1. výchozí stav,
2. interaction stav,
3. chybový nebo prázdný stav,
4. klávesnici a focus,
5. desktop, tablet a mobile,
6. editaci ve Studiu,
7. uložení a persistenci po reloadu,
8. veřejný render po publikaci.

Jediný nefunkční nebo needitovatelný prvek blokuje stav `DONE`.

---

# 6. Doporučené pořadí realizace

## Vlna 1 — největší obchodní dopad

1. PROOF
2. SIGNAL
3. ORBIT
4. ATELIER

Tyto čtyři šablony nejrychleji rozšíří cílový trh Webero a zaplní největší mezery.

## Vlna 2 — monetizace a osobní podnikání

5. MAISON
6. PERSONA
7. ACADEMY

## Vlna 3 — nové segmenty

8. JOURNAL
9. SUMMIT
10. COMMON

### Pravidlo pokračování

Neimplementuj automaticky všech deset naráz bez stabilizace shared enginu.

Po každé šabloně:

1. spusť validátor,
2. proveď browser QA desktop + mobile,
3. proveď Studio editor QA,
4. oprav obecné nedostatky v shared enginu,
5. zdokumentuj nové znovupoužitelné varianty,
6. teprve potom pokračuj další šablonou.

---

# 7. Workflow pro každou šablonu

## Fáze A — Product brief

Před implementací vytvoř stručný product/design brief:

- cíloví uživatelé,
- hlavní konverze,
- tři až pět nejčastějších oborů,
- informační architektura,
- stránky,
- CMS modely,
- konverzní flow,
- visual concept,
- typography,
- palette,
- photographic direction,
- signature interaction,
- tři mood presety,
- nové shared varianty potřebné v enginu.

## Fáze B — Engine gap analysis

Zjisti:

- které Wix/Wix Studio capabilities jsou pro danou šablonu relevantní,
- zda je Webero podporuje plně, částečně, nebo vůbec,
- které existující section types lze znovu použít,
- které varianty lze znovu použít,
- které varianty potřebují rozšířit,
- zda je nutný nový obecný section type,
- jak bude vše editovatelné ve Studiu,
- jak se budou ukládat CMS nebo commerce data.

Nevytvářej template-only hack, pokud je potřeba obecná schopnost enginu. Pokud chybí editorová nebo runtime capability nutná pro nejvyšší designovou úroveň, rozšiř engine i Studio v rámci práce na šabloně.

## Fáze C — Implementace

Vytvoř:

- `src/templates/<slug>/template.json`,
- `src/templates/<slug>/theme.json`,
- `src/templates/<slug>/content/cs.json`,
- případné další lokalizace,
- template-scoped `skin.css` pouze tam, kde nestačí theme a varianty,
- media manifest a optimalizovaná aktiva,
- preview asset,
- README s popisem designu, variant a changelogem.

## Fáze D — Validace

Povinně:

```bash
pnpm validate:template <slug>
```

Dále:

- schema validace,
- typecheck,
- relevantní testy,
- build,
- Lighthouse,
- browser QA,
- Studio QA.

## Fáze E — Showcase

Vytvoř vyplněný showcase tenant podle existujícího deployment flow.

Showcase musí:

- používat přesvědčivá demo data,
- ukázat všechny klíčové funkce,
- být vizuálně kompletní,
- neobsahovat reálné cizí značky, kontakty nebo chráněný obsah,
- fungovat na desktopu i mobilu,
- být editovatelný ve Studiu.

---

# 8. Acceptance criteria pro každou šablonu

Šablona je `DONE` pouze když:

1. Má jasný archetyp a primární konverzní cíl.
2. Je použitelná minimálně pro pět konkrétních oborů nebo use cases.
3. Má kompletní informační architekturu, ne pouze homepage.
4. Obsahuje relevantní listing a detail tam, kde to archetyp vyžaduje.
5. Má vlastní rozpoznatelný vizuální systém.
6. Má vlastní signature interaction.
7. Má tři funkční mood presety.
8. Úplně každý viditelný, obsahový, stylový a interaktivní prvek je v přiměřeném rozsahu editovatelný ve Studiu.
9. Všechny použité section variants jsou registrované a funkční.
10. Template validátor končí s exit code 0.
11. Desktop QA projde na 1440 px.
12. Tablet QA projde na 768 a 1024 px.
13. Mobile QA projde na 320 a 390 px.
14. Lighthouse splní projektové limity.
15. Formuláře mají success a error state.
16. Web respektuje reduced motion a klávesovou navigaci.
17. Obrázky používají schválený pipeline a formáty.
18. Demo neobsahuje cizí brand, kontakty nebo kopírovaný obsah.
19. Showcase tenant je vytvořený a otevřitelný.
20. Byly ověřeny editace, reorder, hide/show, duplicate, add section, změna varianty, reload a persist.
21. Pro šablonu je vyplněná Wix capability matice a žádná relevantní chybějící capability není tiše vynechaná.
22. Každá nová capability funguje end-to-end v runtime, persistence vrstvě i Studiu.
23. Každý interaktivní prvek má samostatný záznam v QA checklistu a prošel.
24. Browser console neobsahuje chyby, hydration problémy ani neošetřené promise rejections.
25. Shared změny mají regresní test nebo prokazatelný QA průchod reprezentativních starších šablon.
26. Žádný prvek není pouze vizuální maketa funkce, která má podle designu působit interaktivně.
27. Code review nenašel template-only hack, zbytečnou duplicitu ani nezdokumentované obejití enginu.
28. Design review potvrdil konzistenci všech stránek, stavů a breakpointů, nejen homepage.

---

# 9. Portfolio-level acceptance criteria

Celá kolekce je hotová pouze když:

- všech deset šablon je vedle sebe jasně odlišitelných,
- žádné dvě šablony nemají stejný hero převlečený jinou barvou,
- každý hlavní business intent má jasného reprezentanta,
- kolekce dohromady pokrývá služby, B2B, SaaS, creative, commerce, personal brand, education, editorial, events a community,
- mood presety nepůsobí jako dalších 30 samostatných nekonzistentních šablon,
- shared varianty jsou zdokumentované a použitelné i v budoucnu,
- capability audit proti Wix/Wix Studio je dokončený a relevantní mezery pro V3 jsou implementované,
- všechny nové capabilities mají plnohodnotné Studio ovládání a regresní pokrytí,
- picker umí šablony filtrovat podle business intentu, nejen podle industry,
- preview obrázky tvoří vizuálně soudržnou prémiovou kolekci,
- homepage Webero může použít minimálně čtyři z nich jako hlavní produktový důkaz,
- žádná šablona neobsahuje známý nefunkční, neuložitelný nebo needitovatelný prvek.

---

# 10. Co se nesmí stát

- Nevytvářej dalších deset oborových klonů existujících webů.
- Nekopíruj Wix, Framer, Webflow, Squarespace ani Awwwards weby 1:1.
- Nezastav se u návrhu nebo dokumentace, pokud je úkolem implementace.
- Nedodávej pouze screenshoty nebo Figma mockupy bez funkčního enginu.
- Nevytvářej vlastní oddělený editor pro V3 šablony.
- Nevytvářej vlastní commerce logiku pouze pro MAISON.
- Nevynechávej prémiový prvek pouze proto, že jej starý engine nebo editor neumí.
- Nenahrazuj chybějící capability statickou maketou, obrázkem nebo nefunkčním ovládacím prvkem.
- Nepřidávej runtime prvek bez jeho plnohodnotné editace ve Studiu.
- Nenechávej žádný text, ikonu, efekt, stav nebo nastavení needitovatelné jen proto, že je „malé“.
- Neobcházej template validátor.
- Netvrď, že je šablona editovatelná, dokud nebyla skutečně ověřena ve Studiu.
- Netvrď, že je šablona hotová, pokud nebyl otestován každý interaktivní prvek.
- Neoptimalizuj pouze pro 1440px screenshot.
- Nezahlcuj web efekty na úkor výkonu, čitelnosti nebo konverze.
- Nerevertuj ani nepřepisuj existující cizí změny v pracovním stromu.
- Nedeployuj bez výslovného pokynu uživatele.

---

# 11. Výstup Fable po každé šabloně

Odevzdej:

1. Název, slug a archetyp.
2. Implementované stránky.
3. Implementované CMS/commerce modely.
4. Použité existující shared varianty.
5. Nové nebo rozšířené shared varianty.
6. Popis tří mood presetů.
7. Popis signature interaction.
8. Přesné výsledky validátoru, typechecku, testů a buildu.
9. Výsledky desktop, tablet a mobile QA.
10. Výsledky Lighthouse.
11. Co bylo ověřeno ve Studiu.
12. URL nebo slug showcase tenanta.
13. Známé limity nebo zbývající blocker.
14. Seznam změněných souborů.
15. Commit hash, pokud byl vytvořen commit.
16. Aktualizovanou Wix/Wix Studio capability matici.
17. Inventář všech interaktivních prvků a výsledek jejich end-to-end QA.
18. Přesný seznam nových možností přidaných do Webero Studia.

Nevydávej neurčité tvrzení „vše funguje“. Uveď přesné příkazy, výsledky a ověřené flow.

---

# 12. Externí zdroje průzkumu

- Wix Templates: https://www.wix.com/website/templates
- Wix SaaS Templates: https://www.wix.com/website/templates/refine/saas-company
- Squarespace Templates: https://www.squarespace.com/templates/
- Webflow Template Categories: https://webflow.com/templates/categories
- Webflow Design Trends 2026: https://webflow.com/blog/web-design-trends-2026
- Framer Landing Page Templates: https://www.framer.com/marketplace/templates/category/landing-page/
- Framer Portfolio Templates: https://www.framer.com/marketplace/templates/category/portfolio/
- Framer Agency Templates: https://www.framer.com/community/marketplace/templates/categories/agency/
- Webnode Templates: https://www.webnode.com/cs/sablony/
- Webnode Features: https://www.webnode.com/cs/vyhody-systemu-webnode/

---

# 13. Finální zadání pro Fable

Navrhni a postupně implementuj deset prémiových univerzálních šablon nové generace:

1. PROOF
2. SIGNAL
3. ORBIT
4. ATELIER
5. MAISON
6. PERSONA
7. ACADEMY
8. JOURNAL
9. SUMMIT
10. COMMON

Nejde o soutěž v počtu sekcí ani o deset vizuálních experimentů. Cílem je deset skutečných webových produktů, které:

- řeší deset rozdílných obchodních potřeb,
- působí jako práce prémiové digitální agentury,
- využívají plnou šíři moderních Wix/Wix Studio-level layoutů, prvků, interakcí, CMS a produktových možností relevantních pro daný archetyp,
- rozšiřují shared engine a Studio všude, kde současné Webero těchto možností ještě nedosahuje,
- lze bez kódu přizpůsobit desítkám oborů,
- fungují v současném Webero enginu a Studiu,
- mají špičkový mobil, výkon, SEO a accessibility,
- jsou připravené pro české a evropské zákazníky,
- společně posunou vnímání Webero z „builderu s mnoha šablonami“ na platformu s nejlepšími hotovými webovými systémy na trhu.

Každý prvek, od největší interaktivní sekce po nejmenší ikonu nebo stav tlačítka, musí být funkční, responzivní, přístupný, uložitelný a editovatelný ve Studiu. Jediná známá nefunkčnost nebo needitovatelný detail blokuje dokončení šablony.
