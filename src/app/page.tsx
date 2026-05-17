"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, LogOut, ShieldCheck, Wallet, Activity, Gift } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

// --- Mock Data ---
const offers = [
  { provider: "ADGATE", title: "Raid: Shadow Legends", description: "Reach level 25 within 7 days to earn your reward.", amount: "$14.50", category: "Games" },
  { provider: "LOOTABLY", title: "Opinion Outpost Survey", description: "Complete a 15-minute survey about consumer habits.", amount: "$1.20", category: "Surveys" },
  { provider: "REVBOOST", title: "Install TikTok", description: "Download and open the app for the first time.", amount: "$0.80", category: "Apps" },
  { provider: "OFFERY", title: "Watch & Earn", description: "Watch 3 short video ads to claim your reward.", amount: "$0.15", category: "Videos" }
];

const tabs = ["All", "Surveys", "Games", "Apps", "Videos"];

// --- Components ---

function OfferCard({ offer, onEarn }: { offer: any; onEarn: () => void }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.04] p-6 hover:border-emerald-300/40 transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-emerald-300">{offer.provider}</p>
          <h3 className="mt-4 text-xl font-semibold text-white">{offer.title}</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">{offer.description}</p>
        </div>
        <div className="flex items-center gap-5 shrink-0 mt-4 sm:mt-0">
          <button onClick={onEarn} className="rounded-lg border border-white/10 bg-white/[0.05] px-6 py-4 text-center hover:bg-white/10 transition">
            <span className="block text-sm text-zinc-400">Earn</span>
            <span className="block text-2xl font-light text-white">{offer.amount}</span>
          </button>
          <ChevronRight className="size-6 text-zinc-400 group-hover:text-emerald-300 transition hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ balance, onWithdraw }: { balance: number; onWithdraw: () => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      <div className="flex items-center gap-3 mb-4">
        <Wallet className="size-5 text-emerald-400" />
        <h3 className="text-sm font-medium text-zinc-300">Available Balance</h3>
      </div>
      <div className="text-5xl font-light text-white tracking-tight mb-8">
        ${(balance / 100).toFixed(2)}
      </div>
      <button 
        onClick={onWithdraw}
        className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-3 transition-colors"
      >
        Withdraw Funds
      </button>
    </div>
  );
}

function ActivityCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="size-5 text-zinc-400" />
        <h3 className="text-sm font-medium text-zinc-300">Recent Activity</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div>
            <p className="text-sm text-white">Daily Login Bonus</p>
            <p className="text-xs text-zinc-500">2 hours ago</p>
          </div>
          <span className="text-sm text-emerald-400">+$0.10</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div>
            <p className="text-sm text-white">Survey Complete</p>
            <p className="text-xs text-zinc-500">Yesterday</p>
          </div>
          <span className="text-sm text-emerald-400">+$1.50</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-white">PayPal Withdrawal</p>
            <p className="text-xs text-zinc-500">Oct 12</p>
          </div>
          <span className="text-sm text-zinc-400">-$5.00</span>
        </div>
      </div>
    </div>
  );
}

// --- Screens ---

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">TapCash</h1>
          <p className="text-zinc-400 text-sm">Premium rewards. Frictionless payouts.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-400 bg-red-400/10 rounded-lg border border-red-400/20">{error}</div>}
          
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("All");
  const [balance, setBalance] = useState(0);

  // Listen to real wallet balance
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid, "wallet", "balance"), (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().balanceCents || 0);
      }
    });
    return () => unsub();
  }, [user]);

  const filteredOffers = activeTab === "All" 
    ? offers 
    : offers.filter((offer) => offer.category === activeTab);

  const handleWithdraw = async () => {
    if (balance < 100) return alert("Minimum withdrawal is $1.00");
    // Hook up real payout logic here
    alert("Withdrawal requested!");
  };

  const handleEarn = async (offer: any) => {
    // Hook up real complete task logic here
    alert(`Started offer: ${offer.title}`);
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="h-20 border-b border-white/10 bg-black/40 px-6 md:px-14 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Gift className="size-6 text-emerald-400" />
          <h2 className="text-2xl font-bold tracking-tight">TapCash</h2>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </nav>

      <main className="mx-auto max-w-7xl grid gap-8 px-4 py-8 sm:px-6 md:px-14 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <BalanceCard balance={balance} onWithdraw={handleWithdraw} />
          <ActivityCard />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Available Offers</h2>
          <div className="mt-6 flex overflow-x-auto border-b border-white/10 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 pb-4 text-sm font-medium transition ${
                  activeTab === tab
                    ? "border-b-2 border-emerald-400 text-emerald-400"
                    : "text-zinc-400 hover:text-white border-b-2 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {filteredOffers.map((offer) => (
              <OfferCard key={offer.title} offer={offer} onEarn={() => handleEarn(offer)} />
            ))}
            {filteredOffers.length === 0 && (
              <div className="text-center py-12 border border-white/10 border-dashed rounded-xl">
                <p className="text-zinc-500">No offers in this category right now.</p>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05]">
                <ShieldCheck className="size-6 text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Your data is protected and never sold.</p>
                <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">
                  We use industry-standard encryption to keep your information safe and payouts secure.
                </p>
              </div>
            </div>
            <button className="shrink-0 rounded-lg border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </section>
  );
}

// --- Main App Component ---

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <DashboardScreen user={user} /> : <LoginScreen />;
}
