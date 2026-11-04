# TapCash Mobile — Sprint 2: Private Beta → Public Launch
> Begins after MOBILEPROPOSEPLAN.md is fully complete.
> At this point: auth works, balance is live, cashout submits to real API, offers are real, activity is real.
> Goal of this sprint: polish, store submission, push notifications complete, compliance, and public launch.

---

## Implementation Progress (2026-06-23)

### Completed
- **1.1.1** — Token registration wired (`registerPushToken` → `/api/user/push-token`)
- **1.1.2** — Permission denied handled gracefully (Earn screen banner + `Linking.openSettings()`)
- **1.1.3** — Push token refresh listener added (`Notifications.addPushTokenListener`)
- **1.3.1** — Notification tap deep-link handler in `app/_layout.tsx` (Activity & Cashout tabs)
- **2.1.1** — Balance animation on Home screen when coins arrive (Animated + haptics)
- **2.1.2** — Optimistic UI on cashout submit (immediate pending deduction, revert on error)
- **3.1** — Offer detail screen fetches real data, click tracking, in-app browser
- **3.2** — Click tracking POSTs to `/api/clicks` before opening offer URL
- **3.3** — "Thanks for completing" banner shown on return from browser
- **4.1.1** — Account screen loads profile, total earned/cashed out from Firestore ledger
- **4.1.2** — Notification preferences toggle (enable/disable, remove token on disable)
- **4.1.3** — Referral link displayed with Share button (`expo-sharing`)
- **4.1.4** — Legal links (Privacy, Terms, Contact) open in `WebBrowser`
- **4.2** — Delete account flow with confirmation modal → POST `/api/gdpr/delete`
- **5.1.1** — Activity empty state with "Browse Offers" CTA
- **5.1.2** — Earn screen skeleton loading + error state with pull-to-refresh
- **5.1.3** — Cashout insufficient balance banner ("Earn at least $2.00 to unlock")
- **5.2.1** — Error boundary (`ErrorBoundary` component) in root layout
- **5.2.2** — Network banner (`@react-native-community/netinfo`) in root layout
- **5.3.1** — Splash screen configured (`expo-splash-screen` + AuthContext coordination)
- **1.2** — Backend push notifications added (`functions/src/index.ts`):
  - `onOfferApproved` Firestore trigger → Expo push for offer approval
  - `onCashoutSent` Firestore trigger → Expo push for cashout sent
- **6.1** — EAS build profiles confirmed (development, preview, production)
- **6.1.1** — `expo-splash-screen`, `expo-sharing`, `@react-native-community/netinfo` installed

### Remaining
- **1.2.2** — End-to-end device test of push notifications
- **6.2** — Android production build + Internal Testing track
- **6.3** — iOS build + TestFlight (if applicable)
- **7.1** — Screenshots captured and framed
- **7.2** — App Store metadata + demo account
- **8.1** — Device matrix testing (2+ Android, 2+ iOS)
- **8.3** — Sentry crash reporting initialized

---

## PHASE 1 — Push Notifications: Full Pipeline

### Task 1.1 — Confirm Token Registration

#### 1.1.1 — Test on a physical device
- Install the dev build on a real Android or iOS device
- Sign in
- Confirm `registerForPushNotificationsAsync()` runs and returns a token
- Confirm the token is POSTed to `/api/user/push-token`
- Check Firestore `users/{uid}` — confirm `pushToken` field is saved

#### 1.1.2 — Handle permission denied gracefully
- If user denies notification permission, do NOT crash or block the app
- Show a banner inside the Earn screen: "Enable notifications to know when your coins land"
- Tapping banner opens device notification settings via `Linking.openSettings()`

#### 1.1.3 — Handle token refresh
- Expo push tokens can change (especially on Android)
- Add a listener: `Notifications.addPushTokenListener` — on token change, re-POST to `/api/user/push-token`

---

### Task 1.2 — Confirm Backend Sends Notifications

#### 1.2.1 — Verify the backend sends Expo push notifications
- Check `functions/src/index.ts` or the relevant server route
- Confirm it calls Expo's push API: `https://exp.host/--/api/v2/push/send`
- Triggers needed:
  - When offer postback is approved → "🎉 You earned {coins} coins from {offerTitle}!"
  - When cashout status changes to `sent` → "💸 Your payout of ${amount} CAD is on the way!"
  - When cashout is rejected → "Update on your cashout request — tap to see details"

#### 1.2.2 — Test notification delivery end-to-end
- Complete a real RapidoReach offer on the device
- Confirm the push notification arrives within 30 seconds of postback processing
- Put app in background — confirm notification appears in system tray
- Tap notification — confirm app opens to the correct screen (Activity tab)

---

### Task 1.3 — Deep Link from Notification

#### 1.3.1 — Add notification tap handler
```typescript
// In mobile/app/_layout.tsx
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.screen === 'activity') router.push('/(tabs)/activity');
    if (data?.screen === 'cashout') router.push('/(tabs)/cashout');
  });
  return () => sub.remove();
}, []);
```

#### 1.3.2 — Backend: include `screen` in push payload
- When sending offer-approved notification, include `data: { screen: 'activity' }`
- When sending cashout-sent notification, include `data: { screen: 'cashout' }`

---

## PHASE 2 — Real-Time Balance & Instant Feedback

### Task 2.1 — Firestore Real-Time Balance Listener

#### 2.1.1 — Subscribe to ledger on Home and Cashout screens
- Use `onSnapshot` on `ledger_transactions` where `userId == uid`
- Sum `balanceEffectCoins` across all docs → this is the live balance
- When a new credit lands (offer approved), the balance updates instantly without a pull-to-refresh
- Show a brief animation/flash on the balance number when it updates (use `Animated.sequence` or Reanimated)

#### 2.1.2 — Optimistic UI on cashout submission
- When user taps "Cash Out Now" and request is in flight:
  - Immediately show the coins as "pending deduction" in the UI
  - If API returns error: revert the optimistic deduction
  - If API returns success: the Firestore listener will update the balance automatically

---

## PHASE 3 — Offer Detail Screen

### Task 3.1 — Build a real offer detail screen

#### 3.1.1 — `mobile/app/(tabs)/offer/[id].tsx`
- This file exists as an entry point — build it out
- Fetch offer details from `/api/offers/{id}` or filter from the already-loaded offers list
- Display:
  - Offer title, provider, category
  - Payout in coins + CAD equivalent
  - Estimated time
  - Description / instructions
  - "Start Earning" button

#### 3.1.2 — Click tracking before opening offer
- Before opening the offer URL, POST to `/api/clicks`:
  ```typescript
  await apiFetch('/api/clicks', {
    method: 'POST',
    body: JSON.stringify({ offerId: offer.id }),
  });
  ```
- This is REQUIRED for postback verification — if no click is registered within 7 days, the postback will land in `pending_review` instead of `approved`
- Only then open the offer URL: `WebBrowser.openBrowserAsync(offer.url)`

#### 3.1.3 — Return to app handler
- When user returns from the in-app browser, show: "Thanks for completing the offer! Your coins will arrive within a few minutes."
- This sets expectation correctly (postback takes time)

---

## PHASE 4 — Account & Settings Screen

### Task 4.1 — Full Account Screen

#### 4.1.1 — Load and display user profile
- Fetch from Firestore `users/{uid}` directly (client SDK)
- Display:
  - Email address
  - Account status (Verified / Pending)
  - Date joined
  - Total coins earned (sum of all `approved_credit` ledger entries)
  - Total cashed out (sum of all `cashout_paid` ledger entries)

#### 4.1.2 — Settings section
- Notification preferences toggle (enable/disable push notifications)
- On disable: call `Notifications.setNotificationHandler(null)` and remove token from backend
- On enable: re-run `registerForPushNotificationsAsync()` and re-POST token

#### 4.1.3 — Referral link
- Show user's referral link: `https://tapcash.online/ref/{uid}`
- "Share" button: use `Share.share({ message: 'Join TapCash and earn real cash rewards! ...' })`

#### 4.1.4 — Support & legal links
- Privacy Policy → `WebBrowser.openBrowserAsync('https://tapcash.online/privacy')`
- Terms of Service → `WebBrowser.openBrowserAsync('https://tapcash.online/terms')`
- Contact/Support → `WebBrowser.openBrowserAsync('https://tapcash.online/contact')` or `mailto:support@tapcash.online`

### Task 4.2 — Delete Account (Required for App Store)

#### 4.2.1 — Add "Delete My Account" in settings
- Apple App Store Guidelines require a clear account deletion flow inside the app
- On tap: show confirmation modal "This will permanently delete your account and all data. This cannot be undone."
- If user confirms: POST to `/api/gdpr/delete` with auth token
- On success: sign out, route to Welcome screen
- If user has a pending cashout: show "You have a pending cashout. Please wait for it to be processed before deleting your account."

---

## PHASE 5 — Polish & UX Gaps

### Task 5.1 — Empty States

#### 5.1.1 — Activity screen empty state
- When user has no ledger transactions: show illustration + "Complete your first offer to start earning"
- CTA button: "Browse Offers" → navigate to Earn tab

#### 5.1.2 — Earn screen loading state
- While fetching offers: show 3-4 skeleton cards (gray animated placeholder boxes)
- If fetch fails: show "Couldn't load offers. Pull to refresh."

#### 5.1.3 — Cashout screen: insufficient balance state
- If balance < minimum cashout (2000 coins = $2.00): disable all method rows and amount input
- Show banner: "Earn at least $2.00 in coins to unlock cashout. You're at ${current} — keep going!"

### Task 5.2 — Error Handling

#### 5.2.1 — Global error boundary
- In `mobile/app/_layout.tsx`, add an error boundary that catches uncaught JS errors
- Show a "Something went wrong. Tap to restart." screen instead of a blank white crash

#### 5.2.2 — Network error handling
- Wrap all API calls with try/catch
- On network error (no internet): show a persistent banner at top: "No internet connection"
- Use `NetInfo` from `@react-native-community/netinfo` to detect connectivity

### Task 5.3 — Loading Performance

#### 5.3.1 — Splash screen configuration
- `mobile/eas.json` and `app.json` — confirm splash screen is configured
- Splash should show while Firebase auth state is resolving (`isLoading` state in AuthContext)
- Use `expo-splash-screen` `preventAutoHideAsync()` and `hideAsync()` at the right moment

#### 5.3.2 — Image optimization
- Confirm all local images in `/mobile/assets` are WebP or compressed PNG
- Lazy load offer provider logos if displayed

### Task 5.4 — Haptics & Animations Polish

#### 5.4.1
- Coin balance update animation: when new coins arrive via Firestore listener, animate the number counting up
- Cashout success: after successful submission, show a brief success animation before navigating to status
- Pull-to-refresh: confirm all list screens have `RefreshControl` with the app's teal color

---

## PHASE 6 — EAS Build Configuration

### Task 6.1 — Environment Variables in EAS

#### 6.1.1
- Create EAS secrets for sensitive values:
  ```bash
  eas secret:create --scope project --name FIREBASE_API_KEY --value "..."
  eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "..."
  eas secret:create --scope project --name API_BASE_URL --value "https://tapcash.online"
  ```
- In `app.config.js` (convert from `app.json` to `app.config.js` if not already):
  ```javascript
  export default {
    expo: {
      extra: {
        firebaseApiKey: process.env.FIREBASE_API_KEY,
        apiBaseUrl: process.env.API_BASE_URL,
      }
    }
  }
  ```

#### 6.1.2 — Build profiles in `eas.json`
Confirm three profiles exist:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" },
      "ios": { "buildConfiguration": "Release" }
    }
  }
}
```

### Task 6.2 — Android Configuration

#### 6.2.1 — `mobile/android/app/build.gradle`
- Confirm `applicationId` is set to your real package name (e.g., `com.tapcash.app`)
- Confirm `versionCode` and `versionName` are set
- Minimum SDK: 26 (Android 8.0)
- Target SDK: 35 (Android 15, current)

#### 6.2.2 — Google Play setup
- Create app in Google Play Console
- App name: "TapCash – Earn Real Rewards"
- Category: Finance
- Content rating: complete the questionnaire (no violence, no adult content, it's a rewards app)
- Privacy policy URL: `https://tapcash.online/privacy`

#### 6.2.3 — Build and upload
```bash
eas build --platform android --profile production
eas submit --platform android
```
- Upload to Internal Testing track first
- Test on 5 devices from the internal track
- Promote to Closed Testing (beta) with 20-50 users
- Promote to Production after beta sign-off

### Task 6.3 — iOS Configuration (if applicable)

#### 6.3.1 — Apple Developer Account requirements
- Enroll at developer.apple.com ($99/year)
- Create App ID with bundle identifier: `com.tapcash.app`
- Enable Push Notifications capability
- Create provisioning profiles via EAS (it handles this automatically)

#### 6.3.2 — App Store Connect setup
- Create the app in App Store Connect
- App name: "TapCash – Earn Real Rewards"
- Primary category: Finance
- Privacy policy URL: `https://tapcash.online/privacy`
- Support URL: `https://tapcash.online/contact`

#### 6.3.3 — Build and submit
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

#### 6.3.4 — App Store Review preparation
- Apple will scrutinize a rewards/money app closely
- Ensure the app:
  - Has a clearly visible Terms of Service accessible without login
  - Has account deletion flow (Task 4.2)
  - Does not promise guaranteed income
  - Has real content (not a shell/prototype) — all screens must work with real data by this point
  - Has a demo account available for the reviewer if they cannot complete an offer themselves
    - Create a reviewer account: `reviewer@tapcash.online` with some pre-loaded coins

---

## PHASE 7 — App Store Metadata & Screenshots

### Task 7.1 — Screenshots

#### 7.1.1 — Required sizes
- iOS: 6.7" (iPhone 15 Pro Max), 5.5" (iPhone 8 Plus) — minimum 3 screenshots each
- Android: phone screenshots at 1080×1920 minimum — minimum 2 screenshots

#### 7.1.2 — Screenshot content
1. Home screen with real balance ($12-50 range looks credible)
2. Earn/Offers screen showing 3-4 real offer cards
3. Cashout screen with method selection
4. Activity screen with a few transaction entries
5. Payout status screen showing "Sent" status

#### 7.1.3 — Frame screenshots
- Use a tool like AppMockUp or Rotato to put screenshots in device frames
- Add a headline above each: "Earn Real Cash", "100+ Offers Daily", "Fast Payouts"

### Task 7.2 — App Description

#### 7.2.1 — Short description (80 chars, Android)
"Complete surveys & offers. Earn real cash. Withdraw via PayPal or Interac."

#### 7.2.2 — Full description
```
TapCash lets you earn real money by completing surveys, trying apps, and watching videos.

HOW IT WORKS:
1. Sign up free — no credit card needed
2. Complete offers from top brands
3. Earn coins instantly (1,000 coins = $1 CAD)
4. Cash out via PayPal, Interac e-Transfer, or gift cards

WHY TAPCASH:
✓ Every offer is verified before coins hit your balance
✓ Real-time balance — watch your earnings grow
✓ Multiple payout options including Interac (Canada)
✓ No hidden fees — 0% processing fee on all payouts

PAYOUT OPTIONS:
• PayPal (global)
• Interac e-Transfer (Canada)
• Amazon, Steam, and more gift cards
• Bitcoin & Litecoin

Minimum cashout: $2.00 CAD (2,000 coins)
```

---

## PHASE 8 — Pre-Launch QA

### Task 8.1 — Device Matrix Testing

#### 8.1.1 — Android devices to test
- [ ] Budget: Samsung Galaxy A14 (Android 13, 4GB RAM)
- [ ] Mid-range: Google Pixel 7a (Android 14)
- [ ] Older: Samsung Galaxy S9 (Android 10, API 29)
- All should work — minimum is API 26

#### 8.1.2 — iOS devices to test (if applicable)
- [ ] iPhone 15 (iOS 17)
- [ ] iPhone 13 (iOS 16)
- [ ] iPad (if you want tablet support — optional for launch)

#### 8.1.3 — Test checklist per device
- [ ] Sign up → verify email → enter app
- [ ] Balance loads correctly
- [ ] Pull-to-refresh on Earn screen works
- [ ] Tapping offer → click registered → offer opens in browser
- [ ] Returning from browser → "thanks for completing" message shows
- [ ] Cashout form submits, confirmation appears
- [ ] Activity screen shows transactions
- [ ] Push notification received
- [ ] Tapping notification opens correct screen
- [ ] Sign out → sign back in

### Task 8.2 — Performance Check

#### 8.2.1
- App should reach Home tab within 3 seconds of opening on mid-range Android
- No JS bundle size warnings in EAS build output
- Use `expo-dev-client` to profile render times on device

### Task 8.3 — Crash Reporting

#### 8.3.1 — Add Sentry for React Native
```bash
npx expo install @sentry/react-native
```
- Initialize in `mobile/app/_layout.tsx`
- Use the same Sentry DSN as the web app (or a separate mobile project in Sentry)
- Confirm crashes are reported in the Sentry dashboard

---

## Sprint 2 Mobile Launch Checklist

**Push Notifications**
- [ ] Token saved to Firestore on first login
- [ ] Token refreshes when it changes
- [ ] Offer approved notification arrives on device
- [ ] Cashout sent notification arrives on device
- [ ] Tapping notification navigates to correct screen

**Real-Time**
- [ ] Balance updates live via Firestore onSnapshot
- [ ] Activity screen updates live
- [ ] Optimistic UI on cashout submit

**Offer Flow**
- [ ] Offer detail screen built and working
- [ ] Click registered BEFORE offer opens
- [ ] "Thanks for completing" message on browser return

**Account**
- [ ] User profile data loads (email, join date, total earned)
- [ ] Referral link visible and shareable
- [ ] Delete account flow works (required for App Store)
- [ ] Sign out works

**Polish**
- [ ] Empty states on Activity and Earn screens
- [ ] Network error banner
- [ ] Crash boundary in place
- [ ] Sentry crash reporting live
- [ ] Haptics and balance animation on coin arrival
- [ ] Splash screen configured correctly

**EAS & Store**
- [ ] EAS secrets configured (no hardcoded keys)
- [ ] Android Internal Testing track live
- [ ] 5+ devices tested manually
- [ ] Screenshots captured (all required sizes)
- [ ] App description written
- [ ] Privacy policy and delete-account URLs valid
- [ ] Demo account ready for App Store reviewer

**iOS (if applicable)**
- [ ] Apple Developer account enrolled
- [ ] EAS iOS build succeeds
- [ ] App Store Connect listing created
- [ ] TestFlight beta distributed and tested
- [ ] App Store Review submission ready
