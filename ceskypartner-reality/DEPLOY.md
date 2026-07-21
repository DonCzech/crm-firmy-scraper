# Nasazení do produkce — checklist

## 1. Prostředí

- [ ] Hosting: Vercel (doporučeno — `vercel.json` už obsahuje cron úlohy) nebo VPS s Node 20
- [ ] Produkční PostgreSQL (Neon.tech) — vytvořit samostatnou produkční větev/DB, ne dev databázi
- [ ] `npx prisma db push` proti produkční DB (vytvoří schéma)
- [ ] Základní seed: admin uživatel (`scripts/seed-full.ts` nebo ručně), případně `scripts/seed-blog-drafts.ts` pro blog drafty

## 2. Env proměnné (viz `.env.example`)

- [ ] `DATABASE_URL` — produkční Neon
- [ ] `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` + `NEXT_PUBLIC_SITE_URL` — produkční doména
- [ ] `CRON_SECRET` — `openssl rand -hex 24`
- [ ] R2 klíče (média) — bucket + public URL
- [ ] Portálové konektory — jen ty, které jsou s portály smluvně dohodnuté

## 3. Cron úlohy

Na Vercelu běží automaticky dle `vercel.json`. Jinde nastavit:

```
0 */2 * * *  curl -s "https://DOMENA/api/cron/portal-sync?secret=CRON_SECRET"
0 8 * * 4    curl -s "https://DOMENA/api/cron/weekly-digest?secret=CRON_SECRET"
```

Vercel cron posílá `Authorization: Bearer $CRON_SECRET` automaticky (stačí mít
env proměnnou `CRON_SECRET`) — endpointy akceptují secret v query i v hlavičce.

## 4. Po nasazení — admin

- [ ] Nastavení → Firma: údaje, telefon, e-mail, vodoznak (výchozí vypnuto)
- [ ] Nastavení → E-mail/SMTP: vyplnit + tlačítko „Test SMTP“
- [ ] Nastavení → SEO: meta popisky, Plausible doména (zapne analytiku)
- [ ] Uživatelé: založit makléře (fotka + bio → veřejné profily /makleri)
- [ ] Blog: zkontrolovat a publikovat připravené drafty
- [ ] Recenze: doplnit reálné recenze klientů

## 5. SEO start

- [ ] Google Search Console: ověřit doménu, odeslat `https://DOMENA/sitemap.xml`
- [ ] Bing Webmaster Tools: totéž
- [ ] Zkontrolovat OG kartičku: sdílet detail inzerátu do Slack/WhatsApp
- [ ] Rich results test (https://search.google.com/test/rich-results) na detail inzerátu

## 6. Kontrola funkcí

- [ ] Poptávka z detailu → dorazí e-mail makléři + potvrzení klientovi
- [ ] Hypoteční formulář → e-mail se všemi parametry
- [ ] Hlídací pes → potvrzení s odhlašovacím odkazem; publikace inzerátu → avízo
- [ ] Newsletter → uvítací e-mail s odhlašovacím odkazem
- [ ] `npm run test:e2e` proti produkci (změnit baseURL) nebo lokálně
