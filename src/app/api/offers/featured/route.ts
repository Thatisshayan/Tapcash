import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface FeaturedOffer {
  id: string;
  title: string;
  description: string;
  payout: number;
  provider: string;
  category: string;
  clickUrl: string;
  image?: string;
  featured?: boolean;
  difficulty?: string;
  estimatedTime?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');

    // Fetch featured offers from Firestore
    let query = adminDb
      .collection('offers')
      .where('active', '==', true)
      .orderBy('payout', 'desc')
      .limit(limit);

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const offers: FeaturedOffer[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      offers.push({
        id: doc.id,
        title: data.title || 'Untitled Offer',
        description: data.description || '',
        payout: data.payout || 0,
        provider: data.provider || 'Unknown',
        category: data.category || 'General',
        clickUrl: data.clickUrl || '',
        image: data.image || data.imageUrl,
        featured: data.featured || false,
        difficulty: data.difficulty || 'Easy',
        estimatedTime: data.estimatedTime || '10-15 min',
      });
    });

    // If no offers in database, return empty array (not fake data)
    if (offers.length === 0) {
      return NextResponse.json({
        offers: [],
        message: 'No featured offers available',
        count: 0,
      });
    }

    return NextResponse.json({
      offers,
      count: offers.length,
      lastUpdated: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching featured offers:', error);
    
    return NextResponse.json(
      {
        offers: [],
        error: 'Failed to fetch offers',
      },
      { status: 500 }
    );
  }
}

// POST endpoint to add/update featured offer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      payout,
      provider,
      category,
      clickUrl,
      image,
      featured,
      difficulty,
      estimatedTime,
    } = body;

    if (!title || !payout || !provider || !clickUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add offer to Firestore
    const offersRef = adminDb.collection('offers');
    const newOffer = {
      title,
      description: description || '',
      payout,
      provider,
      category: category || 'General',
      clickUrl,
      image: image || '',
      featured: featured || false,
      difficulty: difficulty || 'Easy',
      estimatedTime: estimatedTime || '10-15 min',
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await offersRef.add(newOffer);

    return NextResponse.json({
      success: true,
      offerId: docRef.id,
      offer: {
        id: docRef.id,
        ...newOffer,
      },
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}

// Made with Bob
