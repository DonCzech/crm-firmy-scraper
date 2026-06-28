# FÁZE A & FÁZE B — Index promptů (rozdělené)

**Datum:** 2026-05-25
**Důvod rozdělení:** Sonnet při jednom dlouhém promptu zkracoval analýzu a přeskakoval povinný checklist. Rozdělením na dva soubory + odkaz až po dokončení FÁZE A získáváme vynucený checkpoint.

## Workflow

1. **Otevři nové okno** s Sonnetem v projektu `/Users/apple/DEV/CRM/venom`.
2. **Pošli:** *"Vypracuj práci podle docs/FAZE_A_PROMPT.md"* → Sonnet provede POUZE analýzu a zastaví se.
3. **Zkontroluj analýzu** (mapování sekcí, demo data plán, navázání na předchozí DONE). Pokud něco chybí, řekni mu, ať doplní.
4. **Ve stejném okně pošli:** *"Vypracuj práci podle docs/FAZE_B_PROMPT.md"* → Sonnet napíše úvodní checklist, implementuje, spustí grep audit, aktualizuje queue.

## Soubory

- **FÁZE A (analýza):** [FAZE_A_PROMPT.md](./FAZE_A_PROMPT.md)
- **FÁZE B (implementace):** [FAZE_B_PROMPT.md](./FAZE_B_PROMPT.md)

## Související

- Fronta šablon: [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md)
- 7 standardů: `TEMPLATE_STANDARD.md`, `LIVE_EDITOR_STANDARD.md`, `PAGE_BUILDER_STANDARD.md`, `COMPONENT_ARCHITECTURE.md`, `IMAGE_PIPELINE_STANDARD.md`, `TENANT_DEPLOYMENT_FLOW.md`, `SEO_PERFORMANCE_CHECKLIST.md`
- Index implementace: [MASTER_ARCHITECTURE_INDEX.md](./MASTER_ARCHITECTURE_INDEX.md)
