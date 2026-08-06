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

## 2026-08-06 — Claude Code — TASK-037 Track 1 Phase 2 (Task 1: npm audit remediation)

**✅ RESOLVED 2026-08-06 (Task 7)** — see correction note at the end of this
entry: the SWC-inlining root cause below was disproven; the actual cause was
simpler (`Object.defineProperty` silently no-oping the write), and the test
now passes.

**Deferred: `origin.test.ts` "should reject missing origin in production mode" fails — pre-existing, unrelated to the `next` bump**
- Root cause verified: `next/jest` (configured in `jest.config.js` via
  `nextJest({ dir: './' })`) transforms test/source files through Next's SWC
  pipeline, which statically inlines `process.env.NODE_ENV` references to a
  literal at transform time (same mechanism as webpack's `DefinePlugin`
  substitution in production builds). `src/lib/origin.ts`'s
  `process.env.NODE_ENV === "production"` checks get baked in as `"test" ===
  "production"` (always `false`) when jest runs, so runtime mutation via
  `src/lib/testHelpers/testEnv.ts`'s `setNodeEnv()` helper cannot affect the
  already-inlined check — the test's premise (mutate `NODE_ENV` mid-test) is
  incompatible with `next/jest`.
- Verified NOT a regression from the `next` 16.2.9 -> 16.3.0 bump: (1) jest
  itself was not touched by this task's `npm install`/`npm audit fix` (no
  `jest`/`jest-environment-*` lines in the `package-lock.json` diff), and
  (2) running `NODE_ENV=production npx jest src/lib/__tests__/origin.test.ts`
  (setting the env var before the process starts, so SWC inlines the
  correct value) makes all 8 applicable tests pass, confirming
  `validateOrigin`'s actual production-mode logic is correct — only the
  test's runtime-mutation methodology is broken, and would have been broken
  under `next@16.2.9` too (this branch's `node_modules` was in a broken
  state before this task, per Track 1 Phase 1's own deferred-work entry
  above, so this test likely never ran clean before now).
- Applied a real but partial fix in `src/lib/testHelpers/testEnv.ts`:
  `Object.defineProperty(process.env, "NODE_ENV", ...)` was missing
  `enumerable: true`, which Node's `process.env` setter requires for the
  write to take effect at all (it silently no-ops otherwise, no throw) —
  correct per Node semantics, but does not resolve the SWC-inlining issue
  above, so the test still fails.
- Action needed: redesign the two production-mode `origin.test.ts` cases to
  not rely on runtime `NODE_ENV` mutation under `next/jest` — options include
  (a) a separate `jest --projects` config that runs this file with
  `NODE_ENV=production` set at process start, (b) refactoring
  `origin.ts` to read the environment through a small wrapper that jest can
  `jest.mock()` instead of comparing `process.env.NODE_ENV` inline, or
  (c) moving these two assertions to a non-SWC-transformed test runner.
  Out of scope for TASK-034 (npm audit remediation only); flagged here per
  Rule 12 rather than silently skipped or worked around by weakening the
  assertion.

**Correction, 2026-08-06 (TASK-037 Task 7)**: the SWC-static-inlining theory
above was wrong. Task 7 verified directly:
`Object.defineProperty(process.env, "NODE_ENV", {value: "x", configurable:
true, writable: true, enumerable: true})` left `NODE_ENV` unchanged, while
plain `process.env.NODE_ENV = "x"` took effect immediately — `process.env`'s
native binding silently no-ops `defineProperty`-based writes regardless of
descriptor shape, it isn't about SWC inlining the comparison at all.
Switching `setNodeEnv()` in `src/lib/testHelpers/testEnv.ts` to a plain
assignment fixed the test outright — both `origin.test.ts` production-mode
cases now pass genuinely, no restructuring needed. Full test suite: 23/23
suites, 319 passed / 2 skipped / 0 failed. This entry is kept (not deleted)
per Rule 14/audit-trail practice — the disproven theory is left visible so a
future reader doesn't reintroduce it.

## 2026-08-06 — Claude Code — TASK-037 Track 1 Phase 2 (Task 10: Functions v2 migration)

**Deferred: `functions/` has its own unaddressed npm audit findings (2 high, 7 moderate, 1 low)**
- Discovered incidentally: `functions/node_modules` didn't exist at all before
  this task (never installed on this branch), so installing it to type-check
  the v1→v2 migration surfaced `functions/`'s own dependency tree for the
  first time. TASK-034/Task 1's npm audit remediation was explicitly scoped
  to the root `package.json` only (per its brief) and never touched
  `functions/package.json`'s separate dependency tree.
- Evidence: `cd functions && npm audit --json` → `{"low":1,"moderate":7,"high":2,"critical":0,"total":10}`.
- Action needed: run the same remediation process Task 1 used (capture
  baseline, `npm audit fix` for what's safely fixable, record residual risk)
  against `functions/package.json` specifically. Out of scope for Task 10
  (a v1→v2 API migration, not a security remediation task).

**Deferred: `functions/package.json` has a pre-existing eslint peer-dependency conflict**
- `eslint-plugin-import@^2.25.4`'s peer range (`^2 || ... || ^8 || ^9`) does
  not include `eslint@10.5.0` (the pinned devDependency), so `npm install`
  fails without `--legacy-peer-deps`. This task used `--legacy-peer-deps` to
  get a working `node_modules` for verification; the resulting
  `package-lock.json` is committed as part of this task's build-verification
  requirement, but the underlying version conflict is unresolved.
- Action needed: either bump `eslint-plugin-import` to a version supporting
  eslint 9/10, or pin `eslint` back to a version `eslint-plugin-import`
  supports — a real choice, not something to silently paper over with
  `--legacy-peer-deps` as the permanent state.

## 2026-08-06 — Claude Code — TASK-037 PR #59 external review triage

External review (Codacy, CodeFactor, Qodo, CodeRabbit) on PR #59 surfaced
several real findings. Fixed inline (see PR commits): CSRF protection wired
into `requireAdminSession()` (8 admin routes moved from Bearer, inherently
CSRF-immune, to cookies, which need it — `src/lib/csrf.ts`'s existing
double-submit-cookie check was not applied to any of them before this fix),
`/api/auth/session` now accepts either `admin` or `isAdmin` on the Firestore
user doc (repo has historically used both field names — see next entry),
the admin-session JWT now carries an `email` claim (was empty-string before,
reducing `admin_logs` audit fidelity), a pre-existing logic bug in
`onCashoutSent`'s status-transition guard (fired on rejections too, not just
sends), `beforeUserCreated` no longer lets a Firestore write failure abort
signup itself (v1's `onCreate` ran after the Auth record existed; v2's
`beforeUserCreated` runs inline, so an uncaught error now aborts account
creation — added try/catch), `request.data` null-fallback in `completeTask`/
`requestPayout`, and `jest.setup.ts`'s `require()` calls moved to top-level
imports (`@typescript-eslint/no-require-imports`).

**Deferred, not fixed in this phase:**

**Deferred: `admin` vs `isAdmin` field naming is unresolved, only made non-blocking**
- The real fix (accepting either field when minting the `admin_session`
  cookie) avoids locking out an admin whose Firestore doc uses the other
  convention, but does NOT resolve which field is actually canonical — no
  code path in this repo writes `admin: true` or `isAdmin: true`, so there's
  no way to determine this from the codebase alone.
- Action needed: Shayan confirms which field production `users` docs
  actually carry (or whether both exist from different eras), and the repo
  standardizes on one — the accept-either shim should be temporary, not
  permanent policy.

**Deferred: Firebase Functions v1→v2 migration has no automated test coverage**
- `functions/src/index.ts` was significantly modified (all 6 exports moved
  APIs, one with a documented behavior change) with only `tsc`/`npm run
  build` verification — no unit tests exist for the Functions package at
  all (confirmed: no test runner/framework wired into
  `functions/package.json` beyond `firebase-functions-test` as an unused
  devDependency).
- Action needed: set up a Functions test harness (`firebase-functions-test`
  is already a devDependency, unused) and add coverage for the 6 exported
  functions, especially `onUserCreated`'s new error-handling path and the
  `onCashoutSent`/`onCashoutRejected` transition-guard fix above. Real,
  substantial scope — not attempted here since it's a new testing
  initiative, not part of TASK-037's original plan.

**Deferred: `beforeUserCreated` may require a Firebase project upgrade to Identity Platform**
- Per Firebase's own docs, v2 blocking functions (`beforeUserCreated`/
  `beforeSignIn`) require the Firebase project to be upgraded to Firebase
  Authentication with Identity Platform — this is a project-level
  infrastructure setting, not something verifiable or changeable from this
  repo.
- Action needed: Shayan confirms (or performs) the Identity Platform
  upgrade in the Firebase console before this function is deployed, or
  `onUserCreated` will fail to deploy/register. Added to
  `docs/SHAYAN_LAUNCH_ACTION_ITEMS.md`.

**Declined (not a code change): Qodo's finding that `docs/superpowers/plans/2026-08-06-track1-phase2-hardening.md`'s "Shayan's explicit sign-off" requirement for deletions "violates a rule forbidding person-specific approval, not enforceable via CODEOWNERS"**
- This isn't a defect — it's this repo's own established governance
  (`REPO_RULES.md` Rule 14, referenced throughout `AGENTS.md` and every
  track's plan), predating this PR and explicitly set by Shayan. A generic
  external review heuristic about CODEOWNERS-enforceability doesn't
  override a project owner's explicit process choice. No change made.

**Minor doc gap, fixed:** `docs/API_DOCUMENTATION.md`'s Admin Endpoints
section said only "Requires admin authentication" without naming the
mechanism (unlike the `/api/payout (Admin Only)` section just above it,
which already correctly says "session cookie, no Bearer token needed") —
updated to match.

## Open decisions for Shayan (carried from REDESIGN_SPEC §8)
1. ✅ **RESOLVED 2026-08-06** — Palette: Model U. Confirmed by Shayan.
2. ✅ **RESOLVED 2026-08-06** — Admin: retheme dark via `*Premium` reference. Confirmed by Shayan explicitly (was previously assumed by Track 2's plan without confirmation — now genuinely settled). See `docs/superpowers/plans/2026-08-06-track2-uiux-redesign.md` Task 4.
3. ✅ **RESOLVED 2026-08-06** — Motion library: CSS + Reanimated (not Lottie). Confirmed by Shayan. See `docs/superpowers/plans/2026-08-06-track3-mobile-rebuild.md` for where this applies.
4. Icons: unify on Lucide (recommended) — de facto already true, no other icon library present in `package.json` as of 2026-08-06. Not a blocking decision, just needs a formal nod.
5. A/B infra (`landing/HeroDynamic` + `HeroV1Balanced`/`HeroV2Gaming`/`HeroV3Offers`): revive or delete — still open, tied to the orphan-component deletion decision (item below).
6. ✅ **RESOLVED** — Fabricated stats: wire to `/api/stats/platform` (already live). See Track 2 Task 2.
7. **NEW 2026-08-06, per Shayan explicitly:** every payment/brand logo (PayPal, Amazon, Tim Hortons, Steam, Visa, Bitcoin, Litecoin) must be that company's real official logo, sourced from their own brand/press kit — never AI-generated, never a lucide-icon/emoji stand-in. See Track 2 Task 6.
8. **NEW 2026-08-06:** contrast audit (WCAG AA, 4.5:1 text / 3:1 UI) was missing from Track 2's Batches A-C despite being REDESIGN_SPEC's own Phase 1 gate criterion paired with the hex purge — added as Track 2 Task 7.
