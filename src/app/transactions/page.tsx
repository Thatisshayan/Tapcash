"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { Clock, Loader2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { MotionWrap } from "@/components/PremiumUi";
import Link from "next/link";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";
const VIOLET = "#6C5CE0";
const RED = "#FF2F42";

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

function statusColor(status: string) {
  if (status === "pending") return GOLD;
  if (status === "failed" || status === "rejected") return RED;
  return VIOLET; // completed/settled/etc
}

function formatWhen(createdAt: LedgerTx["createdAt"]) {
  if (!createdAt) return "";
  const d =
    typeof createdAt === "object" && createdAt !== null && "toDate" in createdAt && typeof createdAt.toDate === "function"
      ? createdAt.toDate()
      : new Date(createdAt as string | Date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

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
      <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: GOLD }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
        <Navbar />
        <main className="mx-auto flex min-h-[75vh] max-w-2xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full text-center">
            <ShieldCheck className="mx-auto h-12 w-12" style={{ color: GOLD }} />
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Sign in to review the ledger</h1>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(245,243,239,0.5)]">
              The transaction view is where TapCash shows the reward flow with real entries rather than guesses.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border px-8 py-3 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
                style={{ borderColor: "rgba(245,243,239,0.18)" }}
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <MotionWrap>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
            Ledger clarity
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Every reward, reversal, and cashout in one cleaner timeline.
          </h1>
          <p className="text-base text-[rgba(245,243,239,0.68)] mb-10">
            The ledger is presented like a product surface, not a raw database dump.
          </p>
        </MotionWrap>

        {/* Filter row -- plain text tabs with a gold underline on the active
            one, not a bordered pill-button toolbar. */}
        <div className="flex items-center gap-6 mb-8 overflow-x-auto pb-1" style={{ borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
          {(["all", "credits", "cashouts", "pending"] as FilterType[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className="relative whitespace-nowrap pb-3 text-xs font-bold uppercase tracking-[0.16em] transition-colors"
              style={{ color: filter === item ? "#F5F3EF" : "rgba(245,243,239,0.45)" }}
            >
              {item}
              {filter === item && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full" style={{ background: GOLD }} />
              )}
            </button>
          ))}
          <span className="ml-auto whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-[rgba(245,243,239,0.28)]">
            {filtered.length} entries
          </span>
        </div>

        {/* Ledger rows -- right-aligned tabular-nums amount, a small
            semantic-status dot at the left edge, muted timestamp. No
            bordered row cards. */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="mx-auto h-10 w-10 text-[rgba(245,243,239,0.28)]" />
            <p className="mt-4 text-sm font-semibold">No matching transactions yet</p>
            <p className="mt-2 text-sm text-[rgba(245,243,239,0.45)]">Complete offers or request a payout to populate the ledger.</p>
          </div>
        ) : (
          <div>
            {filtered.map((tx) => {
              const isCredit = (tx.balanceEffectCoins ?? tx.amountCoins) > 0;
              const amount = Math.abs(tx.balanceEffectCoins ?? tx.amountCoins);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 py-4"
                  style={{ borderBottom: "1px solid rgba(245,243,239,0.06)" }}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: statusColor(tx.status), boxShadow: `0 0 8px ${statusColor(tx.status)}88` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold capitalize truncate">{(tx.type ?? "activity").replaceAll("_", " ")}</p>
                    <p className="mt-0.5 text-xs text-[rgba(245,243,239,0.45)]">
                      {tx.status}
                      {tx.method ? ` · ${tx.method}` : ""}
                      {formatWhen(tx.createdAt) ? ` · ${formatWhen(tx.createdAt)}` : ""}
                    </p>
                  </div>
                  <p
                    className="shrink-0 text-lg font-extrabold tabular-nums"
                    style={{ color: isCredit ? GOLD_BRIGHT : "#F5F3EF" }}
                  >
                    {isCredit ? "+" : "-"}
                    {amount.toLocaleString()} <span className="text-xs font-semibold text-[rgba(245,243,239,0.4)]">coins</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: GOLD_BRIGHT }}>
              Next step
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight mb-3">
              Move from earned to payable with less friction.
            </h2>
            <p className="text-sm leading-relaxed text-[rgba(245,243,239,0.5)]">
              Users can jump from history to offers or cashout without re-learning the interface.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: GOLD_BRIGHT }}>
              Quick links
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight mb-5">Keep the flow moving</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/rapidoreach"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
              >
                Open offerwall
              </Link>
              <Link
                href="/cashout"
                className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
                style={{ borderColor: "rgba(245,243,239,0.18)" }}
              >
                Go to cashout
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
