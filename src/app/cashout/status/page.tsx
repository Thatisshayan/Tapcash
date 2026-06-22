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

const STATUS_META: Record<Payout["status"], { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending_review: { label: "Submitted",     color: "#94a3b8", icon: <Clock className="w-4 h-4" />,                 step: 1 },
  processing:     { label: "Processing",    color: "#f5c842", icon: <Loader2 className="w-4 h-4 animate-spin" />,   step: 2 },
  approved:       { label: "Approved",      color: "#00e6c3", icon: <CheckCircle2 className="w-4 h-4" />,          step: 3 },
  sent:           { label: "Sent",          color: "#3a7bff", icon: <CheckCircle2 className="w-4 h-4" />,          step: 4 },
  rejected:       { label: "Rejected",      color: "#ef4444", icon: <AlertCircle className="w-4 h-4" />,           step: 0 },
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

  useEffect(() => {
    if (!user) return;
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
    <div className="min-h-screen bg-[#050816] text-white px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/cashout" className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Payout Status</h1>
            <p className="text-xs text-zinc-500">Real-time updates on your withdrawal requests</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#00e6c3]" />
          </div>
        )}

        {/* Empty state */}
        {!loading && payouts.length === 0 && (
          <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-10 text-center space-y-3">
            <Wallet className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="font-black text-zinc-400">No payouts yet</p>
            <p className="text-sm text-zinc-600">Request a cashout from the cashout page.</p>
            <Link href="/cashout" className="inline-block mt-2 px-6 py-2.5 rounded-full bg-[#00e6c3] text-[#050816] text-sm font-black hover:opacity-90 transition">
              Request Cashout
            </Link>
          </div>
        )}

        {/* Payout list */}
        {!loading && payouts.length > 0 && (
          <div className="space-y-3">
            {payouts.map((p) => {
              const meta = STATUS_META[p.status];
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected(selected?.id === p.id ? null : p)}
                  className="w-full text-left rounded-2xl border border-white/6 bg-[#080c1a] p-5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: `${meta.color}15`, borderColor: `${meta.color}30`, color: meta.color }}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">{methodLabel(p.method)}</p>
                        <p className="text-xs text-zinc-500">{fmt(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-sm" style={{ color: meta.color }}>{meta.label}</p>
                      <p className="text-xs text-zinc-400">${(p.amountCents / 100).toFixed(2) || (p.amountCoins / 1000).toFixed(2)} CAD</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selected?.id === p.id && (
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
                                  <div key={step} className="flex items-center gap-1 flex-1">
                                    <div className={`flex flex-col items-center gap-1 flex-1 ${idx < LIFECYCLE_STEPS.length - 1 ? "" : ""}`}>
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all"
                                        style={active ? { background: stepMeta.color, borderColor: stepMeta.color, color: "#050816" } : { borderColor: "#1e2d4f", color: "#334155" }}
                                      >
                                        {active ? "✓" : idx + 1}
                                      </div>
                                      <p className="text-[9px] text-center font-semibold" style={{ color: current ? stepMeta.color : active ? "#64748b" : "#1e2d4f" }}>
                                        {stepMeta.label}
                                      </p>
                                    </div>
                                    {idx < LIFECYCLE_STEPS.length - 1 && (
                                      <div className="h-0.5 flex-1 mb-4 rounded-full transition-all" style={{ background: active && idx < meta.step - 1 ? "#00e6c3" : "#1e2d4f" }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Details */}
                          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-zinc-500">Destination</span><span className="text-white font-semibold">{p.destination}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Coins deducted</span><span className="text-white font-semibold">{p.amountCoins?.toLocaleString()}</span></div>
                            {p.updatedAt && <div className="flex justify-between"><span className="text-zinc-500">Last updated</span><span className="text-white font-semibold">{fmt(p.updatedAt)}</span></div>}
                            {p.adminNote && <div className="pt-2 border-t border-white/5"><p className="text-zinc-500 text-xs mb-1">Admin note</p><p className="text-yellow-300 text-xs">{p.adminNote}</p></div>}
                          </div>

                          {p.status === "rejected" && (
                            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
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
