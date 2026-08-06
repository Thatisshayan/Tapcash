# 2026-08-05 Hermes UIUX Phase 1 Tokens Audit

**Agent:** Hermes (U)
**Repo:** TapCash (`D:\AgentDevWork\repos\tapcash`)
**Issue:** OBS-6 "UI UX REDESIGN" — resume Phase 1
**Spec:** `REDESIGN_SPEC.md` §2 (Token Architecture) + §6 (Implementation Sequence, Phase 1)
**Branch:** `agent/hermes-uiux-phase1-tokens`

## Phase 1 scope (from spec)
> Phase 1 — Token foundation: one palette, shared build, contrast fixes, delete orphans.
> Gate: 0 raw hex in `src/**/*.tsx`, all pairs ≥ AA.

## What I found

### Token drift (the core Phase 1 problem)
- Web (`src/app/globals.css` `@theme` block) already uses **Model U** (`#050813` / `#31F06F` / `#7C3DFF` / `#18D9FF`). ✅
- **Mobile (`mobile/src/theme.ts`) was still on the LEGACY palette**: `#0d0d1a` base, `#00FF85` green, `#7B5CF0` purple, `#00D4FF` cyan, `#FFAB00` gold. ❌
  This is exactly the hand-maintained drift the spec calls out — two files, two palettes, no shared source.

### Other Phase 1 items (status)
- **Shared token source (`packages/tokens/`)** — DONE this run (single `tokens.json` → generates mobile theme; web parity enforced by test).
- **Contrast fixes** — partially addressed: mobile `dim` moved from `rgba(255,255,255,0.25)` (legacy, ~1.74:1) to `#7B8AA8` (tertiary, ≥4.5:1) via the generated theme. Full per-component contrast audit = Phase 1 follow-on (see Deferred).
- **Delete orphans** (6 Hero + 26 components) — **NOT DONE**: blocked by REPO_RULES Rule 14 (no file deletion without Shayan's explicit approval). Listed in DEFERRED_WORK.md with the spec's harvest caveat.
- **0 raw hex in `src/**/*.tsx`** — NOT achieved: ~1153 raw hex literals exist across components. This is a large, scoped follow-on, not a one-run task. The token *foundation* (shared source + parity test) is the correct first slice and is what this run delivers.

### Environment blocker (honest disclosure)
- `node_modules` was partially broken on this machine (missing `jest/package.json`, `next/package.json` manifests despite dirs present) so `npx jest`, `npm test`, `tsc`, and `next build` could not run. A `npm ci` reinstall was started in the background to restore a runnable verify path. Until it completes, **the repo's own gates (test/lint/build) have NOT been re-run this session** — the drift test (`packages/tokens/tokens.test.ts`) is committed but its green status is pending the install.

## Deliverables this run
1. `packages/tokens/tokens.json` — canonical Model U token source of truth.
2. `packages/tokens/build.mjs` — generates `mobile/src/theme.ts` from the source (regenerates mobile to Model U, removes emoji sample iconography per anti-patterns).
3. `packages/tokens/tokens.test.ts` — CI-able parity test: mobile + web both resolve to Model U; no banned legacy hex in either output.
4. `mobile/src/theme.ts` — regenerated (now Model U, backwards-compatible keys preserved: `card`, `elevated`, `bg`, `green`, etc.).
5. This audit; `docs/governance/DEFERRED_WORK.md` entry for orphans + hex purge.

## Verification evidence
- `node packages/tokens/build.mjs` → exited 0, wrote `mobile/src/theme.ts` with `#050813`/`#31F06F`/`#7C3DFF`/`#7B8AA8`.
- `grep` confirms generated theme contains all mobile-imported keys (`theme.colors.elevated`, `theme.colors.card`, `theme.colors.bg`, `theme.radius.*`, `theme.spacing.*`, `theme.font.*`).
- **Pending:** `jest packages/tokens/tokens.test.ts` + full `npm test` + `tsc --noEmit` once `npm ci` finishes.

## Next steps (ordered)
1. Run `npm ci` (in progress), then `jest packages/tokens/tokens.test.ts` → confirm green.
2. Phase 1 follow-on (new branch/PR): per-component raw-hex purge + contrast audit (≥ AA text / ≥ 3:1 UI).
3. Phase 1 follow-on: orphan deletion — needs Shayan approval per Rule 14; harvest `*Premium` admin styling first per spec §4.2 caveat.
4. Phase 2 (a11y): labels, ARIA, Modal primitive, mobile a11y props.
