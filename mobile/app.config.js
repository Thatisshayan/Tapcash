export default {
  expo: {
    name: "TapCash",
    slug: "tapcash-mobile",
    version: "1.0.0",
    scheme: "tapcash",
    platforms: ["ios", "android"],
    plugins: [
      "expo-router",
      "expo-font",
      ["expo-notifications", { icon: "./assets/icon.png", color: "#00FF85", sounds: [] }],
      "expo-secure-store"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || "com.tapcash.mobile",
      buildNumber: process.env.IOS_BUILD_NUMBER || "1",
      infoPlist: {
        NSFaceIDUsageDescription: "Used for fast secure sign-in.",
        NSCameraUsageDescription: "Used for profile photos.",
        NSPhotoLibraryUsageDescription: "Used for profile photos.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: process.env.ANDROID_PACKAGE || "com.tapcash.mobile",
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || "1", 10)
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