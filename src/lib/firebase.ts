import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const configured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
// Next.js sets NEXT_PHASE=phase-production-build only during `next build`, not real
// runtime serving — same distinction firebaseAdmin.ts uses. CI/build environments here
// do not have Firebase secrets injected, so a hard throw must not fire during build.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "test";

if (!configured) {
  const message = '[firebase] Missing required Firebase configuration. Set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID — no dummy fallback is used at runtime, so the app will not silently point at a demo project.';
  if (process.env.NODE_ENV === "production" && !isBuildPhase) {
    throw new Error(message);
  }
  console.warn(message);
}

const app = !getApps().length
  ? initializeApp((configured ? firebaseConfig : { apiKey: "build-placeholder", projectId: "build-placeholder" }) as any)
  : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

