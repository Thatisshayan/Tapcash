// src/app/api/postbacks/offerwall/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

interface OfferwallPayload {
  userId: string;
  offerId: string;
  amount: number;
  signature: string;
  timestamp?: number;
  [key: string]: unknown;
}

const OFFERWALL_SECRET = process.env.OFFERWALL_SECRET || '';

function verifySignature(payload: OfferwallPayload): boolean {
  if (!OFFERWALL_SECRET) {
    console.error('OFFERWALL_SECRET is not configured');
    return false;
  }

  const { signature, ...data } = payload;
  const sortedKeys = Object.keys(data).sort();
  const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  const expectedSignature = crypto
    .createHmac('sha256', OFFERWALL_SECRET)
    .update(signString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract and validate required parameters
    const userId = searchParams.get('userId');
    const offerId = searchParams.get('offerId');
    const amountStr = searchParams.get('amount');
    const signature = searchParams.get('signature');
    const timestamp = searchParams.get('timestamp');

    if (!userId || !offerId || !amountStr || !signature) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }

    // Build payload for signature verification
    const payload: OfferwallPayload = {
      userId,
      offerId,
      amount,
      signature,
    };
    if (timestamp) {
      payload.timestamp = parseInt(timestamp, 10);
    }

    // Verify signature
    if (!verifySignature(payload)) {
      console.warn(`Invalid signature for offer ${offerId} user ${userId}`);
      return new NextResponse('Invalid signature', { status: 403 });
    }

    // Dedup check and credit user wallet via Firestore transaction
    const userRef = adminDb.collection('users').doc(userId);
    const offerRef = adminDb.collection('offerwall_postbacks').doc(`${userId}_${offerId}`);

    await adminDb.runTransaction(async (transaction) => {
      const offerDoc = await transaction.get(offerRef);
      
      if (offerDoc.exists) {
        throw new Error('DUPLICATE_OFFER');
      }

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('USER_NOT_FOUND');
      }

      // Create offer postback record
      transaction.set(offerRef, {
        userId,
        offerId,
        amount,
        creditedAt: FieldValue.serverTimestamp(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      // Credit user wallet
      transaction.update(userRef, {
        'wallet.balance': FieldValue.increment(amount),
        'wallet.lastUpdated': FieldValue.serverTimestamp(),
      });
    });

    console.log(`Successfully credited ${amount} to user ${userId} for offer ${offerId}`);
    return new NextResponse('1', { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'DUPLICATE_OFFER') {
        console.warn(`Duplicate offerwall postback: ${error.message}`);
        return new NextResponse('1', { status: 200 }); // Return success for idempotency
      }
      if (error.message === 'USER_NOT_FOUND') {
        console.error(`User not found: ${error.message}`);
        return new NextResponse('User not found', { status: 404 });
      }
    }
    
    console.error('Offerwall postback error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
