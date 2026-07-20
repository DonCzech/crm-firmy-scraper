# ZADÁNÍ: AI Builder — „Postavit cokoliv" (Lovable-style onboarding + rozhraní)

> Pro: další Fable session (autonomní běh)
> Od: Fable session 2026-07-19 (AI Designér backend + Studio panel)
> Priorita: hlavní konkurenční výhoda platformy

## ✅ STAV: IMPLEMENTOVÁNO (session 2026-07-19 večer)

Vše níže postaveno a E2E ověřeno (kromě samotného AI volání — Anthropic kredit,
viz Externí blokery):

| Část | Soubory | Ověřeno |
|---|---|---|
| Sdílený chat engine | `src/components/studio/ai/useAiDesignerChat.ts` + `CreditsView.tsx`; `AIPanel.tsx` refaktorován na hook (UI 1:1) | tsc/eslint/vitest ✓ |
| Onboarding 3. dlaždice | `OnboardingModal.tsx`: AI karta (violet gradient, „Novinka") + krok `ai-brief` (textarea + příklady, Cmd+Enter) → registrace → builder | render ✓ |
| Onboarding API | `api/onboarding`: `mode: "builder"` → vynucený `blank-01`, `builderUrl` v odpovědi, bonus `BUILDER_WELCOME_BONUS` (40; celkem 60 kr. = první komplexní build zdarma), `grantBonusCredits()` idempotentní přes note | curl: balance 60 ✓ |
| Builder rozhraní | `/demo/<slug>/builder` (`page.tsx` auth = access cookie, `layout.tsx` noindex) + `src/components/builder/BuilderShell.tsx`: chat 400px + živý iframe náhled (reload JEN iframe), desktop/mobil toggle, quick actions, rotující stavové hlášky, kreditní overlay, Publikovat (go-live API), Otevřít Studio | 200 + auth 307 ✓ |
| První prompt | brief z onboardingu → `sessionStorage webero-builder-brief:<slug>` → builder auto-pošle jako 1. zprávu | logika ✓ |
| GoPay návrat | topup POST bere `returnTo: "studio"\|"builder"`, return route vrací do builderu | kód ✓ |
| Multi-projekt („impérium") | `POST /api/account/tenants` (JWT `webero_user_token`, limit 10/účet) + `tenant-factory` `options.existingUserAccountId`; OnboardingModal detekuje přihlášení (`/api/account/me`) a přeskakuje registraci; dashboard: „Postavit cokoliv s AI" / „Nový web ze šablony" (deep-link `/?onboarding=builder\|templates` → `initialStep`), AI Builder tlačítko u každého projektu | curl: 3 tenanty pod účtem 24 ✓, 401 guard ✓ |

**Zbývá po dobití Anthropic kreditu:** E2E akceptační scénář #2/#3 (půjčovna lodí
→ follow-up e-shop) na živém AI. Kód je po úroveň generace ověřený.

## Cíl

V onboardingu venom (Webero) přibude **třetí volba**. Uživatel si při zakládání vybírá:

1. **Web** — stávající flow (šablony podle oboru)
2. **E-shop** — stávající flow (eshop šablony)
3. **Postavit cokoliv** ⭐ NOVÉ — AI Builder à la https://lovable.dev/: uživatel popíše
   CO CHCE (web, e-shop, aplikaci, prezentaci, „hodinky z vodotrysku") a AI to
   postaví od nuly konverzačně. Žádný výběr šablony, žádné omezení tématem.

## Co UŽ EXISTUJE (nestavěj znovu — použij!)

Kompletní backend „AI Designér" je hotový a E2E ověřený. Session 2026-07-19 postavila:

| Vrstva | Soubor | Co umí |
|---|---|---|
| Operace + validace | `src/lib/ai-designer/operations.ts` | 19 operací: design tokeny, content overrides, settings sekcí, viditelnost, reorder, globální CSS, HTML bloky, **create/delete_page, add/remove/duplicate_section, add/update_custom_section (vlastní HTML+CSS sekce), set_module, enable_shop, create_category, create_product**. Zod = bezpečnostní hranice. |
| Engine | `src/lib/ai-designer/engine.ts` | Claude Opus 4.8, structured outputs (obálka `{op, args}` — POZOR, viz Pasti), auto-klasifikace režimu přes Haiku (`classifyMode`), system prompt pro totální přestavby |
| Aplikace + undo | `src/lib/ai-designer/apply.ts` | Tenant-scoped aplikace, sanitize-html whitelist, plný snapshot/restore (stránky, sekce, moduly, custom kód, smazání AI-vytvořených produktů) |
| Kontext | `src/lib/ai-designer/context.ts` | Serializace webu pro model: stránky+sekce, tokeny, katalog sekcí a variant, moduly, commerce stav |
| Kredity | `src/lib/ai-designer/credits.ts` + `pricing.ts` | Atomický hold/settle/release (nelze přečerpat), balíčky 100/99 Kč, 500/449, 1200/990, ceny 5/12/30 kr. dle režimu, 20 welcome kreditů |
| API | `api/demo/[slug]/ai/designer` (POST/GET), `…/credits` (GET/POST GoPay), `…/undo` (POST) | auth = cookie `webero_access_<slug>` + assertSameOrigin |
| GoPay | `api/billing/ai-credits/return` + větev `ai_credits` v `api/billing/gopay/webhook` | idempotentní připsání kreditů |
| Renderer | `src/components/sections/AiCustomSection.tsx` + registrace `ai-custom` v `src/sections/registry.ts` | AI sekce s vlastním HTML/CSS v toku stránky |
| Studio UI | `src/components/studio/AIPanel.tsx` | chat panel ve Studiu (sessionStorage vlákno, undo, kreditní view) — INSPIRACE pro builder, ale builder je samostatné fullscreen rozhraní |

## Co MÁŠ POSTAVIT

### 1. Onboarding — třetí dlaždice
- `src/components/onboarding/OnboardingModal.tsx` + `api/onboarding/route.ts` — přidej volbu
  „Postavit cokoliv" (AI Builder). Po výběru se tenant založí z **prázdné/blank šablony**
  (minimální: navbar + hero placeholder + footer; pokud blank šablona neexistuje, vytvoř ji
  jako `template_key` `blank-01` — prozkoumat `tenant-factory.ts` a `templates` tabulku)
  a uživatel jde rovnou do AI Builderu (ne do klasického Studia).

### 2. AI Builder rozhraní (`/demo/[tenantSlug]/builder` nebo route ve Studiu)
Fullscreen, kompaktní, Lovable-style:
- **Vlevo chat** (≈380px): konverzace s AI, historie požadavků (GET designer API),
  undo per zpráva, kreditní chip + top-up (vše už umí AIPanel — vytáhni sdílené
  komponenty, neduplikuj)
- **Vpravo živý náhled**: iframe na `/demo/<slug>` (public render tenanta).
  Po aplikaci změn **reload IFRAME, ne celé stránky** (lepší UX než dnešní AIPanel).
  Přepínač desktop/mobil šířky náhledu.
- **Horní lišta**: název projektu, stav („AI staví…"), tlačítko „Otevřít Studio"
  (plynulý přechod do klasického editoru — data jsou tatáž, žádná migrace),
  „Publikovat" (existující go-live flow).
- První zpráva: builder pošle popis od uživatele z onboardingu jako první prompt
  (komplexní režim, 30 kr. — novému tenantovi dej vyšší welcome bonus, ať první
  build projde zdarma; uprav `WELCOME_CREDITS` nebo přidej bonus při volbě builderu).
- Design: využij Studio design tokens (`--vs-*`, violet akcent, Phosphor ikony
  z `components/studio/icons.tsx`). NEPŘEBARVOVAT Studio bez ptaní (závazné pravidlo).

### 3. Iterativní stavba
- Multi-turn: uživatel píše další požadavky, AI přidává/mění (backend to už umí —
  historie se posílá v `history[]`).
- Rychlé akce pod chatem: „Přidej stránku", „Změň barvy", „Udělej z toho e-shop" —
  předvyplní prompt.

## Bezpečnostní mantinely (NEMĚNIT)
- AI NIKDY nemá přístup k souborům/kódu — jen JSON operace validované Zodem,
  aplikované s tenant_id ze session. Vše per-tenant DB vrstvy; šablony zůstávají čisté.
- CSS/HTML přes sanitize-html whitelist + filtry z `custom-code.ts`.
- Kredity: hold PŘED voláním AI (atomický UPDATE s `balance >= cena`), settle/refund.
  Tenhle tok nikdy neobcházej.

## PASTI (ověřeno bolestí)
- **Structured outputs**: víc variant v `anyOf` = „compiled grammar is too large";
  >24 volitelných polí = chyba; složitější ploché schéma = „Schema is too complex".
  Proto obálka `{op, args:string}` + `parseWireOperations()`. NEROZŠIŘUJ schéma —
  novou operaci přidáš jen do Zod unionu + `args` popisu + system promptu.
- Model při totální přestavbě klidně vrátí 60–150 operací — wire limit 200, aplikuje se max 150.
- `complex` režim potřebuje `maxTokens: 32768` (16K nestačilo na plnou přestavbu).
- tsbuildinfo cache umí maskovat TS chyby — `rm tsconfig.tsbuildinfo` před finálním checkem.
- Test tenant: `artist-01-demo`, cookie `webero_access_artist-01-demo=<tenants.access_token z DB>`.
- Dev server: port 3015 (`npm run dev -- --port 3015`), log `.runtime-dev-3015.log`.

## Externí blokery (řeší uživatel, ne ty)
1. **Anthropic API kredit vyčerpán** (klíč z bettercv v `.env.local`) — bez dobití
   účtu console.anthropic.com nejde testovat AI volání. Kód je ověřený po úroveň
   generace; po dobití spusť E2E: prompt „Kompletně předělej web na aerotaxi…" na
   artist-01-demo a ověř create_page + add_custom_section + undo.
2. **GoPay**: ve venom `.env.local` chybí `GOPAY_CLIENT_SECRET` (client_id 115044…,
   sandbox). Bez něj nejde dotestovat reálné dobití kreditů.

## Akceptační kritéria
1. Onboarding nabízí 3 volby; „Postavit cokoliv" založí blank tenant a otevře builder.
2. V builderu: „Postav mi web pro půjčovnu lodí s ceníkem a rezervačním CTA" →
   do ~5 min stojí web (tokeny, sekce s obsahem, případně custom sekce), náhled se obnoví.
3. Follow-up „přidej stránku O nás a udělej z toho e-shop se 3 loděmi" → funguje.
4. Undo vrací celé kroky. Kredity sedí (ledger bez visících holdů).
5. `npx tsc --noEmit`, eslint, vitest čisté; Studio i public render nezregresovaly.
