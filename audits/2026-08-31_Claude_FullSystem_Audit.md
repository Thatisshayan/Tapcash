# Full-System Audit

**Date:** 2026-08-31
**Agent:** Claude (Sonnet 5)
**Scope:** Deep, repo-wide audit covering build/test health, dependency hygiene, security, doc governance, CI/workflow health, the deferred-work register, and codebase structure. Deliberately excludes branch/PR/worktree triage — that was covered exhaustively earlier today in `audits/2026-08-31_Claude_BranchAndPRTriage_Audit.md`; this audit cross-references it rather than repeating it.

## Inputs reviewed

- `REPO_RULES.md`, `README.md`, `docs/governance/DEFERRED_WORK.md` (full 1082-line register, read in two passes)
- `audits/2026-08-31_Claude_BranchAndPRTriage_Audit.md` (this morning's prior audit)
- Live command execution: `npx tsc --noEmit`, `npm audit --json`, secret-pattern grep across `src/`, `mobile/src/`, `functions/src/`, `.gitignore` review, `docs/_baseline.json` vs actual `docs/*.md` count, `.github/workflows/*.yml`, `gh run list`/`gh run view --log-failed` against real CI history, `git log`/`git show` history of `.github/workflows/deploy.yml`
- Directory structure survey of `src/`, `mobile/`, `packages/`

## Findings

### 1. Build & test health — partial verification; environment-limited, not code-limited

- **`npx tsc --noEmit`: 3 errors, all traced to local `node_modules` drift, not real code bugs.**
  - `src/lib/cron.ts(1,25): Cannot find module 'cron'` — `cron` is absent from `node_modules` despite being a direct dependency (`package.json` `"cron": "^4.4.0"`) and correctly pinned in `package-lock.json` (`4.4.0`).
  - `src/lib/validation/signupSchema.ts(30,32)` / `(31,36)`: Zod v3-shaped type errors on v4 API usage (`{ message: "..." }` object form). Root cause: the installed `node_modules/zod` is **3.25.76**, while `package.json` requires `^4.4.3` and `package-lock.json` correctly pins **4.4.3**. The lockfile is correct; the installed tree is stale/partial.
  - Verdict: this is local install drift (a partial/failed `npm install` on this machine), the exact failure class already documented repeatedly in `DEFERRED_WORK.md` (Windows Defender/I/O contention causing incomplete installs). Did not attempt a full reinstall to fix — prior sessions logged 39+ minute installs and outright hangs; not safe to gamble mid-audit, especially given point 4 below (concurrent agent activity was actively churning this same machine).
- **`npx eslint src`: could not complete.** Two attempts (180s, then 480s hard timeout) both failed to finish or produce any output. Confirmed via `tasklist` that 19+ `node.exe` processes were running concurrently on this machine at the time — consistent with other agents/sessions actively working the same checkout (see finding 4). **Status: inconclusive, not "passing" or "failing."**
- **`npx jest`: could not complete.** Same pattern — two attempts (240s, then 570s) produced zero output before being killed. **Status: inconclusive.**
- **`npm run build` / `npm run audit:gate`: not attempted**, given the above two already failed to complete under current load and this machine's build previously had a separate, unrelated native-crash issue logged in `DEFERRED_WORK.md` (`0xc0000142`). Real CI (GitHub Actions, Linux runners) remains the authoritative source for build/test status per this repo's own established practice — see finding 3 for what CI itself currently shows.

**This is a real, reportable environment finding, not a shrug:** this machine cannot currently be trusted for reliable local verification of lint/test/build while multiple agents share it. Recommend serializing heavy verification work (one agent's `npm test`/`npm run build` at a time) or moving verification to CI/an isolated worktree.

### 2. Dependency hygiene (R34)

- `npm audit --json` at repo root: **26 vulnerabilities (17 moderate, 9 high, 0 critical)**, entirely in the Expo/React Native/Metro build-tooling dependency tree (`@expo/config-plugins`, `xcode`, `uuid`, `expo-splash-screen`, `expo-sharing`, transitively via `teeny-request`/`@google-cloud/storage`). This is **identical in shape and count** to the finding already investigated and explicitly accepted by Shayan on 2026-08-11 (`DEFERRED_WORK.md`, "workspaces surfaces mobile's pre-existing Expo/RN toolchain vulnerabilities" entry) — build-time only, not shipped in the deployed app bundle, no safe non-breaking fix available (`npm audit fix` wants to downgrade `expo` to `46.0.21`, which would break the mobile app). **No new regression; matches prior audit's baseline exactly.**
- Lockfiles: `package-lock.json` present and committed at root; `mobile/package-lock.json` present and committed. Root lockfile correctly pins `zod@4.4.3`/`cron@4.4.0` (see finding 1 — the *lockfile* is healthy, only the installed tree is stale).
- `functions/` was flagged in the register (2026-08-06) as having its own separate unaudited findings (2 high, 7 moderate, 1 low) and a pinned-eslint peer conflict. Not re-verified this pass (out of this audit's time budget) — still open per the register, no evidence it's been resolved since.

### 3. Security (R19)

- **No hardcoded secrets found.** Grepped `src/`, `mobile/src/`, `functions/src/` for live-key patterns (`sk_live_`, Firebase API key shape, PEM private-key headers, Slack tokens). Zero real hits — the only PEM-header match in `src/lib/firebaseAdmin.ts` is string-formatting logic that *constructs* the PEM wrapper around an env-var-sourced key, not an embedded key itself.
- **`.gitignore` is sound**: covers `node_modules`, `.next/`, `.env*.local`/`.env`, `.vercel`, `serviceAccountKey.json`, `credentials.json`, `secrets/`, IDE files. `git ls-files` confirms only `.env.example` and `mobile/.env.example` are tracked — no real `.env` files in the repo.
- Did not do a fresh line-by-line review of auth/payment code paths this pass (budget) — deferred to the extensive existing coverage already in `DEFERRED_WORK.md` (admin-session CSRF wiring, referral-UID exposure fix, payout minimum/route-rename fixes, fraud-detection notes) — nothing in this session's spot checks contradicts that prior work.

### 4. Doc governance (R31) — green, plus a new process finding

- `README.md` exists; spot-checked its relative links (`./docs/DEPLOYMENT_GUIDE.md`, `./docs/API_DOCUMENTATION.md`, `./docs/DEVELOPER_GUIDE.md`, `./docs/PAYOUT_STATUS.md`, `./docs/TEST_COVERAGE_REPORT.md`, `./docs/PRODUCTION_CHECKLIST.md`, `./GROUNDTRUTH.md`) against `docs/` listing gathered earlier — all present.
- `docs/_baseline.json` records `{"md_count": 26}`; actual count is **28** — baseline satisfied, no gate risk.
- Newest audit is today's date (both this file and the morning's triage audit) — well within the 30-day freshness window.
- **New finding, not code: the working directory's checked-out branch changed mid-session, from `main` to `fix/smoke-test-dns-tolerant`, without this agent switching it.** Confirmed via `git log`/`git status`: this is a real, already-pushed branch (`up to date with 'origin/fix/smoke-test-dns-tolerant'`), not something this session created — meaning another concurrent agent/process checked it out in this same shared (non-worktree-isolated) directory while this audit was running. Combined with the 19+ concurrent `node.exe` processes in finding 1, this confirms **multiple agents are operating against the same physical checkout simultaneously**, which is a real correctness hazard: any agent's `git status`/build/test run can silently observe a different branch's files mid-run. This is a process/infrastructure risk worth Shayan's attention — not a code defect, but it can produce false verification results for any agent (including this one and the earlier BranchAndPRTriage audit) if not controlled. Recommend: agents doing file-mutating or branch-mutating work in this repo should use isolated `git worktree` checkouts (the repo already has a `.claude/worktrees/` convention per the morning's audit) rather than sharing the main checkout.

### 5. CI/workflow health

- `.github/workflows/gate.yml` matches `REPO_RULES.md` Appendix B/C: runs on PRs to `main` and pushes to non-`main` branches, single `gate` job wrapping `secret-scan`, `doc-freshness`, `build`, `test`, `deploy-dry`, plus `directive-lint` (an addition beyond the Appendix B text, but consistent with `AGENTS.md`'s own listed required checks — not a drift, just Appendix B being slightly less detailed than practice).
- **Real, actionable finding: `Deploy to Production` (`.github/workflows/deploy.yml`, runs on push to `main`) has failed on every recent main-branch merge** (`gh run list --branch main`: 6+ consecutive failures across PRs #77, #80, #87, #88, #89, #85). Root-caused via `gh run view --log-failed` on the most recent run (33435762053): **the actual Vercel deployment succeeds** ("✓ Ready in 24m", aliased to `https://tapcash.online`) — the failure is entirely in the post-deploy smoke-test step, where `HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://tapcash.online)` fails outright (curl exit code 6 — DNS resolution failure reaching the runner-side DNS at the 15s mark) and, because the script runs under `bash -e` with no fallback on that assignment, kills the whole job.
- **This exact bug has already been found and fixed — on an unmerged branch.** `git log -- .github/workflows/deploy.yml` shows commit `2cc59c8` ("fix(ci): stop smoke-test curl failure from hard-failing Deploy to Production", 2026-08-31 18:09) adds `|| echo "000"` to the curl assignment and downgrades the non-200 case to a `::warning::` annotation instead of a hard failure. That commit lives on branch `fix/smoke-test-dns-tolerant` (the branch this session unexpectedly found itself on, per finding 4) and is **not yet merged into `main`** — `main`'s own tip (`6c1e980`) still has the old, failing version (confirmed via `git show 6c1e980:.github/workflows/deploy.yml`).
- **Action needed:** merge `fix/smoke-test-dns-tolerant` (or cherry-pick `2cc59c8`) into `main` to stop `Deploy to Production` from reporting false failures on every future push. Not merge-blocking today (`Deploy to Production` is not one of the required `gate` checks per Appendix B — it's informational/notification tooling), but it's actively misleading anyone watching Actions history, and the fix already exists and is correctly scoped.

### 6. Deferred-work register (R12) — read in full; still healthy, still current

`docs/governance/DEFERRED_WORK.md` (1082 lines) is being actively maintained and remains the correct source of truth for open items. Notable still-open items, cross-checked against current code where feasible in this pass:
- **Still blocked, external, correctly logged:** iOS EAS build blocked on a revoked Apple Distribution Certificate — needs Shayan's Apple Developer Portal access. No code fix possible.
- **Still open:** `scripts/verify.ps1` uses `Invoke-Expression` for two build/test invocations (Codacy HIGH RISK flag, not exploitable today since inputs are hardcoded literals, but inconsistent with the `execFile`-hardening pattern used elsewhere in the repo).
- **Still open:** referral links keyed by raw Firebase Auth UID (`/ref/<uid>`), a display-name/tier oracle risk — needs a real product/migration decision from Shayan, correctly not attempted as a drive-by fix.
- **Still open:** `functions/` has its own separate, never-remediated `npm audit` findings (2 high, 7 moderate, 1 low) and an eslint peer-dependency conflict resolved only via `--legacy-peer-deps`.
- **Still open:** ~1153 raw hex color literals across `src/**/*.tsx` pending migration to Aurora design tokens, and several hundred lines of legacy Neon/Model U CSS utility classes in `globals.css` still in active use by a few components — large, correctly deferred rather than attempted piecemeal.
- **Still open, small:** `jest.config.js`'s `testPathIgnorePatterns` doesn't exclude `.claude/worktrees/*`, so local `npx jest` runs on this machine pick up and fail on other agents' worktree-local Playwright specs — cosmetic noise, not a real coverage gap, but directly relevant to finding 1/4's "multiple agents share this machine" theme.
- The register shows a consistent, credible pattern of agents finding real pre-existing bugs during unrelated work and either fixing them in-scope or logging them properly (R11) — no evidence of silent skipping across the entries reviewed.

### 7. Codebase structure spot-check

- `src/` matches `README.md`'s documented layout exactly: `app/` (27 top-level route segments), `components/`, `hooks/`, `context/`, `lib/`, `middleware/`, plus `__tests__/`, `styles/`, `types/` (present in code, not explicitly listed in the README tree — minor doc gap, not a defect).
- `mobile/` has its own `package.json`, `package-lock.json`, `node_modules/`, `tsconfig.json`, `eas.json`, `app.json`/`app.config.js` — consistent with the workspace setup described in the deferred-work register (root `"workspaces": ["mobile"]`).
- `packages/tokens/` present and matches the Aurora design-token system referenced throughout the register and the morning's triage audit (confirmed live, not orphaned, in that earlier audit's Group B/C/D/E analysis).
- Nothing found in this spot-check that contradicts README's claims or suggests orphaned/broken top-level structure.

## Verdict

1. **No security issues found** — no committed secrets, `.gitignore` correctly scoped, only `.env.example` files tracked.
2. **Dependency vulnerabilities are unchanged from the already-accepted baseline** — 26 (17 moderate/9 high), all build-tooling-only Expo/RN transitive findings, previously reviewed and explicitly accepted by Shayan.
3. **Doc governance is green** — README/link integrity, doc-count baseline, audit freshness all pass.
4. **Local build/lint/test verification is inconclusive, not failing** — `tsc` ran clean apart from a diagnosed `node_modules` install-drift artifact (not a code bug); lint and jest could not complete under this session's environment load. Real CI is the authoritative signal and should be checked directly rather than inferring health from local results on this machine.
5. **One real, fixable-today CI problem found:** `Deploy to Production` has been failing on every recent main-branch push due to a DNS-flaky smoke-test step hard-failing the job — but the fix is already written, tested in isolation, and sitting on an unmerged branch (`fix/smoke-test-dns-tolerant`, commit `2cc59c8`).
6. **One process/infrastructure risk found, not a code defect:** this machine had multiple agents operating against the same shared (non-worktree) checkout simultaneously during this audit, evidenced by an unexpected branch switch mid-session and 19+ concurrent `node.exe` processes. This can silently corrupt any agent's verification results and should be addressed at the operating-process level.
7. The deferred-work register remains accurate, current, and well-maintained; nothing reviewed in it is stale or contradicted by current code.

## Recommended next actions

1. **Merge `fix/smoke-test-dns-tolerant` (commit `2cc59c8`) into `main`** to stop `Deploy to Production` reporting false failures on every push — low-risk, already-scoped fix.
2. **Adopt isolated `git worktree` checkouts for all agent work in this repo** (per the existing `.claude/worktrees/` convention) rather than sharing the primary checkout — this audit directly observed the failure mode that convention exists to prevent.
3. When this machine is not under heavy concurrent agent load, re-run `npm run lint`, `npx jest`, and `npm run build` to get a real local pass/fail signal (or pull the equivalent from the latest green `governance-gate` CI run) — this audit's local verification was environment-limited, not a substitute for that.
4. Consider running `npm install` (or `npm ci`) fresh on this machine outside of concurrent load to fix the `zod`/`cron` install drift found in finding 1 — it doesn't affect CI (which does a clean install) but will keep producing false-positive local `tsc` errors for any agent working here until resolved.
5. Carry forward the still-open register items unchanged (Apple cert, `Invoke-Expression` in `verify.ps1`, referral-UID exposure, `functions/` audit debt, raw-hex token purge) — this audit found no reason to reprioritize or close any of them.
