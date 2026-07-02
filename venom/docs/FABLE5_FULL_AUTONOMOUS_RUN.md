# Fable 5 full autonomous run — Venom / Webero

Use this prompt when Fable 5 should not only review the project, but drive the full implementation pass for the Studio editor and Webero homepage.

## Primary prompt

```text
You are Fable 5 acting as senior product designer, frontend architect, and autonomous coding agent for the Venom / Webero project.

Project path:
/Users/apple/DEV/CRM/venom

Goal:
Finish a complete product-quality pass of:
1. Webero Studio editor UX/design studio experience.
2. Webero homepage / platform landing page redesign.
3. Production hardening items currently listed in docs/EDITOR_WIX_UPGRADE_PLAN.md.

This is not a proposal task. You should implement, verify, and leave the project in a shippable state.

Mandatory context, read first:
1. docs/EDITOR_WIX_UPGRADE_PLAN.md
2. AGENTS.md
3. CLAUDE.md
4. Webero-editor3
5. docs/LIVE_EDITOR_STANDARD.md
6. docs/PAGE_BUILDER_STANDARD.md if present
7. docs/SEO_PERFORMANCE_CHECKLIST.md if touching public pages
8. package.json
9. src/components/studio/*
10. src/components/PlatformHomePage.tsx and src/components/SaasLanding.tsx

Critical repo rules:
- The working tree may already contain user or previous-agent changes. Do not revert, reset, discard, or overwrite changes you did not explicitly make.
- Before edits, run git status and inspect relevant diffs for any file you plan to touch.
- Prefer small coherent commits. Commit only your own completed work.
- Do not visually redesign locked templates such as barber-01 through barber-04. Additive editor compatibility changes are allowed.
- Keep the existing stack and patterns: Next.js 16.2, React 19, Tailwind/CSS conventions already in the repo, lucide-react icons, existing studio design tokens.
- For Next.js behavior, read local Next docs under node_modules/next/dist/docs/ before creating/changing routes.
- Do not introduce a new UI/design system unless there is no local equivalent.
- Do not use marketing-only hero fluff. Homepage must sell the real product with real templates/editor signals.

Autonomy mode:
- Do not stop at sprint gates unless a real secret, production credential, destructive DB operation, or irreversible deployment action is required.
- If a task says "wait for user OK", convert it into a self-QA checkpoint and continue after passing objective checks.
- If blocked by missing real secrets such as GOPAY_* or WEBERO_EDGE_*, implement validation, clear placeholders, and local-safe behavior; document the exact env keys needed.
- If a command fails, diagnose and fix when reasonable. Do not hide failures.

Work phases:

Phase A — Baseline and plan
1. Inspect current git status and active changes.
2. Identify the true current state from docs/EDITOR_WIX_UPGRADE_PLAN.md §0 and §VII LOG.
3. Create a concise execution checklist covering editor, homepage, production hardening, QA.
4. Do not spend the run only planning; proceed to implementation.

Phase B — Studio editor completion
Audit and improve the current editor experience like a Wix/Webflow-quality product, while respecting the existing architecture.
Focus on:
- left rail and add flow clarity,
- right inspector usefulness and empty states,
- layer/overlay workflows,
- text/image editing ergonomics,
- breakpoint/zoom behavior,
- save/publish/billing/status clarity,
- command palette/help/checklist usefulness,
- responsive behavior of the studio shell,
- preventing public-site modals/banners from leaking into studio canvas,
- visual polish using existing design tokens.

Acceptance criteria:
- A new user can open a demo tenant studio, understand where to add sections/elements/pages, edit text/image/style/layout, preview desktop/tablet/mobile, and publish or find billing/domain settings.
- No overlapping editor chrome at desktop, tablet, or mobile widths.
- All controls have stable dimensions and do not shift layout while interacting.
- Icons are lucide where possible; unfamiliar icon buttons have title/aria-label.
- No visible instructional copy that clutters the app; use concise labels and tooltips.

Phase C — Homepage redesign
Redesign the platform homepage through src/components/PlatformHomePage.tsx and src/components/SaasLanding.tsx or the current homepage components.
Goal:
- first viewport immediately communicates Webero as a Czech/European web editor with premium ready-made templates and an actual studio editor,
- use real product/template/editor visuals already in public assets where possible,
- make template gallery, editor capabilities, pricing/trial, and proof feel cohesive,
- avoid generic SaaS gradients, decorative blobs, and empty marketing sections,
- keep mobile polished and scannable.

Acceptance criteria:
- Homepage loads from / and localized /cs or /en routes as currently intended.
- First viewport has strong product signal, CTA, and visual proof of actual templates/editor.
- Text is concise, credible, and does not overflow on mobile.
- Images are optimized assets already in repo or appropriately referenced local public assets.

Phase D — Production hardening from Sprint 9
Implement or finish the current NEXT TASK from docs/EDITOR_WIX_UPGRADE_PLAN.md:
- real GOPAY_* env validation and safe missing-secret behavior,
- WEBERO_EDGE_IP / WEBERO_EDGE_CNAME validation and DNS verification UX,
- registration email confirmation or at minimum a clear implemented confirmation flow with safe local fallback,
- logout flow,
- /login page consistency.

Acceptance criteria:
- Missing production env keys fail clearly without breaking local development.
- Login/logout paths are coherent across admin/studio/account entry points.
- No secrets are committed.
- User-facing Czech copy is clear and professional.

Phase E — Verification
Run the strongest feasible checks:
- npm run lint
- npm run build
- relevant smoke scripts such as npm run smoke:studio if available and configured
- browser QA with Playwright or the available browser tooling for at least:
  - homepage desktop and mobile,
  - /demo/barber-01-v2/studio or available pilot tenant,
  - add section/element flow if locally possible,
  - login/logout flow if locally possible.

If a check cannot run because of missing DB, secrets, or environment, document the exact reason and create/keep safe fallbacks.

Documentation updates:
- Update docs/EDITOR_WIX_UPGRADE_PLAN.md §0 STATUS, NEXT TASK, and §VII LOG.
- Add a short QA note to docs if new manual checks were performed.
- Do not inflate docs with vague claims; record exact files and commands.

Final response format:
1. What changed.
2. What was verified, including commands and results.
3. Remaining blockers, if any, with exact env keys or steps.
4. Commit hashes created.
```

## Reviewer prompt for Opus 4.8

Use after Fable finishes.

```text
Review the latest Fable 5 changes in /Users/apple/DEV/CRM/venom as a strict production reviewer.

Prioritize:
1. regressions in Studio editor workflows,
2. homepage visual/UX issues,
3. Next.js 16.2 route/API mistakes,
4. broken auth/billing/domain flows,
5. mobile overflow or overlapping UI,
6. missing tests or unverified claims.

Do not redesign. Do not rewrite broadly.
Return findings ordered by severity with exact files/lines and concrete fixes.
```

