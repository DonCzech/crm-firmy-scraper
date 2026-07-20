# Kompletní audit Venom / webero.co

Datum: 2026-07-13  
Rozsah: zdrojový kód, konfigurace, build, TypeScript, ESLint, API, autentizace, tenant izolace, XSS/CSRF, databázová vrstva, provoz, SEO, výkon, udržovatelnost a veřejně dostupné HTTP výstupy webero.co.  
Režim: read-only; existující pracovní změny nebyly upravovány.

## Executive summary

Stav nelze považovat za production-safe. Produkční build sice projde, ale explicitně přeskakuje typovou validaci. Nezávislý `tsc --noEmit` selhává. ESLint selhává s 57 725 nálezy, protože analyzuje také stovky megabajtů cizího JavaScriptu v `public/clones`; současně ale nachází závažné chyby i ve vlastním kódu. Nejvyšší bezpečnostní riziko představují neautentizované Template Lab endpointy, z nichž některé mění databázi. Administrativní layout ani proxy nevynucují platnou session. Veřejný `robots.txt` navíc odkazuje na localhost.

Souhrn priorit:

- P0 / kritické: 4
- P1 / vysoké: 10
- P2 / střední: 12
- P3 / nízké nebo technický dluh: 8

## Stav nápravy — 2026-07-13

Po auditu byla provedena první kompletní nápravná vlna:

- Template Lab API je uzavřeno jednotným platform-admin guardem; mutace navíc ověřují origin.
- Celý `/admin/**` strom má serverovou session bránu s výjimkou login/setup.
- Byl odstraněn fallback JWT secret, doplněn issuer/audience/algoritmus a produkční minimální délka.
- Auth cookies používají centralizovanou serializaci a v produkci atribut `Secure`.
- Login, registrace, setup, newsletter a order-status dostaly rate limit; tenant contact/login již limiter měly.
- TypeScript chyby byly opraveny a `ignoreBuildErrors` odstraněn. `tsc --noEmit` i produkční build procházejí.
- ESLint už neanalyzuje `public`, klony, backupy a tmp. Má 0 errors; 1 581 legacy warnings zůstává viditelných jako splátkový backlog.
- Přidán allowlist HTML sanitizer a aplikován na sekce a blog před zápisem.
- Přidána canonical path/key validace proti traversal útokům.
- `robots.txt` fallback byl opraven na `https://webero.co`; sitemap již negeneruje falešný aktuální `lastModified` pro každou statickou URL.
- Z CSP bylo odstraněno `unsafe-eval`, byl vypnut `X-Powered-By`.
- Přidány testy sanitizace/path bezpečnosti, secret scanner, jednotný `npm run check` a GitHub Actions workflow.
- Nebezpečné inline HTML/JS v language suggestion modalu bylo nahrazeno React event handlery.

### Nově objevený P0: uniklé produkční databázové heslo

Během nápravy bylo ve více než 60 skriptech a jednom dokumentu nalezeno stejné plné Neon PostgreSQL URL včetně hesla. Všechny pracovní kopie byly mechanicky nahrazeny `process.env.DATABASE_URL` a nový secret scanner nyní prochází. Credential je ale nutné **okamžitě rotovat v Neonu** a odstranit i z historie Git repozitáře; lokální redakce již uniklé heslo nezneplatní.

### Ověření po nápravě

- Secret scan: PASS.
- ESLint: PASS, 0 errors / 1 581 warnings.
- TypeScript: PASS.
- Vitest: PASS, 2 files / 12 tests.
- Produkční build s TypeScript validací: PASS, 98 stránek.
- Lokální production smoke: `/admin` bez session → 307 na `/admin/login`; Template Lab GET/POST bez session → 401; robots Host/Sitemap → `https://webero.co`.

## P0 — kritické

### P0-1: Neautentizované mutační Template Lab API

`POST /api/template-lab/approve` provádí approve/reject a zapisuje do DB bez kontroly administrátora, session i originu. Totéž platí minimálně pro `/api/template-lab/import`; další routy ve stejné skupině je nutné uzavřít default-deny politikou.

Důkaz:

- `src/app/api/template-lab/approve/route.ts:5-52` — přímý parse body a DB UPDATE/INSERT, bez auth guardu.
- `src/app/api/template-lab/import/route.ts:9-80` — importuje filesystem data do DB bez auth guardu.
- `/api/template-lab/jobs`, `/status` a `/catalog` čtou interní workflow/DB data bez auth.

Dopad: anonymní návštěvník může měnit schvalovací stav šablon, spouštět importy a číst interní data. Podle dalších handlerů může být plocha ještě širší.

Oprava: vytvořit jeden server-only `requirePlatformAdmin(request)` guard, který ověřuje JWT, CSRF/origin u mutací a roli. Aplikovat jej na celou větev `/api/template-lab/**`; integrační test musí pro každou routu dokazovat 401/403 bez session.

### P0-2: Administrativní stránky nejsou serverově chráněné

`src/app/admin/layout.tsx` pouze vykresluje navigaci a obsah. `src/proxy.ts:84-90` kontroluje jen přítomnost cookie, a to pouze pro přesměrování z login/setup; přístup na `/admin`, `/admin/users`, `/admin/template-lab` apod. neblokuje. Komentář sám potvrzuje, že platnost JWT se zde neověřuje.

Dopad: interní UI a data načítaná server components mohou být dostupná bez platné session. I pokud některá dílčí API auth mají, ochrana je nekonzistentní a snadno se při nové stránce zapomene.

Oprava: v admin layoutu serverově načíst a ověřit cookie a při neplatné session volat `redirect('/admin/login')`; API musí být chráněno nezávisle. Přidat negativní e2e test všech admin rout.

### P0-3: Build úmyslně ignoruje TypeScript chyby

`next.config.ts:34` obsahuje `typescript: { ignoreBuildErrors: true }`. Build proto vypíše `Skipping validation of types` a skončí 0, ačkoli `npx tsc --noEmit` skončí 2.

Aktuálně potvrzené chyby:

- `ContactSection.tsx:13343` — neexistující namespace `JSX`.
- `HeroSection.tsx:12987` — duplicitní property v object literalu.
- `HeroSection.tsx:19742` — chybí povinné `children`.
- `NavbarSection.tsx:24549` — přístup na neexistující `bg`.
- `NavbarSection.tsx:24549` — přístup na neexistující `color`.

Dopad: CI/deploy dává falešný zelený signál; část variant může spadnout až při konkrétním tenantovi nebo obsahu.

Oprava: nejdřív opravit 5 chyb, pak odstranit `ignoreBuildErrors`; v CI spouštět `tsc --noEmit` samostatně před buildem.

### P0-4: Fallback JWT secret umožňuje padělání admin tokenu při chybné konfiguraci

`src/lib/auth.ts:3` a `src/lib/user-auth.ts` používají známý hardcoded secret, pokud `JWT_SECRET` chybí. Aplikace se tedy při chybné produkční konfiguraci bezpečně nezastaví, ale začne přijímat tokeny podepsané veřejně známou hodnotou.

Oprava: v produkci fail-fast při absenci nebo nedostatečné entropii secretu; oddělit admin/user secrets; doplnit issuer, audience a explicitní algoritmus; rotace klíčů.

## P1 — vysoké

### P1-1: Session cookies nemají `Secure`

Admin, user i tenant cookies jsou sestaveny bez `Secure` (`admin/login`, `account/login`, `account/register`, `demo/[tenantSlug]/login`, logout varianty). HSTS pomáhá až po HTTPS návštěvě a nenahrazuje správný cookie atribut.

Oprava: centralizovaný cookie helper s `httpOnly`, `secure: NODE_ENV === 'production'`, `sameSite`, přesným `path`, případně `__Host-` prefixem.

### P1-2: Chybí rate limiting na login/register a citlivých veřejných API

Vyhledání rate-limit implementace našlo pouze jednoduchý in-memory limiter v onboarding routě. Admin login, account login/register, tenant login, newsletter, contact a order-status nemají jednotnou ochranu.

Dopad: brute force, credential stuffing, spam, enumerace a nákladové DoS. In-memory limiter navíc nefunguje spolehlivě mezi serverless instancemi.

Oprava: sdílený distribuovaný limiter (IP + účet + tenant), progresivní backoff, audit události, obecné chybové zprávy.

### P1-3: CSRF ochrana je nekonzistentní

Existuje `assertSameOrigin`, ale není aplikována na všechny mutační routy. Nechráněné Template Lab endpointy nemají ani auth, ani origin check. `SameSite=Lax` samo o sobě není úplná CSRF politika.

Oprava: společný mutation guard; ověřit Origin/Host a pro cookie-auth mutace používat CSRF token. Zakázat mutace přes GET.

### P1-4: CSP prakticky nepokrývá script XSS

`next.config.ts:20` povoluje současně `'unsafe-inline'` a `'unsafe-eval'`. Tím CSP ztrácí velkou část ochranné hodnoty. `img-src https:` a neomezený Next Image hostname dále rozšiřují supply-chain/SSRF plochu.

Oprava: nonce/hash CSP, odstranit `unsafe-eval` v produkci, zavést report-only fázi a `report-to`; whitelist konkrétních image hostů.

### P1-5: Uložené HTML se renderuje bez sanitizace

Např. `BlockRenderer.tsx:26-31` a `EditableText` renderují rich text přes `dangerouslySetInnerHTML`. Pokud se škodlivý obsah dostane do DB přes editor/import/API, vzniká stored XSS na veřejném tenant webu. Regex blacklist ve vlastním kódu není obecný HTML sanitizer.

Oprava: server-side allowlist sanitizer (tagy, atributy, protokoly), sanitizovat při zápisu i obranně při výstupu; testovat `onerror`, SVG, MathML, encoded protokoly a broken markup.

### P1-6: Tenant custom JS běží na stejném originu jako platforma

`custom-code.ts` předpokládá, že blokování několika řetězců ochrání platformu. JavaScript na `webero.co/demo/...` ale běží pod originem `webero.co`, může volat same-origin API a číst vše, co není HttpOnly. Regex blacklist lze obcházet skládáním stringů, encodingem a nepřímými fetch URL.

Dopad: kompromitovaný tenant admin nebo importovaný snippet může útočit na platformu i návštěvníky.

Oprava: tenant weby izolovat na vlastní origin/subdomény a citlivé platformní cookie omezit host/path; custom code ideálně sandboxovat. Blacklist nepovažovat za bezpečnostní hranici.

### P1-7: Interní domain lookup může selhat do nezabezpečeného režimu

`src/app/api/domain-lookup/route.ts` porovnává token s `process.env.INTERNAL_API_TOKEN ?? ''`; proxy při chybějící proměnné posílá prázdný header. Konfigurace v lokálním env tento klíč neobsahuje. Je nutné ověřit produkční Vercel env.

Oprava: pokud secret chybí, endpoint vždy 503/deny a aplikace fail-fast; timing-safe comparison; nepoužívat veřejný HTTP endpoint pro interní lookup, pokud lze volat sdílenou serverovou funkci.

### P1-8: Veřejný robots.txt ukazuje na localhost

Živě potvrzeno 2026-07-13:

```text
Host: http://localhost:3015
Sitemap: http://localhost:3015/sitemap.xml
```

Příčina: `src/app/robots.ts:4` fallbackuje na localhost a produkce zjevně nemá očekávanou `NEXT_PUBLIC_BASE_URL` ani `NEXT_PUBLIC_SITE_URL`.

Dopad: crawlerům je publikována neplatná canonical infrastruktura a sitemap discovery je rozbitá.

Oprava: produkční default `https://webero.co`, lépe jeden validovaný server-side `SITE_URL`; deploy smoke test robots/sitemap.

### P1-9: ESLint není použitelná CI brána

`npm run lint` skončil 1 s 57 725 problémy (3 715 errors, 54 010 warnings). `eslint.config.mjs` neignoruje `public/**`, a proto lintuje 407 MB klonovaného cizího JS. Výsledek je hlučný, pomalý a vlastní regresní chyby se v něm ztratí.

Oprava: ignorovat `public/**`, generated/assets/backups/tmp; lintovat `src`, `scripts` a config soubory. Potom opravit vlastní chyby a v CI použít zero-warning budget nebo postupně klesající baseline.

### P1-10: Není definována testovací brána

`package.json` nemá obecný `test`, unit ani e2e script. Existují pouze úzce zaměřené studio/smoke skripty. Pro přibližně 988 souborů v `src` a stovky API rout chybí reprodukovatelná regresní síť.

Oprava: Vitest/Jest pro čistou logiku, integrační DB testy a Playwright e2e pro auth, tenant izolaci, editor, checkout a billing webhooky. CI pořadí: lint → typecheck → unit → integration → build → e2e smoke.

## P2 — střední

### P2-1: Extrémní monolity sekcí

`src/components/sections` má 145 102 řádků. Největší soubory: Navbar 24 758, Hero 24 355, Footer 17 095, About 15 757, Services 14 995, Contact 13 864. Babel už hlásí deoptimizaci souborů nad 500 KB.

Dopad: pomalý lint/transpile, konflikty, obtížné review, vysoké riziko vedlejší regresí a slabý tree-shaking.

Oprava: každou variantu do samostatného lazy-importovatelného modulu, generovaný registry manifest, společné primitives a schema vedle varianty.

### P2-2: Repo/public artefakty jsou nadměrné

`public` má 1,1 GB / 7 919 souborů, `public/clones` 407 MB, `.next` 1,7 GB. Build varuje, že dynamické filesystem patterns matchují 15 816 souborů.

Oprava: klony a user media přesunout do object storage/CDN, ne do aplikačního repa; build manifest místo dynamických `path.join(process.cwd(), 'public', userPath)`.

### P2-3: Path traversal riziko v práci s public cestami

Build upozornil na `src/lib/auto-fix.ts:69` a scan route, kde se dynamická cesta připojuje k `public`. `path.join` samo nezaručí, že výsledná cesta zůstane pod rootem.

Oprava: `resolve`, následná kontrola prefixu vůči canonical rootu, zákaz `..`, absolutních cest, NUL a encoded traversal; testy pro `%2e%2e` a dvojité encodingy.

### P2-4: Cache politika assetů předpokládá fingerprint, který není vynucen

`/templates`, `/assets` a `/images` dostávají roční immutable-like cache, ale mnoho názvů je stabilních (`hero.webp`, `logo.svg`). Po přepsání souboru mohou klienti rok držet starou verzi.

Oprava: content-hash filenames nebo kratší cache + version query řízený manifestem.

### P2-5: Hlavní HTML je vždy private/no-store

Živá homepage odpověděla `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`. To brání CDN cache i pro marketingové stránky a zvyšuje TTFB/náklady.

Pravděpodobná příčina je dynamická cookie/geolocation logika v globální proxy/layoutu. Oddělit veřejné statické stránky od request-specific personalizace.

### P2-6: Nadměrný preload fontů

Homepage Link header preloaduje 12 WOFF2 fontů. To spotřebuje bandwidth a může soutěžit s LCP assetem.

Oprava: audit skutečně použitých rodin/řezů, preload pouze kritický řez, subset latin/latin-ext a `font-display` strategie.

### P2-7: Remote images povolují libovolný HTTPS hostname

`next.config.ts:86-89` používá `hostname: '**'`. U image optimizeru to rozšiřuje SSRF a nákladové riziko a znemožňuje kontrolu zdrojů.

Oprava: explicitní allowlist tenant CDN/blob domén; externí URL validovat proti DNS/IP pravidlům a blokovat privátní rozsahy.

### P2-8: Zastaralé/neúčinné bezpečnostní hlavičky

`X-XSS-Protection` je historický mechanismus a nepřináší ochranu v moderních browserech. Chybí moderní COOP/CORP podle kompatibility, CSP reporting a promyšlená clickjacking politika pro embed scénáře.

### P2-9: Hardcoded robots `queueLength: 54`

`template-lab/status/route.ts:33` vrací konstantu místo skutečného stavu. Monitoring/UI proto může lhát.

### P2-10: Prázdné catch bloky skrývají provozní chyby

Např. Template Lab status ignoruje DB výjimky (`catch {}`) a vrátí prázdná data jako zdánlivě validní odpověď. Proxy podobně tiše propadne při domain lookup chybě.

Oprava: strukturované logy, request ID, metriky, odlišení degraded response a alerting.

### P2-11: Login/setup validace je slabá a bez schémat

Routy parsují `request.json()` a ručně kontrolují minimum polí. Chybí limity velikosti body, normalizace emailu, Zod schéma a konzistentní error handling. Setup endpoint zůstává trvale nasazený.

Oprava: centralizovaná schémata, body limit, setup jednorázově vypnout po bootstrapu a omezit síťově/časově.

### P2-12: Dva package locky

Repo obsahuje `package-lock.json` i `pnpm-lock.yaml` a oba jsou změněné. To vytváří rozdílné dependency trees mezi lokálem, CI a Vercel.

Oprava: zvolit jediný package manager, nastavit `packageManager` v `package.json`, odstranit druhý lock a v CI používat frozen lockfile.

## P3 — nízké / technický dluh

1. Produkce posílá `x-powered-by: Next.js`; lze vypnout přes `poweredByHeader: false`.
2. `cookieOptions()` v `src/lib/auth.ts:24-31` vypadá rozbitě: hodnotu cookie skládá vždy jako prázdnou a není jednotně používán.
3. `Footer.tsx` loguje newsletter údaje do konzole v development režimu; zabránit logování PII i v lokálních sdílených logách.
4. Dynamický robots má současně `dynamic = force-dynamic` a `revalidate = 3600`; záměr cache je nejasný.
5. Sitemap používá při každém requestu aktuální čas pro většinu URL, místo skutečného času změny; crawlerům vzniká falešný churn.
6. Sitemap obsahuje `/o-nas`, zatímco fyzická route je `/about` a `/[slug]`; nutno potvrdit, zda dynamický slug vždy existuje a vrací 200.
7. Staré `X-Frame-Options: SAMEORIGIN` a CSP `frame-ancestors 'self'` jsou duplicitní; sjednotit záměr.
8. Velké množství `tmp`, handoff, backup a generovaných assetů v pracovním stromu komplikuje review a deployment hygiene.

## Pozitivní nálezy

- SQL v kontrolovaných routách používá parametrizované placeholders, nikoli string interpolation uživatelských hodnot.
- Tenant auth porovnává access token timing-safe (`demo-auth.ts`).
- Upload endpoint ověřuje platform/tenant oprávnění a má rozměrové limity.
- HSTS, nosniff, referrer policy a permissions policy jsou na živém webu přítomné.
- Produkční build dokončil generování 98 statických stránek a route manifestu.
- `.env.local` není podle `git ls-files` verzovaný.

## Ověření a přesné výsledky

### Build

- `npm run build`: PASS, exit 0.
- Zásadní caveat: `Skipping validation of types`.
- 2 Turbopack warnings na příliš široké filesystem patterns (15 816 files).

### TypeScript

- `npx tsc --noEmit`: FAIL, exit 2.
- 5 chyb uvedených v P0-3.

### ESLint

- `npm run lint`: FAIL, exit 1.
- 57 725 problémů: 3 715 errors, 54 010 warnings.
- 32 errors a 27 warnings automaticky opravitelné; většina objemu pochází z cizích klonů, ale vlastní kód obsahuje skutečné React hooks/refs, navigation, escaping a typing chyby.

### Dependency vulnerability scan

- `npm audit --omit=dev --json` nebylo možné dokončit: sandbox DNS blokoval registry a eskalace byla odmítnuta, protože by odeslala dependency inventory privátního projektu npmjs.org bez explicitního souhlasu uživatele.
- Stav známých CVE je proto **neověřený**, nikoli čistý.

### Živý web

- `https://webero.co`: HTTP 200.
- HSTS, CSP, nosniff, frame/referrer/permissions headers přítomny.
- HTML cache: private/no-store.
- `robots.txt`: HTTP 200, ale Host/Sitemap míří na localhost.
- `sitemap.xml`: HTTP 200, 13 URL; základní canonical URL používají HTTPS.
- Integrovaný interaktivní browser nebyl v prostředí dostupný. Nebyly proto provedeny vizuální breakpointy, keyboard-only průchod, screen-reader tree, formulářové submit scénáře ani checkout s UI. Tyto oblasti zůstávají otevřené.

## Doporučené pořadí oprav

### Do 24 hodin

1. Uzavřít `/api/template-lab/**` autentizací, autorizací a CSRF guardem.
2. Serverově chránit celý `/admin/**` strom.
3. Ověřit produkční `JWT_SECRET`, `INTERNAL_API_TOKEN`; odstranit fallback secret.
4. Opravit `SITE_URL`, okamžitě ověřit živý robots.txt.
5. Přidat `Secure` cookies a rate limit na login endpointy.

### Do 3 dnů

1. Opravit 5 TS chyb a zapnout typovou build bránu.
2. Opravit ESLint scope, získat použitelný baseline a CI.
3. Auditovat všechny API routy maticí: method, auth, role, tenant scope, origin/CSRF, schema, rate limit, audit log.
4. Sanitizovat rich HTML a rozhodnout izolaci tenant custom code.
5. Přidat negativní integrační testy auth/tenant isolation.

### Do 2 týdnů

1. Rozdělit sekční monolity a odstranit filesystem over-bundling.
2. Přesunout klony/media mimo repo/public.
3. Zavést unit/integration/e2e test pyramid.
4. Zpřísnit CSP a image allowlist.
5. Optimalizovat public caching, font preload a reálné sitemap timestamps.

## Akceptační kritéria pro bezpečný release

- `npm run lint`, `npm run typecheck`, testy a build končí 0 bez bypassů.
- Každá admin/mutation route vrací bez validní session 401/403.
- Tenant A nikdy nemůže číst ani měnit tenant B data; automatizovaný test pro každou resource family.
- `robots.txt` a sitemap obsahují pouze produkční HTTPS origin.
- Žádná auth cookie v produkci není bez `HttpOnly`, `Secure` a definované SameSite/path politiky.
- Stored rich text je sanitizován a bezpečnostní payload corpus nemůže spustit JS.
- CSP neobsahuje `unsafe-eval`; inline script je řízen nonce/hash.
- Dependency CVE scan je součástí důvěryhodného CI a blokuje dohodnuté severity.
- Vizuální/e2e audit projde desktop, tablet, 320px mobile, keyboard-only a checkout/login kritické cesty.
