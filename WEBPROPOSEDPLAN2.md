# TapCash Web — Sprint 2: Private Beta → Public Launch
> Begins after WEBPROPOSEDPLAN.md is fully complete.
> At this point: users can sign up, earn, and submit cashout requests. Admin can process payouts.
> Goal of this sprint: make it safe, honest, and scalable for the general public.

---

## PHASE 1 — Security Hardening (Do This First, Before Any Public Traffic)

### Task 1.1 — Firestore Security Rules Audit & Deploy

#### 1.1.1 — Locate security rules
- Find `firestore.rules` in the project root (or check Firebase console → Firestore → Rules)
- If the file does not exist, create it

#### 1.1.2 — Write and deploy rules for every collection
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own user doc
    // Cannot write isAdmin, isFlagged, status — those are server-only
    match /users/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if false; // server-side only via Admin SDK
    }

    // Ledger: users read own only, no writes from client
    match /ledger_transactions/{docId} {
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    // Cashout requests: users read own only, no writes from client
    match /cashout_requests/{docId} {
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    // Offer postbacks: no client access
    match /offer_postbacks/{docId} {
      allow read, write: if false;
    }

    // Offer clicks: user can write their own click (needed for postback verification)
    match /offer_clicks/{docId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow read: if false;
      allow update, delete: if false;
    }

    // Admin collections: no client access at all
    match /admin_actions/{docId} { allow read, write: if false; }
    match /fraud_flags/{docId} { allow read, write: if false; }
    match /cashout_destination_locks/{docId} { allow read, write: if false; }
    match /webhook_logs/{docId} { allow read, write: if false; }
    match /multiplier_events/{docId} { allow read: if true; allow write: if false; }
  }
}
```

#### 1.1.3 — Deploy rules
```bash
firebase deploy --only firestore:rules
```

#### 1.1.4 — Test rules in Firebase emulator
- Attempt to read another user's ledger_transactions — should be denied
- Attempt to write to cashout_requests from client — should be denied
- Attempt to write `isAdmin: true` to your own user doc — should be denied

---

### Task 1.2 — Confirm Redis Rate Limiting Is Active in Production

#### 1.2.1
- Log into Vercel dashboard → Settings → Environment Variables
- Confirm both are set for Production environment:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- If missing: create a free Upstash Redis database at upstash.com, copy the REST URL and token, add to Vercel

#### 1.2.2 — Verify rate limiting works
- Make 4 rapid POST requests to `/api/payouts/request` — the 4th should return 429
- Make 4 rapid POST requests to `/api/tasks/daily-spin` — same
- If in-memory fallback was silently active, the 4th request was passing through — fix this before launch

---

### Task 1.3 — Environment Variables Audit

#### 1.3.1 — Full env var checklist in Vercel (Production)
Go through each one:
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY` (must include `\n` line breaks, wrap in quotes)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `PAYPAL_CLIENT_ID`
- [ ] `PAYPAL_CLIENT_SECRET`
- [ ] `PAYPAL_MODE` → set to `live` (not `sandbox`) when ready to process real money
- [ ] `TREMENDOUS_API_KEY`
- [ ] `TREMENDOUS_CAMPAIGN_ID`
- [ ] `TREMENDOUS_ENVIRONMENT` → set to `production`
- [ ] `RAPIDOREACH_APP_KEY`
- [ ] `RAPIDOREACH_APP_SECRET`
- [ ] `RAPIDOREACH_APP_ID`
- [ ] `NEXT_PUBLIC_RAPIDOREACH_APP_ID`
- [ ] `LOOTABLY_SECRET_KEY`
- [ ] `PROXYCHECK_API_KEY`
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `SENTRY_DSN`
- [ ] Email provider key (Resend or whichever)

#### 1.3.2 — Flip PayPal from sandbox to live
- Change `PAYPAL_MODE` from `sandbox` to `live` in Vercel
- Confirm PayPal live credentials are in the dashboard (not sandbox keys)
- Do a $1 test payout to your own PayPal to confirm

#### 1.3.3 — Flip Tremendous from testflight to production
- Change `TREMENDOUS_ENVIRONMENT` to `production`
- Do a $1 gift card test order

---

### Task 1.4 — Admin Route Protection in middleware.ts

#### 1.4.1 — Read `middleware.ts`
- Confirm `/admin/*` routes are protected (redirect to `/auth/signin` if no valid session)
- Confirm `/api/admin/*` routes require admin token (already handled server-side but double-check middleware doesn't short-circuit)
- Confirm `robots.txt` disallows `/admin`

---

## PHASE 2 — Email Notifications (Users Must Know What's Happening)

### Task 2.1 — Cashout Submission Email

#### 2.1.1
- After successful POST to `/api/payouts/request`, trigger an email to the user
- Subject: "TapCash — Your cashout request has been received"
- Body: amount in coins, CAD equivalent, method, estimated processing time, link to `/cashout/status`
- Add this call at the end of `/api/payouts/request/route.ts` after the transaction succeeds

#### 2.1.2 — Read `src/lib/email.ts`
- Confirm the email client is wired (Resend or similar)
- Use the existing `sendEmail()` or `sendWelcomeEmail()` pattern
- Add `sendCashoutSubmittedEmail(email, { amountCoins, amountCad, method })`

### Task 2.2 — Cashout Sent Email

#### 2.2.1
- When admin marks a cashout as `sent` (via `/api/admin/withdrawals` or `/api/payout`), trigger a sent email
- Subject: "TapCash — Your payout has been sent!"
- Body: amount, method, transaction ID if available, support link
- Add this call in `/api/payout/route.ts` after `status: "sent"` is written to Firestore

### Task 2.3 — Cashout Rejected Email

#### 2.3.1
- When admin rejects a cashout, email the user
- Subject: "TapCash — Update on your cashout request"
- Body: amount, rejection reason (from `adminNote`), "your coins have been returned to your balance"

### Task 2.4 — Offer Approved Email (Optional but Nice)

#### 2.4.1
- When a postback is processed and `status === "approved"`, email the user
- Subject: "TapCash — You earned X coins!"
- Body: coins earned, new balance link, CTA to cashout
- Be careful not to email on every postback if volume is high — consider batching or only emailing for amounts > 100 coins

---

## PHASE 3 — Trust & Marketing Honesty

### Task 3.1 — Replace All Fake Numbers

#### 3.1.1 — Wire StatsSection to live data
- `/api/stats/platform` route already exists — read it to confirm what it returns
- If it returns real counts (users, payouts, verifications), wire `StatsSection.tsx` to fetch from it server-side
- If it doesn't return real data yet, update the route to query Firestore:
  - Total users: count `users` collection
  - Total paid out: sum `cashout_requests` where `status == "sent"`, convert coins to CAD
  - Active earners: count users with at least one `approved_credit` ledger entry in last 30 days
- Show only numbers you can back up. If you have 47 users at launch, show "Growing fast" instead of a fake number.

#### 3.1.2 — Replace fake testimonials section
- Remove the hardcoded payout cards (Alex M., Jordan L., etc.)
- Replace with one of:
  - Option A: A "Recent Payouts" ticker that reads from real `cashout_requests` where `status == "sent"`, anonymized as "User in Ontario earned $X via PayPal"
  - Option B: Remove the section entirely and replace with a "How It Works" visual
- Remove the fake Trustpilot link

#### 3.1.3 — Fix `tapCashAdminStats` on admin page
- Admin page imports `tapCashAdminStats` from seed content (fake values)
- Replace with live stats from `/api/admin/stats`

### Task 3.2 — Blog: Build It or Remove It

#### 3.2.1 — If keeping the blog
- Create `src/app/blog/[slug]/page.tsx`
- Build a simple static content map: `{ slug: string, title: string, content: string }[]`
- Write real content for the 3 existing posts (minimum 300 words each)
- This is good for SEO — worth doing before public launch

#### 3.2.2 — If removing the blog
- Remove `/blog` from Navbar and Footer links
- Add a redirect in `next.config.ts`: `/blog` → `/`
- Delete `src/app/blog/page.tsx`

### Task 3.3 — Games Page Cleanup

#### 3.3.1
- Rename `/games` page title and eyebrow to "Offers & Surveys" — it is not a games page
- Or remove Games from the Navbar entirely and route users directly to `/rapidoreach`
- The current games page just re-routes everything to RapidoReach anyway

---

## PHASE 4 — GDPR / PIPEDA Compliance

### Task 4.1 — Data Export

#### 4.1.1 — Add "Download My Data" to user account/settings area
- Read `/api/gdpr/export/route.ts` — confirm it exports all user data from Firestore
- Add a button in the dashboard or a dedicated `/account/settings` page
- Button calls the GDPR export route with the user's token
- Returns a JSON file download with all ledger entries, cashout history, offer clicks

### Task 4.2 — Account Deletion

#### 4.2.1 — Add "Delete My Account" flow
- Required under PIPEDA (Canadian privacy law) and App Store rules
- Build `/api/gdpr/delete` route:
  - Verify user token
  - Delete user's Firestore documents (users, ledger_transactions, cashout_requests, offer_clicks)
  - Call `admin.auth().deleteUser(uid)`
  - If user has a pending cashout, block deletion and show message
- Add a "Delete Account" button in account settings with a confirmation modal

### Task 4.3 — Cookie Consent Banner

#### 4.3.1
- If the app uses any third-party analytics (Vercel Analytics, Sentry) it needs a cookie consent banner for Canadian/EU users
- Implement a minimal banner: "We use cookies for analytics and security. [Accept] [Decline]"
- Store consent in localStorage
- Only load Vercel Analytics / Sentry after consent (or rely on their first-party/anonymous modes which may not require consent)

### Task 4.4 — Privacy Policy & Terms Review

#### 4.4.1 — Legal review checklist
- Terms of Service at `/terms` must state: coin value, payout timeline, prohibited activities (VPN, bots, multiple accounts), right to suspend accounts
- Privacy Policy at `/privacy` must state: what data is collected, how it is stored, how long it is retained, how users can request deletion
- Both pages must have a "Last Updated" date
- Recommend having a Canadian lawyer review before public launch

---

## PHASE 5 — Performance & Monitoring

### Task 5.1 — Sentry Error Monitoring

#### 5.1.1
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` exist
- Confirm `SENTRY_DSN` is set in Vercel
- Log into Sentry dashboard and confirm events are flowing from production
- Set up Sentry alerts: email notification when error rate spikes above threshold

### Task 5.2 — Load Testing the Payout Route

#### 5.2.1 — Test concurrent cashout requests from same user
- Use a script to fire 3 simultaneous POST requests to `/api/payouts/request` as the same user
- Only one should succeed (the `activeCashoutRequestId` lock in the Firestore transaction)
- The other two should return 400 "You already have a pending withdrawal request"
- If more than one succeeds, the transaction lock is broken — fix before launch

#### 5.2.2 — Test duplicate postback idempotency
- Fire the same RapidoReach postback `txId` twice simultaneously
- Both should return `"1"` (200 OK) but only one ledger entry should be written
- Check Firestore: confirm only one `approved_{txId}` document exists

### Task 5.3 — Lighthouse / Core Web Vitals

#### 5.3.1
- `lighthouserc.js` exists in the repo root — run it
- Fix any LCP (Largest Contentful Paint) issues on the landing page
- Confirm no layout shift (CLS) on the dashboard load
- Target: LCP < 2.5s, CLS < 0.1, FID < 100ms

### Task 5.4 — Vercel Analytics

#### 5.4.1
- `src/components/VercelAnalytics.tsx` exists — confirm it is mounted in `src/app/layout.tsx`
- Enable Vercel Analytics in the Vercel dashboard for the project
- Monitor: page views, bounce rate, top pages, geographic distribution

---

## PHASE 6 — Admin Panel: Final Gaps

### Task 6.1 — Fraud Page

#### 6.1.1 — Read `/admin/fraud/page.tsx`
- Confirm it loads from `fraud_flags` Firestore collection
- If not wired, add a Firestore query: `adminDb.collection("fraud_flags").orderBy("createdAt", "desc").limit(50)`
- Display: IP, userId, action, reason, timestamp
- Add an "Unflag User" button: POST to `/api/admin/users` with `{ action: "unflag", targetUid }`

### Task 6.2 — Transaction Management Page

#### 6.2.1 — Read `/admin/transactions/page.tsx`
- Should display `ledger_transactions` across all users for admin review
- Filter by: userId, type, status, date range
- Add a manual "Approve pending" button for postbacks that landed in `pending_review`

### Task 6.3 — Multiplier: Apply to Postback Credits

#### 6.3.1 — Wire multiplier events to actual postback processing
- Currently multiplier events exist in Firestore but are NOT applied when a postback credit is awarded
- In `/api/postback/rapidoreach/route.ts` and `/api/postback/route.ts`, before writing the `approved_credit` ledger entry:
  - Query `multiplier_events` where `active == true` and `startsAt <= now` and `endsAt >= now`
  - If a live event exists, multiply `amountCoins` by `event.multiplier`
  - Write `amountCoins * multiplier` as the `balanceEffectCoins`
  - Store `metadata.multiplierApplied: event.multiplier` for audit trail

---

## PHASE 7 — Promo & Referral System

### Task 7.1 — Promo Code Redemption

#### 7.1.1 — Read `/api/promo/redeem/route.ts`
- Confirm the route exists and validates promo codes against a Firestore collection
- If not implemented, build it:
  - POST `{ code }` with auth token
  - Look up code in `promo_codes` collection
  - If valid and not used: write ledger credit, mark code as used by userId
  - If already used by this user: return 400

#### 7.1.2 — Add promo code input to dashboard
- Small input field + redeem button in the dashboard sidebar or a dedicated `/rewards` page

### Task 7.2 — Referral Link Tracking

#### 7.2.1 — Read `/src/app/ref/[refId]/page.tsx`
- Confirm it captures the referral ID and stores it (cookie or Firestore)
- When a referred user signs up, the referrer should get bonus coins
- Check if `/api/auth/signup/route.ts` reads the referral cookie and awards coins

#### 7.2.2 — Referral dashboard section
- Show user their referral link (`https://tapcash.online/ref/{uid}`)
- Show count of successful referrals and coins earned from referrals

---

## PHASE 8 — Pre-Public-Launch Final Checks

### Task 8.1 — End-to-End Smoke Test (Real Money)

#### 8.1.1 — Full user journey test with real credentials
- Create a new account (not your admin account)
- Complete a RapidoReach offer
- Wait for postback to arrive
- Confirm coins appear in balance (ledger)
- Submit a cashout request for $2.00 via PayPal
- As admin: approve and process
- Confirm PayPal receives $2.00
- Confirm user's balance is debited correctly

#### 8.1.2 — Confirm email notifications fire at each step
- Offer approved → email received ✓
- Cashout submitted → email received ✓
- Cashout sent → email received ✓

### Task 8.2 — SEO & Discoverability

#### 8.2.1
- Confirm `sitemap.ts` includes all public pages
- Confirm `robots.ts` disallows: `/admin`, `/api`, `/dashboard`, `/cashout`, `/transactions`
- Add `og:image` meta tags to key pages (landing, how-it-works)
- Add structured data (JSON-LD) to the landing page for "SoftwareApplication" schema

### Task 8.3 — Uptime Monitoring

#### 8.3.1 — `better-uptime.yml` exists in the repo
- Set up Better Uptime (or UptimeRobot free tier) to monitor:
  - `https://tapcash.online/api/health` every 1 minute
  - Alert via email + SMS if down for > 2 minutes

---

## Sprint 2 Web Launch Checklist

**Security**
- [ ] Firestore security rules deployed and tested
- [ ] Redis rate limiting confirmed active in production
- [ ] All env vars confirmed in Vercel (live credentials, not sandbox)
- [ ] PayPal switched to live mode
- [ ] Tremendous switched to production mode
- [ ] Admin routes protected in middleware

**Emails**
- [ ] Cashout submitted email fires
- [ ] Cashout sent email fires
- [ ] Cashout rejected email fires (with coin refund confirmation)

**Trust / Honesty**
- [ ] Fake stats replaced with live or removed
- [ ] Fake testimonials replaced with anonymized real data or removed
- [ ] Blog works (no 404s) or removed from nav
- [ ] tapCashAdminStats replaced with live data

**Compliance**
- [ ] "Download my data" accessible to users
- [ ] "Delete my account" flow works
- [ ] Cookie consent banner live
- [ ] Privacy policy and terms reviewed, dated

**Admin**
- [ ] Fraud page shows real fraud_flags data
- [ ] Transaction management page wired
- [ ] Multiplier events actually multiply postback credits
- [ ] Promo code redemption works

**Performance**
- [ ] Sentry live and alerting
- [ ] Uptime monitoring configured
- [ ] Load test passed (no double cashout, no double credit)
- [ ] Lighthouse LCP < 2.5s

**Final**
- [ ] Full real-money smoke test completed ($2 PayPal payout)
- [ ] Referral link tracking works
- [ ] sitemap.ts and robots.ts correct
