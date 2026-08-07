# Deferred Work Register

> Rule 12 — deferred work must survive the session. Entries are actionable by a future agent.

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
