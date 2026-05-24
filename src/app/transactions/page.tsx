"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Header from "@/components/Header";
import { 
  ArrowUpRight, ArrowDownLeft, 
  Loader2, CheckCircle, Clock, AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface LedgerTx {
  id: string;
  type: string;
  amount: number;
  method?: string;
  status: string;
  createdAt: any;
}

export default function TransactionsLedgerPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(true);

  // Subscribe to real-time transaction ledger
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LedgerTx[];
      setTransactions(txs);
      setLoadingTxs(false);
    }, (err) => {
      console.error("Firestore transactions subscription error:", err);
      setLoadingTxs(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 text-center backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Access Restricted</h1>
            <p className="text-zinc-500 text-sm mb-6">Please log in to your account to view your transactions.</p>
            <Link href="/auth/signin" className="inline-block px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition w-full">
              Sign In Now
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Page Title & Dashboard Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Ledger Records</h1>
            <p className="text-zinc-500 text-sm mt-1">Live tracking of your earnings and redemptions.</p>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden backdrop-blur-xl">
          {loadingTxs ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="text-zinc-500 text-xs">Syncing ledger records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm max-w-sm mx-auto">
              <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <p className="font-bold text-zinc-400">No Transactions Yet</p>
              <p className="text-zinc-600 text-xs mt-1.5 leading-relaxed">Your ledger is clean. Go complete high-paying offers on the homepage to start stacking rewards!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-950/60 border-b border-zinc-900/80 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Action Type</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Flow Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Registered Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {transactions.map((tx) => {
                    const isAddition = tx.amount > 0;
                    const formattedDate = tx.createdAt?.toDate 
                      ? tx.createdAt.toDate().toLocaleString([], { dateStyle: "short", timeStyle: "short" }) 
                      : "—";

                    return (
                      <tr key={tx.id} className="hover:bg-zinc-900/20 transition-all duration-150">
                        <td className="px-6 py-4.5 font-bold text-white">
                          <span className="flex items-center gap-2">
                            {isAddition ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="capitalize">{tx.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4.5 font-semibold text-zinc-400">
                          <span className="uppercase tracking-wider text-xs">
                            {tx.method || "Offerwall"}
                          </span>
                        </td>
                        <td className={`px-6 py-4.5 font-black ${isAddition ? "text-emerald-400" : "text-blue-400"}`}>
                          {isAddition ? "+" : ""}{tx.amount.toLocaleString()} Coins
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                            tx.status === "completed" || tx.status === "approved"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : tx.status === "pending"
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                            {tx.status === "completed" || tx.status === "approved" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : tx.status === "pending" ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            <span>{tx.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-zinc-500 text-xs font-semibold text-right">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
