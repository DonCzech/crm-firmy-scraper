# spacing-codemod-report

**Generated:** 2026-06-29
**Mode:** DRY-RUN (no changes)
**CSS files scanned:** 37
**Files with candidates:** 0
**Locked templates (always skipped):** barber-01, barber-02, barber-03, barber-04

## What this codemod does

Rewrites `padding: <top> <right> <bottom> <left>` on **section-root selectors** to consume the new CSS vars emitted by `SectionRenderer`:

```css
/* before */
section.hero { padding: 96px 24px; }

/* after */
section.hero { padding: var(--section-pt, 96px) var(--section-px, 24px) var(--section-pb, 96px) var(--section-px, 24px); }
```

Effect after migration: the Layout-inspector padding sliders **replace** the template's interior padding instead of adding to it (today's `T1.2` semantics are *additive outer padding*).

## Summary

- **Total candidates** (rewritable padding declarations): 0
- **Total skips** (non-trivial values left as-is): 0
- **Files written:** 0 (dry-run — pass `--write` to apply)

## Why 0 candidates?

Quick audit of where section padding actually lives in this codebase:

- All 19 `src/components/sections/*.tsx` files contain Tailwind padding utility classes (`py-32`, `px-8`, `pt-24`, etc.) — **105 occurrences** in JSX `className=` attributes.
- The 37 `skin.css` files only contain padding declarations for **inner elements** (buttons, navbars, badges, pricing tables) — never on the section root itself.
- Section root padding is therefore controlled by Tailwind utility classes inside variant JSX, not by `skin.css`.

A `skin.css` codemod has nothing to migrate.

## Recommended action — KEEP T1.2 ADDITIVE SEMANTICS

The Layout-inspector padding sliders today add **extra outer wrapping padding** on top of the template's interior padding (`SectionRenderer` wrapper div). This is the right approach for this codebase because:

1. **JSX rewrite would be invasive.** Replacing `py-32 md:py-40` with `style={{ padding: 'var(--section-pt)' }}` in every variant means touching all 19 section components × N variants — high blast radius, large diff for marginal UX gain.
2. **Additive is intuitive.** Slider = "extra space around this section", default `0`. Easier to understand than "this slider replaces template default — at `0` your section collapses".
3. **Locked templates stay byte-identical.** No risk of accidental visual regression on barber-01–04.
4. **CSS vars still published.** `SectionRenderer` continues to emit `--section-pt/pb/px` on the wrapper. Future variants (e.g. new templates designed after T1.4) can opt in to **replace-mode** by reading those vars directly in their JSX — and we get gradual migration without forcing it.

**Decision:** T1.4 closed without rewrite. The skript stays in repo as a one-shot tool — if future work introduces section-root padding in `skin.css`, re-running it will catch and migrate that. Right now it's a no-op.

## How to re-run later

```bash
# Dry-run report only (default):
node scripts/migrate-section-spacing-to-vars.mjs

# Apply (skips locked templates listed at top of script):
node scripts/migrate-section-spacing-to-vars.mjs --write
```