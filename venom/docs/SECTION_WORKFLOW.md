# SECTION WORKFLOW — Section-by-section převod šablony na engine

**Datum:** 2026-05-27
**Účel:** Nahrazuje monolitickou FÁZI B. Sonnet **NESTAVÍ celou šablonu naráz** — postupuje sekce po sekci podle skeletonu kategorie (`docs/SKELETONS.md`). Každá sekce projde 6 mikro-fází a teprve po PASS pokračuje na další.

---

## 🚦 6 mikro-fází pro KAŽDOU sekci

Pro sekci `i` (kde `i` je pozice ve skeletonu šablony — Header = 1, Hero = 2, …):

```
┌─[1] BUILD ──────────────────────────────────────────────────────────────┐
│  - Otevři audit `template-lab/audits/<slug>.md` → sekce i.              │
│  - Najdi odpovídající shared variant v src/sections/registry.ts.        │
│  - Reuse > Extend > New (v tomto pořadí).                               │
│  - Doplň content do src/templates/<slug>/content/cs.json (demo data!).  │
│  - Přidej sekci do src/templates/<slug>/template.json:sections[i].      │
│  - NIKDY nevkládej víc sekcí než jednu v této iteraci.                  │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─[2] VISUAL DIFF ────────────────────────────────────────────────────────┐
│  pnpm snap:clone <slug>           (jen poprvé — celé /preview screenshot)│
│  pnpm snap:engine <slug> <i>      (engine sekce i v 1440 + 375)         │
│  pnpm diff:section <slug> <i>                                            │
│                                                                          │
│  Výstup do template-lab/audits/<slug>/section-<i>/                       │
│    ├─ clone-1440.png                                                     │
│    ├─ clone-375.png                                                      │
│    ├─ engine-1440.png                                                    │
│    ├─ engine-375.png                                                     │
│    └─ diff-report.json (layout score, font parity, color parity)         │
│                                                                          │
│  PASS kritéria:                                                          │
│    - layout score ≥ 95% (počet sloupců, šířka kontejneru, pozice CTA)   │
│    - font-family parity = exact match (whitelisted fallbacks ok)        │
│    - color HEX parity = exact pro primary/accent/background              │
│    - výška sekce ±10% od originálu                                       │
│                                                                          │
│  FAIL → zpět na [1] BUILD; max 3 iterace, pak hlas uživateli.            │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─[3] DEMO AUDIT ─────────────────────────────────────────────────────────┐
│  Grep sekce v rendered HTML i v zdrojích:                                │
│    curl -s http://localhost:3015/demo/<slug>-v2 > /tmp/<slug>-v2.html   │
│                                                                          │
│  Pro každou originální hodnotu (z audit souboru, sekce "Originální       │
│  data"):                                                                 │
│    grep -F '<orig telefon>'  /tmp/<slug>-v2.html  →  0 výsledků          │
│    grep -F '<orig email>'    /tmp/<slug>-v2.html  →  0 výsledků          │
│    grep -F '<orig doména>'   /tmp/<slug>-v2.html  →  0 výsledků          │
│    grep -F '<orig brand>'    /tmp/<slug>-v2.html  →  0 výsledků          │
│                                                                          │
│  Pozitivní kontrola:                                                     │
│    grep -F '704 123 456' /tmp/<slug>-v2.html      →  ≥ 1 výsledek       │
│    grep -F '@demo.cz'    /tmp/<slug>-v2.html      →  ≥ 1 výsledek       │
│                                                                          │
│  FAIL → zpět na [1] BUILD, oprav demo data.                              │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─[4] STUDIO TEST ────────────────────────────────────────────────────────┐
│  pnpm test:studio <slug> <i>                                             │
│                                                                          │
│  Playwright scénář pro sekci i:                                          │
│    1. otevři http://localhost:3015/demo/<slug>-v2/studio                │
│    2. najdi sekci #section-<i>                                          │
│    3. pro každý text-editable element:                                   │
│         klik → editor se otevří → změň text → save → reload              │
│         → ověř že změna zůstala                                          │
│    4. pro každý image-editable element:                                  │
│         klik → upload mock obrázku → crop → save                         │
│         → ověř WebP variantu v public/templates/<slug>/images/           │
│    5. pro každý CTA/link:                                                │
│         klik → editor href + text → save → reload → ověř                 │
│    6. section ops (skip pokud sekce je header/footer):                   │
│         - duplicate sekce → ověř že existuje #section-<i>-copy           │
│         - delete duplicate → ověř že zmizela                             │
│         - hide → ověř že nemá render → show → znovu render               │
│         - reorder o 1 pozici nahoru/dolů → save → reload → pozice OK     │
│    7. viewport switch:                                                   │
│         - klik na "Mobile" preset → iframe width = 375                   │
│         - klik na "Tablet" preset → iframe width = 768                   │
│         - klik na "Desktop" preset → iframe width = 1440                 │
│                                                                          │
│  PASS = všech 7 kroků zelená.                                            │
│  FAIL → identifikuj jestli je problém v sekci nebo v shared studio.      │
│         Shared studio fixy patří do src/components/studio/, ne do        │
│         template-only kódu.                                              │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─[5] PARITY GATE (uživatelský) ──────────────────────────────────────────┐
│  Vypiš uživateli:                                                        │
│    "Sekce <i> <name> hotová.                                             │
│     Screenshoty: template-lab/audits/<slug>/section-<i>/                 │
│     Diff report: layout 98%, font OK, color OK.                          │
│     Studio test: 7/7 PASS.                                               │
│     Demo audit: 0 originálních hodnot.                                   │
│     Pokračuji na sekci <i+1>?"                                           │
│                                                                          │
│  V autonomním režimu (uživatel řekl "jeď až do konce"):                  │
│    - parity gate se vynechá pro sekce 2..N-1                             │
│    - VŽDY se uplatní pro sekci 1 (Header) a sekci N (Footer)             │
│    - na FAIL diff/studio testu se zastaví bez ohledu na režim            │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─[6] COMMIT ─────────────────────────────────────────────────────────────┐
│  git add src/templates/<slug>/ public/templates/<slug>/                  │
│  git add template-lab/audits/<slug>/section-<i>/                         │
│  git commit -m "feat(<slug>): section <i> <name> — parity+editor PASS"  │
│                                                                          │
│  Cíl: per-section atomický commit umožňuje rollback jedné sekce, ne     │
│       celé šablony.                                                      │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    [Posun na sekci i+1]
```

---

## 🔒 Pravidla, která NESMÍŠ porušit

1. **Jedna sekce v jedné iteraci.** Žádné "vyplním rovnou všechny sekce a pak otestuju".
2. **Skeleton dle kategorie šablony** (`docs/SKELETONS.md`). Vynechané sekce se nepřesouvají, místo se zachová prázdné.
3. **Engine slug = `<kategorie>-NN`**, ne odvozený z originálu (např. `barber-02`, ne `the-barber`).
4. **Engine tenant = `<engine-slug>-v2`** (NIKDY `-demo`). Slug `-demo` je rezervovaný pro clone tenanty.
5. **`/preview` a `public/clones/` jsou READ-ONLY.** Pre-commit hook to vynucuje.
6. **Demo data od první iterace [1] BUILD.** Nikdy se nedělá "nejdřív zkopíruju originál, pak nahradím" — to vede k rezervovaným originálním hodnotám v cache/historii.
7. **Sdílené sekce v `src/sections/`** — když potřebuješ novou variantu, přidáš ji do shared engine, ne do template-only kódu.
8. **Při FAIL diff/studio testu max 3 iterace [1] BUILD.** Po 3 fail volá Sonnet uživatele a navrhne, zda potřebuje rozšířit shared variant (Extend), nebo zda originál má strukturální problém (defekt, který musí být v audit souboru v sekci "Defekty originálu k opravě").

---

## 📦 Adresářová struktura per šablona

```
src/templates/<engine-slug>/
├── template.json          (sections[] v pořadí skeletonu)
├── theme.json             (design tokens — colors, fonts, spacing)
├── skin.css               (variant-specific overrides)
├── content/
│   └── cs.json            (demo content, builduje se sekce po sekci)
├── README.md              (engine slug, original slug, kategorie, skeleton, autor)
└── pages/                 (volitelně — pokud má šablona podstránky)
    ├── about.json
    ├── services.json
    └── ...

public/templates/<engine-slug>/
├── logo.svg               (demo logo)
├── preview.png            (preview screenshot pro /preview-2 grid)
└── images/                (demo placeholder obrázky, WebP + JPG fallback)

template-lab/audits/<original-slug>.md   (master audit, vyplňuje FÁZE A)
template-lab/audits/<original-slug>/
├── screenshots/
│   ├── clone-homepage-1440.png
│   ├── clone-homepage-375.png
│   └── clone-section-<i>-{1440,375}.png
└── section-<i>/
    ├── clone-1440.png
    ├── clone-375.png
    ├── engine-1440.png
    ├── engine-375.png
    └── diff-report.json
```

---

## 🧪 Smoke per sekce — minimální PASS

| Mikro-fáze | Tool | Exit-0 znamená |
|------------|------|----------------|
| [2] visual diff | `pnpm diff:section <slug> <i>` | layout ≥ 95%, font OK, color OK |
| [3] demo audit | inline grep v workflow | 0 originálních hodnot v sekci |
| [4] studio test | `pnpm test:studio <slug> <i>` | 7/7 Playwright kroků |

Bez všech 3 zelených ⇒ sekce **NENÍ DONE** ⇒ NEPOKRAČUJ na další.

---

## 🎯 Šablona je DONE až když

- **Všechny sekce ze skeletonu kategorie** prošly [1] – [6] (s povolenými SKIP-y zaznamenanými v `template.json:skippedSections[]`)
- `pnpm validate:template <slug>` exit 0 (skeleton compliance + editable flags + content keys)
- `/preview-2` ukazuje šablonu (auto-discovery PASS)
- `/demo/<engine-slug>-v2` renderuje **identicky jako** `/demo/<original-slug>-demo` až na obsah (demo data) a opravené defekty
- `/demo/<engine-slug>-v2/studio` je 100% klikací (každý text, obrázek, CTA, sekce ops, viewport switch)
- Queue `docs/MASTER_TEMPLATE_QUEUE.md` aktualizovaná na `DONE`
- Engine slug má vymyšlené demo jméno (ne odvozené z originálu)
