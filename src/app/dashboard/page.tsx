"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot, collection, query, limit, orderBy, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OfferCard from "@/components/OfferCard";
import Header from "@/components/Header";
import { Offer } from "@/types/offer";
import Link from "next/link";
import { 
  Sparkles, Trophy, Flame, UserCheck, ArrowRight, Wallet, Users, 
  ArrowUpRight, Coins, Loader2, Sparkle, AlertCircle, Play, CheckCircle, X,
  Check, Ticket, Award, BarChart3, Star, Gift, Crown, HelpCircle
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

// 7-day Login Streak Config
const STREAK_STEPS = [
  { day: 1, reward: 5, label: "+5 Coins" },
  { day: 2, reward: 10, label: "+10 Coins" },
  { day: 3, reward: 15, label: "+15 Coins" },
  { day: 4, reward: 20, label: "+20 Coins" },
  { day: 5, reward: 25, label: "+25 Coins" },
  { day: 6, reward: 50, label: "+50 Coins" },
  { day: 7, reward: 500, label: "Free Spin" },
];

export default function OffersPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [ledgerBalance, setLedgerBalance] = useState<number>(0);
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

  // Daily 1-Question Community Poll States (Eureka-style)
  const [hasVotedPoll, setHasVotedPoll] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [votingPoll, setVotingPoll] = useState(false);
  const [pollVotes, setPollVotes] = useState<number[]>([142, 89, 57, 34]); // Simulated live database counts

  // 7-Day Login Streak Tracker (Freecash-style)
  const [streakCount, setStreakCount] = useState<number>(3); // Fallback starter
  const [streakClaimedToday, setStreakClaimedToday] = useState<boolean>(false);
  const [claimingStreak, setClaimingStreak] = useState(false);
  const [streakMessage, setStreakMessage] = useState<string | null>(null);

  // Promo Code Redemption System States (Freecash-style)
  const [promoCode, setPromoCode] = useState("");
  const [claimingPromo, setClaimingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Daily Missions Progress & Claim States
  const [todayTransactions, setTodayTransactions] = useState<any[]>([]);
  const [claimingMission, setClaimingMission] = useState<string | null>(null);
  const [missionClaimMsg, setMissionClaimMessage] = useState<string | null>(null);

  // Subscribe to user transactions from today to compute gamification missions progress
  useEffect(() => {
    if (!user) {
      setTodayTransactions([]);
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "ledger_transactions"),
      where("userId", "==", user.uid),
      where("createdAt", ">=", todayStart)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => docSnap.data());
      setTodayTransactions(items);
    }, (err) => {
      console.log("Daily missions transactions load error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const handleClaimMission = async (missionId: string) => {
    if (!user || claimingMission) return;
    setClaimingMission(missionId);
    setMissionClaimMessage(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/tasks/claim-mission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ missionId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to claim mission reward.");
      }

      setMissionClaimMessage(`🎉 Reward claimed! +${data.rewardCoins} Coins added.`);
      setTimeout(() => setMissionClaimMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to claim mission reward.");
    } finally {
      setClaimingMission(null);
    }
  };

  // Community Poll configuration
  const pollQuestion = "What is your favorite cashout option on TapCash?";
  const pollOptions = [
    "PayPal Cash 💵",
    "Litecoin / Bitcoin 🪙",
    "Amazon Gift Cards 🛍️",
    "Steam & Robux Cards 🎮"
  ];

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

          // Fetch Streak count dynamically if saved
          if (data.streakCount !== undefined) {
            setStreakCount(data.streakCount);
          }
          if (data.lastStreakClaim) {
            const lastClaimDate = data.lastStreakClaim.toDate ? data.lastStreakClaim.toDate() : new Date(data.lastStreakClaim);
            const now = new Date();
            const lastClaimDay = new Date(lastClaimDate).setHours(0,0,0,0);
            const today = new Date(now).setHours(0,0,0,0);
            setStreakClaimedToday(lastClaimDay === today);
          }
        }
      },
      (err) => {
        console.error("Firestore user profile subscription error:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLedgerBalance(0);
      return;
    }

    const q = query(
      collection(db, "ledger_transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const total = snapshot.docs.reduce((sum, docSnap) => {
        const data = docSnap.data() as { balanceEffectCoins?: number };
        return sum + Number(data.balanceEffectCoins || 0);
      }, 0);
      setLedgerBalance(total);
    }, (err) => {
      console.log("Ledger balance subscription error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Load local poll state on start
  useEffect(() => {
    if (typeof window !== "undefined") {
      const voted = localStorage.getItem("tapcash_poll_voted_today");
      const option = localStorage.getItem("tapcash_poll_selected_option");
      if (voted === "true") {
        setHasVotedPoll(true);
        if (option !== null) {
          setSelectedPollOption(parseInt(option, 10));
        }
      }
    }
  }, []);

  // Subscribe to global real-time completed transaction alerts (Social Proof)
  useEffect(() => {
    const q = query(
      collection(db, "ledger_transactions"),
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
        const apiOffers = Array.isArray(data) ? data : data.offers || [];
        
        if (apiOffers.length === 0) {
          // If API returns empty (e.g. not configured yet), fallback gracefully without an error banner
          setOffers(MOCK_OFFERS);
        } else {
          setOffers(apiOffers);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
        // Silently fallback to mock tasks so the UI remains pristine
        setOffers(MOCK_OFFERS);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOffers().then(() => {
        // Prepend the RapidoReach Offerwall
        setOffers(prev => [
          {
            id: "rapidoreach-offerwall-1",
            title: "RapidoReach Surveys",
            description: "High paying premium surveys tailored to your profile. Complete unlimited surveys.",
            payout: 500, // Visual representation
            clickUrl: "/rapidoreach",
            provider: "RapidoReach",
            category: "Offerwall",
          },
          ...prev.filter(o => o.id !== "rapidoreach-offerwall-1")
        ]);
      });
    }
  }, [user, authLoading]);

  // Handle active offerwall redirects
  const handleEarn = async (offer: Offer) => {
    if (!user) {
      alert("Please sign up or sign in to start earning coins!");
      return;
    }

    try {
      const provider = offer.provider.toLowerCase();
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          offerId: offer.id,
          provider,
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

  // Claim 7-day Login Streak (Freecash-style)
  const handleClaimStreak = async () => {
    if (!user || streakClaimedToday || claimingStreak) return;

    setClaimingStreak(true);
    setStreakMessage(null);

    try {
      const isDay7 = streakCount === 7;
      const userRef = doc(db, "users", user.uid);

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("Profile not found.");

        const nextStreakCount = isDay7 ? 1 : streakCount + 1;
        transaction.update(userRef, {
          streakCount: nextStreakCount,
          lastStreakClaim: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      setStreakClaimedToday(true);
      if (isDay7) {
        setStreakCount(1);
        setStreakMessage("Day 7 streak tracked. Opening the daily wheel...");
        setTimeout(() => {
          setStreakMessage(null);
          handleOpenSpinModal();
        }, 3000);
      } else {
        setStreakCount((prev) => (prev === 7 ? 1 : prev + 1));
        setStreakMessage(`Day ${streakCount} streak tracked successfully.`);
        setTimeout(() => setStreakMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Streak claim error:", err);
      alert(err.message || "Failed to claim streak rewards.");
    } finally {
      setClaimingStreak(false);
    }
  };

  // Submit Eureka-style 1-Question Daily Poll
  const handleVotePoll = async (optionIdx: number) => {
    if (!user || hasVotedPoll || votingPoll) return;

    setVotingPoll(true);

    try {
      const userRef = doc(db, "users", user.uid);

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("Profile not found");

        transaction.update(userRef, {
          updatedAt: serverTimestamp(),
        });
      });

      setPollVotes((prev) => {
        const next = [...prev];
        next[optionIdx] += 1;
        return next;
      });

      setSelectedPollOption(optionIdx);
      setHasVotedPoll(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("tapcash_poll_voted_today", "true");
        localStorage.setItem("tapcash_poll_selected_option", optionIdx.toString());
      }
    } catch (err: any) {
      console.error("Poll vote transaction failure:", err);
      alert("Failed to submit your vote. Please try again.");
    } finally {
      setVotingPoll(false);
    }
  };

  // Claim Promo Codes (Freecash-style)
  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || claimingPromo || !promoCode.trim()) return;

    setClaimingPromo(true);
    setPromoMessage(null);
    setPromoError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: promoCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to redeem promo code.");
      }

      setPromoMessage(`🎉 Promo claimed successfully! +${data.rewardCoins} Coins credited.`);
      setPromoCode("");
      setTimeout(() => setPromoMessage(null), 5000);

    } catch (err: any) {
      setPromoError(err.message || "Redemption failed.");
    } finally {
      setClaimingPromo(false);
    }
  };

  // Secure Weighted Reward Roller for Daily Wheel
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

      const sectorCount = WHEEL_SECTORS.length;
      const targetIndex = data.sectorIndex;
      const sectorAngle = 360 / sectorCount;
      const centerOfSectorOffset = sectorAngle / 2;
      
      const targetSectorRotation = 360 - (targetIndex * sectorAngle) - centerOfSectorOffset;
      const finalRotationAngle = (360 * 6) + targetSectorRotation;

      setSpinRotation(finalRotationAngle);

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

  // Real-time PrizeRebel-style VIP Loyalty Tier computation
  const userBalance = ledgerBalance;
  let vipTier = "Bronze";
  let vipGlowColor = "shadow-zinc-500/10 border-zinc-800";
  let vipTextColor = "text-zinc-400";
  let nextTierThreshold = 1000;
  let prevTierThreshold = 0;

  if (userBalance < 1000) {
    vipTier = "Bronze VIP";
    vipGlowColor = "shadow-amber-900/10 border-amber-950/40";
    vipTextColor = "text-amber-600";
    nextTierThreshold = 1000;
    prevTierThreshold = 0;
  } else if (userBalance < 5000) {
    vipTier = "Silver VIP";
    vipGlowColor = "shadow-zinc-500/10 border-zinc-700/50";
    vipTextColor = "text-zinc-300";
    nextTierThreshold = 5000;
    prevTierThreshold = 1000;
  } else if (userBalance < 25000) {
    vipTier = "Gold VIP";
    vipGlowColor = "shadow-yellow-500/10 border-yellow-500/20";
    vipTextColor = "text-yellow-400 animate-pulse";
    nextTierThreshold = 25000;
    prevTierThreshold = 5000;
  } else if (userBalance < 100000) {
    vipTier = "Platinum VIP";
    vipGlowColor = "shadow-teal-500/20 border-teal-500/30";
    vipTextColor = "text-teal-400 font-extrabold";
    nextTierThreshold = 100000;
    prevTierThreshold = 25000;
  } else {
    vipTier = "Diamond VIP";
    vipGlowColor = "shadow-emerald-500/30 border-emerald-400/40 bg-gradient-to-tr from-emerald-950/20 via-zinc-950/30 to-black";
    vipTextColor = "text-emerald-300 font-black animate-bounce-slow";
    nextTierThreshold = 100000;
    prevTierThreshold = 100000;
  }

  const vipProgressPct = userBalance >= 100000 
    ? 100 
    : Math.min(100, Math.max(0, ((userBalance - prevTierThreshold) / (nextTierThreshold - prevTierThreshold)) * 100));

  // Simulated Daily Earners Leaderboard (Freecash-style)
  const leaderboardEarners = [
    { rank: 1, name: "Alpha_Earner", coins: 42800, isGold: true },
    { rank: 2, name: "CryptoCoiner", coins: 28900, isSilver: true },
    { rank: 3, name: "TapTastic", coins: 19450, isBronze: true },
    { rank: 4, name: "SurveyQueen", coins: 14200 },
    { rank: 5, name: "LootLord", coins: 11050 }
  ];

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
              
              {/* Column 1 & 2: Primary Content Area */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Welcome Card & 7-Day Login Streak Grid */}
                <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 space-y-8">
                  {/* Title and user stats */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900/60 pb-6">
                    <div>
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-4 h-4 animate-spin-slow" />
                        <span>Welcome Back, Earn Active</span>
                      </span>
                      <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                        Hello, {profile?.displayName || "Explorer"}!
                      </h1>
                      {profile?.email && (
                        <p className="text-zinc-500 text-xs font-semibold mt-1">
                          ✉️ Logged in via: <span className="text-emerald-500/80 font-bold">{profile.email}</span>
                        </p>
                      )}
                    </div>
                    {/* Tiny stats & Level */}
                    <div className="flex flex-col gap-3 self-start w-full sm:w-auto">
                      <div className="flex items-center gap-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl px-4 py-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>Streak: <strong className="text-white">{streakCount}/7 Days</strong></span>
                        </div>
                        <div className="w-1 h-3 bg-zinc-800" />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <span>VIP: <strong className="text-emerald-400">{vipTier}</strong></span>
                        </div>
                        <div className="w-1 h-3 bg-zinc-800" />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                          <Star className="w-4 h-4 text-blue-400" />
                          <span>Level: <strong className="text-blue-400">{Math.floor((profile?.xp || 0) / 1000) + 1}</strong></span>
                        </div>
                      </div>
                      
                      {/* XP Progress Bar */}
                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl px-4 py-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">XP Progress</span>
                          <span className="text-[10px] font-black text-blue-400">{((profile?.xp || 0) % 1000).toLocaleString()} / 1,000 XP</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" 
                            style={{ width: `${(((profile?.xp || 0) % 1000) / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Login Streak tracker (Freecash-style) */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">7-Day Login Streak</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Log in daily to claim scaling coin rewards. Complete Day 7 to claim a free jackpot roll!</p>
                      </div>
                      <button
                        onClick={handleClaimStreak}
                        disabled={streakClaimedToday || claimingStreak}
                        className={`px-5 py-2.5 text-xs font-black rounded-xl uppercase tracking-wider shrink-0 self-start sm:self-auto transition duration-200 ${
                          streakClaimedToday
                            ? "bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/10 hover:scale-[1.02]"
                        }`}
                      >
                        {claimingStreak ? "Claiming..." : streakClaimedToday ? "Streak Claimed Today" : "Claim Daily Reward"}
                      </button>
                    </div>

                    {streakMessage && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl animate-fadeIn">
                        {streakMessage}
                      </div>
                    )}

                    {/* Streak steps visual grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
                      {STREAK_STEPS.map((step) => {
                        const isCompleted = step.day < streakCount;
                        const isActive = step.day === streakCount && !streakClaimedToday;
                        const isCurrentDayNotClaimed = step.day === streakCount && streakClaimedToday;
                        const isLocked = step.day > streakCount || isCurrentDayNotClaimed;

                        let cardBg = "bg-zinc-900/30 border-zinc-900";
                        let textClass = "text-zinc-500";
                        let numberBg = "bg-zinc-900 text-zinc-600";

                        if (isCompleted) {
                          cardBg = "bg-emerald-950/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.03)]";
                          textClass = "text-emerald-400 font-extrabold";
                          numberBg = "bg-emerald-500 text-black";
                        } else if (isActive) {
                          cardBg = "bg-zinc-900 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)] animate-pulse";
                          textClass = "text-emerald-300 font-black";
                          numberBg = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                        } else if (isLocked) {
                          cardBg = "bg-zinc-950/20 border-zinc-900 opacity-60";
                          textClass = "text-zinc-600";
                          numberBg = "bg-zinc-900/50 text-zinc-700";
                        }

                        return (
                          <div key={step.day} className={`border rounded-2xl p-3.5 flex flex-col items-center justify-between text-center gap-3 transition-all duration-300 ${cardBg}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${numberBg}`}>
                              {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.day}
                            </span>
                            <div className="flex flex-col items-center">
                              <span className={`text-xs font-black ${textClass}`}>{step.label}</span>
                              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Day {step.day}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Daily Missions & Battle Pass Board */}
                <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 space-y-6 animate-fadeIn">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none" />
                  
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full tracking-wider leading-none">
                        <Trophy className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>TapCash Battle Pass • Season 1</span>
                      </span>
                      <h3 className="text-xl font-black tracking-tight text-white mt-1">Daily Missions</h3>
                      <p className="text-xs text-zinc-500">Complete tasks daily to unlock bonus coin caches. Resets at 00:00 UTC.</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end shrink-0 text-left sm:text-right">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        {((hasVotedPoll || todayTransactions.some(tx => tx.type === "community_poll")) ? 1 : 0) + 
                         (todayTransactions.some(tx => ["task_completed", "offer", "survey", "offerwall", "daily_spin"].includes(tx.type)) ? 1 : 0) + 
                         ((todayTransactions.filter(tx => tx.status === "completed" && tx.amount > 0).reduce((sum, tx) => sum + (tx.amount || 0), 0) >= 1000) ? 1 : 0)}/3 Completed
                      </span>
                      <span className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-widest">
                        {((profile?.claimedMissions?.[new Date().toISOString().split("T")[0]]?.["poll_connoisseur"] === true) ? 1 : 0) + 
                         ((profile?.claimedMissions?.[new Date().toISOString().split("T")[0]]?.["survey_explorer"] === true) ? 1 : 0) + 
                         ((profile?.claimedMissions?.[new Date().toISOString().split("T")[0]]?.["high_earner"] === true) ? 1 : 0)}/3 Claimed
                      </span>
                    </div>
                  </div>

                  {/* Battle Pass Main Progress Bar */}
                  <div className="space-y-2.5 bg-zinc-900/15 border border-zinc-900/40 p-4 rounded-2xl">
                    {(() => {
                      const isPollCompleted = hasVotedPoll || todayTransactions.some(tx => tx.type === "community_poll");
                      const isSurveyCompleted = todayTransactions.some(tx => ["task_completed", "offer", "survey", "offerwall", "daily_spin"].includes(tx.type));
                      const todayEarnedCoins = todayTransactions
                        .filter(tx => tx.status === "completed" && tx.amount > 0)
                        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
                      const isHighEarnerCompleted = todayEarnedCoins >= 1000;
                      
                      const completedCount = (isPollCompleted ? 1 : 0) + (isSurveyCompleted ? 1 : 0) + (isHighEarnerCompleted ? 1 : 0);
                      const progressPct = Math.round((completedCount / 3) * 100);

                      return (
                        <>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-bold uppercase tracking-wider">Pass Completion Progress</span>
                            <span className="text-emerald-400 font-black">{progressPct}%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {missionClaimMsg && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl animate-fadeIn">
                      {missionClaimMsg}
                    </div>
                  )}

                  {/* List of 3 Missions */}
                  <div className="space-y-4">
                    {(() => {
                      const todayStr = new Date().toISOString().split("T")[0];
                      const claimedMap = profile?.claimedMissions?.[todayStr] || {};

                      // Mission 1: Poll Connoisseur
                      const isPollCompleted = hasVotedPoll || todayTransactions.some(tx => tx.type === "community_poll");
                      const isPollClaimed = claimedMap["poll_connoisseur"] === true;

                      // Mission 2: Daily Survey Explorer
                      const isSurveyCompleted = todayTransactions.some(tx => ["task_completed", "offer", "survey", "offerwall", "daily_spin"].includes(tx.type));
                      const isSurveyClaimed = claimedMap["survey_explorer"] === true;

                      // Mission 3: High Earner Boost
                      const todayEarnedCoins = todayTransactions
                        .filter(tx => tx.status === "completed" && tx.amount > 0)
                        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
                      const isHighEarnerCompleted = todayEarnedCoins >= 1000;
                      const isHighEarnerClaimed = claimedMap["high_earner"] === true;

                      return (
                        <>
                          {/* Mission 1: Poll Connoisseur */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/10 border border-zinc-900/60 rounded-2xl gap-4 hover:border-zinc-850/50 transition duration-300">
                            <div className="space-y-2 flex-grow">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${isPollCompleted ? "bg-emerald-500 animate-ping-slow" : "bg-zinc-700"}`} />
                                <h4 className="text-sm font-extrabold text-zinc-100">1. Poll Connoisseur</h4>
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold rounded">
                                  +10 Coins
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500">Submit a vote in the general Community Poll today.</p>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-zinc-900 rounded-full overflow-hidden">
                                  <div className={`h-full ${isPollCompleted ? "bg-emerald-500" : "bg-zinc-800"}`} style={{ width: isPollCompleted ? "100%" : "0%" }} />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500">{isPollCompleted ? "1/1" : "0/1"}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleClaimMission("poll_connoisseur")}
                              disabled={claimingMission !== null || isPollClaimed || !isPollCompleted}
                              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${
                                isPollClaimed
                                  ? "bg-zinc-900/40 text-emerald-400/60 border border-zinc-850/60 cursor-not-allowed"
                                  : isPollCompleted
                                  ? "bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] shadow-md shadow-emerald-500/15"
                                  : "bg-zinc-900 text-zinc-500 border border-zinc-850 cursor-not-allowed"
                              }`}
                            >
                              {isPollClaimed ? "Claimed ✔" : claimingMission === "poll_connoisseur" ? "Claiming..." : isPollCompleted ? "Claim +10" : "In Progress"}
                            </button>
                          </div>

                          {/* Mission 2: Daily Survey Explorer */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/10 border border-zinc-900/60 rounded-2xl gap-4 hover:border-zinc-850/50 transition duration-300">
                            <div className="space-y-2 flex-grow">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${isSurveyCompleted ? "bg-emerald-500 animate-ping-slow" : "bg-zinc-700"}`} />
                                <h4 className="text-sm font-extrabold text-zinc-100">2. Daily Survey Explorer</h4>
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold rounded">
                                  +50 Coins
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500">Complete at least 1 Offer, Survey, or Wheel Spin today.</p>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-zinc-900 rounded-full overflow-hidden">
                                  <div className={`h-full ${isSurveyCompleted ? "bg-emerald-500" : "bg-zinc-800"}`} style={{ width: isSurveyCompleted ? "100%" : "0%" }} />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500">{isSurveyCompleted ? "1/1" : "0/1"}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleClaimMission("survey_explorer")}
                              disabled={claimingMission !== null || isSurveyClaimed || !isSurveyCompleted}
                              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${
                                isSurveyClaimed
                                  ? "bg-zinc-900/40 text-emerald-400/60 border border-zinc-850/60 cursor-not-allowed"
                                  : isSurveyCompleted
                                  ? "bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] shadow-md shadow-emerald-500/15"
                                  : "bg-zinc-900 text-zinc-500 border border-zinc-850 cursor-not-allowed"
                              }`}
                            >
                              {isSurveyClaimed ? "Claimed ✔" : claimingMission === "survey_explorer" ? "Claiming..." : isSurveyCompleted ? "Claim +50" : "In Progress"}
                            </button>
                          </div>

                          {/* Mission 3: High Earner Boost */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/10 border border-zinc-900/60 rounded-2xl gap-4 hover:border-zinc-850/50 transition duration-300">
                            <div className="space-y-2 flex-grow">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${isHighEarnerCompleted ? "bg-emerald-500 animate-ping-slow" : "bg-zinc-700"}`} />
                                <h4 className="text-sm font-extrabold text-zinc-100">3. High Earner Boost</h4>
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold rounded">
                                  +200 Coins
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500">Earn at least 1,000 Coins in total today from any task.</p>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-zinc-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (todayEarnedCoins / 1000) * 100)}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500">
                                  {todayEarnedCoins.toLocaleString()} / 1,000 Coins
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleClaimMission("high_earner")}
                              disabled={claimingMission !== null || isHighEarnerClaimed || !isHighEarnerCompleted}
                              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${
                                isHighEarnerClaimed
                                  ? "bg-zinc-900/40 text-emerald-400/60 border border-zinc-850/60 cursor-not-allowed"
                                  : isHighEarnerCompleted
                                  ? "bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] shadow-md shadow-emerald-500/15"
                                  : "bg-zinc-900 text-zinc-500 border border-zinc-850 cursor-not-allowed"
                              }`}
                            >
                              {isHighEarnerClaimed ? "Claimed ✔" : claimingMission === "high_earner" ? "Claiming..." : isHighEarnerCompleted ? "Claim +200" : "In Progress"}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Daily 1-Question Community Poll (Eureka-style) */}
                <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 space-y-6">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-900 pb-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full tracking-wider leading-none">
                        <BarChart3 className="w-3 h-3" />
                        <span>Daily poll • +10 Coins</span>
                      </span>
                      <h3 className="text-lg font-black tracking-tight text-white mt-1">{pollQuestion}</h3>
                    </div>
                    {hasVotedPoll && (
                      <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1 self-start sm:self-auto leading-none">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Vote Recorded</span>
                      </span>
                    )}
                  </div>

                  {!hasVotedPoll ? (
                    /* Active Poll Options to Vote */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {pollOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleVotePoll(idx)}
                          disabled={votingPoll}
                          className="w-full text-left p-4 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 hover:border-emerald-500/30 text-zinc-300 hover:text-white font-bold rounded-2xl transition duration-200 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>{option}</span>
                          <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Show results visual interactive bar chart */
                    <div className="space-y-4">
                      {(() => {
                        const totalVotes = pollVotes.reduce((a, b) => a + b, 0);
                        return pollOptions.map((option, idx) => {
                          const votes = pollVotes[idx];
                          const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                          const isSelected = selectedPollOption === idx;

                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className={isSelected ? "text-emerald-400 font-extrabold" : "text-zinc-400"}>
                                  {option} {isSelected && " (Your Vote)"}
                                </span>
                                <span className={isSelected ? "text-emerald-400 font-black" : "text-zinc-500"}>
                                  {percent}% ({votes.toLocaleString()} votes)
                                </span>
                              </div>
                              <div className="h-3 w-full bg-zinc-900/80 border border-zinc-900 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    isSelected 
                                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                                      : "bg-zinc-800"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                      <p className="text-[11px] text-zinc-600 font-semibold uppercase tracking-wider text-center mt-2">
                        Thanks for participating! Check back tomorrow for another general community question.
                      </p>
                    </div>
                  )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 4].map((i) => (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {offers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} onEarn={() => handleEarn(offer)} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>

              {/* Column 3: Sidebar Panel Area */}
              <div className="space-y-8">
                
                {/* Live Wallet Card */}
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
                    <p className="text-4xl font-black text-emerald-400 tracking-tight leading-none">
                      {userBalance.toLocaleString()}
                    </p>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5">
                      Available Coins
                    </p>
                  </div>

                  <div className="relative">
                    <Link
                      href="/referrals"
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-850 rounded-xl text-white text-xs font-extrabold transition duration-200 flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Invite Friends (20% passive)</span>
                    </Link>
                  </div>
                </div>

                {/* Tiered VIP Loyalty levels panel (PrizeRebel-style) */}
                <div className={`relative overflow-hidden bg-zinc-950/40 border rounded-3xl p-8 shadow-2xl transition-all duration-300 ${vipGlowColor}`}>
                  <div className="absolute top-0 right-0 w-20 h-24 bg-emerald-500/[0.01] pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-emerald-400">
                        <Award className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black leading-none">Loyalty Rank</h4>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">PrizeRebel-Style VIP</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-wider ${vipTextColor}`}>{vipTier}</span>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Tier Progress</span>
                      {userBalance >= 100000 ? (
                        <span className="text-emerald-400 font-extrabold">MAX LEVEL</span>
                      ) : (
                        <span className="text-zinc-400 font-bold">
                          {userBalance.toLocaleString()} / {nextTierThreshold.toLocaleString()} Coins
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/20 rounded-full transition-all duration-500"
                        style={{ width: `${vipProgressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 p-3.5 bg-zinc-900/10 border border-zinc-900 rounded-2xl text-[10px] text-zinc-500 leading-normal font-medium">
                    {userBalance < 1000 ? (
                      <span>Earn <strong>{(1000 - userBalance).toLocaleString()} more Coins</strong> to level up to <strong className="text-zinc-300">Silver VIP</strong> and claim lower cashout approval holds!</span>
                    ) : userBalance < 5000 ? (
                      <span>Earn <strong>{(5000 - userBalance).toLocaleString()} more Coins</strong> to reach <strong className="text-yellow-400">Gold VIP</strong> and receive a permanent <strong>+2% referral rate boost</strong>!</span>
                    ) : (
                      <span>You are a high-tier earner. Lower payouts manual hold limits are bypassed on your wallet!</span>
                    )}
                  </div>
                </div>

                {/* Secure Promo Code Redemption system (Freecash-style) */}
                <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-emerald-400">
                      <Gift className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black leading-none">Redeem Promo Code</h4>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Claim free custom coins</p>
                    </div>
                  </div>

                  <form onSubmit={handleRedeemPromo} className="space-y-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. WELCOME50"
                      className="w-full px-4 py-3 bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 text-xs font-black uppercase tracking-wider transition-all duration-200"
                    />
                    <button
                      type="submit"
                      disabled={claimingPromo || !promoCode.trim()}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition duration-200 shadow-md shadow-emerald-500/5 hover:shadow-emerald-500/15"
                    >
                      {claimingPromo ? "Redeeming..." : "Claim Coins"}
                    </button>
                  </form>

                  {promoMessage && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl animate-fadeIn">
                      {promoMessage}
                    </div>
                  )}

                  {promoError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl animate-fadeIn">
                      {promoError}
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-600 text-center leading-normal">
                    Promo codes are given out on our socials or inside community newsletters. Try code <strong className="text-emerald-500">WELCOME50</strong> or <strong className="text-emerald-500">EMERALDNEW</strong>!
                  </div>
                </div>

                {/* Daily Earners Leaderboard (Freecash-style) */}
                <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-emerald-400">
                      <Crown className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black leading-none">Daily Leaderboard</h4>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Today's top earners</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {leaderboardEarners.map((earner) => (
                      <div key={earner.rank} className="flex items-center justify-between p-2.5 bg-zinc-900/10 border border-zinc-900/40 rounded-2xl">
                        <div className="flex items-center gap-3">
                          {earner.isGold ? (
                            <span className="w-5.5 h-5.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-[10px] shadow-sm">
                              👑
                            </span>
                          ) : earner.isSilver ? (
                            <span className="w-5.5 h-5.5 rounded-full bg-zinc-300/10 border border-zinc-400/20 flex items-center justify-center text-zinc-300 font-extrabold text-[10px]">
                              2
                            </span>
                          ) : earner.isBronze ? (
                            <span className="w-5.5 h-5.5 rounded-full bg-amber-900/10 border border-amber-950/20 flex items-center justify-center text-amber-700 font-extrabold text-[10px]">
                              3
                            </span>
                          ) : (
                            <span className="w-5.5 h-5.5 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-[10px] font-black">
                              {earner.rank}
                            </span>
                          )}
                          <span className="text-xs text-zinc-300 font-extrabold">{earner.name}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-400">+{earner.coins.toLocaleString()} Coins</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

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
          <div 
            onClick={() => { if (!spinning) setShowSpinModal(false); }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
          />

          <div className="relative w-full max-w-md bg-[#0a0a0a] border-t border-zinc-900 rounded-t-[2.5rem] p-6 shadow-[0_-12px_45px_rgba(0,0,0,0.6)] z-10 max-h-[95vh] overflow-y-auto">
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

            <div className="flex flex-col items-center justify-center space-y-8 py-4 relative">
              <div className="absolute top-0 z-20 w-8 h-8 text-emerald-400 filter drop-shadow-[0_4px_10px_rgba(16,185,129,0.3)] flex items-center justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-emerald-400" />
              </div>

              <div className="w-64 h-64 rounded-full border-4 border-zinc-900 relative shadow-[0_0_40px_rgba(16,185,129,0.06)] overflow-hidden">
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
                    const startAngle = idx * angle - 90;
                    const endAngle = (idx + 1) * angle - 90;

                    const rad1 = (startAngle * Math.PI) / 180;
                    const rad2 = (endAngle * Math.PI) / 180;
                    const x1 = 50 + 48 * Math.cos(rad1);
                    const y1 = 50 + 48 * Math.sin(rad1);
                    const x2 = 50 + 48 * Math.cos(rad2);
                    const y2 = 50 + 48 * Math.sin(rad2);

                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const pathData = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

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

                  <circle cx="50" cy="50" r="8" fill="#09090b" stroke="#18181b" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="3" fill="#10b981" />
                </svg>
              </div>

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
            <Link href="/cookies" className="hover:text-emerald-500 transition">Cookies</Link>
            <Link href="/affiliate" className="hover:text-emerald-500 transition">Affiliate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

