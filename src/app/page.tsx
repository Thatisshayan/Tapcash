"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OfferCard from "@/components/OfferCard";
import Header from "@/components/Header";
import { Offer } from "@/types/offer";
import Link from "next/link";
import { Sparkles, Trophy, Flame, UserCheck, ArrowRight, Wallet, Users, ArrowUpRight, Coins } from "lucide-react";

const MOCK_OFFERS: Offer[] = [
  {
    id: "mock-survey-1",
    title: "Complete Consumer Habits Survey",
    description: "Share your daily shopping opinion and earn coins instantly.",
    payout: 150,
    clickUrl: "#",
    provider: "Lootably",
    category: "Surveys",
  },
  {
    id: "mock-game-1",
    title: "Download Raid: Shadow Legends",
    description: "Build your army in an epic fantasy RPG with stunning graphics.",
    payout: 800,
    clickUrl: "#",
    provider: "Lootably",
    category: "Games",
  },
  {
    id: "mock-video-1",
    title: "Watch 3 Video Advertisements",
    description: "Watch short video ads and earn rewards in the background.",
    payout: 25,
    clickUrl: "#",
    provider: "Lootably",
    category: "Videos",
  },
];

export default function OffersPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time Firestore user profile and wallet changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      },
      (err) => {
        console.error("Firestore user profile subscription error:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch real offers from our upgraded Lootably API v2 route
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pass userId if authenticated, otherwise use a temporary/preview id
        const uid = user ? user.uid : "preview-user-id";
        const response = await fetch(`/api/offers?userId=${uid}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch offers from Lootably API");
        }
        
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : data.offers || []);
      } catch (err) {
        console.error("Error fetching offers:", err);
        setError("Failed to fetch live offers. Showing featured tasks.");
        setOffers(MOCK_OFFERS);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOffers();
    }
  }, [user, authLoading]);

  const handleEarn = async (offer: Offer) => {
    if (!user) {
      alert("Please sign up or sign in to start earning coins!");
      return;
    }

    try {
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          offerId: offer.id,
          provider: "lootably",
        }),
      });
    } catch (err) {
      console.error("Error logging click:", err);
    }

    if (offer.clickUrl && offer.clickUrl !== "#") {
      window.open(offer.clickUrl, "_blank");
    } else {
      alert("Opening mock offer. In a production environment, this redirects to the advertiser tracking URL!");
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {user ? (
          /* ================= AUTHENTICATED USER VIEW ================= */
          <div className="space-y-10">
            {/* Welcoming Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Welcome Card */}
              <div className="lg:col-span-2 relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 flex flex-col justify-between group">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] group-hover:bg-emerald-500/10 transition-all duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    <span>Welcome Back, Earn Active</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    Hello, {profile?.displayName || "Explorer"}!
                  </h1>
                  <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
                    Complete any active tasks, surveys, or watch videos on our Lootably Offerwall below to start filling your coin balance.
                  </p>
                </div>

                <div className="relative flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-zinc-900/60">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Daily Streak: <strong>3 Days</strong></span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span>User Rank: <strong>Silver Earner</strong></span>
                  </div>
                </div>
              </div>

              {/* Live Wallet & Referral Card */}
              <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 flex flex-col justify-between group">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px]" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-zinc-300">Live Wallet</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Synced
                  </span>
                </div>

                <div className="relative my-6">
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight leading-none">
                    {(profile?.wallet?.balance || 0).toLocaleString()}
                  </p>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5">
                    Available Coins
                  </p>
                </div>

                <div className="relative">
                  <Link
                    href="/referrals"
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-white text-xs font-extrabold transition duration-200 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Invite Friends (20% passive)</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Offerwall Section */}
            <div className="space-y-6">
              <div className="flex items-end justify-between border-b border-zinc-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Active Offers</h2>
                  <p className="text-zinc-500 text-sm mt-1">Complete these verified tasks to gain coins</p>
                </div>
                <span className="text-xs font-semibold text-zinc-500 tracking-wide">
                  Showing {offers.length} Tasks
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 animate-pulse space-y-4">
                      <div className="h-5 bg-zinc-900 rounded w-1/3" />
                      <div className="h-7 bg-zinc-900 rounded w-3/4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-zinc-900 rounded w-full" />
                        <div className="h-4 bg-zinc-900 rounded w-5/6" />
                      </div>
                      <div className="h-10 bg-zinc-900 rounded w-full pt-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {error && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 text-sm">
                      {error}
                    </div>
                  )}
                  {offers.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950/20 border border-zinc-900 border-dashed rounded-3xl">
                      <p className="text-zinc-400 font-bold">No active offers available in your country right now.</p>
                      <p className="text-zinc-600 text-sm mt-1">Please check back in a few minutes!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {offers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} onEarn={() => handleEarn(offer)} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* ================= UNAUTHENTICATED HERO VIEW ================= */
          <div className="space-y-16 py-8 md:py-16">
            {/* Premium Hero Banner */}
            <div className="relative text-center max-w-3xl mx-auto space-y-6">
              {/* Glowing decorative backgrounds */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

              <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest leading-none">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Next-Gen Reward Portal</span>
              </span>

              <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
                Earn Cash Effortlessly Completing Fast Tasks
              </h1>
              
              <p className="text-zinc-400 text-base sm:text-xl max-w-xl mx-auto leading-relaxed">
                Connect your account, complete surveys, try apps, watch videos, and cash out instantly. Join the premium rewards network today.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                >
                  <span>Start Earning Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-8 py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-white font-bold text-base rounded-2xl transition duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-8 border-t border-zinc-950">
              {[
                { title: "Create Your Profile", desc: "Sign up with your email in under 30 seconds." },
                { title: "Choose High Payouts", desc: "Select high-value offers from the active wall." },
                { title: "Withdraw Real Coins", desc: "Redeem your coins for direct gift cards or cash." },
              ].map((step, index) => (
                <div key={step.title} className="bg-zinc-950/30 border border-zinc-900/60 p-6 rounded-2xl relative">
                  <span className="absolute top-4 right-4 text-emerald-500/20 text-4xl font-black leading-none">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Simulated Offers Preview */}
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight">Active Offers Preview</h2>
                <p className="text-zinc-500 text-sm mt-1">Join to complete these tasks and earn payouts</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 grayscale-[40%] pointer-events-none select-none">
                {MOCK_OFFERS.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} onEarn={() => {}} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-zinc-900 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-zinc-600" />
            <span>&copy; {new Date().getFullYear()} TapCash. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-emerald-500 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy</Link>
            <Link href="/contact" className="hover:text-emerald-500 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}