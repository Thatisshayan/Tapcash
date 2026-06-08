# Payout Status

**Date:** 2026-06-01
**Project:** TapCash

## Current Implementation
- **User Flow:** Users submit payout requests from `/cashout` after meeting balance and anti-fraud checks.
- **Backend Flow:** `POST /api/payouts/request` writes a pending request and corresponding ledger transaction.
- **Admin Flow:** `/api/admin/withdrawals` supports approve/reject actions and logs admin actions.

## Execution Model
- **Mode:** Admin-reviewed payout workflow is active in-app.
- **Automation:** Final payment execution depends on configured payout provider credentials and operational process.
- **Note:** The app records and manages payout state; provider-side transfer completion still requires valid production credentials.

## Verification Snapshot
- **Build:** Passing (`next build`)
- **Tests:** Passing (`jest`, 7/7)
- **Production Edge:** Live on Vercel (`https://tapcash.online`)

**Status:** Live payout request pipeline with admin review; provider execution readiness is environment-dependent.
