"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowRight, CircleGauge, Loader2, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { auth, db } from "@/lib/firebase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const ensureSession = async (idToken: string) => {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Google User",
          status: "active",
          isFlagged: false,
          registrationIp: "google-oauth",
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
          createdAt: serverTimestamp(),
        });
      }

      const idToken = await user.getIdToken();
      await ensureSession(idToken);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await ensureSession(idToken);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen tap-shell text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,230,195,0.14),_transparent_35%),radial-gradient(circle_at_right,_rgba(58,123,255,0.12),_transparent_35%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <section className="space-y-8 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00e6c3] to-[#3a7bff] flex items-center justify-center text-[#050816] shadow-[0_12px_40px_rgba(58,123,255,0.22)] group-hover:scale-105 transition-transform">
                <CircleGauge className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight tap-gradient-text font-display">TapCash</p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-semibold">Ledger-first rewards</p>
              </div>
            </Link>

            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full tap-badge text-[10px] font-black uppercase tracking-[0.28em] text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-[#00e6c3]" />
                Secure sign in
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.92] font-display tap-gradient-text">
                Sign in to a cleaner rewards experience.
              </h1>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                Your session is routed through server-backed auth and the dashboard balance is read from the ledger, not a fake client wallet.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Server-verified session",
                "Ledger-backed balance",
                "Manual cashout approval",
              ].map((item) => (
                <div key={item} className="tap-card rounded-[1.25rem] p-4">
                  <div className="flex items-center gap-2 text-[#00e6c3] text-xs font-black uppercase tracking-[0.24em]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confirmed</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-200 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#00e6c3]/10 via-transparent to-[#3a7bff]/12 blur-3xl" />
            <div className="tap-card rounded-[2rem] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-[#00e6c3]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Welcome back</h2>
                  <p className="text-sm text-zinc-500">Sign in to view offers, balance, and payout status.</p>
                </div>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Email address</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-white/8 bg-white/4 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00e6c3]/40 focus:ring-1 focus:ring-[#00e6c3]/40"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/8 bg-white/4 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00e6c3]/40 focus:ring-1 focus:ring-[#00e6c3]/40"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-5 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading ? "Signing in..." : "Sign in"}</span>
                </button>
              </form>

              <div className="my-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-600 font-black">Or continue with</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-5 py-3.5 text-sm font-bold text-white hover:border-white/15 hover:bg-white/6 disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.77h2.63c1.54-1.42 2.42-3.51 2.42-5.97z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.63-2.77c-.73.49-1.66.78-2.65.78-2.04 0-3.77-1.39-4.39-3.26H1.31v2.85C3.13 20.19 7.23 23 12 23z" />
                  <path fill="#FBBC05" d="M7.61 15.09c-.16-.49-.25-1.01-.25-1.54s.09-1.05.25-1.54V9.15H1.31C.48 10.8 0 12.65 0 14.5s.48 3.7 1.31 5.35l3.65-2.85c-.62-1.87-.62-3.69 0-5.41z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.23 1 3.13 3.81 1.31 7.15l3.65 2.85c.62-1.87 2.35-3.26 4.39-3.26z" />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <p className="mt-6 text-center text-sm text-zinc-500">
                New here?{" "}
                <Link href="/auth/signup" className="font-bold text-[#00e6c3] hover:text-[#7dffe7]">
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
