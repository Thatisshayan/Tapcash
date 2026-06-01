"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, CircleGauge, Loader2, Lock, Mail, ShieldCheck, Sparkles, User, MailCheck } from "lucide-react";
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration rejected.");
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
                Create account
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.92] font-display tap-gradient-text">
                Join a rewards platform that feels clean, cinematic, and honest.
              </h1>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                Signup now requires a verified inbox before the app opens. That keeps the user base real, the ledger cleaner, and the platform less bot-prone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Verified email", "Device fingerprinting", "Policy confirmation"].map((item) => (
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
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Create your account</h2>
                  <p className="text-sm text-zinc-500">Start earning with a clean, premium onboarding flow.</p>
                </div>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Full name</span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-2xl border border-white/8 bg-white/4 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00e6c3]/40 focus:ring-1 focus:ring-[#00e6c3]/40"
                    />
                  </div>
                </label>

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

                <label className="flex items-start gap-3 rounded-2xl tap-badge px-4 py-4">
                  <input
                    id="policy-agreement"
                    type="checkbox"
                    required
                    checked={agreedToPolicies}
                    onChange={(e) => setAgreedToPolicies(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/15 bg-white/5 text-[#00e6c3] focus:ring-[#00e6c3]/40"
                  />
                  <span className="text-sm text-zinc-400 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="font-bold text-[#00e6c3] hover:text-[#7dffe7]">Terms</Link>,{" "}
                    <Link href="/privacy" className="font-bold text-[#00e6c3] hover:text-[#7dffe7]">Privacy Policy</Link>,{" "}
                    <Link href="/cookies" className="font-bold text-[#00e6c3] hover:text-[#7dffe7]">Cookie Policy</Link>, and{" "}
                    <Link href="/affiliate" className="font-bold text-[#00e6c3] hover:text-[#7dffe7]">Affiliate Disclosure</Link>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-5 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading ? "Creating account..." : "Create account"}</span>
                </button>
              </form>

              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-xs text-zinc-600 font-semibold">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <GoogleSignInButton label="Sign up with Google" />

              <div className="rounded-2xl border border-[#00e6c3]/15 bg-[#00e6c3]/8 px-4 py-4 text-sm text-zinc-300 leading-relaxed">
                <div className="flex items-center gap-2 text-[#8cf8e9] font-black uppercase tracking-[0.24em] text-[10px]">
                  <MailCheck className="w-3.5 h-3.5" />
                  Verification required before access
                </div>
                <p className="mt-2 text-zinc-400">
                  TapCash sends you to a verification step first. That keeps fake signups out and helps the real rewards flow stay clean.
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link href="/auth/signin" className="font-bold text-[#00e6c3] hover:text-[#7dffe7]">
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
