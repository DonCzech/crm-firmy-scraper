# Blog modul — architektura a rollout pro 100+ šablon

> Přepracováno 2026-07-19. Jeden blog engine, automatická adaptace na každou šablonu.

## Princip: One engine, many skins

Blog **není** implementovaný per-šablona. Je to jeden sdílený engine, který se
každé šabloně přizpůsobí přes dvě vrstvy:

1. **Design tokens** — blog čte `designTokens` z homepage sekcí tenanta
   (barvy, fonty, radius). Tím automaticky přebírá vizuální identitu každé
   šablony: tmavý barber zůstane tmavý, elegantní advokát elegantní.
   Tokeny se propagují jako CSS proměnné `--blog-*` (viz `blogCssVars()`).
2. **Skin** — layoutová osobnost navrch tokenů. Tři varianty:
   | Skin | Charakter | Výchozí pro industry |
   |---|---|---|
   | `editorial` | drop caps, tenké linky, serif rytmus | lawyer, ucetni, finance, wellness, clinic, dentist, fyzioterapie, reality |
   | `magazine` | výrazné chipy, image-heavy grid, centrované citáty | barber, fitness, restaurace, cafe, tattoo, kosmetika, nehty, florist, eshop |
   | `minimal` | čistý default | vše ostatní |

   Resolver: `resolveSkin()` v `src/lib/blog/theme.ts` —
   `designTokens.blogSkin` (explicitní volba šablony) → industry mapping → `minimal`.

**Rollout na 100+ šablon = 0 práce per šablona.** Každý tenant s modulem
`blog` v `active_modules` dostane blog automaticky sladěný. Pokud konkrétní
šablona potřebuje jiný skin, než dává industry mapping, stačí do jejích
design tokens přidat `"blogSkin": "magazine" | "editorial" | "minimal"`.

## Struktura souborů

```
src/lib/blog/
  theme.ts      — BlogTheme, skin resolver, CSS proměnné, dark detection (luminance)
  content.ts    — BlogBlock model, word count, reading time, TOC extrakce, video embed URL
  queries.ts    — sdílené SQL (list s filtrem/hledáním, kategorie, related, prev/next)

src/lib/blog/
  demo-posts.ts — 5 univerzálních demo článků (viz níže)

src/components/tenant/
  TenantChrome.tsx — hlavička + patička tenanta kolem libovolné stránky

src/components/blog/          (veřejná část)
  BlogContentRenderer.tsx — server renderer bloků (sanitizace při renderu)
  PostCard.tsx            — karta článku (grid + related)
  BlogStyles.tsx          — skin CSS (drop cap, selection, prose odkazy)
  ReadingProgress.tsx     — fixní progress bar (client)
  TableOfContents.tsx     — sticky TOC se scrollspy (client)
  ShareBar.tsx            — FB/X/LinkedIn/e-mail/copy (client)
  Reveal.tsx              — IntersectionObserver fade-up, respektuje prefers-reduced-motion

src/components/admin/
  BlogAdminDashboard.tsx  — seznam: stats, hledání, filtry, quick akce
  BlogPostEditor.tsx      — editor v2
  blog-editor/
    types.ts       — EditorBlock (uid pro dnd), defaults, labels
    BlockCard.tsx  — sortable karta bloku (dnd-kit)
    ImageField.tsx — upload (drag&drop) + knihovna + URL
    MediaPicker.tsx— modal knihovny médií s uploadem

src/app/demo/[tenantSlug]/blog/
  page.tsx              — výpis (hero, featured, grid, kategorie, hledání, paginace)
  [postSlug]/page.tsx   — detail (TOC, progress, share, prev/next, related, CTA)
  rss.xml/route.ts      — RSS 2.0 feed

src/app/api/demo/[tenantSlug]/blog/
  route.ts                        — GET (q/status/category filtry) + POST
  [postSlug]/route.ts             — GET/PATCH/DELETE (id nebo slug), slug rename
  [postSlug]/duplicate/route.ts   — POST duplikace (-kopie slug, draft)
```

## Obsahové bloky

`text` (safe-HTML inline: strong/em/a…), `heading` (H2/H3), `image`,
`gallery`, `quote` (+cite), `list` (odrážky/číslovaný), `cta`, `divider`,
`video` (YouTube/Vimeo → nocookie embed), `code`.

Sanitizace: na zápisu `sanitizeRichContent` (API), na renderu znovu
`sanitizeRichHtml` (defense in depth). Nové typy bloků se přidávají v
`content.ts` (model) + `BlogContentRenderer.tsx` (render) + `BlockCard.tsx`
(editor) + `types.ts` (default).

## SEO

- **Metadata**: canonical, OG article (publishedTime, authors, tags), Twitter
  cards, per-post `og_image` fallback na `featured_image`, `noindex` per post.
- **JSON-LD**: `Blog` + top-10 `BlogPosting` na výpisu; `BlogPosting`
  (timeRequired, articleSection, keywords) + `BreadcrumbList` na detailu.
- **RSS 2.0**: `/blog/rss.xml`, propojeno přes `alternates.types` na výpisu.
- **Sitemap**: `[tenantSlug]/sitemap.ts` už obsahuje blog index, kategorie
  a posty (noindex posty vynechány).
- **Reading time**: počítá se serverově při create/update (`reading_time_min`).
- **Scheduled publish**: cron `api/cron/publish-scheduled` (beze změny).

## Editor (admin)

- dnd-kit drag & drop řazení bloků (+ šipky, duplikace, insert-after)
- upload obrázků přes `/upload-image` (WebP + responsive varianty) — drag&drop
  do pole, výběr z media knihovny (`/media`), nebo URL
- tags jako chips (Enter/čárka), autosave 4 s (existující posty), Cmd/Ctrl+S,
- SERP preview, počítadla 60/160, OG obrázek, noindex
- slug editovatelný i po vytvoření (PATCH přes numerické id, kolize → 409)

## Hlavička a patička na blogu

Blog výpis i detail se renderují uvnitř `<TenantChrome>`, který načte sekce
domovské stránky tenanta a vyrenderuje z nich singletony `navbar` a `footer`
přes stejný `SectionRenderer` jako `TenantPublicView`. Každá šablona tak má na
blogu vlastní hlavičku/patičku bez jakékoli práce per šablona. Design tokeny se
zrcadlí na wrapper (`--color-*`, `--font-*`), blog si nad ně vrství `--blog-*`.

**Překryvné navbary:** hodně šablon má hlavičku `position: absolute/fixed` nad
heroem. Blog hero nemá, takže by mu obsah zajel pod hlavičku. `TenantChrome`
proto obsahuje inline skript, který navbar změří a doplní `padding-top`. Měří
se *plovoucí* prvek, ne wrapper — ten je při absolutním potomkovi vysoký 0 px.

**Kontrast:** `--blog-on-primary` (viz `onColor()` v `theme.ts`) je čitelná
barva textu na výplni `--blog-primary`. Šablony se světlým primary (zlatá,
písková) měly dřív bílý text na světlém pozadí = nečitelné. Nikde v blogu
nepoužívej natvrdo `text-white` na `--blog-primary`.

**Průhledné navbary (`transparent: true`):** navrženy na tmavý hero pod sebou.
Bez hera se z nich stane šedá šmouha s neviditelným logem. `TenantChrome` proto
vstřikuje do navbar contentu `__solidHeader: true`; `NavbarSection` s ním
startuje ve svém vlastním „scrolled" (solidním) stavu a scroll listener ho
nepřepisuje zpět. Platí pro všechny šablony bez zásahu do jednotlivých variant.

## Lightbox

`Lightbox.tsx` (provider + overlay) a `ClickableImage.tsx` (obálka). Bloky
`image` a `gallery` jsou klikatelné; galerie prochází šipkami / ←→, zavírá Esc.
Overlay jde přes `createPortal` do `<body>` — blog leží ve wrapperech, které
by i `z-9999` uvěznily pod fixed navbarem.

**Výkon hoveru:** `.blog-root img { will-change: transform; translateZ(0) }`
v `BlogStyles`. Bez toho prohlížeč při `scale()` znovu rasterizuje velký
next/image bitmap každý snímek → viditelné sekání. S opravou naměřeno
median 16,7 ms / p95 17,5 ms / 0 dlouhých snímků (čistých 60 fps).
Z téhož důvodu se nepoužívá `transition-all`, ale konkrétní property.

**Reveal odstraněn** (2026-07-19): scroll-reveal držel karty na `opacity: 0`,
a když IntersectionObserver nezafiroval, zůstaly neviditelné natrvalo.

## Univerzální demo články

`src/lib/blog/demo-posts.ts` — 5 článků, které dostane každá šablona. Jsou
záměrně oborově neutrální (řemeslo, dotazy klientů, den v provozu,
udržitelnost, novinky), takže dávají smysl u holiče i u e-shopu. Dohromady
pokrývají **všechny typy bloků** — slouží zároveň jako ukázka možností editoru.
`{{brand}}` se při seedu nahradí jménem podniku.

Obrázky: `public/blog-demo/` (`scripts/fetch-blog-demo-images.mjs`). Motivy jsou
neutrální; při přidávání nových je **vizuálně zkontroluj** — HTTP 200 nevypovídá
nic o tom, co je na fotce.

Seed:

```bash
node scripts/seed-blog-demo.mjs <slug> …   # konkrétní tenanti
node scripts/seed-blog-demo.mjs --all      # všechny *-v2 demo tenanty
node scripts/seed-blog-demo.mjs --all --dry
```

Idempotentní (upsert na `tenant_id, slug`), zapne modul `blog` a jméno podniku
bere z `brand.name` → `business_name` → `navbar.siteName` → slug.

## Blog v menu a patičce

Řízeno **blog modulem, ne editací dat** — `withBlogNavLink()` (`src/lib/blog/
nav-link.ts`) při renderu vloží položku `Blog → /blog` do navbaru i patičky.
Aplikuje se v `TenantPublicView` (homepage/podstránky, jen veřejný render — v
editoru by virtuální odkaz rozbil inline-edit field paths) a v `TenantChrome`
(blog stránky). Idempotentní + dedup: existující Blog odkaz (i kotva `#blog`) se
normalizuje na `/blog`, nepřidává se duplikát. Objeví/zmizí s modulem, 0 editací
dat na 279 tenantech.

**Navbary** čtou `content.links` uniformně → injekce pokrývá skoro vše.
**Patičky jsou nejednotné.** Helper cílí na první *skutečně navigační* pole podle
priority (`NAV_ARRAY_KEYS`) — social/legal/payment pole jsou záměrně vynechána,
aby Blog neskončil v „Sledujte nás". Varianty s vlastní strukturou čtou příznak
`content.__withBlog` a volají v `FooterSection.tsx`:

| tvar | helper |
|---|---|
| plochý seznam (`links`, `navLinks`, `catalogLinks`…) | `appendBlogLink(list, content)` |
| sloupce (`columns`, `navGroups`) | `appendBlogToColumns(cols, content)` |
| řady (`linkRows`) | `appendBlogLink` na první neprázdnou řadu |

**Past:** několik variant dělá `links.slice(0, N)` — připojený Blog by se ořízl.
Tam se `appendBlogLink` volá **až za** slice (viz `FooterBakery02`).

### Pokrytí (ověřeno 2026-07-20, 82 tenantů)

| | |
|---|---|
| blog stránka 200 | 82 / 82 |
| Blog v navbaru | 77 / 82 |
| Blog v patičce | 73 / 82 |

Zbytek **není chyba injekce, ale návrhové omezení**: 6 patiček
(`footer-map-contact`, `barber-04-multi-blurb-legal`, `eshop-20`, `hair-01`,
`hair-03`, `hair-04`) nemá navigační sloupec vůbec — jen kontakt/legal. Přidat
tam Blog znamená vymyslet nový sloupec = zásah do designu, ne jednořádkovka.
Stejně tak navbary `eshop-05/06/12` staví menu z kategorií e-shopu (žádné
`links`) a `hair-04` nemá sekci navbar vůbec.

**Známý pre-existující bug:** 16 patiček renderuje `href="/blog"` bez demo
prefixu, takže v `/demo/<slug>/` odkaz míří mimo tenanta. Týká se **všech**
odkazů těch variant (chybí jim `resolveDemoHref`), nejen Blogu; v produkci na
vlastní doméně je `/blog` správně.

## Blog sekce na homepage

Šablony bez blog sekce dostanou token-driven default variantu `blog-preview`
(fallback v `BlogPreviewSection.tsx`) — dědí barvy/fonty/radius šablony a přes
`/api/demo/<slug>/blog` tahá reálné publikované posty. Vypadá nativně bez práce
per šablona. Šablony s bespoke blog sekcí (`blog-preview/<tpl>-blog` nebo
`about/<tpl>-blog`) se nechávají být.

Seed: `node scripts/seed-blog-homepage.mjs <slug> … | --all [--dry]`. Idempotentní
— přeskočí tenanta, jehož homepage už blog sekci má; jinak vloží sekci těsně
před footer (posune footer order_index +1).

## Testovací tenanti

- `lawyer-01-v2` (editorial skin, 5 článků), `lawyer-01-showcase`
  (industry barber → magazine skin). Admin cookie: `webero_access_<slug>`.

## Ověřeno (2026-07-19)

tsc PASS, eslint 0 errors; E2E na dev :3015 — výpis/detail/RSS 200,
JSON-LD přítomno, drop cap (editorial), YouTube embed, ordered list,
create s relativní upload URL, duplicate, slug rename přes id, delete.
