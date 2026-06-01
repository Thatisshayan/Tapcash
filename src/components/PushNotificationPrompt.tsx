"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, X } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem("push_prompt_dismissed")) return;

    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setShow(false);
    localStorage.setItem("push_prompt_dismissed", "1");
  };

  const enable = async () => {
    setDismissed(true);
    setShow(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      localStorage.setItem("push_prompt_dismissed", "1");
    } catch (err) {
      console.error("[PUSH]", err);
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] z-[300] rounded-2xl bg-[#080c1a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-5"
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#f5c842]/10 border border-[#f5c842]/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#f5c842]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm">Get notified when you earn</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                We&apos;ll ping you for bonus events, cashout updates, and daily streak reminders.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={enable}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#f5c842] text-[#050816] text-xs font-black hover:opacity-90 transition"
            >
              <Bell className="w-3.5 h-3.5" /> Enable Notifications
            </button>
            <button
              onClick={dismiss}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/8 text-zinc-500 text-xs font-semibold hover:text-white transition"
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
