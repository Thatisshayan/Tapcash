import * as admin from "firebase-admin";

if (!admin.apps.length) {
  let credential;
  try {
    // For local development, try to use the serviceAccountKey.json
    const serviceAccount = require("../../serviceAccountKey.json");
    credential = admin.credential.cert(serviceAccount);
  } catch (error) {
    // For production (Vercel), parse it from environment variables
    console.log("Using environment variables for Firebase Admin");
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    });
  }

  admin.initializeApp({
    credential,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
