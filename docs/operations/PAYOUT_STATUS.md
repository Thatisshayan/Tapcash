# Payout Status

**Last updated:** 2026-06-22
**Project:** TapCash

## Current Implementation

### User-Facing Cashout Request
- **Route:** `POST /api/payouts/request` (user-facing, with anti-fraud)
- **Fraud checks:** Rate limit, bot detection, IP reputation, VPN detection, engagement lock (min 7 days, 24h cooldown), destination lock (same email/account within 7 days)
- **Transaction:** Firestore `RunTransaction` for atomic ledger writes
- **Fee:** 15% platform fee deducted
- **Status created:** `pending_review`

### Admin-Only Payout Processing
- **Route:** `POST /api/payout` (admin-only, 403 for non-admins)
- **Requires:** `cashoutRequestId` from a `cashout_requests` doc in `approved` status
- **Flow:** `approved` → `processing` → `sent` (or revert to `approved` on failure)
- **Providers:** PayPal, Interac e-Transfer, Tremendous gift cards
- **Includes:** Interac security Q&A validation, `processPayoutWithProvider` helper, audit logging

### Status Page
- **Route:** `/cashout/status` — reads from `cashout_requests` collection via Firestore `onSnapshot`
- **Statuses:** `pending_review` → `processing` → `approved` → `sent` / `rejected`

### Statuses Explained
| Status | Meaning |
|--------|---------|
| `pending_review` | User submitted request; awaiting admin review |
| `processing` | Admin approved; provider processing in progress |
| `approved` | Admin approved but payout not yet sent to provider |
| `sent` | Successfully paid out through provider |
| `rejected` | Admin rejected the request |

## What's Needed for Live Payouts
- **PayPal sandbox/live:** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=sandbox` (switch to `live` for prod)
- **Interac sandbox/live:** `INTERAC_API_KEY`, `INTERAC_API_SECRET`
- **Tremendous sandbox/live:** `TREMENDOUS_API_KEY`, `TREMENDOUS_CAMPAIGN_ID`
- **Email:** `RESEND_API_KEY` (for payout-approved/rejected notifications)

## Verification
- **Build:** `npx tsc --noEmit` passes
- **Tests:** 93 tests across 7 suites, all passing (`npx jest`)
- **Payout-specific tests:** 51 pure-function tests covering `coinsToDollars`, `validateProvider`, `parseAmountCoins`, `getDestinationLockId`, `validateCashoutAmount`, `validateMethod`, `ADMIN_UIDS`, status transitions, rate limit config

**Status:** Payout request pipeline (user + admin) fully implemented; provider execution requires valid credentials.
