// src/app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Offer } from '@/types/offer';

interface RapidoReachSurvey {
  SurveyId: string;
  Name?: string;
  Description?: string;
  RewardValue: number;
  LOI?: number; // Length of Interview in minutes
  URL: string;
  ConversionRate?: number;
}

function transformRapidoReachOffer(survey: RapidoReachSurvey): Offer {
  return {
    id: survey.SurveyId.toString(),
    title: survey.Name || 'Paid Survey',
    description: survey.Description || `Complete this ${survey.LOI ? `${survey.LOI} minute ` : ''}survey to earn rewards!`,
    payout: survey.RewardValue || 0,
    clickUrl: survey.URL,
    provider: 'rapidoreach',
    image: 'https://rapidoreach.com/wp-content/uploads/2021/08/favicon.png', // Generic RapidoReach logo
    category: 'Survey',
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

  // Use the specific RapidoReach Monetization/Supplier API key
  const apiKey = process.env.RAPIDOREACH_PUBLISHER_KEY;
  
  if (!apiKey || apiKey === '') {
    // Gracefully handle missing configuration
    return NextResponse.json(
      { error: 'RapidoReach integration not fully configured. Missing Publisher Key.' },
      { status: 503 }
    );
  }

  try {
    // Constructing standard RapidoReach Supplier API request.
    // Note: The exact endpoint and parameters may vary slightly based on your specific RapidoReach account configuration.
    const apiUrl = new URL('https://api.rapidoreach.com/api/v1/surveys');
    apiUrl.searchParams.append('api_key', apiKey);
    apiUrl.searchParams.append('user_id', userId);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 180, // Cache for 3 minutes to avoid API rate limits
      },
    });

    if (!response.ok) {
      throw new Error(`RapidoReach API returned ${response.status}`);
    }

    const json = await response.json();
    
    // RapidoReach usually returns an array of surveys directly or wrapped in a data object
    const surveyList: RapidoReachSurvey[] = Array.isArray(json) ? json : (json.surveys || json.data || []);

    if (Array.isArray(surveyList)) {
      const offers = surveyList.map(transformRapidoReachOffer);
      return NextResponse.json(
        {
          offers,
          source: 'rapidoreach',
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
          },
        }
      );
    } else {
      throw new Error('RapidoReach API returned unexpected format');
    }
  } catch (error) {
    console.error('RapidoReach API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown RapidoReach error' },
      { status: 503 }
    );
  }
}