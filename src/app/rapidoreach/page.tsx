"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ConversionStrip from "@/components/ConversionStrip";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Loader2,
  ShieldCheck,
  Sparkles,
  Lock,
  CircleGauge,
} from "lucide-react";

export default function RapidoReachPage() {
  const { user, loading } = useAuth();
  const isVerified = !!user?.emailVerified;
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user || !isVerified) {
      return;
    }

    let cancelled = false;

    const fetchIframeUrl = async () => {
      try {
        setFetching(true);
        setLoadError(null);

        const idToken = await user.getIdToken();
        const res = await fetch(`/api/rapidoreach/iframe-url?userId=${user.uid}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to load RapidoReach iframe URL (${res.status})`);
        }

        const data = await res.json();
        if (!cancelled) {
          if (data.iframeUrl) {
            setIframeUrl(data.iframeUrl);
          } else {
            throw new Error("Missing iframe URL from provider response");
          }
        }
      } catch (error) {
        console.error("Error fetching RapidoReach iframe URL", error);
        if (!cancelled) {
          setIframeUrl(null);
          setLoadError("The RapidoReach offerwall could not be loaded right now.");
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    };

    fetchIframeUrl();

    return () => {
      cancelled = true;
    };
  }, [user, isVerified]);

  const trustPoints = useMemo(
    () => [
      {
        icon: ShieldCheck,
        title: "Server-verified access",
        text: "Only authenticated users get a signed provider URL.",
      },
      {
        icon: BadgeCheck,
        title: "Ledger-backed rewards",
        text: "Credits are appended by backend postback only.",
      },
      {
        icon: Activity,
        title: "Fraud signals logged",
        text: "Clicks, IPs, fingerprints, and timestamps stay auditable.",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen text-white tap-shell">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] items-start">
          <section className="space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full tap-badge text-[10px] font-black uppercase tracking-[0.28em] text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-[#00e6c3]" />
                Premium offerwall
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.92] tap-gradient-text font-display">
                  Open the offerwall and start earning from a cleaner, trusted flow.
                </h1>
                <p className="text-zinc-400 max-w-xl text-sm md:text-base leading-relaxed">
                  RapidoReach opens inside TapCash with a signed UID, server-side verification, and manual payout control. The UI stays calm, premium, and transparent.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="tap-card rounded-[1.5rem] p-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-3 text-[#00e6c3]">
                  <Lock className="w-5 h-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Signed session</p>
                <p className="mt-2 text-sm text-zinc-200 font-medium leading-relaxed">Only authenticated users load a provider URL.</p>
              </div>
              <div className="tap-card rounded-[1.5rem] p-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-3 text-[#7aa7ff]">
                  <CircleGauge className="w-5 h-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Fast session</p>
                <p className="mt-2 text-sm text-zinc-200 font-medium leading-relaxed">The offerwall loads inside a cleaner, quieter shell.</p>
              </div>
              <div className="tap-card rounded-[1.5rem] p-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-3 text-[#8cf8e9]">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Auditable path</p>
                <p className="mt-2 text-sm text-zinc-200 font-medium leading-relaxed">Clicks, callbacks, and credits are tracked server-side.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
              >
                Back to dashboard
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {trustPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="tap-card rounded-[1.5rem] p-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-3 text-[#00e6c3]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">{item.title}</p>
                    <p className="mt-2 text-sm text-zinc-200 font-medium leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="tap-card rounded-[1.75rem] p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00e6c3] to-[#3a7bff] flex items-center justify-center text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]">
                  <CircleGauge className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Session overview</p>
                  <p className="text-xs text-zinc-500">UID signing, provider loading, and ledger-ready completion flow.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/4 border border-white/6 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">User experience</p>
                  <p className="mt-2 text-sm text-zinc-200">A polished shell with visible loading and fallback states.</p>
                </div>
                <div className="rounded-2xl bg-white/4 border border-white/6 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Security model</p>
                  <p className="mt-2 text-sm text-zinc-200">The backend verifies access before any reward is created.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="wall" className="tap-card rounded-[2rem] overflow-hidden min-h-[72vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/5 bg-white/3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">RapidoReach</p>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white">Survey wall</h2>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full tap-badge text-xs font-bold text-zinc-300">
                <Lock className="w-4 h-4 text-[#00e6c3]" />
                Signed session
              </div>
            </div>

            <div className="flex-grow">
              {loading || fetching ? (
                <div className="h-full min-h-[60vh] flex items-center justify-center px-8 text-center">
                  <div className="space-y-4">
                    <Loader2 className="w-10 h-10 text-[#00e6c3] animate-spin mx-auto" />
                    <div>
                      <p className="text-lg font-bold text-white">Preparing secure offerwall</p>
                      <p className="text-sm text-zinc-500">Verifying your session and loading provider credentials.</p>
                    </div>
                  </div>
                </div>
              ) : !user ? (
                <div className="h-full min-h-[60vh] flex items-center justify-center p-8 text-center">
                  <div className="max-w-md space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-black text-white">Sign in required</h3>
                    <p className="text-zinc-500 text-sm">You must sign in before RapidoReach can open for your account.</p>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-5 py-3 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                    >
                      Sign in
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : !isVerified ? (
                <div className="h-full min-h-[60vh] flex items-center justify-center p-8 text-center">
                  <div className="max-w-md space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-[#00e6c3]" />
                    </div>
                    <h3 className="text-xl font-black text-white">Email verification required</h3>
                    <p className="text-zinc-500 text-sm">The offerwall stays locked until your inbox is verified.</p>
                    <Link
                      href="/auth/verify-email?next=/rapidoreach"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-5 py-3 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                    >
                      Verify email
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : loadError ? (
                <div className="h-full min-h-[60vh] flex items-center justify-center p-8 text-center">
                  <div className="max-w-md space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-black text-white">Offerwall unavailable</h3>
                    <p className="text-zinc-400 text-sm">{loadError}</p>
                    <p className="text-zinc-600 text-xs leading-relaxed">
                      If this continues, the provider may be rate limiting or there may be no active inventory for your profile.
                    </p>
                  </div>
                </div>
              ) : iframeUrl ? (
                <iframe
                  src={iframeUrl}
                  className="w-full h-[78vh] min-h-[780px] border-0 bg-black"
                  frameBorder="0"
                  scrolling="yes"
                  name="RewardsCenter"
                  title="RapidoReach Rewards Center"
                />
              ) : (
                <div className="h-full min-h-[60vh] flex items-center justify-center p-8 text-center">
                  <div className="space-y-3">
                    <Loader2 className="w-8 h-8 text-[#00e6c3] animate-spin mx-auto" />
                    <p className="text-zinc-300 text-sm">Loading RapidoReach offerwall...</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {!loading && user && iframeUrl && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-zinc-500">
                Stay inside TapCash while the embedded wall loads. Completed offers are credited only after the backend verifies the callback and writes the ledger.
              </p>
            </div>

            <ConversionStrip
              eyebrow="Keep earning"
              title="More offers live in the dashboard, where every click becomes a tracked ledger event."
              description="Return to TapCash after completing surveys to keep your streak, referral, and payout flow moving forward."
              primaryHref="/dashboard"
              primaryLabel="Back to dashboard"
              secondaryHref="/referrals"
              secondaryLabel="Invite friends"
              variant="private"
              bullets={["Offerwall access", "Ledger-backed crediting", "Manual payout controls"]}
            />
          </div>
        )}
      </main>
    </div>
  );
}
