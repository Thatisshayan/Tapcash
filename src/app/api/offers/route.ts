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
    // Return 503 Service Unavailable when no API key is configured
    return NextResponse.json(
      { error: 'Lootably integration not configured.' },
      { status: 503 }
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
    // Return 503 Service Unavailable on API failure
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown Lootably error' },
      { status: 503 }
    );
  }
}