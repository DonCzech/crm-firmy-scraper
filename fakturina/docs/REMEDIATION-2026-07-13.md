# Fakturina — remediation handoff

**Datum:** 13. 7. 2026  
**Stav kódu:** ověřeno, připraveno pro staging po aplikaci migrace

## Dokončeno

- Crony jsou fail-closed a token se porovnává constant-time.
- Klient už nepoužívá `NEXT_PUBLIC_CRON_SECRET`; manuální běh vede přes session endpoint.
- Auth, e-mailing, ARES, uploady a PDF mají throttling.
- Nové session tokeny jsou v DB uložené pouze jako SHA-256 hash; staré session zůstávají kompatibilní do expirace.
- Faktury dostávají číslo atomicky a create/update agregáty používají transakce.
- Create operace nabídek, nákladů a recurring šablon používají transakce.
- Přidána produkční migrace s unique/check constraints, indexy a Stripe event ledgerem.
- Stripe webhook je idempotentní, plán odvozuje z Price ID a při chybě vrací 5xx.
- Implementován recurring cron včetně lockingu, posunu termínu a volitelného e-mailu.
- Free/Pro/Business limity se vynucují na serveru pro faktury, klienty a recurring funkce.
- ARES při výpadku nevrací fiktivní právní údaje.
- Uploady odmítají SVG/aktivní obsah, ověřují magic bytes a používají Vercel Blob v produkci.
- HTML v e-mailech a invoice PDF datech se escapuje.
- Reminder job používá unikátní claim proti duplicitnímu rozeslání.
- Bank sync nejdřív idempotentně vloží transakci a teprve potom páruje fakturu.
- Next.js byl aktualizován na 15.5.18, React na 19.1.1 a PostCSS vynucen na bezpečnou verzi.
- `npm audit --omit=dev`: 0 zranitelností.
- Přidán ESLint, strict typecheck, unit testy, GitHub Actions CI a souhrnný `npm run check`.
- `.next`, tsbuildinfo, env, logy a uploady jsou ignorované; generované soubory byly vyřazeny z indexu.
- Sjednocen package manager na npm; pnpm lockfile odstraněn.
- Přidány README, `.env.example`, health endpoint, request ID, cache/security headers.
- Přidány robots, sitemap, manifest, canonical/Open Graph metadata a legal/kontaktní stránky.
- Marketing již netvrdí podporu Air Bank ani neimplementované Business funkce.
- Doplněny základní a11y opravy auth formuláře.

## Povinné kroky před staging/production deployem

Tyto kroky mění externí prostředí a nebyly automaticky provedeny proti neidentifikované vzdálené Neon databázi:

1. Zálohovat cílovou databázi a ověřit, že neobsahuje duplicitní čísla faktur/nabídek.
2. Nastavit cílové `DATABASE_URL` a spustit `npm run db:migrate`.
3. Odstranit `NEXT_PUBLIC_CRON_SECRET` ze všech Vercel environments a rotovat `CRON_SECRET`.
4. Nastavit nový náhodný `BANK_TOKEN_SECRET` (min. 32 bajtů); při změně existujícího klíče reautorizovat bankovní spojení.
5. Nastavit `BLOB_READ_WRITE_TOKEN`, Stripe secrets/Price IDs, Resend a správné `NEXT_PUBLIC_APP_URL`.
6. Doplnit skutečné jméno/název, IČO a sídlo provozovatele na kontaktní a právní stránky; současný text záměrně nic nevymýšlí.
7. Ověřit Vercel cron konfiguraci pro reminders, bank sync a recurring.
8. Spustit `npm run check` v čistém CI a E2E pouze proti izolované staging databázi.
9. Provést manuální viewport, klávesnicový a screen-reader QA; in-app browser nebyl během této relace dostupný.

## Ověření provedené po změnách

- `npm run lint` — PASS, 0 warnings.
- `npm run typecheck` — PASS.
- `npm test` — PASS, 2/2.
- `npm run build` — PASS, Next.js 15.5.18, 38 staticky generovaných stran/routových skupin.
- `npm run check` — PASS.
- `npm audit --omit=dev` — PASS, 0 vulnerabilities.

## Rollback

- Aplikační rollback: vrátit deployment na předchozí artefakt.
- Migrace `001` pouze přidává tabulku/indexy/constraints a nemaže business data. Při nutném rollbacku aplikace mohou nové objekty v DB zůstat.
- Před odstraněním unique constraintů nejprve zastavit zápisy; jinak se mohou vrátit duplicitní čísla.
- Rotované secrety nevracet na dříve zveřejněné hodnoty.
