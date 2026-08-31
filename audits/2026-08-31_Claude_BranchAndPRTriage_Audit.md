# Branch and PR Triage Audit

**Date:** 2026-08-31
**Agent:** Claude (Sonnet 5)
**Scope:** Diagnose and resolve the dirty `fix/ci-audit-gate` worktree, categorize a 74-file uncommitted deletion, sync the branch with its remote, clean up stale local branches, and triage the 9 open PRs.

## Inputs reviewed

- `git status`, `git reflog`, `git cherry`, `git diff --stat` across `fix/ci-audit-gate`, `main`, and every local/remote branch
- Prior audit: `audits/2026-08-22_Codex_DirtyWorktreeAndBranchInventory_Audit.md`
- `gh pr list --state open --json ...` and `gh pr checks` for PRs #77-#89
- CI failure logs via `gh run view --log-failed` for PRs #78, #79, #80, #87
- Live-code grep for every file in the 74-file uncommitted deletion, to separate old/superseded design artifacts from active runtime/CI code

## Findings

### 1. The 74-file uncommitted deletion (first flagged 2026-08-22) was a mixed pile, not a coherent cleanup

Confirmed the 2026-08-22 audit's verdict independently via live-reference grep. Split into two groups:

- **Group A — genuinely superseded pre-Aurora design artifacts (44 files).** No live imports found anywhere in `src/`, `mobile/`, or `packages/`. Includes `_cleanup-2026-08-06/**` (32 rejected "Premium" component drafts), old top-level planning/audit docs (`REDESIGN_SPEC.md`, `UI_UX_DEEP_AUDIT_2026.md`, `ASSETS_REQUIRED.md`, `OBS-6_PHASE1_PROGRESS.md`, `28.07.2026HermesDetailALLinOneAuditReport.md`, `docs/SHAYAN_LAUNCH_ACTION_ITEMS.md`), two old dated audits, and `docs/superpowers/{mockups,notes,plans}` scratch files.
- **Group B/C/D/E — live code, wrongly caught in the same deletion (~30 files).** Confirmed active imports/callers for all of: `packages/tokens/{tokens.json,build.mjs,tokens.test.ts}` and `public/images/aurora/*.webp` (the *current* Aurora v3 design system's own token source and hero assets, not an old system), `src/lib/{currency,admin-session,adminApiClient}.ts` and `shared/currency.ts` (used across admin panel, cashout, dashboard), `src/app/api/ledger/summary/route.ts` (called by dashboard/cashout/mobile), `mobile/src/lib/{currency,deepLinks}.ts`, and the CI/governance files (`.github/workflows/deploy.yml`, `scripts/audit-gate.mjs`, `.audit-allowlist.json`, `scripts/gate.yml`).

**Action taken (approved by Shayan):** restored the full working tree to `HEAD` (`git checkout HEAD -- .`), then deleted and committed only Group A in commit `93f4495` ("chore: remove superseded pre-Aurora design artifacts", 45 files, 10477 deletions). Groups B–E were left untouched.

**Side effect noted:** Group A included the two most recent audit docs (`2026-08-05`, `2026-08-06`), which dropped the newest tracked audit to `2026-07-23` (39 days old), tripping the governance gate's `doc-freshness` check (`scripts/verify.sh` requires an `audits/*.md` file dated within 30 days). This audit resolves that.

### 2. `fix/ci-audit-gate` had diverged from its own remote

Local branch was 4 commits ahead / 52 behind `origin/fix/ci-audit-gate` (the remote had since absorbed PR #82's TypeScript pin and ~50 other merges). Merged `origin/fix/ci-audit-gate` into local (commit `012a5c6`), resolving 3 conflicts by taking origin's version in each case (`.audit-allowlist.json` and `scripts/audit-gate.mjs` — origin's was a strict superset adding Windows `execFileSync` compat; `package-lock.json` regenerated cleanly since `package.json` merged without conflict). Verified `npm run audit:gate` passes post-merge. Pushed to `origin/fix/ci-audit-gate`.

### 3. Stale local branch cleanup

Deleted 27 local branches:

- 20 with zero commits ahead of `main` (already merged, direct ancestors): `agent/claude/036-track1-phase1-build-fix`, `agent/claude/037-track1-phase2-hardening`, all `agent/claude/038-*-aurora` branches, `agent/claude/038-track2-palette-foundation`, `agent/hermes-uiux-phase1-tokens`, `redesign/landing-page-v2`, all `worktree-agent-*` branches.
- 7 confirmed merged via squash/merge on GitHub (not direct ancestors locally, but `gh pr list --state merged --search head:<branch>` confirmed a merged PR for each): `agent/hermes-governance-bootstrap` (PR #39), `agent/hermes/tapcash-phase0-unblock` (PR #49), `feat/netlify-sentry-observability` (PR #81), `sentinel/batch-1-tasks-1-1` (PR #42), `sentinel/work-1785751739949` (PR #55), `docs/defer-codacy-pr81-findings` (PR #83), `fix/typescript-ts-jest-peer-conflict` (PR #82).

Also removed 7 stale `.claude/worktrees/agent-*` worktree directories tied to those branches, after confirming each was clean (no uncommitted changes).

Remaining local branches: `main`, `fix/ci-audit-gate`, the 4 branches backing still-open PRs (#77, #79, #80, #87), and 6 `branchops/*-restack` branches in temp worktrees (mid-triage, see below).

### 4. Open PR triage (#77-#89)

Discovery: PRs #78, #84, #85, #87, #88, #89 had already been restacked onto current `main` by a prior session (via `branchops/*-restack` branches) and pushed — their governance-gate, tests, and security-scan checks pass. The only remaining failures across all of them were:

- **Deploy Preview** — `Error: The token provided via --token argument is not valid` — an expired/invalid `VERCEL_TOKEN` GitHub secret (pre-existing, previously logged in this branch's own history: `docs(governance): record VERCEL_TOKEN is invalid, blocking Deploy Preview job`). Not a code issue.
- **CodeFactor** — third-party grading check, not part of the required governance gate.

#79 and #80 are stale (last CI run 2026-08-16) and fail for real: `npm error ERESOLVE` on `typescript@7.0.2` vs `ts-jest`'s `<7` peer requirement (fixed on `main` via PR #82, not yet rebased into these branches), and `npm audit --audit-level=high` failing on a transitive `image-size` DoS advisory in the Expo/Metro toolchain (the exact class of finding `fix/ci-audit-gate`'s waiver work addresses, also not yet rebased in).

#77 is a draft with real, unresolved merge conflicts (`mergeable_state: dirty`), blocked on an external, non-code issue (revoked Apple developer certificate for iOS EAS builds).

## Verdict

1. The 74-file deletion is now correctly split: Group A (superseded design artifacts) is committed and gone; Groups B-E (live Aurora assets, core app logic, CI infra) are restored and untouched.
2. `fix/ci-audit-gate` is synced with its remote and pushed.
3. Local branch/worktree clutter reduced from ~40 branches to the set that's actually still in flight.
4. #78/#84/#85/#87/#88/#89 are functionally ready pending the `VERCEL_TOKEN` rotation (done as of this session) and CodeFactor (non-blocking, external).
5. #79 and #80 need the same restack #87 already received.
6. #77 remains externally blocked (Apple cert) and in draft.

## Recommended next actions

1. Re-run/verify Deploy Preview on #78/84/85/87/88/89 now that `VERCEL_TOKEN` has been rotated.
2. Restack #79 and #80 onto current `main`.
3. Merge #78/84/85/87/88/89 once green (standard merge-commit convention, branch auto-deletes per repo settings).
4. Leave #77 until the Apple cert is renewed.
