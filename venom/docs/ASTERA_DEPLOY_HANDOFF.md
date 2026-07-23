# Astera Light → Webero — DEPLOY HANDOFF

Připravila session pro astera port. **Deploy provede jiná session** (má i jinou šablonu).
Tento commit obsahuje POUZE astera věci — cizí rozpracované soubory (HeroSection, NavbarSection,
`src/templates/beauty-02/theme.json`, `_f.mjs`) jsem NECOMMITOVAL.

## Co je v commitu
- **Izolovaný modul** `src/astera/` (verbatim 1:1 astera-web: content-types, i18n, ContentContext
  v hosted režimu, komponenty vč. widgetů + LiveEditor, host.ts glue, astera.css + astera-fonts.ts).
- **Mount + routing:** `src/components/templates/AsteraSiteTemplate.tsx`,
  `src/components/studio/AsteraStudioEditor.tsx`, úpravy `SectionRenderer.tsx`, `TenantPublicView.tsx`,
  `app/demo/[tenantSlug]/{page,[slug]/page,admin/page}.tsx`.
- **Šablona (privátní):** `src/lib/templates/{asteralight.ts,astera-content.ts,astera-seed.json}` +
  registrace v `templates/index.ts` (klíč `asteralight`; NENÍ ve veřejném katalogu).
- **Wheel of fortune:** tabulka `wheel_leads` + `saveWheelLead/getWheelLeads` v `db.ts` +
  route `app/api/demo/[tenantSlug]/wheel/`.
- **Custom doména:** `proxy.ts` (jazykový prefix `/en|/ua|/cs` → `?lang=`, gated na `multilang`) +
  `app/api/domain-lookup/route.ts` (vrací `multilang`).
- **Účet — změna e-mailu/hesla:** `app/api/demo/[tenantSlug]/account/route.ts` +
  `components/admin/settings/UserAccessSettings.tsx` (v „Uživatelské přístupy").
- **Assety:** `public/optimized/` + nové `public/images/{crystal-ball-astera.png,koule.jpg,
  moon-phases/,vyber-si-kartu.png,astera-VV.webp}` (blob obrázky hero/newsletter se tahají z Vercel blobu).

## PŘED / PŘI deployi — POVINNÉ

1. **DB migrace jsou idempotentní** (`initDb` CREATE TABLE IF NOT EXISTS) — `wheel_leads` vznikne sama.
   Nic ručně.

2. **ENV na venom Vercelu:** musí být `INTERNAL_API_TOKEN` (pro proxy domain-lookup custom domén).
   Pravděpodobně už je (custom domény jiných tenantů fungují). Ověřit. (Lokálně je v `.env.local`,
   který je gitignored — do produkce se NEPŘENÁŠÍ.)

3. **DB (produkční Neon `ep-still-recipe`) — už obsahuje:**
   - tenant `asteralight` (obsah = aktuální živý asteralight.cz, vytažený z astera Neon)
   - `domains` řádek `asteralight.cz → asteralight` (verified=true) — **INERTNÍ**, dokud DNS míří na
     astera-web. Aktivuje se až přesunem domény (bod 5). Nechat.
   - Login: `info@asteralight.cz` / heslo `astera1234` (klient si změní v adminu).
   - Pozn.: tenant vznikl přes onboarding jako `demo`/`free`. Pro ostrý provoz zvážit nastavení
     plánu/subscription.

## CUTOVER asteralight.cz (AŽ PO deployi kódu, samostatný krok)

4. **Nejdřív deploy kódu** a ověřit tenant na venom produkci (přes preview URL / `?` nebo dočasnou
   subdoménu). Bez kódu produkce asteru nevyrenderuje.

5. **Přesun domény ve Vercelu:** `asteralight.cz` je teď na projektu **astera-web**. Doména může
   být jen na jednom projektu → **odebrat z astera-web** a **přidat na projekt venom/webero**.
   DNS už míří na Vercel, takže na Forpsi se NIC nemění, jde jen o přeřazení projektu.
   Po přesunu proxy vyřeší `asteralight.cz → /demo/asteralight` a jazykové cesty `/en/…` fungují.

6. **Vratné:** kdyby něco, přesunout doménu zpět na astera-web. Živý web zůstává nedotčený až do
   bodu 5.

## Ověřeno na localhostu
1:1 render (home + podstránky), 3 jazyky nezávisle, editor se všemi widgety (koule/kolo/karty/
oracle/měsíc), placená část (subscription), custom doména přes Host hlavičku (CS/EN/UA + podstránky),
změna e-mailu/hesla (403/200/401), `tsc` 0 chyb.
