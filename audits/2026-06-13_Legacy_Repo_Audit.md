# TapCash Repository Audit
Date: 2026-06-13
Auditor: Hermes
Scope: `D:\AgentDevWork\repos\tapcash`

## What I did
- Inspected repo state: git valid, 1 uncommitted change, 10 recent commits.
- Reviewed manifests: `package.json`, `jest.config.ts`, `playwright.config.ts`, `functions/package.json`, `next.config.ts`, `tsconfig.json`.
- Audited security-sensitive files: `src/proxy.ts`, `src/middleware/index.ts`, `.env.example`, `src/lib/*`, API routes under `src/app/api/**`.
- Ran production build, typecheck, and lint from repo root.
- Sampled code and docs for architecture and readiness claims.

## What changed
- No files modified. Audit is read-only.
- Report generated at `audit/REPO_AUDIT_2026-06-13.md`.

## What passed
- `npm run build` — PASS
- `npx tsc --noEmit` — PASS
- `npm run lint` — FAIL (1 error, 72 warnings)

## Risks found
1. CREDENTIAL EXPOSURE — `Default Workspace-apiKey-332863.csv` at repo root contains API key/host/workspace credentials. It is untracked by git, but remains in the working tree. Severity: HIGH. File: `Default Workspace-apiKey-332863.csv`.
2. LINT FAILURE — `src/lib/monitoring.ts:347` uses unsafe `Function` type and triggers `@typescript-eslint/no-unsafe-function-type`. Severity: MEDIUM.
3. RATE LIMITING NOT PRODUCTION-GRADE — `src/middleware/index.ts` uses in-memory `Map` rate limiter; not shared across instances and resets on deploy/scale. Severity: MEDIUM.
4. POSTBACK AUTH FALLBACKS — multiple postback routes have empty-string fallbacks for secrets (`OFFERWALL_SECRET`, `RAPIDOREACH_APP_KEY`, etc.), allowing unauthenticated processing if env vars are missing. Severity: HIGH.
5. CLIENT-SIDE COOKIE REFERRAL — `src/app/auth/signup/page.tsx` writes `tapcash_ref` via `document.cookie` without `Secure`/`HttpOnly`/`SameSite=None`; trivially spoofed. Severity: MEDIUM.
6. ADMIN DATALEAK VIA CONSOLE — wide `console.error` logging in admin routes can leak PII/context in server logs. Severity: LOW.
7. DOCS OVERCLAIM — docs/PRODUCTION_CHECKLIST.md claims “All tests passing” without evidence; no CI workflow files present to validate automatically. Severity: LOW.

## Recommended fixes
1. Rotate and remove exposed credential file immediately; add its pattern to `.gitignore`; verify no other credential CSVs exist.
2. Fix `src/lib/monitoring.ts` handler typing; rerun lint to 0 errors.
3. Replace in-memory rate limiter with Upstash Redis or shared store; enforce in production paths.
4. Harden postback routes: reject requests when required signing secrets are missing; reject in production if IP allowlists not configured.
5. Move referral attribution to server-set `Set-Cookie` with `Secure; HttpOnly; SameSite=Lax` or signed JWT.
6. Sanitize admin logs; mask user identifiers; route errors through structured monitoring (Sentry/Better Uptime).
7. Add GitHub Actions CI to run build, typecheck, lint, and tests on PRs.

## Next action options
1. KEEP + HARDEN — Keep the current codebase, apply the fixes above, then promote to production-ready. Lowest disruption, fastest path if urgent.
2. KEEP + SECURITY SPRINT — Keep architecture, but focus first on credential cleanup, postback hardening, and CI setup before further feature work.
3. KEEP + REBASE ON NEXT.JS 16 BEST PRACTICES — Revisit routing/data patterns after stabilizing security and tests. Moderate effort, improves maintainability.

Decision: KEEP. Build and typecheck are green and the domain model is coherent; remediation is cheaper and lower-risk than a rebuild.
