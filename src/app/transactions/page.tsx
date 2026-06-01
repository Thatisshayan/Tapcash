"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { BadgeCheck, Clock, Loader2, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

type LedgerTx = {
  id: string;
  type: string;
  amountCoins: number;
  balanceEffectCoins?: number;
  method?: string;
  status: string;
  createdAt: Date | string | { toDate?: () => Date } | null;
};

type FilterType = "all" | "credits" | "cashouts" | "pending";

export default function TransactionsLedgerPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!user) return;

    const ledgerQuery = query(collection(db, "ledger_transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
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

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        if (filter === "all") return true;
        if (filter === "credits") return (tx.balanceEffectCoins ?? 0) > 0 && tx.status !== "pending";
        if (filter === "cashouts") return tx.type?.includes("cashout");
        if (filter === "pending") return tx.status === "pending";
        return true;
      }),
    [filter, transactions]
  );

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
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">The transaction view is where TapCash shows the reward flow with real entries rather than guesses.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <CTAButton href="/auth/signin" label="Sign in" />
              <CTAButton href="/dashboard" label="Go to dashboard" variant="secondary" />
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
        <MotionWrap>
          <PageShell eyebrow="Ledger clarity" title="Every reward, reversal, and cashout in one cleaner timeline." description="The ledger is presented like a product surface, not a raw database dump." kicker={<BadgeCheck className="h-6 w-6 text-[#8cf8e9]" />}>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Filter" value="Visible" detail="Quick scan" />
              <StatCard label="State" value="Tracked" detail="Audit ready" />
              <StatCard label="Payout" value="Clear" detail="Queue aware" />
            </div>
          </PageShell>
        </MotionWrap>

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
            <span className="ml-auto text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">{filtered.length} entries</span>
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
                      <p className="mt-3 text-sm font-semibold text-white">{tx.balanceEffectCoins && tx.balanceEffectCoins > 0 ? "Credit" : "Balance change"} logged</p>
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
              Users can jump from history to offers or cashout without re-learning the interface.
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
              <CTAButton href="/rapidoreach" label="Open offerwall" />
              <CTAButton href="/cashout" label="Go to cashout" variant="secondary" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
