# Ground Truth — TapCash Project Handoff

**Last verified:** June 22, 2026
**This document is the single source of truth.** If any other doc contradicts it, this one wins.

---

## What This Project Is

TapCash is a Next.js 16 web app where users earn coins by completing offers (via RapidoReach offerwall), then cash out via PayPal, Interac e-Transfer, or Tremendous gift cards. Admin panel manages users, offers, fraud detection, multipliers, and promo codes.

---

## Commit History (Most Recent First)

| Commit | Message |
|--------|---------|
| `c2950e4` | feat(real-time): Phase 10 — usePolling hook + live dashboard/leaderboard polling |
| `4e10076` | test: Phase 9 — 51 unit tests for payout/postback/cashout-request/admin pure functions |
| `62436b7` | feat(admin): Phase 8 — sidebar nav + multiplier + promo-analytics admin pages |
| `5f5d897` | feat(payout): Phase 6 — fix cashout/status to read cashout_requests, secure /api/payout to admin-only |
| `7317bca` | feat(rapidoreach): Phase 5 — graceful CREDENTIALS_MISSING error with setup instructions |
| `fe1e731` | feat(data): Phase 4 — 6 Firestore API routes with seed fallback + seed-firestore script |
| `b2caa3e` | feat(auth): Phase 3 — session cookie auth via jose, root middleware protecting 7 route groups |
| `fa21e5f` | feat(pages): Phase 2 — 10 missing content pages (games, how-it-works, rewards, etc.) |
| `b59ee21` | feat(foundation): Phase 0 — remove server/ tRPC/Drizzle, harden Firebase Admin, upgrade rate limiter to Upstash |
| `bbdabf1` | merge(redesign): unify PremiumHeader/Footer into Navbar/Footer, delete premium.css |

Preceding commits (not part of Sprint series) cover Snyk fixes, mobile Expo app, GDPR export, push notifications, fraud scoring, health check, and original build.

---

## Architecture Overview

### Web App (`src/`)
- **Framework:** Next.js 16.0.0-canary.5, App Router
- **UI Library:** React 19 + Tailwind CSS v4 + Framer Motion + shadcn/ui components
- **Design:** Dark theme (`bg-[#050813]`), glassmorphism cards, Lucide icons
- **Auth:** Firebase Auth (client) + Firebase Admin SDK (server) with jose-signed HTTP-only session JWTs
- **Database:** Firestore (6+ collections) with seed-data fallback when Firestore is unavailable
- **Rate Limiting:** Upstash Redis (`@upstash/ratelimit`) with in-memory `MutexRateLimiter` fallback
- **Cache:** In-memory 5-minute TTL cache for Firestore reads
- **Monorepo:** Shared `@/shared/tapcash-content` module for cross-platform seed data / types

### Mobile App (`mobile/`)
- **Framework:** Expo SDK, Expo Router
- **Shared Code:** `@shared/tapcash-content` alias
- **Not modified in Sprint 1–10.** Still references old PremiumUi components; needs separate update.

---

## Current State (After 10 Sprints)

### ✅ Sprint 1 — Foundation & Security
- `server/` directory (tRPC, Drizzle schema) deleted — project is App Router only
- `typescript.ignoreBuildErrors` removed from `next.config.ts`
- `firebaseAdmin.ts`: `formatPrivateKey()` helper added for cross-platform key parsing
- Rate limiter replaced: `@upstash/ratelimit` (Upstash Redis) with `MutexRateLimiter` in-memory fallback via `@/lib/rate-limit`
- `security-errors.ts` created for consistent error codes

### ✅ Sprint 2 — Design System
- `PremiumHeader.tsx` → content merged into `components/Navbar.tsx` — file deleted
- `PremiumFooter.tsx` → content merged into `components/Footer.tsx` — file deleted
- `premium.css` → styles consolidated into `app/globals.css` — file deleted
- `PremiumUi.tsx` retained — still used by several pages for card/hero/button wrappers
- `src/components/ui/` created with four base components: `Button`, `Card`, `Badge`, `ProgressBar`
- All 10 pages using PremiumUi components updated to import from correct paths

### ✅ Sprint 3 — Missing Content Pages
Created 10 new pages under `src/app/`:
- `games/`, `how-it-works/`, `rewards/`, `leaderboard/`, `blog/`, `about/`, `careers/`, `contact/`, `help/`, `faq/`
- All wired to existing Navbar/Footer links
- All use consistent dark theme, Framer Motion, Lucide icons
- `/faq` and `/leaderboard` additionally backed by API data when Firestore is connected

### ✅ Sprint 4 — Route Protection
- `middleware.ts` at **project root** (Next.js 16 requirement) — verifies jose-signed session JWT from `session` cookie
- Protected route groups: `/dashboard`, `/cashout`, `/rapidoreach`, `/transactions`, `/referrals`, `/payouts`, `/admin`
- `src/app/api/auth/session/user/route.ts` — creates 7-day HTTP-only session JWT after Firebase ID token verification
- `src/components/SessionManager.tsx` — auto-syncs Firebase auth state ↔ session cookie
- `src/proxy.ts` — deleted (no longer needed)
- Falls back gracefully when `SESSION_SECRET` is unset (dev mode)

### ✅ Sprint 5 — Firestore Data APIs
Created 6 API routes with seed-data fallback:
- `/api/stats`, `/api/faq`, `/api/payout-methods`, `/api/steps`, `/api/trust-points`, `/api/activities`
- `/api/offers` — extended to return `tapCashOffers` fallback when RapidoReach credentials missing
- `/api/leaderboard` — returns seed data when Firestore empty
- `scripts/seed-firestore.ts` — idempotent seed script for 6 collections
- 5-minute in-memory cache on all read endpoints

### ✅ Sprint 6 — RapidoReach Error UX
- `/api/rapidoreach/iframe-url` — returns `CREDENTIALS_MISSING` error (code 501) when env vars unset
- `/rapidoreach/page.tsx` — parses error code and shows context-specific "not configured" message with env-var instructions

### ✅ Sprint 7 — Payout Security & Consistency
- `/cashout/status/page.tsx` — fixed to read from `cashout_requests` collection (was reading non-existent `payouts` collection)
- Status mapping: `pending_review` → `processing` → `approved` → `sent` / `rejected`
- `/api/payout/route.ts` — rewritten as **admin-only** endpoint (403 for non-admins)
  - POST: requires `cashoutRequestId` from an `approved` `cashout_requests` doc; processes through PayPal/Interac/Tremendous; updates status `approved` → `processing` → `sent`; reverts to `approved` on failure
  - GET: lists `cashout_requests` docs with status filter
  - Includes Interac security Q&A validation, `processPayoutWithProvider` helper, audit logging
- `/api/payouts/request/route.ts` — user-facing cashout request with anti-fraud (rate limit, bot/IP/VPN checks, engagement lock, destination lock, Firestore `RunTransaction`)

### ✅ Sprint 8 — Admin UX
- `src/app/admin/layout.tsx` — persistent sidebar with 8 nav links: Command Center, Dashboard, Users, Transactions, Offers, Fraud Detection, Multipliers, Promo Codes
- `src/app/admin/multiplier/page.tsx` — list multiplier events, create form, enable/disable toggle
- `src/app/admin/promo-analytics/page.tsx` — summary cards, searchable table of code redemptions
- All existing admin pages (dashboard, users, transactions, offers, fraud) linked from sidebar

### ✅ Sprint 9 — Unit Tests
- 51 new tests across 4 files (pure functions only — no mocks needed):
  - `src/app/api/payout/__tests__/route.test.ts` — `coinsToDollars`, `validateProvider`
  - `src/app/api/postback/rapidoreach/__tests__/route.test.ts` — `parseAmountCoins`, `isCompletedStatus`
  - `src/app/api/payouts/request/__tests__/route.test.ts` — `getDestinationLockId`, `validateCashoutAmount`, `validateMethod`
  - `src/app/api/admin/__tests__/admin-utils.test.ts` — `ADMIN_UIDS` parsing, status transition validation, rate limit config
- Total: **93 tests across 7 suites** — all passing
- Run with: `npx jest`

### ✅ Sprint 10 — Real-Time Polling
- `src/hooks/usePolling.ts` — generic React hook with `callback`, `intervalMs`, `enabled` params; cleans up on unmount
- `/dashboard/page.tsx` — polls `/api/activity/live` every 30s, `/api/leaderboard/live` every 60s
- `/leaderboard/page.tsx` — polls `/api/leaderboard` every 60s

---

## Critical Architecture Decisions

1. **Session auth uses jose-verified JWTs (HTTP-only cookies), not Firebase ID tokens directly.** This enables Edge middleware route protection without Firebase Admin SDK in Edge runtime.

2. **Seed data in `shared/tapcash-content.ts` is the permanent fallback.** The app works fully even without Firestore or RapidoReach configured.

3. **`/api/payout` is admin-only.** End-user cashout requests go through `/api/payouts/request` (with anti-fraud). Admins then process approved requests through `/api/payout`.

4. **`/cashout/status` reads from `cashout_requests` collection**, not `payouts`. Statuses: `pending_review` → `processing` → `approved` → `sent` / `rejected`.

5. **Polling (usePolling at 30s/60s) chosen over SSE/WebSocket** because Vercel serverless function timeouts make long-lived connections unreliable.

6. **`middleware.ts` at project root** (not `src/`) — Next.js requires it there for Edge middleware.

---

## File Map

```
project root/
├── middleware.ts                     # Root Edge middleware — session JWT verification
├── next.config.ts                    # (typescript.ignoreBuildErrors removed)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/session/user/    # Issue session JWT (POST)
│   │   │   ├── stats/                # GET — Firestore-backed + seed fallback
│   │   │   ├── faq/                  # GET — Firestore-backed + seed fallback
│   │   │   ├── payout-methods/       # GET — Firestore-backed + seed fallback
│   │   │   ├── steps/                # GET — Firestore-backed + seed fallback
│   │   │   ├── trust-points/         # GET — Firestore-backed + seed fallback
│   │   │   ├── activities/           # GET — Firestore-backed + seed fallback
│   │   │   ├── activity/live/        # GET — live activity for polling
│   │   │   ├── leaderboard/          # GET — seed fallback when Firestore empty
│   │   │   ├── leaderboard/live/     # GET — live leaderboard for polling
│   │   │   ├── offers/               # GET — tapCashOffers fallback when RR unset
│   │   │   ├── rapidoreach/iframe-url/ # GET — signed iframe URL / CREDENTIALS_MISSING
│   │   │   ├── postback/rapidoreach/ # POST — IP-whitelisted, MD5-verified
│   │   │   ├── payouts/request/      # POST — user cashout request with anti-fraud
│   │   │   ├── payout/               # POST (admin) + GET — process/list payouts
│   │   │   └── admin/                # Admin utilities
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Sidebar with 8 links
│   │   │   ├── page.tsx              # Command center (withdrawal + user mgmt tabs)
│   │   │   ├── dashboard/            # Stats dashboard with charts
│   │   │   ├── users/                # User management (ban/suspend/balance)
│   │   │   ├── transactions/         # Transaction management + CSV export
│   │   │   ├── offers/               # Offer CRUD
│   │   │   ├── fraud/                # Fraud alert review
│   │   │   ├── multiplier/           # Multiplier events CRUD
│   │   │   └── promo-analytics/      # Promo code redemption analytics
│   │   ├── dashboard/                # Protected — polls live data
│   │   ├── cashout/status/           # Reads cashout_requests via onSnapshot
│   │   ├── rapidoreach/              # Offerwall iframe with CREDENTIALS_MISSING handling
│   │   └── games/ how-it-works/ rewards/ leaderboard/ blog/ about/ careers/ contact/ help/ faq/
│   ├── components/
│   │   ├── Navbar.tsx                # Unified header (merged from PremiumHeader)
│   │   ├── Footer.tsx                # Unified footer (merged from PremiumFooter)
│   │   ├── SessionManager.tsx        # Firebase ↔ cookie sync
│   │   ├── PremiumUi.tsx             # Retained wrapper components
│   │   └── ui/                       # Button, Card, Badge, ProgressBar
│   ├── hooks/
│   │   └── usePolling.ts             # Generic polling hook
│   ├── lib/
│   │   ├── rate-limit.ts             # Upstash + in-memory fallback rate limiter
│   │   ├── security-errors.ts        # Error code constants
│   │   ├── firebaseAdmin.ts          # Admin SDK (with formatPrivateKey)
│   │   └── __tests__/                # 42 lib tests (paypal, interac, tremendous, rate-limit, email, payout-flow)
│   ├── middleware/
│   │   └── index.ts                  # Legacy (rate-limit did NOT move here)
│   └── proxy.ts                      # DELETED
├── shared/
│   └── tapcash-content.ts            # Cross-platform seed data + types
└── scripts/
    └── seed-firestore.ts             # Idempotent Firestore seed (6 collections)
```

---

## Blockers (Cannot Test Without Credentials)

| Credential | Needed For |
|------------|------------|
| `RAPIDOREACH_APP_ID`, `RAPIDOREACH_APP_KEY`, `RAPIDOREACH_APP_SECRET`, `RAPIDOREACH_TRANSACTION_KEY` | Live offerwall, postback, offer completion flow |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | Live PayPal payouts |
| `INTERAC_API_KEY`, `INTERAC_API_SECRET` | Live Interac payouts |
| `TREMENDOUS_API_KEY` | Live Tremendous payouts |
| SendGrid or Resend API key | Payout-approved/rejected email notifications |
| Production Firebase project | Seed script, Firestore-backed API routes, deployment |

---

## How to Start Working

```bash
# Web app
npm install
npm run dev              # → localhost:3000

# Run tests
npx jest                 # 93 tests across 7 suites

# Type-check
npx tsc --noEmit

# Seed Firestore (after setting FIREBASE_* env vars)
npx tsx scripts/seed-firestore.ts
```

---

## What NOT to Touch

- `mobile/` directory — Expo app, has its own package.json and dependency tree; Sprint 1–10 only touched `src/`
- `functions/` directory — Cloud Functions; not modified in Sprint 1–10
- `src/components/PremiumUi.tsx` — still used by multiple pages

---

## Key Environment Variables

```env
# Required
SESSION_SECRET=            # 32+ char random string for session JWTs
ADMIN_UIDS=                # Comma-separated Firebase UIDs with admin access

# Firebase Admin (at least one method)
FIREBASE_SERVICE_ACCOUNT={...}  # JSON string
# OR
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Offerwall
RAPIDOREACH_APP_ID=
RAPIDOREACH_APP_KEY=
RAPIDOREACH_APP_SECRET=
RAPIDOREACH_TRANSACTION_KEY=

# Payout Providers
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox
INTERAC_API_KEY=
INTERAC_API_SECRET=
INTERAC_ENVIRONMENT=sandbox
TREMENDOUS_API_KEY=
TREMENDOUS_CAMPAIGN_ID=
TREMENDOUS_ENVIRONMENT=testflight

# Email
RESEND_API_KEY=
# or SendGrid
SENDGRID_API_KEY=
```

---

## Next Steps (To Go Live)

1. Set all env vars in Vercel dashboard + `.env.local`
2. Run `npx tsx scripts/seed-firestore.ts`
3. Deploy: `git push` → Vercel auto-deploys
4. Point domain DNS to Vercel
5. Test with sandbox credentials before switching providers to `live`/`production`
