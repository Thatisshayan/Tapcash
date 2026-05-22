"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot, collection, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OfferCard from "@/components/OfferCard";
import Header from "@/components/Header";
import { Offer } from "@/types/offer";
import Link from "next/link";
import { 
  Sparkles, Trophy, Flame, UserCheck, ArrowRight, Wallet, Users, 
  ArrowUpRight, Coins, Loader2, Sparkle, AlertCircle, Play, CheckCircle, X
} from "lucide-react";

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

interface WheelSector {
  label: string;
  coins: number;
  color: string;
  bg: string;
}

const WHEEL_SECTORS: WheelSector[] = [
  { label: "10 COINS", coins: 10, color: "text-zinc-300", bg: "#18181b" },
  { label: "25 COINS", coins: 25, color: "text-emerald-400", bg: "#064e3b" },
  { label: "50 COINS", coins: 50, color: "text-blue-400", bg: "#1e3a8a" },
  { label: "100 COINS", coins: 100, color: "text-indigo-400", bg: "#312e81" },
  { label: "500 COINS", coins: 500, color: "text-amber-400", bg: "#78350f" }, // JACKPOT!
];

export default function OffersPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live Scrolling Ticker completions state
  const [tickerTxs, setTickerTxs] = useState<any[]>([]);

  // Daily Spin Wheel States
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [spinReward, setSpinReward] = useState<number | null>(null);
  const [spinEligible, setSpinEligible] = useState(true);

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
          const data = docSnap.data();
          setProfile(data);

          // Check if eligible for daily spin
          if (data.lastDailySpin) {
            const lastSpinDate = data.lastDailySpin.toDate ? data.lastDailySpin.toDate() : new Date(data.lastDailySpin);
            const now = new Date();
            const diffMs = now.getTime() - lastSpinDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            setSpinEligible(diffHours >= 24);
          } else {
            setSpinEligible(true);
          }
        }
      },
      (err) => {
        console.error("Firestore user profile subscription error:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to global real-time completed transaction alerts (Social Proof)
  useEffect(() => {
    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setTickerTxs(items);
    }, (err) => {
      console.log("Ticker feed error:", err);
    });

    return () => unsubscribe();
  }, []);

  // Fetch real offers from our upgraded Lootably API v2 route
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
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

  const handleSpinClick = async () => {
    if (spinning || !user) return;

    setSpinning(true);
    setSpinError(null);
    setSpinReward(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/tasks/daily-spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to spin daily reward wheel.");
      }

      // Calculate Rotation Deceleration Landing
      const sectorCount = WHEEL_SECTORS.length;
      const targetIndex = data.sectorIndex;
      
      // Each sector has an angle of 360 / 5 = 72 degrees.
      // Slices layout anticlockwise or clockwise. We align landing exactly on pointer (top, 0/360 degrees).
      const sectorAngle = 360 / sectorCount;
      const centerOfSectorOffset = sectorAngle / 2;
      
      // Calculate rotation. Spin around 6 full times (360 * 6 = 2160 deg) for high velocity,
      // then subtract target sector slice offset to land under top pointer
      const targetSectorRotation = 360 - (targetIndex * sectorAngle) - centerOfSectorOffset;
      const finalRotationAngle = (360 * 6) + targetSectorRotation;

      setSpinRotation(finalRotationAngle);

      // Decelerate and land in 4 seconds
      setTimeout(() => {
        setSpinReward(data.rewardCoins);
        setSpinning(false);
      }, 4000);

    } catch (err: any) {
      setSpinError(err.message || "Failed to execute daily spin.");
      setSpinning(false);
      setSpinRotation(0);
    }
  };

  const handleOpenSpinModal = () => {
    setShowSpinModal(true);
    setSpinRotation(0);
    setSpinReward(null);
    setSpinError(null);
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      <Header />

      {/* Real-time Global scrolling ticker (Social Proof) */}
      {tickerTxs.length > 0 && (
        <div className="w-full bg-emerald-950/20 border-b border-emerald-900/20 py-2.5 px-4 backdrop-blur-sm overflow-hidden relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 animate-marquee whitespace-nowrap text-xs font-semibold tracking-tight text-emerald-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="uppercase text-[9px] font-black tracking-widest text-emerald-500">Live Completed Activity:</span>
            </span>
            {tickerTxs.map((tx) => (
              <span key={tx.id} className="flex items-center gap-2">
                <span className="text-zinc-400">User_***</span>
                <span className="capitalize text-zinc-300 font-bold">{tx.type}</span>
                <span className="bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25 text-[10px] font-black leading-none text-emerald-400">
                  {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} Coins
                </span>
                <span className="text-zinc-700 font-bold">•</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {user ? (
          /* ================= AUTHENTICATED USER VIEW ================= */
          <div className="space-y-10">
            
            {/* Daily Spin Banner Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/20 via-zinc-950/30 to-[#0a0a0a] border border-emerald-500/15 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px]" />
              
              <div className="relative space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full tracking-wider leading-none">
                  <Sparkle className="w-3 h-3 animate-spin-slow" />
                  <span>Free Daily Credit</span>
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white">Daily Rewards Wheel</h2>
                <p className="text-zinc-400 text-sm max-w-xl">Spin our luck-based reward wheel once every 24 hours to win free coins added instantly to your wallet.</p>
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={handleOpenSpinModal}
                  className={`px-8 py-4 text-sm font-extrabold rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-2 uppercase tracking-wider ${
                    spinEligible 
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.02]" 
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{spinEligible ? "Spin Free Wheel" : "Spinned (Locked)"}</span>
                </button>
              </div>
            </div>

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

      {/* DAILY SPIN WHEEL SLIDE-UP DRAWER MODAL */}
      {showSpinModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => { if (!spinning) setShowSpinModal(false); }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-[#0a0a0a] border-t border-zinc-900 rounded-t-[2.5rem] p-6 shadow-[0_-12px_45px_rgba(0,0,0,0.6)] z-10 max-h-[95vh] overflow-y-auto">
            {/* Mobile native drawer bar grabber */}
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black leading-none">TapCash Wheel</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Win Free Daily Coins</p>
                </div>
              </div>
              <button
                disabled={spinning}
                onClick={() => setShowSpinModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {spinError && (
              <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{spinError}</span>
              </div>
            )}

            {/* PHYSICS-BASED SPINNING WHEEL CANVAS */}
            <div className="flex flex-col items-center justify-center space-y-8 py-4 relative">
              
              {/* Wheel Pointer arrow (At Top) */}
              <div className="absolute top-0 z-20 w-8 h-8 text-emerald-400 filter drop-shadow-[0_4px_10px_rgba(16,185,129,0.3)] flex items-center justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-emerald-400" />
              </div>

              {/* Rotating Circle Container */}
              <div className="w-64 h-64 rounded-full border-4 border-zinc-900 relative shadow-[0_0_40px_rgba(16,185,129,0.06)] overflow-hidden">
                
                {/* SVG Radial slices */}
                <svg
                  className="w-full h-full transform origin-center transition-transform duration-[4000ms] ease-out"
                  style={{
                    transform: `rotate(${spinRotation}deg)`,
                    transition: spinning ? "transform 4000ms cubic-bezier(0.15, 0.85, 0.2, 1)" : "none"
                  }}
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="48" fill="#09090b" />
                  
                  {WHEEL_SECTORS.map((sector, idx) => {
                    const sectorCount = WHEEL_SECTORS.length;
                    const angle = 360 / sectorCount;
                    const startAngle = idx * angle - 90; // Adjust starting point to top
                    const endAngle = (idx + 1) * angle - 90;

                    // Convert polar to cartesian coordinates for SVG path
                    const rad1 = (startAngle * Math.PI) / 180;
                    const rad2 = (endAngle * Math.PI) / 180;
                    const x1 = 50 + 48 * Math.cos(rad1);
                    const y1 = 50 + 48 * Math.sin(rad1);
                    const x2 = 50 + 48 * Math.cos(rad2);
                    const y2 = 50 + 48 * Math.sin(rad2);

                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const pathData = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    // Middle text coordinates
                    const textAngle = startAngle + angle / 2;
                    const textRad = (textAngle * Math.PI) / 180;
                    const textX = 50 + 26 * Math.cos(textRad);
                    const textY = 50 + 26 * Math.sin(textRad);

                    return (
                      <g key={idx}>
                        <path d={pathData} fill={sector.bg} stroke="#09090b" strokeWidth="0.8" />
                        <text
                          x={textX}
                          y={textY}
                          fill={sector.coins === 500 ? "#fbbf24" : "#a1a1aa"}
                          fontSize="4"
                          fontWeight="900"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                        >
                          {sector.coins === 500 ? "⭐ JACKPOT" : `+${sector.coins}`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center pin circle */}
                  <circle cx="50" cy="50" r="8" fill="#09090b" stroke="#18181b" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="3" fill="#10b981" />
                </svg>
              </div>

              {/* Reward Reveal */}
              <div className="text-center h-12 flex flex-col items-center justify-center">
                {spinning ? (
                  <p className="text-sm font-bold text-zinc-500 animate-pulse uppercase tracking-wider">Wheel is Rolling...</p>
                ) : spinReward !== null ? (
                  <div className="flex flex-col items-center animate-bounce-slow">
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">CONGRATULATIONS!</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle className="w-5.5 h-5.5 text-emerald-400 shrink-0" />
                      <span>+{spinReward.toLocaleString()} Coins</span>
                    </span>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-xs leading-relaxed max-w-[200px] font-semibold uppercase tracking-wider">TAP SPIN TO ROLL THE WHEEL</p>
                )}
              </div>

              {/* Claim Trigger Action */}
              <button
                onClick={handleSpinClick}
                disabled={spinning || spinReward !== null}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-black text-sm uppercase tracking-wider rounded-2xl transition shadow-lg shadow-emerald-500/10"
              >
                {spinning ? "SPINNING..." : spinReward !== null ? "CLAIMED!" : "SPIN FREE WHEEL"}
              </button>
            </div>
          </div>
        </div>
      )}

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