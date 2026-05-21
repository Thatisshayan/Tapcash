import { Offer } from '@/types/offer';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
  onEarn: () => void;
}

export default function OfferCard({ offer, onEarn }: OfferCardProps) {
  return (
    <div className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(16_185_129_/_0.05)] hover:-translate-y-1">
      {/* Decorative top gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            {offer.provider}
          </span>
          {offer.payout >= 500 && (
            <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>High Value</span>
            </span>
          )}
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
          onClick={onEarn}
          className="flex items-center gap-1 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-200"
        >
          <span>Earn Now</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
