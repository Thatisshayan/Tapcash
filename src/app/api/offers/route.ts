// src/app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface LootablyOffer {
  id: string;
  name: string;
  description: string;
  payout: number;
  image: string;
  type: string;
  url: string;
}

interface StandardOffer {
  id: string;
  title: string;
  description: string;
  payout: number;
  image: string;
  category: string;
  clickUrl: string;
}

const MOCK_OFFERS: StandardOffer[] = [
  {
    id: 'mock-survey-1',
    title: 'Complete a Survey',
    description: 'Share your opinion and earn rewards',
    payout: 150,
    image: '/images/mock/survey.jpg',
    category: 'Surveys',
    clickUrl: '#',
  },
  {
    id: 'mock-game-1',
    title: 'Download Raid: Shadow Legends',
    description: 'Epic fantasy RPG with stunning graphics',
    payout: 800,
    image: '/images/mock/raid.jpg',
    category: 'Games',
    clickUrl: '#',
  },
  {
    id: 'mock-video-1',
    title: 'Watch 3 Videos',
    description: 'Watch short videos and get paid',
    payout: 25,
    image: '/images/mock/video.jpg',
    category: 'Videos',
    clickUrl: '#',
  },
  {
    id: 'mock-app-1',
    title: 'Install Cash App',
    description: 'Send and receive money instantly',
    payout: 200,
    image: '/images/mock/cashapp.jpg',
    category: 'Apps',
    clickUrl: '#',
  },
];

function transformOffer(offer: LootablyOffer): StandardOffer {
  return {
    id: offer.id,
    title: offer.name,
    description: offer.description,
    payout: offer.payout,
    image: offer.image,
    category: offer.type.charAt(0).toUpperCase() + offer.type.slice(1),
    clickUrl: offer.url,
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
  const userIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

  if (!apiKey) {
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
    const response = await fetch(
      `https://lootably.com/api/offerwall?api_key=${apiKey}&user_id=${userId}&ip=${userIp}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: 300, // 5 minutes cache
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lootably API returned ${response.status}`);
    }

    const data: LootablyOffer[] = await response.json();
    const offers = data.map(transformOffer);

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
  } catch (error) {
    console.error('Lootably API error:', error);
    // Fallback to mock offers on API failure
    return NextResponse.json(
      {
        offers: MOCK_OFFERS,
        source: 'mock',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  }
}