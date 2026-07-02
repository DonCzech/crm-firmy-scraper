# LIVE_EDITOR_STANDARD.md

**Status:** Standard v1 — závazné pro live editor napříč všemi šablonami.
**Datum:** 2026-05-23

---

## 1. Filozofie

**Jeden editor pro všech 90+ šablon.** Editor neví, co edituje — pouze čte schéma sekce a renderuje editable wrappery.

WYSIWYG = uživatel klikne přímo na text/obrázek na živé stránce a edituje in-place. Žádný oddělený admin formulář.

---

## 1.1 🔴 POVINNÁ KOMPATIBILITA SE STUDIEM PRO OBA TYPY TENANTŮ (DONE-blocker)

**Editor (`/studio`) MUSÍ plně fungovat pro OBA typy tenantů — bez výjimek, bez "zatím jen JSON":**

| Aspekt | `json-template` tenant | `full-page-clone` tenant |
|--------|------------------------|--------------------------|
| StudioCanvas | React komponenty z `template.json` | originální HTML/CSS blob v **iframe s viewportní šířkou** (390 / 768 / 1280) — bez iframe se `@media (max-width: …)` neuplatní |
| Responsive preview | Tailwind responsive na container width OK | iframe MUSÍ mít fyzickou šířku rovnou device preset, jinak originální `@media` queries nečtou správný viewport |
| LayersPanel | sekce z `template.json` | sub-vrstvy extrahované z DOM (Header / Hero / Services / Gallery / …), klikací mapa pro selekci editovatelných bloků uvnitř clone HTML |
| Editovatelné prvky | text, image, button, icon, social, hero, gallery, slider, CTA, navbar, footer, FAQ, formuláře, backgroundy | totéž — selekcí DOM uzlu uvnitř iframe (postMessage bridge mezi parent studio ↔ iframe canvas) |
| Save | patch do `content/cs.json` | patch do clone HTML přes `data-edit-id` atributy injektované při loadu, diff ukládán zpět do tenantu |
| `.main__image` typu `min-width: 1440px` | N/A | iframe šířka ≥ 1440 v desktop módu; v mobile/tablet módu scaling + horizontal scroll **uvnitř** iframu, ne v editoru |

### Konkrétní povinnosti při implementaci / opravě editoru
1. **StudioCanvas má dva render módy** — `mode: 'json' | 'clone'` — přepínání podle typu tenantu z DB.
2. **Mode `clone`** renderuje `<iframe src="/preview/<slug>" style="width: {390|768|1280}px">` — viewportní šířka odpovídá zvolenému device presetu.
3. **postMessage bridge** mezi parent studio a iframe canvas pro: hover highlight, click selection, in-place edit, save.
4. **LayersPanel pro clone tenant** generuje sub-vrstvy z DOM (selektory `header`, `section.hero`, `section.services`, `footer` apod.) — strom z `iframe.contentDocument.body.children`.
5. Editor **NESMÍ vyžadovat konverzi clone → JSON** jako prerekvizitu. Clone tenant musí být editovatelný **bez** převodu na JSON šablonu.

### Zákazy
- ❌ "Pro clone tenanty editor zatím nefunguje" — NE, musí.
- ❌ "Smažu clone tenanta a převedu na JSON, aby editor fungoval" — NE, dva oddělení tenanti existují vedle sebe (viz `docs/PEAK_CUT_RESCRAPE_PROMPT.md` sekce "DVA ODDĚLENÉ TENANTI").
- ❌ Mobile preview přes pouhé zúžení containeru bez iframe — `@media` queries clone CSS to nečtou.

### Důsledek pro DONE
Šablona (libovolného typu) **NENÍ DONE**, pokud:
- `/studio?tenant=<slug>` se nenačte
- LayersPanel je prázdný nebo má jen 1 řádek "full-page-clone blob"
- Mobile (390) / tablet (768) / desktop (1280) preset nepřepíná viewportní šířku iframu
- Klik na text/obrázek/button uvnitř clone neotevře in-place edit
- Save → reload → změna nezůstala

---

## 2. Editor primitive (Generic*)

Tři univerzální komponenty, ze kterých se editor skládá:

```tsx
<GenericEditableText  path="home.hero.title" as="h1" />
<GenericEditableImage path="home.hero.image" dimensions="hero" />
<GenericEditableLink  path="home.hero.cta"  />
```

Žádná sekce si nesmí psát vlastní inline-edit logiku. Pokud chybí primitive (např. EditableNumber, EditableSelect), přidává se do core, ne do sekce.

### Kontrakt props

| Prop | Typ | Popis |
|------|-----|-------|
| `path` | `string` | dot-notation cesta do `content` JSON tenanta |
| `as` | `keyof JSX.IntrinsicElements` | volitelně tag (`h1`, `p`, `span`) |
| `placeholder` | `string` | placeholder když pole prázdné |
| `maxLength` | `number` | hard limit; UI počítadlo |
| `richText` | `boolean` | povolí bold/italic/link toolbar |
| `dimensions` | `keyof IMAGE_DIMENSIONS` | (jen Image) klíč z katalogu |

---

## 3. State model

```
┌──────────────────────────────────────────────┐
│ EditorContext (global, per page)             │
│  ├─ baseContent     (čte z template+content) │
│  ├─ overrides       (per tenant, per section)│
│  ├─ dirty           (Set<path>)              │
│  ├─ history         (RingBuffer<Snapshot,30>)│
│  └─ saveStatus      (idle|saving|ok|error)   │
└──────────────────────────────────────────────┘
```

- `baseContent` = JSON ze šablony, nikdy nemutuje.
- `overrides` = patch (JSON Patch RFC 6902) ukládaný do `tenant_section_overrides`.
- **`renderedContent = applyPatch(baseContent, overrides)`** — single source of truth pro render.
- `dirty` = paths čekající na flush.

### Save protokol

1. Edit → `setPathValue(overrides, path, value)` + `dirty.add(path)`.
2. Debounce 2 000 ms (zvýšeno z 1 500, viz audit) → POST `PATCH /api/demo/:slug/sections/:id`.
3. Server: validace Zod proti `sectionSchema`, transakce, audit log, `revision_id` increment.
4. 200 → `dirty.clear()`, `saveStatus = "ok"`, toast.
5. 4xx/5xx → retry s exponential backoff (3×, max 8 s), pak `saveStatus = "error"` + ručně-uložit tlačítko.

### Konflikty (concurrent edit)

- Každý save posílá `If-Match: <revision_id>`.
- 412 Precondition Failed → editor zobrazí modal „Někdo jiný uložil změny. Načíst znovu / Přepsat?".

---

## 4. History (undo/redo)

- Ring buffer 30 snapshotů, klíč = `(sectionId, timestamp)`.
- Trvalý: server periodicky (každé 60 s) snapshotuje do `page_revisions`. Refresh prohlížeče → načtou se z DB poslední 3 revize.
- Klávesy: ⌘Z / ⌘⇧Z. Pouze v admin režimu.

---

## 5. Editable typografie a spacing (per-section)

Tenant smí v rámci sekce override-ovat:

| Override | UI control | Persisted klíč |
|----------|-----------|----------------|
| `textAlign` | left/center/right toolbar | `overrides.style.textAlign` |
| `fontWeight` | bold toggle | `overrides.style.fontWeight` |
| `italic` | italic toggle | `overrides.style.fontStyle` |
| `textColor` | color picker (z theme palette) | `overrides.style.color` |
| `sectionPadding` | tight/normal/airy slider | `overrides.layout.padding` |

**Nelze override-ovat font-family.** To je doménou theme — drží charakter šablony.

---

## 6. Image upload (z editoru)

`GenericEditableImage` → klik → file picker / drop:

```
POST /api/demo/:slug/upload-image
  multipart: file
  → 202 { jobId, previewUrl }
  → poll GET /api/jobs/:jobId
  → 200 { url, webpUrl, srcSet, width, height, lqip }
```

- Optimistický preview (blob URL) okamžitě.
- Server vrátí finální URL → editor swap.
- Detail pipeline viz [IMAGE_PIPELINE_STANDARD.md](./IMAGE_PIPELINE_STANDARD.md).

---

## 7. Rich text (volitelný)

- Pouze pro pole s `richText={true}`.
- Allowed tagy: `b, i, a, br`. Sanitizace přes `DOMPurify` na serveru i klientu.
- Žádný `contentEditable` neuložen jako raw HTML bez sanitizace.

---

## 8. Klávesové zkratky (admin režim)

| Klávesa | Akce |
|---------|------|
| `e` | toggle edit mode |
| `⌘S` | force save |
| `⌘Z` / `⌘⇧Z` | undo/redo |
| `?` | shortcut help overlay |
| `Esc` | exit current field / revert style draft |
| `⌘Enter` | commit style draft (v GenericEditableText toolbaru) |
| `⌘⇧C` | kopírovat styl aktivního textu do clipboard |
| `⌘⇧V` | vložit styl z clipboardu |
| `↑↓←→` | nudge selected overlay element (1px; Shift = 10px) |

---

## 8a. GenericEditableText toolbar — konvence (Sprint 3, 2026-06-29)

- **Toolbar se otvírá fokusem** na contentEditable; zůstává otevřený pokud focus přejde na toolbar (relatedTarget check).
- **Draft state:** snapshot při fokusu → `applyDraft()` pro live preview → `commitStyle()` (Uložit / ⌘Enter) nebo `revertStyle()` (Zrušit / Esc).
- **Computed style cache:** `window.getComputedStyle()` se přečte na `onFocus` a uloží do `computedRef`. Toolbar zobrazuje skutečnou vykreslenou hodnotu (velikost z CSS třídy), i když DB style je `{}`.
- **Font weight:** nikdy `undefined` na Bold toggle. Toggle = `"400"` ↔ `"700"` (přepíše CSS třídu).
- **Font size:** `<input type="number">` (6–320 px). Žádný dropdown presetů.
- **Kopír./Vložit:** module-level clipboard `_styleClipboard` sdílený přes všechny instance.
- **updateStyleLocal:** živý preview na canvasu bez server save. Commit → `updateStyle()` → server.

---

---

## 9. Bezpečnost

- Všechny mutace prochází `requireTenantAdmin` middleware.
- CSRF: `assertSameOrigin` + double-submit cookie token.
- Rate limit: 60 saves/min/tenant.
- Audit log: `(tenantId, userId, sectionId, path, oldValue, newValue, ts)`.

---

## 10. Zakázané vzory

| ❌ | ✅ |
|---|---|
| Sekce má vlastní `onSave` callback | Editor řeší save globálně |
| `dangerouslySetInnerHTML` v editable poli | `DOMPurify.sanitize()` + whitelisted tags |
| In-memory only undo | RingBuffer + server snapshot |
| Save bez `If-Match` | Vždy posílat revision ID |
| Hardcoded „Uložit" v UI | i18n klíč |

---

## 📋 FRONTA ŠABLON & DEMO DATA — POVINNÉ PRO KAŽDOU PŘEVÁDĚNOU ŠABLONU

> Tato sekce je **závazná** pro každého agenta (Sonnet), který převádí šablonu na MASTER ENGINE.

**Fronta:** [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md) — jediný zdroj pravdy, která šablona je další.
- **Vstup:** [/preview](http://localhost:3015/preview) (91 legacy scrapů, `src/app/preview/page.tsx`).
- **Výstup:** [/preview-2](http://localhost:3015/preview-2) — auto-discovery z `src/templates/<slug>/template.json`.
- **Pořadí:** ber **první `TODO`** v tabulce (viz [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md#fronta-šablon-91)). Nepřeskakuj.
- **Kontinuita:** před FÁZÍ A si přečti README.md poslední `DONE` šablony v `src/templates/`, abys navázal na zavedené varianty sdílených sekcí.
- **Prompty Sonneta:** [FAZE_A_PROMPT.md](./FAZE_A_PROMPT.md) (analýza) + [FAZE_B_PROMPT.md](./FAZE_B_PROMPT.md) (implementace) (FÁZE A = analýza, FÁZE B = implementace).

### Demo logo — POVINNÉ
- ❌ NESMÍ zůstat originální logo.
- ✅ Vygeneruj **demo logo** (SVG inline nebo `public/templates/<slug>/logo.svg`) s demo názvem (viz sloupec "Demo název" v queue) a barvami z `theme.json`.

### Demo kontakty — POVINNÉ (jednotná tabulka)
| Pole | Hodnota |
|------|---------|
| Email | `email@demo.cz` (případně `info@demo.cz`, `rezervace@demo.cz`) |
| Telefon | `704 123 456` (formát `+420 704 123 456`); druhé číslo `704 654 321` |
| Adresa | `Ukázková 123, 110 00 Praha 1` |
| Web | `https://demo.cz` |
| Sociální | `facebook.com/demo`, `instagram.com/demo` |
| IČO | `12345678` |
| Provozní doba | `Po–Pá 9:00–18:00, So 9:00–14:00` |

### Grep audit před `DONE`
Šablona není hotová, dokud tyto greppy neprojdou na **0** výsledků v `src/templates/<slug>/`:
- `grep -r '@<originální-doména>' src/templates/<slug>/` → 0
- `grep -r '<reálný-název-firmy>' src/templates/<slug>/` → 0 (vyjma README "Zdrojový web")
- Jakékoliv telefonní číslo `\+?420 ?\d{3} ?\d{3} ?\d{3}` MIMO `704 123 456` / `704 654 321` → 0

Po úspěšné FÁZI B aktualizuj v [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md) řádek `TODO → DONE` + datum a ověř, že se šablona zobrazila v [/preview-2](http://localhost:3015/preview-2).

