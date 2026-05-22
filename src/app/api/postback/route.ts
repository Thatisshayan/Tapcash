import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getClientIp, logFraudAttempt } from '@/lib/antiFraud';

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    try {
      const serviceAccount = eval('require')("../../serviceAccountKey.json");
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) {
      console.error("Firebase Admin: no credentials found.");
    }
  }
}

const db = getFirestore();

// Lootably's official postback server IPs.
const LOOTABLY_IPS = ["54.210.231.13"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  // Lootably params
  const uid = searchParams.get('uid') || searchParams.get('user_id');
  const amountStr = searchParams.get('amount');
  const txId = searchParams.get('tx_id');
  const offerId = searchParams.get('offer_id');
  const sig = searchParams.get('sig');
  
  // Validate required params
  if (!uid || !amountStr || !txId || !offerId || !sig) {
    console.warn('[Lootably] Missing required parameters');
    return new NextResponse('Missing parameters', { status: 400 });
  }
  
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    console.warn('[Lootably] Invalid amount:', amountStr);
    return new NextResponse('Invalid amount', { status: 400 });
  }

  // 1. IP Origin whitelisting (Only process postbacks coming from Lootably)
  const allowedPostbackIps = process.env.ALLOWED_POSTBACK_IPS 
    ? process.env.ALLOWED_POSTBACK_IPS.split(",").map(i => i.trim())
    : LOOTABLY_IPS;

  // Bypass IP origin check ONLY in dev environment
  const isDev = process.env.NODE_ENV === "development" || ip === "127.0.0.1" || ip === "::1";
  if (!isDev && !allowedPostbackIps.includes(ip)) {
    console.error(`[Lootably] Rejected postback from unauthorized IP: ${ip}`);
    await logFraudAttempt({
      ip,
      userId: uid,
      action: "POSTBACK_IP_BLOCKED",
      reason: `Postback signature attempted from unverified caller IP. Whitelisted: ${allowedPostbackIps.join(", ")}`,
      userAgent,
      createdAt: new Date(),
    });
    return new NextResponse('Forbidden IP origin', { status: 403 });
  }
  
  // Signature verification
  const secretKey = process.env.LOOTABLY_SECRET_KEY;
  
  if (secretKey) {
    const computedSig = crypto
      .createHash('md5')
      .update(uid + amount + txId + secretKey)
      .digest('hex');
    
    if (computedSig.toLowerCase() !== sig.toLowerCase()) {
      console.error('[Lootably] Fraud attempt detected - signature mismatch');
      console.error(`[Lootably] Expected: ${computedSig}, Received: ${sig}`);
      
      await logFraudAttempt({
        ip,
        userId: uid,
        action: "POSTBACK_SIG_MISMATCH",
        reason: `Lootably signature validation failed. Received: ${sig}, Computed: ${computedSig}`,
        userAgent,
        createdAt: new Date(),
      });
      return new NextResponse('Invalid signature', { status: 403 });
    }
  } else {
    console.warn('[Lootably] LOOTABLY_SECRET_KEY not set - running in dev mode without verification');
  }
  
  try {
    // 2. Click Verification: Cross-reference with /clicks collection
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const clickSnap = await db
      .collection('clicks')
      .where('userId', '==', uid)
      .where('offerId', '==', offerId)
      .where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo))
      .limit(1)
      .get();

    let postbackStatus = 'completed';
    let flagReason = '';

    if (clickSnap.empty) {
      // Mark as held for review instead of rejecting, to prevent complete postback loss, and flag user!
      postbackStatus = 'held_review';
      flagReason = `Lootably postback received but NO matching user click was logged in clicks collection in the last 7 days for offer ${offerId}`;
      console.warn(`[Lootably] Warning: User ${uid} has NO matching click record for offer ${offerId}. Credit marked as held_review.`);
    }

    // 3. Daily Earning Cap check ($50 / 50,000 coins safety valve)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentEarnedSnap = await db
      .collection('transactions')
      .where('userId', '==', uid)
      .where('status', '==', 'completed')
      .where('createdAt', '>=', Timestamp.fromDate(twentyFourHoursAgo))
      .get();

    let recentEarnedSum = 0;
    recentEarnedSnap.forEach((doc) => {
      const tx = doc.data();
      if (tx.amount > 0) {
        recentEarnedSum += tx.amount;
      }
    });

    if (recentEarnedSum + amount > 50000) {
      postbackStatus = 'held_review';
      flagReason = `Daily Earning Cap Exceeded: User completed offer ${offerId} worth ${amount} coins, but their rolling 24h earnings (${recentEarnedSum} coins) exceed the 50,000 coin ($50.00) limit.`;
      console.warn(`[Lootably] Daily earning cap triggered for ${uid}. Total rolling 24h: ${recentEarnedSum + amount} coins.`);
    }

    // Dedup check using Firestore transaction
    const txRef = db.collection('transactions').doc(txId);
    
    await db.runTransaction(async (transaction) => {
      const txDoc = await transaction.get(txRef);
      
      if (txDoc.exists) {
        console.warn('[Lootably] Duplicate transaction detected:', txId);
        throw new Error('DUPLICATE');
      }

      const userRef = db.collection('users').doc(uid);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('USER_NOT_FOUND');
      }

      const userData = userDoc.data()!;

      // If user is already banned or flagged, automatically hold all credits for review
      if (userData.status === 'banned' || userData.isFlagged === true) {
        postbackStatus = 'held_review';
        flagReason = `Postback credit attempted while account was locked or flagged. Profile status: ${userData.status}`;
      }
      
      // Log transaction entry
      transaction.set(txRef, {
        id: txId,
        uid, // legacy support field
        userId: uid,
        amount,
        txId,
        offerId,
        provider: 'lootably',
        status: postbackStatus, // 'completed' or 'held_review'
        ip,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
        type: 'offer',
      });
      
      if (postbackStatus === 'completed') {
        // Update user balance
        transaction.update(userRef, {
          'wallet.balance': FieldValue.increment(amount),
          'wallet.lastUpdated': FieldValue.serverTimestamp(),
          walletBalanceCents: FieldValue.increment(Math.floor(amount / 10)),
          totalEarned: FieldValue.increment(amount),
          updatedAt: FieldValue.serverTimestamp(),
        });
        
        // Check for referrer and add commission (only if postback succeeds)
        if (userData?.referredBy) {
          const commission = Math.floor(amount * 0.1); // 10% referral commission
          const referrerRef = db.collection('users').doc(userData.referredBy);
          transaction.update(referrerRef, {
            'wallet.balance': FieldValue.increment(commission),
            'wallet.lastUpdated': FieldValue.serverTimestamp(),
            walletBalanceCents: FieldValue.increment(Math.floor(commission / 10)),
            referralEarnings: FieldValue.increment(commission),
            updatedAt: FieldValue.serverTimestamp(),
          });
          
          // Log referral commission
          const commissionRef = db.collection('commissions').doc();
          transaction.set(commissionRef, {
            fromTx: txId,
            fromUid: uid,
            toUid: userData.referredBy,
            amount: commission,
            type: 'lootably_referral',
            timestamp: Timestamp.now(),
          });
        }
      } else {
        // If marked as held for review, flag user and log fraud record
        transaction.update(userRef, {
          status: 'flagged',
          isFlagged: true,
          flaggedReason: flagReason,
          updatedAt: FieldValue.serverTimestamp(),
        });

        transaction.set(db.collection('fraud_logs').doc(), {
          ip,
          userId: uid,
          email: userData.email,
          action: "POSTBACK_HELD_REVIEW",
          reason: flagReason,
          userAgent,
          createdAt: Timestamp.now(),
          details: {
            amount,
            txId,
            offerId,
            provider: 'lootably',
          }
        });
      }
    });
    
    // Lootably expects "1" on success (even if we hold the credit internally, return "1" to mark postback as processed)
    return new NextResponse('1', { status: 200 });
    
  } catch (error: any) {
    if (error.message === 'DUPLICATE') {
      return new NextResponse('1', { status: 200 });
    }
    if (error.message === 'USER_NOT_FOUND') {
      return new NextResponse('User not found', { status: 404 });
    }
    
    console.error('[Lootably] Error processing postback:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}