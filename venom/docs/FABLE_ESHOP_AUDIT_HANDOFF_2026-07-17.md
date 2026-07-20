# Fable handoff: kompletní oprava e-shopů a Studia

Datum auditu: 2026-07-17  
Projekt: `/Users/apple/DEV/CRM/venom`  
Rozsah: e-shop šablony `eshop-01` až `eshop-19`, commerce administrace, Studio, megamenu, kategorie, produktové a bannerové slidery, storefront.

## Jednoduchý prompt pro Fable

Zkopíruj Fable tento prompt:

```text
Pracuj autonomně v projektu /Users/apple/DEV/CRM/venom.

Nejprve si celý přečti:
docs/FABLE_ESHOP_AUDIT_HANDOFF_2026-07-17.md

Potom sám navrhni postup a kompletně implementuj všechny opravy popsané v auditu. Nezůstávej u analýzy ani návrhu. Cílem je, aby uživatel mohl pro každý e-shop zvlášť v administraci a Studiu plně spravovat produkty, kategorie a libovolně hluboké podkategorie, megamenu, produktové slidery, bannerové slidery a všechny jejich vnořené položky; vše přidávat, editovat, skrývat, mazat a přesouvat.

Oprav také integritu stromu kategorií, propojení megamenu s commerce kategoriemi, storefront šablon 18 a 19, chybějící registrace variant a testovací pokrytí. Zachovej vizuální identitu každé šablony.

Průběžně kontroluj současné změny v pracovním stromu a nic cizího nerevertuj. Implementuj bezpečné migrace, testy a runtime QA. Pokračuj, dokud nesplníš všechna akceptační kritéria v dokumentu. Na konci spusť typecheck, testy, build, validátory všech 19 šablon a browser QA na desktopu i mobilu. Nedeployuj bez výslovného pokynu.
```

## Manažerský závěr auditu

E-shopy se aktuálně vykreslují a commerce administrace má široké funkční pokrytí, ale tvrzení „uživatel může ovládat úplně vše pro každou šablonu“ zatím není pravdivé.

Největší mezery:

1. Megamenu používá oddělená statická data a není synchronizované s kategoriemi z commerce administrace.
2. Studio umí editovat jen jedno pole typu array a neumí obecně vnořené objekty a arrays.
3. Produktové slidery nejdou ručně kurátorovat ani řadit.
4. Kategorie mohou přes API vytvořit cyklus a mazání rodiče se chová jinak, než tvrdí dialog.
5. Storefront šablon 18 a 19 nepoužívá vlastní šablonový header/footer a nemá vlastní listing/detail.
6. Většina e-shop šablon neprochází vlastním template validátorem.
7. Automatické testy nepokrývají commerce ani Studio.

## Co bylo reálně ověřeno

Read-only HTTP průchod byl proveden sekvenčně pro všech 19 tenantů:

- 19/19 homepage: HTTP 200,
- 19/19 `/obchod`: HTTP 200,
- 19/19 `/admin/obchod`: HTTP 200 s commerce shellem,
- 19/19 Studio: HTTP 200,
- 19/19 categories API: HTTP 200,
- 19/19 products API: HTTP 200.

Databázový stav:

- 19 commerce tenantů,
- 19 shop záznamů,
- 792 produktů,
- 809 kategorií,
- 605 kategorií s rodičem,
- všechny současné demo stromy mají maximální hloubku pouze 1.

Kontroly:

- `npm run typecheck`: PASS,
- `npm test -- --run`: PASS, ale pouze 12 testů ve 2 souborech,
- testy pokrývají jen safe-path a sanitize-content; nepokrývají commerce ani Studio.

Interaktivní in-app browser nebyl při původním auditu dostupný. HTTP smoke testy a zdrojový audit proto nejsou náhradou za závěrečný browser CRUD průchod.

## Funkční matice

| Oblast | Stav | Poznámka |
|---|---|---|
| Produkty | Převážně funkční | CRUD, varianty, SKU/EAN, ceny, sklad, obrázky, parametry, flags, SEO |
| Kategorie | Částečně funkční | CRUD, viditelnost a drag/drop fungují, ale jsou integritní chyby |
| Struktura sekcí ve Studiu | Funkční | Přidat, skrýt, přesunout, duplikovat, smazat |
| Megamenu | Nedostatečné | Oddělené od commerce kategorií, nested obsah nelze kompletně editovat |
| Bannerové slidery | Částečné | Typicky lze editovat jen první top-level array |
| Produktové slidery | Částečné | Pravidla ano, ruční výběr/pořadí/pinning ne |
| Doprava a platby | Částečné | Pevné metody lze editovat, ale ne přidat/smazat/přesunout |
| Storefront 02–17 | Základ funguje | Šablonový chrome existuje; individuální listing/detail není u všech |
| Storefront 18–19 | Nedokončený | `/obchod` používá generický chrome a generický listing/detail |
| Template validace | Nedostatečné | Pouze eshop-15 a eshop-16 plně procházejí |
| Automatické testy | Kriticky nedostatečné | Žádné commerce/Studio integrační ani E2E testy |

## P0: univerzální editace megamenu a vnořeného obsahu

### Současný problém

`src/components/studio/inspector/ContentInspectorTab.tsx`:

- vybere pouze první vhodné pole typu array,
- zobrazí pouze scalar hodnoty na top levelu,
- z položek array explicitně vynechá hodnoty typu object,
- neumí více arrays v jedné sekci,
- neumí libovolně vnořené objekty/arrays,
- nemá e-shop variant-specific schema.

Příklady struktur, které musí být plně editovatelné:

- `categories[].children`,
- `categories[].children[].subchildren`,
- `categories[].children[].items`,
- `mainNav[].mega.tiles`,
- `mainNav[].mega.aside.links`,
- `catalog.groups[].links`,
- `catalog.aside.links`,
- `categories[].links`,
- `megaAside.links`.

Konkrétní šablony:

- eshop-03/04: `categories[].children`,
- eshop-05: `categories[].children[].subchildren`, brands a doporučení,
- eshop-15: `categories[].children[].items`,
- eshop-17: `mainNav[].mega.tiles` a `mega.aside.links`,
- eshop-18: `catalog.groups[].links`,
- eshop-19: `categories[].links`.

### Požadované řešení

Nahradit „první nalezenou array“ schema-driven editorem obsahu.

Editor musí umět:

- více polí typu array v jedné sekci,
- libovolnou rekurzivní hloubku,
- string, number, boolean, URL, image, select, color, object a array,
- přidat, editovat, duplikovat, mazat a drag/drop přesouvat položky,
- podmíněná pole podle varianty,
- přehledný breadcrumb/path upravovaného prvku,
- bezpečné prázdné hodnoty a vytváření první položky,
- zachovat v2 sparse overrides a reset na šablonu,
- fungovat na desktopu i mobilu.

Preferované řešení:

- zavést registr content schemas podle `section_variant`,
- mít bezpečný generický recursive fallback,
- nepřidávat ruční jednorázové podmínky přímo do každé vizuální komponenty.

### Akceptace

- Uživatel ve Studiu vytvoří třetí úroveň megamenu bez ruční editace JSON.
- Upraví label, URL, obrázek, promo kartu a pořadí každého uzlu.
- U sekce s `slides` i `bottomBanners` upraví obě pole.
- U prázdné array může vytvořit první položku.
- Editace se po reloadu zachová a projeví se na veřejné homepage i v `/obchod`.

## P0: sjednocení megamenu s commerce kategoriemi

### Současný problém

Commerce kategorie jsou v `product_categories`, zatímco megamenu je uloženo v `sections.settings/content_overrides`.

Změna názvu, slugu, viditelnosti nebo pořadí kategorie v commerce administraci proto automaticky nezmění megamenu.

`src/lib/commerce/section-data.ts` hydratuje pouze:

- `product-grid`,
- `featured-products`,
- `category-grid`.

Navbar se z commerce stromu nehydratuje.

### Požadované řešení

Zavést pro navbar/mega menu jasný model zdroje:

- `source: "commerce-categories"` jako bezpečný výchozí režim,
- volitelně `source: "custom"` pro marketingové menu nezávislé na katalogu,
- hybridní režim pro vlastní promo bloky vedle dynamického category tree.

Každá šablona si zachová vlastní renderer, ale strom kategorií bude jednotný.

Podporovat:

- libovolnou hloubku kategorií,
- viditelnost,
- řazení,
- vlastní menu label nezávislý na SEO názvu, pokud je potřeba,
- obrázek/ikonu,
- promo/aside obsah,
- volbu, zda uzel zobrazuje děti,
- preview výsledku v administraci.

### Akceptace

- Přejmenování nebo přesunutí kategorie v administraci se projeví v megamenu.
- Skrytá kategorie se nezobrazí ve storefront navigaci.
- Třetí úroveň se správně vykreslí a je přístupná klávesnicí i na mobilu.
- Promo obsah šablony zůstane editovatelný a není přepsán synchronizací.

## P0/P1: integrita stromu kategorií

Relevantní soubory:

- `src/lib/commerce/categories.ts`,
- `src/lib/commerce/schema.ts`,
- `src/components/admin/commerce/CategoriesTab.tsx`,
- `src/app/api/demo/[tenantSlug]/commerce/categories/reorder/route.ts`.

### Nálezy

1. UI říká „smazat včetně všech podkategorií“, ale FK má `ON DELETE SET NULL`.
2. PATCH kontroluje pouze přímý self-loop, ne descendant cycle.
3. Reorder API také kontroluje pouze `parent_id === id`.
4. Reorder není v transakci.
5. Reorder neověřuje, že každý ID skutečně patří tenantovi.
6. Aktuální demo data testují pouze jednu úroveň.
7. Filtrování produktů kategorií používá jen přesný `category_id`; rodič automaticky nezahrnuje produkty potomků.

### Požadované řešení

- zvolit a jasně implementovat delete strategii:
  - cascade subtree, nebo
  - zákaz smazání rodiče, nebo
  - explicitní volba „přesunout děti do kořene“,
- descendant-cycle validation přes recursive CTE nebo načtený tenant tree,
- celý reorder v jedné DB transakci,
- validace všech tenant IDs a parent IDs,
- unikátní a stabilní pořadí sourozenců,
- parent category listing musí volitelně zahrnout descendant produkty,
- testovat alespoň 4 úrovně stromu.

### Akceptace

- Nelze vytvořit cyklus přes UI ani přímý API request.
- Neplatný reorder nezanechá částečně zapsaný strom.
- Dialog mazání přesně odpovídá výsledku.
- Parent category umí zobrazit produkty všech potomků.
- Cross-tenant ID je odmítnuto.

## P1: produktové slidery a kolekce

### Současný problém

Produktové sekce umějí hlavně:

- `categorySlug`,
- `source`,
- `limit`,
- newest/featured pravidlo.

Neumějí:

- ručně vybrat konkrétní produkty,
- produkt připnout,
- ručně změnit pořadí,
- kombinovat chytrá pravidla a ruční obsah,
- preview výsledku před uložením.

Výchozí pořadí je převážně `updated_at DESC`.

### Požadované řešení

Zavést reusable collection/rail konfiguraci:

- `mode: manual | smart | hybrid`,
- manuální `productIds`,
- smart pravidla pro category tree, tags/flags, brand, price, stock a date,
- pin/exclude,
- explicitní sort a drag/drop,
- limit,
- fallback,
- preview.

Konfigurace musí být použitelná všemi `featured-products` a `product-grid` variantami.

### Akceptace

- Uživatel vytvoří slider z pěti přesně zvolených produktů a seřadí je.
- Může produkt připnout před smart výsledky.
- Může použít rodičovskou kategorii včetně descendants.
- Skrytý/archivovaný produkt se bezpečně vyřadí.

## P1: bannerové a obecné slidery

Příklady více datových struktur v jedné sekci:

- eshop-04: `slides` + `bottomBanners`,
- eshop-06: `promos` + `slides`,
- eshop-11: `slides` + `tips.items`,
- eshop-16: `slides` + `side.deals`,
- eshop-18: `slides` + `quickLinks`,
- další sekce obsahují nested flyer/channel/aside objekty.

### Akceptace

- Každý slider umožňuje slide přidat, editovat, skrýt, duplikovat, smazat a přesunout.
- Lze upravit obrázek uploadem, alt, title, text, CTA label, CTA URL, barvy a časování, pokud je varianta používá.
- Lze vypnout autoplay a upravit interval.
- Editor neukazuje interní `__commerce` payload.
- Invalidní slide nemůže shodit renderer.

## P1: storefront parity všech šablon

`src/components/storefront/TemplateShopChrome.tsx` aktuálně zahrnuje eshop-02 až eshop-17.

Nálezy:

- eshop-01 je záměrně generický,
- eshop-17 má vlastní listing, ale ne vlastní detail,
- eshop-18 a eshop-19 používají v `/obchod` generický header/footer,
- eshop-18 a eshop-19 nemají vlastní listing/detail,
- eshop-18 homepage nemá footer.

Požadavek:

- přidat 18/19 do template chrome,
- dokončit footer eshop-18,
- rozhodnout a implementovat template-aware listing/detail/cart/checkout pro 17–19,
- zachovat jednotnou commerce logiku, nevytvářet kopie business logiky pro každou šablonu,
- vizuální komponenty mohou být variant-specific.

### Akceptace

- Homepage, listing, detail, cart a checkout působí jako jeden design u každé šablony.
- Navbar/footer upravený ve Studiu se projeví i v obchodu.
- Mobilní menu, mega menu a košík jsou funkční.
- Neexistuje náhodný přechod do generického skinu.

## P1: registr variant a template validace

Aktuální výsledek `node scripts/validate-template.mjs eshop-XX`:

| Šablona | Chyby | Warningy |
|---|---:|---:|
| eshop-01 | 13 | 2 |
| eshop-02 | 25 | 20 |
| eshop-03 | 23 | 18 |
| eshop-04 | 23 | 19 |
| eshop-05 | 28 | 33 |
| eshop-06 | 46 | 88 |
| eshop-07 | 31 | 35 |
| eshop-08 | 35 | 70 |
| eshop-09 | 25 | 45 |
| eshop-10 | 35 | 61 |
| eshop-11 | 30 | 81 |
| eshop-12 | 36 | 34 |
| eshop-13 | 45 | 72 |
| eshop-14 | 32 | 60 |
| eshop-15 | 0 | 3 |
| eshop-16 | 0 | 6 |
| eshop-17 | 9 | 17 |
| eshop-18 | 1 | 6 |
| eshop-19 | 1 | 6 |

Poznámka: během auditu byly souběžně doplněny komponenty a registrace eshop-19; starší výsledek 10 chyb už neplatí. Před implementací je nutné baseline znovu spustit, protože pracovní strom se aktivně mění.

Typické chyby 01–14 a 17:

- varianta existující seeded sekce není v `SECTION_VARIANTS`,
- Studio ji proto neumí nově přidat nebo na ni přepnout.

Chyby 18/19:

- nesoulad se skeletonem a chybějící/nevysvětlené sekce.

### Akceptace

- Všech 19 příkazů končí exit code 0.
- Každou variantu lze ve Studiu přidat a přepnout.
- Manifest přesně popisuje úmyslně vynechané a extra sekce.
- Warningy nejsou slepě potlačeny; opraví se schema nebo data.

## P1: doprava, platby a tenant konfigurace

Současné UI dovoluje u pevných metod:

- zapnout/vypnout,
- přejmenovat,
- upravit popis,
- upravit cenu/poplatek,
- upravit hranici dopravy zdarma.

Nedovoluje:

- přidat novou metodu,
- smazat metodu,
- změnit pořadí,
- tenant-specific konfiguraci poskytovatele.

GoPay se zobrazí podle serverového env. PayPal a splátky používají demo gateway.

Požadavek:

- CRUD a reorder shipping/payment methods,
- provider connection model oddělený od veřejných metod,
- bezpečné šifrované credentials nebo external secret references,
- jasný test/live režim,
- validace callback/webhook URL,
- žádný secret v repozitáři.

## P2: automatické testy a QA

Povinně doplnit:

### Unit/integration

- category cycle detection,
- category delete strategie,
- atomic reorder,
- cross-tenant ochrana,
- descendant category product listing,
- schema-driven nested content editor,
- více arrays v jedné sekci,
- manual/smart/hybrid product rail,
- visibility a ordering,
- v2 overrides/reset.

### API

- products CRUD,
- categories CRUD/reorder,
- sections add/update/delete/reorder,
- settings dopravy/plateb,
- checkout validation,
- auth a same-origin ochrana.

### Browser E2E

Minimálně reprezentanti:

- eshop-01: generický storefront,
- eshop-05: tříúrovňové megamenu,
- eshop-15: hluboké `children[].items`,
- eshop-17: nested mega objects,
- eshop-18: catalog groups,
- eshop-19: category links a nový renderer.

Scénáře:

1. vytvořit/přejmenovat/přesunout/skrýt kategorii,
2. vytvořit třetí úroveň,
3. ověřit megamenu homepage i `/obchod`,
4. přidat, editovat, přesunout a smazat slide,
5. ručně sestavit produktový slider,
6. skrýt/přesunout/duplikovat sekci,
7. reload a kontrola persistence,
8. desktop + mobil,
9. listing, detail, cart, checkout smoke.

## Technická pravidla pro implementaci

- Nevracet ani nepřepisovat cizí změny v dirty worktree.
- Před úpravou souboru zkontrolovat jeho diff a timestamp.
- Zachovat Next.js 16.2, React 19 a existující multi-tenant architekturu.
- Commerce data neukládat do statických section arrays.
- Prezentační data šablony a tenant commerce data jasně oddělit.
- Business logiku neskopírovat 19×.
- Variant-specific komponenty používat jen pro vzhled.
- Všechny zápisy tenant-scoped.
- Změny DB provádět idempotentně a bezpečně.
- Žádné produkční secrets.
- Žádný deploy bez výslovného pokynu.

## Definition of Done

Práce není hotová, dokud:

- uživatel plně spravuje libovolně hluboké kategorie,
- megamenu může čerpat z commerce kategorií a podporuje custom promo obsah,
- všechny nested menu položky jsou editovatelné,
- všechny bannerové struktury jsou editovatelné,
- produktové slidery podporují manuální i smart režim,
- všechny sekce lze přidat, skrýt, přesunout, duplikovat a smazat,
- storefront každé šablony drží svůj design,
- všech 19 template validátorů projde,
- `npm run typecheck` projde,
- `npm test -- --run` projde včetně nových commerce testů,
- `npm run build` projde,
- browser E2E projde pro reprezentativní šablony,
- není zaveden cross-tenant únik ani category cycle,
- dokumentace odpovídá skutečnému chování.

## Doporučené pořadí práce pro Fable

1. Znovu vytvořit baseline na aktuálním dirty worktree.
2. Navrhnout content schema registry a recursive editor.
3. Opravit category integrity a doplnit testy.
4. Zavést dynamický/hybridní mega menu source.
5. Zavést produktové collections/rails.
6. Doplnit bannerové slidery.
7. Dokončit storefront 17–19 a footer 18.
8. Opravit registry/manifesty všech šablon.
9. Doplnit integrační a E2E testy.
10. Spustit plný QA matrix a opravit všechny regrese.

Fable může pořadí změnit, pokud najde bezpečnější architektonickou závislost, ale musí dokončit celý rozsah a splnit Definition of Done.
