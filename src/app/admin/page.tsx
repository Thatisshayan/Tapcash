"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: Date;
}

interface Postback {
  id: string;
  userId: string;
  amountCents: number;
  offerId: string;
  ipAddress: string;
  status: string;
  createdAt: Date;
}

interface FlaggedTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: Date;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [postbacks, setPostbacks] = useState<Postback[]>([]);
  const [flagged, setFlagged] = useState<FlaggedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending withdrawals (limit 20)
      const withdrawalsQuery = query(
        collection(db, "withdrawals"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
      const withdrawalsData: Withdrawal[] = [];
      withdrawalsSnapshot.forEach((doc) => {
        const data = doc.data();
        withdrawalsData.push({
          id: doc.id,
          userId: data.userId,
          amount: data.amount,
          method: data.method,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setWithdrawals(withdrawalsData);

      // Fetch recent postbacks (limit 20)
      const postbacksQuery = query(
        collection(db, "postbacks"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const postbacksSnapshot = await getDocs(postbacksQuery);
      const postbacksData: Postback[] = [];
      postbacksSnapshot.forEach((doc) => {
        const data = doc.data();
        postbacksData.push({
          id: doc.id,
          userId: data.userId,
          amountCents: data.amountCents,
          offerId: data.offerId,
          ipAddress: data.ipAddress,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setPostbacks(postbacksData);

      // Fetch flagged transactions (limit 10)
      const flaggedQuery = query(
        collection(db, "flaggedTransactions"),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const flaggedSnapshot = await getDocs(flaggedQuery);
      const flaggedData: FlaggedTransaction[] = [];
      flaggedSnapshot.forEach((doc) => {
        const data = doc.data();
        flaggedData.push({
          id: doc.id,
          userId: data.userId,
          amount: data.amount,
          reason: data.reason,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setFlagged(flaggedData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setMessage("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleWithdrawal = async (id: string, action: "approve" | "reject") => {
    try {
      setActionLoading(id);
      setMessage(null);

      const token = await user?.getIdToken();
      const response = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ withdrawalId: id, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process withdrawal");
      }

      setMessage(`Withdrawal ${action === "approve" ? "approved" : "rejected"} successfully`);
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      setMessage(error instanceof Error ? error.message : "Failed to process withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400">Please sign in to access admin panel</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.includes("successfully") 
              ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700" 
              : "bg-red-900/50 text-red-300 border border-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Pending Withdrawals</h3>
            <p className="text-3xl font-bold text-emerald-400">{withdrawals.length}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Recent Postbacks</h3>
            <p className="text-3xl font-bold text-emerald-400">{postbacks.length}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Flagged Transactions</h3>
            <p className="text-3xl font-bold text-red-400">{flagged.length}</p>
          </div>
        </div>

        {/* Pending Withdrawals Table */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 mb-8">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Pending Withdrawals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">User ID</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Amount</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Method</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Date</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No pending withdrawals
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="p-4 text-white">{withdrawal.userId}</td>
                      <td className="p-4 text-emerald-400 font-medium">
                        ${(withdrawal.amount / 100).toFixed(2)}
                      </td>
                      <td className="p-4 text-gray-300