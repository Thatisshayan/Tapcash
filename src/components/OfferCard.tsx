import { useState } from 'react';
import Image from 'next/image';
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
      <div className="group relative tap-card rounded-[1.5rem] p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00e6c3]/[0.05] via-transparent to-[#3a7bff]/[0.08] rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden shrink-0">
                {offer.provider.toLowerCase() === 'lootably' ? (
                  <Image src="https://lootably.com/img/favicon.png" alt="Lootably" width={20} height={20} className="object-contain" />
                ) : offer.provider.toLowerCase() === 'rapidoreach' ? (
                  <Image src="https://rapidoreach.com/wp-content/uploads/2021/08/favicon.png" alt="RapidoReach" width={20} height={20} className="object-contain" />
                ) : (
                  <span className="text-zinc-300 font-black text-xs uppercase">{offer.provider.charAt(0)}</span>
                )}
              </div>
              <span className="px-2.5 py-1.5 bg-white/5 border border-white/8 text-zinc-200 text-[10px] font-black rounded-full uppercase tracking-[0.24em]">
                {offer.provider}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <span className="flex items-center gap-1 text-xs text-zinc-400 font-semibold">
                <Star className="w-3 h-3 fill-[#00e6c3]/20 text-[#00e6c3]" />
                <span>{rating}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-400 font-semibold">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{duration}</span>
              </span>
              {offer.payout >= 500 && (
                <span className="flex items-center gap-1 text-xs text-amber-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>High Value</span>
                </span>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-black tracking-tight text-white group-hover:text-[#00e6c3] transition-colors duration-200 mb-2">
            {offer.title}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
            {offer.description}
          </p>
        </div>

        <div className="relative flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div>
            <p className="text-2xl font-black text-white tracking-tight">
              +{offer.payout.toLocaleString()}
            </p>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-[0.24em]">
              Coins
            </p>
          </div>
          
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] font-black shadow-[0_12px_30px_rgba(58,123,255,0.16)] hover:opacity-95 hover:scale-[1.02] transition-all duration-200"
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

