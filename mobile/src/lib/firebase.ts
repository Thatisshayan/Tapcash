import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACKd9BuIVbwADY8P1Ap3_gHdDoLs3uGdw",
  authDomain: "tapcash-16238.firebaseapp.com",
  projectId: "tapcash-16238",
  storageBucket: "tapcash-16238.firebasestorage.app",
  messagingSenderId: "538090776118",
  appId: "1:538090776118:web:1d96a2dbd12f2d69211a97",
  measurementId: "G-MNZNE9ER7D",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
