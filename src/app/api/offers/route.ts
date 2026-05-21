// src/app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Offer } from '@/types/offer';

interface LootablyOffer {
  type: 'singlestep' | 'multistep';
  name: string;
  description: string;
  image: string;
  countries: string[];
  offerID: string;
  categories: string[];
  devices: string[];
  link: string;
  conversionRate: number;
  currencyReward?: number | 'variable';
  revenue?: number | 'variable';
}

const MOCK_OFFERS: Offer[] = [
  {
    id: 'mock-survey-1',
    title: 'Complete a Survey',
    description: 'Share your opinion and earn rewards',
    payout: 150,
    image: '/images/mock/survey.jpg',
    category: 'Surveys',
    clickUrl: '#',
    provider: 'mock',
  },
  {
    id: 'mock-game-1',
    title: 'Download Raid: Shadow Legends',
    description: 'Epic fantasy RPG with stunning graphics',
    payout: 800,
    image: '/images/mock/raid.jpg',
    category: 'Games',
    clickUrl: '#',
    provider: 'mock',
  },
  {
    id: 'mock-video-1',
    title: 'Watch 3 Videos',
    description: 'Watch short videos and get paid',
    payout: 25,
    image: '/images/mock/video.jpg',
    category: 'Videos',
    clickUrl: '#',
    provider: 'mock',
  },
  {
    id: 'mock-app-1',
    title: 'Install Cash App',
    description: 'Send and receive money instantly',
    payout: 200,
    image: '/images/mock/cashapp.jpg',
    category: 'Apps',
    clickUrl: '#',
    provider: 'mock',
  },
];

function transformOffer(offer: LootablyOffer): Offer {
  let payout = 0;
  if (typeof offer.currencyReward === 'number') {
    payout = offer.currencyReward;
  } else if (typeof offer.currencyReward === 'string' && offer.currencyReward !== 'variable') {
    payout = parseFloat(offer.currencyReward) || 0;
  }

  return {
    id: offer.offerID,
    title: offer.name,
    description: offer.description,
    payout: payout,
    clickUrl: offer.link,
    provider: 'lootably',
    image: offer.image || undefined,
    category: offer.categories?.[0]
      ? offer.categories[0].charAt(0).toUpperCase() + offer.categories[0].slice(1)
      : 'Offer',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId query parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LOOTABLY_API_KEY;
  const placementId = process.env.LOOTABLY_PLACEMENT_ID || process.env.PLACEMENT_ID || 'dummy-placement-id';
  
  const userIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

  if (!apiKey || apiKey === '') {
    // Return mock offers when no API key is configured
    return NextResponse.json(
      {
        offers: MOCK_OFFERS,
        source: 'mock',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  }

  try {
    const requestBody = {
      placementID: placementId,
      apiKey: apiKey,
      userData: {
        userID: userId,
        userAgentHeader: userAgent,
        ipAddress: userIp,
      }
    };

    const response = await fetch('https://api.lootably.com/api/v2/offers/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
      next: {
        revalidate: 300, // 5 minutes cache
      },
    });

    if (!response.ok) {
      throw new Error(`Lootably API returned ${response.status}`);
    }

    const json = await response.json();
    
    if (json.success && json.data && Array.isArray(json.data.offers)) {
      const offers = json.data.offers.map(transformOffer);
      return NextResponse.json(
        {
          offers,
          source: 'lootably',
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    } else {
      throw new Error(json.message || 'Lootably API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Lootably API error:', error);
    // Fallback to mock offers on API failure
    return NextResponse.json(
      {
        offers: MOCK_OFFERS,
        source: 'mock',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  }
}