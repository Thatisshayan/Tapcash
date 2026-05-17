# Payout Status

**Date:** 2026-05-16
**Project:** TapCash MVP

## Current Implementation
- **User Flow:** Users can request a withdrawal if their balance is >= $1.00 (minimum set for sandbox testing).
- **Backend Flow:** `requestPayout` Cloud Function correctly deducts the user's `balanceCents`, increases `pendingCents`, and creates a pending withdrawal record in the `withdrawals` subcollection.
- **Admin Flow:** Admin panel placeholder exists to view these requests.

## Real Payouts
- **PayPal Status:** Not connected. Payouts are simulated and queued for manual approval only.
- **Stripe Status:** Not connected.
- **Execution:** Any approved payouts currently require manual execution outside the platform until the PayPal Payouts SDK is fully integrated with sandbox credentials.

**Status:** Pending manual/admin approval — PayPal sandbox not connected.
