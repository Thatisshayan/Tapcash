"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { AlertCircle, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { MotionWrap } from "@/components/PremiumUi";
import { auth } from "@/lib/firebase";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { getErrorMessage } from "@/lib/error";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      document.cookie = `tapcash_ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToPolicies) {
      setError("Please agree to the platform policies before creating an account.");
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

      let apiError = "Registration rejected.";
      try {
        const data = await response.json();
        apiError = data.error || apiError;
      } catch {
        apiError = response.statusText || apiError;
      }

      if (!response.ok) {
        throw new Error(apiError);
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&next=/dashboard`);
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      setError(getErrorMessage(err, "Failed to create account. Please try again."));
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
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">Create account</p>
                <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-[#F5F3EF] md:text-6xl">
                  Join a rewards platform that feels clean, cinematic, and honest.
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-[rgba(245,243,239,0.68)] md:text-base">
                  Signup now requires a verified inbox before the app opens. That keeps the user base real, the ledger cleaner, and the platform less bot-prone.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
                {["Verified email", "Device fingerprinting", "Policy confirmation"].map((item) => (
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
                <h2 className="text-2xl font-black tracking-tight text-[#F5F3EF]">Create your account</h2>
                <p className="mt-1 text-sm text-[rgba(245,243,239,0.45)]">Start earning with a clean, premium onboarding flow.</p>
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

              <form onSubmit={handleSignUp} className="space-y-6">
                <label className="block">
                  <span className="block text-xs font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Full name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-3 w-full border-b border-[rgba(245,243,239,0.14)] bg-transparent px-1 py-3 text-sm text-[#F5F3EF] placeholder:text-[rgba(245,243,239,0.28)] focus:border-[#D9B678] focus:outline-none transition-colors"
                  />
                </label>

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

                <label className="flex items-start gap-3 rounded-2xl px-1 py-2">
                  <input
                    id="policy-agreement"
                    type="checkbox"
                    required
                    checked={agreedToPolicies}
                    onChange={(e) => setAgreedToPolicies(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[rgba(245,243,239,0.25)] bg-transparent text-[#D9B678] focus:ring-[#D9B678]/40"
                  />
                  <span className="text-sm leading-relaxed text-[rgba(245,243,239,0.45)]">
                    I agree to the{" "}
                    <Link href="/terms" className="font-bold text-[#D9B678] hover:text-[#F0CE97]">Terms</Link>,{" "}
                    <Link href="/privacy" className="font-bold text-[#D9B678] hover:text-[#F0CE97]">Privacy Policy</Link>,{" "}
                    <Link href="/cookies" className="font-bold text-[#D9B678] hover:text-[#F0CE97]">Cookie Policy</Link>, and{" "}
                    <Link href="/affiliate" className="font-bold text-[#D9B678] hover:text-[#F0CE97]">Affiliate Disclosure</Link>.
                  </span>
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
                  <span>{loading ? "Creating account..." : "Create account"}</span>
                </motion.button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[rgba(245,243,239,0.09)]" />
                <span className="text-xs font-semibold text-[rgba(245,243,239,0.28)]">or</span>
                <div className="h-px flex-1 bg-[rgba(245,243,239,0.09)]" />
              </div>

              <div className="mt-5">
                <GoogleSignInButton label="Sign up with Google" />
              </div>

              <div className="mt-6 border-t border-[rgba(245,243,239,0.09)] pt-5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#D9B678]">
                  <MailCheck className="h-3.5 w-3.5" />
                  Verification required before access
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[rgba(245,243,239,0.45)]">
                  TapCash sends you to a verification step first. That keeps fake signups out and helps the real rewards flow stay clean.
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-[rgba(245,243,239,0.45)]">
                Already have an account?{" "}
                <Link href="/auth/signin" className="font-bold text-[#D9B678] transition-colors hover:text-[#F0CE97]">
                  Sign in
                </Link>
              </p>
            </MotionWrap>
          </section>
        </div>
      </div>
    </div>
  );
}
