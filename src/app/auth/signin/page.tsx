"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, CircleGauge, Loader2, Lock, Mail, ShieldCheck, Sparkles, KeyRound, MailCheck } from "lucide-react";
import { MotionWrap } from "@/components/PremiumUi";
import { auth } from "@/lib/firebase";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { getErrorMessage } from "@/lib/error";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email address above first, then click Forgot Password.");
      return;
    }
    setResetLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to send reset email."));
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await userCredential.user.reload();

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&next=/dashboard`);
        return;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setError(getErrorMessage(err, "Failed to sign in. Please check your credentials."));
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
            <MotionWrap delay={0}>
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
                Your session stays server-backed, your balance stays ledger-backed, and your account now needs a verified inbox before the platform opens up.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Server-verified session", "Ledger-backed balance", "Email verification required"].map((item) => (
                <div key={item} className="tap-card rounded-[1.25rem] p-4">
                  <div className="flex items-center gap-2 text-[#00e6c3] text-xs font-black uppercase tracking-[0.24em]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confirmed</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-200 font-medium">{item}</p>
                </div>
              ))}
            </div>
            </MotionWrap>
          </section>

          <section className="relative">
            <MotionWrap delay={0.12}>
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
                 <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
                   <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="text-sm text-red-300">{error}</p>
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
                      placeholder="********"
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

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="w-full text-center text-sm text-zinc-500 hover:text-[#00e6c3] transition-colors flex items-center justify-center gap-1.5"
                >
                  {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  Forgot password?
                </button>
              </form>

{resetSent && (
                 <div className="mt-4 rounded-2xl border border-[#00e6c3]/20 bg-[#00e6c3]/8 px-4 py-4 flex items-center gap-3 text-sm text-[#8cf8e9]">
                   <MailCheck className="w-5 h-5 flex-shrink-0" />
                   <span>Reset email sent to <strong>{email}</strong>. Check your inbox.</span>
                 </div>
               )}

              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-xs text-zinc-600 font-semibold">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <div className="mt-4">
                <GoogleSignInButton label="Sign in with Google" />
              </div>

              <p className="mt-6 text-center text-sm text-zinc-500">
                New here?{" "}
                <Link href="/auth/signup" className="font-bold text-[#00e6c3] hover:text-[#7dffe7]">
                  Create an account
                </Link>
              </p>
            </div>
            </MotionWrap>
          </section>
        </div>
      </div>
    </div>
  );
}
