export default {
  expo: {
    name: "TapCash",
    slug: "tapcash-mobile",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "tapcash",
    userInterfaceStyle: "dark",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A0D",
    },
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
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || "1", 10),
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0A0A0D",
      },
    },
    extra: {
      router: {},
      eas: { projectId: process.env.EAS_PROJECT_ID || "1c561a9d-ac22-47db-b376-921c6e4b5086" },
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://tapcash.online",
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyACKd9BuIVbwADY8P1Ap3_gHdDoLs3uGdw",
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "tapcash-16238.firebaseapp.com",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "tapcash-16238",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "tapcash-16238.firebasestorage.app",
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "538090776118",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:538090776118:web:1d96a2dbd12f2d69211a97",
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MNZNE9ER7D",
      },
    },
    owner: process.env.EXPO_OWNER || "obsidianmedia"
  }
};
