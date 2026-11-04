# Workspace Cleanup Audit

**Date:** 2026-11-04
**Agent:** Claude Code (Opus 5.5)
**Scope:** Local workstation and git hygiene: worktrees, stashes, uncommitted files, stale local and remote branches, local vs remote sync. Done at Shayan's request ("organize the TapCash workspace first, make sure nothing unmerged is deleted"). The Dependabot PR backlog is handled in a separate pass.

## Starting state (2026-11-03)

| Check | Result |
|---|---|
| Worktrees | 1 (primary checkout, on `main`) |
| Stashes | None |
| `main` vs `origin/main` | In sync at `8872664` (PR #90 merge) |
| Untracked | `.serena/`, `audits/2026-08-31_Claude_FullSystem_Audit.md` |
| Local branches besides `main` | 5, all with remotes gone or PRs already merged/closed |
| Remote branches with no open PR | 1: `agent/codex/039-mobile-rebuild-plan` (PR #79 closed) |
| Open PRs | 41 (40 Dependabot, 1 sentinel #94) |

## Branch inspection before deletion (Rule 14)

Each branch was checked three ways: is the tip an ancestor of `main`; `git cherry main <branch>` for patches not in `main`; and, for every file the branch touched since its merge-base, whether the branch's version of that file matches `main`'s.

| Branch | Tip | PR | Result |
|---|---|---|---|
| `fix/ci-audit-gate` | `8313509` | #78 merged | Ancestor of `main`. Nothing unique. |
| `agent/claude/039-track3-mobile-rebuild-plan` | `d9d622b` | #87 merged | 0 unique patches; plan file identical in `main`. |
| `agent/vertex/038-uiux-redesign-plan` | `b81fe0d` | #80 merged | 0 unique patches; plan file identical in `main`. |
| `agent/codex/039-mobile-rebuild` | `a7cb14a` | #74, #77 merged | 1 patch not in `main` by hash (iOS Apple-cert deferred-work note). Every line of that version of `DEFERRED_WORK.md` is present in `main` (entry at "2026-08-11 ... EAS iOS build: blocked on revoked/invalid Apple Distribution Certificate"). Nothing unique. |
| `agent/codex/039-mobile-rebuild-plan` (local) | `c194c1b` | #79 closed | 2 patches not in `main` by hash; the plan file they produce is identical in `main`. Nothing unique. |
| `origin/agent/codex/039-mobile-rebuild-plan` (remote) | `b066709` | #79 closed | 8 files differ from merge-base. 5 identical to `main`. The other 3 are older versions of what `main` has: `deploy.yml` lacks the PR #90 smoke-test fix, and `package.json` / `package-lock.json` pin older dependency versions. Nothing unique. |

## Actions taken

1. **Backup first.** All 6 branch tips saved to `audits/private/2026-11-04_deleted-branches-backup.bundle` (gitignored, verified with `git bundle verify`, records complete history). To restore one: `git fetch audits/private/2026-11-04_deleted-branches-backup.bundle <ref>:<branch>`.
2. Deleted the 5 local branches above (`git branch -D`, needed because the squash/rebase-merged tips are not ancestors of `main`).
3. Deleted remote branch `origin/agent/codex/039-mobile-rebuild-plan`.
4. Added `.serena/` (Serena MCP local project config) to `.gitignore`, matching the convention in Shayan's other repos (Parle, LWA-*, LearnWithAlphonso, etc.).
5. Committed the previously untracked `audits/2026-08-31_Claude_FullSystem_Audit.md` (reviewed: no secrets). Note that its finding 5 / next action 1 (merge `fix/smoke-test-dns-tolerant`) has since been done via PR #90.

6. **Removed two orphaned worktree folders** under `.claude/worktrees/` (gitignored): `agent-a618b85576b08d2b2` and `agent-abe219eca94463f91`, both from 2026-08-31. Neither had a `.git` link and `git worktree list` didn't show them; they were half-deleted checkouts, probably from an interrupted worktree removal. They also caused false `doc-freshness` broken-link errors when `scripts/verify.sh` ran locally. Inspection before removal:
   - Every non-`node_modules` file (449 and 372) was hashed and compared, ignoring line endings, against every historical version of the same path across all refs. Raw hashes showed most as "missing", but only because the copies use CRLF and git stores LF (`core.autocrlf=false`).
   - Files no longer on `main` (`OBS-6_PHASE1_PROGRESS.md`, `REDESIGN_SPEC.md`, `UI_UX_DEEP_AUDIT_2026.md`, `_cleanup-2026-08-06/`) are all in history; they were intentionally removed by `93f4495` ("remove superseded pre-Aurora design artifacts").
   - Exactly one file differed from all history: `src/lib/__tests__/transaction-atomicity.test.ts`, identical in both folders. It is an abandoned 2026-08-06 attempt at the `Function`-type lint fix using `any`. `main` solved the same problem with stricter types in `f58e3c9` / `730a987`, so `main` is the better version. The diff is kept anyway at `audits/private/2026-11-04_orphan-worktree_transaction-atomicity-test.patch`.

Shayan approved the deletions in-session on 2026-11-04 ("yes please do all 3 of them ... make sure you are not deleting something that has not been merged").

## Finding: every PR fails the required gate on audit age

The `gate` job's `doc-freshness` step failed on Dependabot PR #136 (run `40414978403`) with `newest audit is 56 days old (>30)`. The newest dated audit was 2026-08-31, so every open PR currently fails the required gate for that reason alone. This audit (dated 2026-11-04) resets the clock. That same run also failed `build / test` with an npm `ERESOLVE` peer-dependency error, which is specific to that PR's dependency changes and is covered in the Dependabot triage pass.

## Dependabot backlog findings (for the next pass)

- 40 open PRs. Every PR opened since 2026-10-05 fails the `gate` on audit age only, except #136 and #143. PRs opened in September passed the gate when CI last ran.
- #136 (52-update group) fails with `ERESOLVE`: TypeScript 7 is incompatible with `ts-jest@29`. It also bundles 7 major upgrades. Logged in `docs/governance/DEFERRED_WORK.md`.
- #143 fails `npm ci`: it updates `mobile/package-lock.json` but not the root lockfile, which owns `mobile` as a workspace.
- #94 (sentinel) adds an unused `@trpc/server` without a lockfile update and targets a failure on `6bb7aed` (2026-08-31) that `main` has moved past. Closed with Shayan's approval.
- The `Security Scan` (`npm audit`) job fails on every PR; this predates this work and is also logged in `DEFERRED_WORK.md`.
- Shayan's decision: merge the minor and patch PRs one at a time, rebasing after each.

## End state

- Local branches: `main` plus this PR's branch `chore/workspace-cleanup`.
- Remote branches: `main` plus Dependabot and sentinel PR branches, each with an open PR.
- No stashes, a single worktree, nothing unpushed except this PR's branch.
