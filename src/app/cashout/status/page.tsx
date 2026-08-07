"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Loader2, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

interface Payout {
  id: string;
  amountCoins: number;
  amountCents: number;
  method: string;
  destination: string;
  status: "pending_review" | "approved" | "rejected" | "processing" | "sent";
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  adminNote?: string;
}

// Aurora palette: text-ghost #F5F3EF/28 for inert steps, gold for
// approved/in-progress states, violet for "sent" (secondary accent), red
// for rejected. No neon green/cyan carried over from the retired palette.
const STATUS_META: Record<Payout["status"], { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending_review: { label: "Submitted",     color: "#F5F3EF",               icon: <Clock className="w-4 h-4" />,                 step: 1 },
  processing:     { label: "Processing",    color: "#D9B678",               icon: <Loader2 className="w-4 h-4 animate-spin" />,   step: 2 },
  approved:       { label: "Approved",      color: "#F0CE97",               icon: <CheckCircle2 className="w-4 h-4" />,          step: 3 },
  sent:           { label: "Sent",          color: "#6C5CE0",               icon: <CheckCircle2 className="w-4 h-4" />,          step: 4 },
  rejected:       { label: "Rejected",      color: "#FF2F42",               icon: <AlertCircle className="w-4 h-4" />,           step: 0 },
};

const LIFECYCLE_STEPS = ["pending_review", "processing", "approved", "sent"] as const;

function fmt(ts: Timestamp | null) {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function methodLabel(m: string) {
  const MAP: Record<string, string> = {
    paypal: "PayPal", bitcoin: "Bitcoin", litecoin: "Litecoin", interac: "Interac e-Transfer",
    visa: "Visa Gift Card", steam: "Steam Gift Card", roblox: "Roblox", tim_hortons: "Tim Hortons",
    canadian_tire: "Canadian Tire", cineplex: "Cineplex", shoppers: "Shoppers Drug Mart",
  };
  return MAP[m] || m;
}

export default function PayoutStatusPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payout | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) return;

    fetch("/api/ledger/summary", { headers: { Authorization: `Bearer ${user.uid}` } })
      .then(r => r.json().catch(() => ({})))
      .then(data => { if (data.balanceCoins != null) setBalance(data.balanceCoins); })
      .catch(() => {});

    const q = query(
      collection(db, "cashout_requests"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPayouts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payout)));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/cashout" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[rgba(245,243,239,0.45)] transition-colors hover:text-[#D9B678]">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-[#F5F3EF] sm:text-2xl">Payout Status</h1>
            <p className="text-xs text-[rgba(245,243,239,0.45)]">Real-time updates on your withdrawal requests</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#D9B678]" />
          </div>
        )}

        {/* Empty state */}
        {!loading && payouts.length === 0 && (
          <div className="space-y-3 px-2 py-12 text-center sm:py-16">
            <Wallet className="mx-auto h-8 w-8 text-[rgba(245,243,239,0.28)]" />
            <p className="font-black text-[rgba(245,243,239,0.68)]">No payouts yet</p>
            <p className="mx-auto max-w-xs text-sm text-[rgba(245,243,239,0.45)]">
              {balance >= 2000
                ? "You haven't cashed out yet — request your first payout."
                : "Complete offers to earn coins, then cash out."}
            </p>
            <Link
              href={balance >= 2000 ? "/cashout" : "/games"}
              className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-black text-[#0A0A0D] transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
            >
              {balance >= 2000 ? "Request Cashout" : "Start Earning"}
            </Link>
          </div>
        )}

        {/* Payout list */}
        {!loading && payouts.length > 0 && (
          <div className="space-y-3">
            {payouts.map((p) => {
              const meta = STATUS_META[p.status];
              const isOpen = selected?.id === p.id;
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected(isOpen ? null : p)}
                  className="w-full rounded-2xl p-4 text-left transition-colors duration-200 sm:p-5"
                  style={{ background: isOpen ? "rgba(217,182,120,0.05)" : "rgba(245,243,239,0.025)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
                        style={{ background: `${meta.color}1a`, color: meta.color }}
                      >
                        {meta.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#F5F3EF]">{methodLabel(p.method)}</p>
                        <p className="text-xs text-[rgba(245,243,239,0.45)]">{fmt(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black" style={{ color: meta.color }}>{meta.label}</p>
                      <p className="font-mono text-xs tabular-nums text-[rgba(245,243,239,0.68)]">
                        ${(p.amountCents != null ? p.amountCents / 100 : p.amountCoins / 1000).toFixed(2)} CAD
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 space-y-4">
                          {/* Progress steps */}
                          {p.status !== "rejected" && (
                            <div className="flex items-center gap-1">
                              {LIFECYCLE_STEPS.map((step, idx) => {
                                const stepMeta = STATUS_META[step];
                                const active = stepMeta.step <= meta.step;
                                const current = step === p.status;
                                return (
                                  <div key={step} className="flex flex-1 items-center gap-1">
                                    <div className="flex flex-1 flex-col items-center gap-1">
                                      <div
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-all"
                                        style={active ? { background: stepMeta.color, color: "#0A0A0D" } : { background: "rgba(245,243,239,0.06)", color: "rgba(245,243,239,0.28)" }}
                                      >
                                        {active ? "✓" : idx + 1}
                                      </div>
                                      <p
                                        className="text-center text-[9px] font-semibold leading-tight"
                                        style={{ color: current ? stepMeta.color : active ? "rgba(245,243,239,0.45)" : "rgba(245,243,239,0.28)" }}
                                      >
                                        {stepMeta.label}
                                      </p>
                                    </div>
                                    {idx < LIFECYCLE_STEPS.length - 1 && (
                                      <div
                                        className="mb-4 h-0.5 flex-1 rounded-full transition-all"
                                        style={{ background: active && idx < meta.step - 1 ? "#D9B678" : "rgba(245,243,239,0.09)" }}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Details */}
                          <div className="space-y-2 border-t border-[rgba(245,243,239,0.09)] pt-4 text-sm">
                            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                              <span className="text-[rgba(245,243,239,0.45)]">Destination</span>
                              <span className="truncate font-semibold text-[#F5F3EF]">{p.destination}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgba(245,243,239,0.45)]">Coins deducted</span>
                              <span className="font-mono font-semibold tabular-nums text-[#F5F3EF]">{p.amountCoins?.toLocaleString()}</span>
                            </div>
                            {p.updatedAt && (
                              <div className="flex justify-between">
                                <span className="text-[rgba(245,243,239,0.45)]">Last updated</span>
                                <span className="font-semibold text-[#F5F3EF]">{fmt(p.updatedAt)}</span>
                              </div>
                            )}
                            {p.adminNote && (
                              <div className="border-t border-[rgba(245,243,239,0.09)] pt-2">
                                <p className="mb-1 text-xs text-[rgba(245,243,239,0.45)]">Admin note</p>
                                <p className="text-xs text-[#F0CE97]">{p.adminNote}</p>
                              </div>
                            )}
                          </div>

                          {p.status === "rejected" && (
                            <div className="rounded-xl p-3 text-sm text-[#ffb3ba]" style={{ background: "rgba(255,47,66,0.08)" }}>
                              Payout was rejected. Coins have been returned to your wallet.
                              {p.adminNote && <span> Reason: {p.adminNote}</span>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
