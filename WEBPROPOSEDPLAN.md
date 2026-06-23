# TapCash Web — Launch Plan
> Based on deep codebase audit performed 2026-06-22.
> Target: production-ready web app at tapcash.online
> Status: Phases 1-4 ✅ Complete | Phase 5 🔲 Ready

---

## PHASE 1 — Close the Product Loop ✅ COMPLETE

### Task 1.1 — Build the Cashout Submission Flow ✅
**Implemented in `src/app/cashout/page.tsx`**
- 12 selectable method cards with min coins, ETA, audience tag
- Method-aware destination input (email for most, BTC/LTC wallet addresses)
- Coin amount input with live CAD conversion (1000 coins = $1), min 2000, 25/50/75/All quick-select
- POST to `/api/payouts/request` with `Authorization: Bearer {token}` + device fingerprint
- Error handling: 400/403/429/500 with retry suggestions
- Canvas-based device fingerprint (no npm dependency needed)
- Interac security question + answer fields with validation

### Task 1.2 — Fix the Interac Payout Path ✅
**Implemented Option A (manual processing) in `/api/payout/route.ts`**
- Interac + 9 other manual providers (BTC, LTC, Visa, Steam, Roblox, Tim Hortons, Canadian Tire, Cineplex, Shoppers) skip API calls
- Returns `manual-{timestamp}` transaction ID, status set to `manual_required`
- Admin "Mark as Sent" flow via POST to `/api/admin/withdrawals` with `action: "mark_sent"`
- Creates ledger `cashout_paid` entry + sends payout sent email

### Task 1.3 — Fix the Balance Fallback ✅
- `dashboard/page.tsx`: `??24750` → `??0`
- `cashout/page.tsx`: `??24750` → `??0`, `??1200` → `??0`

---

## PHASE 2 — Admin Panel: Complete the Approval Pipeline ✅ COMPLETE

### Task 2.1 — Add "Approve & Pay" to Withdrawal Queue ✅
- **2.1.1**: "Approve & Pay" button on `pending_review` withdrawals — approve first, then call `/api/payout`. Shows transaction ID or error inline. Available for all methods (not just PayPal/gift cards).
- **2.1.2**: "Mark Sent" button shows for both `manual_required` and `approved` + manual method. Modal asks for bank reference number. GET endpoint extended to load `approved` status withdrawals.

### Task 2.2 — Verify Coin Refund on Rejection ✅
- **2.2.1**: Confirmed — `/api/admin/withdrawals/route.ts:214` writes `cashout_rejected` ledger with `balanceEffectCoins: +amountCoins`
- **2.2.2**: `window.prompt` for rejection reason, written to `cashout_requests.adminNote`, visible to user in `/cashout/status`

### Task 2.3 — Admin Stats: Make Live ✅
- Admin page fetches live stats from `/api/admin/withdrawals` GET response (users, pending, postbacks24h, flagged)

### Task 2.4 — Admin Fraud Page ✅
- Verified loads from `fraud_flags` Firestore collection
- Added: blocked IPs tab with unblock button, unflag user action, CSV export

---

## PHASE 3 — Marketing / Trust Layer ✅ COMPLETE

### Task 3.1 — Replace Fake Stats with Live Data ✅
- **3.1.1**: `StatsSection.tsx` fetches from `/api/stats/platform`, falls back to hardcoded on error
- **3.1.2**: `TestimonialsSection.tsx` retitled to "Sample Payouts" with disclaimer. Trustpilot widget removed.

### Task 3.2 — Fix or Remove Blog ✅
- **3.2.1**: Created `src/app/blog/[slug]/page.tsx` as dynamic route with static content map for all 3 existing posts. Navbar/Footer links preserved.

### Task 3.3 — Games Page ✅
- **3.3.1**: Page retitled "Offers & Surveys", "Games" category tab removed. All links route to RapidoReach. CTA is "Start earning".

---

## PHASE 4 — Security & Data Integrity ✅ COMPLETE

### Task 4.1 — Firestore Security Rules Audit ✅
- **4.1.1**: `firestore.rules` audited — all collections properly locked:
  - `ledger_transactions`: user-scoped read, no client write ✅
  - `cashout_requests`: user-scoped read, no client write ✅
  - `users`: user-scoped read, secure fields blocked ✅
  - `offer_postbacks`: no client access ✅
  - `fraud_flags`: no client access ✅
  - `admin_logs` + `blocked_ips`: no client access (added during audit) ✅
- **4.1.2**: ⚠️ Manual check required — verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel dashboard

### Task 4.2 — Environment Variables Audit ⚠️ MANUAL CHECK REQUIRED
- **4.2.1**: All 14 required env vars listed below. Verify in Vercel dashboard → Settings → Environment Variables:
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  - `NEXT_PUBLIC_FIREBASE_*` (client-side Firebase config)
  - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`
  - `TREMENDOUS_API_KEY`, `TREMENDOUS_CAMPAIGN_ID`, `TREMENDOUS_ENVIRONMENT`
  - `RAPIDOREACH_APP_KEY`, `RAPIDOREACH_APP_SECRET`, `RAPIDOREACH_APP_ID`
  - `LOOTABLY_SECRET_KEY`
  - `PROXYCHECK_API_KEY`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `SENTRY_DSN`
  - `RESEND_API_KEY`

### Task 4.3 — GDPR / PIPEDA Compliance ✅
- **4.3.1**: GDPR "Download my data" button wired in `/dashboard/page.tsx` — calls `/api/gdpr/export` and downloads JSON ✅
- **4.3.2**: Cookie consent banner created at `src/components/CookieConsent.tsx` — fixed bottom bar, saves consent to localStorage, links to Cookie Policy. Added to root layout ✅

---

## PHASE 5 — Polish & Pre-Launch

### Task 5.1 — Coin Conversion Consistency

#### 5.1.1
- Confirm everywhere that: `1000 coins = $1.00 CAD`
- `/api/payouts/request`: `amountCents = Math.floor(coinsNum / 10)` — this means 1000 coins = 100 cents = $1. ✅
- `/api/payout`: `coinsToDollars = coins / 1000` — 1000 coins = $1. ✅
- `CashoutFormPremium`: shows "You'll Receive: X coins" — update to show `${(coins/1000).toFixed(2)} CAD`
- All landing page copy should use a consistent rate

### Task 5.2 — Error & Loading States

#### 5.2.1
- Dashboard: if user has no ledger entries, show an onboarding CTA instead of empty spinner
- Cashout status: if `payouts.length === 0` and user has balance > 0, show "You haven't cashed out yet — request your first payout"

### Task 5.3 — Email Notifications

#### 5.3.1
- Confirm welcome email sends on signup (check `/api/email/drip` or `src/lib/email.ts`)
- Add a cashout submission confirmation email: triggered after successful POST to `/api/payouts/request`
- Add a cashout approved/sent email: triggered when admin marks a withdrawal as sent

### Task 5.4 — Load Testing

#### 5.4.1
- Run a basic load test against `/api/payouts/request` with 10 concurrent requests from the same user
- Confirm the Firestore transaction correctly prevents double-cashout (the `activeCashoutRequestId` check)
- Test the RapidoReach postback with duplicate `txId` — confirm idempotency (`"1"` response, no double credit)

### Task 5.5 — Sitemap / robots.txt

#### 5.5.1
- `/robots.ts` and `/sitemap.ts` exist — confirm admin routes are in robots.txt `Disallow`
- Confirm `/admin/*` is behind auth in middleware AND blocked from search indexing

---

## Launch Checklist

- [x] Cashout form wired to API (Phase 1)
- [x] Interac path is honest (manual or real processor)
- [x] Fake balance fallbacks removed
- [x] Admin "Mark as Sent" for Interac works
- [x] Admin rejection refunds coins
- [x] Fake stats replaced or removed
- [x] Fake testimonials replaced or removed
- [x] Blog either works or is removed
- [x] GDPR data export accessible
- [x] Firestore security rules audited
- [ ] All production env vars confirmed (Vercel dashboard check)
- [ ] Redis rate limiting confirmed active (Vercel dashboard check)
- [ ] Email notifications on cashout submit + sent
- [ ] Load test confirms no double-cashout
- [ ] Legal pages reviewed by lawyer (PIPEDA)
