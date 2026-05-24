"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface ToastNotification {
  id: string;
  message: string;
  amount: number;
}

export default function GlobalNotificationListener() {
  const { user } = useAuth();
  const { width, height } = useWindowSize();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Keep track of the first load so we don't trigger confetti for old transactions
  const isFirstLoad = useRef(true);
  const processedTxs = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Listen to the most recent transaction for the user
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        isFirstLoad.current = false;
        return;
      }

      const doc = snapshot.docs[0];
      const tx = doc.data();

      // Skip processing on the initial fetch
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        processedTxs.current.add(doc.id);
        return;
      }

      // If it's a new, completed transaction that adds coins
      if (!processedTxs.current.has(doc.id) && tx.status === "completed" && tx.amount > 0) {
        processedTxs.current.add(doc.id);

        // Trigger Confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds

        // Add Toast
        const newToast: ToastNotification = {
          id: doc.id,
          message: `Offer Completed!`,
          amount: tx.amount,
        };
        
        setToasts((prev) => [...prev, newToast]);
        
        // Remove Toast after 4 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 4000);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <>
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.15}
            colors={['#10b981', '#34d399', '#059669', '#fbbf24', '#f59e0b', '#ffffff']}
          />
        </div>
      )}

      {/* Floating Notifications */}
      <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-zinc-950 border border-emerald-500/30 px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center gap-3 animate-bounce-slow"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black shrink-0">
              ✓
            </div>
            <div>
              <p className="text-emerald-400 font-bold text-sm tracking-tight leading-none">
                {toast.message}
              </p>
              <p className="text-white font-black mt-1 leading-none">
                +{toast.amount.toLocaleString()} Coins
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
