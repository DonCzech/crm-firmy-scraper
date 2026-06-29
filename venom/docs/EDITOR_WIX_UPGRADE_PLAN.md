# EDITOR_WIX_UPGRADE_PLAN.md

**Owner:** Studio Editor team (Opus)
**Status doc:** TOTO JE ZDROJ PRAVDY. Před jakoukoli prací přečti **§0 STATUS** a **§NEXT TASK**, po dokončení úkolu **AKTUALIZUJ** §0 + odškrtni checkbox + přidej řádek do §VII LOG.
**Vytvořeno:** 2026-06-29

---

## §0 STATUS — aktuální stav (vždy aktualizuj!)

```
PHASE:        Sprint 1 — Quick wins
NEXT TASK:    T1.3 — Section vertical resize handle (drag bottom edge → padding)
LAST UPDATE:  2026-06-29 by Opus (T1.2 done: padding slidery v Layout inspectoru)
PILOT:        barber-01 (demo tenant: barber-01-v2, slug viz DB)
DEV SERVER:   localhost:3002 (next dev --webpack)
BRANCH:       (žádný explicitní — pracuje se přímo, commits chronologicky)
BLOCKERS:     žádné
```

**Pravidlo:** každý task = jeden commit. Commit message formát:
`editor-wix(T<sprint>.<num>): <stručný popis>` — např. `editor-wix(T1.1): drag handle na SectionFrame`.

---

## §I CÍL & STRATEGIE

Webero Studio dostat na Wix-level UX **bez ztráty designové integrity 90 luxe šablon**. Strategie = **hybrid**:

1. Opinionated sekce zůstávají (variant + content schema).
2. Přidává se **OverlayLayer** = volně poziciovaná vrstva nad/pod sekcí (text/heading/button/image/divider/shape s drag + resize).
3. Plynulé slidery místo presetů.
4. Drag-resize handles na obrázcích.
5. DnD reorder sekcí (knihovna `@dnd-kit` už v package.json).
6. Reuse existující [`FreeformSection.tsx`](../src/components/sections/FreeformSection.tsx) — extract její drag/resize engine do `core/freeform/`.

**Co se NEDĚLÁ:** nekopíruj Wix celý. Nepiš editor od nuly. Nesahej do zamčených šablon (barber-01-04) ve smyslu vizuálního redesignu — ALE: změna spacing CSS na CSS vars je _additive_ a povolená (nemění výsledek).

---

## §II ARCHITEKTURA (závazné)

### Datový model (rozšíření `tenant_sections.settings`):
```jsonc
{
  "content":   { /* existující */ },
  "layout": {
    "spacing":         "normal",      // deprecate v UI, zachovat read pro back-compat
    "paddingTop":      96,            // NEW px (slider 0–240)
    "paddingBottom":   96,            // NEW
    "paddingX":        24,            // NEW (slider 0–80)
    "backgroundColor": "#…",
    "anchorId":        "…"
  },
  "overlay": {                        // NEW
    "enabled": false,
    "layer":   "above",               // "above" | "below" varianty
    "elements": [ /* FreeformSection element shape */ ]
  },
  "hiddenOn": ["mobile"]
}
```

### Komponentní vrstvy (cílový stav):
```
SectionFrame
 ├─ OverlayLayer "below"            (new, opt-in)
 ├─ <VariantComponent>              (existující)
 ├─ OverlayLayer "above"            (new, opt-in)
 └─ SectionResizeHandle (bottom)    (new)

core/freeform/   ← extract z FreeformSection.tsx
  Canvas.tsx
  Element.tsx
  ResizableBox.tsx                  (8 handles, snap-to-grid)
  useSelection.ts
  useSnapGuides.ts

core/editable/   ← rozšíření existujícího
  ResizableImage.tsx                (new, wrapper kolem GenericEditableImage)
```

### CSS contract pro šablony:
- Sekce čte `var(--section-pt, <default>)` pro padding-top, `--section-pb`, `--section-px`.
- `SectionRenderer` (nebo `SectionFrame`) injektuje `style="--section-pt: 120px;..."`.
- `position: relative` na top-level `<section>` (kvůli overlay).
- Z-index hierarchie: bg=0, content=10, overlay-below=5, overlay-above=15, fixed-ui=100.

### Variant meta (rozšíření):
```ts
// per variant: meta.ts
export const meta = {
  resizableImages:    ["hero.bgImage"],
  overlayHostBlocks:  ["hero-content"],
  layoutTokens: { paddingTop:[0,240], paddingX:[0,80] }
};
```

---

## §III SPRINTY & TASKS

> Každý task má `[ ]` checkbox. Když dokončen → `[x]` + doplň datum + iniciály do §VII LOG.
> Pokud task vygeneruje neočekávané subtasky, přidej je inline jako `[ ] T1.1a — ...` ne vytváření nového sprintu.

### Sprint 1 — Quick wins (cíl: 1 týden, pilot = barber-01)

- [x] **T1.1 — Drag handle na `SectionFrame` (DnD-kit sortable)** ✅ 2026-06-29
  - Files: `src/components/studio/StudioCanvas.tsx`, `src/components/studio/SectionFrame.tsx`
  - Knihovny: `@dnd-kit/core`, `@dnd-kit/sortable` (už v package.json)
  - DoD: na barber-01 lze drag sekci (mimo navbar/footer) na nové místo, persist přes `state.reorderSections(ids)`. Funguje na desktop i tablet preset. Mobile preset = arrows fallback.
  - Pozn.: zachovej současné ↑↓ tlačítka jako accessibility fallback.
  - **Done notes:** přidán `SectionDragProps` typ s `DraggableAttributes`/`SyntheticListenerMap` z dnd-kit; `SortableSectionFrame` wrapper v `StudioCanvas` volá `useSortable` a forwarduje props do `SectionFrame`; grip handle (GripVertical) vlevo nahoře vedle label badge, `pointer-events-auto`, `cursor-grab`. Reorder logika ekvivalentní `LayersPanel` (middle = non-navbar/footer; navbar prepend + footer append). Mobile breakpoint = `sortableEnabled=false` ⇒ grip skrytý, šipky v toolbar zůstávají. Activation distance 6 px (víc než LayersPanel 4 px, aby krátký click neaktivoval drag na velkých section divech). `renderSectionList` helper sjednocuje obě breakpoint větve. Pattern: `useSortable({id: section.id})` → `setNodeRef` na vnější `<div>`, `CSS.Transform.toString(transform)` v inline style, `isDragging` ⇒ `opacity-40`. Type-check clean (zbývající errors v TestimonialsSection jsou preexisting).

- [x] **T1.2 — Padding/margin slidery (replace tight/normal/airy presets)** ✅ 2026-06-29
  - Files: `src/components/studio/inspector/LayoutInspectorTab.tsx`, `src/components/tenant/SectionRenderer.tsx`, `src/components/studio/SectionFrame.tsx`
  - 3× number input + range slider (paddingTop/Bottom 0–240 px krok 4, paddingX 0–80 px krok 4)
  - CSS var injekce: `style={{ "--section-pt": `${pt}px`, ... }}` na wrapper `<section>` nebo `[data-section-id]`
  - Zachovat read `spacing: tight|normal|airy` jako fallback (mapping: tight=48, normal=96, airy=144)
  - DoD: slider mění padding live (debounce commit 250 ms ne 2000 — UX), default values respektují variant `meta.layoutTokens` range
  - **Done notes:** `PaddingSlider` helper komponenta (range + number input + reset icon), debounce 250 ms coalesced přes `pendingPatch` ref (rychlé multi-slider edits se mergují do 1 commit). Padding interpretován jako **extra outer spacing** kolem sekce (přidává se k internímu paddingu šablony) — vidí se hned bez T1.4 codemodu. **Single source of truth** = `SectionRenderer` wrapper div (funguje shodně pro studio canvas i public render); padding logika odstraněna z `SectionFrame` (zůstal jen dragStyle). CSS vars `--section-pt/pb/px` publikovány na wrapper i když T1.4 codemod ještě templates nepřemigroval (forward-compat). Legacy `spacing` preset je read-only fallback (mapping zachován v komentu, UI ho už nepíše). `backgroundColor` z `layout` byl předtím dead feature (nikde nečtený) — teď opravdu aplikuje barvu na wrapper. Type-check clean.

- [x] **T1.2a — Universal per-field reset (Layout + Style)** ✅ 2026-06-29
  - Files: `src/components/studio/inspector/FieldReset.tsx` (new), `src/components/studio/inspector/LayoutInspectorTab.tsx`, `src/components/studio/inspector/StyleInspectorTab.tsx`
  - Sdílená `<FieldReset>` komponenta (RotateCcw icon, disabled když není modified).
  - Layout inspector: reset u každého controlu — 3 padding slidery (už z T1.2), bg color, anchor ID, hide-on-device toggles.
  - Style inspector: reset u barvy, velikosti, tloušťky, formátování (italic/underline), zarovnání.
  - Content inspector: skipnut — má section-level "X úprav vs šablona | Reset" banner; per-field by vyžadoval per-path reset API + default value tracking (větší refactor, mimo scope).
  - Originally requested by user mid-T1.2 verification: "do všech sekcí které se dají editovat přidej tlačítko reset". Důvod: safety net pokud klient něco posere, vrátí jen to konkrétní pole na default šablony bez ztráty ostatních úprav.

- [ ] **T1.3 — Section vertical resize handle**
  - Files: `src/components/studio/SectionFrame.tsx`, nový `src/components/studio/SectionResizeHandle.tsx`
  - Handle se zobrazuje jen když `selected`. Drag bottom edge → live update `paddingBottom`.
  - Snap to 8px grid + value tooltip během drag (`240 px` text v badge)
  - `transientTransform` v `StudioContext` (RAF throttled), commit on `pointerup`.
  - DoD: drag bottom edge hero section barber-01 mění padding plynule

- [ ] **T1.4 — Globální codemod: spacing → CSS vars**
  - Skript: `scripts/migrate-section-spacing-to-vars.mjs`
  - Pro každou variant v `src/sections/*/variants/*/skin.css` (i orphan skin.css v `src/templates/<key>/`) detekovat `padding: <Y> <X>` na `section`/`.section` a nahradit `padding: var(--section-pt, <Y>) var(--section-px, <X>) var(--section-pb, <Y>)`.
  - DRY-RUN flag (`--dry`) povinný. Print diff. Bez `--write` neuložit.
  - DoD: na barber-01 (zamčená!) script proběhne v dry mode bez chyb. Output ulož do `docs/spacing-codemod-report.md`. Až user OK → spustit s `--write` na non-locked šablonách.

- [ ] **T1.5 — `ResizableImage` primitive (extract z FreeformSection)**
  - Files: nový `src/components/core/editable/ResizableBox.tsx`, nový `src/components/core/editable/ResizableImage.tsx`
  - Extract 8-handle drag logiku z `src/components/sections/FreeformSection.tsx`
  - `<ResizableImage path="hero.bgImage" resizable>` ukládá width/height do content path
  - Plug do `GenericEditableImage` přes prop `resizable={true}` (opt-in)
  - DoD: hero obrázek na barber-01 lze v editoru drag-resize, persist do DB, refresh stránky = stejná velikost

- [ ] **T1.6 — Snap-to-grid + alignment guides (shared util)**
  - File: nový `src/lib/snap.ts` (utility — `snapToGrid(value, grid=8)`, `findAlignmentGuides(activeEl, allEls)`)
  - Při drag/resize: zobraz tenké modré čáry, když edge zarovná s edge jiného elementu/sekce (±2 px)
  - DoD: drag overlay element ukáže guide line když se zarovná na střed/edge sousedního elementu

**Sprint 1 PRE-CLOSE CHECKLIST:**
- [ ] Všech T1.* done
- [ ] barber-01 demo URL funguje (no regressions, PSI > 85 mobile)
- [ ] §VII LOG kompletní
- [ ] Memory `project_venom_editor_wix.md` updated (Sprint 1 ✅)
- [ ] **GATE:** user review barber-01 → "OK Sprint 2"

### Sprint 2 — Overlay layer (cíl: 2 týdny)

- [ ] **T2.1 — Extract FreeformSection engine → `core/freeform/`**
  - Files: nový adresář `src/components/core/freeform/{Canvas,Element,ResizableBox,useSelection,useSnapGuides}.tsx`
  - `FreeformSection.tsx` refactor: použije nové core, vlastní undo/redo nahradit shared `StudioContext.history`
  - DoD: existující FreeformSection variant funguje identicky, ale interní logika v core

- [ ] **T2.2 — `OverlayLayer` komponenta**
  - File: nový `src/components/studio/OverlayLayer.tsx`
  - Mount v `SectionFrame` když `section.settings.overlay?.enabled`
  - Props: `elements`, `layer ("above"|"below")`, `onChange`
  - Reuse `core/freeform/Canvas`
  - DoD: lze přidat element na hero barber-01, drag, resize, persist

- [ ] **T2.3 — "Aktivovat overlay" toggle v inspector**
  - File: `src/components/studio/inspector/LayoutInspectorTab.tsx`
  - Toggle switch + radio (above/below)
  - DoD: toggle viditelně přepíná overlay vrstvu

- [ ] **T2.4 — Floating "Přidat element" button v selected section**
  - Files: `src/components/studio/SectionFrame.tsx` (popover trigger), reuse element library z FreeformSection
  - 6 typů: heading, text, button, image, divider, shape
  - Po add: element příchozí na střed viditelné části sekce, automaticky selected
  - DoD: klik "Přidat element" → výběr typu → element naskočí + lze ho hned tahat

- [ ] **T2.5 — Z-index controls (Bring to front / Send to back)**
  - File: `src/components/studio/inspector/LayoutInspectorTab.tsx` (extra tab "Vrstva" když selected element ≠ section)
  - 4 tlačítka: Front, Forward, Backward, Back
  - DoD: pořadí elementů v overlay array se mění při click

- [ ] **T2.6 — Multi-select (shift-click) + group move**
  - File: `src/components/studio/StudioContext.tsx` (rozšíření `selectedElementIds: Set<string>`)
  - Shift-click přidá/odebere. Drag = posun všech selected o `(dx, dy)`.
  - Marquee select (drag prázdné místo) — volitelné
  - DoD: lze posunout 3 elementy zároveň

- [ ] **T2.7 — Mobile auto-stack pro overlay**
  - File: `src/components/studio/OverlayLayer.tsx`
  - <768 px: elementy seřaď podle `y` ASC → vertical flow flex column, gap 16 px
  - Per-element override `mobileHidden?: boolean`
  - DoD: barber-01 hero s overlay vypadá rozumně na mobile 390

**Sprint 2 PRE-CLOSE CHECKLIST:**
- [ ] Všech T2.* done
- [ ] Overlay funguje na všech 4 barber šablonách (jen smoke test, ne plošný rollout)
- [ ] §VII LOG kompletní
- [ ] **GATE:** user review → "OK Sprint 3"

### Sprint 3 — Polish (cíl: 2 týdny)

- [ ] **T3.1 — Live preview v Design popup** (controlled state, ESC = revert, Enter = commit)
- [ ] **T3.2 — Per-element animation editor** (presets: fade-in, slide-up, parallax, scale-on-hover; persist v `element.animation`)
- [ ] **T3.3 — Layers panel intra-section** (LayersPanel rozšířit o sub-tree per section overlay elements)
- [ ] **T3.4 — Copy-paste style** (⌘C/⌘V mezi sekcemi přenáší `layout` + selected text style)
- [ ] **T3.5 — Asset replace s focal-point auto-zarovnáním**
- [ ] **T3.6 — Keyboard arrow nudge** (selected element: arrows 1 px, Shift = 10 px, ARIA grabbed)

**Sprint 3 PRE-CLOSE CHECKLIST:**
- [ ] Všech T3.* done
- [ ] Dokumentace updated: `docs/LIVE_EDITOR_STANDARD.md` + `docs/PAGE_BUILDER_STANDARD.md`
- [ ] Codemod `migrate-section-spacing-to-vars.mjs` puštěn `--write` na všechny non-locked šablony
- [ ] Memory updated, MEMORY.md index entry
- [ ] **GATE:** decision o plošném rolloutu na 90 šablon (Sprint 4 = bulk migration)

---

## §IV PILOT — barber-01 (proč a jak)

- **Proč pilot:** zamčená kvalita, dobře pokryté variant schema, má hero+services+gallery+team+contact = široký test surface.
- **Demo URL:** zjisti přes `SELECT slug FROM tenants WHERE slug LIKE 'barber-01%';` (typicky `barber-01-v2`).
- **NESAHEJ** do vizuálního designu — žádné nové barvy/fonty/layout. Pouze:
  - CSS spacing → vars (additive)
  - Hero bgImage → wrapnout do `<ResizableImage>` (opt-in přes meta)
  - Top section `position: relative` (zkontroluj, většinou už je)
- **Smoke test po každém tasku:** otevři `/demo/barber-01-v2/studio`, vyber hero, vyzkoušej feature, refresh, zkontroluj že změna persistovala.

---

## §V GOTCHAS & KONVENCE

- **Next.js 16.2** — viz `AGENTS.md`: NE training-data API. Read `node_modules/next/dist/docs/` před novými routes.
- **Anti-flash** (z barber-03): NIKDY `*-reveal` opacity:0 na `<section>` wrapper. Pouze inner elements.
- **DB save pattern:** UPDATE `tenant_sections` SET `settings`. Optimistic concurrency: `If-Match: <revision_id>`, 412 → reload modal.
- **Debounce:**
  - text edits = 2000 ms (per LIVE_EDITOR_STANDARD)
  - slider/drag commits = 250 ms (UX feels snappy, ale ne každý frame)
- **Hover CSS** patří do `src/app/globals.css`, NE do `src/templates/<key>/skin.css` (orphan).
- **Hotové šablony:** barber-01/02/03/04 (+ všechny v MEMORY.md jako DONE ✅) — vizuálně NESAHAT. Spacing CSS var refactor je OK (additive).
- **Mobile-first safety:** overlay overlay MUSÍ auto-stackovat pod 768 px. Bez výjimek.
- **Subpage gotcha** (z 2026-06-28): subpage routy musí volat `resolveAllSections`. Pokud měníš SectionRenderer, otestuj i `/onas`, `/galerie`, `/kontakt` na barber-01.

---

## §VI ROZHODOVACÍ STROM (když narazíš)

1. **"Mám sahat do zamčené šablony?"** → jen pokud změna je _additive_ (CSS vars, opt-in props). Vizuální změny = NE.
2. **"Mám refactorovat FreeformSection nebo psát novou komponentu?"** → v T2.1 refactor. Předtím neházej, dokud overlay nepotřebuje shared core.
3. **"Mám task rozdělit?"** → ano, pokud > 1 den práce. Přidej subtasky inline (T1.1a, T1.1b…) ne nový sprint.
4. **"User mi neodpovídá, mám pokračovat?"** → pokud task je v sprintu a nemá `GATE` flag, ano. Pokud `GATE` (konec sprintu) → ZASTAV, čekej.
5. **"Pre-close checklist mi vyhodí FAIL"** → fix nebo přidej blocker do §0 STATUS. Neřeš "to už doladím později".

---

## §VII LOG (append-only — po každém dokončeném tasku)

Formát: `YYYY-MM-DD | T<X.Y> | <stručný popis výsledku> | <files touched count>`

```
2026-06-29 | INIT | Plán vytvořen, memory pointer + trigger prompt zaregistrován | 3
2026-06-29 | T1.1 | Drag handle na SectionFrame (DnD-kit sortable). SortableSectionFrame wrapper + grip vlevo nahoře. Mobile breakpoint = arrows fallback. Type-check clean. | 2
2026-06-29 | T1.1-fix | Grip z-index 10→60 (nad fixed navbar z-50), vyseparován z label flex containeru. Fix: hero v barber-01 šel uchopit. | 1
2026-06-29 | T1.2 | Padding slidery v Layout inspectoru (Top/Bottom/X). PaddingSlider helper + 250ms debounce coalesced commits. Layout aplikován v SectionRenderer (single source of truth pro studio+public). CSS vars --section-pt/pb/px publikovány. | 3
2026-06-29 | T1.2a | Universal per-field reset (FieldReset komponenta) v Layout + Style inspectorech. Safety net pro klienty. | 3
```

---

## §VIII TRIGGER PROMPT (pro nové Opus okno)

User do nového okna napíše buď:

**Krátká verze:**
```
/editor-wix-pokracuj
```
(pokud máš slash command — viz §IX) **NEBO**:

**Long-form verze (jistota):**
```
Pokračuj v Editor Wix upgrade pro Webero (projekt /Users/apple/DEV/CRM/venom).
Přečti docs/EDITOR_WIX_UPGRADE_PLAN.md, najdi §0 STATUS + NEXT TASK.
Pracuj sekce-by-sekce: po dokončení tasku commitni, aktualizuj §0 + odškrtni checkbox + přidej řádek do §VII LOG.
Když narazíš na GATE (konec sprintu) — ZASTAV a čekej na user OK.
Dodržuj konvence v §V GOTCHAS a §II ARCHITEKTURA.
```

Opus pak:
1. Read `docs/EDITOR_WIX_UPGRADE_PLAN.md` → §0 STATUS → najde NEXT TASK
2. Read memory `project_venom_editor_wix.md` pro 10-bod summary
3. Implementuje NEXT TASK
4. Update §0 + §VII LOG + checkbox
5. Pokud Sprint GATE → ZASTAV
6. Jinak → pokračuj na další task (nebo zastav podle user OK rule)

---

## §IX VOLITELNÉ — slash command `/editor-wix-pokracuj`

Pokud chceš ještě kratší trigger, vytvoř `.claude/commands/editor-wix-pokracuj.md` s obsahem rovnýn long-form prompt výše. Pak stačí napsat `/editor-wix-pokracuj`. (Tohle si user může udělat sám později — není to blocker.)
