# PROPOSALALLINREPORTMOBILE.md — TapCash Combined Mobile Build Plan

**Generated:** July 6, 2026  
**Based on:** ALLINREPORT.md + Audit findings  
**Purpose:** Complete mobile rebuild plan for both iOS and Android  

---

## 1. MOBILE APP CURRENT STATE

### 1.1 What Works
| Feature | Status | Notes |
|---------|--------|-------|
| Biometric auth | ✅ Working | expo-local-authentication + SecureStore |
| Push notifications | ✅ Working | Expo + Firebase Functions |
| Firestore listeners | ✅ Working | Real-time balance/transactions |
| API client | ✅ Working | `src/lib/api.ts` with auth headers |
| Deep linking | ✅ Working | `expo-linking` configured |
| App icons | ✅ Working | iOS + Android assets present |
| Splash screen | ✅ Working | Configured in `app.json` |

### 1.2 What's Broken
| Feature | Status | Issue | Fix Required |
|---------|--------|-------|-------------|
| PremiumUi imports | ❌ BROKEN | References deleted components | Replace all imports |
| EAS config | ❌ MISSING | No eas.json, no EAS project | Create + configure |
| API base URL | ❌ HARDCODED | `localhost:3000` in dev | Use env var |
| Theme | ⚠️ BASIC | Doesn't match web overhaul | Redesign |
| Home screen | ⚠️ INCOMPLETE | Missing streak, live feed | Rebuild |
| Earn screen | ⚠️ INCOMPLETE | No difficulty badges | Rebuild |
| Cashout screen | ⚠️ INCOMPLETE | No gift card bonus UI | Rebuild |
| Activity screen | ⚠️ BASIC | No live feed | Enhance |
| Account screen | ⚠️ BASIC | No GDPR export/delete | Add |

### 1.3 Security Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| Hardcoded Firebase config in `mobile/src/lib/firebase.ts` | P0 CRITICAL | Move to env vars |
| No API base URL config | P0 CRITICAL | Add `EXPO_PUBLIC_API_BASE_URL` |
| No EAS project linked | P1 HIGH | Create + link |
| No code signing | P1 HIGH | Configure for iOS |

---

## 2. REBUILD SCOPE

### 2.1 Phase 1: Fix Broken (Week 7)
| Task | Time | Priority |
|------|------|----------|
| Fix all PremiumUi imports | 8h | P0 |
| Add `EXPO_PUBLIC_API_BASE_URL` env var | 2h | P0 |
| Remove hardcoded Firebase config | 2h | P0 |
| Create `eas.json` | 2h | P0 |
| Link Expo account + EAS project | 2h | P0 |
| Verify build compiles | 4h | P0 |
| **Subtotal** | **20h** | |

### 2.2 Phase 2: Theme & Redesign (Week 7-8)
| Task | Time | Priority |
|------|------|----------|
| Update theme to match web dark mode | 8h | P1 |
| Rebuild Home screen (streak + live feed + offers) | 12h | P1 |
| Rebuild Earn screen (difficulty badges + time estimates) | 8h | P1 |
| Rebuild Cashout screen (single-page + gift card bonus) | 8h | P1 |
| Rebuild Activity screen (live feed) | 4h | P1 |
| Rebuild Account screen (GDPR export/delete) | 4h | P1 |
| **Subtotal** | **44h** | |

### 2.3 Phase 3: Build & Test (Week 8)
| Task | Time | Priority |
|------|------|----------|
| iOS build + TestFlight | 8h | P0 |
| Android build + APK | 8h | P0 |
| Real device testing (iOS) | 4h | P1 |
| Real device testing (Android) | 4h | P1 |
| Bug fixes from testing | 8h | P1 |
| **Subtotal** | **32h** | |

### 2.4 Phase 4: Polish (Week 8)
| Task | Time | Priority |
|------|------|----------|
| Offline Firestore persistence | 4h | P1 |
| Push notification deep links | 4h | P1 |
| Biometric auth flow refinement | 4h | P1 |
| App Store screenshots | 2h | P1 |
| **Subtotal** | **14h** | |

**Total Mobile Effort: ~110h**

---

## 3. FILE STRUCTURE CHANGES

### 3.1 Files to Create
```
mobile/
├── .env                          # EXPO_PUBLIC_API_BASE_URL
├── eas.json                      # EAS build profiles
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx        # Rebuilt from scratch
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── CoinIcon.tsx      # New
│   │   ├── dashboard/
│   │   │   ├── CoinBalance.tsx   # New
│   │   │   ├── StreakWidget.tsx  # New
│   │   │   ├── OfferCard.tsx     # New
│   │   │   ├── MiniFeed.tsx      # New
│   │   │   └── StatsPanel.tsx    # New
│   │   ├── cashout/
│   │   │   ├── MethodSelector.tsx # New
│   │   │   ├── AmountInput.tsx   # New
│   │   │   └── Confirmation.tsx  # New
│   │   └── landing/
│   │       └── HeroSection.tsx   # New
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Rebuilt
│   │   ├── EarnScreen.tsx        # Rebuilt
│   │   ├── CashoutScreen.tsx     # Rebuilt
│   │   ├── ActivityScreen.tsx    # Rebuilt
│   │   ├── AccountScreen.tsx     # Rebuilt
│   │   └── OfferDetailScreen.tsx # New
│   ├── hooks/
│   │   ├── useStreak.ts          # New
│   │   ├── useLiveFeed.ts        # New
│   │   └── useOffers.ts          # New
│   └── utils/
│       ├── theme.ts              # New (dark theme tokens)
│       └── animations.ts         # New (shared animations)
```

### 3.2 Files to Modify
```
mobile/
├── app.json                      # Update name, icon, splash
├── src/lib/firebase.ts           # Remove hardcoded config
├── src/lib/api.ts                # Add EXPO_PUBLIC_API_BASE_URL
├── src/auth/AuthContext.tsx       # Update login flow
├── src/navigation/AppNavigator.tsx # Update screen names
└── package.json                  # Add new dependencies
```

### 3.3 Files to Delete
```
mobile/
├── src/components/PremiumUi.tsx  # Broken, replace entirely
└── Any other PremiumUi references
```

---

## 4. DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "expo-haptics": "~14.0.0",
    "expo-linear-gradient": "~14.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "@react-native-async-storage/async-storage": "2.1.0"
  },
  "devDependencies": {
    "eas-cli": "latest"
  }
}
```

---

## 5. BUILD CONFIGURATION

### 5.1 `eas.json`
```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://localhost:3000"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://tapcash.online"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://tapcash.online"
      }
    }
  },
  "submit": {
    "ios": {
      "appleId": "YOUR_APPLE_ID",
      "ascAppId": "YOUR_ASC_APP_ID"
    },
    "android": {
      "serviceAccountKeyPath": "./google-services.json"
    }
  }
}
```

### 5.2 Environment Variables
```bash
# mobile/.env
EXPO_PUBLIC_API_BASE_URL=https://tapcash.online
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

---

## 6. TESTING MATRIX

### 6.1 iOS Devices
| Device | OS Version | Priority |
|--------|-----------|----------|
| iPhone 15 Pro | iOS 17+ | P0 |
| iPhone 14 | iOS 16+ | P1 |
| iPhone 13 Mini | iOS 16+ | P2 |
| iPad Air | iPadOS 17+ | P2 |

### 6.2 Android Devices
| Device | OS Version | Priority |
|--------|-----------|----------|
| Pixel 8 | Android 14+ | P0 |
| Samsung Galaxy S23 | Android 13+ | P1 |
| Pixel 7a | Android 14+ | P1 |
| Samsung Galaxy A54 | Android 13+ | P2 |

### 6.3 Test Scenarios
| Scenario | iOS | Android | Notes |
|----------|-----|---------|-------|
| Login with email | ☐ | ☐ | |
| Login with biometrics | ☐ | ☐ | |
| Dashboard load | ☐ | ☐ | |
| Offer wall load | ☐ | ☐ | |
| Complete offer flow | ☐ | ☐ | |
| Cashout via PayPal | ☐ | ☐ | |
| Cashout via Interac | ☐ | ☐ | |
| Cashout via gift card | ☐ | ☐ | |
| Push notification received | ☐ | ☐ | |
| Push notification tap → deep link | ☐ | ☐ | |
| Offline → online transition | ☐ | ☐ | |
| Background → foreground | ☐ | ☐ | |
| Dark mode toggle | ☐ | ☐ | |
| Streak widget display | ☐ | ☐ | |
| Live feed updates | ☐ | ☐ | |
| GDPR data export | ☐ | ☐ | |
| Account deletion | ☐ | ☐ | |

---

## 7. RELEASE STRATEGY

### 7.1 Internal Testing (Week 8)
1. Build iOS → TestFlight (internal testing group)
2. Build Android → Internal distribution (Google Play)
3. Test on 3+ devices each platform
4. Fix any issues found

### 7.2 Closed Beta (Week 9)
1. Invite 20-50 beta testers
2. Monitor crash reports (Sentry)
3. Collect feedback
4. Fix critical issues

### 7.3 Public Release (Week 10)
1. Submit to App Store (iOS)
2. Submit to Google Play (Android)
3. Monitor for 48h
4. Respond to reviews

---

*End of PROPOSALALLINREPORTMOBILE.md — Combined iOS + Android plan. See PROPOSALALLINREPORTMOBILEIOS.md and PROPOSALALLINREPORTMOBILEANDROIDE.md for platform-specific details.*
