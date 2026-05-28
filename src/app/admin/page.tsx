"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "@/components/Header";
import ConversionStrip from "@/components/ConversionStrip";
import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight, BadgeCheck, Wallet } from "lucide-react";

interface Withdrawal {
  id: string;
  userId: string;
  amountCoins: number;
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

  // Balance adjustment modal state
  const [adjModal, setAdjModal] = useState<{ uid: string; email: string } | null>(null);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjSubmitting, setAdjSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const token = await user!.getIdToken();
      const [adminDataRes, usersRes] = await Promise.all([
        fetch("/api/admin/withdrawals", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users?limit=10", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const adminData = await adminDataRes.json();
      const usersData = await usersRes.json();

      if (adminData.withdrawals) setWithdrawals(adminData.withdrawals);
      if (adminData.postbacks) setPostbacks(adminData.postbacks);
      if (adminData.flagged) setFlagged(adminData.flagged);
      if (usersData.users) setUsers(usersData.users);
      if (adminData.stats) setStats(adminData.stats);
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

  async function handleAdjustSubmit() {
    if (!adjModal || !adjAmount.trim() || !adjReason.trim()) return;
    const parsed = parseInt(adjAmount, 10);
    if (isNaN(parsed)) return;
    setAdjSubmitting(true);
    try {
      await handleUserAction(adjModal.uid, "adjust_balance", parsed.toString());
      // Write audit log entry
      const token = await user!.getIdToken();
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targetUid: adjModal.uid,
          action: "audit_log",
          value: { delta: parsed, reason: adjReason, adminEmail: user?.email },
        }),
      });
      setAdjModal(null);
      setAdjAmount("");
      setAdjReason("");
    } finally {
      setAdjSubmitting(false);
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
      <section className="mb-8 rounded-[2rem] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.14),transparent_30%),linear-gradient(180deg,rgba(8,12,24,0.96),rgba(4,6,14,0.98))] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 text-[#8cf8e9] text-[10px] font-black uppercase tracking-[0.28em]">
                <Sparkles className="w-3.5 h-3.5" />
                Admin control
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-[0.22em]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                Manual approvals
              </span>
            </div>
            <div className="max-w-2xl space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                TapCash Command Center for payouts, users, and fraud control.
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Admin decisions drive the ledger. This surface keeps withdrawals, user actions, and security alerts easy to review and hard to abuse.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={loadData}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
              >
                Refresh queue
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.07] transition-colors"
              >
                Back to dashboard
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/6 bg-[#07101b]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Admin email</p>
              <p className="mt-2 text-lg font-black text-white break-all">{user?.email}</p>
              <p className="mt-2 text-sm text-zinc-400">This view is locked behind auth and noindex.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Withdrawals</p>
                <p className="mt-2 text-2xl font-black text-white">{stats.pending}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Alerts</p>
                <p className="mt-2 text-2xl font-black text-white">{flagged.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-8">
        <ConversionStrip
          eyebrow="Admin operations"
          title="Keep the payout queue clean and the ledger honest."
          description="Withdrawals, user moderation, and flagged activity all need a quick read before anything moves forward."
          primaryHref="/dashboard"
          primaryLabel="Open dashboard"
          secondaryHref="/transactions"
          secondaryLabel="View ledger"
          variant="private"
          bullets={["Manual approvals", "Security alerts", "Ledger-backed evidence"]}
        />
      </div>

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
                        <span className="text-emerald-400 font-black text-sm">{(w.amountCoins || 0).toLocaleString()} Coins</span>
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
                      <span className="text-emerald-400 font-black">{(u.ledgerBalanceCoins || 0).toLocaleString()} Coins</span>
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
                          onClick={() => setAdjModal({ uid: u.uid, email: u.email || u.uid })}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all active:scale-95"
                        >
                          Adjust
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

      {/* Balance Adjustment Modal */}
      {adjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-white">Adjust Balance</h3>
              <p className="text-xs text-zinc-500 mt-1 font-mono">{adjModal.email}</p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount (coins, use negative to deduct)</span>
              <input
                type="number"
                value={adjAmount}
                onChange={e => setAdjAmount(e.target.value)}
                placeholder="e.g. 500 or -200"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00e6c3]/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Reason (required for audit log)</span>
              <input
                type="text"
                value={adjReason}
                onChange={e => setAdjReason(e.target.value)}
                placeholder="e.g. Bonus for support ticket #123"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00e6c3]/40"
              />
            </label>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setAdjModal(null); setAdjAmount(""); setAdjReason(""); }}
                className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-black uppercase hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustSubmit}
                disabled={adjSubmitting || !adjAmount.trim() || !adjReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#00e6c3] text-black text-xs font-black uppercase disabled:opacity-40 hover:bg-[#00ffda] transition"
              >
                {adjSubmitting ? "Saving..." : "Confirm Adjustment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
