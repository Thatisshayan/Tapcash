import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = getFirestore();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
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
      return new NextResponse('Invalid signature', { status: 403 });
    }
  } else {
    console.warn('[Lootably] LOOTABLY_SECRET_KEY not set - running in dev mode without verification');
  }
  
  try {
    // Dedup check using Firestore transaction
    const txRef = db.collection('transactions').doc(txId);
    
    await db.runTransaction(async (transaction) => {
      const txDoc = await transaction.get(txRef);
      
      if (txDoc.exists) {
        console.warn('[Lootably] Duplicate transaction detected:', txId);
        throw new Error('DUPLICATE');
      }
      
      // Create transaction record
      transaction.set(txRef, {
        uid,
        amount,
        txId,
        offerId,
        provider: 'lootably',
        status: 'completed',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        timestamp: Timestamp.now(),
      });
      
      // Update user balance (referral commission logic)
      const userRef = db.collection('users').doc(uid);
      transaction.update(userRef, {
        balance: admin.firestore.FieldValue.increment(amount),
        totalEarned: admin.firestore.FieldValue.increment(amount),
      });
      
      // Check for referrer and add commission
      const userDoc = await transaction.get(userRef);
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.referredBy) {
          const commission = Math.floor(amount * 0.1); // 10% referral commission
          const referrerRef = db.collection('users').doc(userData.referredBy);
          transaction.update(referrerRef, {
            balance: admin.firestore.FieldValue.increment(commission),
            referralEarnings: admin.firestore.FieldValue.increment(commission),
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
      }
    });
    
    // Lootably expects "1" on success
    return new NextResponse('1', { status: 200 });
    
  } catch (error: any) {
    if (error.message === 'DUPLICATE') {
      // Duplicate - still return success to avoid retries
      return new NextResponse('1', { status: 200 });
    }
    
    console.error('[Lootably] Error processing postback:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}