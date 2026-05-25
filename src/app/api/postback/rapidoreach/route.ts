import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { getClientIp } from '@/lib/antiFraud';

// Allowed RapidoReach Server IPs
const RAPIDOREACH_IPS = [
  '161.97.78.55', 
  '173.212.227.149', 
  '75.119.139.250', 
  '75.119.139.251',
  '127.0.0.1', // For local testing
  '::1'
];

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // 1. IP Whitelisting Security Check
  if (!RAPIDOREACH_IPS.includes(ip) && process.env.NODE_ENV === 'production') {
    console.error(`[RapidoReach Postback] Blocked unauthorized IP: ${ip}`);
    return new NextResponse('Unauthorized IP', { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Log all incoming parameters from Rapidoreach for debugging
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log(`[RapidoReach Postback] Received from ${ip}`, params);

    // Extract standard parameters
    const uid = searchParams.get('uid');
    const rewardStr = searchParams.get('reward');
    const txId = searchParams.get('tx_id') || searchParams.get('transaction_id') || searchParams.get('id');

    if (!uid || !rewardStr || !txId) {
      console.error('[RapidoReach Postback] Missing required parameters', params);
      return new NextResponse('Missing parameters', { status: 400 });
    }

    const reward = parseFloat(rewardStr);
    if (isNaN(reward) || reward <= 0) {
      console.error('[RapidoReach Postback] Invalid reward amount', rewardStr);
      return new NextResponse('Invalid reward', { status: 400 });
    }

    const transactionRef = adminDb.collection('transactions').doc(txId);
    const userRef = adminDb.collection('users').doc(uid);

    // 2. Atomic Transaction to prevent double-crediting
    await adminDb.runTransaction(async (transaction) => {
      const txDoc = await transaction.get(transactionRef);
      
      if (txDoc.exists) {
        // Transaction already processed, safely ignore to prevent double crediting
        console.log(`[RapidoReach Postback] Duplicate transaction ignored: ${txId}`);
        return;
      }

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error(`User not found: ${uid}`);
      }

      // Record the transaction
      transaction.set(transactionRef, {
        id: txId,
        userId: uid,
        amount: reward,
        type: 'earn',
        source: 'rapidoreach',
        status: 'completed',
        ip,
        userAgent,
        rawParams: params,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Increment user balance
      transaction.update(userRef, {
        coins: FieldValue.increment(reward),
        totalEarned: FieldValue.increment(reward),
        updatedAt: FieldValue.serverTimestamp()
      });
    });

    console.log(`[RapidoReach Postback] Successfully credited ${reward} coins to user ${uid} (Tx: ${txId})`);

    // Return '1' for success as required by most offerwalls
    return new NextResponse('1', { status: 200 });

  } catch (error) {
    console.error('[RapidoReach Postback] Error processing request:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // If RapidoReach sends a POST, we handle it similarly by extracting the body
  const ip = getClientIp(request);
  
  if (!RAPIDOREACH_IPS.includes(ip) && process.env.NODE_ENV === 'production') {
    return new NextResponse('Unauthorized IP', { status: 403 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = null;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = { rawText: text };
    }

    console.log(`[RapidoReach Postback] Received POST from ${ip}`, body);

    // Save POST body to webhook_logs for inspection if they use POST
    await adminDb.collection('webhook_logs').add({
      provider: 'rapidoreach',
      method: 'POST',
      ip,
      body,
      timestamp: FieldValue.serverTimestamp(),
    });

    return new NextResponse('1', { status: 200 });

  } catch (error) {
    console.error('[RapidoReach Postback] Error processing POST:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
