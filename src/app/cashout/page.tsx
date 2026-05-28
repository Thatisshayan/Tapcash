"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Header from "@/components/Header";
import ConversionStrip from "@/components/ConversionStrip";
import { Coins, Wallet, Landmark, X, Loader2, AlertTriangle, ArrowRight, ShieldCheck, BadgeCheck, Sparkles, CheckCircle2, Gift, ChevronRight, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    iconBg: "bg-red-500/10 border-red-500/20",
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
    iconBg: "bg-red-600/10 border-red-600/20",
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
    iconBg: "bg-red-900/10 border-red-900/20",
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
    iconBg: "bg-sky-500/10 border-sky-500/20",
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
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
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
    iconBg: "bg-rose-500/10 border-rose-500/20",
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
  const [successOverlay, setSuccessOverlay] = useState<{ coins: number; method: string } | null>(null);

  // Subscribe to real-time balance
  useEffect(() => {
    if (!user) {
      setBalance(0);
      return;
    }

    const q = query(collection(db, "ledger_transactions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const total = snapshot.docs.reduce((sum, docSnap) => {
        const data = docSnap.data() as { balanceEffectCoins?: number };
        return sum + Number(data.balanceEffectCoins || 0);
      }, 0);
      setBalance(total);
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

      setSuccessOverlay({ coins: selectedCoins, method: activeMethod?.name || "cashout" });
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
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
          <ConversionStrip
            eyebrow="Earn first"
            title="Cashout works best when the ledger keeps growing."
            description="Complete more verified offers and your redemption flow becomes faster, cleaner, and easier to approve."
            primaryHref="/dashboard"
            primaryLabel="Open dashboard"
            secondaryHref="/auth/signup"
            secondaryLabel="Create account"
            variant="private"
            bullets={["Ledger-backed balances", "Manual approval queue", "Gift card and cash options"]}
          />
        </div>
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
    <div className="min-h-screen bg-[#050816] text-white flex flex-col relative overflow-x-hidden">
      {/* Full-screen success overlay */}
      <AnimatePresence>
        {successOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050816]/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="max-w-sm w-full mx-4 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
                className="w-24 h-24 mx-auto rounded-full bg-[#f5c842]/15 border border-[#f5c842]/40 flex items-center justify-center"
              >
                <span className="text-4xl">🎉</span>
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-3xl font-black text-white"
                >
                  Cashout Submitted!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-zinc-400 text-sm mt-2"
                >
                  <span className="gold-text font-black">{successOverlay.coins.toLocaleString()} coins</span> via <span className="text-white font-bold">{successOverlay.method}</span>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-zinc-600 text-xs mt-2"
                >
                  Your request is in the review queue. Typical approval: 1–3 business days.
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => setSuccessOverlay(null)}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-black font-black text-sm"
              >
                Back to Cashout
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <ConversionStrip
          eyebrow="Cashout control"
          title="Manual review keeps payouts safer for everyone."
          description="Use the cashout store to review reward options, track minimum thresholds, and keep the payout queue clean."
          primaryHref="/dashboard"
          primaryLabel="Back to dashboard"
          secondaryHref="/transactions"
          secondaryLabel="View ledger"
          variant="private"
          bullets={["Clear minimum thresholds", "Admin review before payout", "Reward methods and tracking"]}
        />
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#1e2d4f] bg-[#07111e] p-6 sm:p-8 lg:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 right-0 h-56 w-56 rounded-full bg-[#3a7bff]/[0.08] blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-[#00e6c3]/[0.06] blur-3xl" />
          </div>

          <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr] items-start">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/[0.06] text-[#00e6c3] text-[10px] font-black uppercase tracking-[0.28em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Payout store
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.04] text-zinc-400 text-[10px] font-black uppercase tracking-[0.22em]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3a7bff]" />
                  Manual review queue
                </span>
              </div>

              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[0.92] font-display text-white">
                  Redeem your balance with a cleaner payout funnel.
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                  TapCash keeps redemption simple: pick a reward method, confirm the destination, and submit for admin approval. No auto-payouts, no clutter, no mystery.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_0_30px_rgba(0,230,195,0.25)] hover:opacity-90 transition"
                >
                  Back to dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/transactions"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/[0.07] transition-colors"
                >
                  View ledger
                  <BadgeCheck className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-[#1e2d4f] bg-[#0a1628] p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Your wallet</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black text-[#00e6c3]">{balance.toLocaleString()}</p>
                    <p className="text-sm text-zinc-500">coins available for redemption</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#00e6c3]/10 border border-[#00e6c3]/20 flex items-center justify-center text-[#00e6c3]">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-[#1e2d4f] bg-[#07111e] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Min payout</p>
                  <p className="mt-2 text-xl font-black text-white">2,000+</p>
                </div>
                <div className="rounded-[1.25rem] border border-[#1e2d4f] bg-[#07111e] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Approval</p>
                  <p className="mt-2 text-xl font-black text-white">Manual</p>
                </div>
                <div className="rounded-[1.25rem] border border-[#1e2d4f] bg-[#07111e] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Trust level</p>
                  <p className="mt-2 text-xl font-black text-white">Checked</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Grid Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Select cashout method</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Pick one payout path and submit it for manual review.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-xs font-black text-zinc-400">
                <Gift className="w-3.5 h-3.5 text-[#00e6c3]" />
                Rewards are shown in a plain, scannable grid
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {REWARD_METHODS.map((method) => {
              const meetsMin = balance >= method.minCoins;
              return (
                <div
                  key={method.id}
                  onClick={() => handleOpenDrawer(method)}
                  className={`group relative overflow-hidden border border-[#1e2d4f] bg-[#07111e] p-6 rounded-[1.75rem] cursor-pointer hover:-translate-y-1 hover:border-[#00e6c3]/25 transition-all duration-300 flex flex-col justify-between min-h-[12rem] shadow-[0_12px_40px_rgba(0,0,0,0.35)]`}
                >
                  <div className="absolute inset-0 bg-[#00e6c3]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold overflow-hidden relative ${method.iconBg}`}>
                      {(() => {
                        const Logo = LOGO_MAP[method.id];
                        return Logo ? <Logo className="w-8 h-8 object-contain" /> : <Wallet className="w-6 h-6" />;
                      })()}
                    </div>
                    <span className="px-2.5 py-1 bg-white/[0.05] border border-white/8 text-zinc-400 text-[10px] font-black uppercase rounded-full tracking-wider leading-none">
                      {method.badge}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#00e6c3] transition-colors">{method.name}</h3>
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5 text-xs">
                      <span className="text-zinc-500 font-semibold">Min. payout</span>
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
          <div className="relative w-full max-w-lg bg-[#07111e] border-t border-[#1e2d4f] rounded-t-3xl p-6 shadow-[0_-10px_60px_rgba(0,0,0,0.7)] transition-transform duration-300 max-h-[90vh] overflow-y-auto">
            {/* Grabber bar for mobile native feel */}
            <div className="w-12 h-1 bg-white/15 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center relative overflow-hidden ${activeMethod.iconBg}`}>
                  {(() => {
                    const Logo = LOGO_MAP[activeMethod.id];
                    return Logo ? <Logo className="w-6 h-6 object-contain" /> : <Coins className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-none">{activeMethod.name} cashout</h3>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Secure redemption</p>
                </div>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 hover:border-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition"
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
