"use client";

import { useAuth } from "../../context/AuthContext";

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <div className="p-8 text-white">Access Denied</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-emerald-400">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Payouts</h2>
          <p className="text-zinc-400 text-sm">No pending payouts.</p>
          {/* TODO: Implement backend payout approval/rejection mutation */}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Postbacks</h2>
          <p className="text-zinc-400 text-sm">Postback logs will appear here.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold mb-4">Fraud Flags</h2>
          <p className="text-zinc-400 text-sm">No suspicious activity detected.</p>
        </div>
      </div>
    </div>
  );
}
