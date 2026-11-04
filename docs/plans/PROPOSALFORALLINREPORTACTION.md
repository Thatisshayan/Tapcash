# PROPOSALFORALLINREPORTACTION.md — TapCash Sprint Action Plan

**Generated:** July 6, 2026  
**Based on:** PROPOSALFORALLINREPORT.md  
**Purpose:** Break every gap into discrete sprints, phases, batches, tasks, and subtasks  

---

## SPRINT OVERVIEW

| Sprint | Name | Duration | Focus | Deliverable |
|--------|------|----------|-------|-------------|
| S1 | Security Fortress | Week 1-2 | All P0 security + auth | Zero critical vulns |
| S2 | Backend Hardening | Week 3-4 | Functions migration + compliance | All endpoints secure |
| S3 | UI/UX Overhaul | Week 5-6 | Landing + Dashboard + Cashout | Conversion-ready frontend |
| S4 | Mobile Rebuild | Week 7-8 | iOS + Android rebuild | Working beta builds |
| S5 | Launch Prep | Week 9-10 | Testing + monitoring + legal | Production-ready launch |

---

## SPRINT 1 — SECURITY FORTRESS (Weeks 1-2)

### Phase 1.1 — Emergency Key Rotation (Day 1)
**Priority:** P0 CRITICAL | **Owner:** DevOps | **Time:** 4h

| Task | Subtasks | Status |
|------|----------|--------|
| Rotate Firebase service account key | 1. Delete old key in Firebase Console, 2. Generate new key, 3. Store in Vercel env vars only | ☐ |
| Purge compromised key from git history | 1. `git filter-repo --path serviceAccountKey.json --invert-paths`, 2. Force push, 3. Verify no traces | ☐ |
| Audit all env vars for hardcoded secrets | 1. Grep for hardcoded keys, 2. Move any found to env vars, 3. Update docs | ☐ |
| Rotate all API keys (RapidoReach, ProxyCheck, Resend) | 1. Generate new keys, 2. Update Vercel, 3. Test each integration | ☐ |

### Phase 1.2 — Admin API Authentication (Day 2-4)
**Priority:** P0 CRITICAL | **Owner:** Backend Lead | **Time:** 16h

| Task | Subtasks | Status |
|------|----------|--------|
| Create `src/lib/auth/admin.ts` | 1. `requireAdminSession(req)` function, 2. Verify httpOnly cookie, 3. Validate against Firestore isAdmin field, 4. Throw 401 if invalid | ☐ |
| Create `/api/auth/session` route | 1. POST: create session cookie (24h TTL, sliding), 2. GET: refresh session, 3. DELETE: clear session, 4. Set httpOnly + secure + sameSite flags | ☐ |
| Create CSRF token generation | 1. `generateCsrfToken()` using crypto.randomBytes, 2. Store in session JWT claim, 3. Return in response cookie | ☐ |
| Add CSRF validation middleware | 1. Check X-CSRF-Token header on mutating requests, 2. Validate matches cookie + JWT, 3. Reject if mismatch | ☐ |
| Migrate all admin routes | 1. `/api/admin/analytics/*` (4 routes), 2. `/api/admin/audit/*` (2 routes), 3. `/api/admin/balance/*` (4 routes), 4. `/api/admin/feature-flags/*` (3 routes), 5. `/api/admin/finance/*` (3 routes), 6. `/api/admin/growth/*` (5 routes), 7. `/api/admin/ip-locks/*` (1 route), 8. `/api/admin/lockdown/*` (1 route), 9. `/api/admin/reports/*` (5 routes), 10. `/api/admin/rules/*` (2 routes), 11. `/api/admin/spam/*` (2 routes), 12. `/api/admin/users/*` (2 routes), 13. `/api/admin/weekly-digest/*` (2 routes), 14. `/api/admin/metrics/*` (1 route), 15. `/api/admin/overrides/*` (2 routes) | ☐ |
| Add admin audit logging | 1. Log every admin API call to `admin_audit_logs`, 2. Include: uid, route, timestamp, action, IP | ☐ |
| Update middleware.ts for admin session | 1. Add admin session verification, 2. Add CSRF check, 3. Keep existing JWT verification for non-admin routes | ☐ |

### Phase 1.3 — CSRF & Origin Protection (Day 4-5)
**Priority:** P0 CRITICAL | **Owner:** Backend Lead | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Implement CORS with origin validation | 1. Production: `https://tapcash.online`, 2. Development: `http://localhost:3000`, 3. Reject all other origins | ☐ |
| Add CSRF token to all forms | 1. Create `useCsrfToken()` hook, 2. Add X-CSRF-Token header to all mutating API calls, 3. Test with curl | ☐ |
| Add X-Frame-Options: DENY | 1. Next.js security headers in `next.config.ts`, 2. Verify no iframe embedding | ☐ |
| Add X-Content-Type-Options: nosniff | 1. In `next.config.ts` headers, 2. Verify with curl | ☐ |
| Add Referrer-Policy: strict-origin-when-cross-origin | 1. In `next.config.ts` headers | ☐ |
| Add Permissions-Policy | 1. Disable camera, microphone, geolocation | ☐ |

### Phase 1.4 — Idempotency Keys (Day 5-6)
**Priority:** P0 CRITICAL | **Owner:** Backend Lead | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Create `src/lib/idempotency.ts` | 1. `generateKey()` UUID v4, 2. `checkKey(key)` Redis lookup with 24h TTL, 3. `storeKey(key, payoutId)` Redis SET with TTL, 4. Fallback to in-memory if Redis unavailable | ☐ |
| Apply to `/api/payouts/request` | 1. Frontend sends `Idempotency-Key` header, 2. Backend checks before processing, 3. Return 409 with existing payout if duplicate | ☐ |
| Apply to `/api/postback/rapidoreach` | 1. Check idempotency before crediting offer, 2. Prevent double-credit on retry | ☐ |
| Apply to `/api/admin/balance/*` | 1. Check idempotency on admin balance adjustments, 2. Prevent accidental double-credits | ☐ |
| Create idempotency cleanup cron | 1. Daily cleanup of expired keys, 2. Run via Firebase scheduled function | ☐ |

### Phase 1.5 — Cashout Validation Rules (Day 6-7)
**Priority:** P0 CRITICAL | **Owner:** Backend Lead | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Implement max per-transaction limit (50K coins) | 1. Validate in `/api/payouts/request`, 2. Return clear error message | ☐ |
| Implement daily per-user limit (100K coins) | 1. Query today's payouts for user, 2. Check against limit, 3. Store in Redis for fast lookup | ☐ |
| Implement 7-day hold for new accounts | 1. Check `createdAt` of user, 2. Block cashout if <7 days | ☐ |
| Implement fraud score gate (score > 50 → block) | 1. Check fraudScore before processing, 2. Return "account under review" if blocked | ☐ |
| Implement admin review threshold (>$50 OR account <30 days) | 1. Route to `pending_review` status, 2. Notify admin via email | ☐ |
| Add cashout validation tests | 1. Unit tests for each rule, 2. Integration tests for edge cases | ☐ |

### Phase 1.6 — User Session System (Day 7-9)
**Priority:** P0 CRITICAL | **Owner:** Backend Lead | **Time:** 12h

| Task | Subtasks | Status |
|------|----------|--------|
| Create `src/lib/auth/session.ts` | 1. `createSession(userId, res)` — set httpOnly cookie, 2. `verifySession(req)` — validate cookie, 3. `refreshSession(req, res)` — sliding window, 4. `clearSession(res)` — on logout | ☐ |
| Session cookie settings | 1. httpOnly: true, 2. secure: true (production), 3. sameSite: 'strict', 4. path: '/', 5. maxAge: 7 days | ☐ |
| Migrate login flow | 1. After Firebase Auth login, call `/api/auth/session` to create cookie, 2. Remove client-side JWT storage, 3. Add session refresh on app load | ☐ |
| Migrate logout flow | 1. Call `/api/auth/session` DELETE to clear cookie, 2. Sign out of Firebase Auth, 3. Clear local state | ☐ |
| Add session refresh on every API call | 1. Backend: refresh cookie TTL on every authenticated request, 2. Frontend: no change needed (cookie auto-sends) | ☐ |

### Phase 1.7 — Origin Validation (Day 9-10)
**Priority:** P0 CRITICAL | **Owner:** Backend Lead | **Time:** 4h

| Task | Subtasks | Status |
|------|----------|--------|
| Add origin validation to all API routes | 1. Check `Origin` header on POST/PUT/DELETE, 2. Whitelist `https://tapcash.online` + `http://localhost:3000` | ☐ |
| Add rate limiting to auth routes | 1. Login: 5 attempts per minute per IP, 2. Signup: 3 per minute per IP, 3. Password reset: 3 per hour per email | ☐ |
| Test with curl | 1. Test with correct origin → success, 2. Test with wrong origin → 403, 3. Test with no origin → 403 | ☐ |

### Phase 1.8 — Security Audit Verification (Day 10)
**Priority:** P0 CRITICAL | **Owner:** QA/Security | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Run penetration test checklist | 1. CSRF: auto-submitting forms → verify rejected, 2. XSS: payloads in every input field, 3. Rate Limit Bypass: proxy rotation, 4. Auth Bypass: remove cookies, use expired tokens, 5. IDOR: access other users' data, 6. Mass Assignment: send `{isAdmin: true}`, 7. Session Fixation: cookie rotation after auth | ☐ |
| Fix any findings | 1. Address each finding, 2. Re-test after fix | ☐ |
| Document security posture | 1. Update SECURITY_DOCUMENTATION.md with new state, 2. Sign off on P0 items | ☐ |

---

## SPRINT 2 — BACKEND HARDENING (Weeks 3-4)

### Phase 2.1 — Firestore Transaction Safety (Day 11-13)
**Priority:** P0 CRITICAL | **Owner:** Backend Lead | **Time:** 12h

| Task | Subtasks | Status |
|------|----------|--------|
| Audit all Firestore read-then-write patterns | 1. Grep for `get()` + `set()`/`update()` without `runTransaction`, 2. List all affected files | ☐ |
| Wrap balance mutations in transactions | 1. `/api/payouts/request` — verify existing transaction, 2. `/api/clicks` — click recording, 3. `/api/postback/rapidoreach` — offer credit, 4. `/api/admin/balance/*` — admin adjustments, 5. Firebase Functions: `completeTask`, `requestPayout` | ☐ |
| Add optimistic concurrency checks | 1. Use Firestore `lastModified` field, 2. Check version before write, 3. Retry on conflict (max 3 retries) | ☐ |
| Add transaction failure tests | 1. Test concurrent balance updates, 2. Test with stale data, 3. Verify no double-credit | ☐ |

### Phase 2.2 — Firebase Functions v1 → v2 Migration (Day 13-17)
**Priority:** P1 HIGH | **Owner:** Backend Lead | **Time:** 20h

| Task | Subtasks | Status |
|------|----------|--------|
| Update Firebase SDK | 1. `npm install firebase-functions@latest`, 2. Update `package.json`, 3. Verify TypeScript compiles | ☐ |
| Migrate `completeTask` to v2 | 1. Replace `functions.https.onCall` with `onCall`, 2. Update request handling, 3. Test with mobile app | ☐ |
| Migrate `completeGoal` to v2 | 1. Same pattern as completeTask | ☐ |
| Migrate `requestPayout` to v2 | 1. Same pattern, 2. Verify idempotency still works | ☐ |
| Migrate `processQueue` to v2 | 1. Replace `functions.pubsub.schedule` with `onSchedule`, 2. Test scheduled execution | ☐ |
| Migrate `cleanupData` to v2 | 1. Same pattern | ☐ |
| Migrate all other functions | 1. Audit remaining functions, 2. Migrate each, 3. Test | ☐ |
| Add new scheduled functions | 1. `dailyStreakReminder` — 8pm UTC daily, 2. `weeklyCashoutCleanup` — 3am UTC Sunday, 3. `monthlyFraudRecalc` — 4am UTC 1st of month, 4. `leaderboardAggregate` — every 5 min | ☐ |
| Deploy to staging | 1. Deploy all functions, 2. Test each function, 3. Verify no regressions | ☐ |

### Phase 2.3 — Environment Variable Lockdown (Day 17-18)
**Priority:** P0 CRITICAL | **Owner:** DevOps | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Create `.env.example` with all 20+ variables | 1. List all variables with descriptions, 2. Add generation commands for secrets | ☐ |
| Create `src/lib/env.ts` with Zod validation | 1. Define schema for all env vars, 2. Throw build error if missing | ☐ |
| Add build-time env validation | 1. Run env check in `next.config.ts`, 2. Fail build if required vars missing | ☐ |
| Remove all hardcoded fallbacks | 1. Grep for hardcoded values, 2. Replace with env vars, 3. Verify no fallbacks remain | ☐ |
| Test build with missing env vars | 1. Remove one var → build fails, 2. Fix → build succeeds | ☐ |

### Phase 2.4 — Redis Distributed Cache (Day 18-19)
**Priority:** P1 HIGH | **Owner:** Backend Lead | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Set up Upstash Redis connection | 1. Create `src/lib/redis.ts`, 2. Add connection pooling, 3. Add health check | ☐ |
| Replace in-memory leaderboard cache | 1. Key: `leaderboard:top10`, 2. TTL: 300s, 3. Fallback: Firestore compute | ☐ |
| Add stampede protection | 1. Singleflight pattern: only one request computes, 2. Others wait for result | ☐ |
| Add Redis fallback logic | 1. If Redis unreachable, compute from Firestore, 2. Log warning, 3. Don't block request | ☐ |
| Test Redis failure scenario | 1. Kill Redis connection, 2. Verify fallback works, 3. Verify no user-facing errors | ☐ |

### Phase 2.5 — Compliance: GDPR/PIPEDA (Day 19-21)
**Priority:** P1 HIGH | **Owner:** Backend Lead | **Time:** 12h

| Task | Subtasks | Status |
|------|----------|--------|
| Create `/api/user/data-export` | 1. Query all user data, 2. Package as ZIP (JSON + CSV), 3. Email download link, 4. 30-day expiry | ☐ |
| Create `/api/user/delete-account` | 1. Set status to `deletion_pending`, 2. 30-day grace period, 3. Anonymize PII, 4. Retain transaction records, 5. Delete Firebase Auth user | ☐ |
| Add age verification on signup | 1. Birthdate field, 2. Validate min 13 years old, 3. Flag 13-17 for parental consent, 4. Store consent timestamps | ☐ |
| Add cookie consent banner | 1. Install `react-cookie-consent`, 2. Configure banner, 3. Track consent in localStorage | ☐ |
| Create legal pages | 1. `/privacy` — PIPEDA-compliant privacy policy, 2. `/terms` — Terms of service, 3. Link from footer | ☐ |
| Test compliance flows | 1. Test data export end-to-end, 2. Test account deletion, 3. Verify 30-day grace period | ☐ |

### Phase 2.6 — Firestore Indexes (Day 21)
**Priority:** P1 HIGH | **Owner:** DevOps | **Time:** 2h

| Task | Subtasks | Status |
|------|----------|--------|
| Deploy composite indexes | 1. Run `firebase deploy --only firestore:indexes`, 2. Verify all 10 indexes created, 3. Test query performance | ☐ |
| Verify query plans | 1. Check Firestore console for index usage, 2. Verify no collection scans | ☐ |

---

## SPRINT 3 — UI/UX OVERHAUL (Weeks 5-6)

### Phase 3.1 — Landing Page Rebuild (Day 22-26)
**Priority:** P1 HIGH | **Owner:** Frontend Dev | **Time:** 20h

| Task | Subtasks | Status |
|------|----------|--------|
| Hero section with animated counters | 1. "Paid to Canadian users" counter (animate from 0), 2. Live signup counter from `/api/stats`, 3. Single bold CTA "Start Earning Free", 4. 5-star Trustpilot row | ☐ |
| Live feed widget | 1. "Just Cashed Out" ticker from `/api/activity/live`, 2. Auto-updates every 30s, 3. Floating right-side on desktop, 4. Bottom of hero on mobile | ☐ |
| How It Works section | 1. 4-step cards with illustrations, 2. Sign up → Complete offers → Earn TapCoins → Cash out, 3. Responsive grid layout | ☐ |
| Social proof bar | 1. 3 stats from `/api/stats`: "$X,XXX,XXX paid" · "XX,XXX members" · "4.8/5 rating", 2. Animated counters | ☐ |
| Cashout methods strip | 1. PayPal, Interac, Visa, Amazon, gift card logos, 2. Badge: "Minimum $5 · Paid within 24hrs" | ☐ |
| Legal pages | 1. Footer links to `/privacy` and `/terms`, 2. Cookie consent banner | ☐ |
| Trust badges section | 1. McAfee SECURE, Norton, BBB, 2. "Your data is encrypted" messaging | ☐ |
| FAQ section | 1. "How do I earn?" · "Is it legit?" · "How long to get paid?", 2. Expandable accordion | ☐ |

### Phase 3.2 — Dashboard Gamification Layer (Day 26-30)
**Priority:** P1 HIGH | **Owner:** Frontend Dev | **Time:** 20h

| Task | Subtasks | Status |
|------|----------|--------|
| Coin balance widget | 1. Large animated balance, 2. Dollar equivalent display, 3. Progress bar to next cashout threshold | ☐ |
| Daily streak widget | 1. 7-day tracker (Duolingo-style dots), 2. Current day glowing, 3. "3 day streak! Keep going", 4. Wire to `achievements.ts` streak data | ☐ |
| Offer cards (Freecash-style) | 1. Large payout amount top-right, 2. Estimated time, 3. Difficulty badge (Easy/Medium/Hard), 4. Progress bar if multi-step, 5. Click → open offer wall | ☐ |
| "Just Cashed Out" mini feed | 1. Last 5 real payouts from `/api/activity/live`, 2. Creates FOMO inside product | ☐ |
| Stats panel | 1. Total earned, 2. Offers completed, 3. Current streak, 4. Level/rank | ☐ |
| Leaderboard section | 1. Top 10 users from `/api/leaderboard/top10`, 2. Your rank highlighted, 3. Animated | ☐ |

### Phase 3.3 — Cashout Flow Redesign (Day 30-32)
**Priority:** P1 HIGH | **Owner:** Frontend Dev | **Time:** 12h

| Task | Subtasks | Status |
|------|----------|--------|
| Single-page 3-step flow | 1. Step 1: Choose method (PayPal / Interac / Gift Card / Bitcoin), 2. Step 2: Enter amount + destination, 3. Step 3: Confirm with balance preview | ☐ |
| Gift card bonus display | 1. Show bonus % for each gift card, 2. "Choose Amazon and get +$0.50 bonus", 3. Calculated total with bonus | ☐ |
| Interac e-Transfer UI | 1. Email input, 2. Amount slider, 3. Estimated arrival time | ☐ |
| PayPal UI | 1. PayPal email input, 2. Amount slider, 3. Minimum $5 badge | ☐ |
| Bitcoin UI | 1. Wallet address input, 2. Amount slider, 3. Network fee estimate | ☐ |
| Confirmation preview | 1. Show: method, amount, destination, estimated arrival, 2. "Confirm Cashout" button | ☐ |
| Success state | 1. Animated checkmark, 2. "Your cashout is being processed", 3. "You'll receive an email when it's sent" | ☐ |

### Phase 3.4 — Mobile Theme Sync (Day 32-34)
**Priority:** P1 HIGH | **Owner:** Frontend Dev | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Update mobile theme to match web | 1. Dark mode as default, 2. Same color palette, 3. Same typography, 4. Same button styles | ☐ |
| Update mobile screens to match web | 1. Home: coin balance + streak + offers, 2. Earn: offer wall with difficulty badges, 3. Activity: transaction history, 4. Cashout: single-page flow, 5. Account: settings + GDPR | ☐ |
| Test on real devices | 1. iOS: iPhone 12+, 2. Android: Pixel 6+, 3. Verify responsiveness | ☐ |

---

## SPRINT 4 — MOBILE REBUILD (Weeks 7-8)

### Phase 4.1 — Fix Broken Imports (Day 35-36)
**Priority:** P0 CRITICAL | **Owner:** Mobile Dev | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Fix PremiumUi imports | 1. Grep all PremiumUi references, 2. Map to `@/components/ui/` equivalents, 3. Replace all imports, 4. Verify no broken imports | ☐ |
| Fix missing component references | 1. Audit all component imports, 2. Create missing stubs or map to existing | ☐ |
| Verify build compiles | 1. `expo start` → no errors, 2. `expo build:ios` → no errors, 3. `expo build:android` → no errors | ☐ |

### Phase 4.2 — EAS Setup & Configuration (Day 36-37)
**Priority:** P0 CRITICAL | **Owner:** Mobile Dev + DevOps | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Create `eas.json` | 1. Development profile: dev client, 2. Preview profile: internal distribution, 3. Production profile: store build | ☐ |
| Link Expo account | 1. Create Expo account, 2. Link project, 3. Set up EAS project | ☐ |
| Configure environment variables | 1. Create `mobile/.env` with `EXPO_PUBLIC_API_BASE_URL`, 2. Add to EAS secrets, 3. Remove hardcoded values | ☐ |
| Configure iOS provisioning | 1. Create Apple Developer account, 2. Generate certificates, 3. Create provisioning profiles, 4. Add to EAS | ☐ |
| Configure Android keystore | 1. Generate keystore, 2. Upload to EAS, 3. Configure signing | ☐ |
| Test builds | 1. `eas build --platform ios --profile preview` → succeeds, 2. `eas build --platform android --profile preview` → succeeds | ☐ |

### Phase 4.3 — iOS Build & TestFlight (Day 37-39)
**Priority:** P0 CRITICAL | **Owner:** Mobile Dev | **Time:** 12h

| Task | Subtasks | Status |
|------|----------|--------|
| Build iOS preview | 1. `eas build --platform ios --profile preview`, 2. Verify no errors, 3. Download IPA | ☐ |
| Submit to TestFlight | 1. `eas submit --platform ios`, 2. Wait for processing, 3. Add to internal testing group | ☐ |
| Test on real devices | 1. Install on 3+ iOS devices, 2. Test: login, dashboard, offers, cashout, settings, 3. Test: push notifications, 4. Test: biometric auth, 5. Test: offline persistence | ☐ |
| Fix any iOS-specific issues | 1. Address findings, 2. Rebuild, 3. Re-test | ☐ |

### Phase 4.4 — Android Build & APK (Day 39-41)
**Priority:** P0 CRITICAL | **Owner:** Mobile Dev | **Time:** 12h

| Task | Subtasks | Status |
|------|----------|--------|
| Build Android preview | 1. `eas build --platform android --profile preview`, 2. Verify no errors, 3. Download APK | ☐ |
| Test on real devices | 1. Install on 3+ Android devices, 2. Test: login, dashboard, offers, cashout, settings, 3. Test: push notifications, 4. Test: biometric auth, 5. Test: offline persistence | ☐ |
| Fix any Android-specific issues | 1. Address findings, 2. Rebuild, 3. Re-test | ☐ |
| (Optional) Submit to Google Play | 1. `eas submit --platform android`, 2. Set up internal testing track, 3. Add testers | ☐ |

### Phase 4.5 — Mobile-Specific Features (Day 41-42)
**Priority:** P1 HIGH | **Owner:** Mobile Dev | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Offline Firestore persistence | 1. Enable `enablePersistence()`, 2. Test offline → online transition, 3. Verify no data loss | ☐ |
| Push notification deep links | 1. Tap notification → open relevant screen, 2. Test: offer notification → offer wall, 3. Test: payout notification → activity | ☐ |
| Biometric auth flow | 1. First login: prompt for Face ID / fingerprint, 2. Store credentials in SecureStore, 3. Subsequent logins: biometric only | ☐ |
| App Store screenshots | 1. Capture screenshots on each device size, 2. Create App Store listing | ☐ |

---

## SPRINT 5 — LAUNCH PREP (Weeks 9-10)

### Phase 5.1 — Testing Expansion (Day 43-47)
**Priority:** P1 HIGH | **Owner:** QA/Backend Lead | **Time:** 20h

| Task | Subtasks | Status |
|------|----------|--------|
| Add fraud detection unit tests (15) | 1. Test each fraud detection rule, 2. Test edge cases, 3. Test false positive rate | ☐ |
| Add rate limiting tests (8) | 1. Test each rate limit rule, 2. Test proxy rotation bypass, 3. Test burst protection | ☐ |
| Add transaction atomicity tests (10) | 1. Test concurrent updates, 2. Test stale data, 3. Test rollback on failure | ☐ |
| Add admin authorization tests (12) | 1. Test non-admin cannot access admin routes, 2. Test expired session, 3. Test CSRF rejection | ☐ |
| Add input validation tests (10) | 1. XSS payloads in every input, 2. SQL/NoSQL injection, 3. Path traversal, 4. File upload abuse | ☐ |
| Add E2E signup → offer → cashout flow (5) | 1. Happy path, 2. With fraud detection, 3. With rate limiting, 4. With CSRF, 5. With idempotency | ☐ |
| Add E2E admin workflow (3) | 1. Admin login → view users → adjust balance → verify ledger, 2. Admin approve cashout, 3. Admin view reports | ☐ |
| Verify 150+ total tests | 1. Run full test suite, 2. Verify 150+ tests pass, 3. Verify 80%+ line coverage | ☐ |

### Phase 5.2 — Performance Optimization (Day 47-49)
**Priority:** P1 HIGH | **Owner:** Frontend Dev | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Lighthouse audit | 1. Run on landing page, 2. Run on dashboard, 3. Target: LCP <2.5s, CLS <0.1, FCP <1.8s | ☐ |
| Optimize images | 1. Convert to WebP, 2. Add lazy loading, 3. Add responsive sizes | ☐ |
| Optimize bundle size | 1. Analyze bundle, 2. Remove unused deps, 3. Code split heavy components | ☐ |
| Optimize API responses | 1. Add pagination to list endpoints, 2. Add field filtering, 3. Add compression | ☐ |
| Fix any performance issues | 1. Address findings, 2. Re-test | ☐ |

### Phase 5.3 — Monitoring Setup (Day 49-50)
**Priority:** P1 HIGH | **Owner:** DevOps | **Time:** 4h

| Task | Subtasks | Status |
|------|----------|--------|
| Configure Sentry | 1. Add DSN to env vars, 2. Verify error tracking works, 3. Set up alerts | ☐ |
| Configure Better Uptime | 1. Create monitoring checks, 2. Set up status page, 3. Configure alert channels | ☐ |
| Set up Firebase Monitoring | 1. Enable Firebase Performance Monitoring, 2. Set up dashboards, 3. Configure alerts | ☐ |
| Set up log aggregation | 1. Configure structured logging, 2. Add correlation IDs, 3. Set up log search | ☐ |

### Phase 5.4 — Legal & Compliance Review (Day 50-51)
**Priority:** P1 HIGH | **Owner:** QA/Security | **Time:** 4h

| Task | Subtasks | Status |
|------|----------|--------|
| Review privacy policy | 1. PIPEDA compliance check, 2. Verify all data collection disclosed, 3. Verify deletion process documented | ☐ |
| Review terms of service | 1. Verify ToS covers all platform features, 2. Verify age requirements, 3. Verify dispute resolution | ☐ |
| Verify cookie consent | 1. Test banner appears, 2. Test consent saved, 3. Test opt-out works | ☐ |
| Verify GDPR export/delete | 1. Test export end-to-end, 2. Test deletion with grace period, 3. Verify anonymization | ☐ |

### Phase 5.5 — Final Launch Checklist (Day 51-52)
**Priority:** P0 CRITICAL | **Owner:** All | **Time:** 8h

| Task | Subtasks | Status |
|------|----------|--------|
| Security sign-off | 1. All P0 vulnerabilities resolved, 2. Pen test passed, 3. Code review complete | ☐ |
| Performance sign-off | 1. Lighthouse scores acceptable, 2. Load test passed, 3. No memory leaks | ☐ |
| Compliance sign-off | 1. Privacy policy live, 2. Terms live, 3. Cookie consent working, 4. GDPR flows working | ☐ |
| Mobile sign-off | 1. iOS TestFlight working, 2. Android APK working, 3. All screens functional | ☐ |
| Monitoring sign-off | 1. Sentry receiving errors, 2. Better Uptime monitoring, 3. Firebase dashboards live | ☐ |
| Backup & rollback plan | 1. Database backup procedure documented, 2. Rollback plan documented, 3. Emergency contacts listed | ☐ |
| Launch day checklist | 1. Deploy to production, 2. Verify all endpoints, 3. Verify mobile apps, 4. Monitor for 24h | ☐ |

---

## DEPENDENCY MAP

```
S1.1 Key Rotation
  ↓
S1.2 Admin Auth ─────────────────────────────┐
  ↓                                           │
S1.3 CSRF & Origin ──────────────────────────┤
  ↓                                           │
S1.4 Idempotency Keys ───────────────────────┤
  ↓                                           │
S1.5 Cashout Validation ─────────────────────┤
  ↓                                           │
S1.6 User Sessions ──────────────────────────┤
  ↓                                           │
S1.7 Origin Validation ──────────────────────┤
  ↓                                           │
S1.8 Security Audit ─────────────────────────┘
                                              ↓
S2.1 Firestore Transactions ─────────────────┐
  ↓                                           │
S2.2 Functions v1→v2 ────────────────────────┤
  ↓                                           │
S2.3 Env Var Lockdown ───────────────────────┤
  ↓                                           │
S2.4 Redis Cache ────────────────────────────┤
  ↓                                           │
S2.5 Compliance (GDPR/PIPEDA) ───────────────┤
  ↓                                           │
S2.6 Firestore Indexes ──────────────────────┘
                                              ↓
S3.1 Landing Page ───────────────────────────┐
  ↓                                           │
S3.2 Dashboard Gamification ──────────────────┤
  ↓                                           │
S3.3 Cashout Flow ───────────────────────────┤
  ↓                                           │
S3.4 Mobile Theme Sync ──────────────────────┘
                                              ↓
S4.1 Fix Broken Imports ─────────────────────┐
  ↓                                           │
S4.2 EAS Setup ──────────────────────────────┤
  ↓                                           │
S4.3 iOS Build ──────────────────────────────┤
  ↓                                           │
S4.4 Android Build ──────────────────────────┤
  ↓                                           │
S4.5 Mobile Features ────────────────────────┘
                                              ↓
S5.1 Testing Expansion ──────────────────────┐
  ↓                                           │
S5.2 Performance ────────────────────────────┤
  ↓                                           │
S5.3 Monitoring ─────────────────────────────┤
  ↓                                           │
S5.4 Legal Review ───────────────────────────┤
  ↓                                           │
S5.5 Final Checklist ────────────────────────┘
                                              ↓
                                    🚀 LAUNCH
```

---

## PARALLEL WORK STREAMS

### Week 1-2 (Sprint 1)
| Stream A (Backend) | Stream B (DevOps) | Stream C (Frontend) |
|-------------------|-------------------|---------------------|
| Admin auth overhaul | Key rotation | Landing page prep |
| CSRF implementation | Env lockdown | Component library |
| Idempotency keys | Redis setup | Theme tokens |
| Cashout validation | Indexes | Legal pages |
| User sessions | Monitoring | |

### Week 3-4 (Sprint 2)
| Stream A (Backend) | Stream B (DevOps) | Stream C (Frontend) |
|-------------------|-------------------|---------------------|
| Functions v1→v2 | Staging deploy | Landing page |
| GDPR compliance | Performance audit | Dashboard |
| Transaction safety | Load testing | Cashout flow |

### Week 5-6 (Sprint 3)
| Stream A (Backend) | Stream B (Mobile) | Stream C (Frontend) |
|-------------------|-------------------|---------------------|
| Bug fixes | Import fixes | Landing page |
| API polish | EAS setup | Dashboard |
| | Build testing | Cashout |

### Week 7-8 (Sprint 4)
| Stream A (Backend) | Stream B (Mobile) | Stream C (Frontend) |
|-------------------|-------------------|---------------------|
| Bug fixes | iOS build | Bug fixes |
| Support | Android build | Polish |
| | TestFlight | |

### Week 9-10 (Sprint 5)
| Stream A (Backend) | Stream B (QA) | Stream C (DevOps) |
|-------------------|---------------|-------------------|
| Bug fixes | Test expansion | Monitoring |
| Support | Pen test | Legal review |
| | Performance | Final deploy |

---

## ESTIMATED TOTAL EFFORT

| Sprint | Backend | Frontend | Mobile | DevOps | QA | Total |
|--------|---------|----------|--------|--------|----|-------|
| S1 | 60h | 8h | 0h | 16h | 8h | 92h |
| S2 | 52h | 8h | 0h | 10h | 4h | 74h |
| S3 | 4h | 60h | 8h | 0h | 0h | 72h |
| S4 | 4h | 0h | 48h | 8h | 0h | 60h |
| S5 | 4h | 8h | 0h | 8h | 32h | 52h |
| **TOTAL** | **124h** | **84h** | **56h** | **42h** | **44h** | **350h** |

---

*End of PROPOSALFORALLINREPORTACTION.md — Each task maps to a specific deliverable in PROPOSALFORALLINREPORT.md. Execute in order. Dependencies must be respected.*
