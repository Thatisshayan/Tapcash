"use client";

import { useAuth } from "../../context/AuthContext";

export default function TransactionsPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <div className="p-8 text-white">Please sign in</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Transaction History</h1>
      
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
        <div className="space-y-4">
          <div className="text-zinc-400 text-center py-8">
            No transactions found. Complete an offer to see it here.
          </div>
        </div>
      </div>
    </div>
  );
}
