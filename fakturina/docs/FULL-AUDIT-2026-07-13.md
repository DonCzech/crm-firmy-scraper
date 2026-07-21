# Fakturina — kompletní audit od A do Z

**Datum:** 13. 7. 2026  
**Rozsah:** aplikace v `/Users/apple/DEV/CRM/fakturina`  
**Verdikt:** **NEPŘIPRAVENO pro ostrý provoz bez nápravy P0/P1 bodů**  
**Celkové hodnocení:** **47/100**

> **Stav nápravy 13. 7. 2026:** Zdrojový kód byl po auditu zásadně opraven. P0 body byly odstraněny, `npm run check` prochází a `npm audit --omit=dev` hlásí 0 zranitelností. Původní nálezy níže zůstávají jako historický záznam. Přesný seznam změn a deploy podmínky jsou v `REMEDIATION-2026-07-13.md`. Produkční nasazení stále vyžaduje aplikaci migrace, rotaci dříve veřejného cron secretu, doplnění Blob/Stripe/Bank secretů a identitu provozovatele.

## Executive summary

Fakturina je rozsáhlé MVP české fakturační SaaS aplikace. Má použitelný základ: přihlášení, firmy, klienty, faktury, nabídky, náklady, PDF, e-mailing, upomínky, bankovní párování, Stripe billing, exporty a základní tenant izolaci. Produkční build i TypeScript kontrola procházejí.

Největší problém není množství funkcí, ale jejich produkční dotažení. Kritické endpointy mají ochranu typu „pokud secret existuje“, cron secret je současně vložen do veřejného `NEXT_PUBLIC_*` prostředí, login a registrace nemají rate limiting, fakturační zápisy nejsou transakční a číslování faktur má race condition. Deklarované placené limity se nevynucují a opakované faktury se pouze ukládají — žádný job je nevystavuje. Aplikace tak dnes může působit hotověji, než jaká je její skutečná provozní a obchodní integrita.

## Skóre po oblastech

| Oblast | Skóre | Stav |
|---|---:|---|
| Funkční pokrytí | 78/100 | Široké MVP |
| Architektura a udržovatelnost | 48/100 | Výrazný technický dluh |
| Bezpečnost | 32/100 | Blokuje produkci |
| Datová integrita | 35/100 | Blokuje produkci |
| Autentizace a autorizace | 52/100 | Základ funguje, chybí hardening |
| Platby a monetizace | 38/100 | UI/integrace existuje, enforcement ne |
| Testy a CI | 18/100 | Prakticky bez automatických testů |
| UX a přístupnost | 58/100 | Solidní základ, bez ověřeného QA |
| SEO a marketing | 42/100 | Minimum metadat, chybí technické SEO a legal |
| Provoz a observabilita | 28/100 | Chybí migrace, monitoring, healthcheck a runbook |

## Co bylo ověřeno

- Inventura 100+ aplikačních souborů a přibližně 17 040 řádků TypeScript/TSX.
- Revize všech API oblastí, autentizace, middleware, DB schématu, cronů, Stripe webhooku, uploadů, bankovního syncu, PDF a e-mailových toků.
- `npm run build`: **PASS**, 54 rout, First Load JS přibližně 87 kB sdíleně.
- `npm run typecheck`: **PASS** při sekvenčním spuštění po buildu.
- `npm run lint`: **FAIL** — ESLint není nakonfigurován a příkaz spouští interaktivní průvodce.
- `npm audit --omit=dev`: **FAIL**, 1 high + 1 moderate produkční zranitelnost; přímým zdrojem je zastaralý Next.js 14.
- E2E skript byl záměrně nespouštěn: `.env.local` míří na vzdálený Neon PostgreSQL a skript vytváří trvalá testovací data.
- Vizuální browser QA nebylo možné dokončit, protože in-app browser nebyl v relaci dostupný. Statický UX/a11y audit proto není náhradou za manuální viewport test.

## P0 — kritické nálezy

### P0.1 Cron endpointy jsou fail-open

`/api/cron/reminders` i `/api/cron/bank-sync` odmítnou požadavek pouze tehdy, když `CRON_SECRET` existuje **a** token nesouhlasí. Při chybějící proměnné jsou endpointy veřejné. Útočník může spouštět hromadné e-maily a bankovní synchronizace.

**Důkaz:** `src/app/api/cron/reminders/route.ts:30-36`, `src/app/api/cron/bank-sync/route.ts:8-13`.

**Náprava:** v produkci fail-closed; při chybějícím secretu vrátit 503, při neplatném 401. Povolit pouze metodu očekávanou schedulerem, použít constant-time porovnání a přidat idempotentní lock.

### P0.2 Cron secret je posílán do klienta

`ReminderSettingsForm` čte `NEXT_PUBLIC_CRON_SECRET` a odesílá jej v Authorization hlavičce. Každá `NEXT_PUBLIC_*` hodnota je součást veřejného browser bundlu. Pokud odpovídá `CRON_SECRET`, kdokoli získá přístup ke cronům; pokud neodpovídá, tlačítko nefunguje.

**Důkaz:** `src/components/ReminderSettingsForm.tsx:52`; `.env.local` obsahuje obě proměnné.

**Náprava:** veřejnou proměnnou odstranit a rotovat oba současné secrety. Manuální spuštění vést přes autentizovaný serverový endpoint, který ověří session/roli a interně zavolá job.

### P0.3 Fakturační zápisy nejsou atomické

Číslo se vypočítá ze staré hodnoty `invoice_next`, čítač se zvýší samostatným dotazem a hlavička, tagy a položky se ukládají dalšími samostatnými dotazy. Paralelní requesty mohou získat stejné číslo; selhání uprostřed zanechá neúplnou fakturu nebo spotřebované číslo. Stejný vzor je u update položek (nejdřív DELETE, potom INSERT), nabídek, nákladů, šablon a opakovaných faktur.

**Důkaz:** `src/app/api/invoices/route.ts:122-198`, `src/app/api/invoices/[id]/route.ts:157-207`.

**Náprava:** DB transakce s `SELECT ... FOR UPDATE` nebo atomickým `UPDATE ... RETURNING`; unikátní constraint minimálně `(company_id, number)`; rollback celé aggregate operace; repository/service vrstva s předaným DB klientem.

## P1 — vysoká priorita

### P1.1 Známé produkční zranitelnosti v Next.js

Instalován je Next.js 14.2.35. Aktuální `npm audit` hlásí přímou high zranitelnost a transitive moderate zranitelnost (včetně DoS/SSRF/cache problémů podle konfigurace). Audit nabízí opravu pouze přes major upgrade.

**Náprava:** naplánovat upgrade na aktuální podporovanou řadu Next/React, provést migrační testy, znovu auditovat a nasadit nejprve do stagingu.

### P1.2 Login, registrace, ARES, upload a e-mail nemají rate limiting

Neexistuje ochrana proti brute force, credential stuffing, masové registraci, enumeraci, zneužití e-mailů ani vyčerpání externích API. Registrace navíc explicitně prozrazuje existující e-mail.

**Důkaz:** `src/app/api/auth/login/route.ts`, `register/route.ts`, `ares/route.ts`, send endpointy; v projektu není rate-limit implementace.

**Náprava:** distribuovaný limiter (IP + účet + endpoint), progresivní backoff, neutrální auth odpovědi, CAPTCHA až při riziku, kvóty pro e-mail/PDF/ARES a audit alerty.

### P1.3 Obchodní limity a placené funkce se nevynucují

`PLAN_LIMITS` existuje pouze v `src/lib/auth.ts`; API jej nikde nepoužívá. Free účet může přes API vytvářet neomezené faktury a klienty. Marketing slibuje multi-company, API, role, webhooky, účetní přístup a další funkce, které nejsou implementované nebo vynucované.

**Důkaz:** jediný výskyt `PLAN_LIMITS` je jeho deklarace; `getUserCompany` vždy vrací první firmu.

**Náprava:** centrální entitlement service, server-side guard v každém relevantním API, usage counter v transakci, testy hranic plánů a přesný feature matrix vůči webu.

### P1.4 Opakované faktury se nikdy nevystavují

CRUD ukládá `next_issue_date`, ale v projektu není cron ani worker, který by splatné šablony převedl na faktury, posunul datum a případně odeslal e-mail.

**Důkaz:** `next_issue_date` se používá pouze v DB schématu a CRUD routách; `vercel.json` plánuje jen reminders a bank-sync.

**Náprava:** idempotentní recurring job s DB lockem, transakcí, unikátním run klíčem, retry politikou, dead-letter stavem a testy konců měsíců/DST.

### P1.5 SVG upload umožňuje aktivní obsah a úložiště není produkční

Upload přijímá SVG pouze podle klientského MIME a přípony, bez sanitizace obsahu. SVG servírované ze stejného originu je rizikové. Soubory se zapisují do `public/uploads` lokálního filesystemu, který je na serverless/Vercel nepersistentní a mezi instancemi nesdílený.

**Důkaz:** `src/app/api/upload/route.ts:7-47`.

**Náprava:** SVG zakázat nebo robustně sanitizovat a podávat z odděleného asset originu; ověřovat magic bytes; použít S3/R2/Vercel Blob, podepsané uploady, kvóty a mazání orphanů.

### P1.6 Stripe webhook polyká chyby a nemá idempotency ledger

Chyba DB/Stripe je zalogována, ale endpoint stejně vrátí HTTP 200. Stripe tedy event neopakuje a subscription může zůstat ve špatném stavu. Event ID se neukládá, takže není zajištěná idempotence ani auditovatelné replay.

**Důkaz:** `src/app/api/stripe/webhook/route.ts:26-108`.

**Náprava:** při nezpracování vrátit 5xx; tabulka webhook eventů s unique `event.id`, stavem a payload hashem; plan odvozovat z allowlistu Price ID, ne z checkout metadata.

### P1.7 `initDb()` provádí DDL za běhu requestů

Velký blok `CREATE/ALTER` se volá z loginu, registrace, layoutu a veřejných/cron rout. To zvyšuje latenci, lock contention a oprávnění aplikace; migrace nemají verzování ani rollback.

**Důkaz:** `src/lib/db.ts`; 18 runtime call sites.

**Náprava:** verzované migrace v deploy pipeline, separátní DB role pro migrace, runtime role bez DDL, startup healthcheck pouze read-only.

### P1.8 ARES při chybě vrací smyšlenou firmu jako reálný výsledek

HTTP chyba i výjimka vytvoří „Demo firma s.r.o.“ se zadaným IČ a fiktivním DIČ/adresou. To může kontaminovat faktury právně nesprávnými údaji.

**Důkaz:** `src/lib/ares.ts:23-53`.

**Náprava:** v produkci vracet explicitní nedostupnost/not-found; mock povolit pouze přes development fixture.

## P2 — střední priorita

### Bezpečnost a auth

- Session tokeny jsou v DB v plaintextu. Při úniku DB dávají okamžitý přístup; ukládat pouze hash tokenu.
- Session trvá 30 dní bez rotace, device managementu a globální revokace; `SESSION_SECRET` se vůbec nepoužívá.
- Middleware kontroluje jen existenci cookie, ne validitu. Serverové routy kontrolu doplňují, ale UX redirect může být zavádějící.
- Chybí explicitní CSRF obrana pro cookie-auth mutace; `SameSite=Lax` je dobrý základ, nikoli plná ochrana.
- Security headers jsou jen základní. Chybí CSP, HSTS (produkce), COOP/CORP a cache pravidla pro citlivé stránky.
- `ssl.rejectUnauthorized: false` vypíná ověření certifikátu PostgreSQL; použít validní CA/bezpečnou provider konfiguraci.
- Bank token používá správně AES-256-GCM, ale `BANK_TOKEN_SECRET` v lokální konfiguraci chybí; funkce bankovního napojení proto selže. Chybí key versioning/rotace.
- Fio token je vložen do URL; může se objevit v proxy/APM logu. Minimalizovat logging a ověřit provider možnost bezpečnějšího transportu.

### Datový model a doménová logika

- Chybí DB `CHECK` constraints pro statusy, měny, sazby DPH, nezáporné částky a konzistenci dat.
- Cizí klíče `client_id` nebrání cross-company referenci na DB vrstvě; API většinou kontroluje tenant, ale integrita závisí na každém handleru.
- Částky se počítají JavaScript `number`; pro účetní výpočty použít decimal/integer minor units a jednotnou rounding policy.
- Schéma dovoluje prázdnou fakturu (`items.min(0)`), nulové množství a zápornou jednotkovou cenu bez explicitního režimu dobropisu.
- Slevy nemají bezpečné rozsahy; lze vytvořit záporný total nebo slevu nad 100 %.
- Datum je volný string bez validace formátu a vztahů (splatnost před vystavením apod.).
- Číslo faktury nemá unikátní constraint.
- Audit log nepokrývá všechny mutace a systémový user `system` koliduje s deklarací `user_id NOT NULL` bez FK; chybí IP/request ID/before-after.
- U reminder logu chybí unique `(invoice_id,type)`; souběžné crony mohou poslat duplicitní upomínky.
- Bank sync páruje fakturu ještě před idempotentním vložením transakce; replay může opakovat auditní změny.

### API a spolehlivost

- Většina handlerů nemá sjednocený error boundary; DB výjimky vracejí generické 500 a mohou mít nekonzistentní formát.
- Externí `fetch` volání nemají timeout/AbortSignal, retry policy ani circuit breaker.
- PDF spouští nový Chrome proces pro každý request a používá `--no-sandbox`; drahé a rizikové. Chybí limit souběhu a garantované `finally browser.close()`.
- Veřejné tokenové faktury mění `viewed_at` při GET, což komplikuje cache, prefetch a e-mailové bezpečnostní skenery.
- Není verzování API, OpenAPI kontrakt ani standard pagination; list endpointy mohou časem vracet neomezená data.
- Exporty a PDF nemají explicitní rate limit/cache/content-disposition hardening audit.

### Kvalita kódu a repo hygiene

- ESLint není nakonfigurován; `npm run lint` je v CI nepoužitelný.
- Neexistují unit/integration testy; jediný `scripts/e2e-flow.mjs` je destruktivní smoke flow proti DB z prostředí.
- Repozitář sleduje přibližně 480 souborů z `.next` a `tsconfig.tsbuildinfo`. Build audit proto změnil desítky generovaných souborů a vytváří šum/merge konflikty.
- `.gitignore` obsahuje pouze `.vercel`; chybí `.next`, `node_modules`, `.env*`, build cache, logy, OS soubory a uploady.
- Současně jsou verzované `package-lock.json` i `pnpm-lock.yaml`, přestože instalace je fyzicky pnpm layout. Zvolit jeden package manager a CI vynutit frozen lockfile.
- README je prázdné. Chybí onboarding, env schema, architektura, migrace, testy, deploy a incident runbook.
- `@anthropic-ai/sdk` je produkční závislost bez nalezeného použití; odstranit nebo zdokumentovat.

### UX, přístupnost, SEO a právní minimum

- Marketing uvádí funkce, které nejsou dostupné/vynucené (Air Bank, role, API, webhooky, účetní přístup, multi-company). Srovnat copy s realitou.
- Air Bank se na landing page prezentuje mezi napojenými bankami, API ji přitom explicitně odmítá jako nepřipravenou.
- Tlačítko zobrazení hesla nemá přístupný název (`aria-label`); stavové/error hlášky nemají `aria-live`.
- Mockup grafy a statusy spoléhají na barvu a nejsou sémantické; prověřit kontrast, focus, klávesnici a reduced motion.
- Chybí route-specific metadata, canonical, Open Graph/Twitter obrázek, sitemap, robots a manifest.
- Chybí veřejné obchodní podmínky, ochrana osobních údajů, cookies/processor informace, identita provozovatele a kontaktní/legal stránky.
- Není doložena přístupnost WCAG 2.2 AA ani test na mobilních viewports.

## P3 — zlepšení

- Rozdělit 17k řádků na doménové služby (billing, invoices, quotes, automation) a sdílené repository/transakční utility.
- Zavést structured logging s redakcí PII/secrets, request ID a korelací cron/webhook runů.
- Přidat Sentry/OpenTelemetry, metriky latence/error rate, frontu pro PDF/e-mail a alerty.
- Zavést health/readiness endpoint, zálohy + test obnovy, retention policy a export/smazání účtu.
- Přidat feature flags a staging prostředí s oddělenou DB/Stripe/Resend.
- Optimalizovat landing page: velké množství inline stylů a celý web je client component; rozdělit statický obsah do server components.

## Pozitiva

- SQL hodnoty jsou převážně parametrizované a tenant scope je ve většině citlivých dotazů přítomen.
- Hesla používají bcrypt cost 12; session token i public token mají dostatečnou entropii.
- Cookie má `HttpOnly`, `Secure` v produkci a `SameSite=Lax`.
- Stripe signature se ověřuje nad raw body.
- Bank token používá autentizované šifrování AES-256-GCM.
- Zod je použit na velké části mutačních API.
- Build má rozumnou klientskou velikost a TypeScript je ve strict režimu.
- Základní security headers (`DENY`, `nosniff`, Referrer/Permissions Policy) jsou nastaveny.
- Veřejné faktury používají dlouhý náhodný token a interní detailové routy většinou ověřují company ownership.

## Doporučený remediation plán

### 0–48 hodin: release blocker

1. Odstranit `NEXT_PUBLIC_CRON_SECRET`, rotovat secret a udělat oba crony fail-closed.
2. Dočasně vypnout/skrýt nefunkční bank/recurring/placené funkce, pokud jsou dostupné zákazníkům.
3. Zakázat SVG upload a přesunout uploady do trvalého object storage.
4. Přidat rate limit na auth, send, upload, ARES, PDF a cron.
5. Opravit Stripe webhook na 5xx při chybě a zavést event deduplikaci.
6. Upgrade Next.js na bezpečnou podporovanou řadu po staging regresi.

### 1. týden: integrita

1. Zavést migrace a odstranit runtime DDL.
2. Přepsat create/update agregáty do DB transakcí.
3. Atomické číslování + unique constraint.
4. Decimal rounding policy, Zod/DB constraints a date/status validace.
5. Server-side entitlement enforcement a srovnání pricing copy.
6. Implementovat idempotentní recurring worker nebo funkci odstranit z nabídky.

### 2.–3. týden: kvalita a provoz

1. ESLint + formatter + `typecheck` + testy + build v CI.
2. Unit testy výpočtů/číslování; integration testy tenant izolace/transakcí; E2E na izolované test DB.
3. Vyčistit `.gitignore`, přestat verzovat `.next`/tsbuildinfo a sjednotit package manager.
4. Observabilita, alerty, healthcheck, backup/restore drill a incident runbook.
5. Browser QA na desktop/tablet/mobile, axe audit a klávesnicové testy.
6. Doplnit legal, sitemap/robots/canonical/OG a přesná metadata.

## Minimální release gate

Produkci povolit teprve, když současně platí:

- žádný P0 a žádný otevřený security P1;
- `lint`, `typecheck`, unit/integration testy a build procházejí v čistém CI;
- tenant-isolation testy pro každý CRUD/export/PDF/send endpoint;
- invoice create/update je atomický a číslo je unikátní;
- crony/webhooky jsou autentizované, idempotentní a monitorované;
- placené limity jsou server-side vynucené;
- staging E2E nepoužívá produkční Neon/Stripe/Resend;
- známé produkční závislosti nemají high/critical audit nález;
- je ověřen backup restore a existuje incident/rollback postup.

## Závěr

Fakturina není špatný prototyp — naopak má nadprůměrně široké funkční pokrytí. Dnes je ale **feature-complete demo, nikoli production-grade fakturační systém**. Nejvyšší návratnost má nyní zastavit vývoj dalších funkcí a jeden až tři týdny investovat do bezpečnosti, transakcí, monetizační integrity, automatických testů a provozu. Po odstranění P0/P1 bodů může základ velmi dobře posloužit pro kontrolovaný beta provoz.
