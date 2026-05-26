"use client";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function RapidoReachPage() {
  const { user, loading } = useAuth();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchIframeUrl = async () => {
        try {
          setLoadError(null);
          const res = await fetch(`/api/rapidoreach/iframe-url?userId=${user.uid}`);
          if (!res.ok) {
            throw new Error(`Failed to load RapidoReach iframe URL (${res.status})`);
          }
          const data = await res.json();
          if (data.iframeUrl) {
            setIframeUrl(data.iframeUrl);
          } else {
            throw new Error("Missing iframe URL from provider response");
          }
        } catch (error) {
          console.error("Error fetching RapidoReach Iframe URL", error);
          setIframeUrl(null);
          setLoadError("The RapidoReach offerwall could not be loaded right now.");
        }
      };
      fetchIframeUrl();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col h-[calc(100vh-80px)]">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">
            RapidoReach Surveys
          </h1>
          <p className="text-zinc-400 text-sm">
            Complete high-paying surveys below. Coins will be automatically added to your wallet upon completion.
          </p>
        </div>

        <div className="flex-grow w-full bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden flex relative shadow-2xl">
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : !user ? (
            <div className="flex-grow flex items-center justify-center p-8 text-center">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-zinc-300">Sign In Required</h3>
                <p className="text-zinc-500 text-sm">You must be signed in to access the survey offerwall and earn coins.</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="flex-grow flex items-center justify-center p-8 text-center">
              <div className="max-w-md space-y-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">Offerwall unavailable</h3>
                <p className="text-zinc-500 text-sm">{loadError}</p>
                <p className="text-zinc-600 text-xs">
                  We fixed the UID and URL generation, so if this still appears the provider side is likely rate limiting or returning no active surveys.
                </p>
              </div>
            </div>
          ) : iframeUrl ? (
            <iframe 
              src={iframeUrl} 
              className="w-full h-full min-h-[800px] border-0" 
              frameBorder="0" 
              scrolling="yes" 
              name="RewardsCenter"
              title="RapidoReach Rewards Center"
            />
          ) : (
            <div className="flex-grow flex items-center justify-center p-8 text-center">
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-zinc-400 text-sm">Loading RapidoReach offerwall...</p>
              </div>
            </div>
          )}
        </div>
        {!loading && user && iframeUrl && (
          <a
            href={iframeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
          >
            Open offerwall in a new tab
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </main>
    </div>
  );
}
