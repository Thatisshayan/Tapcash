# TapCash — Master Plan (All Sprints Complete)

**Generated:** 2026-06-22
**Status:** ✅ All 10 sprints complete — 93 tests passing, all routes protected, admin panel done

---

## Legend
- ✅ = Done (this sprint)
- 🔲 = Not in scope of Sprint 1–10
- 🟡 = Blocked (needs credentials from you)

---

## Sprint 1 ✅ — Foundation & Credential Audit
- ✅ 1.1 Remove stale `server/` (tRPC/Drizzle) — deleted
- ✅ 1.2 Remove `typescript.ignoreBuildErrors` from `next.config.ts`
- ✅ 1.3 Create `formatPrivateKey()` in `firebaseAdmin.ts`
- ✅ 1.4 Replace in-memory rate limiter with `@upstash/ratelimit` + `MutexRateLimiter` fallback
- ✅ 1.5 Create `security-errors.ts` for consistent error codes
- 🟡 Cannot verify RapidoReach / PayPal / Upstash credentials without your input

## Sprint 2 ✅ — Design System Unification
- ✅ Merge `PremiumHeader.tsx` → `Navbar.tsx`; delete PremiumHeader
- ✅ Merge `PremiumFooter.tsx` → `Footer.tsx`; delete PremiumFooter
- ✅ Consolidate `premium.css` → `globals.css`; delete premium.css
- ✅ Keep `PremiumUi.tsx` (still used by multiple pages)
- ✅ Create `src/components/ui/` — Button, Card, Badge, ProgressBar
- ✅ Update all pages using Premium components

## Sprint 3 ✅ — Missing Pages
- ✅ Create 10 pages: `/games`, `/how-it-works`, `/rewards`, `/leaderboard`, `/blog`, `/about`, `/careers`, `/contact`, `/help`, `/faq`
- ✅ Wire all pages to Navbar/Footer links
- ✅ Consistent dark theme, Framer Motion, Lucide icons

## Sprint 4 ✅ — Route Protection
- ✅ Root `middleware.ts` with jose-session-JWT verification
- ✅ Protect 7 route groups: dashboard, cashout, rapidoreach, transactions, referrals, payouts, admin
- ✅ `/api/auth/session/user` — issues 7-day HTTP-only session JWTs
- ✅ `SessionManager.tsx` — syncs Firebase auth ↔ session cookie
- ✅ Delete `src/proxy.ts`
- ✅ Graceful fallback when `SESSION_SECRET` unset (dev mode)

## Sprint 5 ✅ — Firestore Data APIs
- ✅ 6 Firestore-backed API routes: `/api/stats`, `/api/faq`, `/api/payout-methods`, `/api/steps`, `/api/trust-points`, `/api/activities`
- ✅ Seed-data permanent fallback when Firestore unavailable
- ✅ `/api/offers` — returns `tapCashOffers` fallback when RapidoReach unset
- ✅ `/api/leaderboard` — returns seed data when Firestore empty
- ✅ `scripts/seed-firestore.ts` — idempotent seed for 6 collections
- ✅ 5-minute in-memory cache on read endpoints

## Sprint 6 ✅ — RapidoReach Error UX
- ✅ `/api/rapidoreach/iframe-url` — returns `CREDENTIALS_MISSING` (501) when env vars unset
- ✅ `/rapidoreach/page.tsx` — shows specific "not configured" message with instructions

## Sprint 7 ✅ — Payout Security & Consistency
- ✅ `/cashout/status/page.tsx` — reads from `cashout_requests` (was `payouts`)
✅ Status mapping: `pending_review` → `processing` → `approved` → `sent` / `rejected`
- ✅ `/api/payout` rewritten as **admin-only**: POST requires `cashoutRequestId` from `approved` doc; GET lists requests
- ✅ Includes Interac security Q&A validation, `processPayoutWithProvider`, audit logging, rollback on failure
- ✅ `/api/payouts/request` — user-facing with anti-fraud (rate limit, bot/IP/VPN, engagement lock, destination lock, RunTransaction)

## Sprint 8 ✅ — Admin UX
- ✅ Persistent sidebar in `admin/layout.tsx` (8 nav links)
- ✅ `/admin/multiplier` — list, create, enable/disable multiplier events
- ✅ `/admin/promo-analytics` — summary cards, searchable redemption table
- ✅ All existing admin pages (dashboard, users, transactions, offers, fraud) linked from sidebar

## Sprint 9 ✅ — Unit Tests
- ✅ 51 new tests across 4 files (pure functions, no mocks):
  - `payout/__tests__/route.test.ts` — `coinsToDollars`, `validateProvider`
  - `postback/rapidoreach/__tests__/route.test.ts` — `parseAmountCoins`, `isCompletedStatus`
  - `payouts/request/__tests__/route.test.ts` — `getDestinationLockId`, `validateCashoutAmount`, `validateMethod`
  - `admin/__tests__/admin-utils.test.ts` — `ADMIN_UIDS`, status transitions, rate limit config
- ✅ Total: **93 tests across 7 suites** — all passing

## Sprint 10 ✅ — Real-Time Polling
- ✅ `src/hooks/usePolling.ts` — generic hook with `callback`, `intervalMs`, `enabled`; cleanup on unmount
- ✅ Dashboard polls `/api/activity/live` (30s) + `/api/leaderboard/live` (60s)
- ✅ Leaderboard page polls `/api/leaderboard` (60s)

---

## What's NOT Done (Out of Scope for Sprints 1–10)
- 🔲 Font migration (Syne → Space Grotesk, Inter → Manrope) — original plan Phases were restructured
- 🔲 Mobile app (`mobile/`) updates — not touched in these sprints
- 🔲 Image optimization / brand asset updates from OneDrive
- 🔲 E2E tests with Playwright
- 🔲 CI/CD pipeline changes
- 🔲 Sentry / Better Uptime configuration

---

## Environment Variables Still Needed (From You)
| Variable | Purpose |
|----------|---------|
| `RAPIDOREACH_APP_ID` | Offerwall live integration |
| `RAPIDOREACH_APP_KEY` | Offerwall live integration |
| `RAPIDOREACH_APP_SECRET` | Offerwall live integration |
| `RAPIDOREACH_TRANSACTION_KEY` | Offerwall postback verification |
| `PAYPAL_CLIENT_ID` | Live PayPal payouts |
| `PAYPAL_CLIENT_SECRET` | Live PayPal payouts |
| `INTERAC_API_KEY` | Live Interac e-Transfer |
| `INTERAC_API_SECRET` | Live Interac e-Transfer |
| `TREMENDOUS_API_KEY` | Live gift card payouts |
| `UPSTASH_REDIS_REST_URL` | Production rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Production rate limiting |
| `RESEND_API_KEY` (or `SENDGRID_API_KEY`) | Payout email notifications |

---

## To Go Live
1. Set all env vars in Vercel dashboard + `.env.local`
2. Run `npx tsx scripts/seed-firestore.ts`
3. Deploy: `git push` → Vercel auto-deploys
4. Point domain DNS
5. Sandbox test → switch providers to `live`
