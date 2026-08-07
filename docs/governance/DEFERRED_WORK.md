# Deferred Work Register

> Rule 12 — deferred work must survive the session. Entries are actionable by a future agent.

## 2026-08-07 — Claude Code — Payouts / referrals pages (Aurora rollout)

**Note: Interac e-Transfer freeze — payouts page**
- `src/app/payouts/page.tsx` filters Interac out of the visible method
  list (`VISIBLE_METHODS = tapCashPayoutMethods.filter(m => m.id !==
  "interac")`), matching the standing freeze referenced elsewhere in
  this file. Intentional, now formally logged for this page.

**Fixed: public referral page leaked a real user's lifetime earnings**
- `src/app/ref/[refId]/page.tsx` looked up the referrer's total lifetime
  coins (via a `ledger_transactions` query) and rendered the exact
  figure to any anonymous visitor. Removed the query and the earnings
  display; the page now only shows a masked display name and a coarse
  VIP tier badge (used for accent color, not a real dollar amount).

**Deferred: referral links are keyed by the raw Firebase Auth UID**
- `src/app/referrals/page.tsx` builds the shareable invite link as
  `/ref/${user.uid}` (pre-existing, not introduced by this retheme
  pass), and `/ref/[refId]/page.tsx` looks that UID up directly in
  `users/{uid}`. This makes the UID public and lets anyone probe
  `/ref/<any-uid>` to check whether a given ID belongs to a real user
  (a display-name/tier oracle, though the earnings leak above is now
  closed). A proper fix would introduce a separate opaque referral
  code decoupled from the auth UID -- that needs a new field, a
  uniqueness index, updated signup attribution, and a backfill/alias
  plan for links already shared in the wild. Out of scope for a retheme
  pass; flagging for Shayan to decide whether/when to take on the
  migration.

## 2026-08-07 — Claude Code — Cashout page (Aurora rollout)

**Deferred: cashout status page depends on a `/api/debug/*` route**
- `src/app/cashout/page.tsx` calls `/api/debug/ledger-summary` as its
  only source of balance data (same finding logged against the
  dashboard page on `038-dashboard-page-aurora`). Already properly
  auth-scoped (bearer token verified, query scoped to the caller's own
  uid) -- not an access-control bug, just a bad contract to build
  production UX on. Not renamed here because the route is shared with
  that other in-flight branch's independent Vercel preview; needs a
  dedicated follow-up PR once this batch lands that adds a
  properly-namespaced route (e.g. `/api/ledger/summary`) and repoints
  both callers together.

**Note: Interac e-Transfer freeze — cashout page**
- `src/app/cashout/page.tsx` keeps full Interac data model, validation, and
  submission logic (`ALL_METHODS`, `interacQuestion`/`interacAnswer`
  state, security-question fields) but filters it out of the
  user-visible list via `VISIBLE_METHODS = ALL_METHODS.filter(m =>
  m.id !== "interac")`. This is intentional and matches the standing
  Interac freeze referenced elsewhere in this file (PayPal logo entry
  above) — not a bug, and not yet formally logged against the cashout
  page specifically until this entry. Re-enable by removing the filter
  once the freeze lifts.

## 2026-08-07 — Claude Code — Rewards / transactions / cashPath pages (Aurora rollout)

**Note: Interac e-Transfer freeze — rewards page**
- `src/app/rewards/page.tsx` filters Interac out of the visible payout
  method grid (`methods = tapCashPayoutMethods.filter(m => m.id !==
  "interac")`), matching the standing freeze referenced elsewhere in
  this file. Intentional, now formally logged for this page.

## 2026-08-07 — Claude Code — Dashboard/cashout ledger endpoint audit

**Fixed: dashboard leaderboard/activity silently passed off seed data as live**
- `src/app/dashboard/page.tsx` seeded `leaderboard` and `liveActivity` state
  with static demo content (`tapCashLeaderboardSeed`, `tapCashActivity` --
  masked usernames, fabricated dollar amounts) and, on a failed live-data
  fetch, kept showing that content under headings like "What people are
  doing now" with no indication it wasn't real. That's the exact
  fabricated-live-activity anti-pattern this whole Aurora pass was
  supposed to remove (see the homepage EarningsCounter/LivePayoutCard
  removal earlier in this rollout). Added `leaderboardLive`/`activityLive`
  tracking and a visible "Sample data — live feed unavailable" label
  (heading also changes to "Example activity") whenever the seed content
  is actually what's on screen.

**Fixed: hardcoded cashout minimum contradicted the real minimums**
- Dashboard claimed "$20.00 min cashout" (`MIN_CASHOUT_COINS = 20000`).
  The payout API's actual floor is 2,000 coins ($2.00,
  `src/app/api/payouts/request/route.ts:77`), and every real method on
  `/cashout` requires 5,000-10,000 coins. Neither number was 20,000.
  Changed to 5,000 coins ($5.00) -- the lowest real per-method minimum,
  i.e. the true "you can cash out via at least one method" threshold --
  and the on-screen copy now reads off that constant instead of a
  hardcoded string, so they can't drift apart silently again.

**Deferred: dashboard and cashout both depend on a `/api/debug/*` route**
- Both `src/app/dashboard/page.tsx` and `src/app/cashout/page.tsx` call
  `/api/debug/ledger-summary` as their only source of balance data. The
  route itself is properly auth-scoped (verifies the bearer token, scopes
  the Firestore query to the caller's own uid) -- this is a contract
  smell, not an access-control hole. Wiring production UX to a path
  namespaced `debug` risks someone treating it as disposable/gated later
  and breaking both pages. Not renamed in this pass because the same
  route is depended on by two separate in-flight PR branches
  (`038-dashboard-page-aurora`, `038-cashout-page-aurora`) that deploy to
  independent Vercel previews -- renaming from inside one branch would
  leave the other's preview broken until it also picks up the change.
  Needs a dedicated follow-up PR that adds a properly-namespaced route
  (e.g. `/api/ledger/summary`) and repoints both callers together, once
  this batch has landed.

## 2026-08-07 — Claude Code — Mobile home screen (Aurora dashboard rollout)

**Deferred: Real CashPath step tracking on mobile home**
- `mobile/app/(tabs)/index.tsx` had a `CASHPATH` stepper hardcoded to
  `ACTIVE = 2` for every user (exactly the bug REDESIGN_SPEC.md §5.5
  flagged). Removed rather than reskinned — this screen has no per-user
  "which stage is my most recent earning at" data source wired to it.
- Action needed: either wire a real per-user CashPath status query (check
  if `mobile/app/(tabs)/activity.tsx` / the transactions ledger already
  has this data, since if so it may just need surfacing here too), or
  decide the mobile home screen doesn't need a CashPath widget at all
  and drop the concept from this screen permanently.

**Deferred: Platform stats on mobile home**
- Same file had hardcoded `50K+ Users / $2.5M+ Paid / 98% Verified`
  stat tiles with no backing API — fabricated statistics, banned per
  `packages/tokens/tokens.json` `meta.antiPatterns`. Removed, not
  reskinned. The web landing page already had its own version of this
  same bug removed for the same reason (see REDESIGN_SPEC.md §5.1) —
  if/when a real `/api/stats/platform`-equivalent exists for mobile,
  wire both surfaces from it.

## 2026-08-07 — Claude Code — Homepage sections (Aurora rollout, root landing page)

**Deferred: Homepage was missed by the first Aurora rollout wave entirely**
- `src/app/page.tsx` (the actual root "/" landing page) composes 8 section
  components; the first rollout wave (PRs #65-#72) only touched one of
  them (`OffersSection`, via PR #65). The other 7 (`HeroSection`,
  `CashPathSection`, `TruthModeSection`, `AppShowcaseSection`,
  `TrustStripSection`, `CashoutMethodsSection`, `FAQSection`) were still
  on the legacy `#0d0d1a`/`#00FF85`/`#7B5CF0` palette. Fixed in this
  pass (`agent/claude/038-homepage-sections-aurora`).

**Deferred: Trustpilot "4.8/5, Excellent" rating claim removed**
- `TrustStripSection.tsx` displayed a specific "4.8 / 5 — Excellent on
  Trustpilot" rating with the real Trustpilot logo. Unlike an internal
  fabricated stat, this cites a specific third-party rating — if TapCash
  doesn't actually have that rating on Trustpilot, this is both the
  standard fabricated-statistic anti-pattern AND a real
  reputational/legal exposure (using another company's mark to claim an
  unverified rating). Removed rather than assumed true, since I have no
  way to verify it from this session.
- Action needed: if TapCash has a real, current Trustpilot profile,
  re-add this block with the actual live rating (ideally fetched, not
  hardcoded, so it doesn't go stale/wrong again) and a link to the
  actual profile. If there's no real Trustpilot presence yet, leave
  removed.

**Deferred: two other homepage illustrative-content items, kept as-is**
  (not fabricated-stat violations, just flagging the judgment call for
  review): `TruthModeSection`'s fixed "TapScore 94%" gauge and
  `AppShowcaseSection`'s example phone-mockup screens (sample
  leaderboard names, sample mission progress) are both presented as
  illustrative product-preview content, not live claims about a
  specific real event — kept, palette-only fix. Revisit if that read is
  wrong.

## 2026-08-07 — Claude Code — globals.css banned-hex cleanup

**Fixed: two current-block vars carried retired Neon gold hex**
- `--color-brand-yellow` and `--color-gold` sat in the "current" Aurora
  `@theme` block (not the "Legacy aliases" block below it) but held
  `#FFC442`, the retired TapCash Neon gold on `packages/tokens/tokens.json`
  `legacy.bannedHex`. Confirmed no component referenced the
  `text-gold`/`bg-brand-yellow` Tailwind utilities these vars back, so
  repointed both to the real Aurora gold (`#D9B678`) and moved them into
  the Legacy aliases block. Also repointed `--color-gold-300` the same way
  (was also `#FFC442`).

**Deferred: broader legacy Neon/Model U CSS still present (utility classes, gradients, glow)**
- `globals.css` still ships several hundred lines of retired-palette
  utility classes (`.glass-card`, `.btn-primary`, `.btn-gradient`,
  `.text-gradient-green-cyan`, Model U gradient classes, neon glow
  shadows) using the old `#00FF85`/`#7B5CF0`/`#18D9FF` hex directly, not
  through tokens. Confirmed several are still actively used by real
  components on this branch (`PremiumUi.tsx`, `AppPreview.tsx`, and the
  pre-Aurora `HeroSection.tsx` this branch still carries) -- removing them
  outright would break those pages' styling. This is the same scope
  already tracked under "Per-component raw-hex purge + contrast audit"
  below: migrate each dependent component to Aurora tokens first, then
  delete the dead legacy classes. Not attempted here; too large and too
  risky to do as a drive-by fix.

## 2026-08-05 — Hermes — UI/UX Phase 1 token foundation

**Deferred: Orphan component deletion (REDESIGN_SPEC §4.2)**
- ⏩ **PARTIALLY RESOLVED 2026-08-06** — Shayan gave explicit go-ahead to move
  (not yet delete) the orphans for review. Done on
  `agent/claude/038-track2-palette-foundation`: 31 unreferenced files (all
  6 Hero variants + 25 of the 26 "other orphans" — the 4 admin `*Premium`
  components were deliberately kept in place per the caveat below) moved to
  `_cleanup-2026-08-06/` with a README explaining the set; excluded from
  `tsconfig.json`/`eslint.config.mjs` so they carry no build cost while
  Shayan reviews. Verified zero remaining imports via repo-wide grep before
  moving, and `tsc --noEmit` clean after.
- Remaining action: Shayan confirms the moved set, then delete
  `_cleanup-2026-08-06/` outright (still needs Rule 14 approval for the
  actual deletion — moving isn't deleting).
- Caveat (from spec, honored): the four admin `*Premium` components are
  dark-theme replacements for the light admin pages shipping today —
  **kept in `src/`, not moved**, since `DEFERRED_WORK.md` line 35 records
  Shayan's confirmation that admin retheme uses them as the reference.

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

## 2026-08-06 — Claude Code — TASK-038 Offers page Aurora reskin

**Deferred: `globals.css` still carries retired-Neon hex in "current" var block**
- Scope: `src/app/globals.css` lines 24 and 32 — `--color-brand-yellow: #FFC442`
  and `--color-gold: #FFC442`. `#FFC442` is on the `legacy.bannedHex` list in
  `packages/tokens/tokens.json` (retired TapCash Neon gold), but these two
  vars sit in the "current" Aurora block (lines 16-32), not the "Legacy
  aliases" block below it (lines 34-50) where the rest of the retired hex
  correctly lives.
- Not fixed here: `globals.css` is owned by the track2-palette-foundation
  branch this work depends on, out of this task's file scope
  (`src/components/sections/OffersSection.tsx` and `src/components/OfferCard.tsx`
  only). Both new files avoid `--color-brand-yellow`/`--color-gold` entirely
  and use `--color-brand-green`/`-purple`/`-cyan` (correctly on-Aurora) and
  literal gold hex from `tokens.json` (`#F0CE97`/`#D9B678`/`#B98F4C`) instead,
  so nothing shipped in this PR references the stale vars.
- Action needed: whoever owns `globals.css` next should move those two vars
  into the "Legacy aliases" block (or repoint them at `#D9B678`) so no
  future component accidentally picks up banned Neon gold via Tailwind's
  `text-gold`/`bg-brand-yellow` utilities.

**Deferred: `OffersSection.tsx` offer list is static placeholder content**
- Scope: `src/components/sections/OffersSection.tsx` `OFFERS` array (8
  hardcoded games with fabricated prices/tags/images). Pre-existing before
  this pass; left untouched per task scope ("do not touch how offers are
  fetched/rendered functionally, only the visual layer") and per the
  standing anti-pattern about not silently fixing fabricated-data issues as
  a scope-creep side quest.
- Action needed: wire to a real offers feed (mirrors the mobile
  `loadOffers`/`/api/offers` pattern already used on `earn.tsx`) in a
  follow-up functional pass.

**Deferred: mobile offer detail screen (`mobile/app/(tabs)/offer/[id].tsx`) — partial retheme only**
- Fixed in this pass (palette-correctness + a real bug, both low-risk):
  swapped a hardcoded neon-green `rgba(0,255,133,...)` "thanks" banner to
  gold; fixed `tag` style referencing `theme.colors.elevated`, which does
  not exist on the regenerated `theme.ts` (was silently rendering
  transparent); switched the `startBtn` CTA from `theme.colors.purple` to
  `theme.colors.accent` (gold) to match the Start-Offer CTA convention used
  everywhere else.
- NOT done (explicitly lower priority per task instructions, left for a
  dedicated pass): the bordered/filled panel chrome on this screen
  (`GlassCard` usage for "Before You Start" / "Common Failure Reasons",
  and the `tagsRow` pills) still uses box/border layout language, not the
  spacing+shadow Aurora pattern applied to `OfferCard.tsx`/`earn.tsx` in
  this PR.
- Also flagged, not touched: "Real completions today: 1,240" (line ~160,
  `InfoRow label="Real completions today" value="1,240"`) is a fabricated
  stat, violating the standing `meta.antiPatterns` rule ("No fabricated
  statistics — live data ... or the surface doesn't render"). Needs wiring
  to a real value or removal, not a silent fix inside this visual-only PR.

**Deferred: `GlassCard` (`mobile/src/components/GlassCard.tsx`) references undefined theme colors**
- `tapCashTheme.colors.surfaceAlt` / `.surface` are read but don't exist on
  the regenerated `theme.ts` (only `surfaceBase` does) — same class of bug
  fixed in `OfferCard.tsx`/`earn.tsx` this pass, but `GlassCard` is a shared
  primitive used well beyond the offers surface, so fixing it here was out
  of scope. Needs its own audit of every `GlassCard` call site before
  patching, since its visual result is currently silently degraded
  (transparent fill) everywhere it's used.

**Deferred: mobile TypeScript verification blocked by environment**
- `mobile/node_modules` is not installed in this worktree; `npx tsc --noEmit`
  fails with `TS6053: File 'expo/tsconfig.base' not found` (module
  resolution, not a code error). Attempted `npm install` in `mobile/`;
  it did not finish inside a 280s budget — consistent with the
  already-documented Windows Defender/node_modules slowness issue on this
  machine (see the 2026-08-05 "Full gate re-run" entry above). Not
  re-attempted further per the standing guidance to note and move on rather
  than fight it.
- Web-side verification (the file scope that's actually new in this PR)
  passed: `npx tsc --noEmit` at repo root — clean, zero errors.
- Action needed: a future agent/session with a working `mobile/node_modules`
  should run `cd mobile && npx tsc --noEmit` against
  `mobile/src/components/OfferCard.tsx`, `mobile/app/(tabs)/earn.tsx`, and
  `mobile/app/(tabs)/offer/[id].tsx` to confirm no type errors were
  introduced by this pass.

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

## 2026-08-06 — Claude Code — TASK-037 admin frontend was broken by the auth migration (self-discovered, not from external review)

**Found and fixed: the entire admin dashboard was non-functional on this branch**
- While wiring CSRF into `requireAdminSession()` (see next entry below), I
  checked whether the admin frontend actually sends the required header —
  and discovered it doesn't send ANYTHING the new auth mechanism needs.
  Tasks 3/4/5 (this same phase) removed Bearer-token support from all 8
  `/api/admin/*` routes, but every admin frontend page (`src/app/admin/**`,
  31 fetch call sites across 9 files) still exclusively sent
  `Authorization: Bearer <firebase_id_token>` and never called
  `POST /api/auth/session` to mint the `admin_session` cookie. `AdminLayout`
  itself (the shared wrapper for all 8 admin pages) checked admin status by
  Bearer-pinging `/api/admin/withdrawals` — which now 401s unconditionally,
  so every real admin user would have been immediately redirected away from
  the entire admin panel.
- This was never caught because all of Tasks 2-9's verification was
  backend-only (jest with synthetic cookies, tsc, grep) — nothing exercised
  the actual frontend-to-backend request flow.
- Fixed: added `src/lib/adminApiClient.ts` (`adminFetch()` — drops the
  Bearer header, attaches `x-csrf-token` from the `csrf_token` cookie for
  non-GET requests), updated `AdminLayout` to mint the `admin_session`
  cookie via `POST /api/auth/session` instead of Bearer-pinging an admin
  route, and converted all 31 call sites across the 9 admin frontend files
  to use `adminFetch()`. Left `src/app/admin/page.tsx`'s one call to
  `/api/payout` on Bearer intentionally — that route is separate and
  wasn't migrated by TASK-037.
- Verified: `npx tsc --noEmit` clean, `npx eslint` 0 errors (only
  pre-existing warnings), full jest suite still 25/25/329 passed. Could NOT
  verify `npm run build` locally — see the local-build-crash entry below;
  relying on real CI (already green on `build` in this repo's `gate.yml`
  for prior pushes) as the authoritative check per this repo's established
  precedent.

**Note: local `npm run build` crashes on this machine (0xc0000142), unrelated to code**
- Both `next build` (Turbopack, default) and `next build --webpack`
  crash identically: `Next.js build worker exited with code: 3221225794`
  (= `0xc0000142` / `STATUS_DLL_INIT_FAILED` in hex) while spawning a child
  process, reproducible on 2 consecutive runs, occurring during
  `globals.css` processing under Turbopack — a file untouched by this PR.
  Since it reproduces identically under both bundlers, it's not a
  Turbopack-specific bug; it's a native child-process spawn failure on this
  machine. Matches the same class of local-environment issue already
  documented in the boardroom's `tapcash.md` (Windows Defender /
  `node_modules` interference) from earlier in this launch push.
- Not fixed here (infra, not code) — `npx tsc --noEmit` (full static type
  check) and `npx jest` (full suite) both pass clean, and this repo's real
  GitHub Actions CI (`gate.yml`, Linux runners) has repeatedly built this
  codebase successfully. Treat local build failures on this machine as
  unreliable; real CI remains authoritative, consistent with this repo's
  established practice (see TASK-036's PR body).

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

**Deferred: Snyk security scan in `.github/workflows/deploy.yml` is `continue-on-error` (soft gate), not registered until now**
- `.github/workflows/deploy.yml`'s `security` job runs `snyk/actions/node@master`
  with `continue-on-error: true`, deferring hard-gate enforcement until
  `SNYK_TOKEN` is confirmed configured as a repo secret. This deferral
  existed in the code/comment but was never captured here per Rule 12 —
  flagged by Qodo's review and recorded now (no code change; the deferral
  itself is correct, it just needed a register entry).
- Action needed: whoever has repo secrets access confirms `SNYK_TOKEN` is
  set, then flips `continue-on-error` to `false` (or removes it) so Snyk
  becomes a real hard gate rather than an informational scan.

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

**Doc gap, fixed (re-verification pass):** `docs/API_DOCUMENTATION.md`'s CSRF
method lists (lines ~29 and ~537) said "POST/PATCH/DELETE" while
`src/lib/csrf.ts`'s `validateCsrf()` actually enforces CSRF on every method
except `GET/HEAD/OPTIONS` (i.e. `PUT` too) — updated both lists to
"POST/PATCH/DELETE/PUT" to match code.

## 2026-08-06 — Claude Code — TASK-037 re-verification pass (second external review round)

**Fixed: `requestPayout` balance check race condition (critical, CodeRabbit)**
- `functions/src/index.ts`'s `requestPayout` computed `currentBalance` via a
  plain `.get()` query *before* `db.runTransaction(...)`, then checked it
  *inside* the transaction. Because the read never went through
  `transaction.get()`, Firestore registered no read on `ledger_transactions`
  for that transaction, so it couldn't detect a conflicting concurrent write.
  Two concurrent `requestPayout` calls for the same user could both observe
  the same stale balance, both pass the insufficient-funds check, and both
  create a cashout request — letting a user withdraw more than their actual
  balance (double-payout risk on a financial platform).
- Fixed: moved the `ledger_transactions` query inside the transaction via
  `transaction.get(query)`, so the balance read now participates in the
  transaction's optimistic-concurrency conflict detection, consistent with
  how `completeTask`'s transaction already reads `taskRef` via
  `transaction.get()`.
- Not caught by the original TASK-037 pass or the first review-fix commit
  (a88b7a8) — surfaced by a second round of CodeRabbit review after that
  commit landed. `functions/lib/index.js` was NOT hand-edited; regenerate it
  via `npm --prefix functions run build` before deploy.

**Deferred: `functions/` package still has zero automated test coverage for `requestPayout`'s transaction logic**
- The race-condition fix above was verified by code inspection and against
  Firestore's documented transaction semantics (all reads inside a
  transaction must precede writes, which the fix preserves), not by a test
  that reproduces the concurrent-request race. This is the same pre-existing
  gap as the "Firebase Functions v1→v2 migration has no automated test
  coverage" entry above — still open, still out of scope for this pass.
- Action needed: when the Functions test harness from the entry above is
  built, add a concurrency-focused test for `requestPayout` (two overlapping
  calls against the same seeded balance) to guard against this class of bug
  regressing.

**Blocked (pre-existing, environment): root `npx jest` could not be run to completion on this machine**
- `functions/` has its own `node_modules` (installed cleanly via
  `npm install --legacy-peer-deps`, `tsc` build clean) and `npx tsc --noEmit`
  at the repo root is clean (no native binaries involved). But `npx jest` at
  the root fails during `next/jest`'s config load:
  `Attempted to load @next/swc-win32-x64-msvc, ... next-swc.win32-x64-msvc.node
  is not a valid Win32 application`, followed by an ESM resolve error on
  `next.config.compiled.js`. The native SWC binary is present on disk but
  corrupted/unloadable.
- This matches the same class of pre-existing local-environment issue
  already logged above ("local `npm run build` crashes on this machine,
  0xc0000142") and in the boardroom's `tapcash.md` (Windows Defender /
  `node_modules` interference) — not something introduced by this pass's
  changes (`functions/src/index.ts`'s transaction fix and two doc edits).
  Did not attempt a destructive fix (e.g. force-reinstalling/rebuilding the
  native binary) per this task's instructions; deferring to real CI
  (`gate.yml`, Linux runners) as the authoritative check, consistent with
  this repo's established practice.
- Action needed: whoever has admin rights on this machine should apply the
  `Add-MpPreference -ExclusionPath "D:\AgentDevWork"` Defender exclusion
  documented in the boardroom's design doc, then reinstall `node_modules`
  from clean.

**Deferred: `package.json` dependency versions use caret ranges (Codacy: "variant versions may lead to dependency hijack/confusion attacks")**
- Codacy flagged `"next": "^16.3.0"` specifically (the line touched by an
  earlier commit on this branch, TASK-034's npm-audit-remediation work,
  which changed it from an exact-pinned `16.2.9` to a caret range). But
  every other dependency in `package.json` already uses `^` ranges too —
  this is the repo's existing, consistent convention, not something
  introduced uniquely by this PR. Pinning only `next` to an exact version
  while leaving the rest on `^` would be inconsistent and wouldn't
  meaningfully reduce supply-chain risk on its own.
- Not fixed in this pass: exact-pinning is a repo-wide dependency
  management policy decision (`package.json` + `functions/package.json`
  both affected), not a single-line fix, and out of scope for an
  admin-auth hardening PR.
- Action needed: Shayan/whoever owns dependency policy decides whether to
  move the repo to exact-pinned versions (with Renovate/Dependabot doing
  the version bumps via PRs instead of floating ranges) or accept caret
  ranges as-is with lockfile-pinning (`package-lock.json` already commits
  exact resolved versions, which mitigates most of the actual "hijack"
  risk this rule is warning about) as the accepted tradeoff.

**Deferred: no active admin-session revocation/logout path**
- CodeRabbit flagged that `admin_session` is a self-contained 24-hour JWT
  and `requireAdminSession()` only checks `payload.admin === true` — there
  is no server-side revocation list, so a role downgrade, a Firebase
  sign-out, or an admin being removed does not invalidate an
  already-issued `admin_session` cookie until it naturally expires (max
  24h). `src/app/admin/layout.tsx` also doesn't clear `admin_session`/
  `csrf_token` on exit.
- Not fixed in this pass: this is a real gap, but it's a new feature
  (session revocation/invalidation infrastructure), not a regression
  introduced by TASK-037's Bearer-to-cookie migration — the prior
  Bearer-token scheme had the equivalent problem (a leaked/valid Firebase
  ID token was usable until its own expiry with no revocation path
  either). Out of scope for an auth-migration hardening pass.
- Action needed: add a logout endpoint that clears `admin_session` +
  `csrf_token` cookies and is called from `AdminLayout`'s exit path, and
  consider a short-TTL + refresh pattern or a revocation-check
  (e.g. Firestore-backed session denylist) if 24h standing access after a
  role change is judged unacceptable risk.

**Declined (out of scope, mislabeled by tool): CodeRabbit's `middleware.ts` → `proxy.ts` rename suggestion**
- Flagged as a Next.js 16 deprecation note (`middleware.ts` deprecated in
  favor of a `proxy.ts` + named `proxy` export). The comment itself was
  misfiled against `functions/src/index.ts` by the review bot (that file
  has no `middleware` export) — the actual file in question is the root
  `middleware.ts`. This repo is currently on Next 16.3.0 where
  `middleware.ts` still works (it's deprecated, not yet removed). Not a
  TASK-037 regression and not touched in this pass; worth a small
  follow-up chore when the repo does its next Next.js bump.
- Action needed: rename `middleware.ts` → `proxy.ts` with a named `proxy`
  export in a dedicated `chore/` branch, unrelated to admin-auth work.

## Open decisions for Shayan (carried from REDESIGN_SPEC §8)
1. ⚠️ **SUPERSEDED 2026-08-06 (same day, later)** — Palette: Model U was
   confirmed earlier, then explicitly overridden later the same day when
   Shayan provided a reference app (`tapcash-frontend-design-request/`) and
   directed adoption of its palette instead — see
   `packages/tokens/tokens.json` v2.0.0 ("TapCash Neon") `meta.supersedes`
   / `meta.decisionLog` for the full reasoning, including which
   REDESIGN_SPEC anti-patterns were knowingly overridden (glow) vs. kept in
   force (fabricated stats, fake live-activity rows). Treat Model U as dead;
   don't resurrect it without checking with Shayan first — this has now
   flipped once already.
2. ✅ **RESOLVED 2026-08-06** — Admin: retheme dark via `*Premium` reference. Confirmed by Shayan explicitly (was previously assumed by Track 2's plan without confirmation — now genuinely settled). See `docs/superpowers/plans/2026-08-06-track2-uiux-redesign.md` Task 4.
3. ✅ **RESOLVED 2026-08-06** — Motion library: CSS + Reanimated (not Lottie). Confirmed by Shayan. See `docs/superpowers/plans/2026-08-06-track3-mobile-rebuild.md` for where this applies.
4. Icons: unify on Lucide (recommended) — de facto already true, no other icon library present in `package.json` as of 2026-08-06. Not a blocking decision, just needs a formal nod.
5. A/B infra (`landing/HeroDynamic` + `HeroV1Balanced`/`HeroV2Gaming`/`HeroV3Offers`): revive or delete — still open, tied to the orphan-component deletion decision (item below).
6. ✅ **RESOLVED** — Fabricated stats: wire to `/api/stats/platform` (already live). See Track 2 Task 2.
7. **NEW 2026-08-06, per Shayan explicitly:** every payment/brand logo (PayPal, Amazon, Tim Hortons, Steam, Visa, Bitcoin, Litecoin) must be that company's real official logo, sourced from their own brand/press kit — never AI-generated, never a lucide-icon/emoji stand-in. See Track 2 Task 6.
8. **NEW 2026-08-06:** contrast audit (WCAG AA, 4.5:1 text / 3:1 UI) was missing from Track 2's Batches A-C despite being REDESIGN_SPEC's own Phase 1 gate criterion paired with the hex purge — added as Track 2 Task 7.
