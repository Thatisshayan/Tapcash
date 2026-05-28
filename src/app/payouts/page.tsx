export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

interface Payout {
  maskedUser: string;
  method: string;
  amountCad: number;
  sentAt: Date;
}

async function getRecentPayouts(): Promise<Payout[]> {
  const snap = await adminDb
    .collection("payouts")
    .where("status", "==", "sent")
    .orderBy("updatedAt", "desc")
    .limit(30)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    const uid = (data.userId as string) || "";
    const maskedUser = "User_***" + uid.slice(-3).toUpperCase();
    const ts: Timestamp = data.updatedAt || data.createdAt;
    return {
      maskedUser,
      method: data.method as string,
      amountCad: data.amountCad ?? data.amountCoins / 1000,
      sentAt: ts ? ts.toDate() : new Date(),
    };
  });
}

function methodLabel(m: string) {
  const MAP: Record<string, string> = {
    paypal: "PayPal", bitcoin: "Bitcoin", litecoin: "Litecoin", interac: "Interac e-Transfer",
    visa: "Visa", steam: "Steam", roblox: "Roblox", tim_hortons: "Tim Hortons",
    canadian_tire: "Canadian Tire", shoppers: "Shoppers Drug Mart",
  };
  return MAP[m] || m;
}

function relativeTime(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);
  if (diffH < 1) return "less than 1h ago";
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}

export const revalidate = 300;

export default async function PayoutsProofPage() {
  const payouts = await getRecentPayouts();

  return (
    <div className="min-h-screen bg-[#050816] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00e6c3] mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-black">TapCash</span>
          </Link>
          <h1 className="text-4xl font-black text-white">Proof of Payouts</h1>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            Real payouts sent to real users. Anonymized for privacy. Updated every 5 minutes.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/5 text-[#00e6c3] text-xs font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6c3] animate-pulse" />
            Live data
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Paid Out", value: `$${payouts.reduce((s, p) => s + p.amountCad, 0).toFixed(0)}+`, color: "#f5c842" },
            { label: "Recent Payouts", value: `${payouts.length}`, color: "#00e6c3" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/6 bg-[#080c1a] p-5 text-center">
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Payout list */}
        <div className="rounded-2xl border border-white/6 overflow-hidden">
          {payouts.length === 0 && (
            <div className="p-10 text-center text-zinc-500 text-sm">No payouts on record yet.</div>
          )}
          {payouts.map((p, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition ${idx < payouts.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#00e6c3]/10 border border-[#00e6c3]/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#00e6c3]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{p.maskedUser}</p>
                <p className="text-xs text-zinc-500">{methodLabel(p.method)} · {relativeTime(p.sentAt)}</p>
              </div>
              <p className="font-black text-[#f5c842] text-sm shrink-0">+${p.amountCad.toFixed(2)} CAD</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-700">
          User IDs are anonymized. Amounts are real.{" "}
          <Link href="/auth/signup" className="text-[#00e6c3] hover:underline font-bold">Join free →</Link>
        </p>
      </div>
    </div>
  );
}
