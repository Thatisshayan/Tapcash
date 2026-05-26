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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId query parameter is required' },
      { status: 400 }
    );
  }

  const appId = process.env.NEXT_PUBLIC_RAPIDOREACH_APP_ID || "parPnrD9RiU";
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
    
    // RapidoReach success response is typically a direct JSON array of surveys
    if (Array.isArray(json)) {
      const offers = json.map(transformOffer);
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
    } else if (json.Errors) {
       // Handle explicit RapidoReach API errors gracefully
       console.error("RapidoReach API Error Object:", json.Errors);
       return NextResponse.json({ offers: [], source: 'rapidoreach' }, { status: 200 });
    } else {
      throw new Error('RapidoReach API returned unsuccessful response');
    }
  } catch (error) {
    console.error('RapidoReach API fetch error:', error);
    // Return empty array on API failure so dashboard doesn't break
    return NextResponse.json({ offers: [], source: 'rapidoreach' }, { status: 200 });
  }
}