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

**Deferred: Deploy Preview workflow is broken (pre-existing, unrelated to TASK-036)**
- Blocked by: `.github/workflows/deploy.yml`'s `Deploy Preview` job pins
  `vercel@^50.0.0` and passes `--pre` via `amondnet/vercel-action@v42`;
  that flag no longer exists on the resolved CLI version (`vercel@50.44.0`
  as of 2026-08-06) — `Error: unknown or unexpected option: --pre`.
  Confirmed pre-existing via `git diff main...HEAD -- .github/workflows/deploy.yml`
  (zero changes on the TASK-036 branch) and via `git log` (workflow last
  touched by an unrelated `actions/checkout` bump).
- Not a merge blocker: the actual preview deployment already succeeds via
  Vercel's native GitHub integration (`Vercel – tapcash` / `Vercel – tapcash-zyd5`
  checks pass independently), and this job isn't part of the named `gate`
  workflow required by `AGENTS.md`.
- Action needed: either drop the `--pre` arg (redundant with `target: preview`
  on this action version) or pin an older `vercel-version` — whoever owns
  CI should decide since it's a shared workflow file, not scoped to one track.

**Deferred: Codacy stuck in `action_required`, CodeFactor grade-fail — no actionable findings remain**
- On PR #57: all specific Codacy findings were verified against current
  code and are either already fixed (2 High: payout-route transaction,
  antiFraud `_ip` destructure) or fixed in the same PR (unused `esc()`
  helper + unused `motion` destructure in `packages/tokens/build.mjs`,
  stale `@ts-nocheck` in `build.mjs`/`tokens.test.ts`).
- After that fix, Codacy's check-run conclusion is `action_required`
  (their GitHub App needs a manual "Run reviewer" trigger on
  app.codacy.com, not a code change) and CodeFactor fails with no
  PR-scoped comment output (likely a whole-repo grade threshold, not a
  diff-specific finding).
- Action needed: whoever has the Codacy/CodeFactor dashboard access should
  check in and either re-trigger the review or confirm the grade is
  repo-wide pre-existing debt, not something this branch introduced.

## Open decisions for Shayan (carried from REDESIGN_SPEC §8)
1. ✅ **RESOLVED 2026-08-06** — Palette: Model U. Confirmed by Shayan.
2. ✅ **RESOLVED 2026-08-06** — Admin: retheme dark via `*Premium` reference. Confirmed by Shayan explicitly (was previously assumed by Track 2's plan without confirmation — now genuinely settled). See `docs/superpowers/plans/2026-08-06-track2-uiux-redesign.md` Task 4.
3. ✅ **RESOLVED 2026-08-06** — Motion library: CSS + Reanimated (not Lottie). Confirmed by Shayan. See `docs/superpowers/plans/2026-08-06-track3-mobile-rebuild.md` for where this applies.
4. Icons: unify on Lucide (recommended) — de facto already true, no other icon library present in `package.json` as of 2026-08-06. Not a blocking decision, just needs a formal nod.
5. A/B infra (`landing/HeroDynamic` + `HeroV1Balanced`/`HeroV2Gaming`/`HeroV3Offers`): revive or delete — still open, tied to the orphan-component deletion decision (item below).
6. ✅ **RESOLVED** — Fabricated stats: wire to `/api/stats/platform` (already live). See Track 2 Task 2.
7. **NEW 2026-08-06, per Shayan explicitly:** every payment/brand logo (PayPal, Amazon, Tim Hortons, Steam, Visa, Bitcoin, Litecoin) must be that company's real official logo, sourced from their own brand/press kit — never AI-generated, never a lucide-icon/emoji stand-in. See Track 2 Task 6.
8. **NEW 2026-08-06:** contrast audit (WCAG AA, 4.5:1 text / 3:1 UI) was missing from Track 2's Batches A-C despite being REDESIGN_SPEC's own Phase 1 gate criterion paired with the hex purge — added as Track 2 Task 7.
