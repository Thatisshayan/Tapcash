"use client";

import { useAuth } from "../../context/AuthContext";

export default function ReferralsPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <div className="p-8 text-white">Please sign in</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-emerald-400">Refer & Earn</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={`https://tapcash.com/join?ref=${user.uid}`} 
              className="flex-1 rounded bg-black/50 border border-white/10 px-3 py-2 text-zinc-300"
            />
            <button className="bg-emerald-500 text-black px-4 py-2 rounded font-semibold hover:bg-emerald-400 transition">
              Copy
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-400">Referral tracking ready / commission pending.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold mb-4">Stats</h2>
          <div className="space-y-2 text-zinc-300">
            <p>Total Referrals: 0</p>
            <p>Earned from Referrals: $0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
