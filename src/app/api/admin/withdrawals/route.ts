import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

interface WithdrawalRequest {
  withdrawalId: string;
  action: 'approve' | 'reject';
  adminNote?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken: admin.auth.DecodedIdToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired Firebase ID token' },
        { status: 401 }
      );
    }

    // Check admin status in Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || !userDoc.data()?.admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const adminEmail = decodedToken.email || userDoc.data()?.email;
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email not found' },
        { status: 500 }
      );
    }

    // 2. Parse and validate request body
    const body: WithdrawalRequest = await request.json();
    
    if (!body.withdrawalId || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields: withdrawalId and action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // 3. Process withdrawal
    const withdrawalRef = adminDb.collection('withdrawals').doc(body.withdrawalId);
    const adminLogRef = adminDb.collection('adminLogs').doc();

    if (body.action === 'approve') {
      // Approve withdrawal
      await adminDb.runTransaction(async (transaction) => {
        const withdrawalDoc = await transaction.get(withdrawalRef);
        
        if (!withdrawalDoc.exists) {
          throw new Error('Withdrawal not found');
        }

        const withdrawalData = withdrawalDoc.data()!;
        if (withdrawalData.status !== 'pending') {
          throw new Error(`Withdrawal already ${withdrawalData.status}`);
        }

        transaction.update(withdrawalRef, {
          status: 'approved',
          reviewedBy: adminEmail,
          reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
          adminNote: body.adminNote || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        transaction.set(adminLogRef, {
          type: 'withdrawal_approved',
          withdrawalId: body.withdrawalId,
          adminEmail,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          note: body.adminNote || null
        });
      });

      return NextResponse.json({
        success: true,
        action: 'approve'
      });

    } else {
      // Reject withdrawal with refund
      await adminDb.runTransaction(async (transaction) => {
        const withdrawalDoc = await transaction.get(withdrawalRef);
        
        if (!withdrawalDoc.exists) {
          throw new Error('Withdrawal not found');
        }

        const withdrawalData = withdrawalDoc.data()!;
        if (withdrawalData.status !== 'pending') {
          throw new Error(`Withdrawal already ${withdrawalData.status}`);
        }

        const amountCents = withdrawalData.amountCents;
        const userId = withdrawalData.userId;
        const userRef = adminDb.collection('users').doc(userId);

        // Update withdrawal status
        transaction.update(withdrawalRef, {
          status: 'rejected',
          reviewedBy: adminEmail,
          reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
          adminNote: body.adminNote || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Refund user balance
        transaction.update(userRef, {
          walletBalanceCents: admin.firestore.FieldValue.increment(amountCents),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Add admin log
        transaction.set(adminLogRef, {
          type: 'withdrawal_rejected',
          withdrawalId: body.withdrawalId,
          adminEmail,
          refundAmountCents: amountCents,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          note: body.adminNote || null
        });
      });

      return NextResponse.json({
        success: true,
        action: 'reject'
      });
    }

  } catch (error) {
    console.error('Admin withdrawal processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('not found') ? 404 : 500 }
    );
  }
}