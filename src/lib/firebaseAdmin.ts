import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

type FirebaseAdminMode = "real" | "fallback";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatPrivateKey(key: string): string {
  let cleaned = key;
  try {
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      const parsed: unknown = JSON.parse(cleaned);
      if (typeof parsed === "string") cleaned = parsed;
    }
  } catch { /* keep original */ }

  cleaned = cleaned.replace(/^['"]|['"]$/g, "");
  cleaned = cleaned.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
  cleaned = cleaned.trim();

  if (!cleaned.includes("-----BEGIN PRIVATE KEY-----")) {
    const raw = cleaned.replace(/\s+/g, "");
    const lines = raw.match(/.{1,64}/g)?.join("\n") || raw;
    cleaned = `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`;
  }
  return cleaned;
}

export let firebaseAdminReady = false;
export let firebaseAdminMode: FirebaseAdminMode = "fallback";
export let firebaseAdminError: string | null = null;

let app: App | null = null;

function log(level: "error" | "warn", message: string) {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "test";
  if (!isBuildPhase) {
    console[level](`[FirebaseAdmin] ${message}`);
  }
}

if (!getApps().length) {
  const isProduction = process.env.NODE_ENV === "production";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ? formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY) : null;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      firebaseAdminReady = true;
      firebaseAdminMode = "real";
    } catch (error) {
      firebaseAdminError = `Initialization failed: ${getErrorMessage(error, "Unknown error")}`;
      log("error", firebaseAdminError);
    }
  } else {
    firebaseAdminError = "Missing FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, or FIREBASE_PROJECT_ID.";
    log(isProduction ? "error" : "warn", firebaseAdminError);
  }

  // In production, never fall back — fail loudly if Firebase Admin isn't configured.
  // In dev/test, initialize a minimal app so the module is importable.
  if (!getApps().length) {
    if (isProduction) {
      log("error", "Firebase Admin unavailable in production — credentials are required.");
    } else {
      app = initializeApp({ projectId: projectId || "tapcash-dev" });
      firebaseAdminMode = "fallback";
      log("warn", "Using fallback Firebase app. Real credentials required for production.");
    }
  }
} else {
  app = getApps()[0] ?? null;
}

export function getFirebaseApp(): App | null {
  return app;
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
