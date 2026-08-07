import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Offer } from '@/types/offer';
import { formatCadFromCoins } from '@/lib/currency';
import { Flame, CheckCircle, Zap, TrendingUp, Clock, Star, Target } from 'lucide-react';

const InstructionModal = dynamic(() => import('./InstructionModal'), {
  ssr: false,
});

interface OfferCardProps {
  offer: Offer;
  onEarn: () => void;
  locked?: boolean;
  featured?: boolean;
}

function getDifficulty(payout: number, category?: string): { label: string; color: string; icon: typeof Target } {
  if (payout >= 1000) return { label: 'Hard', color: 'text-[var(--color-hot-red)]', icon: Target };
  if (payout >= 500) return { label: 'Medium', color: 'text-[var(--color-brand-green)]', icon: Clock };
  if (category?.toLowerCase().includes('survey')) return { label: 'Easy', color: 'text-[var(--color-brand-purple)]', icon: CheckCircle };
  return { label: 'Quick', color: 'text-[var(--color-brand-cyan)]', icon: Zap };
}

function getEstimatedTime(payout: number, category?: string): string {
  if (category?.toLowerCase().includes('survey')) return '~5m';
  if (payout >= 1000) return '~30m';
  if (payout >= 500) return '~15m';
  return '~5m';
}

export default function OfferCard({ offer, onEarn, locked = false, featured = false }: OfferCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const cadValue = formatCadFromCoins(offer.payout);
  const difficulty = getDifficulty(offer.payout, offer.category);
  const estimatedTime = getEstimatedTime(offer.payout, offer.category);
  const DifficultyIcon = difficulty.icon;

  return (
    <>
      {/* Aurora layout language: no bordered card panel -- grouped with spacing +
          soft shadow + typography only (packages/tokens/tokens.json antiPatterns). */}
      <div
        className="group relative rounded-3xl p-6 transition-all hover:-translate-y-1"
        style={{ boxShadow: 'var(--shadow-card-elevated)' }}
      >
        {featured && (
          <div className="absolute -top-3 left-6 z-10">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-lg"
              style={{ background: 'var(--color-hot-red)' }}
            >
              <Flame className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                HOT
              </span>
            </div>
          </div>
        )}

        <div className="relative">
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl p-2"
            style={{ background: 'linear-gradient(135deg, rgba(108,92,224,0.12), rgba(62,111,217,0.12))' }}
          >
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

          <h3 className="mb-3 text-xl font-black text-white">
            {offer.title}
          </h3>

          {/* Data-driven badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold ${difficulty.color}`}>
              <DifficultyIcon className="mr-1 inline h-3 w-3" />
              {difficulty.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
              <Clock className="mr-1 inline h-3 w-3 text-[var(--color-brand-cyan)]" />
              {estimatedTime}
            </span>
            {offer.payout >= 500 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                <TrendingUp className="mr-1 inline h-3 w-3 text-[var(--color-brand-green)]" />
                High Pay
              </span>
            )}
            {featured && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                <Star className="mr-1 inline h-3 w-3 text-[var(--color-brand-green)]" />
                Popular
              </span>
            )}
          </div>

          <div className="mb-4">
            <p
              className="text-3xl font-black bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(100deg, #F0CE97, #D9B678 60%, #B98F4C)' }}
            >
              ${cadValue}
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            disabled={locked}
            className="w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-wide transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, #F0CE97, #D9B678)',
              color: 'var(--color-bg-base)',
              boxShadow: '0 10px 30px rgba(217,182,120,0.28)',
            }}
          >
            {locked ? "Locked" : "Start Offer"}
          </button>
        </div>

        {locked && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl backdrop-blur-sm"
            style={{ background: 'rgba(10,10,13,0.8)' }}
          >
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
          duration={estimatedTime}
          onClose={() => setModalOpen(false)}
          onLaunch={onEarn}
        />
      )}
    </>
  );
}

