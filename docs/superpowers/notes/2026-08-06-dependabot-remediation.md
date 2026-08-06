# TASK-034 Dependabot Remediation Note — 2026-08-06

## What was fixed
- `next`: 16.2.9 -> ^16.3.0 (direct dependency; clears 9 high-severity Next.js
  advisories: GHSA-6gpp-xcg3-4w24, GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x,
  GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q, GHSA-4c39-4ccg-62r3,
  GHSA-p9j2-gv94-2wf4, GHSA-q8wf-6r8g-63ch, GHSA-955p-x3mx-jcvp)
- `tar`, `websocket-driver` (critical), `undici`, `js-yaml`, `fast-uri`,
  `brace-expansion` (high): resolved transitively via `npm audit fix`
  (parent-package bumps, no semver-major changes, no `--force` used).

## Residual accepted risk
- `uuid` (moderate) and its dependents `@google-cloud/storage`, `gaxios`,
  `teeny-request`, `retry-request`, and `firebase-admin` (moderate,
  transitive): the only available fix per `npm audit fix --force` is a
  `firebase-admin` v10 downgrade, which would revert Track 1 Phase 1's
  modular-API migration. Accepted as residual risk — moderate severity,
  not user-facing (server-side storage client), tracked for a future
  `firebase-admin` v15+ upgrade once one ships a patched dependency chain.
- 6 moderate-severity findings remain post-fix, all in this same
  `firebase-admin`/`@google-cloud/storage`/`uuid` chain; none are direct
  dependencies and none ship distinct production-bundle code beyond what
  Phase 1 already accepted.

## Verification performed
- `npm audit --json` (baseline, before Step 2): 17 vulnerabilities
  (8 moderate, 7 high, 2 critical).
- `npm audit --json` (after Step 2 `npm install` with `next@^16.3.0`):
  15 vulnerabilities (8 moderate, 5 high, 2 critical).
- `npm audit --json` (after Step 3 `npm audit fix`): 6 vulnerabilities,
  all moderate — 0 critical, 0 high remaining.
- `npm run type-check`: exits 0, no errors (confirms no Next 16.3.0
  API-shape regressions).
- `npm run lint`: exits 0, 209 pre-existing warnings (all
  `@typescript-eslint/no-explicit-any` / unused-arg style warnings,
  unrelated to this change), 0 errors.
- `npx jest`: 304 passed, 1 failed, 2 skipped (307 total) at the time this
  note was originally written. The 1 failure (`origin.test.ts` "should
  reject missing origin in production mode") was a pre-existing bug,
  unrelated to the `next` bump — verified not a regression (jest itself
  was untouched in the `package-lock.json` diff).
  **Correction (2026-08-06, TASK-037 Task 7):** this note originally
  theorized the cause was `next/jest`'s SWC statically inlining
  `process.env.NODE_ENV` at transform time. That theory was disproven — the
  actual cause was that `Object.defineProperty(process.env, "NODE_ENV",
  ...)` silently no-ops the write regardless of descriptor shape; plain
  assignment (`process.env.NODE_ENV = value`) works. Task 7 fixed
  `setNodeEnv()` to use plain assignment, and the test now genuinely
  passes. See `docs/governance/DEFERRED_WORK.md`'s 2026-08-06 TASK-037
  entry for the full corrected root-cause writeup.
- `npm run build`: completes successfully (exit 0), all routes compile and
  prerender/route-map correctly under Next.js 16.3.0 with Turbopack.

## Governance
- Never merge a Dependabot-authored PR directly — this remediation was done
  by hand-editing `package.json`/`package-lock.json` on this branch instead,
  per boardroom convention.
- `.github/workflows/deploy.yml`'s `security` job: removed
  `continue-on-error: true` from the `npm audit --audit-level=high` step
  now that the repo audits clean at high+ severity. The Snyk step keeps
  `continue-on-error: true` (with an explanatory comment) since
  `SNYK_TOKEN` provisioning as a repo secret could not be verified in this
  session's scope.
- Also fixed, while verifying: `src/lib/testHelpers/testEnv.ts`'s
  `setNodeEnv()`. **Superseded (2026-08-06, TASK-037 Task 7)** — the
  original `enumerable: true` fix described here did not actually resolve
  the `origin.test.ts` failure; see the correction above and
  `docs/governance/DEFERRED_WORK.md` for what the real fix turned out to
  be.
- `.github/workflows/deploy.yml`'s Snyk step (`continue-on-error: true`,
  soft-gated pending `SNYK_TOKEN` provisioning) is a deliberate, deferred
  decision — see `docs/governance/DEFERRED_WORK.md`'s 2026-08-06 TASK-037
  entry for the tracked action item.

traces-to: TASK-034
