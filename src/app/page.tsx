'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import OfferCard from '@/components/OfferCard';
import { Offer } from '@/types/offer';

const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Mock Offer 1',
    description: 'Earn 100 coins by completing this offer',
    payout: 100,
    clickUrl: 'https://example.com/offer1',
    provider: 'lootably',
  },
  {
    id: '2',
    title: 'Mock Offer 2',
    description: 'Earn 200 coins by completing this offer',
    payout: 200,
    clickUrl: 'https://example.com/offer2',
    provider: 'lootably',
  },
  {
    id: '3',
    title: 'Mock Offer 3',
    description: 'Earn 300 coins by completing this offer',
    payout: 300,
    clickUrl: 'https://example.com/offer3',
    provider: 'lootably',
  },
];

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOffers(MOCK_OFFERS);
      setLoading(false);
      return;
    }

    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/offers?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        const data: Offer[] = await response.json();
        setOffers(data);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers. Showing cached offers.');
        setOffers(MOCK_OFFERS);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user]);

  const handleEarn = async (offer: Offer) => {
    if (!user) return;

    try {
      await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          offerId: offer.id,
          provider: 'lootably',
        }),
      });
    } catch (err) {
      console.error('Error logging click:', err);
    }

    window.open(offer.clickUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-emerald-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Earn Coins</h1>
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-emerald-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-emerald-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-emerald-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-emerald-700 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-emerald-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}
      {error && !loading && (
        <div className="bg-yellow-600 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onEarn={() => handleEarn(offer)} />
          ))}
        </div>
      )}
    </div>
  );
}