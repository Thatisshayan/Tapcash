"use client";

import { useEffect, useState } from "react";
import { Activity, Loader2, Lock, ShieldCheck, Sparkles, BadgeCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";
import { rapidoReachTrustPoints } from "@shared/tapcash-content";

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

        if (!response.ok) throw new Error(`RapidoReach returned ${response.status}`);
        const data = (await response.json()) as { iframeUrl?: string };
        if (!cancelled) setIframeUrl(data.iframeUrl ?? null);
      } catch (loadError) {
        console.error("RapidoReach load failed:", loadError);
        if (!cancelled) {
          setIframeUrl(null);
          setError("The offerwall could not be loaded right now.");
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
    <div className="min-h-screen bg-[#050813] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <MotionWrap>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-[#18d9ff]" />
                Offerwall access
              </div>

              <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-white md:text-6xl">
                A cleaner way to open RapidoReach and keep the reward flow visible.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                The session is still verified server-side, but the shell is calmer, more intentional, and easier to scan on mobile.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {rapidoReachTrustPoints.map((point) => (
                  <div key={point.title} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                    <p className="mt-3 text-sm font-semibold text-white">{point.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{point.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton href="/dashboard" label="Back to dashboard" />
                <CTAButton href="/cashout" label="Review cashout" variant="secondary" />
              </div>

              <PageShell
                eyebrow="Session model"
                title="Open the wall with a signed UID."
                description="If the URL cannot be signed, the page stays honest with an explicit fallback instead of pretending the wall is ready."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Access" value="Signed" detail="Authenticated only" />
                  <StatCard label="Credits" value="Ledgered" detail="Server-side resolution" />
                  <StatCard label="Audit" value="Retained" detail="Fraud signals stored" />
                </div>
              </PageShell>
            </MotionWrap>
          </div>

          <MotionWrap delay={0.08}>
            <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">RapidoReach</p>
                  <h2 className="text-lg font-black text-white">Survey wall</h2>
                </div>
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-300">
                  Server verified
                </span>
              </div>

              <div className="min-h-[72vh]">
                {loading || fetching ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div>
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#18d9ff]" />
                      <p className="mt-4 text-lg font-semibold text-white">Preparing the offerwall</p>
                      <p className="mt-2 text-sm text-zinc-400">Checking auth, signing the session, and loading the provider shell.</p>
                    </div>
                  </div>
                ) : !user ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div className="max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-[#18d9ff]">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-white">Sign in to continue</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        The offerwall stays behind authentication so the backend can sign the user session correctly.
                      </p>
                      <CTAButton href="/auth/signin" label="Sign in" className="mt-5" />
                    </div>
                  </div>
                ) : !isVerified ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div className="max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffc442]/10 text-[#ffc442]">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-white">Verify your email first</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        The offerwall is intentionally locked until inbox verification is complete.
                      </p>
                      <CTAButton href="/dashboard" label="Return to dashboard" className="mt-5" />
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div className="max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-[#18d9ff]">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-white">Offerwall unavailable</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{error}</p>
                      <CTAButton href="/dashboard" label="Back to dashboard" variant="secondary" className="mt-5" />
                    </div>
                  </div>
                ) : iframeUrl ? (
                  <iframe
                    title="RapidoReach offerwall"
                    src={iframeUrl}
                    className="h-[72vh] w-full border-0 bg-[#050813]"
                    allow="clipboard-write; fullscreen"
                  />
                ) : (
                  <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                    <div>
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#18d9ff]" />
                      <p className="mt-4 text-sm text-zinc-400">The wall is still warming up.</p>
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
