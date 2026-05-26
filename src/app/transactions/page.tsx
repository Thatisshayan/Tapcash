"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Header from "@/components/Header";
import ConversionStrip from "@/components/ConversionStrip";
import { ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle, Clock, AlertTriangle, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LedgerTx {
  id: string;
  type: string;
  amountCoins: number;
  balanceEffectCoins?: number;
  method?: string;
  status: string;
  createdAt: any;
}

export default function TransactionsLedgerPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "ledger_transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LedgerTx[];
        setTransactions(txs);
        setLoadingTxs(false);
      },
      (err) => {
        console.error("Firestore transactions subscription error:", err);
        setLoadingTxs(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
            eyebrow="Track progress"
            title="The ledger tells a better story when more offers are completed."
            description="Open the dashboard to earn more, then review how each reward, reversal, and cashout maps into your transaction history."
            primaryHref="/dashboard"
            primaryLabel="Open dashboard"
            secondaryHref="/auth/signin"
            secondaryLabel="Sign in"
            variant="private"
            bullets={["Verified transaction log", "Offer and payout history", "Easy balance review"]}
          />
        </div>
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 text-center backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Access Restricted</h1>
            <p className="text-zinc-500 text-sm mb-6">Please log in to your account to view your transactions.</p>
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

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <ConversionStrip
          eyebrow="Ledger clarity"
          title="Use the transaction view to turn raw activity into trust."
          description="A clear ledger helps users understand the reward flow and gives them confidence to complete more offers."
          primaryHref="/rapidoreach"
          primaryLabel="Open offers"
          secondaryHref="/cashout"
          secondaryLabel="Go to cashout"
          variant="private"
          bullets={["Chronological reward history", "Cashout and reversal status", "More reasons to keep earning"]}
        />
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.14),transparent_30%),linear-gradient(180deg,rgba(8,12,24,0.96),rgba(4,6,14,0.98))] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 right-0 h-56 w-56 rounded-full bg-[#3a7bff]/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-[#00e6c3]/10 blur-3xl" />
          </div>

          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-start">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 text-[#8cf8e9] text-[10px] font-black uppercase tracking-[0.28em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ledger view
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-[0.22em]">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                  Audit trail
                </span>
              </div>

              <div className="max-w-2xl space-y-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Every reward, reversal, and cashout in one ledger-first timeline.
                </h1>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  The transaction view shows how TapCash actually moves value: verified credits, pending approvals, and payout events in chronological order.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/rapidoreach"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                >
                  Open offers
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cashout"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.07] transition-colors"
                >
                  Go to cashout
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-white/6 bg-[#07101b]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Visible history</p>
                <p className="mt-2 text-3xl font-black text-white">Trust through receipts</p>
                <p className="mt-2 text-sm text-zinc-400">
                  A clear transaction log helps users understand why their balance changed and what to do next.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Status</p>
                  <p className="mt-2 text-2xl font-black text-white">Live</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Controls</p>
                  <p className="mt-2 text-2xl font-black text-white">Tracked</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden backdrop-blur-xl">
          {loadingTxs ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="text-zinc-500 text-xs">Syncing ledger records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm max-w-sm mx-auto">
              <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <p className="font-bold text-zinc-400">No Transactions Yet</p>
              <p className="text-zinc-600 text-xs mt-1.5 leading-relaxed">Your ledger is clean. Go complete high-paying offers on the homepage to start stacking rewards!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-950/60 border-b border-zinc-900/80 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Action Type</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Flow Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Registered Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {transactions.map((tx) => {
                    const amount = tx.balanceEffectCoins ?? tx.amountCoins ?? 0;
                    const isAddition = amount > 0;
                    const formattedDate = tx.createdAt?.toDate
                      ? tx.createdAt.toDate().toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                      : "—";

                    return (
                      <tr key={tx.id} className="hover:bg-zinc-900/20 transition-all duration-150">
                        <td className="px-6 py-4.5 font-bold text-white">
                          <span className="flex items-center gap-2">
                            {isAddition ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="capitalize">{tx.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4.5 font-semibold text-zinc-400">
                          <span className="uppercase tracking-wider text-xs">{tx.method || "Offerwall"}</span>
                        </td>
                        <td className={`px-6 py-4.5 font-black ${isAddition ? "text-emerald-400" : "text-blue-400"}`}>
                          {isAddition ? "+" : ""}
                          {amount.toLocaleString()} Coins
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                              tx.status === "completed" || tx.status === "approved" || tx.status === "paid"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : tx.status === "pending"
                                ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                          >
                            {tx.status === "completed" || tx.status === "approved" || tx.status === "paid" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : tx.status === "pending" ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            <span>{tx.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-zinc-500 text-xs font-semibold text-right">{formattedDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
