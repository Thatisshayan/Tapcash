import * as admin from "firebase-admin";

if (!admin.apps.length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    try {
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = JSON.parse(privateKey);
      }
    } catch (e) {}
    
    if (typeof privateKey === 'string') {
      privateKey = privateKey.replace(/^['"]|['"]$/g, '');
      privateKey = privateKey.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
      privateKey = privateKey.trim();
      
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        const cleanKey = privateKey.replace(/\s+/g, '');
        const formattedKey = cleanKey.match(/.{1,64}/g)?.join('\n') || cleanKey;
        privateKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----\n`;
      }
    }
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    } catch (error: any) {
      console.error("Firebase Admin Initialization Error:", error.message);
    }
  } else {
    console.warn("Firebase Admin: No credentials provided via env variables. Missing FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, or FIREBASE_PROJECT_ID.");
  }

  // Fallback to prevent Next.js build crash from `admin.firestore()` when credentials fail or are missing
  if (!admin.apps.length) {
    console.warn("Initializing dummy Firebase app for build process.");
    admin.initializeApp({ projectId: projectId || "demo-project" });
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
