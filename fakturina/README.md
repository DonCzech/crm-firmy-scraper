# Fakturina

Česká fakturační SaaS aplikace postavená na Next.js, PostgreSQL, Stripe a Resend.

## Lokální spuštění

1. Použijte Node.js 22 a `npm ci`.
2. Zkopírujte `.env.example` do `.env.local` a doplňte lokální/staging hodnoty.
3. Spusťte `npm run db:migrate` proti oddělené vývojové databázi.
4. Spusťte `npm run dev`; aplikace běží na `http://localhost:3020`.

## Ověření

`npm run check` spustí lint, TypeScript, unit testy a produkční build. Destruktivní smoke flow `npm run test:e2e-flow` používejte pouze proti jednorázové testovací databázi.

## Nasazení

Migrace musí proběhnout před nasazením aplikační verze. Produkční runtime DB role nemá mít DDL oprávnění. `CRON_SECRET` a `BANK_TOKEN_SECRET` musí mít alespoň 32 náhodných bajtů a nesmí být prefixované `NEXT_PUBLIC_`.

Bezpečnostní a provozní stav je veden v `docs/FULL-AUDIT-2026-07-13.md`.
