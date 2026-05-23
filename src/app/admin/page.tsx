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
  const [tab, setTab] = useState<"withdrawals" | "users">("withdrawals");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [postbacks, setPostbacks] = useState<Postback[]>([]);
  const [flagged, setFlagged] = useState<FlaggedTx[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [stats, setStats] = useState({ users: 0, pending: 0, postbacks24h: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
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

      // Fetch users
      const uq = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(10));
      const uSnap = await getDocs(uq);
      setUsers(uSnap.docs.map(d => ({ uid: d.id, ...d.data() })));

      setStats({ users: uSnap.size, pending: wSnap.size, postbacks24h: pSnap.size });
    } catch (e) {
      console.error("Admin load error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!userSearch) return;
    try {
      const token = await user!.getIdToken();
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(userSearch)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error("Search error:", err);
    }
  }

  async function handleUserAction(targetUid: string, action: string, value?: any) {
    setActionLoading(targetUid + action);
    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid, action, value }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `User ${action} success`, type: "success" });
        loadData(); // Refresh
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
        setMessage({ text: `Withdrawal ${action}d successfully ${data.automated ? '(Automated)' : '(Manual)'}`, type: "success" });
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

  if (loading && withdrawals.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-emerald-400 font-display">TapCash Command Center</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Administrator: {user?.email}</p>
        </div>
        <div className="flex bg-zinc-950 border border-zinc-900 rounded-xl p-1">
          <button 
            onClick={() => setTab("withdrawals")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === "withdrawals" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`}
          >
            Withdrawals
          </button>
          <button 
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === "users" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`}
          >
            User Manager
          </button>
        </div>
      </div>

      {message && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl border shadow-2xl animate-in slide-in-from-top-4 duration-300 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          <p className="text-sm font-bold flex items-center gap-2">
            {message.type === "success" ? "✓" : "⚠"} {message.text}
          </p>
        </div>
      )}

      {tab === "withdrawals" ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pending Payouts", value: stats.pending, color: "text-amber-400" },
              { label: "Revenue Ledger", value: stats.postbacks24h, color: "text-emerald-400" },
              { label: "Security Alerts", value: flagged.length, color: "text-red-400" },
              { label: "Registered Users", value: stats.users, color: "text-zinc-400" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-white/5 bg-zinc-950/50 p-5 backdrop-blur-sm">
                <div className={`text-2xl font-black font-display ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pending Withdrawals */}
          <section className="bg-zinc-950/30 border border-zinc-900 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Queued Withdrawals</h2>
              <button onClick={loadData} className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase">Refresh Feed</button>
            </div>
            {withdrawals.length === 0 ? (
              <div className="p-12 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">Clear Ledger. No Pending Actions.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-600">
                  <tr>
                    <th className="px-6 py-4">Beneficiary</th>
                    <th className="px-6 py-4">Amount (CAD)</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-zinc-400">{(w as any).payoutEmail || w.userId.slice(0, 15) + "..."}</span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">UID: {w.userId.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-black text-sm">${((w.amount || 0) / 100).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${w.method?.toLowerCase() === 'paypal' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'}`}>
                          {w.method || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-zinc-600">{fmt(w.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleWithdrawal(w.id, "approve")}
                            disabled={!!actionLoading}
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {actionLoading === w.id + "approve" ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleWithdrawal(w.id, "reject")}
                            disabled={!!actionLoading}
                            className="px-4 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* User Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search user by email prefix..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
            >
              Execute Search
            </button>
          </div>

          {/* User List Table */}
          <div className="bg-zinc-950/30 border border-zinc-900 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-600">
                <tr>
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Wallet Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center font-black text-[10px]">
                          {u.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-200">{u.email}</span>
                          <span className="text-[9px] text-zinc-600 font-mono tracking-tighter">UID: {u.uid}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 font-black">${((u.walletBalanceCents || 0) / 100).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${u.status === 'banned' ? 'border-red-500/20 text-red-500 bg-red-500/5' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'}`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-zinc-600">{fmt(u.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleUserAction(u.uid, u.status === 'banned' ? 'unban' : 'ban')}
                          disabled={!!actionLoading}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${u.status === 'banned' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                        >
                          {u.status === 'banned' ? 'Unban' : 'Ban'}
                        </button>
                        <button 
                          onClick={() => {
                            const adj = prompt("Enter adjustment amount in CENTS (e.g. 100 for $1.00, -100 for -$1.00)");
                            if (adj) handleUserAction(u.uid, 'adjust_balance', adj);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all active:scale-95"
                        >
                          Adj
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

