# PROPOSALFORALLINREPORT.md — TapCash Launch Readiness Proposal

**Generated:** July 6, 2026  
**Based on:** ALLINREPORT.md synthesis of 4 source reports  
**Purpose:** Fill every identified gap to make TapCash production-ready  

---

## 1. PROPOSAL OVERVIEW

### What This Proposal Solves
| Gap | Source | Proposal Section |
|-----|--------|-----------------|
| 8 critical security/auth flaws | Audit + Launch.md | §2 Security Hardening |
| Firebase key exposure | HTML Plan | §3 Infrastructure Lockdown |
| Mobile app broken | Audit + HTML Plan | §4 Mobile Rebuild |
| UI/UX lacks conversion engine | Competitor Analysis | §5 UI/UX Competitive Overhaul |
| No daily streak/gamification in UI | Competitor Analysis | §5 UI/UX Competitive Overhaul |
| No live social proof feed widget | Competitor Analysis | §5 UI/UX Competitive Overhaul |
| Missing gift card bonus mechanic | Competitor Analysis | §6 Business Logic Gaps |
| No Canadian merchant differentiation | Competitor Analysis | §6 Business Logic Gaps |
| No GDPR/PIPEDA data export/delete | Launch.md | §7 Compliance |
| Test coverage below target | Audit | §8 Testing Expansion |
| Firebase Functions v1 deprecated | Audit | §9 Functions Migration |
| No scheduled cron jobs | Audit | §9 Functions Migration |

### Proposal Scope
**Timeline:** 5 sprints (10 weeks) or compressed 9-day blitz (with full-time team)  
**Team Required:** Backend Lead, Frontend Dev, Mobile Dev, DevOps, QA  
**Budget:** $60-150/mo infrastructure + $99/yr Apple Developer (iOS) + potential Lootably/Tremendous funding  

---

## 2. SECURITY HARDENING PROPOSAL

### 2.1 Admin API Authentication Overhaul
**Current:** Bearer tokens (Firebase ID tokens with 1hr TTL) on all admin routes  
**Proposed:** Cookie-based session with JWT + Firestore isAdmin verification

```
New Auth Flow:
1. Admin logs in → Firebase Auth → ID token
2. POST /api/auth/session → creates httpOnly session cookie (24h sliding expiry)
3. All admin routes verify session cookie via middleware
4. Session refresh on every admin API call
5. Admin audit trail for every route access
```

**Files to create/modify:**
- `src/lib/auth/admin.ts` — `requireAdmin(req)` helper
- `src/app/api/auth/session/route.ts` — session creation + refresh
- All `src/app/api/admin/*/route.ts` — switch to session cookie auth
- `middleware.ts` — add admin session verification

### 2.2 Firestore Transaction Safety
**Current:** Read-then-write on balance operations (race condition vulnerable)  
**Proposed:** Atomic Firestore transactions on ALL balance mutations

**Affected endpoints:**
- `/api/payouts/request` — balance check + deduction + ledger (already uses transaction, verify)
- `/api/clicks` — click recording
- `/api/postback/rapidoreach` — offer credit + ledger
- `/api/admin/*/route.ts` — admin balance adjustments
- Firebase Functions: `completeTask`, `requestPayout`

### 2.3 CSRF Protection
**Current:** No CSRF tokens on any endpoint  
**Proposed:** Double-submit cookie pattern

```
1. Session creation generates CSRF token (crypto.randomBytes)
2. Token stored in cookie + embedded in session JWT claim
3. Frontend sends X-CSRF-Token header on all mutating requests
4. Backend validates token matches cookie + JWT claim
5. Origin header validation: must match https://tapcash.online
```

### 2.4 Idempotency Keys for Financial Operations
**Current:** No deduplication on cashout/credit  
**Proposed:** UUID v4 idempotency keys stored in Redis with 24h TTL

```
1. Frontend generates Idempotency-Key on form submit
2. Backend checks Redis BEFORE processing
3. If key exists: return 409 with existing payout ID + status
4. If new: store key → payout_request mapping, then process
5. Apply to: cashout, offer credit, admin balance adjustment
```

### 2.5 Cashout Validation Rules
**Proposed rules:**
| Rule | Value | Rationale |
|------|-------|-----------|
| Minimum cashout | 2,000 coins ($2.00 CAD) | Already implemented |
| Maximum per transaction | 50,000 coins ($50.00 CAD) | Limit single-exposure risk |
| Daily limit per user | 100,000 coins ($100 CAD) | Velocity fraud prevention |
| 7-day hold | New users cannot cash out for 7 days | Cooling-off period |
| Activity gate | Minimum 2 approved offers before first cashout | Already implemented |
| Fraud score gate | fraudScore > 50 → auto-block cashout | High-risk user protection |
| Admin review threshold | >$50 OR account <30 days → pending_review | Manual review window |

### 2.6 User Session System
**Current:** Firebase client-side only (XSS vulnerable)  
**Proposed:** httpOnly secure cookies with server-side verification

```
Session Cookie Settings:
- httpOnly: true (no JavaScript access)
- secure: true (HTTPS only in production)
- sameSite: 'strict' (no cross-site sending)
- path: '/'
- maxAge: 7 days (24h sliding refresh)
```

### 2.7 Origin Validation & CORS
```
Production:
  Access-Control-Allow-Origin: https://tapcash.online
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token
  Access-Control-Allow-Credentials: true

Development:
  Access-Control-Allow-Origin: http://localhost:3000
```

---

## 3. INFRASTRUCTURE LOCKDOWN PROPOSAL

### 3.1 Firebase Service Account Key Rotation
**Immediate (Day 1):**
1. Delete compromised key in Firebase Console → Project Settings → Service Accounts
2. Generate new service account key
3. Purge old key from git history: `git filter-repo --path path/to/serviceAccountKey.json --invert-paths`
4. Force push: `git push origin --force --all && git push origin --force --tags`
5. Add new key to Vercel as `FIREBASE_PRIVATE_KEY` env var

### 3.2 Environment Variable Lockdown
**Proposed `.env.example` with all 20+ required variables:**

```bash
# === FIREBASE (Client) ===
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# === FIREBASE (Server - Admin SDK) ===
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# === SESSION ===
SESSION_SECRET=                    # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# === REDIS (Upstash) ===
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# === OFFER WALLS ===
RAPIDOREACH_APP_ID=
RAPIDOREACH_APP_KEY=
RAPIDOREACH_APP_SECRET=
RAPIDOREACH_TRANSACTION_KEY=

# === PAYMENTS ===
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox                # Switch to 'live' for production
TREMENDOUS_API_KEY=
TREMENDOUS_CAMPAIGN_ID=
TREMENDOUS_ENVIRONMENT=testflight  # Switch to 'production' for live

# === EMAIL ===
RESEND_API_KEY=

# === ANTI-FRAUD ===
PROXYCHECK_API_KEY=

# === MONITORING ===
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=

# === ADMIN ===
ADMIN_UIDS=                        # Comma-separated Firebase UIDs
```

**Build-time validation:** Add `env.ts` with Zod schema — build fails if any required var missing.

### 3.3 Firestore Composite Indexes
```json
{
  "indexes": [
    { "collectionGroup": "ledger_transactions", "fields": [
      {"fieldPath":"userId","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "ledger_transactions", "fields": [
      {"fieldPath":"userId","order":"ASCENDING"},
      {"fieldPath":"type","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "cashout_requests", "fields": [
      {"fieldPath":"userId","order":"ASCENDING"},
      {"fieldPath":"status","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "cashout_requests", "fields": [
      {"fieldPath":"status","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "offer_postbacks", "fields": [
      {"fieldPath":"userId","order":"ASCENDING"},
      {"fieldPath":"status","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "fraud_flags", "fields": [
      {"fieldPath":"status","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "fraud_flags", "fields": [
      {"fieldPath":"userId","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "users", "fields": [
      {"fieldPath":"status","order":"ASCENDING"},
      {"fieldPath":"createdAt","order":"DESCENDING"}
    ]},
    { "collectionGroup": "offer_clicks", "fields": [
      {"fieldPath":"userId","order":"ASCENDING"},
      {"fieldPath":"offerId","order":"ASCENDING"},
      {"fieldPath":"timestamp","order":"DESCENDING"}
    ]}
  ]
}
```

**Deploy:** `firebase deploy --only firestore:indexes`

### 3.4 Redis Distributed Cache
Replace in-memory cache with Upstash Redis for leaderboard:
```
Key: leaderboard:top10
TTL: 300 seconds (5 minutes)
Invalidation: on every new transaction
Fallback: compute from Firestore if Redis unreachable
Stampede protection: singleflight pattern
```

---

## 4. MOBILE REBUILD PROPOSAL

### 4.1 Current State Assessment
| Area | Status | Issue |
|------|--------|-------|
| PremiumUi imports | ❌ BROKEN | References deleted components |
| EAS config | ❌ MISSING | No eas.json, no EAS project |
| API base URL | ❌ HARDCODED | `localhost:3000` in dev, no prod config |
| Biometric auth | ✅ WORKS | expo-local-authentication + SecureStore |
| Push notifications | ✅ WORKS | Expo + Firebase Functions |
| Firestore listeners | ✅ WORKS | Real-time balance/transactions |
| Theme | ⚠️ BASIC | Needs to match web overhaul |

### 4.2 Rebuild Scope
1. Fix all `PremiumUi` imports → `@/components/ui/` equivalents
2. Create `mobile/.env` with `EXPO_PUBLIC_API_BASE_URL`
3. Create `eas.json` (development/preview/production profiles)
4. Link Expo account + EAS project
5. Redesign screens to match web overhaul (dark theme, streaks, offer cards, live feed)
6. Add offline Firestore persistence
7. iOS TestFlight build (`eas build --platform ios --profile preview`)
8. Android APK build (`eas build --platform android --profile preview`)

### 4.3 New Mobile Screens (Matching Web Overhaul)
- **Home:** Coin balance (animated), CashPath tracker, Top Offers, Stats
- **Earn:** Offer wall with RapidoReach, difficulty badges, time estimates
- **Activity:** Transaction history with real-time updates
- **Cashout:** Single-page 3-step flow (method → amount → confirm)
- **Account:** Settings, profile, logout, GDPR export/delete

---

## 5. UI/UX COMPETITIVE OVERHAUL PROPOSAL

### 5.1 Landing Page Rebuild
Based on competitor analysis (Freecash + Scrambly winning mechanics):

**Hero Section (HIGHEST IMPACT):**
- Animated counter: "$2,847,291 paid to Canadian users" (from `/api/stats`)
- Live signup counter: "127 people joined today"
- Single bold CTA: "Start Earning Free" (no secondary distractions)
- 5-star Trustpilot row under CTA

**Live Feed Widget (STEAL FROM FREECASH):**
- Floating right-side ticker: "Ahmed in Toronto just cashed out $12.50 via PayPal · 2 min ago"
- Powered by `/api/activity/live` (already exists)
- Auto-updates every 30 seconds

**How It Works — 4 Steps with Illustrations:**
1. Sign up free (30 sec) — illustration
2. Complete offers & games — illustration
3. Earn TapCoins — illustration
4. Cash out via PayPal or Interac — illustration

**Social Proof Bar:**
- 3 stats from `/api/stats`: "$X,XXX,XXX paid out" · "XX,XXX members" · "4.8/5 rating"

**Cashout Methods Strip:**
- PayPal, Interac, Visa, Amazon, gift card logos
- Badge: "Minimum $5 · Paid within 24hrs"

### 5.2 Dashboard Gamification Layer
**Coin Balance Widget:**
- Large animated coin balance
- Dollar equivalent: "2,450 TapCoins = $24.50"
- Progress bar to next cashout threshold

**Daily Streak Widget (DUOLINGO-STYLE):**
- 7-day streak tracker with Day 1-7 dots
- Current day glowing, completed days green
- "3 day streak! Keep going for a 2x bonus on Day 7"
- Best retention mechanic in the category

**Offer Cards (FREECASH-STYLE):**
- Large payout amount top-right
- Estimated time ("~8 min")
- Difficulty badge (Easy/Medium/Hard)
- Progress bar if multi-step

**"Just Cashed Out" Mini Feed:**
- Last 5 real payouts from `/api/activity/live`
- Creates FOMO inside the product

### 5.3 Cashout Flow — Single Page
**Current:** Multiple pages  
**Proposed:** Single-page 3-step inline flow
1. Choose method (PayPal / Interac / Gift Card / Bitcoin)
2. Enter amount + destination
3. Confirm with real-time balance deduction preview

**Gift Card Bonus Mechanic (STEAL FROM SCRAMBLY):**
- "Choose Amazon and get +$0.50 bonus"
- Drives users toward cheaper payout methods for the platform

### 5.4 Legal Pages
- `/privacy` — PIPEDA-compliant Canadian privacy policy
- `/terms` — Terms of service
- Cookie consent banner (react-cookie-consent)
- Required for Lootably/RapidoReach publisher approval

---

## 6. BUSINESS LOGIC GAPS PROPOSAL

### 6.1 Gift Card Bonus System
**Currently:** Tremendous API integrated but no UI  
**Proposed:** Bonus percentage UI for gift card cashouts

```
Cashout Methods:
- PayPal: Base rate (1x coins)
- Interac: Base rate (1x coins)
- Amazon Gift Card: +2% bonus (1.02x)
- Tim Hortons Gift Card: +3% bonus (1.03x)
- Steam Gift Card: +1% bonus (1.01x)
- Visa Prepaid: +1% bonus (1.01x)
```

### 6.2 Canadian Merchant Differentiator
**Currently:** Interac e-Transfer is the only Canadian-specific option  
**Proposed:** Add Canadian gift card partners via Tremendous:
- Tim Hortons
- Canadian Tire
- Cineplex
- Shoppers Drug Mart
- Lululemon
- Hudson's Bay

### 6.3 Daily Streak Backend (Already Exists)
`src/lib/achievements.ts` has streak logic — wire to UI widgets.

### 6.4 Live Signup Counter
**Currently:** Not tracked  
**Proposed:** Aggregate daily signups in Redis, expose via `/api/stats`

### 6.5 Trustpilot Integration
**Currently:** Not integrated  
**Proposed:** Widget embed on landing page + review collection post-payout

---

## 7. COMPLIANCE PROPOSAL

### 7.1 GDPR/PIPEDA Data Export
```
GET /api/user/data-export
Response: ZIP containing:
- user profile (JSON)
- all transactions (CSV)
- all ledger entries (CSV)
- fraud flags mentioning user (JSON)
- referral history (CSV)
Email download link with 30-day expiry
```

### 7.2 Account Deletion
```
POST /api/user/delete-account
Flow:
1. Set status to 'deletion_pending'
2. 30-day grace period (user can cancel via email link)
3. After grace: anonymize PII (email → SHA256 hash, clear displayName, deviceFingerprint)
4. Retain transaction records (7 years Canadian tax requirement)
5. Delete Firebase Auth user
6. Clear all cookies client-side
```

### 7.3 Age Verification
- Birthdate field on signup (min 13 years old)
- Flag accounts 13-17 for parental consent
- Required checkboxes: ToS, Privacy Policy, Marketing (optional)
- Store consent timestamps in Firestore

### 7.4 Cookie Consent Banner
- `react-cookie-consent` integration
- Minimal, bottom of screen, one click accept
- Tracks consent state in localStorage

---

## 8. TESTING EXPANSION PROPOSAL

### 8.1 Target: 150+ Tests (Current: ~93)

| Category | Tests to Add | Priority |
|----------|-------------|----------|
| Fraud Detection Unit Tests | 15 | P0 |
| Rate Limiting Tests | 8 | P1 |
| Transaction Atomicity Tests | 10 | P0 |
| Admin Authorization Tests | 12 | P0 |
| Input Validation Tests (XSS, SQLi) | 10 | P0 |
| E2E Signup → Offer → Cashout Flow | 5 | P1 |
| E2E Admin Workflow | 3 | P1 |
| Mobile Component Tests | 10 | P2 |
| Load/Performance Tests | 5 | P2 |

### 8.2 Penetration Testing Checklist
- CSRF: Auto-submitting forms → verify rejected
- XSS: Payloads in every input field
- Rate Limit Bypass: Proxy rotation
- Authentication Bypass: Remove cookies, use expired tokens
- IDOR: Access other users' data by changing IDs
- Mass Assignment: Send `{isAdmin: true}` in JSON body
- SQL/NoSQL Injection: Firestore query operators
- Session Fixation: Cookie rotation after auth
- Clickjacking: X-Frame-Options: DENY

---

## 9. FIREBASE FUNCTIONS MIGRATION PROPOSAL

### 9.1 v1 → v2 Migration
**Current:** `firebase-functions/v1` (deprecated)  
**Proposed:** `firebase-functions/v2` with `onCall` + `onRequest`

```typescript
// v1 (current)
import * as functions from "firebase-functions/v1";
export const completeTask = functions.https.onCall(async (data, context) => { ... });

// v2 (proposed)
import { onCall, HttpsError } from "firebase-functions/v2/https";
export const completeTask = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "...");
  // ...
});
```

### 9.2 Scheduled Functions to Add
```typescript
// Daily streak email reminders (cron: 0 20 * * * UTC)
export const dailyStreakReminder = onSchedule("0 20 * * *", async () => { ... });

// Weekly cashout queue cleanup (cron: 0 3 * * 0 UTC)
export const weeklyCashoutCleanup = onSchedule("0 3 * * 0", async () => { ... });

// Monthly fraud score recalculation
export const monthlyFraudRecalc = onSchedule("0 4 1 * *", async () => { ... });

// Leaderboard aggregation (every 5 min)
export const leaderboardAggregate = onSchedule("*/5 * * * *", async () => { ... });
```

---

## 10. RESOURCE REQUIREMENTS

| Role | Hours/Week | Duration | Total | Monthly Cost |
|------|-----------|----------|-------|-------------|
| Backend Lead | 25-30h | 10 weeks | ~250h | Contract |
| Frontend Dev | 15-20h | 8 weeks | ~140h | Contract |
| Mobile Dev | 15-20h | 6 weeks | ~100h | Contract |
| DevOps | 8-12h | 10 weeks | ~100h | Contract |
| QA/Security | 10-15h | 4 weeks | ~50h | Contract |

| Infrastructure | Monthly |
|---------------|---------|
| Vercel Pro | $20 |
| Firebase | $0-50 |
| Upstash Redis | $10-30 |
| Resend | $0-20 |
| Sentry | $26 |
| Better Uptime | $0-29 |
| ProxyCheck.io | $0-10 |
| Apple Developer | $8.25/mo ($99/yr) |
| **TOTAL** | **~$65-165/mo** |

---

## 11. SUCCESS CRITERIA

| Metric | Target | Measurement |
|--------|--------|-------------|
| Security: P0 vulnerabilities | 0 open | Pen test results |
| Test coverage | 150+ tests, 80%+ line coverage | Jest/Playwright reports |
| Performance: LCP | <2.5s | Lighthouse |
| Performance: CLS | <0.1 | Lighthouse |
| Mobile: Build status | iOS TestFlight + Android APK working | EAS dashboard |
| Compliance: GDPR export | Working end-to-end | Manual test |
| Compliance: Account deletion | Working end-to-end | Manual test |
| UI/UX: Landing page | Freecash-level conversion elements | Design review |
| UI/UX: Dashboard | Daily streak + offer cards + live feed | Design review |
| Cashout: Gift card bonus | At least 3 gift card partners with bonus % | Tremendous integration |
| Production: All env vars | Zero fallback values in code | Code review |
| Production: Monitoring | Sentry + Better Uptime active | Dashboard check |

---

*End of PROPOSALFORALLINREPORT.md — Derived from ALLINREPORT.md. All implementation details here feed into PROPOSALFORALLINREPORTACTION.md for sprint planning.*
