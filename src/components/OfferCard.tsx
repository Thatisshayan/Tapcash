import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Offer } from '@/types/offer';
import { Flame, CheckCircle, Zap, TrendingUp } from 'lucide-react';

// Lazy load the modal to reduce initial bundle size
const InstructionModal = dynamic(() => import('./InstructionModal'), {
  ssr: false,
});

interface OfferCardProps {
  offer: Offer;
  onEarn: () => void;
  locked?: boolean;
  featured?: boolean;
}

export default function OfferCard({ offer, onEarn, locked = false, featured = false }: OfferCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Calculate CAD value (100 coins = $1 CAD)
  const cadValue = (offer.payout / 100).toFixed(2);

  return (
    <>
      <div className="group relative rounded-3xl border border-white/8 bg-[#1A1F2E] p-6 transition-all hover:border-[#7C3DFF]/30 hover:-translate-y-1">
        {/* HOT Badge for featured offers */}
        {featured && (
          <div className="absolute -top-3 left-6 z-10">
            <div className="flex items-center gap-1.5 rounded-full bg-[#FF3B3B] px-3 py-1.5 shadow-lg">
              <Flame className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                HOT
              </span>
            </div>
          </div>
        )}

        <div className="relative">
          {/* Game/App Image */}
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#7C3DFF]/10 to-[#18D9FF]/10 p-2">
            {offer.image ? (
              <Image
                src={offer.image}
                alt={offer.title}
                width={80}
                height={80}
                className="object-contain"
              />
            ) : offer.provider.toLowerCase() === 'lootably' ? (
              <Image src="https://lootably.com/img/favicon.png" alt="Lootably" width={32} height={32} className="object-contain" />
            ) : offer.provider.toLowerCase() === 'rapidoreach' ? (
              <Image src="https://rapidoreach.com/wp-content/uploads/2021/08/favicon.png" alt="RapidoReach" width={32} height={32} className="object-contain" />
            ) : (
              <span className="text-2xl font-black text-white">{offer.provider.charAt(0)}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl font-black text-white">
            {offer.title}
          </h3>

          {/* Badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
              <CheckCircle className="mr-1 inline h-3 w-3 text-[#31F06F]" />
              Easy
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
              <Zap className="mr-1 inline h-3 w-3 text-[#18D9FF]" />
              Fast Payout
            </span>
            {offer.payout >= 500 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                <TrendingUp className="mr-1 inline h-3 w-3 text-[#FFC442]" />
                High
              </span>
            )}
            {featured && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                Popular
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-3xl font-black text-[#31F06F]">
              ${cadValue}
            </p>
          </div>

          {/* Start Offer Button */}
          <button
            onClick={() => setModalOpen(true)}
            disabled={locked}
            className="w-full rounded-full bg-[#7C3DFF] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_8px_32px_rgba(124,61,255,0.3)] transition-all hover:bg-[#8B4DFF] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {locked ? "Locked" : "Start Offer"}
          </button>
        </div>

        {locked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-[#0A0E1A]/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-lg font-black text-white">Verify Email</p>
              <p className="text-sm text-zinc-400">to unlock this offer</p>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <InstructionModal
          offer={offer}
          rating="4.8"
          duration="10m"
          onClose={() => setModalOpen(false)}
          onLaunch={onEarn}
        />
      )}
    </>
  );
}

