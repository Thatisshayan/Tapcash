"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { MotionWrap } from "@/components/PremiumUi";
import { rapidoReachTrustPoints } from "@shared/tapcash-content";

// Aurora gold gradient CTA (packages/tokens/tokens.json v3.0.0 gradients.goldPrimary).
const GOLD_CTA_STYLE = {
  background: "linear-gradient(135deg, #F0CE97, #D9B678)",
  color: "var(--color-bg-base)",
  boxShadow: "0 10px 30px rgba(217,182,120,0.28)",
} as const;

function GoldButton({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition-all hover:-translate-y-0.5 ${className}`}
      style={GOLD_CTA_STYLE}
    >
      {label}
    </a>
  );
}

function GhostButton({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition-all hover:-translate-y-0.5 ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        color: "var(--color-text-primary)",
        border: "1px solid rgba(245,243,239,0.09)",
      }}
    >
      {label}
    </a>
  );
}

export default function RapidoReachPage() {
  const { user, loading } = useAuth();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const isVerified = !!user?.emailVerified;

  useEffect(() => {
    if (!user || !isVerified) return;
    const currentUser = user;
    let cancelled = false;

    async function loadIframe() {
      try {
        setFetching(true);
        setError(null);
        const token = await currentUser.getIdToken();
        const response = await fetch(`/api/rapidoreach/iframe-url?userId=${currentUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = (await response.json()) as { iframeUrl?: string; code?: string; error?: string };
        if (!response.ok) {
          if (data.code === "CREDENTIALS_MISSING") {
            throw new Error("RapidoReach is not configured. Set RAPIDOREACH_APP_ID and RAPIDOREACH_APP_KEY to enable the offerwall.");
          }
          throw new Error(data.error || `RapidoReach returned ${response.status}`);
        }
        if (!cancelled) setIframeUrl(data.iframeUrl ?? null);
      } catch (loadError) {
        console.error("RapidoReach load failed:", loadError);
        if (!cancelled) {
          setIframeUrl(null);
          setError(loadError instanceof Error ? loadError.message : "The offerwall could not be loaded right now.");
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    loadIframe();
    return () => {
      cancelled = true;
    };
  }, [user, isVerified]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <MotionWrap>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em]"
                style={{ background: "rgba(217,182,120,0.1)", color: "var(--color-brand-green)" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Offerwall access
              </div>

              <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight md:text-6xl" style={{ color: "var(--color-text-primary)" }}>
                A cleaner way to open RapidoReach and keep the reward flow visible.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "var(--color-text-muted)" }}>
                The session is still verified server-side, but the shell is calmer, more intentional, and easier to scan on mobile.
              </p>

              {/* Trust points -- no bordered card panels; separated by spacing and
                  a plain hairline divider per tokens.json antiPatterns. */}
              <div className="mt-6 divide-y" style={{ borderColor: "rgba(245,243,239,0.09)" }}>
                {rapidoReachTrustPoints.map((point, i) => (
                  <div key={point.title} className={`py-4 ${i === 0 ? "pt-0" : ""}`} style={{ borderColor: "rgba(245,243,239,0.09)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {point.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <GoldButton href="/dashboard" label="Back to dashboard" />
                <GhostButton href="/cashout" label="Review cashout" />
              </div>

              <div className="mt-10 border-t pt-8" style={{ borderColor: "rgba(245,243,239,0.09)" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--color-text-muted)" }}>
                  Session model
                </p>
                <h2 className="mt-2 text-xl font-black" style={{ color: "var(--color-text-primary)" }}>
                  Open the wall with a signed UID.
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  If the URL cannot be signed, the page stays honest with an explicit fallback instead of pretending the wall is ready.
                </p>

                <div className="mt-5 grid gap-6 sm:grid-cols-3">
                  {[
                    { label: "Access", value: "Signed", detail: "Authenticated only" },
                    { label: "Credits", value: "Ledgered", detail: "Server-side resolution" },
                    { label: "Audit", value: "Retained", detail: "Fraud signals stored" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "var(--color-text-muted)" }}>
                        {stat.label}
                      </p>
                      <p className="mt-1 text-lg font-black" style={{ color: "var(--color-brand-green)" }}>
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "rgba(245,243,239,0.45)" }}>
                        {stat.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </MotionWrap>
          </div>

          <MotionWrap delay={0.08}>
            <div
              className="rounded-[2rem]"
              style={{ background: "rgba(255,255,255,0.02)", boxShadow: "var(--shadow-card-elevated)" }}
            >
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "rgba(245,243,239,0.06)" }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--color-text-muted)" }}>
                    RapidoReach
                  </p>
                  <h2 className="text-lg font-black" style={{ color: "var(--color-text-primary)" }}>
                    Survey wall
                  </h2>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ background: "rgba(255,255,255,0.04)", color: "var(--color-text-muted)" }}
                >
                  Server verified
                </span>
              </div>

              <div className="min-h-[72vh]">
                {loading || fetching ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div>
                      <Loader2 className="mx-auto h-10 w-10 animate-spin" style={{ color: "var(--color-brand-green)" }} />
                      <p className="mt-4 text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Preparing the offerwall
                      </p>
                      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Checking auth, signing the session, and loading the provider shell.
                      </p>
                    </div>
                  </div>
                ) : !user ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div className="max-w-md">
                      <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(217,182,120,0.1)", color: "var(--color-brand-green)" }}
                      >
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
                        Sign in to continue
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        The offerwall stays behind authentication so the backend can sign the user session correctly.
                      </p>
                      <GoldButton href="/auth/signin" label="Sign in" className="mt-5" />
                    </div>
                  </div>
                ) : !isVerified ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div className="max-w-md">
                      <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(108,92,224,0.12)", color: "var(--color-brand-purple)" }}
                      >
                        <Lock className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
                        Verify your email first
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        The offerwall is intentionally locked until inbox verification is complete.
                      </p>
                      <GhostButton href="/dashboard" label="Return to dashboard" className="mt-5" />
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div className="max-w-md">
                      <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(255,47,66,0.1)", color: "var(--color-hot-red)" }}
                      >
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
                        Offerwall unavailable
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        {error}
                      </p>
                      <GhostButton href="/dashboard" label="Back to dashboard" className="mt-5" />
                    </div>
                  </div>
                ) : iframeUrl ? (
                  <iframe
                    title="RapidoReach offerwall"
                    src={iframeUrl}
                    className="h-[72vh] w-full border-0"
                    style={{ background: "var(--color-bg-base)" }}
                    allow="clipboard-write; fullscreen"
                  />
                ) : (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div>
                      <Loader2 className="mx-auto h-10 w-10 animate-spin" style={{ color: "var(--color-brand-green)" }} />
                      <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                        The wall is still warming up.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </MotionWrap>
        </div>
      </main>
      <Footer />
    </div>
  );
}
