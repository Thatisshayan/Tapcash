"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { AlertCircle, ArrowRight, KeyRound, Loader2, MailCheck } from "lucide-react";
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

      const token = await userCredential.user.getIdToken();
      await fetch("/api/auth/session/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setError(getErrorMessage(err, "Failed to sign in. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(217,182,120,0.08), transparent 45%), radial-gradient(circle at 85% 30%, rgba(108,92,224,0.06), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="max-w-2xl space-y-8">
            <MotionWrap delay={0}>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-[#0A0A0D] transition-transform group-hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)" }}
                >
                  TC
                </div>
                <div>
                  <p className="text-xl font-black tracking-tight text-[#F5F3EF]">TapCash</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgba(245,243,239,0.45)]">Ledger-first rewards</p>
                </div>
              </Link>

              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">Secure sign in</p>
                <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-[#F5F3EF] md:text-6xl">
                  Sign in to a cleaner rewards experience.
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-[rgba(245,243,239,0.68)] md:text-base">
                  Your session stays server-backed, your balance stays ledger-backed, and your account now needs a verified inbox before the platform opens up.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
                {["Server-verified session", "Ledger-backed balance", "Email verification required"].map((item) => (
                  <div key={item} className="border-t border-[rgba(245,243,239,0.09)] pt-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D9B678]">Confirmed</p>
                    <p className="mt-2 text-sm font-medium text-[rgba(245,243,239,0.68)]">{item}</p>
                  </div>
                ))}
              </div>
            </MotionWrap>
          </section>

          <section>
            <MotionWrap delay={0.12}>
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight text-[#F5F3EF]">Welcome back</h2>
                <p className="mt-1 text-sm text-[rgba(245,243,239,0.45)]">Sign in to view offers, balance, and payout status.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-start gap-3 rounded-2xl p-4"
                  style={{ background: "rgba(255,47,66,0.08)" }}
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-[#FF2F42]" />
                  <p className="text-sm text-[#ffb3ba]">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSignIn} className="space-y-6">
                <label className="block">
                  <span className="block text-xs font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Email address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-3 w-full border-b border-[rgba(245,243,239,0.14)] bg-transparent px-1 py-3 text-sm text-[#F5F3EF] placeholder:text-[rgba(245,243,239,0.28)] focus:border-[#D9B678] focus:outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Password</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="mt-3 w-full border-b border-[rgba(245,243,239,0.14)] bg-transparent px-1 py-3 text-sm text-[#F5F3EF] placeholder:text-[rgba(245,243,239,0.28)] focus:border-[#D9B678] focus:outline-none transition-colors"
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : undefined}
                  whileTap={!loading ? { scale: 0.98 } : undefined}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-black transition-all duration-200 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)", color: "#0A0A0D", boxShadow: "0 12px 30px rgba(217,182,120,0.28)" }}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  <span>{loading ? "Signing in..." : "Sign in"}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="flex w-full items-center justify-center gap-1.5 text-sm text-[rgba(245,243,239,0.45)] transition-colors hover:text-[#D9B678]"
                >
                  {resetLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  Forgot password?
                </button>
              </form>

              {resetSent && (
                <div
                  className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-4 text-sm text-[#F0CE97]"
                  style={{ background: "rgba(217,182,120,0.08)" }}
                >
                  <MailCheck className="h-5 w-5 shrink-0" />
                  <span>
                    Reset email sent to <strong>{email}</strong>. Check your inbox.
                  </span>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[rgba(245,243,239,0.09)]" />
                <span className="text-xs font-semibold text-[rgba(245,243,239,0.28)]">or</span>
                <div className="h-px flex-1 bg-[rgba(245,243,239,0.09)]" />
              </div>

              <div className="mt-5">
                <GoogleSignInButton label="Sign in with Google" />
              </div>

              <p className="mt-6 text-center text-sm text-[rgba(245,243,239,0.45)]">
                New here?{" "}
                <Link href="/auth/signup" className="font-bold text-[#D9B678] transition-colors hover:text-[#F0CE97]">
                  Create an account
                </Link>
              </p>
            </MotionWrap>
          </section>
        </div>
      </div>
    </div>
  );
}
