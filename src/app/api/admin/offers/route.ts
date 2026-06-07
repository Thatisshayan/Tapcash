import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// GET - Fetch all offers
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'view_offers',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Fetch all offers
    const offersSnapshot = await adminDb.collection('offers').get();
    const offers = offersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        reward: data.reward || 0,
        category: data.category,
        difficulty: data.difficulty,
        status: data.status || 'active',
        featured: data.featured || false,
        conversions: data.conversions || 0,
        clicks: data.clicks || 0,
        revenue: data.revenue || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });

    return NextResponse.json({ offers });

  } catch (error) {
    console.error('Admin offers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

// POST - Create new offer
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const offerData = await request.json();

    if (!offerData.name || !offerData.description || !offerData.reward) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new offer
    const newOffer = {
      name: offerData.name,
      description: offerData.description,
      reward: offerData.reward,
      category: offerData.category || 'games',
      difficulty: offerData.difficulty || 'easy',
      status: offerData.status || 'active',
      featured: offerData.featured || false,
      conversions: 0,
      clicks: 0,
      revenue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decodedToken.uid
    };

    const docRef = await adminDb.collection('offers').add(newOffer);

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'create_offer',
      targetOfferId: docRef.id,
      details: { name: offerData.name, reward: offerData.reward },
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true, offerId: docRef.id });

  } catch (error) {
    console.error('Admin offers POST error:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}

// PATCH - Update existing offer
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const offerData = await request.json();

    if (!offerData.id) {
      return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }

    const offerDoc = await adminDb.collection('offers').doc(offerData.id).get();
    if (!offerDoc.exists) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Update offer
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: decodedToken.uid
    };

    if (offerData.name) updateData.name = offerData.name;
    if (offerData.description) updateData.description = offerData.description;
    if (offerData.reward !== undefined) updateData.reward = offerData.reward;
    if (offerData.category) updateData.category = offerData.category;
    if (offerData.difficulty) updateData.difficulty = offerData.difficulty;
    if (offerData.status) updateData.status = offerData.status;
    if (offerData.featured !== undefined) updateData.featured = offerData.featured;

    await adminDb.collection('offers').doc(offerData.id).update(updateData);

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'update_offer',
      targetOfferId: offerData.id,
      details: updateData,
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin offers PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

// DELETE - Delete offer
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { offerId } = await request.json();

    if (!offerId) {
      return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }

    const offerDoc = await adminDb.collection('offers').doc(offerId).get();
    if (!offerDoc.exists) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Delete offer
    await adminDb.collection('offers').doc(offerId).delete();

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'delete_offer',
      targetOfferId: offerId,
      details: offerDoc.data(),
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin offers DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}

// Made with Bob
