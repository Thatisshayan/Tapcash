# TapCash — June Completion Sprint
**Date:** 2026-06-25
**Owner:** Builder Agent
**Orchestrator:** Claude (Principal Engineer)
**Goal:** Drive TapCash from ~65% → 100% production-ready. Push each phase to its own branch (`phase1branch`, `phase2branch`, …). After ALL phases are done, the Orchestrator will audit and merge branch by branch into `main`.

---

## BUILDER DIRECTIVE

Take ownership of this project end-to-end. Create subagents as needed, coordinate them, give each one a clear job, keep them focused, compare their answers, audit their answers, give them specialized skills as needed. Resolve disagreements and apply improvements and execute tasks as the plan defines — directly. Verify the result and only stop for destructive, secret-related, paid, external-network, production, or irreversible actions. Keep going until the project is done or you hit a real blocker. Do not stop for small questions. Token-saving mode ON.

After each phase:
1. A subagent updates ALL documents to match the current state of the work.
2. All changes are committed and pushed to that phase's branch.

Subagents work in parallel wherever possible. If no parallelism is available, you execute the task directly — not the subagent.

Push each phase to its own branch:
- Phase 1 → `phase1branch`
- Phase 2 → `phase2branch`
- Phase 3 → `phase3branch`
- Phase 4 → `phase4branch`
- Phase 5 → `phase5branch`
- Phase 6 → `phase6branch`
- Phase 7 → `phase7branch`

The Orchestrator merges. You build.

---

## PHASE 1 — CI/CD, DevOps & Infrastructure
**Branch:** `phase1branch`
**Priority:** P0 — unblocks everything

### CI/CD Pipeline

- [ ] **T-001** Create `.github/workflows/ci.yml` — run `tsc --noEmit`, `next lint`, `jest --ci` on every PR and push to any branch. Fail fast.
- [ ] **T-002** Add `playwright install` step and run E2E smoke tests in CI (even if suite is minimal — just verify the workflow runs).
- [ ] **T-003** Add Lighthouse CI step using `lighthouserc.js` (already exists). Gate on LCP < 3s, CLS < 0.1.
- [ ] **T-004** Add a `deploy-preview.yml` workflow: on PR open/update, deploy to Vercel preview URL and post the URL as a PR comment.
- [ ] **T-005** Add a `deploy-production.yml` workflow: on merge to `main`, trigger Vercel production deployment.
- [ ] **T-006** Add a secrets audit step: scan for hardcoded secrets using `gitleaks` or `trufflesecurity/trufflehog` action. Fail if found.
- [ ] **T-007** Add `CODEOWNERS` file assigning `@Thatisshayan` to all paths.
- [ ] **T-008** Add branch protection rule instructions to `DEPLOYMENT.md`: require CI pass + 1 review before merge to `main`.

### Environment Variables

- [ ] **T-009** Audit `.env.example` — verify every env var used in `src/` is listed with a description. Add any missing ones (PayPal, Interac, Tremendous, Upstash, Resend, Firebase, Sentry, RapidoReach, AdGem, AdGate, Lootably, Torox, BitLabs, CPX Research).
- [ ] **T-010** Create `scripts/validate-env.ts` — on app start, assert all required env vars are present; throw a descriptive error if any are missing. Import it in `instrumentation.ts`.
- [ ] **T-011** Document in `DEPLOYMENT.md` the exact Vercel environment variable setup steps for production, preview, and development environments.

### Firestore Indexes

- [ ] **T-012** Audit all Firestore queries in `src/lib/` and `src/app/api/` for compound query patterns.
- [ ] **T-013** Add all required composite indexes to `firestore.indexes.json`. At minimum: `ledger_transactions` (userId + createdAt DESC), `offers` (status + providerId), `users` (createdAt DESC), `cashout_requests` (status + createdAt DESC).
- [ ] **T-014** Deploy indexes: document the `firebase deploy --only firestore:indexes` command in `DEPLOYMENT.md`.

### Domain & DNS

- [ ] **T-015** Document in `DEPLOYMENT.md` the exact steps to point `tapcash.com` to Vercel (nameservers or CNAME). Include SSL provisioning steps.
- [ ] **T-016** Add `tapcash.com` and `www.tapcash.com` to `vercel.json` / Vercel project domains config if not already present.

### Monitoring Setup

- [ ] **T-017** Configure Sentry: ensure `SENTRY_DSN` is set, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` are all properly initializing Sentry with environment tags (`production`/`preview`).
- [ ] **T-018** Add Sentry performance monitoring: set `tracesSampleRate: 0.1` in production, `1.0` in development.
- [ ] **T-019** Verify `better-uptime.yml` is complete and document how to activate Better Uptime monitoring in `DEPLOYMENT.md`.
- [ ] **T-020** Add a `/api/health` endpoint that returns `{ status: "ok", timestamp, version }`. Used by Better Uptime and CI smoke tests.

### Database Backup

- [ ] **T-021** Document in `DEPLOYMENT.md` how to enable Firestore scheduled exports to GCS (Cloud Scheduler + export API). Provide the exact `gcloud` commands.

---

## PHASE 2 — Firestore Security Rules & Data Integrity
**Branch:** `phase2branch`
**Priority:** P0

### Security Rules Audit

- [ ] **T-022** Read current `firestore.rules` in full. Map every collection to its read/write rules.
- [ ] **T-023** Audit `cashout_requests` rules: only the owning user can create; only admins can update status.
- [ ] **T-024** Audit `promo_codes` rules: public read for validation; admin-only write.
- [ ] **T-025** Audit `multiplier_events` rules: only the owning user can read their own; admin can read all; no user writes.
- [ ] **T-026** Audit `ledger_transactions` rules: user can read own transactions; no user writes (server-only via Admin SDK).
- [ ] **T-027** Audit `admin_logs` rules: admin read only; no client writes at all.
- [ ] **T-028** Audit `blocked_ips` rules: admin read/write only; no user access.
- [ ] **T-029** Audit `users` collection: user can read/write own doc (except `balance`, `role`, `status` fields — those are server-only).
- [ ] **T-030** Add field-level security: use `request.resource.data.diff(resource.data).affectedKeys()` to prevent users from modifying restricted fields.
- [ ] **T-031** Write Firestore emulator tests for the security rules in `scripts/test-firestore-rules.ts`. Test: user can't read another user's data, user can't write to ledger, admin can access everything.
- [ ] **T-032** Deploy updated `firestore.rules`: document command in `DEPLOYMENT.md`.

### Data Integrity

- [ ] **T-033** Audit `scripts/seed-firestore.ts`: confirm `multiplier_events` and `promo_codes` collections are seeded.
- [ ] **T-034** Make `scripts/seed-firestore.ts` idempotent — use `set({ merge: true })` or check-before-write so running it twice doesn't duplicate data.
- [ ] **T-035** Add a `scripts/validate-firestore.ts` script that reads from each collection and confirms expected document structure exists. Use in CI smoke tests.

---

## PHASE 3 — Mobile App: Auth, EAS & Screen Completion
**Branch:** `phase3branch`
**Priority:** P0/P1

### Authentication Fix

- [ ] **T-036** Read `mobile/app/(auth)/` screens and `mobile/app/(tabs)/` screens. Map current auth flow.
- [ ] **T-037** Identify the auth library used in web (`src/lib/auth/`). Confirm mobile must use the same Firebase Auth SDK (not a different token system).
- [ ] **T-038** Remove any stale session patterns from mobile that differ from the web JWT/Firebase Auth flow.
- [ ] **T-039** Implement `mobile/src/lib/auth.ts`: Firebase Auth `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `onAuthStateChanged` listener that stores user + token in secure storage.
- [ ] **T-040** Ensure all protected API calls from mobile send the Firebase ID token as `Authorization: Bearer <token>` header.
- [ ] **T-041** Verify the web API routes that mobile calls properly validate Firebase ID tokens via Firebase Admin SDK.

### EAS Build Configuration

- [ ] **T-042** Create `mobile/eas.json` with `development`, `preview`, and `production` build profiles.
- [ ] **T-043** Update `mobile/app.json`: set `ios.bundleIdentifier: "com.tapcash.app"`, `android.package: "com.tapcash.app"`, `name: "TapCash"`, `slug: "tapcash"`, `version: "1.0.0"`, `buildNumber: "1"`.
- [ ] **T-044** Configure `ios.supportsTablet: false` and set icon/splash assets in `app.json`.
- [ ] **T-045** Document EAS build commands in `mobile/README.md`: `eas build --platform ios --profile preview`, `eas build --platform android --profile preview`.

### Stale Component Cleanup

- [ ] **T-046** Search mobile codebase for imports of `PremiumHeader`, `PremiumFooter`, `premium.css`. Remove or replace with current design system components.
- [ ] **T-047** Ensure `mobile/src/theme.ts` matches the web design tokens (colors, fonts).

### Push Notifications

- [ ] **T-048** Verify `mobile/src/lib/notifications.ts` (or equivalent): confirm `registerPushToken` saves the token to Firestore under the user's doc.
- [ ] **T-049** Document in `DEPLOYMENT.md` the APNs key upload steps for EAS and the FCM server key setup for Expo push notifications.
- [ ] **T-050** Add a server-side utility `src/lib/push-notify.ts` that sends a push notification via Expo Push API when a cashout is approved — trigger it from the admin approve payout route.

### Mobile Screen Completeness

- [ ] **T-051** Audit `mobile/app/(tabs)/` — list every tab and confirm each has a working screen. Missing screens must be stubbed with a `<Text>Coming soon</Text>` placeholder at minimum so navigation doesn't crash.
- [ ] **T-052** Ensure the Home tab shows: user balance, recent transactions (last 5), quick-access to Offers.
- [ ] **T-053** Ensure the Offers tab loads offers from `/api/offers` and renders them in a FlatList with pull-to-refresh.
- [ ] **T-054** Ensure the Account tab shows: user profile info, notification settings toggle, logout button.
- [ ] **T-055** Ensure the Cashout tab (if it exists): shows cashout form (amount, method), posts to `/api/cashout/request`.

### Rate Limiting on Mobile API Calls

- [ ] **T-056** Audit which API routes are called by mobile. Confirm Upstash rate limiter middleware covers them. If mobile uses different route paths than web, apply the same `rateLimiter` middleware to those routes.

---

## PHASE 4 — Additional Offer Providers
**Branch:** `phase4branch`
**Priority:** P1

### Provider Integration Framework

- [ ] **T-057** Read `src/app/api/rapidoreach/` to understand the current offer postback + user session pattern.
- [ ] **T-058** Create `src/lib/offer-providers/types.ts` — define a `OfferProvider` interface: `{ name, getOffersUrl(userId), postbackSecret, validatePostback(req), rewardUser(userId, amount) }`.
- [ ] **T-059** Refactor `rapidoreach` integration to implement `OfferProvider` interface.
- [ ] **T-060** Create `src/lib/offer-providers/registry.ts` — a map of all providers. Routes look up providers by name.

### AdGem Integration

- [ ] **T-061** Create `src/lib/offer-providers/adgem.ts` implementing `OfferProvider`.
- [ ] **T-062** Create `src/app/api/adgem/postback/route.ts` — validate HMAC signature, call `rewardUser`.
- [ ] **T-063** Add `ADGEM_API_KEY`, `ADGEM_APP_ID`, `ADGEM_POSTBACK_SECRET` to `.env.example`.

### AdGate Integration

- [ ] **T-064** Create `src/lib/offer-providers/adgate.ts` implementing `OfferProvider`.
- [ ] **T-065** Create `src/app/api/adgate/postback/route.ts`.
- [ ] **T-066** Add `ADGATE_API_KEY`, `ADGATE_APP_ID`, `ADGATE_SECRET` to `.env.example`.

### Lootably Integration

- [ ] **T-067** Create `src/lib/offer-providers/lootably.ts` implementing `OfferProvider`.
- [ ] **T-068** Create `src/app/api/lootably/postback/route.ts`.
- [ ] **T-069** Add `LOOTABLY_APP_TOKEN`, `LOOTABLY_SECRET` to `.env.example`.

### Torox Integration

- [ ] **T-070** Create `src/lib/offer-providers/torox.ts` implementing `OfferProvider`.
- [ ] **T-071** Create `src/app/api/torox/postback/route.ts`.
- [ ] **T-072** Add `TOROX_APP_ID`, `TOROX_SECRET_KEY` to `.env.example`.

### BitLabs Integration

- [ ] **T-073** Create `src/lib/offer-providers/bitlabs.ts` implementing `OfferProvider`.
- [ ] **T-074** Create `src/app/api/bitlabs/postback/route.ts`.
- [ ] **T-075** Add `BITLABS_APP_TOKEN`, `BITLABS_HAIKU` to `.env.example`.

### CPX Research Integration

- [ ] **T-076** Create `src/lib/offer-providers/cpxresearch.ts` implementing `OfferProvider`.
- [ ] **T-077** Create `src/app/api/cpxresearch/postback/route.ts`.
- [ ] **T-078** Add `CPX_APP_ID`, `CPX_SECRET_HASH` to `.env.example`.

### Offer Provider UI

- [ ] **T-079** Update `src/app/rewards/page.tsx` (or wherever offers are rendered) to show offers from ALL configured providers, not just RapidoReach.
- [ ] **T-080** Add provider logo/badge to each offer card so users know which network it's from.

---

## PHASE 5 — Payout System: Async Queue & Reliability
**Branch:** `phase5branch`
**Priority:** P1

### Payout Queue

- [ ] **T-081** Audit current payout API route (`src/app/api/cashout/` or similar). Identify where PayPal / Interac / Tremendous calls happen.
- [ ] **T-082** Create `src/lib/payout-queue.ts` — uses Upstash Redis Queue (or BullMQ backed by Upstash) to enqueue payout jobs. Fields: `{ payoutId, userId, amount, method, createdAt }`.
- [ ] **T-083** Create `src/app/api/payout-worker/route.ts` — a POST endpoint that processes one payout job from the queue. Called by a Vercel Cron job every minute.
- [ ] **T-084** Add `vercel.json` cron config: `{ "path": "/api/payout-worker", "schedule": "* * * * *" }`.
- [ ] **T-085** On payout processing failure: retry up to 3 times with exponential backoff. After 3 failures, mark the payout as `failed` in Firestore and write to `admin_logs`.
- [ ] **T-086** Ensure payout state machine is atomic: use Firestore transactions so a payout can never be double-processed.
- [ ] **T-087** On payout success: send confirmation email via Resend to the user, trigger push notification.

### PayPal Integration

- [ ] **T-088** Audit `src/lib/paypal.ts` (or equivalent). Confirm it uses PayPal Payouts API v2, not deprecated v1.
- [ ] **T-089** Add proper error handling: catch `SENDER_BATCH_ALREADY_COMPLETED`, `INSUFFICIENT_FUNDS`, network errors. Update payout status accordingly.

### Interac Integration

- [ ] **T-090** Audit `src/lib/interac.ts`. Confirm e-Transfer API endpoint and auth flow.
- [ ] **T-091** Add webhook handler for Interac payment status callbacks if the API supports it.

### Tremendous Integration

- [ ] **T-092** Audit `src/lib/tremendous.ts`. Confirm gift card order creation and status polling logic.
- [ ] **T-093** Add a status-poll cron or webhook to detect when Tremendous orders are fulfilled and update user's cashout record.

---

## PHASE 6 — Testing, Performance & Quality
**Branch:** `phase6branch`
**Priority:** P1/P2

### E2E Tests

- [ ] **T-094** Write Playwright test: user signs up → completes email verification → sees dashboard. File: `tests/e2e/auth.spec.ts`.
- [ ] **T-095** Write Playwright test: authenticated user navigates to Offers, clicks an offer, verifies redirect URL contains correct userId param. File: `tests/e2e/offers.spec.ts`.
- [ ] **T-096** Write Playwright test: authenticated user submits cashout request → sees "pending" status in dashboard. File: `tests/e2e/cashout.spec.ts`.
- [ ] **T-097** Write Playwright test: admin logs in → navigates to `/admin` → approves a cashout request → status changes to "approved". File: `tests/e2e/admin.spec.ts`.
- [ ] **T-098** Configure `playwright.config.ts` to run against `http://localhost:3000` in CI and the preview URL in preview CI.

### Integration Tests

- [ ] **T-099** Write Jest integration test for the full cashout flow using Firebase emulator: create user → create cashout_request → admin approve → verify ledger entry. File: `src/lib/__tests__/cashout-flow.integration.test.ts`.
- [ ] **T-100** Write Jest integration test for offer postback: POST to `/api/rapidoreach/postback` with valid HMAC → verify user balance increases. File: `src/lib/__tests__/postback.integration.test.ts`.
- [ ] **T-101** Write Jest integration test for referral: user A signs up with user B's referral code → verify user B gets referral bonus in ledger. File: `src/lib/__tests__/referral.integration.test.ts`.

### Performance

- [ ] **T-102** Run `next build --analyze`. Identify any bundle > 200KB that is not code-split. Fix the top 3 offenders.
- [ ] **T-103** Migrate in-memory 5-minute cache to Upstash Redis in `src/lib/cache.ts`. Use `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. TTL: 300 seconds.
- [ ] **T-104** Audit all `<img>` tags in `src/`. Replace with `next/image` with explicit `width`/`height` or `fill` props. Fix CLS.
- [ ] **T-105** Add `loading="lazy"` (or rely on `next/image` lazy by default) for all below-the-fold images.
- [ ] **T-106** Implement font optimization: confirm `next/font` is used for all custom fonts (Space Grotesk, Manrope). Remove any `<link>` font imports from `_document` or layout files.

### Font Migration

- [ ] **T-107** Complete Syne → Space Grotesk migration: search all CSS/Tailwind for `font-syne` or `'Syne'`. Replace with Space Grotesk.
- [ ] **T-108** Complete Inter → Manrope migration: search for `font-inter` or `'Inter'`. Replace with Manrope.
- [ ] **T-109** Update `tailwind.config.ts` fontFamily to use Space Grotesk and Manrope as the design system fonts.

### Code Quality

- [ ] **T-110** Run `tsc --noEmit`. Fix every type error. Zero TypeScript errors allowed in production.
- [ ] **T-111** Run `next lint`. Fix every ESLint error and warning. Configure `eslint.config.mjs` to fail on warnings in CI.
- [ ] **T-112** Audit all `console.log` calls in `src/`. Replace with structured logger calls (Sentry breadcrumbs or a `logger.ts` wrapper). Remove debug logs.
- [ ] **T-113** Remove all `// TODO`, `// FIXME`, `// HACK` comments that are not attached to a tracked task. Either fix the issue or create a task for it.

---

## PHASE 7 — Admin Panel, UX Completions & Launch Prep
**Branch:** `phase7branch`
**Priority:** P2/P3

### Admin Panel Completions

- [ ] **T-114** Add CSV export to payout history page: button that fetches all cashout_requests and downloads as CSV. Columns: userId, email, amount, method, status, createdAt.
- [ ] **T-115** Add bulk user action UI: admin can select multiple users → apply action (suspend, unsuspend, reset balance) in one click.
- [ ] **T-116** Add revenue chart to admin dashboard: daily/weekly/monthly gross cashout volume. Use `recharts` (already in deps if installed) or `chart.js`.
- [ ] **T-117** Add user search to admin: search by email or userId. Implement `/api/admin/users/search?q=` route.
- [ ] **T-118** Add a fraud dashboard: list all `fraud_flags` docs, show reason, user, timestamp, and allow admin to dismiss or act.

### GDPR

- [ ] **T-119** Implement `/api/users/me/delete` endpoint: deletes user's Firestore doc, anonymizes ledger entries, revokes Firebase Auth account, removes push tokens.
- [ ] **T-120** Add "Delete My Account" button to account settings page with a confirmation modal.
- [ ] **T-121** Verify `/api/gdpr/export` exists and returns all user data as JSON download. If not, create it.

### Leaderboard

- [ ] **T-122** Replace polling in leaderboard page with Server-Sent Events: create `src/app/api/leaderboard/stream/route.ts` that sends updates every 30 seconds. Update the leaderboard component to use `EventSource`.

### Blog / Content

- [ ] **T-123** Replace static blog placeholder with Firestore-backed blog: collection `blog_posts` with fields `{ title, slug, content, publishedAt, author }`. Create 3 seed posts.
- [ ] **T-124** Create `src/app/blog/[slug]/page.tsx` that reads from Firestore and renders a blog post.
- [ ] **T-125** Add sitemap entries for blog posts in `src/app/sitemap.ts`.

### tapScore Page

- [ ] **T-126** Define tapScore: it is a user reputation score (0–1000) based on offers completed, account age, referrals made, and cashout history. Document the formula in `GROUNDTRUTH.md`.
- [ ] **T-127** Implement tapScore calculation in `src/lib/tap-score.ts`. Function: `calculateTapScore(userId): Promise<number>`.
- [ ] **T-128** Update `src/app/tapScore/page.tsx` to display the user's tapScore, score breakdown, and tips to improve it.

### Referral Validation

- [ ] **T-129** Trace the full referral flow end-to-end in code. Confirm: ref code is stored on signup → on signup completion, referrer's balance is credited → ledger entry is created. If any step is missing, implement it.
- [ ] **T-130** Add an integration test for referral flow (covered in T-101 — mark as linked).

### Robots & Sitemap

- [ ] **T-131** Verify `src/app/robots.ts` disallows `/admin`, `/api`, `/auth`. Allow all other paths.
- [ ] **T-132** Verify `src/app/sitemap.ts` includes all public routes: `/`, `/how-it-works`, `/about`, `/blog`, `/faq`, `/careers`, `/contact`, `/privacy`, `/terms`, `/leaderboard`.

### App Store Prep

- [ ] **T-133** Create `mobile/store-assets/` directory with a `README.md` listing required assets: icon (1024×1024), screenshots (6.7" and 6.1" iPhone), feature graphic (Android).
- [ ] **T-134** Write `mobile/store-assets/app-store-description.txt` with a production-ready App Store description for TapCash.
- [ ] **T-135** Write `mobile/store-assets/privacy-policy-url.txt` pointing to `https://tapcash.com/privacy`.

### Documentation

- [ ] **T-136** Update `README.md`: add local setup instructions, required env vars, how to run dev server, how to run tests, how to deploy.
- [ ] **T-137** Update `DEPLOYMENT.md` with all steps added in Phase 1–7.
- [ ] **T-138** Archive stale docs (`MOBILEPROPOSEPLAN.md`, `MOBILEPROPOSEPLAN2.md`) by moving to `docs/archive/`.
- [ ] **T-139** Create `docs/ARCHITECTURE.md` — single source of truth for the TapCash system architecture: web, mobile, Firestore, offer providers, payout flow, admin panel.

### Final Checks

- [ ] **T-140** Run full Lighthouse audit on production URL (or preview URL). Score: Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
- [ ] **T-141** Run `npm audit`. Fix all critical and high severity vulnerabilities.
- [ ] **T-142** Verify all feature flags or dev-only code paths are disabled in production builds.
- [ ] **T-143** Verify cookie consent banner works and does not block app load.
- [ ] **T-144** Verify all forms have proper ARIA labels and are keyboard-navigable.
- [ ] **T-145** Final review of `PRODUCTION_CHECKLIST.md` — every item must be checked.

---

## TASK SUMMARY

| Phase | Tasks | Priority | Branch |
|-------|-------|----------|--------|
| 1 — CI/CD & Infrastructure | T-001 to T-021 | P0 | `phase1branch` |
| 2 — Firestore Security & Data | T-022 to T-035 | P0 | `phase2branch` |
| 3 — Mobile App | T-036 to T-056 | P0/P1 | `phase3branch` |
| 4 — Offer Providers | T-057 to T-080 | P1 | `phase4branch` |
| 5 — Payout Queue | T-081 to T-093 | P1 | `phase5branch` |
| 6 — Testing & Performance | T-094 to T-113 | P1/P2 | `phase6branch` |
| 7 — Admin, UX & Launch | T-114 to T-145 | P2/P3 | `phase7branch` |

**Total tasks: 145**

---

## DONE STATE

The sprint is complete when:
- [ ] All 145 tasks are checked
- [ ] CI is green on every phase branch
- [ ] No P0 or P1 issues remain in the audit
- [ ] `TASPCASHAUDIT25.06.2026.md` is updated to reflect post-completion state
- [ ] All phase branches are pushed and ready for Orchestrator merge review
