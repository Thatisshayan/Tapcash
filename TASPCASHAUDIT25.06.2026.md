# TapCash — Principal Engineer Audit Report
**Date:** 2026-06-25
**Auditor:** Orchestrator (Claude)
**Scope:** Full codebase — web app, mobile app, infrastructure, security, DevOps

---

## Executive Summary

TapCash is a Next.js 16 (App Router) GPT-driven offer-wall cashout platform. The web app core (Sprints 1–10) is functionally solid. However, **the mobile app is entirely untouched**, several offer providers are unintegrated, CI/CD is absent, production environment is unconfigured, and multiple P0 security/infrastructure gaps remain. The project is approximately **65–70% complete** relative to a production-ready state.

---

## Priority Classification

| Level | Meaning |
|-------|---------|
| P0 | Critical — blocks production or is a security vulnerability |
| P1 | High — major feature gap or will cause prod failure under load |
| P2 | Medium — quality, performance, or UX degradation |
| P3 | Low — nice-to-have, polish, future-proofing |

---

## P0 — CRITICAL

### SEC-01 · No CI/CD pipeline
- No GitHub Actions workflow exists.
- Every push to `main` is untested before deployment.
- Risk: regressions ship silently to production.

### SEC-02 · Production environment variables not set
- 20+ required env vars are missing (PayPal, Interac, Tremendous, Upstash, Resend, Firebase, Sentry, RapidoReach, etc.).
- App falls back to seed data; live payouts and offer completions are non-functional.

### SEC-03 · Firestore composite indexes not created
- Queries on `ledger_transactions`, `offers`, `users` will fail or timeout at scale without indexes.
- No `firestore.indexes.json` committed.

### SEC-04 · Mobile app authentication not connected to web session system
- `mobile/` still uses old auth patterns; `SessionManager.tsx` sprint change is web-only.
- Mobile users have no valid session JWTs — all protected API calls will 401.

### SEC-05 · No rate limiting on mobile API calls
- Mobile app routes are not covered by the Upstash rate limiter added in Sprint 1.

### SEC-06 · Push notification APNs/FCM credentials missing
- `registerPushToken` and `setupNotificationHandlers` exist in mobile but APNs key and FCM server key are not configured.

### SEC-07 · EAS build not configured
- `eas.json` is absent; `app.json` lacks bundle identifiers.
- iOS/Android builds cannot be produced.

### SEC-08 · No Firestore security rules for new collections
- Phase 5 commit added `admin_logs` and `blocked_ips` rules but audit trail shows `cashout_requests`, `promo_codes`, `multiplier_events`, `ledger_transactions` rules may be incomplete or permissive.

---

## P1 — HIGH

### ARCH-01 · Mobile app uses stale PremiumUi components
- Web Sprint 2 deleted `PremiumHeader` / `PremiumFooter` / `premium.css`, but `mobile/` still imports these patterns.
- Mobile builds will fail or render incorrectly.

### ARCH-02 · Single offer provider (RapidoReach only)
- BACKEND_TODO lists 6 additional providers (AdGem, AdGate, Lootably, Torox, BitLabs, CPX Research). None are integrated.
- Revenue diversification is zero.

### ARCH-03 · No E2E test coverage
- Playwright is referenced in `package.json` but `tests/e2e/` is excluded from indexing — no E2E tests exist.
- Critical user flows (signup → offer → cashout) are untested end-to-end.

### ARCH-04 · Font migration incomplete
- Sprint notes flag: Syne → Space Grotesk, Inter → Manrope not done.
- Design system inconsistency between planned and shipped.

### ARCH-05 · No monitoring / alerting
- Sentry DSN not configured. Better Uptime not set up.
- Zero visibility into production errors or downtime.

### ARCH-06 · No production database backup strategy
- Firestore is auto-managed but no scheduled exports to GCS configured.
- Point-in-time recovery is unavailable.

### ARCH-07 · No domain / DNS configuration
- `tapcash.com` not pointed to Vercel. SSL not provisioned.
- Site is not reachable on production domain.

### ARCH-08 · Referral system not fully validated
- `/referrals` route exists but referral reward crediting logic in Firestore is unverified end-to-end.

### ARCH-09 · No payout queue / async processing
- Payout processing is synchronous inside an API route with no retry queue.
- Network timeout → orphaned payout state (no rollback observed on PayPal/Tremendous paths).

### ARCH-10 · No image optimization pipeline
- Marketing assets and brand images are not optimized. No `next/image` usage audit done.

---

## P2 — MEDIUM

### PERF-01 · In-memory 5-minute cache is single-instance only
- Cache resets on every serverless cold start. No shared cache across Vercel instances.
- Should migrate to Upstash Redis for distributed caching.

### PERF-02 · Bundle size not audited
- No `next build --analyze` report. Large Framer Motion and shadcn bundles may inflate TTI.

### PERF-03 · No Core Web Vitals baseline
- LCP, CLS, FID not measured. No Lighthouse CI gate in pipeline.

### QUAL-01 · Mobile app screen coverage incomplete
- `mobile/src/` has only `auth/`, `components/`, `lib/`, `theme.ts` — no full screen set visible from index.
- Home, Offers, Account screens exist per graph but integration depth unknown.

### QUAL-02 · No integration tests for payout workflows
- 93 unit tests cover pure functions only. Full payout flow (request → admin approve → send) has no integration test.

### QUAL-03 · Admin panel missing key views
- No bulk user action UI, no export (CSV) for payout history, no chart data for revenue.

### QUAL-04 · No GDPR data deletion flow
- GDPR export route exists (`/gdpr`) but data deletion endpoint is not confirmed implemented.

### QUAL-05 · Blog page is static placeholder
- `/blog` renders seed content with no CMS or Firestore backing.

### QUAL-06 · Leaderboard uses polling (60s) — no WebSocket/SSE
- Real-time feel is degraded vs server-sent events or WebSocket approach.

---

## P3 — LOW

### DX-01 · No `.env.example` file committed
- Developers cloning the repo have no env var reference.

### DX-02 · Seed script not idempotent for all collections
- `scripts/seed-firestore.ts` covers 6 collections but `multiplier_events` and `promo_codes` seed is unconfirmed.

### DX-03 · README.md needs updating
- Likely reflects pre-Sprint-1 state. No local setup instructions for the current stack.

### DX-04 · Missing robots.txt content / sitemap completeness
- `robots.ts` and `sitemap.ts` exist but completeness unverified.

### DX-05 · No App Store metadata
- Screenshots, description, privacy policy URL for App Store submission are absent.

### DX-06 · `tapScore` page is undefined
- Route `/tapScore` exists in app directory listing but no documentation of its purpose or implementation status.

---

## Architecture Assessment

| Area | Score | Notes |
|------|-------|-------|
| Web App Core | 8/10 | Solid foundation, good auth, rate limiting, Firestore |
| Mobile App | 3/10 | Auth broken, no EAS config, screens incomplete |
| Security | 6/10 | Web layer good, Firestore rules need audit, prod env vars missing |
| Testing | 5/10 | Good unit tests, zero E2E, zero integration |
| DevOps/CI | 2/10 | No CI pipeline, no monitoring, no domain |
| Offer Ecosystem | 3/10 | Single provider only |
| Performance | 5/10 | No metrics, in-memory cache wrong for serverless |
| Documentation | 7/10 | Many docs, some stale |

**Overall Production Readiness: 4.5/10**

---

## Recommended Execution Order

1. CI/CD pipeline (unblocks everything else)
2. Firestore rules + indexes
3. Env vars + domain
4. Mobile app auth fix + EAS config
5. Monitoring (Sentry + Better Uptime)
6. Additional offer providers
7. E2E tests
8. Performance + bundle audit
9. Admin panel completions
10. App Store submission prep
