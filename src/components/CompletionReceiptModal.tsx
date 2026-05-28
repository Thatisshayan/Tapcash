"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Share2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  coins: number;
  source: string;
  multiplier?: number;
}

export default function CompletionReceiptModal({ open, onClose, coins, source, multiplier = 1 }: Props) {
  const base = multiplier > 1 ? Math.round(coins / multiplier) : coins;
  const bonus = coins - base;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-sm bg-[#080c1a] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          >
            {/* Gold glow top */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#f5c842]/15 to-transparent pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative px-7 pt-8 pb-8 text-center space-y-5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#f5c842]/10 border border-[#f5c842]/25 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-[#f5c842]" />
                </div>
              </motion.div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5c842] mb-2">Task Completed</p>
                <h2 className="text-2xl font-black text-white leading-tight">{source}</h2>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Base reward</span>
                  <span className="font-black text-white">+{base.toLocaleString()} coins</span>
                </div>
                {bonus > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#f5c842]">{multiplier}× Bonus Event</span>
                    <span className="font-black text-[#f5c842]">+{bonus.toLocaleString()} coins</span>
                  </div>
                )}
                <div className="border-t border-white/8 pt-3 flex items-center justify-between">
                  <span className="text-zinc-400 text-sm font-semibold">Total earned</span>
                  <span className="text-2xl font-black text-[#f5c842]">+{coins.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600">Credited to your ledger instantly. No waiting.</p>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-[#f5c842] text-[#050816] text-sm font-black hover:opacity-90 transition"
                >
                  Keep Earning
                </button>
                <button
                  onClick={() => {
                    navigator.share?.({ title: "I just earned on TapCash!", text: `Earned +${coins} coins on TapCash! ${source}`, url: "https://tapcash.online" }).catch(() => {});
                  }}
                  className="w-12 flex items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-zinc-400 hover:text-white transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
