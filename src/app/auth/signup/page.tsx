"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { getDeviceFingerprint } from "@/lib/fingerprint";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!agreedToPolicies) {
      setError("Please read and agree to our platform terms and policies to sign up.");
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const fingerprint = await getDeviceFingerprint();

        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
          return null;
        }
        const referredBy = getCookie("tapcash_ref");

        // Initialize user document
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Google User",
          status: "active",
          isFlagged: false,
          registrationIp: "google-oauth",
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
          deviceFingerprint: fingerprint,
          referredBy: referredBy,
          createdAt: serverTimestamp(),
          wallet: {
            balance: 0,
            lastUpdated: serverTimestamp(),
          },
          walletBalanceCents: 0,
        });
      }

      router.push("/");
    } catch (err: any) {
      console.error("Google sign in/up error:", err);
      setError(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToPolicies) {
      setError("Please read and agree to our platform terms and policies to create an account.");
      return;
    }

    setLoading(true);

    try {
      const fingerprint = await getDeviceFingerprint();

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, deviceFingerprint: fingerprint }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration rejected.");
      }

      // Seamlessly log the user in on the client side using the client SDK immediately after successful registration
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);

      router.push("/");
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#0a0a0a] to-[#060606] flex items-center justify-center p-4">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative w-full max-w-md bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Glow effect */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px]" />

        <div className="relative flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
            <Coins className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join TapCash to start earning real coins</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 py-1">
            <input
              id="policy-agreement"
              type="checkbox"
              required
              checked={agreedToPolicies}
              onChange={(e) => setAgreedToPolicies(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-zinc-800 bg-zinc-900/50 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 focus:ring-1 cursor-pointer transition accent-emerald-500"
            />
            <label htmlFor="policy-agreement" className="text-xs text-zinc-500 leading-normal select-none cursor-pointer">
              By signing up, I explicitly agree to the{" "}
              <Link href="/terms" className="text-emerald-400 font-bold hover:underline">Terms of Service</Link>,{" "}
              <Link href="/privacy" className="text-emerald-400 font-bold hover:underline">Privacy Policy</Link>,{" "}
              <Link href="/cookies" className="text-emerald-400 font-bold hover:underline">Cookie Policy</Link>, and{" "}
              <Link href="/affiliate" className="text-emerald-400 font-bold hover:underline">Affiliate Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-black font-extrabold rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign Up Free</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-zinc-900/60"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-zinc-900/60"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-700/80 text-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.77h2.63c1.54-1.42 2.42-3.51 2.42-5.97z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.63-2.77c-.73.49-1.66.78-2.65.78-2.04 0-3.77-1.39-4.39-3.26H1.31v2.85C3.13 20.19 7.23 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M7.61 15.09c-.16-.49-.25-1.01-.25-1.54s.09-1.05.25-1.54V9.15H1.31C.48 10.8.0 12.65.0 14.5s.48 3.7 1.31 5.35l3.65-2.85c-.62-1.87-.62-3.69 0-5.41z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.23 1 3.13 3.81 1.31 7.15l3.65 2.85c.62-1.87 2.35-3.26 4.39-3.26z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <p className="text-zinc-500 text-sm text-center mt-8">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-emerald-400 font-bold hover:text-emerald-300 transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
