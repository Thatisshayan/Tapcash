# PROPOSALALLINREPORTMOBILEIOS.md — TapCash iOS Build Plan

**Generated:** July 6, 2026  
**Based on:** PROPOSALALLINREPORTMOBILE.md  
**Purpose:** iOS-specific build, configuration, and release plan  

---

## 1. iOS PREREQUISITES

### 1.1 Apple Developer Account Setup
| Step | Action | Status |
|------|--------|--------|
| 1 | Create Apple Developer account ($99/yr) | ☐ |
| 2 | Enable App Store Connect access | ☐ |
| 3 | Create App ID: `online.tapcash.app` | ☐ |
| 4 | Create Push Notification certificate | ☐ |
| 5 | Create Distribution certificate | ☐ |
| 6 | Create Provisioning profiles (Development + Distribution) | ☐ |
| 7 | Link to EAS project | ☐ |

### 1.2 EAS iOS Configuration
```json
// eas.json → build.ios
{
  "ios": {
    "simulator": false,
    "resourceClass": "m-medium",
    "autoIncrement": "buildNumber"
  }
}
```

### 1.3 `app.json` iOS Updates
```json
{
  "expo": {
    "name": "TapCash",
    "slug": "tapcash",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "online.tapcash.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "requireFullPrivacyManifest": true,
      "infoPlist": {
        "NSFaceIDUsageDescription": "TapCash uses Face ID for quick and secure login",
        "NSCameraUsageDescription": "TapCash uses camera for QR code scanning",
        "NSPhotoLibraryUsageDescription": "TapCash uses photos for profile pictures",
        "ITSAppUsesNonExemptEncryption": false
      },
      "config": {
        "usesNonExemptEncryption": false
      },
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

---

## 2. iOS BUILD COMMANDS

### 2.1 Development Build
```bash
# Install dependencies
cd mobile
npm install

# Start Expo dev server
npx expo start

# Build for iOS simulator
eas build --platform ios --profile development --simulator

# Build for real device
eas build --platform ios --profile development
```

### 2.2 Preview Build (TestFlight)
```bash
# Build for internal testing
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --profile preview
```

### 2.3 Production Build
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

---

## 3. iOS-SPECIFIC FEATURES

### 3.1 Face ID / Touch ID
```typescript
// src/biometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateWithBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate with TapCash',
    cancelLabel: 'Use Passcode',
    disableDeviceFallback: false,
    fallbackLabel: 'Enter Passcode',
  });

  return result.success;
}
```

### 3.2 Push Notifications (iOS)
```typescript
// src/notifications.ts
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

  if (Platform.OS === 'ios') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token.data;
}
```

### 3.3 Haptic Feedback
```typescript
// src/haptics.ts
import * as Haptics from 'expo-haptics';

export function impactLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function impactMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function impactHeavy() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function notificationSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function notificationWarning() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function notificationError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
```

### 3.4 iOS-Specific UI Adjustments
| Element | Adjustment |
|---------|-----------|
| Status bar | Light content on dark background |
| Navigation bar | Transparent, blur background |
| Safe area | Respect notch + home indicator |
| Tab bar | Bottom tabs with safe area padding |
| Keyboard | Dismiss on tap outside |
| Pull to refresh | Native refresh control |
| Swipe back | Enable gesture navigation |

---

## 4. iOS TESTING CHECKLIST

### 4.1 Device Testing
| Device | OS | Status |
|--------|-----|--------|
| iPhone 15 Pro | iOS 17.5+ | ☐ |
| iPhone 14 | iOS 16+ | ☐ |
| iPhone 13 Mini | iOS 16+ | ☐ |
| iPhone SE 3rd gen | iOS 16+ | ☐ |
| iPad Air 5th gen | iPadOS 17+ | ☐ |

### 4.2 Feature Testing
| Feature | Test | Status |
|---------|------|--------|
| Face ID login | Enroll → login → lock → unlock | ☐ |
| Touch ID login | Enroll → login → lock → unlock | ☐ |
| Push notifications | Receive → tap → deep link | ☐ |
| Background fetch | Background → foreground → data refresh | ☐ |
| Offline mode | Airplane mode → use app → back online | ☐ |
| Haptics | Tap button → feel vibration | ☐ |
| Dark mode | Toggle → verify all screens | ☐ |
| Dynamic Type | Increase font size → verify readability | ☐ |
| Split view (iPad) | Multitask → verify layout | ☐ |

### 4.3 Performance Testing
| Metric | Target | Device |
|--------|--------|--------|
| Cold start | <3s | iPhone 14 |
| Warm start | <1s | iPhone 14 |
| Screen transition | <300ms | iPhone 14 |
| API response | <500ms | WiFi |
| Memory usage | <150MB | All devices |
| Battery drain | <5%/hour active | iPhone 14 |

---

## 5. APP STORE SUBMISSION

### 5.1 App Store Connect Setup
| Field | Value |
|-------|-------|
| App Name | TapCash - Earn Rewards |
| Subtitle | Free Gift Cards & Cash |
| Category | Finance > Rewards |
| Secondary Category | Shopping > Cashback |
| Age Rating | 4+ |
| Price | Free |
| Availability | Canada |

### 5.2 App Store Listing
**Description:**
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
```

**Keywords:**
```
rewards,cashback,gift cards,earn money,free,canadian,interac,paypal,surveys,offers,cash,rewards app,canada
```

**What's New (v1.0.0):**
```
• Initial release of TapCash
• Earn rewards by completing offers
• Cash out via PayPal, Interac, Visa, or gift cards
• Daily streak bonuses
• Secure biometric login
```

### 5.3 Screenshots Required
| Device | Size | Screens |
|--------|------|---------|
| iPhone 15 Pro | 1290 x 2796 | Home, Earn, Cashout, Activity |
| iPhone 6.7" | 1284 x 2778 | Home, Earn, Cashout, Activity |
| iPhone 6.5" | 1242 x 2688 | Home, Earn, Cashout, Activity |
| iPhone 5.5" | 1242 x 2208 | Home, Earn, Cashout, Activity |
| iPad Pro 12.9" | 2048 x 2732 | Home, Earn, Cashout, Activity |

### 5.4 Review Guidelines Compliance
| Guideline | Requirement | Status |
|-----------|------------|--------|
| 2.1 | Performance: No crashes, no bugs | ☐ |
| 2.3.1 | Accurate metadata | ☐ |
| 3.1.1 | In-app purchase for digital goods | ☐ |
| 4.2 | Minimum functionality | ☐ |
| 4.3 | Spam: Not a clone | ☐ |
| 5.1.1 | Data collection disclosure | ☐ |
| 5.1.2 | Data use and sharing | ☐ |
| 5.2.1 | Intellectual property | ☐ |

---

## 6. IOS RELEASE CHECKLIST

| Step | Action | Status |
|------|--------|--------|
| 1 | Build passes `eas build --platform ios --profile production` | ☐ |
| 2 | TestFlight build installs and works | ☐ |
| 3 | All device tests pass | ☐ |
| 4 | Performance metrics meet targets | ☐ |
| 5 | App Store screenshots captured | ☐ |
| 6 | App Store description written | ☐ |
| 7 | Privacy policy URL ready | ☐ |
| 8 | Terms of service URL ready | ☐ |
| 9 | Support URL ready | ☐ |
| 10 | Marketing URL ready | ☐ |
| 11 | App Store submission passes review | ☐ |
| 12 | Release to public | ☐ |
| 13 | Monitor crash reports | ☐ |
| 14 | Respond to reviews | ☐ |

---

*End of PROPOSALALLINREPORTMOBILEIOS.md — iOS-specific plan. See PROPOSALALLINREPORTMOBILEANDROIDE.md for Android-specific plan.*
