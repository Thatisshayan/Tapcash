# Start Here

**Last verified:** 2026-11-04 (Claude Code). Re-verify anything below before relying on it, and update this file when the state changes.

TapCash is a rewards platform. Users complete offers and surveys from offerwalls (RapidoReach, Lootably), earn coins, and cash out through PayPal, Interac e-Transfer or Tremendous gift cards. It handles real money, so correctness matters more than speed.

- **Web:** Next.js 16 (App Router), TypeScript, Tailwind v4, Firebase Auth + Firestore, Upstash Redis, Sentry. Deployed on Vercel.
- **Mobile:** Expo / React Native in `mobile/` (npm workspace of the root).
- **Backend jobs:** Firebase Functions in `functions/`.
- **Desktop:** Electron wrapper in `src-electron/` (low priority).

## Current goal: get the web app live

The app builds, passes CI, and Vercel deploys every merge to `main`. What stops a real launch is mostly accounts, DNS and security operations, not code. In order:

| # | Item | State on 2026-11-04 | Who |
|---|------|---------------------|-----|
| 1 | **`tapcash.online` does not resolve.** Google and Cloudflare DNS both return NXDOMAIN. Check registration and nameservers, then point it at Vercel. | Blocked | Shayan (registrar) |
| 2 | **Three Vercel projects deploy this repo:** `tapcash`, `tapcash-8z9f`, `tapcash-zyd5`. All three get a production deploy on every merge. Pick one, attach the domain to it, and disconnect the other two. | Open decision | Shayan |
| 3 | **Rotate provider keys** (RapidoReach, ProxyCheck, Resend, and Firebase if ever exposed) and set them in the chosen Vercel project. No service-account key file was found in git history under common names, so the history purge may already be done; rotation can only be confirmed in each dashboard. See [operations/SECURITY_OPS.md](operations/SECURITY_OPS.md). | Unconfirmed | Shayan |
| 4 | **`npm audit` Security Scan fails on every PR** (4 critical, 24 high), and several allowlist exceptions expired on 2026-11-01. It doesn't stop Vercel deploys, but it does block the GitHub Actions `Deploy to Production` job. Re-run it after the Dependabot backlog is merged. | In progress | Agent + Shayan sign-off |
| 5 | **Turn on branch protection for `main`.** `REPO_RULES.md` Appendix A requires it, but GitHub currently reports "Branch not protected", so nothing enforces the CI gate. | Open | Shayan (repo settings) |
| 6 | **Production credentials and dashboards.** Firebase, PayPal, Tremendous, Resend, Upstash, Sentry, Better Uptime. The step-by-step list lives in the gitignored local file `NEEDSHAYANINPUT.md` (kept off GitHub on purpose); public checklists are [operations/PRODUCTION_CHECKLIST.md](operations/PRODUCTION_CHECKLIST.md) and [operations/LAUNCH_CHECKLIST.md](operations/LAUNCH_CHECKLIST.md). | Open | Shayan |
| 7 | **Security review and Lighthouse pass** on the deployed site, once 1 and 2 are done. | Not started | Agent |
| 8 | **Major dependency upgrades** (Sentry 11, Firebase 13, Framer Motion 14, Vitest 5, Electron 45, ESLint 10, TypeScript 7, Expo SDK 58). Do these one at a time after launch blockers. | Deferred | Agent |

Mobile is second priority. iOS is blocked on a revoked Apple Distribution Certificate, and Android needs EAS and physical-device checks. Both are logged in [governance/DEFERRED_WORK.md](governance/DEFERRED_WORK.md).

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in Firebase + provider keys
npm run dev                  # http://localhost:3000
npm test                     # Jest
bash scripts/verify.sh       # the same checks as the CI gate
```

More detail: [guides/DEVELOPER_GUIDE.md](guides/DEVELOPER_GUIDE.md), [guides/DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md), [guides/MOBILE_BUILD_GUIDE.md](guides/MOBILE_BUILD_GUIDE.md).

## How work happens here

- Read [../REPO_RULES.md](../REPO_RULES.md) first. Branch-only; no direct commits to `main`.
- The CI `gate` (secret-scan, doc-freshness, build, test, deploy-dry, directive-lint) must pass. It also fails if the newest file in `audits/` is more than 30 days old.
- Log anything you defer in [governance/DEFERRED_WORK.md](governance/DEFERRED_WORK.md), and save audits as `audits/YYYY-MM-DD_<Agent>_<Scope>_Audit.md`.
- No file deletion and no paid spend without Shayan's approval.

## Where things are

See [README.md](README.md) for the full docs index. In short:

- `docs/guides/`: how to develop, deploy and use the app.
- `docs/operations/`: launch and production checklists, security ops, payout status.
- `docs/status/`: **June 2026 snapshots** (GROUNDTRUTH, TODO, test coverage). They describe the state after the June sprints and are not current; this file supersedes them.
- `docs/governance/`: branch policy, deferred-work register, doc branch strategy.
- `docs/plans/`: web, mobile and UI/UX plans and proposals; `docs/superpowers/plans/` has the August implementation plans.
- `docs/archive/`: finished sprint reports, the old ACC/Antigravity handoff, and the unused Netlify config. Kept for history only.
- `audits/`: dated audits, newest last.
