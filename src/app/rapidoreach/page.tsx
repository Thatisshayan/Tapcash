"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowUpRight, Loader2, Lock, ShieldCheck, Sparkles, BadgeCheck } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function RapidoReachPage() {
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const motionProps = useMemo(
    () => ({
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [reduceMotion]
  );

  const isVerified = !!user?.emailVerified;

  useEffect(() => {
    if (!user || !isVerified) {
      return;
    }

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

        if (!response.ok) {
          throw new Error(`RapidoReach returned ${response.status}`);
        }

        const data = (await response.json()) as { iframeUrl?: string };
        if (!cancelled) {
          setIframeUrl(data.iframeUrl ?? null);
        }
      } catch (loadError) {
        console.error("RapidoReach load failed:", loadError);
        if (!cancelled) {
          setIframeUrl(null);
          setError("The offerwall could not be loaded right now.");
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    loadIframe();

    return () => {
      cancelled = true;
    };
  }, [user, isVerified]);

  const trustPoints = [
    {
      title: "Signed session",
      description: "Only authenticated users can request the provider URL.",
      icon: Lock,
    },
    {
      title: "Ledger-backed credits",
      description: "Reward completion still resolves on the server side.",
      icon: BadgeCheck,
    },
    {
      title: "Fraud signals retained",
      description: "Audit data stays visible for verification and review.",
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-[#040913] text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section {...motionProps} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#8cf8e9]">
              <Sparkles className="h-3.5 w-3.5" />
              Offerwall access
            </div>

            <div>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white md:text-6xl">
                A cleaner way to open RapidoReach and keep the reward flow visible.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                The session is still verified server-side, but the shell is calmer, more intentional, and easier to scan on mobile.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00e6c3]/10 text-[#8cf8e9]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{point.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{point.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3.5 text-sm font-black text-[#04101d]">
                Back to dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/cashout" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white">
                Review cashout
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Session model</p>
                  <p className="mt-2 text-2xl font-black text-white">Open the wall with a signed UID.</p>
                </div>
                <ShieldCheck className="h-6 w-6 text-[#8cf8e9]" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                If the URL cannot be signed, the page stays honest with an explicit fallback instead of pretending the wall is ready.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,14,24,0.96),rgba(5,8,16,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.38)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
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
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#00e6c3]" />
                    <p className="mt-4 text-lg font-semibold text-white">Preparing the offerwall</p>
                    <p className="mt-2 text-sm text-zinc-400">Checking auth, signing the session, and loading the provider shell.</p>
                  </div>
                </div>
              ) : !user ? (
                <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-[#8cf8e9]">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-2xl font-black text-white">Sign in to continue</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      The offerwall stays behind authentication so the backend can sign the user session correctly.
                    </p>
                    <Link href="/auth/signin" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#00e6c3] px-6 py-3.5 text-sm font-black text-[#04101d]">
                      Sign in
                    </Link>
                  </div>
                </div>
              ) : !isVerified ? (
                <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5c842]/10 text-[#f5c842]">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-2xl font-black text-white">Verify your email first</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      The offerwall is intentionally locked until inbox verification is complete.
                    </p>
                    <Link href="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#00e6c3] px-6 py-3.5 text-sm font-black text-[#04101d]">
                      Return to dashboard
                    </Link>
                  </div>
                </div>
              ) : error ? (
                <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-[#8cf8e9]">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-2xl font-black text-white">Offerwall unavailable</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{error}</p>
                    <Link href="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white">
                      Back to dashboard
                    </Link>
                  </div>
                </div>
              ) : iframeUrl ? (
                <iframe
                  title="RapidoReach offerwall"
                  src={iframeUrl}
                  className="h-[72vh] w-full border-0 bg-[#040913]"
                  allow="clipboard-write; fullscreen"
                />
              ) : (
                <div className="flex min-h-[72vh] items-center justify-center px-6 text-center">
                  <div>
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#00e6c3]" />
                    <p className="mt-4 text-sm text-zinc-400">The wall is still warming up.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
