# Ground Truth - TapCash Project Handoff

**Date:** June 8, 2026
**Author:** Kilo (AI Assistant)

---

## Commit History (Latest First)

| Commit | Message |
|--------|---------|
| `a4f2a4c` | fix: update expo imports for Device and clean up push notifications service |
| `454c85e` | docs: add comprehensive production deployment checklist |
| `7778ac2` | feat: add push notification service and GDPR export API |
| `21e554d` | feat: mobile enhancements - haptics, pull-to-refresh, deep linking, biometric auth, push notifications, GDPR export |
| `33b2e5b` | fix: mobile dependencies and TypeScript types for offer list |
| `cadbdf4` | fix: move RateLimitInfo interface to top of middleware file |
| `50c300f` | fix: add rate limit headers to all signup API responses and fraud score to response body |
| `c3771fb` | feat: add fraud score calculation to user registration with risk metrics |
| `7126b54` | fix: mobile app uses @shared alias for cross-platform content, update theme colors |
| `a9643b6` | fix: health check now reports Firebase Admin fallback mode gracefully |
| `8a7ab98` | fix: use correct header for IP in rate limiting middleware |

---

## Architecture Overview

### Web Application (`src/`)
- **Framework:** Next.js 16, App Router
- **UI:** Model-U design system with glassmorphism cards
- **Database:** Firestore (composite index required)
- **Auth:** Firebase Auth + Admin SDK
- **Monitoring:** Sentry, Vercel Analytics, Better Uptime

### Mobile Application (`mobile/`)
- **Framework:** Expo SDK 56, Expo Router
- **Features:** Biometric auth, haptics, pull-to-refresh, push notifications
- **Shared Code:** `@shared/tapcash-content` module alias

---

## Completed Features

### UI/UX Components
- [x] PremiumHeader with TAP/CASH wordmark, avatar group, social proof
- [x] Hero section with SVG mascot, floating reward elements
- [x] Reusable BalanceCard component with props
- [x] TopOffers, CashPathLive, AppPreview, TapScoreSection, TrustStrip

### Security & Infrastructure
- [x] Rate limiting middleware (in-memory, needs Upstash for production)
- [x] Fraud score calculation on registration
- [x] Admin action audit logging
- [x] Error UI with icons for auth flows

### APIs
- [x] `/api/gdpr/export` - Data export endpoint
- [x] `/api/push/subscribe` - Push notification subscription
- [x] `/api/health` - Health check with fallback mode detection

### Mobile
- [x] Expo notifications service
- [x] Biometric authentication (Face ID/Touch ID)
- [x] Haptic feedback on interactions
- [x] Pull-to-refresh on earn screen

---

## Outstanding Actions (Manual Configuration Required)

### 🔴 CRITICAL - Must Complete Before Production

1. **Firestore Composite Index**
   - URL: `https://console.firebase.google.com/v1/r/project/tapcash-16238/firestore/indexes?create_composite=Cllwcm9qZWN0cy90YXBjYXNoLTE2MjM4L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9sZWRnZXJfdHJhbnNhY3Rpb25zL2luZGV4ZXMvXxABGggKBHR5cGUQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC`

2. **GitHub Secrets (17 values)**
   - File: `PRODUCTION_CHECKLIST.md` contains full list

3. **Email SMTP Credentials**
   - Add: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`

### 🟡 HIGH PRIORITY

4. Apple Push Notification key (APNs)
5. Google FCM server key
6. RapidoReach/Tremendous API credentials

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/signup/route.ts        # Fraud score + rate limit headers
│   │   ├── gdpr/export/route.ts        # NEW: Data export
│   │   ├── offers/route.ts             # Deep link field
│   │   └── push/subscribe/route.ts     # Push subscription (exists)
├── components/
│   └── layout/PremiumHeader.tsx        # Updated header
├── middleware/index.ts                 # Rate limiting + security headers
└── styles/premium.css                  # Glow effects, animations

mobile/
├── app/(tabs)/earn.tsx                 # Pull-to-refresh + haptics
├── app/(tabs)/offer/[id].tsx           # Haptic feedback
├── src/auth/AuthContext.tsx           # Biometric auth
├── src/lib/pushNotifications.ts     # NEW: Push service
└── src/theme.ts                     # Extended colors

shared/
└── tapcash-content.ts               # Cross-platform types

PRODUCTION_CHECKLIST.md              # Deployment requirements
```

---

## How to Resume Work

```bash
# Web development
npm run dev

# Mobile development
cd mobile
npm install --legacy-peer-deps
npx expo start
```

---

## Known Issues

1. Firestore index required for `/api/activity` queries
2. In-memory rate limiting won't work across serverless instances (use Upstash Redis)
3. Mobile push notifications require device testing
4. Some admin pages have pre-existing lint warnings (unrelated to current work)