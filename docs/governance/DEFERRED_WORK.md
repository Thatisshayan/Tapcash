# Deferred Work Register

> Rule 12 — deferred work must survive the session. Entries are actionable by a future agent.

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
