import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const expoFirebaseConfig = Constants.expoConfig?.extra?.firebase as
  | {
      apiKey?: string;
      authDomain?: string;
      projectId?: string;
      storageBucket?: string;
      messagingSenderId?: string;
      appId?: string;
      measurementId?: string;
    }
  | undefined;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || expoFirebaseConfig?.apiKey || "AIzaSyACKd9BuIVbwADY8P1Ap3_gHdDoLs3uGdw",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || expoFirebaseConfig?.authDomain || "tapcash-16238.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || expoFirebaseConfig?.projectId || "tapcash-16238",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || expoFirebaseConfig?.storageBucket || "tapcash-16238.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || expoFirebaseConfig?.messagingSenderId || "538090776118",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || expoFirebaseConfig?.appId || "1:538090776118:web:1d96a2dbd12f2d69211a97",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || expoFirebaseConfig?.measurementId || "G-MNZNE9ER7D",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
