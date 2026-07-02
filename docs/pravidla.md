# PRAVIDLA PRO AI -- KOMPLETNÍ KONFIGURACE PROJEKTU

Tento soubor je **hlavní zdroj pravdy pro AI asistenty** (ChatGPT,
Claude, Copilot apod.).

Pokud uživatel napíše **„pravidla"** nebo požádá o práci na projektu,
musí AI:

1.  Nejprve přečíst **tento soubor celý**
2.  Pochopit všechny instrukce
3.  Řídit se jimi při každé úpravě kódu

AI nesmí začít implementaci bez pochopení tohoto dokumentu.

Tento soubor kombinuje:

-   AI_RULES
-   ARCHITECTURE
-   CODING_RULES
-   PROJECT_CONTEXT

Nic z těchto pravidel nesmí být ignorováno.

------------------------------------------------------------------------

# 1. AI WORKFLOW A PRAVIDLA PRÁCE

AI musí pracovat jako **senior produkční full‑stack developer**.

Projekt není prototyp.

Každá změna musí zachovat:

-   stabilitu systému
-   kompatibilitu
-   architekturu
-   existující funkce

------------------------------------------------------------------------

## Povinný postup práce

Před implementací musí AI:

1.  analyzovat relevantní soubory
2.  identifikovat závislosti
3.  navrhnout krátký plán změn

Poté:

4.  provést **co nejmenší bezpečnou změnu**

Po implementaci:

5.  vypsat upravené soubory
6.  vysvětlit změny
7.  navrhnout testování

------------------------------------------------------------------------

## Povinná pravidla

AI musí:

-   měnit **pouze minimum nutného kódu**
-   zachovat existující funkcionalitu
-   respektovat architekturu projektu
-   zabránit duplicitám
-   zachovat kompatibilitu API
-   zachovat design systému

------------------------------------------------------------------------

## Pravidla pro obsah a SEO

Při tvorbě článků, landing pages, title, meta description, excerptů,
headingů a dalšího obsahu AI nesmí slibovat něco, co výsledný obsah
reálně a jasně nedoručí.

Platí zejména:

-   nepsat do title, meta, excerptu ani nadpisů čísla typu `25+`,
    `47`, `51+`, `54 příkladů`, `30 tipů` apod., pokud článek opravdu
    neobsahuje alespoň takový počet jasně počitatelných položek
-   pokud článek takový počet kvalitně nedoručí, AI nesmí článek
    znovu a znovu násilně rozšiřovat jen kvůli číslu v titulku; místo
    toho musí snížit nebo úplně odstranit číselný slib v `title`,
    `metaTitle`, `metaDescription`, `excerptu` i relevantních headingách
-   kvalita má přednost před počtem; lepší je menší počet opravdu
    silných příkladů než dlouhý nafouknutý seznam s vatou
-   neumisťovat nafouknuté nebo marketingově přehnané počty jen kvůli
    CTR nebo SEO
-   pokud nadpis nebo title slibuje examples, samples, templates, tipy,
    mistakes, checklisty nebo podobný seznam, hlavní hodnota článku musí
    být doručena přímo v těchto konkrétních položkách, ne jen v obecném
    textu okolo
-   počitatelné položky musí být pro uživatele i validaci zřetelné a
    jednoznačné
-   pokud článek používá hero image převzatý z prvního inline obrázku,
    stejný obrázek se už nesmí znovu objevit níže v těle článku
-   inline obrázky v článku musí mít konzistentní nebo velmi podobný
    poměr stran a vizuální výšku; nesmí vzniknout stav, kdy je jeden
    obrázek výrazně vyšší nebo působí 2x větší než ostatní bez
    explicitního designového důvodu
-   obrázky v článku mají být rozumně rozmístěné; nesmí být nahuštěné
    těsně za sebou bez dostatečného obsahového odstupu
-   každý inline obrázek musí tematicky odpovídat konkrétní sekci a textu
    okolo něj; nestačí obecná kancelářská nebo programátorská fotka,
    pokud sekce mluví o jiném tématu
-   obrázky nesmí být jen externí hotlinky, pokud to může způsobit
    nestabilitu nebo `404`; před publikací mají být stažené a uložené
    na našem vlastním hostingu nebo asset storage
-   AI nesmí znovu používat obrázky, které už byly importované do jiného
    článku, pokud k tomu není výslovný redakční důvod
-   nevymýšlet statistiky, průzkumy, procenta ani autoritativní tvrzení,
    pokud nejsou opřené o reálný zdroj nebo vstupní data
-   každý článek musí být psaný pro konkrétní publikum a konkrétní úkol;
    AI si musí ujasnit, komu článek slouží a co má čtenář po přečtení
    prakticky zvládnout
-   obsah musí být primárně people-first, ne search-engine-first; cílem
    není jen pokrýt keyword, ale skutečně pomoct uživateli vyřešit jeho
    problém

------------------------------------------------------------------------

## Pravidla pro formu blog článků (UX/CRO)

Blog článek nesmí působit jako dlouhý AI wall of text. Musí být
rychle skenovatelný, rytmický, konkrétní a čitelný i bez poctivého
čtení každé věty.

Platí zejména:

-   hero + intro musí být krátké a tvrdé:
    -   první odstavec přepsat do 2 až 3 krátkých vět
    -   1 věta = problém
    -   1 věta = dopad
    -   1 věta = řešení nebo promise článku
    -   hned nahoře má být jasný hook a konkrétní benefit pro čtenáře
-   první obrazovka článku musí co nejrychleji odpovědět na hlavní
    otázku nebo search intent; klíčová hodnota nesmí být schovaná až
    hluboko v článku
-   hned po úvodu má být krátký blok typu `What You'll Learn` /
    `Key Takeaways`, aby uživatel během pár vteřin chápal hodnotu článku
-   dlouhé odstavce jsou zakázané:
    -   každý odstavec má mít maximálně 2 věty
    -   1 myšlenka = 1 blok
    -   odstavce delší než cca 3 vizuální řádky je nutné rozbít
-   článek má být agresivně strukturovaný do microbloků, seznamů,
    checklistů, compare bloků a příkladů; dlouhé vysvětlující odstavce
    bez struktury jsou nežádoucí
-   pokud sekce vysvětluje postup, chyby, tipy, typy nebo examples,
    preferovat listový formát:
    -   bullet list
    -   checklist
    -   `do this / avoid this`
    -   `before / after`
    -   krátký highlight box
-   každá důležitá sekce má ideálně obsahovat konkrétní příklad; u
    článků o resume bullets, examples, templates, mistakes nebo tips jsou
    `before / after` bloky silně preferované a často povinné
-   generické H2/H3 jsou zakázané; nadpisy mají být konkrétní a
    hodnotové:
    -   používat patterns jako čísla, mistakes, examples, checklist,
        `do this / avoid this`
    -   nepsat mrtvé headingy typu `Types`, `Overview`, `Introduction`,
        `Conclusion`, pokud nepřinášejí konkrétní hodnotu
-   článek musí mít vizuální rytmus:
    -   nestřídat 5 obrazovek čistého textu
    -   každé 2 až 3 sekce změnit formát obsahu
    -   kombinovat text, bullets, box, examples, checklist, image
-   přidávat 2 až 4 highlight boxy s jasnou funkcí:
    -   `Pro tip`
    -   `Big mistake`
    -   `Quick formula`
    -   `Do this / avoid this`
-   abstraktní vysvětlení preferovat převádět do jednoduchých modelů a
    formulí, které si čtenář zapamatuje
-   klíčové části vět mají být pravidelně zvýrazněné pomocí `bold`;
    čtenář musí být schopný projet jen bold části a stále pochopit pointu
-   článek musí mít jasný logický flow:
    -   hook
    -   krátké vysvětlení tématu
    -   proč na tom záleží
    -   framework nebo postup
    -   examples nebo hlavní praktická hodnota
    -   mistakes
    -   checklist
    -   CTA
-   odstraňovat vatu a generické AI fráze:
    -   `it is important`
    -   `you should consider`
    -   `in conclusion`
    -   obecné shrnující fráze bez nové informace
-   CTA na konci musí vést ke konkrétní akci a nesmí být vágní
-   text musí používat plain language:
    -   krátké a přímočaré věty
    -   silná slovesa místo vágních formulací
    -   headingy, anchor texty a checklisty musí jasně říkat, co čtenář
        dostane nebo udělá
-   pokud článek obsahuje doporučení, postup nebo rozhodnutí, má být
    napsaný task-first: uživatel musí rychle poznat, co udělat teď,
    co zkontrolovat a čemu se vyhnout

------------------------------------------------------------------------

## Pravidla pro generování přes Haiku

Pokud je blogový draft vytvářen přes Claude Haiku nebo jiný levnější
rychlý model, nesmí AI spoléhat na to, že model sám od sebe vytvoří
dobrou formu článku.

Platí zejména:

-   Haiku je vhodný hlavně pro draft a strukturu, ne jako bezhlavý
    finální autor bez tvrdého promptu a QA
-   prompt pro Haiku musí být explicitní, strukturální a restriktivní;
    nestačí obecné zadání typu „napiš článek“
-   Haiku musí dostat povinnou kostru článku:
    -   key takeaways / what you'll learn
    -   hook
    -   co je to / co se počítá
    -   proč je to důležité nebo framework
    -   examples
    -   mistakes nebo checklist
    -   FAQ
    -   CTA
-   prompt musí Haiku explicitně nutit do:
    -   short intro
    -   microbloků
    -   bulletizace
    -   before / after examples
    -   callout boxů
    -   formulí
    -   konkrétního CTA
-   prompt musí Haiku explicitně zakazovat:
    -   wall of text
    -   generické headingy
    -   dlouhé úvody
    -   conclusion filler
    -   corporate fluff
    -   vysvětlování bez examples
-   pokud Haiku vrátí sekci `examples`, `mistakes`, `checklist`,
    `framework` nebo podobnou, musí tato sekce opravdu doručit slíbený
    formát a nesmí obsahovat jen obecný text
-   jakýkoli draft z Haiku musí projít QA; pokud forma článku působí
    genericky, vatovitě nebo strojově, nesmí se publikovat bez úprav
-   automatizace musí mít tvrdý limit pokusů; pro jeden článek jsou
    povolené maximálně 3 generovací pokusy a potom musí systém článek
    označit jako failed / k ruční kontrole místo dalších drahých pokusů
-   tento limit platí pro každý článek samostatně i uvnitř dávky
    (například při batchi po 10 článcích)
-   QA musí před publikací kontrolovat nejen validní JSON, ale i:
    -   realistický title/meta promise
    -   skutečný počet countable položek
    -   přítomnost examples/checklistů tam, kde je článek slibuje
    -   kvalitu a tematickou přesnost obrázků
    -   FAQ formát
    -   CTA formát
    -   interní odkazy
-   AI může draft vytvořit, ale odpovědnost za publikovatelný výstup nese
    finální QA vrstva; nic nesmí být publikováno jen proto, že to model
    napsal bez chyby v JSON
-   pokud byl AI použit na tvorbu nebo úpravu článku, interní workflow má
    zachovat jasnou lidskou kontrolu nad fakty, claims, titulky a výběrem
    obrázků

    ### Optimalizace nákladů (produkční režim)

    
- cílová délka článku: 1400–1700 slov
- nepřekračovat délku bez jasného důvodu (např. komplexní téma)
- preferovat strukturovaný obsah (listy, checklisty, příklady) před dlouhými odstavci
- každý článek = 1 generace (max 1 retry pouze při chybě)
- nikdy negenerovat znovu kvůli stylu nebo subjektivní kvalitě

------------------------------------------------------------------------

## Pravidla pro transparentnost a opravy

Při tvorbě a publikaci obsahu musí systém podporovat důvěryhodnost,
sledovatelnost změn a bezpečné opravy.

Platí zejména:

-   pokud je článek fakticky slabý, nejasný, zavádějící nebo porušuje
    tato pravidla, nesmí se „protlačit“ do publikace jen proto, že
    prošel technickou validací
-   pokud se po generování zjistí problém v titulku, claimu, obrázku,
    interním odkazu nebo count slibu, priorita je článek opravit nebo
    zablokovat, ne chybu přehlédnout
-   workflow má být navržený tak, aby bylo možné rychle a bezpečně
    opravit chybné články, chybné meta informace i nefunkční assety
-   AI nesmí působit jako autorita sama o sobě; důvěryhodnost článku musí
    stát na kvalitě obsahu, validaci a editoriální kontrole

------------------------------------------------------------------------

## Pravidla pro typografii blog článků

Typography blog detailu musí podporovat kompaktní reading experience,
ne přerostlý nebo vizuálně těžký layout.

Platí zejména:

-   blogový obsah má používat jeden moderní sans-serif font, standardně
    `Inter` nebo nejbližší ekvivalent
-   nepoužívat více různých font families v rámci samotného článku bez
    explicitního důvodu
-   nepoužívat opticky přerostlé H1/H2/H3 ani přehnaně vzdušný leading
-   text článku má být kompaktní, čitelný a profesionální; nesmí působit
    jako landing page hero
-   mezery mezi odstavci a textovými bloky mají být střídmé; článek má
    být dobře skenovatelný, ale ne zbytečně roztažený
-   textový sloupec nesmí být příliš široký; čtení přes celou šířku
    layoutu je nežádoucí

------------------------------------------------------------------------

## Zakázané akce

AI nesmí:

-   přepisovat celé soubory bez důvodu
-   dělat velký refactor
-   měnit strukturu složek
-   přejmenovávat moduly
-   nahrazovat knihovny
-   měnit architekturu bez požadavku

------------------------------------------------------------------------

# 2. ARCHITEKTURA PROJEKTU

Systém je navržen jako **modulární SaaS platforma**.

Hlavní části:

-   CRM systém
-   realitní nástroje
-   lead generation systémy
-   scrapers
-   analytické nástroje
-   SaaS aplikace

------------------------------------------------------------------------

## Principy architektury

Architektura musí dodržovat:

-   modularitu
-   oddělení zodpovědností
-   škálovatelnost
-   znovupoužitelnost
-   nízkou závislost mezi moduly

------------------------------------------------------------------------

## Typická struktura projektu

core/ modules/ services/ components/ api/ utils/ config/

------------------------------------------------------------------------

## Core vrstva

Core obsahuje sdílenou logiku.

Například:

core/ errors validators types helpers constants

Pravidla:

-   žádná business logika
-   pouze utility

------------------------------------------------------------------------

## Moduly

Funkce aplikace patří do modulů.

Například:

modules/ crm real-estate scrapers payments analytics users

Každý modul obsahuje:

components/ services/ api/ types/

Moduly musí být:

-   nezávislé
-   rozšiřitelné

------------------------------------------------------------------------

## Services

Services obsahují znovupoužitelnou logiku.

Příklady:

services/ emailService paymentService scraperService aiService

Pravidla:

-   žádná UI logika
-   stateless pokud možno

------------------------------------------------------------------------

## API vrstva

API musí být RESTful.

Příklady:

GET /users GET /users/:id POST /users DELETE /users/:id

Pravidla:

-   validace vstupů
-   konzistentní naming

------------------------------------------------------------------------

## Datový tok

UI → Modul → Service → API → Databáze

UI nesmí komunikovat přímo s databází.

------------------------------------------------------------------------

## Databázová pravidla

Databáze musí být:

-   indexovaná
-   normalizovaná
-   efektivní

Vyhnout se:

SELECT \*

Používat:

-   pagination
-   filtering
-   limits

------------------------------------------------------------------------

## Monitoring

Produkční systém musí podporovat:

-   logging
-   monitoring
-   error tracking

Doporučené nástroje:

-   Sentry
-   Grafana
-   Posthog

------------------------------------------------------------------------

# 3. CODING STANDARD

Kód musí být:

-   čitelný
-   modulární
-   udržitelný

Preferuj jednoduchost.

------------------------------------------------------------------------

## Naming konvence

Funkce:

camelCase

příklad:

getUserData()

------------------------------------------------------------------------

Třídy:

PascalCase

příklad:

UserService

------------------------------------------------------------------------

Soubory:

kebab-case

příklad:

user-service.ts

------------------------------------------------------------------------

Konstanty:

UPPER_CASE

příklad:

MAX_UPLOAD_SIZE

------------------------------------------------------------------------

## Design funkcí

Funkce musí:

-   dělat jednu věc
-   být krátké
-   nemít hluboké zanoření

------------------------------------------------------------------------

Špatný příklad:

function processUserData(data) {}

------------------------------------------------------------------------

Dobrý příklad:

validateUser() formatUser() saveUser()

------------------------------------------------------------------------

## Error handling

Špatně:

try { ... } catch(e) { console.log(e) }

------------------------------------------------------------------------

Správně:

throw new AppError("USER_NOT_FOUND", 404)

------------------------------------------------------------------------

## Validace vstupů

Validovat:

-   API vstupy
-   formuláře
-   query parametry

Nikdy nevěřit uživatelskému vstupu.

------------------------------------------------------------------------

## Závislosti

Před přidáním dependency:

1.  ověř zda již neexistuje
2.  zda nestačí native JS
3.  zda je knihovna udržovaná

Minimalizovat závislosti.

------------------------------------------------------------------------

## Performance

Vyhnout se:

-   opakovaným API voláním
-   velkým query
-   zbytečnému renderování

Používat:

-   caching
-   memoization
-   pagination

------------------------------------------------------------------------

## Security

Zajistit:

-   XSS ochranu
-   CSRF ochranu
-   sanitizaci vstupů
-   bezpečné přihlášení

Nikdy nevystavovat:

-   secrets
-   tokeny
-   private keys

------------------------------------------------------------------------

# 4. KONTEXT PROJEKTU

Tento projekt je **větší SaaS ekosystém**.

Obsahuje:

1.  CRM systém
2.  realitní nástroje
3.  lead generation aplikace
4.  datové scrapery
5.  SaaS aplikace
6.  analytické dashboardy

------------------------------------------------------------------------

## Business cíle

Platforma má:

-   automatizovat realitní procesy
-   sbírat leady
-   analyzovat trh
-   poskytovat SaaS nástroje
-   růst do marketplace platformy

------------------------------------------------------------------------

## Typičtí uživatelé

-   realitní makléři
-   realitní kanceláře
-   interní CRM uživatelé
-   návštěvníci webu

------------------------------------------------------------------------

## Používaný technologický stack

Frontend:

-   Next.js
-   React
-   moderní komponentové knihovny

Backend:

-   Node.js
-   API routes
-   serverless funkce

Infrastruktura:

-   Vercel
-   cloud hosting
-   API integrace
-   scrapery

------------------------------------------------------------------------

## Filozofie vývoje

Systém musí být:

-   stabilní
-   modulární
-   škálovatelný

AI musí vždy preferovat:

**produkční bezpečný kód před rychlým hackem.**

------------------------------------------------------------------------

# KONEČNÉ PRAVIDLO

AI musí vždy:

-   přečíst tento soubor před prací
-   dodržovat všechny výše uvedené sekce
-   minimalizovat zásahy do systému
-   zachovat stabilitu aplikace

------------------------------------------------------------------------

# VENOM SAAS — PRAVIDLA PRO ŠABLONY (přečíst při každé nové šabloně)

> **POVINNÉ**: Při každé nové šabloně AI přečte tento oddíl celý dříve,
> než začne jakoukoliv práci.

## POVINNÝ WORKFLOW — žádná zkratka není přijatelná

AI **NESMÍ** říct „hotovo" nebo „vše funguje" bez splnění VŠECH bodů:

1. Spustit dev server (`NODE_ENV=development PORT=3015 npx next dev`)
2. Udělat screenshot **každé** stránky přes Playwright (ne jen homepage)
3. Ověřit: obsah je viditelný, nav bez dead links, žádné broken images
4. Udělat mobilní screenshot (viewport 390×844)
5. Zkontrolovat JS console errors v Playwright
6. **Porovnat s originálním webem** — viz sekce níže
7. Teprve potom hlásit hotovo

**Pokud screenshot ukáže černou obrazovku nebo broken layout → STOP,
diagnostikovat, opravit, screenshot znovu.**

------------------------------------------------------------------------

## POVINNÉ SROVNÁNÍ S ORIGINÁLEM

Po dokončení šablony **AI musí** udělat side-by-side srovnání:

1. Screenshot originálního webu (URL zdrojového webu) — desktop i mobil
2. Screenshot naší verze — desktop i mobil
3. Vizuálně porovnat: layout, hero sekce, nav, obsah
4. Hlásit konkrétní rozdíly a jejich příčiny

```js
// Vzorový kód pro srovnání
const origUrl = 'https://puvodni-web.cz';
const ourUrl  = 'https://venom-saas.vercel.app/demo/SLUG';

// Desktop (1440×900) → /tmp/orig-desktop.png + /tmp/our-desktop.png
// Mobil  (390×844)   → /tmp/orig-mobile.png  + /tmp/our-mobile.png
// Oboje přečíst přes Read tool a popsat rozdíly uživateli
```

**Klíčové co kontrolovat:**
- Hero sekce viditelná na mobilu i desktopu (výška > 0)
- Nav linky fungují (žádné 404)
- Obrázky se zobrazují (ne broken img)
- Obsah v jazyce/stylu odpovídá originálu
- Žádné reference na původní firmu v textu

### Časté mobilní problémy

**1. Hero height: 0px na mobilu** — MODX JS nastavoval výšku sekcí dynamicky.
Bez JS mají sekce `height:0`. Fix — CSS override v DB:

```css
@media (max-width: 768px) {
  .xn25c.x9j34 { display: none !important; }
  .xn25c.xroiu { display: block !important; min-height: 100svh !important;
                 position: relative !important;
                 background-position: center center !important; }
  /* Gradient overlay pro čitelnost textu */
  .xn25c.xroiu::after { content:''; position:absolute; inset:0;
    background: linear-gradient(to bottom, rgba(0,0,0,.2) 50%, rgba(0,0,0,.65) 100%);
    pointer-events: none; }
  /* H1 text přes hero — siblings v DOM, použij negativní margin */
  .x7kao { margin-top: -220px !important; position: relative !important;
           z-index: 5 !important; text-align: center !important; }
}
```

**2. Hamburger menu nefunguje** — MODX JS toggle nefunguje bez plné init sekvence.
`position:fixed` na nav uvnitř headeru se chová jako `position:absolute` (header má transform/filter → stacking context).

**KRITICKÉ: Správný selektor hamburgeru je `.xzkio` (ne `.xfq2n`!)**
- `.xzkio` = viditelný hamburger `<a class="xzkio"><b/><b/><b/></a>` (30×24px, top:49, right:375)
- `.xfq2n` = close button uvnitř skrytého nav draweru — width:0, height:0, neviditelný!
- Záměna těchto dvou je nejčastější chyba — JS běží ale nic neudělá

Fix — kompletně přebudovat mobile nav jako `<body>`-level element přes JS:

```js
var burger = document.querySelector('.xzkio'); // ← HAMBURGER (ne .xfq2n!)
if(!burger) return;
// Dynamicky vytvořit drawer a appendovat k body (escape stacking context)
var drawer = document.createElement('div');
drawer.style.cssText = 'position:fixed;top:0;right:0;width:80vw;...'
document.body.appendChild(drawer);
// Naplnit linky z existujícího .xfkzq .xfzxs li a
// Tlačítko ✕ pro zavření, overlay pro klik mimo
```

**3. Hero H1 text pod hero image** — MODX ukládá H1 jako sourozence hero sekce,
ne jako potomka. Bez JS absolutního positioningu H1 zůstane pod hrdinou.
Fix: `margin-top: -220px !important` na `.x7kao`

**4. Prázdná sekce Recenze** — MODX načítal recenze dynamicky přes plugin.
Statický scraping zachytí jen prázdný `<div class="xnoag">`.
Fix: Přidat 3 fake recenze přímo do HTML (inline styled cards).

**5. Footer iframe přetéká na mobilu** — Google Maps `width="600"` na 390px viewportu.
Fix: `footer iframe { width: 100% !important; height: 220px !important; }`

Pozor: CSS třídy (`x9j34`, `xroiu`, `x7kao`) jsou specifické pro
barber-barbershopurban šablonu. U jiných šablon detekovat přes Playwright evaluate.

------------------------------------------------------------------------

## ČASTÉ CHYBY PŘI SCRAPING ŠABLON — prevence

### 1. Fixed-position scroll container (KRITICKÉ)

MODX a podobné CMS používají smooth-scroll container který je
`position: fixed; z-index: 1000; background: black` a překrývá vše.

**Symptom**: Header viditelný, pod ním černá obrazovka.

**Oprava** — přidat do CSS override pro každou stránku v DB:

```css
#vda40, .xdbjw {
  position: static !important;
  transform: none !important;
  will-change: auto !important;
}
```

**Jak detekovat**: Playwright evaluate → hledat element s
`position: fixed`, `z-index > 100`, `background: black`, `width > 500px`.

### 2. Duplicitní script tagy (KRITICKÉ)

MODX ukládá `<script src="ai8d-1.js">` i `<script src="common.js">` přímo
do HTML. Zároveň jsou tyto skripty v `jsUrls`. Skripty uvnitř
`dangerouslySetInnerHTML` se nespustí (bezpečnostní feature browseru),
ale způsobují zmatek.

**Oprava** — před uložením do DB odstranit všechny `<script>` tagy z HTML
které jsou duplikáty jsUrls:

```js
html = html.replace(/<script[^>]*(?:ai8d-1|common\.js|jquery)[^>]*>[\s\S]*?<\/script>/gi, '');
```

jQuery musí být **první** v jsUrls — pak ai8d-1.js, pak common.js.

### 3. Loading spinner (preloader)

MODX stránky mají `<div class="xm1zu xrogr">` s 12 sk-circle divy.
Bez JS se spinner neskryje a blokuje obsah.

**Oprava** — CSS override:
```css
.xm1zu, .xrogr { display: none !important; }
```

A odstranit spinner div z HTML (depth-tracking DOM parser).

### 4. Nav dead links

Scrapované stránky mají linky na: blog, kontakty (jako samostatné stránky),
jazykový přepínač s broken flag images.

**Postup cleanup**:
- Odstranit `<li>` obsahující text "Blog" z nav
- Opravit `href="cz/#footer"` → `href="#footer"` pro KONTAKTY
- Odstranit jazykový switcher: `<ul class="...lang...">` i všechny
  `<img>` s `/cz/`, `/uk/`, `/en/`, `/ru/` v src

### 5. Non-render-blocking CSS — NEDĚLAT

Technika `media="print" onLoad="this.media='all'"` způsobuje FOUC
(flash of unstyled content) na SSR stránkách. **Nepoužívat.**

Používat `<link rel="stylesheet" precedence="default">` — React 19
to hoistuje do `<head>` správně.

### 6. outputFileTracingRoot — Vercel deploy

Pro lokální vývoj v mono-repo: `outputFileTracingRoot: process.cwd()`
(zabrání Next.js detekci špatného workspace root kvůli více lockfiles).

Pro Vercel: podmíněně:
```ts
...(process.env.VERCEL ? {} : { outputFileTracingRoot: process.cwd() })
```

### 7. Chybějící SVG assets

Scrapované stránky odkazují na lokální SVG ikonky (plus.svg, minus.svg
pro FAQ accordion atd.). Tyto soubory nejsou v scrapu.

**Postup**: Vygenerovat jednoduché SVG manuálně a uložit do
`public/clones/<clone-name>/theme/img/`.

------------------------------------------------------------------------

## PERSONALIZACE ŠABLONY — checklist

Každá šablona musí před publikací projít:

- [ ] Název firmy nahrazen ve všech 7+ stránkách (regex přes DB)
- [ ] Adresa, telefon, email aktualizovány
- [ ] Otevírací doba opravena
- [ ] Copyright rok + název firmy
- [ ] FAQ texty přepsány pro novou firmu
- [ ] Logo vygenerováno jako SVG (nesmí odkazovat na original)
- [ ] Všechny obrázky z AI (gpt-image-1) — hero, gallery, promo
- [ ] `tenant.email` → `info@demo.local` (nesmí unikat original domain)
- [ ] `pages.title` aktualizován pro homepage
- [ ] Footer credit (design studio) odstraněn
- [ ] `robots.txt`: disallow `/demo/`, `/api/`

------------------------------------------------------------------------

## AI GENEROVÁNÍ OBRÁZKŮ (gpt-image-1)

- Podporované velikosti: `1024x1024`, `1024x1536`, `1536x1024`, `auto`
- **NE** `1792x1024` nebo `1024x1792` — ty jsou jen pro starší modely
- Odpověď je v `response.data[0].b64_json` (base64 PNG/JPEG)
- Po vygenerování vždy komprimovat přes `sharp` (mozjpeg, quality 75-82)
- Hero: max 300KB, gallery: max 200KB, thumbs: max 80KB
- OpenAI package: použít z `/Users/apple/DEV/CRM/convee-app/node_modules/openai/index.js`

------------------------------------------------------------------------

## VERCEL DEPLOY — postup

```bash
# 1. Build test
NODE_ENV=production npx next build

# 2. Fix vercel.json cron (hobby = max 1x/den)
# schedule: "0 8 * * *" (ne "* * * * *")

# 3. Deploy preview
vercel deploy --yes --env DATABASE_URL="..." --env JWT_SECRET="..."

# 4. Production
vercel deploy --prod --yes

# 5. Ověřit live URL
curl -s -o /dev/null -w "%{http_code}" https://venom-saas.vercel.app/demo/fade-room-demo
```

------------------------------------------------------------------------

## SCREENSHOT TESTOVÁNÍ — povinný postup

```js
// Vzorový kód pro každou šablonu
const { chromium } = require('/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox']
});
const page = await browser.newPage();

// Desktop test
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/test-desktop.png', fullPage: false });

// Mobile test
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.screenshot({ path: '/tmp/test-mobile.png', fullPage: false });
```

**Každý screenshot musí AI přečíst** přes Read tool a vizuálně ověřit.
Nestačí jen "curl 200" nebo "žádné JS chyby" — musí být viditelný obsah.

------------------------------------------------------------------------

## MOBILNÍ CSS OVERRIDE — KOMPLETNÍ ŠABLONA PRO MODX KLONY

Toto je finální, odzkoušený CSS override pro MODX barbershop klony.
Kopírovat jako základ pro každou novou šablonu a upravit CSS třídy.

```css
body{overflow:auto!important;visibility:visible!important}
.xm1zu,.xrogr{display:none!important}
#vda40,.xdbjw{position:static!important;transform:none!important;will-change:auto!important}

@media(min-width:769px){
  .xn25c.xroiu{display:none!important}
  .xn25c.x9j34{display:flex!important;min-height:100vh}
}

@media(max-width:768px){
  /* === MOBILE HERO === */
  .xn25c.x9j34{display:none!important}
  .xn25c.xroiu{
    display:block!important;
    position:relative!important;
    width:100vw!important;
    /* Breakout z padded parenta: */
    margin-left:calc(-1*((100vw - 100%)/2))!important;
    min-height:100svh!important;
    background-position:center center!important;
    background-size:cover!important;
  }
  /* Gradient overlay pro čitelnost textu */
  .xn25c.xroiu::after{
    content:'';position:absolute;inset:0;
    background:linear-gradient(to bottom,rgba(0,0,0,.1) 30%,rgba(0,0,0,.72) 100%);
    pointer-events:none
  }

  /* === HERO H1 TEXT (je DOM sourozenec, ne potomek hero) === */
  .x7kao{
    width:100vw!important;
    margin-left:calc(-1*((100vw - 100%)/2))!important;
    margin-top:-200px!important;  /* negativní = překrytí přes hero */
    margin-bottom:0!important;
    position:relative!important;
    z-index:6!important;
    text-align:center!important;
    padding:0 20px 56px!important;
    box-sizing:border-box!important;
  }
  .x7kao .x4d7g{
    color:#fff!important;
    font-size:clamp(28px,7vw,36px)!important;
    line-height:1.2!important;
    text-shadow:0 2px 16px rgba(0,0,0,.9)!important;
    display:block!important;width:100%!important;
  }

  /* === PROMO KARTY (musí být column, ne row) === */
  .x1q74.xy4cc{flex-direction:column!important;gap:12px!important}
  .x1q74.xy4cc .x0uvo{width:100%!important;max-width:100%!important}
  /* Centrace obličeje v promo thumbnail */
  .x0f33{background-position:center 25%!important}

  /* === LAYOUT OPRAVY === */
  .x7zrs.x1q74{flex-direction:column!important;gap:0!important}

  /* === FOOTER MOBILE === */
  footer iframe{width:100%!important;height:220px!important;display:block!important}
  footer .xbf9f{width:100%!important}
  footer .x96qt .x1q74{flex-direction:column!important;gap:8px!important;text-align:center!important}
  footer .xa4ro.xy204{flex-direction:column!important;gap:8px!important;align-items:center!important}

  /* === iOS TAP FIX === */
  .xfq2n{cursor:pointer!important;-webkit-tap-highlight-color:transparent!important;touch-action:manipulation!important}
}
```

**Poznámky k CSS třídám:**
- `xn25c.x9j34` = desktop hero, `xn25c.xroiu` = mobilní hero (barber-barbershopurban)
- `x7kao` = hero H1 wrapper, `.x4d7g` = H1 text
- `x1q74.xy4cc` = promo kontejner, `.x0uvo` = promo karta
- `x0f33` = promo thumbnail s obličejem
- `xfq2n` = hamburger tlačítko
- U jiné šablony: detekovat přes Playwright `document.querySelector('[class]').className`

------------------------------------------------------------------------

## MOBILNÍ NAV DRAWER — KOMPLETNÍ JS (pro MODX klony)

Hamburger menu nikdy neopravovat přes CSS class toggle — MODX CSS specificity vyhraje.
`position:fixed` uvnitř headeru NEFUNGUJE — header má transform/filter → stacking context.
**Jedinou funkční opravou je appendovat drawer přímo k `document.body`.**

Vložit před `</body>` do HTML každé stránky v DB:

```js
(function(){
  if(window.innerWidth>900)return;
  var burger=document.querySelector('.xfq2n');
  if(!burger)return;

  /* Sbírání odkazů z existujícího nav — filtrovat jen anchor #, ne celé # */
  var links=[];
  document.querySelectorAll('.xfkzq .xfzxs li a').forEach(function(a){
    var t=a.textContent.trim(),h=a.getAttribute('href')||'';
    if(t&&h&&h!=='#')links.push({href:h,text:t});
  });

  /* Drawer — escapuje header stacking context */
  var drawer=document.createElement('div');
  drawer.id='mob-nav-drawer';
  drawer.style.cssText='position:fixed;top:0;right:0;width:82vw;max-width:300px;height:100%;height:100dvh;background:#111;z-index:2147483647;transform:translateX(110%);transition:transform .28s ease;overflow-y:auto;-webkit-overflow-scrolling:touch;box-shadow:-4px 0 24px rgba(0,0,0,.8)';

  /* Zavírací tlačítko */
  var closeBtn=document.createElement('button');
  closeBtn.textContent='✕';
  closeBtn.style.cssText='position:absolute;top:16px;right:16px;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:8px;line-height:1';
  drawer.appendChild(closeBtn);

  /* Logo v draweru */
  var drawerLogo=document.createElement('div');
  drawerLogo.style.cssText='padding:24px 20px 8px;color:#c9a96e;font-size:18px;font-weight:700;letter-spacing:2px;border-bottom:1px solid #333;margin-bottom:12px';
  drawerLogo.textContent='THE FADE ROOM';
  drawer.appendChild(drawerLogo);

  /* Nav linky */
  var ul=document.createElement('ul');
  ul.style.cssText='list-style:none;margin:0;padding:0 0 20px';
  links.forEach(function(l){
    var li=document.createElement('li');
    var a=document.createElement('a');
    a.href=l.href;a.textContent=l.text;
    a.style.cssText='display:block;padding:16px 24px;color:#fff;text-decoration:none;font-size:16px;font-weight:500;letter-spacing:1px;border-bottom:1px solid #222;text-transform:uppercase';
    li.appendChild(a);ul.appendChild(li);
  });
  drawer.appendChild(ul);

  /* Info sekce (telefon, hodiny) */
  var info=document.createElement('div');
  info.style.cssText='padding:20px 24px;border-top:1px solid #333;color:#aaa;font-size:13px;line-height:1.8';
  info.innerHTML='📞 +420 702 456 789<br>Po–Pá: 9:00–20:00<br>So: 9:00–18:00<br>Ne: 10:00–16:00';
  drawer.appendChild(info);

  /* Overlay */
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;height:100dvh;background:rgba(0,0,0,.5);z-index:2147483646;display:none';

  /* Appendovat k BODY (ne k headeru!) */
  document.body.appendChild(ov);
  document.body.appendChild(drawer);

  var isOpen=false;
  function openNav(){isOpen=true;drawer.style.transform='translateX(0)';ov.style.display='block';document.body.style.overflow='hidden'}
  function closeNav(){isOpen=false;drawer.style.transform='translateX(110%)';ov.style.display='none';document.body.style.overflow=''}

  /* iOS fix: touchend + click, oboje */
  function addTap(el,fn){
    el.addEventListener('touchend',function(e){e.preventDefault();fn();},{passive:false});
    el.addEventListener('click',function(e){e.preventDefault();fn();});
  }
  addTap(burger,function(){isOpen?closeNav():openNav()});
  addTap(closeBtn,closeNav);
  addTap(ov,closeNav);

  /* Nav linky zavírají drawer */
  ul.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){closeNav();});
  });
})();
```

**Klíčové poznatky:**
- `height:100dvh` místo `100vh` — iOS Safari má jiný viewport kvůli adresnímu řádku
- `z-index:2147483647` (MAX_INT) — musí překrýt vše co MODX nastavil
- `touchend` + `e.preventDefault()` — iOS `click` event unreliable na non-interactive elements
- Filtr `h !== '#'` zachová `#footer` a jiné hash linky, filtruje jen prázdný `#`
- Název firmy v draweru a telefonní číslo přizpůsobit každé šabloně

------------------------------------------------------------------------

## FOOTER — ČASTÉ PROBLÉMY NA MOBILU

### 1. Zvláštní znaky v copyright

MODX HTML entita `&mdash;` se při scraping ukládá jako raw HTML.
V DB pak zobrazuje `—` nebo `â€"` podle encoding.

**Fix**: Nahradit v DB html: `&mdash;` → `–` (em dash) nebo `–`

```js
html = html.replace(/&mdash;/g, '–');
html = html.replace(/â€"/g, '–');  // utf-8 encoding artifact
```

### 2. Footer příliš prázdný na mobilu

MODX footer má Google Maps iframe s pevnou šířkou (`width="600"`).
Na mobilu iframe přetéká nebo se scvrkne.

**Fix** (CSS override):
```css
footer iframe {
  width: 100% !important;
  height: 220px !important;
  display: block !important;
}
```

### 3. Footer sloupce na mobilu vedle sebe

Kontaktní informace + mapa v `flex-direction:row` → nestojí pod sebou.

**Fix** (CSS override):
```css
footer .x96qt .x1q74 { flex-direction:column!important; gap:8px!important; }
footer .xa4ro.xy204 { flex-direction:column!important; align-items:center!important; }
```

------------------------------------------------------------------------

## BREAKOUT TECHNIKA — full-width element uvnitř padded containeru

Problém: parent container má `padding: 0 16px`, proto child element je 360px místo 390px.
Hero musí být fullscreen (celá šířka), ale je uvnitř padded containeru.

**Řešení: negativní margin + 100vw šířka:**

```css
.element {
  width: 100vw !important;
  margin-left: calc(-1 * ((100vw - 100%) / 2)) !important;
}
```

`(100vw - 100%) / 2` = polovina "chybějícího" prostoru = padding na straně.
Negativní margin posune element doleva o přesně tolik, aby začínal na kraji viewportu.

Použití: mobile hero, promo sekce, jakýkoliv full-bleed element v padded layoutu.

------------------------------------------------------------------------

## DETEKCE CSS TŘÍD PŘI NOVÉ ŠABLONĚ

Při nové šabloně nikdy nehádat CSS třídy. Detekovat přes Playwright:

```js
// Najít hero sekce
const heroes = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('section, div'))
    .filter(el => {
      const s = window.getComputedStyle(el);
      return (el.offsetHeight > 200 && s.backgroundImage !== 'none');
    })
    .map(el => ({
      class: el.className,
      height: el.offsetHeight,
      bg: window.getComputedStyle(el).backgroundImage.substring(0, 60)
    }));
});

// Najít scroll container (MODX trap)
const fixedEls = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const s = window.getComputedStyle(el);
      return s.position === 'fixed' && parseInt(s.zIndex) > 100
        && el.offsetWidth > 500 && s.backgroundColor === 'rgb(0, 0, 0)';
    })
    .map(el => ({ id: el.id, class: el.className }));
});

// Najít hamburger button
const burger = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button, div, span'))
    .filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.top < 100 && rect.right > window.innerWidth - 60
        && rect.width < 60 && rect.height < 60;
    });
  return btns.map(el => ({ tag: el.tagName, class: el.className }));
});
```

------------------------------------------------------------------------

## PRAVIDLA DOKONČENÍ — AI NESMÍ PŘESKOČIT

AI má tendenci dělat jen část zadání. Platí absolutně:

1. **Celé zadání nebo nic** — každý bod ze zadání musí být splněn
2. **Screenshot = důkaz** — ne jen tvrzení
3. **Přečíst docs/pravidla.md** před každou novou šablonou
4. **Deploy = produkce** — ne jen preview
5. **Po deployi** ověřit live URL přes screenshot
6. Pokud session přerušena → pokračovat od posledního checkpointu,
   nikoliv začínat znovu nebo přeskakovat zbytek
