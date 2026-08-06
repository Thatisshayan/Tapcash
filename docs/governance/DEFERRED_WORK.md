# Deferred Work Register

> Rule 12 — deferred work must survive the session. Entries are actionable by a future agent.

## 2026-08-05 — Hermes — UI/UX Phase 1 token foundation

**Deferred: Orphan component deletion (REDESIGN_SPEC §4.2)**
- Blocked by: REPO_RULES Rule 14 (no file deletion without Shayan's explicit approval).
- Scope: 6 dead Hero variants (`landing/Hero`, `HeroDynamic`, `HeroPremium`, `HeroV1Balanced`, `HeroV2Gaming`, `HeroV3Offers`) + 26 other orphans (`*Premium` components, `sections/{FinalCTA,HowItWorks,PayoutMethods,PayoutTicker,Stats,Testimonials}`, `BrandLogos`, `CashPathFlow`, `CompletionReceiptModal`, `OnboardingModal`, `PushNotificationPrompt`, `TapScoreIndicator`, `TrustBadges`, `ui/DashboardMockup`).
- Caveat (from spec): the four admin `*Premium` components are dark-theme replacements for the light admin pages shipping today. **Harvest their styling into the retheme BEFORE deleting**, or keep those four and delete the light pages instead.
- Action needed: obtain Shayan's explicit deletion approval, then raise as a dedicated PR.

**Deferred: Per-component raw-hex purge + contrast audit (REDESIGN_SPEC Phase 1 gate)**
- Blocked by: scope (≈1153 raw hex literals in `src/**/*.tsx`); not a one-run task.
- The token *foundation* is in place (`packages/tokens/`), but components still hardcode legacy/inline hex. A follow-on branch must migrate components to semantic tokens and verify all text pairs ≥ 4.5:1, UI ≥ 3:1.
- Evidence: `grep -rEio "#[0-9a-fA-F]{6}" src --include=*.tsx | wc -l` → 1153 (pre-existing).

**Deferred: Full gate re-run (test/lint/build/typecheck)**
- Blocked by: `node_modules` was partially broken on the agent machine (missing `jest/package.json`, `next/package.json` manifests). `npm ci` reinstall started 2026-08-05 to restore a runnable verify path.
- Action: after install completes, run `jest packages/tokens/tokens.test.ts`, `npm test`, `npm run type-check`, `npm run lint`, and confirm the new drift test is green before merging the Phase 1 token branch.

## 2026-08-06 — Claude Code — TASK-036 Track 1 Phase 1

**Deferred: Official PayPal SVG logo**
- Blocked by: no official PayPal brand asset sourced yet.
- Scope: `src/components/sections/PayoutMethodsSection.tsx:4` — TODO comment
  updated (Interac reference removed from it as part of the Interac freeze,
  TASK-036 Task 9) but the underlying deferred work — replacing the
  `CreditCard` lucide icon placeholder with an official PayPal SVG logo —
  was already deferred before this PR and remains open.
- Action needed: source an official PayPal brand SVG asset, swap the icon.

## Open decisions for Shayan (carried from REDESIGN_SPEC §8, still unanswered)
1. Palette: Model U (recommended) — adopted as default in token source; confirm.
2. Admin: retheme dark via `*Premium` (recommended) vs keep light.
3. Motion library: Lottie vs CSS+Reanimated.
4. Icons: unify on Lucide (recommended).
5. A/B infra: revive or delete.
6. Fabricated stats: remove / wire to `/api/stats/platform`.
