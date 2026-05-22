import { useState } from 'react';
import { Offer } from '@/types/offer';
import { Sparkles, ArrowUpRight, Star, Clock } from 'lucide-react';
import InstructionModal from './InstructionModal';

interface OfferCardProps {
  offer: Offer;
  onEarn: () => void;
}

export default function OfferCard({ offer, onEarn }: OfferCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Generate deterministic rating & duration for high-fidelity look
  // Payout acts as a stable seed
  const numericalId = offer.payout || 100;
  const rating = ((numericalId % 5) * 0.1 + 4.5).toFixed(1); // results in 4.5, 4.6, 4.7, 4.8, 4.9
  const durationValue = (numericalId % 4) * 5 + 5; // results in 5m, 10m, 15m, 20m
  const duration = `${durationValue}m`;

  return (
    <>
      <div className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(16_185_129_/_0.05)] hover:-translate-y-1">
        {/* Decorative top gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              {offer.provider}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                <Star className="w-3 h-3 fill-emerald-500/20 text-emerald-500" />
                <span>{rating}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{duration}</span>
              </span>
              {offer.payout >= 500 && (
                <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>High Value</span>
                </span>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors duration-200 mb-2">
            {offer.title}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {offer.description}
          </p>
        </div>

        <div className="relative flex items-center justify-between pt-4 border-t border-zinc-900/80 mt-auto">
          <div>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">
              +{offer.payout.toLocaleString()}
            </p>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              Coins
            </p>
          </div>
          
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-200"
          >
            <span>Earn Now</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {modalOpen && (
        <InstructionModal
          offer={offer}
          rating={rating}
          duration={duration}
          onClose={() => setModalOpen(false)}
          onLaunch={onEarn}
        />
      )}
    </>
  );
}
