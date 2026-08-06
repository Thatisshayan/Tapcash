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
// NEXT_PUBLIC_* values are baked into the client bundle at `next build` time,
// not read fresh at runtime -- unlike server-only code (firebaseAdmin.ts,
// env.ts), a build-time placeholder here is PERMANENT until the next real
// build, even if the correct env vars are added afterward. So the
// build-vs-runtime distinction used elsewhere is wrong for this file: what
// actually matters is whether this is Vercel's real Production build (which
// ships to real users and must not silently bake in a dead config) versus
// CI / a Preview deploy / local dev (where a placeholder is harmless).
// Vercel sets VERCEL_ENV=production only for that real production build.
const isRealProductionBuild = process.env.VERCEL_ENV === "production";

if (!configured) {
  const message = '[firebase] Missing required Firebase configuration. Set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID — no dummy fallback is used at runtime, so the app will not silently point at a demo project.';
  if (isRealProductionBuild) {
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

