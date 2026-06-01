"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle, ArrowRight, Clock, Star, Play } from "lucide-react";
import { Offer } from "@/types/offer";

interface InstructionModalProps {
  offer: Offer;
  onClose: () => void;
  onLaunch: () => void;
  rating: string;
  duration: string;
}

export default function InstructionModal({ offer, onClose, onLaunch, rating, duration }: InstructionModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Container card */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] md:p-8 p-6 flex flex-col gap-6 animate-slideUp">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none" />

        {/* Header bar */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="self-start px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
              {offer.provider} Offer
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">{offer.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats segment */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 relative z-10">
          <div className="flex flex-col items-center justify-center text-center p-1 border-r border-zinc-900">
            <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-lg">
              <span>{rating}</span>
              <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Rating</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-1 border-r border-zinc-900">
            <div className="flex items-center gap-1 text-zinc-200 font-extrabold text-lg">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>{duration}</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Duration</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-1">
            <div className="text-emerald-400 font-black text-lg">
              +{offer.payout.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Coins</span>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="flex flex-col gap-3 relative z-10">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Paths to Conversion</h3>
          
          <div className="space-y-3">
            <div className="flex gap-3 items-start bg-zinc-900/10 border border-zinc-900 p-3 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Click &quot;Launch Offer&quot;</h4>
                <p className="text-xs text-zinc-500 mt-0.5">You will be securely redirected to the {offer.provider} marketplace.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-zinc-900/10 border border-zinc-900 p-3 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Install & Register</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Download and open the app for the very first time on your device.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-zinc-900/10 border border-zinc-900 p-3 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Complete Objectives</h4>
                <p className="text-xs text-zinc-500 mt-0.5">{offer.description}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-zinc-900/10 border border-zinc-900 p-3 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Earn Coins Instantly</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Coins are instantly credited to your wallet balance within 15 minutes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Anti-Fraud Warnings */}
        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-2.5 relative z-10">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 leading-normal">
            <span className="text-red-400/90 font-bold">Anti-Fraud Requirement:</span> VPNs, proxies, AdBlockers, or emulators are strictly prohibited. You must be a first-time installer. Failure to comply will lead to offer rejection and status ban.
          </p>
        </div>

        {/* Bottom CTA Action */}
        <button
          onClick={() => {
            onLaunch();
            onClose();
          }}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 relative z-10"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>Launch Offer Now</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
