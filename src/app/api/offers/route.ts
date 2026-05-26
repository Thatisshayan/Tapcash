// src/app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Offer } from '@/types/offer';

interface RapidoReachSurvey {
  SurveyNumber: string;
  SurveyUrl: string;
  Reward: number;
  LOI: number;
  MatchingPercentage: number;
  vc_name: string;
  Link: string;
  ProvidedBy: string;
  CPI: number;
  Survey?: {
    BidLengthOfInterview?: number;
    SurveyName?: string;
  };
}

function transformOffer(survey: RapidoReachSurvey): Offer {
  return {
    id: survey.SurveyNumber,
    title: survey.Survey?.SurveyName || 'Premium Survey',
    description: `Complete this ${survey.LOI} minute survey to earn rewards!`,
    payout: survey.Reward,
    clickUrl: survey.SurveyUrl,
    provider: 'rapidoreach',
    image: 'https://rapidoreach.com/wp-content/uploads/2021/08/favicon.png',
    category: 'Survey',
  };
}

function extractSurveyList(payload: unknown): RapidoReachSurvey[] {
  if (Array.isArray(payload)) {
    return payload as RapidoReachSurvey[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const candidateKeys = [
    'offers',
    'surveys',
    'surveyList',
    'items',
    'results',
    'data',
    'Data',
    'result',
    'Result',
    'Surveys',
    'Offers',
  ];

  for (const key of candidateKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as RapidoReachSurvey[];
    }
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      for (const nestedKey of ['offers', 'surveys', 'items', 'results', 'data', 'Surveys', 'Offers']) {
        const nestedValue = nested[nestedKey];
        if (Array.isArray(nestedValue)) {
          return nestedValue as RapidoReachSurvey[];
        }
      }
    }
  }

  return [];
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

  const appId = process.env.RAPIDOREACH_APP_ID || process.env.NEXT_PUBLIC_RAPIDOREACH_APP_ID || "parPnrD9RiU";
  const appKey = process.env.RAPIDOREACH_APP_KEY || "3912bbe80f741af48d3624ce4a4d1b37";
  
  const userIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

  try {
    const requestBody = {
      UserId: userId,
      AppId: appId,
      IpAddress: userIp,
      CountryLanguageCode: "ENG-US", // Adjust locale as needed
    };

    const response = await fetch('https://www.rapidoreach.com/getallsurveys-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidoReach-Api-Key': appKey,
      },
      body: JSON.stringify(requestBody),
      next: {
        revalidate: 60, // 1 minute cache
      },
    });

    if (!response.ok) {
      throw new Error(`RapidoReach API returned ${response.status}`);
    }

    const json = await response.json();
    const surveys = extractSurveyList(json);

    if (surveys.length > 0) {
      const offers = surveys.map(transformOffer);
      return NextResponse.json(
        {
          offers,
          source: 'rapidoreach',
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    } else if ((json as { Errors?: unknown }).Errors) {
       // Handle explicit RapidoReach API errors gracefully
       console.error("RapidoReach API Error Object:", (json as { Errors?: unknown }).Errors);
       return NextResponse.json({ offers: [], source: 'rapidoreach' }, { status: 200 });
    } else {
      console.warn('RapidoReach API returned no survey list. Falling back to empty offer array.', {
        responseKeys: typeof json === 'object' && json ? Object.keys(json as Record<string, unknown>) : [],
      });
      return NextResponse.json({ offers: [], source: 'rapidoreach' }, { status: 200 });
    }
  } catch (error) {
    console.error('RapidoReach API fetch error:', error);
    // Return empty array on API failure so dashboard doesn't break
    return NextResponse.json({ offers: [], source: 'rapidoreach' }, { status: 200 });
  }
}
