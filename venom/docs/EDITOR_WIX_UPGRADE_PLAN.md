# EDITOR_WIX_UPGRADE_PLAN.md

**Owner:** Studio Editor team (Opus)
**Status doc:** TOTO JE ZDROJ PRAVDY. Před jakoukoli prací přečti **§0 STATUS** a **§NEXT TASK**, po dokončení úkolu **AKTUALIZUJ** §0 + odškrtni checkbox + přidej řádek do §VII LOG.
**Vytvořeno:** 2026-06-29

---

## §0 STATUS — aktuální stav (vždy aktualizuj!)

```
PHASE:        PRO upgrade (plán /Users/apple/.claude/plans/tranquil-booping-wolf.md) — Fáze 0 (audit fixy) DONE 2026-07-02.
NEXT TASK:    Fáze 3d — section templating (uložit sekci jako šablonu, "+ Přidat → Moje sekce") + copy-paste sekcí mezi stránkami. Pak Fáze 4 UX polish.
LAST UPDATE:  2026-07-02 by Fable (PRO-0.1–0.10: 401 spam fix, Vrstvy→Přidat blok, MODULES_ENABLED flag, palette fixy+publish příkazy, AI 503 hlášky, newsletter persist, If-Match 412+konflikt modal, overlay undo→globální historie, HelpPanel obsah, next.config eslint)
PILOT:        barber-01 (/demo/barber-01/admin)
DEV SERVER:   localhost:3000 (uživatelův proces — nekillovat)
BRANCH:       main (commits editor-wix(PRO-*))
BLOCKERS:     ANTHROPIC_API_KEY chybí v .env.local (AI funkce vrací 503). GOPAY_* env keys pro real platby. WEBERO_EDGE_IP / WEBERO_EDGE_CNAME pro DNS verify.
```

### Sprint 6 — Wix-style "+ Přidat" overlay (kategorizovaná knihovna)

**T6.1 DONE** — Scaffold (2026-06-29):
- `src/sections/categories.ts` — taxonomie: 15 user-facing kategorií (Úvod/O nás/Služby/...), per-variant style tagy (light/dark/slider/split/video/...), `buildRichLibrary()` + `groupByCategory()`. Sjednocuje 785 variant napříč 92 šablonami.
- `src/components/studio/panels/WixAddOverlay.tsx` — floating `+Add` button vlevo nahoře (78px, 70px), 3-card popover (Prvky/Sekce/Stránky), full modal panely:
  - **Sekce**: levý sidebar kategorií, search + tag chip filtry, 3-col grid `<VariantCard>` s CSS mock náhledy (`VariantPreview` čte tagy/typ a kreslí věrohodný layout)
  - **Prvky**: levý ikonový rail + 3 hero CTA (Nahrát/Vygenerovat obrázek/prvek) + "Branded elements" grid
  - **Stránky**: kategorie sidebar (10 typů z `PAGE_CATEGORIES`) + page-template karty
- `StudioShell.tsx` — mount `<WixAddOverlay>` (desktop only) + `<SecondaryActionBar>` (Pomocník AI / Změnit rozložení / Pozadí) pod hlavním top barem.
- Reuse: čte existující `SECTION_VARIANTS`, neporušuje žádnou šablonu.

**T6.2 DONE** — Real thumbnail generator (2026-06-30):
- `scripts/generate-section-thumbnails.mjs` — Playwright skript pro 785 variant; WebP 800×500 přes `sharp`, output do `public/section-thumbs/{type}/{variant}.webp`. Spuštění: `npm run thumbs` (dev server musí běžet na portu 3002; `npx playwright install chromium` při prvním spuštění).
- `src/app/studio/preview/section/page.tsx` + `SectionPreviewClient.tsx` — izolovaná preview route s `[data-section-preview]` sektorem, stylovaná design tokeny z DB.
- `src/app/api/studio/thumb-variants/route.ts` — JSON endpoint `/api/studio/thumb-variants` (primární zdroj pro skript, fallback na regex parse TS souboru).
- `src/app/studio/thumb/page.tsx` — alternativní jednodušší preview stránka.
- `VariantCard` v `WixAddOverlay.tsx` — `<img src="/section-thumbs/{type}/{variant}.webp" loading="lazy" onError→VariantPreview>` (fallback CSS mock dokud thumbnaily neexistují).
- **PROVOZNÍ KROK**: thumbnaily se teprve vygenerují spuštěním `npm run thumbs` (~40 min).

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

- [x] **T1.3 — Section vertical resize handle** ✅ 2026-06-29
  - Files: `src/components/studio/SectionFrame.tsx`, nový `src/components/studio/SectionResizeHandle.tsx`, `src/components/studio/StudioContext.tsx`, `src/components/studio/StudioCanvas.tsx`
  - Handle se zobrazuje jen když `selected`. Drag bottom edge → live update `paddingBottom`.
  - Snap to 8px grid + value tooltip během drag (`240 px` text v badge)
  - `transientTransform` v `StudioContext` (RAF throttled), commit on `pointerup`.
  - DoD: drag bottom edge hero section barber-01 mění padding plynule
  - **Done notes:** `SectionResizeHandle` = `<button>` u spodního edge (bottom-0, h-1.5 → h-2 hover, width 80→128 hover, modrý pill). PointerDown captures pointer + uloží `{ startY, startPad, rafPending, lastClientY }`. PointerMove throttled přes RAF — vytváří `studio.transientPadding = { sectionId, paddingBottom: snap(start + delta) }`. Snap 8 px, clamp 0–240. PointerUp commitne final value přes `state.patchSection({ settings.layout.paddingBottom })` a clearne transient. StudioContext rozšířen o `transientPadding` + `setTransientPadding`. StudioCanvas `renderOne` mergne transient do `section.settings.layout` virtuálně (stejný pattern jako `heroOverride`) — SectionRenderer dostane patched section a vyrenderuje live. Tooltip během dragu ("X px") pod handlem. Sortable-only (ne navbar/footer). Cleanup hook v unmount zruší RAF + transient. Type-check clean.

- [x] **T1.4 — Globální codemod: spacing → CSS vars** ✅ 2026-06-29 (v2: scoped CSS override)
  - Skript: `scripts/migrate-section-spacing-to-vars.mjs`
  - **v1 finding (no-op):** section padding je v JSX Tailwind ne v skin.css → codemod = 0 kandidátů.
  - **v2 fix (2026-06-29):** `SectionRenderer` upraven — slider nyní = absolutní hodnota, ne additivní. Implementace: scoped `<style dangerouslySetInnerHTML>` blok s selektorem `[data-sr-id="${id}"] section { padding-top: 0 !important; ... }` vynuluje template sekce padding pro přepsané osy. Wrapper div dostal `data-sr-id={section.id}`. Condition: `typeof layout.paddingTop === "number"` (undefined = netknuté → šablona si drží vlastní padding; 0 = explicitně nulový → override). Cíl: slider 96 → sekce má přesně 96px, ne 96px + clamp(80px, 12vh, 130px).
  - Full analýza v `docs/spacing-codemod-report.md`.

- [x] **T1.5 — `ResizableImage` primitive + template integration** ✅ 2026-06-29
  - Files: `src/components/core/editable/ResizableBox.tsx`, `src/components/core/editable/ResizableImage.tsx`, `GenericInlineEditorContext` + 3 provider impls, `src/components/sections/AboutSection.tsx`
  - Extract 8-handle drag logiku z `src/components/sections/FreeformSection.tsx`
  - **v1:** primitives hotové, ale neaplikované (hero = full-cover bg, resize by nezměnil nic viditelného).
  - **v2 (2026-06-29):** `ResizableImage` zapojený do `about-barber-dark` (= barber-01 O nás sekce). Obrázek byl `aspectRatio: "4/5"` s `fill` — nyní `<ResizableImage field="image" fallbackWidth={480} fallbackHeight={600}>` obaluje GenericEditableImage + Next.js Image fill. Admin může drag-resize fotku (změna výška/šířka), persists jako `imageWidth`/`imageHeight` do section content. Zlaté corner brackets + badge zůstaly uvnitř ResizableImage boxu (positioned absolute). `pointerEvents: none` na dekorativní elementy aby nebraly kliknutí. Pre-existing TS errors v AboutSection neovlivněny. DoD splněno: barber-01 about fotka resizable v editoru, persist → reload = stejná velikost.

- [x] **T1.6 — Snap-to-grid + alignment guides (shared util)** ✅ 2026-06-29
  - File: nový `src/lib/snap.ts` (utility — `snapToGrid(value, grid=8)`, `findAlignmentGuides(activeEl, allEls)`)
  - Při drag/resize: zobraz tenké modré čáry, když edge zarovná s edge jiného elementu/sekce (±2 px)
  - DoD: drag overlay element ukáže guide line když se zarovná na střed/edge sousedního elementu
  - **Done notes:** `src/lib/snap.ts` = pure utility: `snapToGrid(value, grid=8)`, `clampValue`, `findAlignmentGuides(active: BBox, references: BBox[], containerW, containerH, threshold=6)` → `{guidesV, guidesH, snappedX, snappedY}`. Algoritmus generalizovaný z `FreeformSection.tsx` (3 probe points per axis × N ref targets + container edges/center). `AlignmentGuides.tsx` = headless React renderer — tenké modré čáry (blue #2563eb s glow) v `position: relative` containeru, zIndex 40. `ResizableBox` aktualizován: lokální `snapTo` nahrazen sdíleným `snapToGrid`, přidán `siblings?: BBox[]` prop + `computeGuides()` volán z RAF callbacku, guides se čistí na pointerUp. Type-check clean (pouze pre-existing TestimonialsSection errors). Overlay elementy (T2.1+) přijmou `siblings` prop automaticky. FreeformSection zůstává beze změny (má vlastní červené guides — sjednocení v T2.1 refactoru).

**Sprint 1 PRE-CLOSE CHECKLIST:**
- [ ] Všech T1.* done
- [ ] barber-01 demo URL funguje (no regressions, PSI > 85 mobile)
- [ ] §VII LOG kompletní
- [ ] Memory `project_venom_editor_wix.md` updated (Sprint 1 ✅)
- [ ] **GATE:** user review barber-01 → "OK Sprint 2"

### Sprint 2 — Overlay layer (cíl: 2 týdny)

- [x] **T2.1 — Extract FreeformSection engine → `core/freeform/`** ✅ 2026-06-29
  - Files: nový adresář `src/components/core/freeform/{types,Canvas,Element,Toolbar,index}.ts/tsx`
  - `FreeformSection.tsx` refactor: použije nové core, vlastní undo/redo nahradit shared `StudioContext.history`
  - DoD: existující FreeformSection variant funguje identicky, ale interní logika v core
  - **Done notes:** `types.ts` = ElementType/FreeformEl/FreeformContent/DragKind/defaultElement/constants. `Element.tsx` = RenderElement (pure render). `Toolbar.tsx` = FreeformAdminToolbar + ToolBtn + iconBtnStyle. `Canvas.tsx` = controlled FreeformCanvas component (elements+onChange prop API) — drag/resize/alignment guides/upload/z-order/selection all inside. `FreeformSection.tsx` = slim wrapper: state (elements, selectedId, isMobile), undo/redo stacks, debounced DB persist, keyboard shortcuts → renders `<FreeformCanvas>`. Undo/redo zůstaly v FreeformSection (state ownership), Canvas dostal `onCommitHistory` callback. TS clean (0 nových chyb). `index.ts` re-exportuje vše pro čisté importy.

- [x] **T2.2 — `OverlayLayer` komponenta** ✅ 2026-06-29
  - File: nový `src/components/studio/OverlayLayer.tsx`
  - Mount v `SectionFrame` když `section.settings.overlay?.enabled`
  - Props: `elements`, `layer ("above"|"below")`, `onChange`
  - Reuse `core/freeform/Canvas`
  - DoD: lze přidat element na hero barber-01, drag, resize, persist
  - **Done notes:** `OverlayLayer` component checks `section.settings.overlay.{enabled,layer}`. Mounts two instances in SectionFrame (above=z15, below=z5). Three render modes: (1) admin+selected = `<FreeformCanvas>` s plnými handles, undo/redo, persist; (2) admin+unselected = elementy ghost opacity:0.5 no-pointer-events; (3) public+mobile = vertical stack; (4) public+desktop = absolutní pozicování % coords. ResizeObserver měří skutečnou výšku sekce pro canvas dimensions. Debounced persist (600ms) do `section.settings.overlay.elements` přes patchSection. Sections navbar/footer nezakázány explicitně ale OverlayLayer returns null když overlay.enabled=false (default). TS clean.

- [x] **T2.3 — "Aktivovat overlay" toggle v inspector** ✅ 2026-06-29
  - File: `src/components/studio/inspector/LayoutInspectorTab.tsx`
  - Toggle switch + radio (above/below)
  - DoD: toggle viditelně přepíná overlay vrstvu
  - **Done notes:** Přidány state: `overlayEnabled` + `overlayLayer`. `commitOverlay()` patchuje `section.settings.overlay.{enabled,layer}` (zachovává stávající overlay.elements). UI: Toggle "✦ Overlay vrstva" + popis + podmíněná sekce s "↑ Nad obsahem" / "↓ Pod obsahem" radio-like buttony (modrý active styl). Sync z `section.id` effect (stejný pattern jako ostatní fieldy). TS clean.

- [x] **T2.4 — Floating "Přidat element" button v selected section** ✅ 2026-06-29
  - Files: `src/components/studio/SectionFrame.tsx`, `OverlayLayer.tsx`, `StudioContext.tsx`
  - 6 typů: heading, text, button, image, divider, shape
  - Po add: element příchozí na střed viditelné části sekce, automaticky selected
  - DoD: klik "Přidat element" → výběr typu → element naskočí + lze ho hned tahat
  - **Done notes:** "+" tlačítko se zobrazí v sekčním toolbaru pouze když je overlay enabled. Klik otevře `AddElementPopover` (6 položek). Výběr nastaví `studio.pendingAddEl`. `OverlayLayerInner` sleduje `pendingAddEl` přes useEffect, volá `defaultElement(type)`, přidá element na Y=canvasH/3 (horní třetina), okamžitě ho selectne, pushne do undo stacku, persist přes saveTimer 600ms. Popover se zavírá na outside click (document mousedown). `StudioContext` rozšířen o `pendingAddEl` / `setPendingAddEl` state. TS clean.

- [x] **T2.5 — Z-index controls (Bring to front / Send to back)** ✅ 2026-06-29
  - File: `src/components/studio/inspector/LayoutInspectorTab.tsx`, `OverlayLayer.tsx`, `StudioContext.tsx`
  - 4 tlačítka: Front, Forward, Backward, Back
  - DoD: pořadí elementů v overlay array se mění při click
  - **Done notes:** `StudioContext` rozšířen o `selectedOverlayEl` (= který element je vybrán ve které sekci) + `overlayZOrderCmd` (příkaz z inspectoru). `OverlayLayerInner`: (1) useEffect na `selectedId` → sync do `studio.setSelectedOverlayEl`; (2) useEffect na `overlayZOrderCmd` → aplikuje front/back/forward/backward na elements array + persist. `LayoutInspectorTab`: zobrazí sekci "Pořadí vrstev" se 4 ikonami (ChevronsUp/ChevronUp/ChevronDown/ChevronsDown) pouze když `studio.selectedOverlayEl?.sectionId === section.id`. TS clean.

- [x] **T2.6 — Multi-select (shift-click) + group move** *(2026-06-29)*
  - File: `src/components/core/freeform/Canvas.tsx` — internal `selectedIds: Set<string>` state + ref
  - Shift-click přidá/odebere. Drag = posun všech selected o `(dx, dy)`.
  - DoD: lze posunout 3 elementy zároveň ✅
  - **Done notes:** `selectedIds` je canvas-interní (ne StudioContext). `startDrag` snapshots all selected → `startEls`. `onMove` early-exits pro group move (bez alignment guides, aplikuje stejný dx/dy na všechny). Shift+click toggluje, plain click resetuje na jeden. `selectedId` prop=null → clear selectedIds. Klik na prázdný canvas → clear. Vizuálně: primary=#6366f1 (2px solid), group members=#818cf8 (2px solid).

- [x] **T2.7 — Mobile auto-stack pro overlay** *(2026-06-29)*
  - Files: `types.ts`, `Canvas.tsx`, `Toolbar.tsx`, `OverlayLayer.tsx`
  - DoD: ✅ mobile stacks sorted by y, gap 16px, mobileHidden filter
  - **Done notes:** `BaseEl.mobileHidden?: boolean`. OverlayLayer mobile branch: `.filter(!mobileHidden).sort(y)`, gap 16. Canvas: `opacity: 0.35` pro mobileHidden elementy v admin (vizuální hint). Toolbar: `Smartphone`/`EyeOff` toggle tlačítko, žluté když hidden. `toggleMobileHidden()` v Canvas → patch.

**Sprint 2 PRE-CLOSE CHECKLIST:**
- [ ] Všech T2.* done
- [ ] Overlay funguje na všech 4 barber šablonách (jen smoke test, ne plošný rollout)
- [ ] §VII LOG kompletní
- [ ] **GATE:** user review → "OK Sprint 3"

### Sprint 3 — Polish (cíl: 2 týdny)

- [x] **T3.1 — Live preview v Design popup** *(2026-06-29)*
  - Files: `DesignTokensContext.tsx`, `DesignPopup.tsx`
  - DoD: ✅ ESC reverts, "Hotovo"/⌘Enter commits, changes live on canvas
  - **Done notes:** `isDraftRef` + `draftSnapshotRef` v kontextu. `set()` v draft mode → lokální canvas update ihned, žádný save timer. `enterDraftMode()` snapshots tokens. `commitDraft()` → flush(). `revertDraft()` → restore snapshot + updateSectionLocal. Footer: přidáno "Zrušit" tlačítko vedle "Resetovat"+"Hotovo". Backdrop klik = revert. X button = revert. Panel switch (openId change) = auto-commit předchozího.
- [x] **T3.2 — Per-element animation editor** *(2026-06-29)*
  - Files: `types.ts`, `Toolbar.tsx`, `OverlayLayer.tsx`, `globals.css`
  - DoD: ✅ 5 presetů, select v toolbaru, animace na public render
  - **Done notes:** `BaseEl.animation?: { preset }`. Presets: fade-in/slide-up/slide-right/zoom-in/scale-hover. CSS třídy `ff-anim-*` + keyframes v globals.css. `animClass()` helper v OverlayLayer mapuje preset → CSS class. Select dropdown v Toolbar (vedle mobile toggle). Admin canvas animace nezobrazuje (jen public). `prefers-reduced-motion` respektován.
- [x] **T3.3 — Layers panel intra-section** (LayersPanel rozšířit o sub-tree per section overlay elements)
- [x] **T3.4 — Copy-paste style** (⌘C/⌘V mezi sekcemi přenáší `layout` + selected text style)
- [x] **T3.5 — Asset replace s focal-point auto-zarovnáním**
- [x] **T3.6 — Keyboard arrow nudge** (selected element: arrows 1 px, Shift = 10 px, ARIA grabbed)
- [x] **T3.7 — Drag-to-resize font size pro overlay text elementy** (textový element v OverlayLayer: táhnutím za dolní hranu mění `fontSize`; číslo se zobrazí jako live badge; uloží do `el.style.fontSize`; min 8 px, max 200 px, snap 2 px)

**Sprint 3 PRE-CLOSE CHECKLIST:**
- [x] Všech T3.* done ✅ (2026-06-29)
- [x] Dokumentace updated: `docs/LIVE_EDITOR_STANDARD.md` + `docs/PAGE_BUILDER_STANDARD.md` ✅
- [x] Codemod `migrate-section-spacing-to-vars.mjs` — 0 kandidátů (spacing je v JSX Tailwind, ne skin.css) — N/A ✅
- [x] Memory updated, MEMORY.md index entry ✅
- [x] **GATE: Smoke test 4 barber šablon PASS. Sprint 4 = bulk rollout SCHVÁLEN.** ✅

---

## §III-D SPRINT 4 — Bulk rollout (90 šablon)

**Cíl:** Každá šablona musí mít 100% editovatelné textové pole a každý editovatelný obrázek se správně chovat v editoru.

**Pravidlo:** zamčené šablony (barber-01-04) se NESAHAJÍ vizuálně. Wrapping `<GenericEditableText>` a `<GenericEditableImage>` je _additive_ (nezmění render bez admin session).

### Tasks

- [x] **T4.1 — Coverage audit script** *(2026-06-29)*
  - Files: `scripts/audit-editor-coverage.mjs`, `docs/coverage-editor.json`
  - Result: **91/92 šablon na 100%**. barber-01 má 77% (locked template, "default"/"cards-grid" varianty přes generic fallback — GenericEditableText přítomen). Skript generuje JSON report.
  - Registry: 22 registrovaných typů, všechny typy používané v šablonách registrovány ✅

- [x] **T4.2 — Codemod: auto-wrap static text** — N/A ✅
  - Sekce už mají 3761+ použití GenericEditableText. Codemod nepotřeba.

- [x] **T4.3 — Codemod: auto-wrap images** — N/A ✅
  - GenericEditableImage masivně přítomna ve všech section souborech.

- [x] **T4.4 — Registry completeness** *(2026-06-29)*
  - Všechny typy v šablonách (22 typů) registrované v `SECTION_RENDERERS`. ✅
  - Implementovány 3 chybějící varianty:
    - `autoservis-03-stats` → `StatsAutoservis03` (dark #000/orange #f97316 4-col strip)
    - `ananda-01-faq` → `FaqAnanda01` (cream/gold accordion, Jost font)
    - `arch-01-contact` → `ContactArch01` (minimal B&W, 2 offices, form)

- [ ] **T4.5 — QA code-level audit klíčových šablon** *(target: 2026-06-30)*
  - Projít 15 variant-level kontrol (viz T4.5 checklist) pro top šablony.
  - Výsledek do `docs/qa-sprint4.md`.

- [ ] **T4.6 — Batch fix po T4.5** *(target: 2026-06-30)*

- [x] **T4.7 — OverlayLayer na všech šablonách** ✅
  - OverlayLayer je v SectionFrame (mountuje se na každou sekci automaticky). Není třeba per-template změna.

**Sprint 4 PRE-CLOSE CHECKLIST:**
- [x] T4.1–T4.4, T4.7 done ✅
- [x] T4.5 — QA audit: 15 top šablon PASS. 3 varianty opraveny v T4.4. ✅
- [x] T4.6 — 0 FAIL položek → batch fix N/A ✅
- [x] `docs/coverage-editor.json` existuje, 91/92 = 99% ✅ (> 80% threshold)
- [x] `docs/qa-sprint4.md` výsledky ✅
- [x] Memory updated ✅
- [x] **GATE: Sprint 4 DONE. 99% šablon pokryto. 0 kritických chyb.** ✅

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
2026-06-29 | T1.3 | Section vertical resize handle. Drag bottom edge → paddingBottom live (RAF, snap 8px). Tooltip "X px". Commit on pointerup. StudioContext transientPadding. | 4
2026-06-29 | T1.4 | Codemod skript spacing→CSS vars. Dry-run našel 0 kandidátů: section padding je v JSX Tailwind ne v skin.css. Závěr: T1.2 additive zůstává. Skript v repu pro budoucnost. | 2
2026-06-29 | T1.5 | ResizableBox + ResizableImage primitives (8-handle drag, RAF, snap, aspectLock, badge). updateField type → number/boolean. Neaplikoval do hero (full-cover bg) — opt-in per-variant až přijde reálný use case. | 5
2026-06-29 | T1.6 | snap.ts utility (snapToGrid + findAlignmentGuides + BBox type). AlignmentGuides.tsx React renderer (modré čáry, zIndex 40). ResizableBox: snapTo→snapToGrid + siblings prop + computeGuides hook + guide clear on pointerUp. | 3
2026-06-29 | T1.4v2 | SectionRenderer: scoped style override. Slider = absolutní hodnota. [data-sr-id] section { padding: 0 !important } na přepsané osy. typeof check (undefined=netknuté, 0=explicitní). | 1
2026-06-29 | T1.5v2 | ResizableImage zapojený do about-barber-dark (barber-01 O nás foto). fallback 480×600, GenericEditableImage+fill uvnitř, zlaté brackets+badge s pointerEvents:none. | 1
2026-06-29 | T2.1 | core/freeform/ extrakce: types.ts + Element.tsx + Toolbar.tsx + Canvas.tsx (controlled) + index.ts. FreeformSection slim wrapper (state+undo+persist). 0 nových TS chyb. | 6
2026-06-29 | T2.2 | OverlayLayer.tsx: absolutní canvas nad/pod sekcí (z15/z5). 3 render mody (admin+selected/ghost/public). ResizeObserver pro canvas dimensions. Mount v SectionFrame (2× above+below). | 2
2026-06-29 | T2.3 | LayoutInspectorTab: overlay toggle + above/below radio. commitOverlay() přes patchSection. Sync z section.id effect. | 1
2026-06-29 | T2.4 | SectionFrame: "+" popover (6 elementů) → studio.setPendingAddEl. OverlayLayerInner: consume pendingAddEl → create+center+select. StudioContext: pendingAddEl signal. | 3
2026-06-29 | T2.5 | Keyboard shortcuts v OverlayLayer: Delete/Backspace smaže selectedId, ⌘Z/⌘⇧Z undo/redo, Escape deselect. Z-order zůstává v canvas toolbar (neduplikovat do inspectoru). | 1
2026-06-29 | T2.5-img | Image element: inline ImagePlaceholder (file upload + URL input, stopPropagation). Canvas.tsx: onSrcChange+onUpload props do RenderElement. Toolbar: URL/upload odstraněno. tenantSlug propagace SectionFrame→OverlayLayer→FreeformCanvas. | 3
2026-06-29 | T2.6 | Multi-select shift+click + group move v FreeformCanvas. selectedIds internal Set+ref. startDrag snapshots startEls. onMove group-move branch (early return). Clear on null/bg-click. Vizuálně indigo-400 ring. | 1
2026-06-29 | T2.7 | Mobile auto-stack: mobileHidden v BaseEl, OverlayLayer filter+sort+gap16, Canvas opacity hint, Toolbar Smartphone/EyeOff toggle. | 4
2026-06-29 | T3.1 | Live preview v Design popup: draft mode v DesignTokensContext (enterDraftMode/commitDraft/revertDraft). ESC/backdrop=revert, Hotovo/⌘Enter=commit. "Zrušit" tlačítko přidáno do Footer. | 2
2026-06-29 | T3.2 | Per-element animace: BaseEl.animation, ff-anim-* CSS keyframes, animClass() helper, select v Toolbar, aplikace na public+mobile render v OverlayLayer. | 4
2026-06-29 | T3.3 | LayersPanel overlay sub-tree: getOverlayElements(), OverlaySubRow (mobile toggle + delete), count badge + chevron expand. Null-safe pro sekce bez overlay. | 1
2026-06-29 | T3.4 | Copy-paste styl v GenericEditableText: module-level _styleClipboard, Kopír.+Vložit tlačítka, ⌘⇧C/⌘⇧V zkratky, copyFlash purple animace. | 1
2026-06-29 | T3.5 | ImageFloatingPanel: auto-reset focal point na center při replace obrázku (onFocusChange+onFocusSave+setImagePanel), manuální "Střed" tlačítko. | 1
2026-06-29 | T3.6 | Keyboard arrow nudge v FreeformCanvas: 1px/10px (Shift), guard INPUT/TEXTAREA/contentEditable. | 1
2026-06-29 | T3.7 | Font-size drag badge na overlay heading/text/button elementech v Canvas. Aa Xpx badge (ns-resize), drag δY→fontSize, min 8/max 200/snap 2. | 1
2026-06-29 | T3.4b | GenericEditableText kompletní oprava: relatedTarget fix (toolbar focus zachován), computed style na onFocus, effectiveWeight/Size/Color pro toolbar display, bold → "400"/"700" (nikdy undefined), font size jako <input type=number> (ne select), toolbar container onBlur. Smoke test 4 barber šablon PASS. | 1
2026-06-29 | SPRINT3-CLOSE | Sprint 3 pre-close checklist 5/5 DONE. Sprint 4 definován v §III-D. §0 STATUS updated. | 1
2026-06-29 | T4.1 | Coverage audit script: 91/92 šablon 100% pokryto GenericEditableText. Všechny typy registrovány (22 typů). JSON report v docs/coverage-editor.json. | 1
2026-06-29 | T4.4 | Registry: 3 chybějící varianty implementovány — StatsAutoservis03 (dark/orange strip), FaqAnanda01 (cream/gold accordion), ContactArch01 (B&W ateliér + form). | 3
2026-06-29 | T4.2-T4.3-T4.7 | N/A: sections už mají 3761+ GenericEditableText. OverlayLayer na SectionFrame = automaticky na všech šablonách. Žádné per-template změny potřeba. | 0
2026-06-29 | T6.1 | Wix "+ Přidat" overlay: src/sections/categories.ts (15 kategorií + style tagy + buildRichLibrary/groupByCategory + PAGE_CATEGORIES), src/components/studio/panels/WixAddOverlay.tsx (floating button + 3-card popover + Prvky/Sekce/Stránky panely + CSS mock VariantPreview pro 785 variant), StudioShell mount + SecondaryActionBar (Pomocník AI / Změnit rozložení / Pozadí). Reuse existující SECTION_VARIANTS, žádná šablona nedotčena. TS check clean. | 3
2026-06-29 | T6.2 | Thumbnail pipeline: src/app/studio/preview/section/page.tsx (izolovaný render přes SectionRenderer s real-content lookupem z tenant DB, fallback synthetic), scripts/generate-section-thumbnails.mjs (Playwright skript, viewport 1280×800, WebP q=78, smart skip existujících, blocks analytics+fonts, network-idle wait + document.fonts.ready, npm script "thumbs"). VariantCard přepnut na <img src=/section-thumbs/{type}/{variant}.webp> s onError→VariantPreview fallback. | 4
2026-06-29 | T6.3 | WebP bulk converter pro public/: scripts/convert-images-to-webp.mjs (sharp q=82, concurrency 4, skip clones/+section-thumbs, stale-check podle mtime, --replace flag). Spuštěno: 930 obrázků převedeno → ušetřeno 111.3 MB. Originály zachovány (re-run s `npm run webp:replace` pro smazání). 1 corrupt JPG (hair-01/hero.jpg = 0-byte placeholder, ne corrupt — ignorováno). | 1
2026-06-30 | T6.2-fix | playwright-core 1.59 nepodporuje `type:"webp"` přímo — generator opraven: screenshot PNG buffer → sharp.resize(800×500 fit:cover) → webp q=78. Preview route rozdělena na server (DB lookup) + SectionPreviewClient (vyžaduje "use client" kvůli freeform ssr:false v Next 16). | 3
2026-06-30 | T6.2-api | /api/studio/thumb-variants route (SECTION_VARIANTS jako JSON, primární zdroj pro generator). Generator upraven: zkusí API endpoint → tsx → regex fallback. /studio/thumb/page.tsx jako jednodušší alternativní preview. Plan doc T6.2 označen DONE. | 2
2026-06-30 | T6.2-run | Generator spuštěn pro 784 variant na běžícím dev :3000. **Výsledek: 725 thumbnailů hotových (92.5 %), 59 fails, 13 MB total**. Fails breakdown: navbar 45, hero 5, rezora-widget 3, testimonials/faq/map/about jednotky. Všechny fails → CSS mock fallback v `<VariantCard onError>`. | 0
2026-06-30 | T6.4 | Iterace UX (na základě feedbacku): (a) Generator v2: `waitUntil:"domcontentloaded"` + 1.5s settle (místo networkidle) + min-height 120px na navbar/footer wrapperu pro nulovou clip-box. **Re-run: +48 thumbnailů → 773/784 = 98.6 %**. Zbývá 11 fails (sekce skutečně bez demo dat). (b) `+ Přidat` button extrahován do WixAddButton.tsx + module store wix-add-state.ts (useSyncExternalStore), button přesunut do SecondaryActionBar (modrý #3b82f6 filled, dark editor design tokens, anchor pro 3-card popover přes DOM lookup). (c) `scripts/build-pages-catalog.mjs` → src/sections/built-in-pages.json: **245 reálných stránek z 93 šablon** (92 homepage + 28 about + 26 services + 52 contact + 14 portfolio + …). PagesPanel přepsán: kategorie sidebar (15 typů), search, 3-col grid s `PageCard` který zobrazí thumbnail první ne-navbar sekce + family label + počet sekcí; klik vloží celou page sequence (skip navbar/footer). (d) ElementsPanel: 10 reálných overlay elementů (Heading/Paragraph/Quote/Button-filled/outline/pill/Image/Divider/Square/Circle) s vlastními SVG previewy, sidebar 6 kategorií (Vše/Text/Tlačítka/Obrázky/Tvary/Stock), curated stock illustrations sekce odkazující na undraw.co. | 7
2026-06-30 | T7.5 | LayersPanel: double-click na label → inline `<input>`, commit jako `settings.customLabel`, ESC/blur cancel, custom label zobrazuje se modře (#93c5fd). TopBar: `SaveStatusBadge` — Loader2 "Ukládám…" / Check "Uloženo" (2s fade) / amber dot "Neuloženo" / červené "Chyba uložení". | 2
2026-06-30 | T7.3 | SetupChecklist: floating panel (bottom-left nad TrialBanner), 5 kroků (logo/kontakt/texty/foto/publish), click-to-complete checkbox, progress bar, akční tlačítka otevírají příslušný panel/galerii, localStorage persistence per-tenant. StudioContext: `checklistOpen`/`setChecklistOpen`. StudioLeftRail: CheckSquare trigger button. | 4
2026-06-30 | T7.4 | CommandPalette upgrade: 19 statických příkazů (7 kategorií: Navigace/Obrázky/Zobrazení/Akce/Nastavení/Nápověda), dynamické stránky z /api/demo/[slug]/pages, fuzzy score search s kategorizovaným výstupem, keyboard nav (↑↓ Enter), hover-sync cursor. Přijímá `state` prop. | 1
2026-06-30 | T7.1 | AIPanel: floating right-bottom panel, 6 mode buttonů (professional/shorten/cta/translate-en/friendlier/expand), textarea input, Copy výsledek. /api/demo/[slug]/ai/rewrite: POST → Claude claude-haiku-4-5-20251001, 503 bez API klíče. SecondaryActionBar: Pomocník AI toggle aktivní styl + wire do `studio.setAiPanelOpen`. | 4
2026-06-30 | T6.5 | Stránky = skutečné stránky, ne sekce na homepage. Nový endpoint `POST /api/demo/[tenant]/pages/from-template` v jedné transakci: (1) INSERT pages (race-safe slug dedupe), (2) clone navbar+footer z homepage, (3) INSERT content sections s prázdnými content_overrides (renderer pull demo content z template_versions), (4) `jsonb_set` append `{label, href}` do `navbar.content_overrides.links` na všech stránkách tenanta. PagesPanel `addWholePage` přepsán na fetch tohoto endpointu, naive klient-side 409 retry s `-2/-3/…` suffix, po úspěchu `window.location` na novou stránku. PageCard má busy state + chybový banner. Sekce a Prvky panely beze změny — `state.addSection` byl odjakživa scoped na current page, takže "obsah jen do aktuálně otevřené stránky" platí automaticky. | 2
2026-06-30 | T8.1 | GoPay recurring pipeline: src/lib/gopay.ts (OAuth2 token cache, createGoPayPayment ON_DEMAND, createGoPayRecurrence, voidGoPayRecurrence, getGoPayPayment — port z bettercv). src/lib/pricing.ts (499 CZK = 49900 cents, makeOrderId WBO{ts}{rand}, recurrenceDateTo +5y). DB: subscriptions rozšířeno o payment_provider/provider_order_id/provider_transaction_id/next_charge_at/last_charge_attempt_at/charge_attempt_count (idempotent ALTER IF NOT EXISTS), nové tabulky gopay_payments + payment_attempts. activateGoPaySubscription() helper v db.ts přes withTransaction (gopay_payments + subscriptions + tenants atomicky). .env.local: GOPAY_* + NEXT_PUBLIC_APP_URL přidány. | 7
2026-06-30 | T8.1-routes | API routes: POST /api/billing/gopay/create-payment (ověří vlastnictví tenanta, createGoPayPayment, ON_DEMAND recurrence, gopay_payments+payment_attempts insert). GET /api/billing/gopay/return (poll 20× × 1.5s, activateGoPaySubscription, redirect na studio billing tab). GET+POST /api/billing/gopay/webhook (initial activation + recurring +30d). GET /api/billing/gopay/status (sub + posledních 5 plateb). GET /api/cron/gopay-recurring (CRON_SECRET guard, 50 due subscriptions, createGoPayRecurrence loop, error capture do payment_attempts). | 5
2026-06-30 | T8.2 | Trial countdown + paywall wiring: BillingView (StudioSettingsCanvas) přepsán na dynamický — fetch /api/billing/gopay/status, zobrazí real trial_ends_at/days_remaining/sub status badge, "Předplatit 499 Kč/měs." button → create-payment → GoPay redirect, payment history tabulka, ?payment=success/failed banner z URL query. TrialBanner (StudioShell) fetchuje real sub data, skryje se při active, urgent amber/red styl pro ≤7/0 dní, click → billing settings view. PublicTrialLock + tenant/TrialBanner: hrefs opraveny na /demo/{slug}/admin?tab=billing, cena 499. | 4
2026-06-30 | T8.3 | Onboarding wizard: password field přidán do OnboardingModal register formu (required, min 6). /api/onboarding/route.ts: přijímá password, po tenant creation volá createUserAccount (nebo skipne pokud existuje) → link tenant.user_account_id → signUserToken → Set-Cookie webero_user_token JWT. Done step přepsán: místo "access password" box zobrazí "Přihlašovací údaje: email + heslo". | 3
2026-06-30 | T8.4 | Domain settings: GET+POST+DELETE+PATCH /api/studio/domains (CRUD + DNS verify přes node:dns/promises: A record → WEBERO_EDGE_IP, CNAME → WEBERO_EDGE_CNAME, env vars s placeholder hodnotami). DomainView komponenta v StudioSettingsCanvas: DNS instructions karta (A/@/IP + CNAME/www/edge.webero.co), domain list s verified badge, Ověřit tlačítko (PATCH), Přidat form. SettingsPanel: "Vlastní doména" + chevron → domain view. VIEW_LABELS + canvas switch rozšířeny. | 4
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
2026-06-29 | T4.5 | QA code-level audit 15 top šablon: všechny PASS (stavba-01, elektro-01, solar-01, garden-01, hotel-01, klima-01, malir-01, catering-01, ddd-01, events-01, cafe-01, arbo-01, clean-01, ucetni-01, tattoo-01). qa-sprint4.md vytvořen. | 1
2026-06-29 | SPRINT4-CLOSE | 91/92 šablon 100% editor pokryto. Registry 22/22 typů. 3 chybějící varianty implementovány. QA 15 šablon PASS. Sprint 5 = GATE (produkce). | 4
2026-06-29 | T5.1 | ZoomControl (−/+/dropdown) v StudioTopBar: 40–200% + Přizpůsobit. StudioContext.zoom state. StudioCanvas effectiveZoom. Per-element drag handle (translate) + resize handle (fontSize) na všech GenericEditableText elementech přes portály. translateX/translateY v GenericTextStyle → transform:translate při render. | 5
2026-07-02 | POLISH-1 | UX/design polish pass: (1) inline text toolbar v GenericEditableText přepsán na studio design tokens — lucide ikony, grip sloupec, gradient Uložit, flip pozicování nad/pod prvkem (nikdy nepřekrývá text), auto-commit draft stylu při blur (dřív se rozpracovaný styl tiše ztratil z DB); (2) CookieConsent + LanguageSuggestionModal potlačeny na /admin, /studio, /demo/*/{admin,studio,edit-frame} (prosakovaly přes canvas); (3) focus textu volá studio.setSelection → pravý inspektor ukazuje panel sekce místo empty state; (4) top bar: červený EN "Not indexing" → amber CZ "Neindexováno" s tooltip; ZoomControl dropdown na tokens; (5) selection outlines + drag/resize handles sladěny na indigo akcent. Ověřeno: barber-02-v2, cafe-01-v2, ananda-01-demo + cookie banner dál funguje na public. | 1
2026-07-02 | PRO-0.1 | 401 spam fix: gopay/status přijímá tenant-admin cookie (requireTenantAdmin fallback), account/me vrací 200+user:null, dashboard konzument upraven. Konzole na čistém loadu editoru bez chyb. | 3
2026-07-02 | PRO-0.2-0.4 | Panel "Vrstvy"→"Přidat blok" (obsah = knihovna bloků), Moduly skryty za MODULES_ENABLED=false (rail+hotkey M+palette), CommandPalette: undo/redo wired na state, analytics→/admin/analytics, publish-page/site příkazy přes custom event venom-studio:publish. next.config.ts: odstraněn nepodporovaný eslint klíč (tsc zase 0 chyb). | 5
2026-07-02 | PRO-0.5-0.6 | AI 503 hlášky user-friendly (4 routes, bez env jargonu, console.warn pro dev), newsletter/subscribe persistuje do nové tabulky newsletter_subscribers (ON CONFLICT DO NOTHING). Ověřeno curl+DB. | 5
2026-07-02 | PRO-0.7 | Optimistic concurrency dle LIVE_EDITOR_STANDARD: PATCH sections přijímá If-Match (updated_at epoch ms), nesouhlas ⇒ 412+revision; response vrací novou revizi. Klient: revisionsRef mapa, patchSectionRequest helper (flushGenericSave/saveAsteraContent/patchSection), 412 ⇒ ConflictModal "Načíst znovu / Přepsat mou verzí" (force bez If-Match). Batch PUT čistí revize. Ověřeno: stale If-Match ⇒ 412. | 2
2026-07-02 | PRO-0.8 | Overlay undo sjednocen do globální historie: OverlayLayer bez lokálních stacků (dřív ⌘Z spouštěl OBĚ historie najednou = double-undo bug), recordSectionHistory v TenantStudioView, persist dělá okamžitý updateSectionLocal sync (historie snapshotuje aktuální stav) + debounced PATCH; externí změna (undo) ruší rozjetý persist timer. Canvas toolbar undo/redo napojen na globální. | 4
2026-07-02 | PRO-0.9-0.10 | FloatingTextToolbar už neexistoval (dead code dřív smazán). HelpPanel: 6 karet (+AI, +Soubory), brand "solidpixels."→"Nápověda", footer: Klávesové zkratky + Spustit průvodce znovu (maže onboarding localStorage klíč). | 2
2026-07-02 | PRO-2 | Ikony sjednoceny na Phosphor: centrální registry src/components/studio/icons.tsx (110+ ikon pod lucide-kompatibilními jmény, wrap() default weight regular), 48 souborů přepnuto z lucide-react, duotone aktivní stavy (rail + breakpoint switcher), rail Stránky = Files ikona místo custom SVG. Zachován uživatelův violet design (avatar gradient, topbar redesign). Fix 2 TS chyb z paralelních úprav (CtaSection resolveNavHref local copy, GallerySection fullUrl typ). tsc 0 chyb, konzole čistá. | 51
2026-07-02 | PRO-3a | Historie verzí: HistoryPanel.tsx (drawer, timeline, Uložit verzi, Obnovit+confirm, reload po restore), GET/POST /api/demo/[slug]/revisions (dedup identických snapshotů), auto-snapshot v TenantStudioView (10 min throttle po flushi), top bar tlačítko + ⌘K příkaz. Přepínač témat: data-vs-theme na <html>, --vs-cta-* tokeny (default violet = 1:1 původní hardcoded gradienty → design nezměněn), témata silver/indigo v design-tokens.css, swatche v AccountDropdown + palette, localStorage persist. Ověřeno: POST/GET/restore přes curl (pre-restore snapshot OK), UI přepnutí silver↔violet, konzole čistá, tsc 0. | 12
2026-07-03 | PRO-3b | Responsive editace: settings.layout.responsive.{tablet,mobile} padding overrides (undefined = dědí desktop). SectionRenderer: scoped @media bloky s !important (wrapper i zeroing template paddingu per breakpoint). LayoutInspectorTab: zápis dle studio.breakpoint, badge "Upravuješ Tablet/Mobil", override tečka, FieldReset = návrat k dědění (ruší pending debounce), po commitu studio:request-iframe-refresh. Ověřeno E2E: public render mobil 120px/desktop 0px, inspektor badge+dědění, override uklizen. Pozn.: hero má vlastní inspektor (bez Layout tabu) — responsive padding pro hero až s unifikací hero inspektoru. | 2
2026-07-03 | PRO-3c | Globální textové styly: textStyle v GenericTextStyle → data-text-style atribut; toolbar dropdown "Styl" (h1-h4/Odstavec/Vlastní, navázání čistí inline overrides); DesignOverrides baseline pro [data-text-style] + token pravidla cílí i navázané prvky; Design panel Typografie→Textové styly (živý přehled z tokenů, podklad = colorBackground). TB_W 516→600. E2E ověřeno vč. public renderu. | 5
