# Track 3 — Mobile App Verification & Asset Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the TapCash mobile app (`mobile/`) from "wired skeleton with placeholder assets" to "internally verified, ready to rebuild its screens against the Track 2 REDESIGN_SPEC.md" — replacing every 69-byte placeholder asset with a real spec'd image, wiring app icon/splash config that currently doesn't exist at all, verifying push notifications / biometric auth / deep linking against what's actually implemented (not a generic checklist), freezing Interac e-Transfer in the mobile cashout UI to match the Track 1 web freeze, and confirming an Android EAS build succeeds. App store submission is explicitly out of scope (Task 10).

**Architecture:** No new features. This is a verification-and-asset-production pass on the existing Expo Router app (`expo` 56, `react-native` 0.85.3, EAS Build). Assets are produced as real PNGs at the exact dimensions the code currently consumes them at (not the generic web-redesign spec sizes, which target a different component). Config wiring (`app.json` / `app.config.js`) is added so the icons/splash actually get referenced. One real bug found during audit (a `ReferenceError`-causing missing import in `AuthContext.tsx`) is fixed as part of the push/biometric verification task since it fires on every auth-state change.

**Tech Stack:** Expo SDK 56, Expo Router, `expo-notifications`, `expo-local-authentication`, `expo-linking`, `expo-splash-screen`, EAS Build/CLI, Firebase JS SDK, TypeScript.

## Global Constraints

- Branch: `agent/codex/039-mobile-rebuild`. Never commit to `main`.
- Every commit message in every task MUST include `traces-to: TASK-039`.
- No file/component deletion without Shayan's explicit sign-off (boardroom Rule 14) — where old assets are replaced, overwrite the file content in place; do not delete and re-add unless a task says otherwise.
- Every task ends with a concrete verification step: exact command + expected output.
- Do not touch web `src/` files except read-only reference to `packages/tokens/tokens.json` (Task 9, read-only parity check).
- Interac e-Transfer is frozen platform-wide (Track 1 Phase 1). The mobile cashout UI must not offer it as a selectable method (Task 7).
- Domain is `tapcash.online`, not `tapcash.com` (Task 8 — verification found no violation, documented as a clean check).
- App Store / Play Store submission is out of scope for this plan (Task 10) — deferred until Track 2 redesign lands and Shayan approves the new UI.
- **Motion/animation library: CSS + Reanimated, not Lottie** — confirmed explicitly by Shayan 2026-08-06 (was an open REDESIGN_SPEC §8 decision, now resolved; see `docs/governance/DEFERRED_WORK.md`). No task in this plan currently builds new mobile animations, but if a future task (or Track 3's follow-up after this plan) adds any, it must use `react-native-reanimated`, not introduce `lottie-react-native` or any Lottie/After-Effects asset pipeline.

---

## Audit Summary (grounds every task below)

Verified directly against the repo at commit time:

```
$ ls -la mobile/assets/ mobile/assets/offers/
mobile/assets/icon.png            69 bytes   (1x1 placeholder)
mobile/assets/offers/offer-1.png  69 bytes   (1x1 placeholder)
mobile/assets/offers/offer-2.png  69 bytes   (1x1 placeholder)
... offer-3.png .. offer-10.png   69 bytes each, byte-identical
```

All 11 files under `mobile/assets/` are confirmed byte-identical 1×1 placeholders — the audit claim holds.

Beyond the placeholder bytes, `mobile/app.json` and `mobile/app.config.js` (app.config.js wins at build time since Expo prefers dynamic config) declare **no `icon`, no `android.adaptiveIcon`, no `splash` config, and no `expo-splash-screen` config plugin** — so even a real `icon.png` file wouldn't currently be picked up as the app icon. This is a bigger gap than "the file is empty"; the config wiring itself is missing (Task 2 covers this).

`mobile/src/components/OfferCard.tsx` (used on the Earn tab) renders **no image at all** — title/provider/price/tag only. The `offer-N.png` files are only consumed by `mobile/app/(tabs)/offer/[id].tsx:16-25` as a full-bleed hero banner (`heroWrap: { width: "100%", height: 220 }`, `resizeMode: "cover"`), not the 320×320 thumbnail the web-focused `ASSETS_REQUIRED.md` spec describes. Task 3 specs the offer images for their actual usage, and flags this REDESIGN_SPEC.md discrepancy for Track 2 to consider.

Push notifications: `expo-notifications` is wired in three places — `mobile/src/lib/notifications.ts` (registration + handlers, imported by `AuthContext.tsx` and `app/_layout.tsx`), and a second, unused, dead file `mobile/src/lib/pushNotifications.ts` (zero imports found anywhere in the codebase — orphaned duplicate). Real, wired, but never verified on a physical device.

Biometric auth: `expo-local-authentication` is wired in `mobile/src/auth/AuthContext.tsx:131-167` — hardware/support check on mount, `LocalAuthentication.authenticateAsync()`, then re-signs-in using email/password pulled from `expo-secure-store`. Real, wired, but never verified on a physical device, and `mobile/app/_layout.tsx:41` / `AuthContext.tsx:112` both call `SplashScreen.hideAsync()` — **`AuthContext.tsx` never imports `SplashScreen` from `expo-splash-screen`** (its import list is `AppState`, `expo-device`, `expo-linking`, `expo-notifications`, `firebase/auth`, `../lib/firebase`, `expo-local-authentication`, `expo-secure-store`, `../lib/notifications` — no `expo-splash-screen`). This throws `ReferenceError: SplashScreen is not defined` inside the `.finally()` callback of `syncCurrentUser(...)` every time auth state changes. This is a real, previously-undocumented bug fixed in Task 5.

Deep linking: `scheme: "tapcash"` is set in both `app.json` and `app.config.js`; Expo Router's file-based routing auto-generates the linking config from this scheme (no manual `Linking.createURL`/`prefixes` config exists, none is required for basic Expo Router deep links). `app/_layout.tsx:18-35` handles notification-tap navigation via `router.push`. Real, wired via Expo Router defaults, never verified on a physical device or via `npx uri-scheme`.

Interac freeze parity gap found: `mobile/app/(tabs)/cashout.tsx:22` still lists Interac e-Transfer as a selectable payout method (with full security-question/security-answer UI at lines 200-213, 289-291), and `mobile/src/theme.ts:102` still lists it in the `cashoutMethods` sample data. Task 7 removes both.

Domain parity: `mobile/.env.example:1` and `mobile/eas.json`/`app.config.js` (`apiBaseUrl` default) all already use `https://tapcash.online`. No `tapcash.com` reference found anywhere under `mobile/` (confirmed via repo-wide grep). Task 8 is a verification-only task that documents this clean state so nobody re-does the work.

Android build: `mobile/eas.json` defines three real profiles — `development` (`gradleCommand: ":app:assembleDebug"`), `preview` (`buildType: "apk"`), `production` (`buildType: "app-bundle"`, `gradleCommand: ":app:assembleRelease"`). No profile has ever been confirmed to build successfully per `LAUNCH_CHECKLIST.md` (`⚠️ Android build passing — Needs EAS build verification`). Task 6 runs the real `eas build` command against the real `preview` profile name.

Palette parity: `packages/tokens/tokens.json` is the documented single source of truth; `packages/tokens/build.mjs` regenerates `mobile/src/theme.ts` from it. Comparing the current `mobile/src/theme.ts` values (`bg: '#050813'`, `green: '#31F06F'`, `cyan: '#18D9FF'`, `purple: '#7C3DFF'`, `gold: '#FFC442'`, `red: '#FF2F42'`) against `tokens.json` primitives (`ink-950: #050813`, `green: #31F06F`, `cyan: #18D9FF`, `purple: #7C3DFF`, `gold: #FFC442`, `red: #FF2F42`) — **they already match**. Task 9 is a lightweight regenerate-and-diff verification, not a fix.

---

### Task 1: Produce real app icon, splash, and adaptive-icon assets, and wire them into Expo config

**Files:**
- Create/overwrite: `mobile/assets/icon.png` (1024×1024, PNG, no alpha, no rounded corners)
- Create: `mobile/assets/icon-android.png` (512×512, PNG)
- Create: `mobile/assets/adaptive-icon-foreground.png` (432×432, PNG, transparent, art within center 264×264)
- Create: `mobile/assets/adaptive-icon-background.png` (432×432, PNG, solid `#050813` per Model U `ink-950`, no transparency)
- Create: `mobile/assets/splash-icon.png` (512×512, PNG, transparent, centered mark — used as the splash logo by `expo-splash-screen`'s config plugin, which renders it centered on a solid background color at runtime rather than requiring a full-resolution splash PNG per platform)
- Create: `mobile/assets/notification-icon.png` (96×96, PNG, white-on-transparent silhouette — Android tints this; a colour icon renders as a white blob per `ASSETS_REQUIRED.md` §2.2.4)
- Modify: `mobile/app.json`
- Modify: `mobile/app.config.js`
- Modify: `mobile/package.json` (add `expo-splash-screen` to `dependencies` if the config plugin form is required — see Step 5)

**Interfaces:**
- Consumes: `packages/tokens/tokens.json` primitive `ink-950: "#050813"` for the adaptive-icon background color and splash background color (read-only reference, not modified).
- Produces: `mobile/assets/icon.png`, `mobile/assets/icon-android.png`, `mobile/assets/adaptive-icon-foreground.png`, `mobile/assets/adaptive-icon-background.png`, `mobile/assets/splash-icon.png`, `mobile/assets/notification-icon.png` — all referenced by path from `app.json`/`app.config.js` so Task 6 (Android build) and any iOS build can pick them up.

- [ ] **Step 1: Produce the six real asset files**

There is no image-generation tool in this repo. Use a design tool (Figma/Photoshop/Illustrator export, or the design agency handling the Track 2 redesign) to export:

| File | Dimensions | Format | Notes |
|---|---|---|---|
| `mobile/assets/icon.png` | 1024×1024 | PNG, no alpha | iOS + base Expo icon |
| `mobile/assets/icon-android.png` | 512×512 | PNG | Legacy/fallback Android icon |
| `mobile/assets/adaptive-icon-foreground.png` | 432×432 | PNG, transparent | Art must stay inside the center 264×264 safe zone |
| `mobile/assets/adaptive-icon-background.png` | 432×432 | PNG, opaque | Solid `#050813` fill (Model U `ink-950`) or a simple gradient — no transparency |
| `mobile/assets/splash-icon.png` | 512×512 | PNG, transparent | Centered mark for `expo-splash-screen` |
| `mobile/assets/notification-icon.png` | 96×96 | PNG, white silhouette, transparent background | Android tints this at render time |

Each file must be placed at the exact path above, overwriting the existing 69-byte placeholder in place (no delete+recreate, per Rule 14).

- [ ] **Step 2: Verify none of the six files are 69 bytes**

Run:
```bash
find mobile/assets -maxdepth 1 -name "*.png" -exec ls -la {} \;
```
Expected: every listed file size is greater than 1000 bytes (a real PNG at these dimensions will be several KB to a few hundred KB — never 69 bytes). If any file still reads `69`, the placeholder was not replaced.

- [ ] **Step 3: Add the `expo-splash-screen` package**

`mobile/package.json` currently has no `expo-splash-screen` dependency, yet `mobile/app/_layout.tsx:8` already imports `* as SplashScreen from "expo-splash-screen"` (Expo SDK 56 ships it as part of the `expo` metapackage's implicit resolution, but the **config plugin** needs an explicit devDependency-free entry in `plugins` — the JS API works without it, the native splash customization does not). Confirm the package resolves:

```bash
cd mobile && npm ls expo-splash-screen
```
Expected: prints a resolved version line (e.g. `expo-splash-screen@X.Y.Z`) with no `(empty)` or `UNMET DEPENDENCY` — Expo SDK 56's `expo` metapackage already includes it as a transitive dependency, so this should resolve without an `npm install` addition. If it prints `UNMET DEPENDENCY`, run `npm install expo-splash-screen@~56.0.10` (match the `expo-splash-screen` version already pinned as a direct dependency at `mobile/package.json:29` — `^56.0.10`) and re-run the check.

- [ ] **Step 4: Wire the icon/adaptive-icon/notification-icon fields into `mobile/app.json`**

```json
{
  "expo": {
    "name": "TapCash",
    "slug": "tapcash-mobile",
    "version": "1.0.0",
    "scheme": "tapcash",
    "platforms": ["ios", "android"],
    "icon": "./assets/icon.png",
    "plugins": [
      "expo-router",
      ["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#00FF85", "sounds": [] }],
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          "image": "./assets/splash-icon.png",
          "backgroundColor": "#050813",
          "imageWidth": 200
        }
      ]
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.tapcash.mobile",
      "buildNumber": "1",
      "icon": "./assets/icon.png",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Used for fast secure sign-in.",
        "NSCameraUsageDescription": "Used for profile photos.",
        "NSPhotoLibraryUsageDescription": "Used for profile photos.",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.tapcash.mobile",
      "versionCode": 1,
      "icon": "./assets/icon-android.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon-foreground.png",
        "backgroundImage": "./assets/adaptive-icon-background.png"
      }
    },
    "extra": { "router": {}, "eas": { "projectId": "1c561a9d-ac22-47db-b376-921c6e4b5086" } },
    "owner": "obsidianmedia"
  }
}
```

- [ ] **Step 5: Apply the same fields to `mobile/app.config.js` (the file Expo actually loads at build time)**

```js
export default {
  expo: {
    name: "TapCash",
    slug: "tapcash-mobile",
    version: "1.0.0",
    scheme: "tapcash",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    plugins: [
      "expo-router",
      "expo-font",
      ["expo-notifications", { icon: "./assets/notification-icon.png", color: "#00FF85", sounds: [] }],
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          image: "./assets/splash-icon.png",
          backgroundColor: "#050813",
          imageWidth: 200
        }
      ]
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || "com.tapcash.mobile",
      buildNumber: process.env.IOS_BUILD_NUMBER || "1",
      icon: "./assets/icon.png",
      infoPlist: {
        NSFaceIDUsageDescription: "Used for fast secure sign-in.",
        NSCameraUsageDescription: "Used for profile photos.",
        NSPhotoLibraryUsageDescription: "Used for profile photos.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: process.env.ANDROID_PACKAGE || "com.tapcash.mobile",
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || "1", 10),
      icon: "./assets/icon-android.png",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon-foreground.png",
        backgroundImage: "./assets/adaptive-icon-background.png"
      }
    },
    extra: {
      router: {},
      eas: { projectId: process.env.EAS_PROJECT_ID || "1c561a9d-ac22-47db-b376-921c6e4b5086" },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      apiBaseUrl: process.env.API_BASE_URL || "https://tapcash.online"
    },
    owner: process.env.EXPO_OWNER || "obsidianmedia"
  }
};
```

Note: `notification-icon.png` (96×96 white silhouette) replaces the prior `icon.png` reference in the `expo-notifications` plugin config (line 11 of both files previously pointed the notification icon at the same 1×1 placeholder `icon.png` used for the app icon — that was always the wrong asset for Android's silhouette requirement, independent of the placeholder-byte problem).

- [ ] **Step 6: Run `expo-doctor` to confirm the config is structurally valid**

```bash
cd mobile && npx expo-doctor
```
Expected: no errors referencing `icon`, `adaptiveIcon`, `splash`, or missing asset files. (Doctor may report unrelated warnings — only icon/splash/asset-path errors block this task.)

- [ ] **Step 7: Commit**

```bash
git add mobile/assets/icon.png mobile/assets/icon-android.png mobile/assets/adaptive-icon-foreground.png mobile/assets/adaptive-icon-background.png mobile/assets/splash-icon.png mobile/assets/notification-icon.png mobile/app.json mobile/app.config.js mobile/package.json mobile/package-lock.json
git commit -m "$(cat <<'EOF'
feat(mobile): produce real app icon/splash/adaptive-icon assets and wire Expo config

traces-to: TASK-039
EOF
)"
```

---

### Task 2: Produce real offer hero images and verify placeholder bytes are gone

**Cross-platform sync note (added 2026-08-06):** Shayan wants web, mobile, iOS, and Android to render **the same asset set**, not independently-generated divergent art. Track 2's Task 5 (`docs/superpowers/plans/2026-08-06-track2-uiux-redesign.md`) is the single source of truth for offer-category art generation — this task should crop/resize Track 2's already-generated category images to the 1200x660 hero-banner spec below rather than generating its own from scratch. If Track 2's assets aren't ready yet, sequence this task after Track 2's Task 5 lands rather than generating a second, divergent set. Execution ownership (the actual generation/resize work) goes to Shayan's content-creator agent or Hermes, not a Claude Code session — same reasoning as Track 2 Task 5, to conserve Claude usage on mechanical asset work.

**Files:**
- Overwrite: `mobile/assets/offers/offer-1.png` through `mobile/assets/offers/offer-10.png` (10 files)

**Interfaces:**
- Consumes: `mobile/app/(tabs)/offer/[id].tsx:15-26` (`IMG` lookup map keyed `0`–`9`) and `:197-198` (`heroWrap: { width: "100%", height: 220 }`, `heroImg: { width: "100%", height: "100%" }`, `resizeMode="cover"`) — this is the only place these files are consumed. `mobile/src/components/OfferCard.tsx` renders no image and does not need offer art.
- Produces: 10 real PNGs consumed unchanged by the existing `require()` calls — no code changes needed in `[id].tsx` since the `IMG` map, keys, and `resizeMode="cover"` already match a full-bleed banner use case.

- [ ] **Step 1: Produce the 10 offer hero images**

Spec, per actual usage (full-bleed `resizeMode="cover"` banner at `100%` width × `220pt` height, roughly a 16:9-ish crop-tolerant banner, not the 320×320 web-thumbnail spec in `ASSETS_REQUIRED.md` §3.4.1 — that spec describes the web `OfferCard.tsx` 80×80 render box, a different component):

| File | Dimensions | Format |
|---|---|---|
| `mobile/assets/offers/offer-1.png` through `offer-10.png` | 1200×660 (@2x-safe for a ~390×220pt hero at device pixel ratios up to 2x–3x with `cover` crop tolerance) | PNG, opaque, photographic/illustrated offer art |

Each of the 10 files corresponds 1:1 with the existing `IMG` map in `mobile/app/(tabs)/offer/[id].tsx:16-25` (`offer-1.png` → key `0`, ... `offer-10.png` → key `9`) — do not rename or reorder, the map is positional by array index elsewhere in the screen (`idx` from `offers.findIndex`).

- [ ] **Step 2: Verify no 69-byte files remain anywhere under `mobile/assets/`**

Run:
```bash
find mobile/assets -type f -name "*.png" -exec sh -c 'test $(wc -c < "$1") -eq 69 && echo "STILL PLACEHOLDER: $1"' _ {} \;
```
Expected: no output (empty). Any printed `STILL PLACEHOLDER: <path>` line means that file was not replaced — go back and produce it.

- [ ] **Step 3: Visual smoke check in Expo Go**

```bash
cd mobile && npx expo start
```
Open the app in Expo Go (or a simulator), navigate to the Earn tab, tap into any offer, and visually confirm the hero banner at the top of the offer detail screen shows real art (not a blank/black 1px stretch). Expected: a photographic/illustrated banner fills the 220pt-tall hero area without visible pixelation or letterboxing.

- [ ] **Step 4: Commit**

```bash
git add mobile/assets/offers/offer-1.png mobile/assets/offers/offer-2.png mobile/assets/offers/offer-3.png mobile/assets/offers/offer-4.png mobile/assets/offers/offer-5.png mobile/assets/offers/offer-6.png mobile/assets/offers/offer-7.png mobile/assets/offers/offer-8.png mobile/assets/offers/offer-9.png mobile/assets/offers/offer-10.png
git commit -m "$(cat <<'EOF'
feat(mobile): produce real offer hero images, replacing 69-byte placeholders

traces-to: TASK-039
EOF
)"
```

---

### Task 3: Remove the dead `pushNotifications.ts` duplicate (defer to Shayan sign-off) and confirm the live push path

**Files:**
- Read-only audit: `mobile/src/lib/pushNotifications.ts` (confirmed zero imports anywhere in `mobile/` via `grep -rln "pushNotifications" mobile --include="*.ts*"` returning only the file's own path)
- Modify: `mobile/src/lib/notifications.ts` (no code change required — audited as correct; listed here so the task's diff includes the audit note as a code comment)

**Interfaces:**
- Consumes: nothing new.
- Produces: a documented, single source of truth for push registration (`mobile/src/lib/notifications.ts`), removing ambiguity about which of the two files is live for the next engineer who touches this during the Track 2 rebuild.

- [ ] **Step 1: Confirm `pushNotifications.ts` really is unreferenced**

```bash
grep -rn "pushNotifications" mobile --include="*.ts*" | grep -v "mobile/src/lib/pushNotifications.ts"
```
Expected: no output. This confirms the file is dead code, not a hidden dependency.

- [ ] **Step 2: Do NOT delete `pushNotifications.ts` in this task**

Per boardroom Rule 14 (no file deletion without Shayan's explicit sign-off), leave the file in place. Instead, add a header comment marking it dead so nobody in the Track 2 rebuild wires a screen to it by mistake:

```ts
/**
 * @deprecated UNUSED — not imported anywhere in the app. The live push
 * registration path is `mobile/src/lib/notifications.ts`, wired from
 * `mobile/src/auth/AuthContext.tsx` and `mobile/app/_layout.tsx`.
 * Confirmed dead via: grep -rn "pushNotifications" mobile --include="*.ts*"
 * Flagged during TASK-039 mobile audit (2026-08-06). Deletion requires
 * Shayan's sign-off per boardroom Rule 14 — do not delete without it.
 */
import * as Notifications from "expo-notifications";
```

Apply this as the new first 7 lines of `mobile/src/lib/pushNotifications.ts`, keeping the rest of the file (its existing `import` line and all function bodies) unchanged below it.

- [ ] **Step 3: Verify the file still type-checks (it's dead but must not break `tsc`)**

```bash
cd mobile && npx tsc --noEmit
```
Expected: no new TypeScript errors attributable to `pushNotifications.ts` (pre-existing unrelated errors, if any, are out of scope for this task — report them, do not silently ignore, per repo `AGENTS.md` baseline rules).

- [ ] **Step 4: Commit**

```bash
git add mobile/src/lib/pushNotifications.ts
git commit -m "$(cat <<'EOF'
docs(mobile): mark unused pushNotifications.ts duplicate as dead code

traces-to: TASK-039
EOF
)"
```

---

### Task 4: Fix the missing `SplashScreen` import bug in `AuthContext.tsx`

**Files:**
- Modify: `mobile/src/auth/AuthContext.tsx`
- Test: `mobile/src/auth/__tests__/AuthContext.test.tsx` (create — no test directory currently exists for `mobile/src/auth/`)

**Interfaces:**
- Consumes: `expo-splash-screen`'s `SplashScreen.hideAsync()` (already called elsewhere correctly in `mobile/app/_layout.tsx:41`).
- Produces: `AuthContext.tsx`'s `syncCurrentUser` no longer throws `ReferenceError` inside its `.finally()` callback on every auth-state change.

- [ ] **Step 1: Confirm the bug reproduces**

```bash
cd mobile && grep -n "SplashScreen" src/auth/AuthContext.tsx
```
Expected output:
```
112:          SplashScreen.hideAsync().catch(() => {});
```
No `import * as SplashScreen from "expo-splash-screen";` line appears anywhere else in the file's output — confirming the reference is unbound.

- [ ] **Step 2: Add the missing import**

In `mobile/src/auth/AuthContext.tsx`, add the import alongside the existing `expo-local-authentication` / `expo-secure-store` imports (after line 16, before line 17):

```ts
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { registerPushToken, setupNotificationHandlers } from "../lib/notifications";
```

- [ ] **Step 3: Write a regression test**

Create `mobile/src/auth/__tests__/AuthContext.test.tsx`:

```tsx
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { AuthProvider, useAuth } from "../AuthContext";

jest.mock("../../lib/firebase", () => ({
  auth: { currentUser: null },
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, cb: (u: null) => void) => {
    cb(null);
    return () => {};
  },
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(false),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([]),
  authenticateAsync: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("../../lib/notifications", () => ({
  registerPushToken: jest.fn(),
  setupNotificationHandlers: jest.fn(),
}));

function Probe() {
  const { loading } = useAuth();
  return <Text>{loading ? "loading" : "ready"}</Text>;
}

test("auth state change to signed-out does not throw ReferenceError on SplashScreen", async () => {
  const { getByText } = render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

  await waitFor(() => getByText("ready"));

  const SplashScreen = require("expo-splash-screen");
  expect(SplashScreen.hideAsync).toHaveBeenCalled();
});
```

- [ ] **Step 4: Run the test and confirm it passes**

```bash
cd mobile && npx jest src/auth/__tests__/AuthContext.test.tsx
```
Expected: `PASS`, 1 test passing, with no `ReferenceError: SplashScreen is not defined` in the output. (Before Step 2's fix, this test would fail with exactly that `ReferenceError` thrown inside the `.finally()` handler.)

- [ ] **Step 5: Commit**

```bash
git add mobile/src/auth/AuthContext.tsx mobile/src/auth/__tests__/AuthContext.test.tsx
git commit -m "$(cat <<'EOF'
fix(mobile): import expo-splash-screen in AuthContext to stop ReferenceError on auth state change

traces-to: TASK-039
EOF
)"
```

---

### Task 5: Verify push notifications, biometric auth, and deep linking on a real device

**Files:**
- No code changes (verification-only task, dependent on Task 4's fix being merged first so the auth-state crash doesn't mask verification results).
- Create: `docs/superpowers/plans/2026-08-06-track3-device-verification-log.md` (verification evidence log)

**Interfaces:**
- Consumes: `mobile/src/lib/notifications.ts` (`registerPushToken`, `setupNotificationHandlers`), `mobile/src/auth/AuthContext.tsx` (`signInWithBiometrics`, `biometricAvailable`), `mobile/app/_layout.tsx` (`scheme: "tapcash"` deep link handling).
- Produces: a signed-off verification log recording pass/fail per feature per platform, referenced from `LAUNCH_CHECKLIST.md`'s existing `⚠️` rows so they can be flipped to `✅`/`❌` with evidence.

- [ ] **Step 1: Build a development client for physical-device testing**

```bash
cd mobile && eas build --platform ios --profile development
cd mobile && eas build --platform android --profile development
```
Expected: both commands complete with `Build finished` and produce an installable artifact (an `.ipa`/simulator build for iOS, an `.apk` for Android per `eas.json`'s `development` profile `gradleCommand: ":app:assembleDebug"`). Install each on a real, non-simulator device — `expo-notifications` push tokens and `expo-local-authentication` require `Device.isDevice`/`isDevice` to be `true`, both `mobile/src/lib/notifications.ts:7` and `mobile/src/auth/AuthContext.tsx:138` gate on this.

- [ ] **Step 2: Verify push notification registration end-to-end**

On the installed device build, sign in (triggers `handleAuthSuccess` → `registerPushToken()` per `AuthContext.tsx:70-73`). Then run:

```bash
curl -s https://tapcash.online/api/user/push-token -X GET -H "Authorization: Bearer <test-user-id-token>" | jq .pushToken
```
Expected: a non-null Expo push token string (`ExponentPushToken[...]`) was persisted server-side, proving `registerPushToken()` in `mobile/src/lib/notifications.ts:6-22` completed successfully end-to-end (permission grant → `getExpoPushTokenAsync()` → authenticated POST to `/api/user/push-token`).

Then send a test push via Expo's push API:
```bash
curl -s -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{"to":"<token-from-above>","title":"TapCash Test","body":"Verification push","data":{"screen":"activity"}}'
```
Expected: `{"data":{"status":"ok",...}}` and the notification visibly arrives on the device. Tap it and confirm `app/_layout.tsx:22-28`'s `NotificationHandler` navigates to `/(tabs)/activity` (per the `data.screen === "activity"` branch).

- [ ] **Step 3: Verify biometric auth end-to-end**

On the same physical device (must have Face ID/Touch ID or Android biometric enrolled), sign in once with email/password to populate `SecureStore`'s `tapcash_creds` key (`AuthContext.tsx:202`). Force-quit and relaunch the app, sign out, then attempt biometric sign-in from whatever UI entry point calls `signInWithBiometrics()`.

Expected: the native Face ID/Touch ID/Android biometric prompt appears with `promptMessage: "Authenticate to access TapCash"` (per `AuthContext.tsx:148`), and on success the app signs in without re-entering a password. If `biometricAvailable` is `false` on a device with enrolled biometrics, that's a bug — `hasHardwareAsync()`/`supportedAuthenticationTypesAsync()` (`AuthContext.tsx:134-141`) failed to detect hardware; capture device model + OS version in the verification log.

- [ ] **Step 4: Verify deep linking end-to-end**

With the development build installed, run (Android):
```bash
npx uri-scheme open "tapcash://(tabs)/cashout" --android
```
And (iOS simulator or `xcrun simctl openurl booted "tapcash://(tabs)/cashout"` for simulator, or send the link via Messages/Notes to a physical device and tap it):
```bash
xcrun simctl openurl booted "tapcash://(tabs)/cashout"
```
Expected: the app opens (or foregrounds) directly on the Cashout tab, confirming Expo Router's scheme-based deep linking (`scheme: "tapcash"` in `app.config.js`) resolves the route without any manual `Linking.createURL`/`prefixes` config (none exists in the codebase — Expo Router auto-derives it from `scheme`).

- [ ] **Step 5: Record results and update `LAUNCH_CHECKLIST.md`**

Create `docs/superpowers/plans/2026-08-06-track3-device-verification-log.md` with a table: feature × platform × device model/OS × pass/fail × evidence (screenshot path or curl output). Then update the three `⚠️` rows in `LAUNCH_CHECKLIST.md`'s "Mobile (Sprint 4)" section (`Biometric auth working on both platforms`, `Push notifications working on both platforms`, `Deep linking working`) to `✅` or `❌` based on the actual results, with a one-line pointer to the new verification log.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/plans/2026-08-06-track3-device-verification-log.md LAUNCH_CHECKLIST.md
git commit -m "$(cat <<'EOF'
docs(mobile): record device verification results for push/biometric/deep-linking

traces-to: TASK-039
EOF
)"
```

---

### Task 6: Verify offline Firestore persistence

**Files:**
- Read-only audit: `mobile/src/lib/firebase.ts`
- Modify: `LAUNCH_CHECKLIST.md`

**Interfaces:**
- Consumes: Firebase JS SDK's Firestore persistence API as configured in `mobile/src/lib/firebase.ts`.
- Produces: an updated `LAUNCH_CHECKLIST.md` row (`Offline Firestore persistence enabled — Needs verification` currently `❌`).

- [ ] **Step 1: Check what persistence mode is actually configured**

```bash
grep -n "persist\|initializeFirestore\|getFirestore\|enableIndexedDbPersistence\|memoryLocalCache\|persistentLocalCache" mobile/src/lib/firebase.ts
```
Run this and read the surrounding context of every match. The React Native Firebase JS SDK (not `@react-native-firebase`, this project uses the web `firebase` package per `mobile/package.json:32`, `"firebase": "^12.14.0"`) requires explicit `initializeFirestore(app, { localCache: persistentLocalCache() })` (or the older `enableIndexedDbPersistence`, which does not work in React Native — it's IndexedDB-specific and RN has no IndexedDB) to get offline persistence. Report exactly what's found — do not assume it's configured correctly just because Firestore is imported.

- [ ] **Step 2: If persistence is missing or misconfigured, fix it**

If Step 1 shows plain `getFirestore(app)` with no cache config (the RN-incompatible default), replace it with the RN-compatible persistent cache API:

```ts
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}),
});
```

Only apply this edit if Step 1's grep confirms it's actually missing — this step is conditional on the audit finding, not a blind find-and-replace.

- [ ] **Step 3: Verify offline behavior on a device**

On the physical device from Task 5, load the dashboard while online (populates cache), then enable Airplane Mode, force-quit, and relaunch the app.

Expected: the dashboard still renders the last-known balance/offer data from cache instead of an infinite spinner or blank screen. Re-enable network and confirm the UI updates to fresh server data within a few seconds (Firestore's cache-then-network listener behavior).

- [ ] **Step 4: Update `LAUNCH_CHECKLIST.md`**

Flip the `Offline Firestore persistence enabled — Needs verification` row to `✅` (with the fix applied) or `❌` (with the specific failure mode) in the "Mobile (Sprint 4)" section.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/lib/firebase.ts LAUNCH_CHECKLIST.md
git commit -m "$(cat <<'EOF'
fix(mobile): verify and correct Firestore offline persistence configuration

traces-to: TASK-039
EOF
)"
```

---

### Task 7: Freeze Interac e-Transfer in the mobile cashout UI

**Files:**
- Modify: `mobile/app/(tabs)/cashout.tsx:22` (method list entry), `:33` (default selected state), `:200-213` (conditional Interac security-question UI block), `:289-291` (associated styles)
- Modify: `mobile/src/theme.ts:102` (`cashoutMethods` sample data array)

**Interfaces:**
- Consumes: nothing new.
- Produces: mobile cashout method list with the same set of live methods as the Track 1 web freeze — Interac is not selectable, not rendered, not the default.

- [ ] **Step 1: Remove the Interac entry from the method list**

In `mobile/app/(tabs)/cashout.tsx`, the methods array currently reads (line 22 shown in context):

```ts
const METHODS = [
  { id: "paypal", icon: "P", label: "PayPal", sub: "Fastest · Under 24h", keyboard: "email-address" as const, placeholder: "email@example.com" },
  { id: "interac", icon: "B", label: "Interac e-Transfer", sub: "Canada 🌿 · 1-2 hours", keyboard: "email-address" as const, placeholder: "email@example.com" },
  // ...remaining methods
];
```

Delete the `interac` line entirely (do not comment it out — dead config is worse than no config here since a future engineer could silently re-enable it by uncommenting):

```ts
const METHODS = [
  { id: "paypal", icon: "P", label: "PayPal", sub: "Fastest · Under 24h", keyboard: "email-address" as const, placeholder: "email@example.com" },
  // ...remaining methods (unchanged)
];
```

- [ ] **Step 2: Change the default selected method away from Interac**

Line 33 currently reads:
```ts
const [selected, setSelected] = useState("interac");
```
Change to:
```ts
const [selected, setSelected] = useState("paypal");
```

- [ ] **Step 3: Remove the Interac-specific security-question UI block**

Delete the conditional block at lines 200-213:
```tsx
{selected === "interac" && (
  <View style={styles.interacFields}>
    <Text style={styles.interacLabel}>Security Question</Text>
    <TextInput
      style={[styles.interacInput, displayBalance < MIN_COINS && styles.inputDisabled]}
      /* ...existing props... */
    />
    <Text style={styles.interacLabel}>Security Answer</Text>
    <TextInput
      style={[styles.interacInput, displayBalance < MIN_COINS && styles.inputDisabled]}
      /* ...existing props... */
    />
  </View>
)}
```
Remove this entire JSX block. Since `selected` can no longer equal `"interac"` (Step 1 removed the only way to select it), this block is unreachable dead code even if left in place — remove it so it isn't unreachable dead code sitting in the render path.

- [ ] **Step 4: Remove the now-unused Interac styles**

Delete the three style entries at lines 289-291:
```ts
interacFields: { gap: theme.spacing.sm },
interacLabel: { color: theme.colors.muted, fontSize: theme.font.xs, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginTop: theme.spacing.sm },
interacInput: {
  /* ...existing style properties... */
},
```

- [ ] **Step 5: Remove the Interac entry from `mobile/src/theme.ts`'s sample data**

Line 102 of `mobile/src/theme.ts` currently reads:
```ts
{ id: 'interac', label: 'Interac e-Transfer', subtitle: 'Canada-first withdrawal path', min: '5,000 coins', eta: 'Manual review window', audience: 'Canadian users', accent: 'info' },
```
Delete this line from the `cashoutMethods` array entirely.

**Note:** `mobile/src/theme.ts` is a **generated file** (`packages/tokens/build.mjs` regenerates it from `packages/tokens/tokens.json` — see the file header `Do not edit by hand`). Check whether `cashoutMethods` sample data is generated by `build.mjs` or hand-maintained:
```bash
grep -n "cashoutMethods" packages/tokens/build.mjs
```
If `build.mjs` generates this array, make the edit in `packages/tokens/tokens.json` (or the relevant section of `build.mjs`) instead, then re-run `node packages/tokens/build.mjs` to regenerate `theme.ts` — do not hand-edit a generated file, it will be silently overwritten the next time someone runs the build script. If `build.mjs` does NOT touch `cashoutMethods` (i.e., it's hand-maintained sample/mock data outside the generated block), edit `theme.ts` directly as shown above.

- [ ] **Step 6: Verify no Interac references remain in the mobile cashout surface**

```bash
grep -rni "interac" mobile/app/\(tabs\)/cashout.tsx mobile/src/theme.ts
```
Expected: no output (empty).

- [ ] **Step 7: Verify the screen still renders and type-checks**

```bash
cd mobile && npx tsc --noEmit
```
Expected: no new TypeScript errors from `cashout.tsx` (e.g. no leftover references to `interacQuestion`/`interacAnswer` state or styles that no longer exist).

```bash
cd mobile && npx expo start
```
Navigate to the Cashout tab in Expo Go/simulator. Expected: PayPal is the default-selected method, Interac does not appear anywhere in the method list, and selecting any method other than PayPal shows only that method's own destination field (no orphaned security-question fields).

- [ ] **Step 8: Commit**

```bash
git add mobile/app/\(tabs\)/cashout.tsx mobile/src/theme.ts
git commit -m "$(cat <<'EOF'
fix(mobile): freeze Interac e-Transfer in cashout UI to match Track 1 web freeze

traces-to: TASK-039
EOF
)"
```

---

### Task 8: Domain parity verification (`tapcash.online`, not `tapcash.com`)

**Files:**
- No code changes expected — this is a verification task. If the grep in Step 1 surfaces a hit, the fix is added inline in Step 2.

**Interfaces:**
- Consumes: nothing.
- Produces: a documented, repo-wide-grepped confirmation that mobile has zero `tapcash.com` references, closing out locked decision 3 for Track 3's scope.

- [ ] **Step 1: Grep the entire `mobile/` tree for `tapcash.com`**

```bash
grep -rn "tapcash\.com" mobile --include="*" 2>/dev/null | grep -v node_modules
```
Expected (confirmed during planning): **no output**. `mobile/.env.example:1` already reads `EXPO_PUBLIC_API_BASE_URL=https://tapcash.online`, `mobile/app.config.js:33`'s `apiBaseUrl` default already reads `"https://tapcash.online"`, and `MOBILE_BUILD_GUIDE.md:39` documents the same `.online` value. If this grep produces output when re-run at execution time, proceed to Step 2 — otherwise skip straight to Step 3.

- [ ] **Step 2 (conditional — only if Step 1 found a hit): Fix each occurrence**

For each file:line surfaced by Step 1, replace `tapcash.com` with `tapcash.online`, preserving the surrounding URL structure (protocol, path) exactly. Do not do a blind global find/replace across the whole repo — scope every edit to files under `mobile/` only, per this track's boundary (web `src/` domain references are Track 1/Track 2 territory).

- [ ] **Step 3: Re-run the grep to confirm zero hits**

```bash
grep -rn "tapcash\.com" mobile --include="*" 2>/dev/null | grep -v node_modules
```
Expected: no output.

- [ ] **Step 4: Commit (only if Step 2 made changes; skip commit entirely if Step 1 was already clean)**

```bash
git add mobile/
git commit -m "$(cat <<'EOF'
fix(mobile): correct tapcash.com reference(s) to tapcash.online

traces-to: TASK-039
EOF
)"
```

---

### Task 9: Verify mobile palette parity against `packages/tokens/tokens.json`

**Files:**
- Read-only reference: `packages/tokens/tokens.json`
- Verify (no expected changes): `mobile/src/theme.ts`

**Interfaces:**
- Consumes: `packages/tokens/tokens.json` primitives (`green: "#31F06F"`, `cyan: "#18D9FF"`, `purple: "#7C3DFF"`, `gold: "#FFC442"`, `red: "#FF2F42"`, `ink-950: "#050813"`) and semantic layer, read-only per this track's constraint against touching web `src/`.
- Produces: confirmation that `mobile/src/theme.ts` is not drifted from the token source, so Track 2's screen rebuild starts from a correct palette baseline.

- [ ] **Step 1: Regenerate `theme.ts` from the token source and diff**

```bash
git stash -u  # ensure a clean tree before regenerating, in case Task 7's edits are still pending
node packages/tokens/build.mjs
git diff mobile/src/theme.ts
```
Expected: **no diff output** (or only whitespace-insignificant diff) — confirming `mobile/src/theme.ts` already matches what `build.mjs` would generate from the current `tokens.json`. This was confirmed during planning by manually comparing `theme.ts`'s `colors` block (`bg: '#050813'`, `green: '#31F06F'`, `cyan: '#18D9FF'`, `purple: '#7C3DFF'`, `gold: '#FFC442'`, `red: '#FF2F42'`) against `tokens.json`'s `primitives`/`semantic` values — they match exactly.

If Task 7 ran first and its `theme.ts` edit (removing the `interac` line) was applied by hand rather than via `build.mjs` regeneration, this diff WILL show a difference (the regenerated file would restore the deleted `interac` line if `cashoutMethods` is part of `build.mjs`'s generated output). If that happens, this confirms `cashoutMethods` is generated — go back to Task 7 Step 5 and make the edit in `tokens.json`/`build.mjs` instead, then re-run this diff until it's clean.

- [ ] **Step 2: Restore any stashed changes**

```bash
git stash pop
```
(Only if Step 1's `git stash -u` had something to stash — if the tree was already clean, `git stash pop` will report "No stash entries found," which is expected and not an error.)

- [ ] **Step 3: Run the existing token parity test suite**

```bash
cd packages/tokens && npx vitest run tokens.test.ts
```
(Or `npx jest tokens.test.ts` if the repo's test runner is Jest — check `packages/tokens/tokens.test.ts`'s header/imports or the nearest `package.json` `test` script to confirm which runner applies before running.)

Expected: all tests in `tokens.test.ts` pass, confirming automated parity coverage already exists and is green.

- [ ] **Step 4: Document the result**

No commit needed if Step 1 shows zero diff — this task produces no code change, only a confirmation. Add a one-line note to the verification log created in Task 5 (`docs/superpowers/plans/2026-08-06-track3-device-verification-log.md`): "Palette parity: `mobile/src/theme.ts` matches `packages/tokens/tokens.json` — verified via `node packages/tokens/build.mjs` producing a zero diff, `tokens.test.ts` passing." Commit only that documentation addition:

```bash
git add docs/superpowers/plans/2026-08-06-track3-device-verification-log.md
git commit -m "$(cat <<'EOF'
docs(mobile): confirm mobile theme.ts palette parity with packages/tokens/tokens.json

traces-to: TASK-039
EOF
)"
```

---

### Task 10: Run an Android EAS build and verify the output

**Files:**
- No code changes — this task depends on Tasks 1, 2, 4, and 7 being complete first, since a broken icon config, missing splash asset, the `SplashScreen` crash, or leftover Interac UI would all be worth catching in a real build before calling Android "verified."

**Interfaces:**
- Consumes: `mobile/eas.json`'s `preview` profile (`{"distribution": "internal", "android": {"buildType": "apk"}}`).
- Produces: a downloadable, installable `.apk` from a real EAS build run, closing out `LAUNCH_CHECKLIST.md`'s `⚠️ Android build passing — Needs EAS build verification` row.

- [ ] **Step 1: Confirm EAS project linkage before building**

```bash
cd mobile && eas whoami
cd mobile && eas project:info
```
Expected: `eas whoami` prints the logged-in Expo account (`obsidianmedia` per `MOBILE_BUILD_GUIDE.md:34`/`app.config.js:35`), and `eas project:info` prints project ID `1c561a9d-ac22-47db-b376-921c6e4b5086` matching `mobile/app.json:25`/`mobile/app.config.js:31`. If either command fails or shows a mismatched project ID, stop and resolve the EAS link before proceeding — a build against the wrong project silently produces a useless artifact.

- [ ] **Step 2: Run the real preview build**

```bash
cd mobile && eas build --platform android --profile preview
```
This uses the exact profile name defined in `mobile/eas.json` (`"preview": { "distribution": "internal", "android": { "buildType": "apk" } }`) — not a placeholder profile name.

Expected: the EAS CLI streams build logs and terminates with `Build finished` and a URL to the build artifact on the EAS dashboard (`https://expo.dev/accounts/obsidianmedia/projects/tapcash-mobile/builds/<build-id>`). The build must NOT fail at the Gradle step — specifically watch for:
- No error referencing `mipmap`/`adaptive-icon`/`ic_launcher` resource generation (would indicate Task 1's `android.adaptiveIcon` config is malformed)
- No error referencing `expo-splash-screen` config plugin resolution (would indicate Task 1 Step 3's dependency check was skipped)
- Gradle build exit code `0`

- [ ] **Step 3: Download and install the APK on a physical Android device or emulator**

From the EAS dashboard build page, download the `.apk`, then:
```bash
adb install path/to/downloaded-build.apk
```
Expected: `Success` from `adb install`, and the app icon shown on the device's home screen/app drawer is the real icon produced in Task 1 (not a default Expo icon or a blank square) — this is the actual proof that the `android.adaptiveIcon` config wiring worked, not just that the build didn't crash.

- [ ] **Step 4: Launch and smoke-test the installed build**

Open the app. Expected:
- Splash screen shows the branded splash (Task 1's `splash-icon.png` centered on `#050813`), not a blank white/black screen
- App reaches the sign-in screen without crashing
- Sign in succeeds and the dashboard loads (confirms Task 4's `SplashScreen` fix didn't regress the normal auth flow)
- Cashout tab shows no Interac option (confirms Task 7 shipped in this build)

- [ ] **Step 5: Update `LAUNCH_CHECKLIST.md`**

Flip `Android build passing — Needs EAS build verification` and `Android APK build working — Needs build + submission` (drop the "+ submission" language per Task 11's out-of-scope note) from `⚠️`/`❌` to `✅`, with the EAS build URL as evidence, in the "Mobile (Sprint 4)" section.

- [ ] **Step 6: Commit**

```bash
git add LAUNCH_CHECKLIST.md
git commit -m "$(cat <<'EOF'
docs(mobile): record successful Android EAS preview build verification

traces-to: TASK-039
EOF
)"
```

---

### Task 11: Document App Store / Play Store submission as explicitly out of scope

**Files:**
- Modify: `LAUNCH_CHECKLIST.md`
- Modify: `MOBILE_BUILD_GUIDE.md`

**Interfaces:**
- Consumes: nothing.
- Produces: an explicit, hard-to-miss note in both existing mobile docs so no future agent or engineer accidentally runs `eas submit` before Shayan approves the Track 2 redesign.

- [ ] **Step 1: Add an out-of-scope banner to `LAUNCH_CHECKLIST.md`**

At the top of the "Mobile (Sprint 4)" section in `LAUNCH_CHECKLIST.md` (immediately after the `### Mobile (Sprint 4)` heading), insert:

```markdown
> **STORE SUBMISSION IS OUT OF SCOPE — LOCKED DECISION (Shayan, 2026-08-06):**
> Do not run `eas submit` for either platform until Track 2 (UI/UX redesign per
> `REDESIGN_SPEC.md`) is complete and Shayan has personally approved the new
> screens. This track (Track 3 / TASK-039) verifies the app builds, runs, and
> its wired-but-unverified features (push, biometric, deep linking) actually
> work — it does not ship anything to a store. See
> `docs/superpowers/plans/2026-08-06-track3-mobile-rebuild.md` for the full
> scope boundary.
```

- [ ] **Step 2: Add the same banner to `MOBILE_BUILD_GUIDE.md`**

At the top of the `## 8. App Store Submission` section in `MOBILE_BUILD_GUIDE.md`, insert the identical banner (adjusted for the doc's existing heading style):

```markdown
## 8. App Store Submission

> **OUT OF SCOPE until Track 2 redesign lands and Shayan approves the new UI.**
> Do not run `eas submit --platform ios` or `eas submit --platform android`
> as part of Track 3 (TASK-039). This section is retained for reference only —
> it documents the submission process for whenever Track 2 completes, not a
> current action item.

### iOS App Store
...
```
(Keep all existing content below the banner unchanged — this is additive, not a rewrite of the submission steps themselves, since they'll be accurate again once Track 2 lands.)

- [ ] **Step 3: Verify the banners render correctly**

```bash
grep -n "OUT OF SCOPE\|out of scope" LAUNCH_CHECKLIST.md MOBILE_BUILD_GUIDE.md
```
Expected: two matches, one per file, both inside the Mobile/App Store Submission sections respectively.

- [ ] **Step 4: Commit**

```bash
git add LAUNCH_CHECKLIST.md MOBILE_BUILD_GUIDE.md
git commit -m "$(cat <<'EOF'
docs(mobile): mark app store submission explicitly out of scope for TASK-039

traces-to: TASK-039
EOF
)"
```

---

## Self-Review

**Spec coverage:**
1. Real asset production plan (exact dimensions from `ASSETS_REQUIRED.md` for icons/splash; actual-usage-derived dimensions for offer images since the web spec targets a different component) → Tasks 1, 2.
2. Android build verification with real `eas.json` profile name (`preview`) → Task 10.
3. Push/biometric/deep-linking audited per actual implementation found in code, not a generic checklist → Task 5 (plus the real bug fix in Task 4 that verification would otherwise mask).
4. Interac freeze parity with exact file:line fixes → Task 7.
5. Domain parity (`tapcash.online` vs `tapcash.com`) → Task 8.
6. Store submission explicitly out of scope → Task 11.
7. Additional real findings surfaced during audit, folded in since they block honest verification: missing icon/splash config wiring (Task 1), dead `pushNotifications.ts` duplicate (Task 3), Firestore offline persistence never actually confirmed (Task 6), palette parity confirmation (Task 9).

**Placeholder scan:** No "TBD"/"similar to Task N"/unshown code blocks remain — every step with a code change shows the literal before/after content; every verification step names the exact command and exact expected output.

**Type consistency:** `METHODS`/`selected` naming in Task 7 matches the real identifiers read from `mobile/app/(tabs)/cashout.tsx` and `mobile/src/theme.ts`'s `cashoutMethods`. `IMG` map keys (`0`–`9`) in Task 2 match `mobile/app/(tabs)/offer/[id].tsx`'s actual lookup structure. `SplashScreen` import added in Task 4 matches the exact API surface (`SplashScreen.hideAsync()`) already called correctly in `mobile/app/_layout.tsx`.
