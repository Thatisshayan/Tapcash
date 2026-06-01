# Security Status

**Date:** 2026-06-01
**Project:** TapCash

## Current Security Posture
- Provider credential hardcoded fallbacks were removed from the affected API routes.
- Rate limiting, signature checks, IP allow checks, and fraud logging are active in backend flows.
- Firestore rules remain user-isolated with restricted direct client writes to critical collections.

## Service Account Key
- **File Name:** `serviceAccountKey.json`
- **Git Tracking Status:** Should remain untracked and excluded by `.gitignore`.
- **Rotation Guidance:** If any historical key was previously committed or exposed, rotate it in Firebase Console and revoke the old key.

## Recommended Ongoing Actions
1. Keep all provider/API credentials in environment variables only.
2. Rotate Firebase Admin and payout-provider secrets on a schedule.
3. Continue periodic security audits after major feature releases.
4. Keep production-only debug endpoints disabled or access-controlled.
