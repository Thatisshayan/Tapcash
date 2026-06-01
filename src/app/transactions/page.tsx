"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BadgeCheck, Clock, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

interface LedgerTx {
  id: string;
  type: string;
  amountCoins: number;
  balanceEffectCoins?: number;
  method?: string;
  status: string;
  createdAt: any;
}

type FilterType = "all" | "credits" | "cashouts" | "pending";

export default function TransactionsLedgerPage() {
  const { user, loading: authLoading } = useAuth();
  const reduceMotion = useReducedMotion();
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const motionProps = useMemo(
    () => ({
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [reduceMotion]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    const ledgerQuery = query(
      collection(db, "ledger_transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      ledgerQuery,
      (snapshot) => {
        setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as LedgerTx[]);
        setLoading(false);
      },
      (error) => {
        console.error("Ledger subscription error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filtered = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "credits") return (tx.balanceEffectCoins ?? 0) > 0 && tx.status !== "pending";
    if (filter === "cashouts") return tx.type?.includes("cashout");
    if (filter === "pending") return tx.status === "pending";
    return true;
  });

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#00e6c3]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <Header />
        <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-[#8cf8e9]" />
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Sign in to review the ledger</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The transaction view is where TapCash shows the reward flow with real entries rather than guesses.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3 text-sm font-black text-[#04101d]">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
                Go to dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040913] text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section {...motionProps} className="rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.12),transparent_32%),linear-gradient(180deg,rgba(8,15,25,0.96),rgba(5,8,16,0.98))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#8cf8e9]">
                <Sparkles className="h-3.5 w-3.5" />
                Ledger clarity
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
                Every reward, reversal, and cashout in one cleaner timeline.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                The ledger is now presented like a product surface, not a raw database dump.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Filter", value: "Visible", detail: "Quick scan" },
                { label: "State", value: "Tracked", detail: "Audit ready" },
                { label: "Payout", value: "Clear", detail: "Queue aware" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mt-8 rounded-[2rem] border border-white/8 bg-white/[0.03]">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-white/6 px-4 py-4">
            {(["all", "credits", "cashouts", "pending"] as FilterType[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.22em] transition-colors ${
                  filter === item ? "bg-[#00e6c3] text-[#04101d]" : "bg-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
            <span className="ml-auto text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
              {filtered.length} entries
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="mx-auto h-10 w-10 text-zinc-700" />
              <p className="mt-4 text-sm font-semibold text-white">No matching transactions yet</p>
              <p className="mt-2 text-sm text-zinc-500">Complete offers or request a payout to populate the ledger.</p>
            </div>
          ) : (
            <div className="grid gap-3 p-4 sm:p-5">
              {filtered.map((tx) => (
                <div key={tx.id} className="rounded-[1.5rem] border border-white/6 bg-black/15 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {tx.type.replaceAll("_", " ")}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white">
                        {tx.balanceEffectCoins && tx.balanceEffectCoins > 0 ? "Credit" : "Balance change"} logged
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {tx.status} {tx.method ? `• ${tx.method}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${tx.balanceEffectCoins && tx.balanceEffectCoins > 0 ? "text-[#8cf8e9]" : "text-[#f5c842]"}`}>
                        {tx.balanceEffectCoins && tx.balanceEffectCoins > 0 ? "+" : "-"}
                        {Math.abs(tx.balanceEffectCoins ?? tx.amountCoins).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">coins</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#8cf8e9]">Next step</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Move from earned to payable with less friction.</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The ledger works best when the next action is obvious. Users can jump from history to offers or cashout without re-learning the interface.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#f5c842]">Quick links</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Keep the flow moving</h2>
              </div>
              <BadgeCheck className="h-6 w-6 text-[#8cf8e9]" />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/rapidoreach" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3.5 text-sm font-black text-[#04101d]">
                Open offerwall
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/cashout" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white">
                Go to cashout
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
