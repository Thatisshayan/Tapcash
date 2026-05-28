// src/app/api/postbacks/offerwall/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { getClientIp, logFraudAttempt } from '@/lib/antiFraud';
import { getActiveMultiplier } from '@/lib/multiplier';

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
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

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

    const rawAmount = parseFloat(amountStr);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }
    const multiplier = await getActiveMultiplier();
    const amount = Math.floor(rawAmount * multiplier);

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
      await logFraudAttempt({
        ip,
        userId,
        action: "GENERIC_POSTBACK_SIG_MISMATCH",
        reason: `Generic offerwall signature mismatch for offer ${offerId}`,
        userAgent,
        createdAt: new Date(),
      });
      return new NextResponse('Invalid signature', { status: 403 });
    }

    // 1. Click Verification: Cross-reference with /clicks
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const clickSnap = await adminDb
      .collection('clicks')
      .where('userId', '==', userId)
      .where('offerId', '==', offerId)
      .where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo))
      .limit(1)
      .get();

    let postbackStatus = 'completed';
    let flagReason = '';

    if (clickSnap.empty) {
      postbackStatus = 'held_review';
      flagReason = `Generic postback received but NO matching user click was found in clicks collection in the last 7 days for offer ${offerId}`;
      console.warn(`[Offerwall] Click verification failed for ${userId} completing offer ${offerId}. Held for review.`);
    }

    // 2. Daily Earning Cap check ($50 / 50,000 coins safety valve)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentEarnedSnap = await adminDb
      .collection('ledger_transactions')
      .where('userId', '==', userId)
      .where('status', '==', 'approved')
      .where('createdAt', '>=', Timestamp.fromDate(twentyFourHoursAgo))
      .get();

    let recentEarnedSum = 0;
    recentEarnedSnap.forEach((doc) => {
      const tx = doc.data();
      if (tx.balanceEffectCoins > 0) {
        recentEarnedSum += tx.balanceEffectCoins;
      }
    });

    if (recentEarnedSum + amount > 50000) {
      postbackStatus = 'held_review';
      flagReason = `Daily Earning Cap Exceeded: User completed offer ${offerId} worth ${amount} coins, but rolling 24h earnings exceed 50,000 coin ($50.00) limit.`;
    }

    // Dedup check and credit user wallet via Firestore transaction
    const userRef = adminDb.collection('users').doc(userId);
    const offerRef = adminDb.collection('offer_postbacks').doc(`${userId}_${offerId}`);

    await adminDb.runTransaction(async (transaction) => {
      const offerDoc = await transaction.get(offerRef);
      
      if (offerDoc.exists) {
        throw new Error('DUPLICATE_OFFER');
      }

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('USER_NOT_FOUND');
      }

      const userData = userDoc.data()!;

      // Handle lockouts
      if (userData.status === 'banned' || userData.isFlagged === true) {
        postbackStatus = 'held_review';
        flagReason = `Postback credit attempted while account was locked or flagged. Profile status: ${userData.status}`;
      }

      // Create offer postback record
      transaction.set(offerRef, {
        userId,
        offerId,
        amount,
        creditedAt: FieldValue.serverTimestamp(),
        ip,
        userAgent,
        status: postbackStatus,
      });

      // Log transaction entry
      const pendingLedgerRef = adminDb.collection('ledger_transactions').doc(`pending_${userId}_${offerId}`);
      const approvedLedgerRef = adminDb.collection('ledger_transactions').doc(`approved_${userId}_${offerId}`);
      transaction.set(pendingLedgerRef, {
        id: pendingLedgerRef.id,
        userId,
        type: 'pending_credit',
        amountCoins: amount,
        balanceEffectCoins: 0,
        method: 'Generic Offerwall',
        status: postbackStatus === 'completed' ? 'pending' : 'pending',
        source: 'generic_offerwall',
        referenceId: `${userId}_${offerId}`,
        metadata: { offerId, provider: 'generic_offerwall' },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (postbackStatus === 'completed') {
        transaction.set(approvedLedgerRef, {
          id: approvedLedgerRef.id,
          userId,
          type: 'approved_credit',
          amountCoins: amount,
          balanceEffectCoins: amount,
          method: 'Generic Offerwall',
          status: 'approved',
          source: 'generic_offerwall',
          referenceId: `${userId}_${offerId}`,
          metadata: { offerId, provider: 'generic_offerwall' },
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Award XP without touching wallet balances
        transaction.update(userRef, {
          xp: FieldValue.increment(amount),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Award tiered commission to referrer based on their VIP tier
        if (userData.referredBy) {
          const referrerRef = adminDb.collection("users").doc(userData.referredBy);
          const referrerDoc = await transaction.get(referrerRef);
          if (referrerDoc.exists) {
            const vipTier = (referrerDoc.data()!.vipTier as string) || "Bronze";
            const tierRates: Record<string, number> = {
              Bronze: 0.05, Silver: 0.08, Gold: 0.12, Platinum: 0.15, Diamond: 0.20,
            };
            const rate = tierRates[vipTier] ?? 0.05;
            const referralCommission = Math.floor(amount * rate);
            if (referralCommission > 0) {
              const refLedgerRef = adminDb.collection('ledger_transactions').doc(`ref_${userId}_${offerId}`);
              transaction.set(refLedgerRef, {
                id: refLedgerRef.id,
                userId: userData.referredBy,
                type: 'approved_credit',
                amountCoins: referralCommission,
                balanceEffectCoins: referralCommission,
                method: 'Referral Program',
                status: 'approved',
                source: 'referral_commission',
                referenceId: `${userId}_${offerId}`,
                metadata: { fromUserId: userId, offerId, tier: vipTier, rate },
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          }
        }
      } else {
        // Flag user and write log
        transaction.update(userRef, {
          status: 'flagged',
          isFlagged: true,
          flaggedReason: flagReason,
          updatedAt: FieldValue.serverTimestamp(),
        });

        transaction.set(adminDb.collection('fraud_flags').doc(), {
          ip,
          userId,
          email: userData.email,
          action: "POSTBACK_HELD_REVIEW",
          reason: flagReason,
          userAgent,
          createdAt: FieldValue.serverTimestamp(),
          details: {
            amount,
            offerId,
            provider: 'generic_offerwall',
          }
        });
      }
    });

    console.log(`Successfully processed generic postback for ${userId} with status ${postbackStatus}`);
    return new NextResponse('1', { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'DUPLICATE_OFFER') {
        console.warn(`Duplicate offerwall postback detected`);
        return new NextResponse('1', { status: 200 }); // Return success for idempotency
      }
      if (error.message === 'USER_NOT_FOUND') {
        console.error(`User not found for generic postback`);
        return new NextResponse('User not found', { status: 404 });
      }
    }
    
    console.error('Offerwall postback error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
