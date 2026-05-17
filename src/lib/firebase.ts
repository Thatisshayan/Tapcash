import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Replace with actual Firebase config from Firebase Console later
const firebaseConfig = {
  apiKey: "AIzaSyACKd9BuIVbwADY8P1Ap3_gHdDoLs3uGdw",
  authDomain: "tapcash-16238.firebaseapp.com",
  projectId: "tapcash-16238",
  storageBucket: "tapcash-16238.firebasestorage.app",
  messagingSenderId: "538090776118",
  appId: "1:538090776118:web:1d96a2dbd12f2d69211a97",
  measurementId: "G-MNZNE9ER7D"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, auth, db, functions };
