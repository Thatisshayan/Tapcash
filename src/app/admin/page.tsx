"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: any;
}

interface Postback {
  id: string;
  userId: string;
  amountCents: number;
  offerId: string;
  ipAddress: string;
  status: string;
  createdAt: any;
}

interface FlaggedTx {
  id: string;
  userId: string;
  type: string;
  status: string;
  createdAt: any;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [postbacks, setPostbacks] = useState<Postback[]>([]);
  const [flagged, setFlagged] = useState<FlaggedTx[]>([]);
  const [stats, setStats] = useState({ users: 0, pending: 0, postbacks24h: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    try {
      // Pending withdrawals
      const wq = query(collection(db, "withdrawals"), where("status", "==", "pending"), orderBy("createdAt", "desc"), limit(20));
      const wSnap = await getDocs(wq);
      setWithdrawals(wSnap.docs.map(d => ({ id: d.id, ...d.data() } as Withdrawal)));

      // Recent postbacks
      const pq = query(collection(db, "transactions"), where("type", "==", "offerwall_postback"), orderBy("createdAt", "desc"), limit(20));
      const pSnap = await getDocs(pq);
      setPostbacks(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Postback)));

      // Flagged
      const fq = query(collection(db, "transactions"), where("status", "==", "flagged"), limit(10));
      const fSnap = await getDocs(fq);
      setFlagged(fSnap.docs.map(d => ({ id: d.id, ...d.data() } as FlaggedTx)));

      setStats({ users: 0, pending: wSnap.size, postbacks24h: pSnap.size });
    } catch (e) {
      console.error("Admin load error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdrawal(withdrawalId: string, action: "approve" | "reject") {
    setActionLoading(withdrawalId + action);
    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ withdrawalId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `Withdrawal ${action}d successfully`, type: "success" });
        setWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));
      } else {
        setMessage({ text: data.error || "Action failed", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  function fmt(ts: any) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-3xl font-bold mb-2 text-emerald-400">Admin Dashboard</h1>
      <p className="text-zinc-500 text-sm mb-8">Logged in as {user?.email}</p>

      {message && (
        <div className={`mb-6 p-3 rounded-lg border text-sm ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending Withdrawals", value: stats.pending, color: "text-amber-400" },
          { label: "Recent Postbacks (shown)", value: stats.postbacks24h, color: "text-emerald-400" },
          { label: "Fraud Flags", value: flagged.length, color: flagged.length > 0 ? "text-red-400" : "text-zinc-400" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-zinc-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Withdrawals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Pending Withdrawals</h2>
        {withdrawals.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-zinc-500 text-sm">No pending withdrawals.</div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04]">
                <tr>
                  {["User", "Amount", "Method", "Requested", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-zinc-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{w.userId?.slice(0, 10)}…</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">${((w.amount || 0) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-zinc-400 capitalize">{w.method || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{fmt(w.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleWithdrawal(w.id, "approve")}
                          disabled={actionLoading === w.id + "approve"}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/20 disabled:opacity-40 transition"
                        >
                          {actionLoading === w.id + "approve" ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleWithdrawal(w.id, "reject")}
                          disabled={actionLoading === w.id + "reject"}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20 disabled:opacity-40 transition"
                        >
                          {actionLoading === w.id + "reject" ? "…" : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Postbacks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Recent Postbacks</h2>
        {postbacks.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-zinc-500 text-sm">No postbacks yet.</div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04]">
                <tr>
                  {["User", "Amount", "Offer", "IP", "Status", "Time"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-zinc-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {postbacks.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{p.userId?.slice(0, 10)}…</td>
                    <td className="px-4 py-3 text-emerald-400">${((p.amountCents || 0) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{p.offerId || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{p.ipAddress || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs border ${p.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{fmt(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fraud Flags */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">
          Fraud Flags
          {flagged.length > 0 && <span className="ml-2 text-sm text-red-400">({flagged.length})</span>}
        </h2>
        {flagged.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-zinc-500 text-sm">No suspicious activity detected.</div>
        ) : (
          <div className="space-y-2">
            {flagged.map(f => (
              <div key={f.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex justify-between items-center">
                <div>
                  <span className="text-zinc-300 font-mono text-xs">{f.userId?.slice(0, 12)}…</span>
                  <span className="ml-3 text-zinc-500 text-xs">{f.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 text-xs border border-red-500/30 px-2 py-0.5 rounded">{f.status}</span>
                  <span className="text-zinc-600 text-xs">{fmt(f.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
