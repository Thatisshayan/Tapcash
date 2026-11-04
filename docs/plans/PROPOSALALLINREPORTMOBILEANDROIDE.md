# PROPOSALALLINREPORTMOBILEANDROIDE.md — TapCash Android Build Plan

**Generated:** July 6, 2026  
**Based on:** PROPOSALALLINREPORTMOBILE.md  
**Purpose:** Android-specific build, configuration, and release plan  

---

## 1. ANDROID PREREQUISITES

### 1.1 Google Play Console Setup
| Step | Action | Status |
|------|--------|--------|
| 1 | Create Google Play Developer account ($25 one-time) | ☐ |
| 2 | Create app: `online.tapcash.app` | ☐ |
| 3 | Complete store listing | ☐ |
| 4 | Upload privacy policy | ☐ |
| 5 | Create service account for EAS | ☐ |
| 6 | Link to EAS project | ☐ |

### 1.2 EAS Android Configuration
```json
// eas.json → build.android
{
  "android": {
    "buildType": "apk",
    "resourceClass": "medium",
    "autoIncrement": "versionCode"
  }
}
```

### 1.3 `app.json` Android Updates
```json
{
  "expo": {
    "name": "TapCash",
    "slug": "tapcash",
    "version": "1.0.0",
    "android": {
      "package": "online.tapcash.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F0F1A"
      },
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#0F0F1A"
      },
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.SCHEDULE_EXACT_ALARM"
      ]
    }
  }
}
```

---

## 2. ANDROID BUILD COMMANDS

### 2.1 Development Build
```bash
# Install dependencies
cd mobile
npm install

# Start Expo dev server
npx expo start

# Build for Android emulator
eas build --platform android --profile development --simulator

# Build for real device
eas build --platform android --profile development
```

### 2.2 Preview Build (Internal Testing)
```bash
# Build APK for internal testing
eas build --platform android --profile preview

# Submit to Google Play Internal Testing
eas submit --platform android --profile preview
```

### 2.3 Production Build
```bash
# Build AAB for Google Play
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

---

## 3. ANDROID-SPECIFIC FEATURES

### 3.1 Biometric Authentication
```typescript
// src/biometrics.ts (Android)
import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateWithBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate with TapCash',
    cancelLabel: 'Use PIN',
    disableDeviceFallback: false,
    fallbackLabel: 'Use PIN',
  });

  return result.success;
}
```

### 3.2 Push Notifications (Android)
```typescript
// src/notifications.ts (Android)
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'tapcash-16238',
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('offers', {
      name: 'New Offers',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00D68F',
    });

    await Notifications.setNotificationChannelAsync('payouts', {
      name: 'Payout Updates',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100],
      lightColor: '#FFB800',
    });
  }

  return token.data;
}
```

### 3.3 Android-Specific UI Adjustments
| Element | Adjustment |
|---------|-----------|
| Status bar | Translucent, dark background |
| Navigation bar | Match app theme |
| Back button | Handle gesture + button |
| Keyboard | Dismiss on tap outside |
| Pull to refresh | Material Design refresh |
| Swipe actions | Material Design swipe |
| Bottom sheets | Material Design bottom sheets |

### 3.4 Android Permissions
```xml
<!-- android/app/src/main/AndroidManifest.xml (auto-generated) -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

---

## 4. ANDROID TESTING CHECKLIST

### 4.1 Device Testing
| Device | OS | Status |
|--------|-----|--------|
| Pixel 8 | Android 14+ | ☐ |
| Pixel 7a | Android 14+ | ☐ |
| Samsung Galaxy S23 | Android 13+ | ☐ |
| Samsung Galaxy A54 | Android 13+ | ☐ |
| OnePlus 11 | Android 13+ | ☐ |

### 4.2 Feature Testing
| Feature | Test | Status |
|---------|------|--------|
| Fingerprint login | Enroll → login → lock → unlock | ☐ |
| Face unlock login | Enroll → login → lock → unlock | ☐ |
| Push notifications | Receive → tap → deep link | ☐ |
| Background fetch | Background → foreground → data refresh | ☐ |
| Offline mode | Airplane mode → use app → back online | ☐ |
| Haptics | Tap button → feel vibration | ☐ |
| Dark mode | Toggle → verify all screens | ☐ |
| Large screen | Tablet/flip phone → verify layout | ☐ |
| Notification channels | Verify offers/payouts channels | ☐ |

### 4.3 Performance Testing
| Metric | Target | Device |
|--------|--------|--------|
| Cold start | <3s | Pixel 8 |
| Warm start | <1s | Pixel 8 |
| Screen transition | <300ms | Pixel 8 |
| API response | <500ms | WiFi |
| Memory usage | <150MB | All devices |
| Battery drain | <5%/hour active | Pixel 8 |

---

## 5. GOOGLE PLAY SUBMISSION

### 5.1 Play Console Setup
| Field | Value |
|-------|-------|
| App Name | TapCash - Earn Rewards |
| Short Description | Free Gift Cards & Cash |
| Full Description | See App Store description |
| Category | Finance |
| Content Rating | Everyone |
| Price | Free |
| Countries | Canada |

### 5.2 Store Listing
**Short Description:**
```
Earn free gift cards and cash by completing simple offers. Canada's #1 micro-rewards platform.
```

**Full Description:**
```
TapCash is Canada's #1 micro-rewards platform. Earn free gift cards and cash by completing simple offers, playing games, and taking surveys.

Features:
• Earn TapCoins by completing offers from top brands
• Cash out via PayPal, Interac e-Transfer, Visa, or gift cards
• Daily streak bonuses for consistent earning
• Real-time balance tracking
• Secure biometric login
• Push notifications for new offers

Minimum cashout: $5 CAD
Average payout time: Within 24 hours

Download TapCash today and start earning!
```

**Keywords:**
```
rewards,cashback,gift cards,earn money,free,canadian,interac,paypal,surveys,offers,cash,rewards app,canada
```

### 5.3 Screenshots Required
| Device | Size | Screens |
|--------|------|---------|
| Phone | 1080 x 1920 | Home, Earn, Cashout, Activity |
| Tablet (7") | 1024 x 1280 | Home, Earn, Cashout, Activity |
| Tablet (10") | 1200 x 1920 | Home, Earn, Cashout, Activity |

### 5.4 Data Safety Section
| Data Type | Collection | Sharing | Purpose |
|-----------|-----------|---------|---------|
| Personal info (name, email) | Yes | No | Account management |
| Financial info (payment email) | Yes | No | Cashout processing |
| Device identifiers | Yes | No | Fraud prevention |
| Usage data | Yes | No | Analytics |
| Crash logs | Yes | No | Bug fixing |

### 5.5 Content Rating
| Question | Answer |
|----------|--------|
| Violence | None |
| Sexual content | None |
| Language | None |
| Controlled substances | None |
| User interaction | Yes (user-generated content) |
| Shares location | No |
| Shares personal info | Yes |

**Rating:** Everyone

---

## 6. ANDROID RELEASE TRACKS

### 6.1 Track Strategy
| Track | Purpose | Audience |
|-------|---------|----------|
| Internal Testing | Early testing | Team members |
| Closed Testing | Beta testing | 20-50 invited users |
| Open Testing | Public beta | Anyone who opts in |
| Production | Live release | All users |

### 6.2 Rollout Strategy
| Phase | Rollout | Duration | Monitor |
|-------|---------|----------|---------|
| 1 | 10% of users | 24h | Crash rate, ANR rate |
| 2 | 25% of users | 24h | Crash rate, ANR rate |
| 3 | 50% of users | 24h | Crash rate, ANR rate |
| 4 | 100% of users | — | All metrics |

---

## 7. ANDROID RELEASE CHECKLIST

| Step | Action | Status |
|------|--------|--------|
| 1 | Build passes `eas build --platform android --profile production` | ☐ |
| 2 | AAB file generated | ☐ |
| 3 | Internal testing build installs and works | ☐ |
| 4 | All device tests pass | ☐ |
| 5 | Performance metrics meet targets | ☐ |
| 6 | Play Store screenshots captured | ☐ |
| 7 | Play Store description written | ☐ |
| 8 | Data safety section completed | ☐ |
| 9 | Content rating questionnaire completed | ☐ |
| 10 | Privacy policy URL ready | ☐ |
| 11 | Play Store submission passes review | ☐ |
| 12 | Rollout to internal testing | ☐ |
| 13 | Rollout to closed testing | ☐ |
| 14 | Rollout to production (phased) | ☐ |
| 15 | Monitor crash reports | ☐ |
| 16 | Respond to reviews | ☐ |

---

## 8. ANDROID-SPECIFIC ISSUES

### 8.1 Common Issues & Fixes
| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails with "SDK not found" | Missing Android SDK | Install via Android Studio |
| Keystore not found | Missing keystore file | Generate with `keytool` or EAS |
| Google Services error | Missing google-services.json | Download from Firebase Console |
| Notification not showing | Missing channel | Create notification channel |
| App not appearing on Play Store | Incomplete listing | Complete all required fields |
| Crash on older Android | API level mismatch | Set minSdkVersion to 21 |

### 8.2 Android Version Compatibility
| Android Version | API Level | Support |
|----------------|-----------|---------|
| Android 5.0 (Lollipop) | 21 | Minimum supported |
| Android 6.0 (Marshmallow) | 23 | Supported |
| Android 7.0 (Nougat) | 24 | Supported |
| Android 8.0 (Oreo) | 26 | Recommended |
| Android 9.0 (Pie) | 28 | Recommended |
| Android 10 | 29 | Recommended |
| Android 11 | 30 | Recommended |
| Android 12 | 31 | Recommended |
| Android 13 | 33 | Recommended |
| Android 14 | 34 | Latest |

---

*End of PROPOSALALLINREPORTMOBILEANDROIDE.md — Android-specific plan. See PROPOSALALLINREPORTMOBILEIOS.md for iOS-specific plan.*
