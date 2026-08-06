# MOBILE_BUILD_GUIDE.md — TapCash Mobile Build Instructions

**Created:** July 6, 2026  
**Sprint:** Sprint 4 — Mobile Build  
**Purpose:** Step-by-step guide for building, testing, and deploying TapCash mobile

---

## Prerequisites

- [ ] Node.js >= 20.9.0
- [ ] Expo CLI: `npm install -g expo-cli eas-cli`
- [ ] Expo account: https://expo.dev/signup
- [ ] Apple Developer account ($99/yr): https://developer.apple.com/programs/
- [ ] Google Play Console ($25 one-time): https://play.google.com/console

---

## 1. Environment Setup

```bash
cd mobile

# Copy env template and fill in values
cp .env.example .env

# Install dependencies
npm install

# Login to Expo
eas login

# Link to EAS project
eas init --id 1c561a9d-ac22-47db-b376-921c6e4b5086
```

### Required `.env` values:
```
EXPO_PUBLIC_API_BASE_URL=https://tapcash.online
EXPO_PUBLIC_FIREBASE_API_KEY=<set in Vercel dashboard>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tapcash-16238.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tapcash-16238
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tapcash-16238.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=538090776118
EXPO_PUBLIC_FIREBASE_APP_ID=1:538090776118:web:1d96a2dbd12f2d69211a97
```

---

## 2. Development Build

### iOS Simulator
```bash
eas build --platform ios --profile development
# Install on simulator from EAS dashboard
```

### Android Emulator
```bash
eas build --platform android --profile development
# Install APK on emulator
```

### Local Development
```bash
npx expo start --dev-client
```

---

## 3. Preview Build (Internal Testing)

### iOS Preview
```bash
eas build --platform ios --profile preview
```
- Download IPA from EAS dashboard
- Install via Apple Configurator or Diawi

### Android Preview
```bash
eas build --platform android --profile preview
```
- Download APK from EAS dashboard
- Sideload on device

---

## 4. Production Build

### iOS (TestFlight)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

**Requirements:**
- [ ] Apple Developer account active
- [ ] App ID registered: `com.tapcash.mobile`
- [ ] Distribution certificate + provisioning profile in EAS
- [ ] App created in App Store Connect

### Android (Google Play)
```bash
eas build --platform android --profile production
eas submit --platform android
```

**Requirements:**
- [ ] Google Play Console account
- [ ] App created in Play Console
- [ ] Service account JSON key for automated upload
- [ ] Internal testing track created

---

## 5. Pre-Build Verification Checklist

- [ ] `mobile/.env` has all `EXPO_PUBLIC_*` values
- [ ] Firebase config in `mobile/src/lib/firebase.ts` matches project
- [ ] `eas.json` has correct EAS project ID
- [ ] `app.config.js` has correct bundle identifiers
- [ ] Push notification icon exists at `assets/icon.png`
- [ ] App icon and splash screen configured
- [ ] Deep linking scheme `tapcash://` configured

---

## 6. Feature Testing Checklist

### Auth
- [ ] Email/password sign up works
- [ ] Email/password sign in works
- [ ] Google sign in works
- [ ] Biometric auth (Face ID / fingerprint) works
- [ ] Sign out clears session

### Core Flows
- [ ] Dashboard loads balance correctly
- [ ] Offer wall loads from RapidoReach
- [ ] Click tracking works
- [ ] Offer completion credits appear
- [ ] Cashout request submits successfully
- [ ] Transaction history updates in real-time

### Daily Streak
- [ ] Streak widget shows correct day count
- [ ] Check-in button works
- [ ] Coins awarded on check-in
- [ ] Streak resets after 24h gap

### Push Notifications
- [ ] Push token registration works
- [ ] Notifications received on iOS
- [ ] Notifications received on Android
- [ ] Deep link from notification navigates correctly

### Offline
- [ ] Firestore persistence enabled
- [ ] App works offline with cached data
- [ ] Syncs when reconnected

---

## 7. Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| PremiumUi imports | ✅ Fixed | No broken imports |
| EAS project linked | ⚠️ Needs verification | Run `eas init` |
| Biometric auth | ⚠️ Needs real device | Test on physical device |
| Push notifications | ⚠️ Needs real device | Test on physical device |
| Deep linking | ⚠️ Needs verification | Test `tapcash://` URLs |

---

## 8. App Store Submission

### iOS App Store
1. Build production: `eas build --platform ios --profile production`
2. Submit: `eas submit --platform ios`
3. Fill in App Store Connect metadata
4. Upload screenshots (6.7" + 6.5" required)
5. Submit for review

### Google Play Store
1. Build production: `eas build --platform android --profile production`
2. Submit: `eas submit --platform android`
3. Fill in Play Console listing
4. Upload screenshots + feature graphic
5. Submit for review (internal track first)

---

*End of MOBILE_BUILD_GUIDE.md*
