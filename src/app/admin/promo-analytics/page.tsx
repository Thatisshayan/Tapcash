"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, Loader2, TicketPercent, Search } from "lucide-react";

interface PromoStats {
  code: string;
  redemptions: number;
  uniqueUsers: number;
  coinsIssued: number;
  cadValue: string;
}

export default function PromoAnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PromoStats[]>([]);
  const [totalCodes, setTotalCodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/promo-analytics", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      setAnalytics(data.analytics || []);
      setTotalCodes(data.totalCodes || 0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const filtered = analytics.filter((p) => p.code.toLowerCase().includes(search.toLowerCase()));

  const totals = {
    redemptions: analytics.reduce((s, p) => s + p.redemptions, 0),
    coinsIssued: analytics.reduce((s, p) => s + p.coinsIssued, 0),
    cadValue: analytics.reduce((s, p) => s + parseFloat(p.cadValue), 0).toFixed(2),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Promo Code Analytics</h1>
        <p className="text-xs text-zinc-500 mt-1">Redemption statistics for all promo codes</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-semibold">{error}</div>
      )}

      {/* Summary cards */}
      {!loading && analytics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Total Codes" value={totalCodes.toString()} icon={TicketPercent} color="#3a7bff" />
          <SummaryCard label="Redemptions" value={totals.redemptions.toLocaleString()} icon={BarChart3} color="#00e6c3" />
          <SummaryCard label="Coins Issued" value={totals.coinsIssued.toLocaleString()} icon={BarChart3} color="#f5c842" />
          <SummaryCard label="Value Issued" value={`$${totals.cadValue} CAD`} icon={BarChart3} color="#7C3DFF" />
        </div>
      )}

      {/* Search */}
      {!loading && analytics.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promo codes..."
            className="w-full bg-[#080c1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00e6c3]/50"
          />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#00e6c3]" /></div>
      ) : analytics.length === 0 ? (
        <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-10 text-center">
          <TicketPercent className="w-8 h-8 mx-auto text-zinc-600" />
          <p className="font-black text-zinc-400 mt-3">No promo redemptions yet</p>
          <p className="text-sm text-zinc-600">Promo code usage will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/6 bg-[#080c1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 text-xs font-semibold">
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-right px-4 py-3">Redemptions</th>
                  <th className="text-right px-4 py-3">Unique Users</th>
                  <th className="text-right px-4 py-3">Coins Issued</th>
                  <th className="text-right px-4 py-3">CAD Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => (
                  <tr key={p.code} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-semibold text-white">{p.code}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{p.redemptions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{p.uniqueUsers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{p.coinsIssued.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#00e6c3]">${p.cadValue}</td>
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

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-[#080c1a] p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <p className="text-xs text-zinc-500 font-semibold">{label}</p>
      </div>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}
