"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Header from "@/components/Header";
import { Coins, Wallet, Landmark, X, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { 
  InteracLogo, TimsLogo, CTLogo, CineplexLogo, SDMLogo, 
  LitecoinLogo, PayPalLogo, BitcoinLogo, VisaLogo, SteamLogo, RobloxLogo 
} from "@/components/BrandLogos";

const LOGO_MAP: Record<string, React.ElementType> = {
  interac: InteracLogo,
  tim_hortons: TimsLogo,
  canadian_tire: CTLogo,
  cineplex: CineplexLogo,
  shoppers: SDMLogo,
  litecoin: LitecoinLogo,
  paypal: PayPalLogo,
  bitcoin: BitcoinLogo,
  visa: VisaLogo,
  steam: SteamLogo,
  roblox: RobloxLogo,
};

interface RewardMethod {
  id: string;
  name: string;
  minCoins: number;
  minUSD: number;
  badge: string;
  color: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
  destinationLabel: string;
  destinationPlaceholder: string;
  destinationType: string;
  logoDomain: string;
}

const REWARD_METHODS: RewardMethod[] = [
  {
    id: "interac",
    name: "Interac e-Transfer",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Direct Canadian Cash",
    color: "from-zinc-900 to-zinc-950 hover:border-yellow-500/30",
    textColor: "text-yellow-500",
    borderColor: "border-zinc-900",
    iconBg: "bg-yellow-500/10 border-yellow-500/20",
    destinationLabel: "Interac e-Transfer Email Address",
    destinationPlaceholder: "your-interac-email@domain.ca",
    destinationType: "email",
    logoDomain: "interac.ca",
  },
  {
    id: "tim_hortons",
    name: "Tim Hortons Gift Card",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Local Favorite",
    color: "from-zinc-900 to-zinc-950 hover:border-red-500/20",
    textColor: "text-red-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-white border-red-500/20",
    destinationLabel: "Delivery Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "timhortons.ca",
  },
  {
    id: "canadian_tire",
    name: "Canadian Tire Gift Card",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Outdoors & Home",
    color: "from-zinc-900 to-zinc-950 hover:border-red-600/20",
    textColor: "text-red-500",
    borderColor: "border-zinc-900",
    iconBg: "bg-white border-red-600/20",
    destinationLabel: "Delivery Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "canadiantire.ca",
  },
  {
    id: "cineplex",
    name: "Cineplex Gift Card",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Entertainment",
    color: "from-zinc-900 to-zinc-950 hover:border-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-[#0b1c54] border-blue-500/20",
    destinationLabel: "Delivery Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "cineplex.com",
  },
  {
    id: "shoppers",
    name: "Shoppers Drug Mart Card",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Wellness & Pharmacy",
    color: "from-zinc-900 to-zinc-950 hover:border-red-900/20",
    textColor: "text-red-300",
    borderColor: "border-zinc-900",
    iconBg: "bg-white border-red-900/20",
    destinationLabel: "Delivery Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "shoppersdrugmart.ca",
  },
  {
    id: "litecoin",
    name: "Litecoin LTC",
    minCoins: 2000,
    minUSD: 2.00,
    badge: "Lowest Fees",
    color: "from-zinc-900 to-zinc-950 hover:border-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    destinationLabel: "Litecoin (LTC) Address",
    destinationPlaceholder: "L...",
    destinationType: "text",
    logoDomain: "litecoin.org",
  },
  {
    id: "paypal",
    name: "PayPal Cash",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Popular",
    color: "from-zinc-900 to-zinc-950 hover:border-sky-500/20",
    textColor: "text-sky-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-white border-sky-500/20",
    destinationLabel: "PayPal Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "paypal.com",
  },
  {
    id: "bitcoin",
    name: "Bitcoin BTC",
    minCoins: 10000,
    minUSD: 10.00,
    badge: "Direct Crypto",
    color: "from-zinc-900 to-zinc-950 hover:border-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    destinationLabel: "Bitcoin (BTC) Address",
    destinationPlaceholder: "bc1...",
    destinationType: "text",
    logoDomain: "bitcoin.org",
  },
  {
    id: "visa",
    name: "Visa Prepaid",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Universal",
    color: "from-zinc-900 to-zinc-950 hover:border-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-white border-emerald-500/20",
    destinationLabel: "Delivery Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "visa.ca",
  },
  {
    id: "steam",
    name: "Steam Code",
    minCoins: 5000,
    minUSD: 5.00,
    badge: "Instant Key",
    color: "from-zinc-900 to-zinc-950 hover:border-indigo-500/20",
    textColor: "text-indigo-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-[#171a21] border-indigo-500/20",
    destinationLabel: "Delivery Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "steampowered.com",
  },
  {
    id: "roblox",
    name: "Roblox Robux",
    minCoins: 10000,
    minUSD: 10.00,
    badge: "Kids & Teens",
    color: "from-zinc-900 to-zinc-950 hover:border-rose-500/20",
    textColor: "text-rose-400",
    borderColor: "border-zinc-900",
    iconBg: "bg-white border-rose-500/20",
    destinationLabel: "Delivery Email Address",
    destinationPlaceholder: "you@example.com",
    destinationType: "email",
    logoDomain: "roblox.com",
  },
];

export default function CashoutStorePage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState<number>(0);

  // Modal / Bottom Sheet Drawer State
  const [activeMethod, setActiveMethod] = useState<RewardMethod | null>(null);
  const [selectedCoins, setSelectedCoins] = useState<number>(2000);
  const [destination, setDestination] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Subscribe to real-time balance
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().wallet?.balance || 0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenDrawer = (method: RewardMethod) => {
    setActiveMethod(method);
    setSelectedCoins(method.minCoins);
    setDestination("");
    setMessage(null);
  };

  const handleCloseDrawer = () => {
    if (submitting) return;
    setActiveMethod(null);
  };

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeMethod) return;

    if (balance < selectedCoins) {
      setMessage({ text: "Insufficient coin balance for this payout option.", type: "error" });
      return;
    }

    if (!destination.trim()) {
      setMessage({ text: "Please enter your transfer destination details.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const fingerprint = await getDeviceFingerprint();
      const token = await user.getIdToken();
      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountCoins: selectedCoins,
          method: activeMethod.id,
          destination: destination.trim(),
          deviceFingerprint: fingerprint,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit cashout request.");
      }

      setMessage({ text: `Success! ${selectedCoins.toLocaleString()} coins deducted. Your cashout is pending approval.`, type: "success" });
      setTimeout(() => {
        handleCloseDrawer();
      }, 2500);

    } catch (err: any) {
      console.error("Cashout request error:", err);
      setMessage({ text: err.message || "Network error. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 text-center backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Access Restricted</h1>
            <p className="text-zinc-500 text-sm mb-6">Please log in to your account to view the reward store.</p>
            <Link href="/auth/signin" className="inline-block px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition w-full">
              Sign In Now
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        {/* Page Title & Dashboard Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Reward Store</h1>
            <p className="text-zinc-500 text-sm mt-1">Exchange your accumulated TapCash coins for real cash & premium gift cards.</p>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 py-3.5 px-6 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Your Wallet</p>
              <p className="text-xl font-black text-emerald-400 tracking-tight mt-1">{balance.toLocaleString()} Coins</p>
            </div>
          </div>
        </div>

        {/* Brand Grid Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Select Cashout Method</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Pick from our secure, rapid redemption networks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REWARD_METHODS.map((method) => {
              const meetsMin = balance >= method.minCoins;
              return (
                <div
                  key={method.id}
                  onClick={() => handleOpenDrawer(method)}
                  className={`group relative overflow-hidden bg-gradient-to-b ${method.color} border ${method.borderColor} p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-48`}
                >
                  <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold overflow-hidden relative ${method.iconBg}`}>
                      {(() => {
                        const Logo = LOGO_MAP[method.id];
                        return Logo ? <Logo className="w-8 h-8 object-contain" /> : <Wallet className="w-6 h-6" />;
                      })()}
                    </div>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase rounded-full tracking-wider leading-none">
                      {method.badge}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{method.name}</h3>
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-900/60 text-xs">
                      <span className="text-zinc-500 font-semibold">Min. Payout</span>
                      <span className={`font-black ${method.textColor}`}>
                        {method.minCoins.toLocaleString()} Coins (${method.minUSD.toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM SHEET SLIDE-OUT DRAWER */}
      {activeMethod && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop Overlay */}
          <div 
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Bottom Sheet Body */}
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border-t border-zinc-900 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 max-h-[90vh] overflow-y-auto">
            {/* Grabber bar for mobile native feel */}
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center relative overflow-hidden ${activeMethod.iconBg}`}>
                  {(() => {
                    const Logo = LOGO_MAP[activeMethod.id];
                    return Logo ? <Logo className="w-6 h-6 object-contain" /> : <Coins className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-none">{activeMethod.name} Cashout</h3>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Secure Redemption</p>
                </div>
              </div>
              <button 
                onClick={handleCloseDrawer}
                className="w-8 h-8 rounded-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {message && (
              <div className={`p-4 mb-6 rounded-2xl border text-sm font-semibold ${
                message.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleCashout} className="space-y-6">
              {/* Value Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Reward Value</label>
                <div className="grid grid-cols-3 gap-3">
                  {[2000, 5000, 10000, 20000, 50000].map((coins) => {
                    const usdVal = coins / 1000;
                    const isMinOk = coins >= activeMethod.minCoins;
                    const hasBalance = balance >= coins;
                    
                    if (!isMinOk) return null;

                    return (
                      <button
                        key={coins}
                        type="button"
                        disabled={!hasBalance}
                        onClick={() => setSelectedCoins(coins)}
                        className={`py-3 px-2 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          selectedCoins === coins
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : !hasBalance
                            ? "bg-zinc-950/20 border-zinc-950 text-zinc-700 cursor-not-allowed"
                            : "bg-zinc-900/30 border-zinc-900 text-zinc-300 hover:border-zinc-800"
                        }`}
                      >
                        <span className="text-sm font-black">${usdVal.toFixed(2)}</span>
                        <span className="text-[9px] font-bold opacity-60 leading-none">{(coins).toLocaleString()} Coins</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destination Input Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {activeMethod.destinationLabel}
                </label>
                <input
                  type={activeMethod.destinationType}
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={activeMethod.destinationPlaceholder}
                  className="w-full pl-5 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-900 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 text-sm font-semibold"
                />
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed leading-snug">
                  Please confirm your coordinates. Approved transfers are secure and irreversible.
                </p>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={submitting || balance < selectedCoins}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/20 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-black rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Confirm Cashout ({selectedCoins.toLocaleString()} Coins)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
