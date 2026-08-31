# Dirty Worktree and Branch Inventory Audit

**Date:** 2026-08-22
**Agent:** Codex
**Scope:** Audit the current dirty worktree, classify whether changes look intentional, and inventory local/remote/GitHub branch state.

## Inputs reviewed

- `git status --short`
- `git diff --name-status`
- `git diff --summary`
- `git diff --numstat`
- `git diff -- .env.example`
- `git branch -vv`
- `git branch -r`
- `git for-each-ref refs/heads`
- `git log --oneline` on affected paths
- `gh pr list --state all --limit 100 --json number,title,state,isDraft,headRefName,baseRefName,updatedAt,url`
- Current and prior audits:
  - `audits/2026-07-23_Hermes_GovernanceBootstrap_Audit.md`
  - `HEAD:audits/2026-08-05_Hermes_UIUXPhase1Tokens_Audit.md`
  - `HEAD:audits/2026-08-06_Claude_TASK037-PR59-ReVerification_Audit.md`

## Worktree findings

### Finding 1 — The dirty worktree is not a single coherent cleanup

The worktree currently contains:

- `1` modified file: `.env.example`
- `74` deleted tracked files
- `0` staged changes

The deletions split into two different groups:

1. Likely intentional archival/design cleanup
- `_cleanup-2026-08-06/**` (`32` files)
- `docs/superpowers/**` (`5` files)
- top-level planning/audit docs such as `REDESIGN_SPEC.md`, `UI_UX_DEEP_AUDIT_2026.md`, `ASSETS_REQUIRED.md`

2. High-risk active files whose deletion leaves live references behind
- `.github/workflows/deploy.yml`
- `.audit-allowlist.json`
- `scripts/audit-gate.mjs`
- `src/app/api/ledger/summary/route.ts`
- `src/lib/admin-session.ts`
- `src/lib/adminApiClient.ts`
- `src/lib/currency.ts`
- `shared/currency.ts`
- `mobile/src/lib/deepLinks.ts`
- `mobile/src/lib/currency.ts`
- test files and mobile assets tied to current code paths

Verdict: this does **not** look like a safely completed cleanup. It looks like a mixed pile of deletions from multiple efforts, with active runtime/CI files removed before callers were updated.

### Finding 2 — Live callers still reference deleted runtime files

Confirmed current worktree references to deleted files:

- `mobile/app/_layout.tsx` imports `../src/lib/deepLinks`
- `mobile/app/(tabs)/offer/[id].tsx` imports `../../../src/lib/currency`
- `mobile/src/components/OfferCard.tsx` imports `../lib/currency`
- `mobile/src/lib/api.ts` calls `/api/ledger/summary`
- `src/app/dashboard/page.tsx` calls `/api/ledger/summary`
- `src/app/cashout/page.tsx` calls `/api/ledger/summary`
- `src/app/cashout/status/page.tsx` calls `/api/ledger/summary`
- `src/app/api/debug/ledger-summary/route.ts` imports `@/app/api/ledger/summary/route`
- multiple admin pages import `@/lib/adminApiClient`
- multiple admin API routes import `@/lib/admin-session`

Verdict: these deletions are **not intentional in a shippable sense**. In the current filesystem state, they imply broken imports and missing route handlers.

### Finding 3 — CI/governance deletions are especially risky

Deleted CI/governance files:

- `.github/workflows/deploy.yml` (`305` deleted lines)
- `scripts/audit-gate.mjs` (`98` deleted lines)
- `.audit-allowlist.json` (`95` deleted lines)

Current repo still has `.github/workflows/gate.yml`, but docs and scripts still reference the deleted deploy workflow and audit gate:

- `package.json` still defines `"audit:gate": "node scripts/audit-gate.mjs"`
- `docs/governance/DEFERRED_WORK.md` contains many references to `.github/workflows/deploy.yml`, `scripts/audit-gate.mjs`, and `.audit-allowlist.json`

Relevant path history shows these files were part of recent CI work on this branch:

- `bc4bf19` `fix(ci): add scoped npm audit gate so mobile toolchain advisories stop blocking deploys`
- `72fddcd` `fix(ci): Deploy Preview also needs --yes for non-interactive confirmation`

Verdict: deleting these files without coordinated replacement is **high risk** and looks more like an interrupted branch operation than a completed cleanup.

### Finding 4 — The mobile/tooling deletions conflict with recent committed work

Deleted mobile/tooling files include:

- `mobile/src/lib/deepLinks.ts`
- `mobile/src/lib/currency.ts`
- `mobile/assets/adaptive-icon.png`
- `mobile/assets/splash.png`
- `packages/tokens/build.mjs`
- `packages/tokens/tokens.json`
- `packages/tokens/tokens.test.ts`
- `public/images/aurora/*.webp`

Relevant history:

- `facacab` `feat(mobile): Track 3 rebuild hardening — real assets, crash fix, deep links, Interac freeze parity`
- `67d4db2` `fix(mobile): address valid CodeRabbit + Codacy review findings on PR #74`
- `7cf4fbe` `chore(ci): refresh audit waivers after the Dependabot batch`

Current files still reference these deleted assets/config sources:

- `mobile/app.json` and `mobile/app.config.js` reference the deleted splash/adaptive icon assets
- `mobile/src/theme.ts` comments still treat `packages/tokens/tokens.json` as source of truth
- `src/components/sections/HeroSection.tsx` still references deleted Aurora images

Verdict: these deletions look **accidental or incomplete**, not like an intentional retirement of the Aurora/mobile/token system.

### Finding 5 — Some deletions look plausibly intentional but still violate repo rules if committed

The following groups may have been intentionally removed as obsolete artifacts:

- `_cleanup-2026-08-06/**`
- `docs/superpowers/**`
- old one-off top-level design/planning docs
- older audit files

However, repository rules explicitly prohibit file deletion without Shayan's approval.

Verdict: even the "probably intentional" deletions are not merge-ready without explicit approval and linked doc/governance updates.

### Finding 6 — `.env.example` change is intentional-looking and low risk

Only content edit:

- `NEXT_PUBLIC_APP_URL`: `https://tapcash.online` -> `https://tapcash.com`
- `NEXTAUTH_URL`: `https://tapcash.online` -> `https://tapcash.com`

Verdict: this looks intentional and internally consistent, assuming `tapcash.com` is now the canonical domain. It is the only change in the dirty worktree that currently looks straightforward.

## Branch inventory

### Remote branches that currently exist on `origin`

- `origin/main`
- `origin/fix/ci-audit-gate`
- `origin/agent/codex/039-mobile-rebuild`
- `origin/agent/codex/039-mobile-rebuild-plan`
- `origin/agent/vertex/038-uiux-redesign-plan`
- `origin/dependabot/github_actions/actions/setup-node-7`
- `origin/dependabot/github_actions/dawidd6/action-send-mail-18`

### Local branches that still track gone upstream branches

These local branches remain, but `origin/<branch>` is gone:

- `agent/claude/036-track1-phase1-build-fix`
- `agent/claude/037-track1-phase2-hardening`
- all `agent/claude/038-*` branches
- `agent/hermes-governance-bootstrap`
- `agent/hermes-uiux-phase1-tokens`
- `agent/hermes/tapcash-phase0-unblock`
- `feat/netlify-sentry-observability`
- `redesign/landing-page-v2`
- `sentinel/batch-1-tasks-1-1`
- `sentinel/work-1785751739949`
- all `worktree-agent-*` branches

These mostly correspond to already merged PRs and stale worktree/ephemeral branches.

### Local branches tracking `origin/main`

- `docs/defer-codacy-pr81-findings` — behind `origin/main` by `1`
- `fix/typescript-ts-jest-peer-conflict` — behind `origin/main` by `40`
- `main` — behind `origin/main` by `65`

### Active local branches with live upstreams

- `fix/ci-audit-gate`
- `agent/codex/039-mobile-rebuild`
- `agent/codex/039-mobile-rebuild-plan`

### Local branch with no configured upstream

- `agent/vertex/038-uiux-redesign-plan`

## GitHub PR state

### Open PRs as of 2026-08-22

- `#86` `dependabot/npm_and_yarn/dependencies-d55e45ee2a`
- `#85` `dependabot/github_actions/actions/checkout-7`
- `#84` `dependabot/github_actions/actions/setup-python-7`
- `#80` `agent/vertex/038-uiux-redesign-plan`
- `#79` `agent/codex/039-mobile-rebuild-plan`
- `#78` `fix/ci-audit-gate`
- `#77` `agent/codex/039-mobile-rebuild` (draft)

### Key merged PRs corresponding to stale local branches

- `#83` `docs/defer-codacy-pr81-findings`
- `#82` `fix/typescript-ts-jest-peer-conflict`
- `#81` `feat/netlify-sentry-observability`
- `#74` `agent/codex/039-mobile-rebuild`
- `#73`..`#65` multiple merged `agent/claude/038-*`
- `#60` `agent/claude/038-track2-palette-foundation`
- `#59` `agent/claude/037-track1-phase2-hardening`
- `#57` `agent/claude/036-track1-phase1-build-fix`
- `#56` `agent/hermes-uiux-phase1-tokens`
- `#55` `sentinel/work-1785751739949`
- `#49` `agent/hermes/tapcash-phase0-unblock`
- `#39` `agent/hermes-governance-bootstrap`
- `#16` `redesign/landing-page-v2`

## Overall verdict

1. The dirty worktree is **not safe to treat as an intentional cleanup branch**.
2. A subset of deletions look archival, but a material subset remove still-referenced runtime, mobile, asset, audit-gate, and workflow files.
3. The branch topology is cluttered: a small number of active remote branches exist, while many local branches are stale remnants of already merged work or detached worktrees whose upstreams were deleted.
4. Before any branch cleanup or merge work, the highest-priority truth is that the current filesystem state contains probable breakage and should not be pushed as-is.

## Recommended next actions

1. Preserve the current dirty state as evidence only; do not commit or push it as-is.
2. Separate the worktree paths into:
   - archival deletions that may be intentional
   - active-code/CI deletions that need restore or replacement
3. Review open PR branches `#78`, `#79`, `#80`, `#84`, `#85`, `#86`, and draft `#77` one by one against current `origin/main`.
4. Decide which stale local branches can be retired after confirming their PRs are merged and no local-only commits remain.
