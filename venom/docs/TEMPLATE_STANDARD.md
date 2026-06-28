# TEMPLATE_STANDARD.md

**Status:** Standard v1 — závazné pro všechny budoucí šablony (90+).
**Datum:** 2026-05-23
**Vychází z:** auditu cafe-01 (Costa Coffee master reference).

---

## 1. Filozofie

Šablona = **deklarativní JSON manifest** + **theme tokens** + **odkazy na shared sekce**.
Šablona NENÍ TypeScript soubor s 300 řádky komponentového kódu.

> **Zlaté pravidlo:** Engine, editor a page builder jsou sdílené. Theme, copy, struktura sekcí a vizuální skiny jsou unikátní per šablona.

Visual diverzita šablon vzniká skrz:
1. **Theme tokens** (barvy, fonty, radius, spacing personality)
2. **Variant výběr** sekcí (např. `hero:cafe-wave` vs `hero:luxury-dark`)
3. **Section skiny** (CSS layer specifický pro variantu)
4. **Sekce-specifická typografie/animace** vázaná na variantu

Tím dosáhneme: **technická uniformita ↔ vizuální unikátnost**.

---

## 2. Struktura souborů

```
src/templates/
  cafe-01/
    template.json        # manifest (povinný)
    theme.json           # design tokens (povinný)
    skin.css             # variant skiny (volitelný; scoped via [data-template])
    preview.png          # 1200×800 thumbnail pro picker
    README.md            # autor, licence, zdrojový web, changelog
  cafe-02/
    template.json
    theme.json
    skin.css
  barber-01/
    ...
```

**Žádné `.ts` šablonové soubory.** Pokud šablona potřebuje custom logiku, znamená to nedostatek v core enginu — řeší se přidáním variant nebo PR proti enginu, ne soukromým TS souborem v šabloně.

---

## 3. `template.json` — manifest

```json
{
  "$schema": "../../schemas/template.schema.json",
  "key": "cafe-01",
  "name": "Cafe — Vlna kávy",
  "industry": "cafe",
  "version": "1.0.0",
  "baseTemplate": null,
  "i18n": {
    "default": "cs",
    "supported": ["cs", "en", "sk"]
  },
  "pages": [
    {
      "slug": "home",
      "isHomepage": true,
      "titleKey": "pages.home.title",
      "sections": [
        { "type": "navbar", "variant": "cafe-wave", "contentRef": "navbar" },
        { "type": "hero", "variant": "cafe-wave", "contentRef": "home.hero" },
        { "type": "services", "variant": "cards-grid", "contentRef": "home.services" },
        { "type": "blog-preview", "variant": "cafe-filled-cards", "contentRef": "home.blog" },
        { "type": "cta", "variant": "cafe-magazine", "contentRef": "home.cta" },
        { "type": "footer", "variant": "cafe-wave", "contentRef": "footer" }
      ]
    },
    { "slug": "locations", "titleKey": "pages.locations.title", "sections": [...] },
    { "slug": "menu", "titleKey": "pages.menu.title", "sections": [...] }
  ],
  "content": {
    "default": "./content/cs.json",
    "en": "./content/en.json",
    "sk": "./content/sk.json"
  },
  "images": {
    "manifest": "./images/manifest.json"
  }
}
```

### Pravidla
- `key`: kebab-case, formát `<industry>-NN`, globálně unikátní.
- `version`: SemVer. Breaking change v sekcích/variantech → major bump.
- `baseTemplate`: pokud šablona dědí (`cafe-02` extends `cafe-01`), enumerují se v manifestu jen overrides.
- **Slugy stránek v manifestu jsou stabilní v angličtině** (`locations`, `menu`, `about`). Lokalizovaný název přes `titleKey` + i18n soubor. Lokalizovaný path se generuje na úrovni middlewaru, ne v šabloně.
- Sekce `navbar` a `footer` jsou **vždy první a poslední**. Engine to enforcuje na backendu (validace), ne jen v UI.

---

## 4. `theme.json` — design tokens

Sjednocené schéma (Zod) — VŠECHNY šablony mají identická pole, jen jiné hodnoty.

```json
{
  "colors": {
    "primary": "#6d1f37",
    "secondary": "#b51144",
    "background": "#fafaf7",
    "surface": "#ffffff",
    "text": "#1a1a1a",
    "textMuted": "#5a5a5a",
    "accent": "#f4f3ef",
    "border": "#e5e5e5"
  },
  "typography": {
    "fontHeading": "'Caveat Brush', cursive",
    "fontBody": "'Manrope', sans-serif",
    "fontMono": "'JetBrains Mono', monospace",
    "scale": "comfortable"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "16px",
    "pill": "9999px"
  },
  "spacing": {
    "personality": "normal",
    "section": "comfortable"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,.06)",
    "md": "0 4px 12px rgba(0,0,0,.08)",
    "lg": "0 12px 32px rgba(0,0,0,.12)"
  },
  "animation": {
    "ease": "cubic-bezier(.4,0,.2,1)",
    "duration": "200ms",
    "intensity": "subtle"
  }
}
```

### Enum hodnoty (validované)
- `spacing.personality`: `compact | normal | spacious | editorial`
- `spacing.section`: `tight | comfortable | airy`
- `typography.scale`: `compact | comfortable | display`
- `animation.intensity`: `none | subtle | playful | dramatic`

Tyto enumy se v core CSS překládají na konkrétní `clamp()` hodnoty — uživatelské vnímání zůstává unikátní per šablona, ale engine ví, jak to renderovat.

---

## 5. Dědičnost šablon (`baseTemplate`)

Pokud má cafe-02 sdílet 80 % s cafe-01:

```json
{
  "key": "cafe-02",
  "baseTemplate": "cafe-01",
  "version": "1.0.0",
  "overrides": {
    "theme.colors.primary": "#2d4a3e",
    "pages[home].sections[1].variant": "hero-split-image"
  }
}
```

Engine při loadu šablony aplikuje overrides JSON Patch stylem (RFC 6902 syntax-friendly). Tím se 100 variant cafe nestane 100× kopií 300řádkového TS souboru.

---

## 6. Content (i18n)

Veškerý copy je oddělený od manifestu, žije v `content/<lang>.json`:

```json
{
  "navbar": {
    "links": [
      { "labelKey": "nav.home", "href": "/" },
      { "labelKey": "nav.locations", "href": "/locations" }
    ]
  },
  "home": {
    "hero": {
      "title": "Vlna kávy, kterou si zamilujete",
      "subtitle": "Lokální pražírna a kavárna v centru Prahy",
      "ctaPrimary": { "label": "Naše nabídka", "href": "/menu" }
    }
  }
}
```

**Žádný hardcoded copy v sekcích nebo v `template.json`.**

---

## 7. Verzování a migrace

- SemVer per šablona.
- Každý major bump → `migrations/<key>/<from>-to-<to>.ts` exportuje `migrate(sections, content)`.
- Engine při loadu tenanta porovná `tenant.templateVersion` s aktuální verzí; pokud nižší, spustí migrace v transakci.
- Tenant si může zamknout verzi (`tenant.templateVersionLock`) — engine pak skip migrace.

---

## 8. Acceptance gate (před `published`)

Šablona projde 5 bran, jinak se nedá publikovat:

1. **Schema gate** — `template.json` a `theme.json` projdou Zod validátorem.
2. **Studio gate (mechanická, DONE-blocker)** — `pnpm validate:template <slug>` vrátí exit 0. Kontroluje, že každý `(type, variant)` z manifestu existuje v `SECTION_RENDERERS` i `SECTION_VARIANTS`, že všechny `contentRef` resolvují a klíčové content pole (logoUrl, images[], services[]…) jsou přítomné. Bez tohoto kroku studio nedokáže sekci přidat ani přepnout variantu — to byla příčina pádu peak-cut.
3. **Visual gate** — preview screenshot (1440 + 390 px) ručně zkontrolován; uložen do `preview.png`.
4. **Lighthouse gate** — homepage ≥ 90 (Perf), ≥ 95 (SEO, A11y).
5. **Editor gate** — všechna `contentRef` pole jsou editable v live editoru bez chyby; ručně klik Add Section → každá položka knihovny → reorder → reload, vše persistuje.

Bez 5× PASS → šablona zůstává `draft`.

---

## 9. Anti-patterns (zakázáno)

| ❌ Špatně | ✅ Správně |
|----------|----------|
| `cafe-01.ts` s 300 řádky komponentového kódu | `template.json` + `theme.json` + odkazy na shared sekce |
| Hardcoded `"Domů"` v šabloně | `labelKey: "nav.home"` + `content/cs.json` |
| `href: "/kavarny"` | Stabilní slug `/locations` + i18n rewrite |
| Vlastní `<HeroCafeSpecial>` komponenta v šabloně | Nová varianta `hero:cafe-wave` v core sekci |
| Inline barva `#C9A84C` jako fallback | `var(--color-accent)` (musí být v theme) |
| Editace SECTION_LIBRARY při přidání variant | Auto-generování z `SECTION_VARIANTS` registry |
| Variant v `template.json`, který neexistuje v `variants.ts` (např. `gallery:default` když jsou jen `masonry`/`grid`) | Nejdřív přidat variant do `SECTION_VARIANTS` + odpovídající `if (variant === "x")` větev v komponentě, **pak** ho použít v manifestu |
| Manuální TS rewrite section komponenty pro jednu šablonu | Rozšířit shared komponentu novou variantou; template řeší jen content+manifest+theme |

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

