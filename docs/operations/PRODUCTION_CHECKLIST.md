# TapCash Production Checklist

> Last updated: June 8, 2026
> All code changes are complete. This file tracks infrastructure/configuration tasks.

## 🔴 CRITICAL (Must complete before production)

### 1. Firestore Indexes
- [ ] Create composite index for `ledger_transactions` (see URL in build logs)
- [ ] Create index for `offers` collection (status, featured)
- [ ] Create index for `users` collection (isAdmin, status)

### 2. GitHub Secrets (Settings > Secrets and variables > Actions)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase Web API Key
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain  
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - `tapcash-16238`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase Sender ID
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase App ID
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Google Analytics ID
- [ ] `FIREBASE_PROJECT_ID` - Same as above
- [ ] `FIREBASE_CLIENT_EMAIL` - Service account email
- [ ] `FIREBASE_PRIVATE_KEY` - Service account private key (with quotes escaped)
- [ ] `VERCEL_TOKEN` - Vercel API token
- [ ] `FIREBASE_TOKEN` - Firebase CLI token (`firebase login:ci`)
- [ ] `SENTRY_DSN` - Sentry Data Source Name
- [ ] `SENTRY_ORG` - Sentry organization slug
- [ ] `SENTRY_PROJECT` - Sentry project slug
- [ ] `SENTRY_AUTH_TOKEN` - Sentry auth token
- [ ] `UPSTASH_REDIS_REST_URL` - Redis URL for rate limiting
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis token
- [ ] `CRON_SECRET` - Random string for cron endpoint auth
- [ ] `BETTER_UPTIME_API_KEY` - Monitoring API key
- [ ] `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- [ ] `EMAIL_PORT` - SMTP port (587)
- [ ] `EMAIL_USER` - SMTP username
- [ ] `EMAIL_PASSWORD` - SMTP password/app password

### 3. Offer Providers
- [ ] RapidoReach: Add `RAPIDOREACH_APP_ID`, `RAPIDOREACH_APP_KEY`, `RAPIDOREACH_APP_SECRET`
- [ ] Lootably: Add `LOOTABLY_API_KEY`, `LOOTABLY_SECRET_KEY`

### 4. Payout Gateways
- [ ] PayPal: Add live `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (Production mode)
- [ ] Interac: Add `INTERAC_API_KEY`, `INTERAC_API_SECRET`
- [ ] Tremendous: Add `TREMENDOUS_API_KEY`, `TREMENDOUS_CAMPAIGN_ID` (Production)

## 🟡 HIGH PRIORITY

### 5. Push Notifications
- [ ] Apple: Create APNs key at https://developer.apple.com/account
- [ ] Google: Create FCM server key in Firebase Console

### 6. Domain & SSL
- [ ] Point DNS `tapcash.com` to Vercel
- [ ] Verify domain in Vercel dashboard
- [ ] Add SSL certificate (Vercel auto-provisions)

### 7. Mobile App
- [ ] Create Expo account at expo.dev
- [ ] Add `EXPO_PUBLIC_API_BASE_URL` (your Vercel app URL)
- [ ] Apple Developer account ($99/year) - required for iOS builds
- [ ] Create `eas.json` with build profiles
- [ ] Configure app.json with bundle identifiers

## 🟢 MEDIUM PRIORITY

### 8. Analytics & Monitoring
- [ ] Configure Google Analytics 4 property
- [ ] Set up Better Uptime monitoring
- [ ] Add Sentry alert rules

### 9. Legal Requirements
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent banner
- [ ] GDPR data retention policy

### 10. Marketing Assets
- [ ] App Store screenshots (1242x2688, 1242x2688, 2732x2048)
- [ ] App Store description
- [ ] Privacy policy URL for App Store

---

## Quick Commands

```bash
# Generate Firebase token
firebase login:ci

# Test production build
npm run build

# Deploy to Vercel (after secrets configured)
vercel --prod

# Run mobile on iOS simulator
cd mobile && npx expo run:ios

# Generate iOS build
eas build --platform ios --profile production
```