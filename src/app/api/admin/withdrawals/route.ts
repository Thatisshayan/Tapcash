import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';
import { sendPayoutApprovedEmail, sendPayoutRejectedEmail } from '@/lib/email';

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
      // Fetch withdrawal data outside transaction for PayPal logic
      const withdrawalSnap = await withdrawalRef.get();
      if (!withdrawalSnap.exists) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
      }

      const withdrawalData = withdrawalSnap.data()!;
      if (withdrawalData.status !== 'pending') {
        return NextResponse.json({ error: `Withdrawal already ${withdrawalData.status}` }, { status: 400 });
      }

      // Handle Interac e-Transfer (Manual Flow with Validation)
      if (withdrawalData.method?.toLowerCase() === 'interac' && withdrawalData.payoutEmail) {
        const { prepareInteracPayout } = await import('@/lib/interac');
        
        const interacDetails = await prepareInteracPayout({
          email: withdrawalData.payoutEmail,
          securityQuestion: withdrawalData.securityQuestion || "What platform is this?",
          securityAnswer: withdrawalData.securityAnswer || "TapCash",
          amount: (withdrawalData.payoutCents || 0) / 100
        });

          await withdrawalRef.update({
            status: 'completed',
            interacRef: interacDetails.reference,
            reviewedBy: adminEmail,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          await adminLogRef.set({
            type: 'withdrawal_approved_interac',
            withdrawalId: body.withdrawalId,
            reference: interacDetails.reference,
            adminEmail,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });

          await sendPayoutApprovedEmail(withdrawalData.payoutEmail, (withdrawalData.payoutCents || 0) / 100, 'Interac e-Transfer', body.adminNote);

        return NextResponse.json({ 
          success: true, 
          action: 'approve', 
          automated: false,
          instructions: interacDetails.instructions 
        });
      }

      // Handle Automated PayPal Payout
      if (withdrawalData.method?.toLowerCase() === 'paypal' && withdrawalData.payoutEmail) {
        try {
          const { createPayPalPayout } = await import('@/lib/paypal');
          
          // 1. Mark as processing in Firestore
          await withdrawalRef.update({ 
            status: 'processing',
            reviewedBy: adminEmail,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // 2. Call PayPal
          const amountCad = (withdrawalData.payoutCents || 0) / 100;
          const payoutResponse = await createPayPalPayout({
            amount: amountCad,
            currency: 'CAD',
            recipientEmail: withdrawalData.payoutEmail,
            note: `TapCash Payout for Withdrawal #${body.withdrawalId}`,
            senderBatchId: `tapcash_${body.withdrawalId}_${Date.now()}`
          });

          // 3. Update to completed on success
          await withdrawalRef.update({
            status: 'completed',
            paypalBatchId: payoutResponse.batch_header.payout_batch_id,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          await adminLogRef.set({
            type: 'withdrawal_approved_paypal',
            withdrawalId: body.withdrawalId,
            paypalBatchId: payoutResponse.batch_header.payout_batch_id,
            adminEmail,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });

          await sendPayoutApprovedEmail(withdrawalData.payoutEmail, amountCad, 'PayPal', body.adminNote);

          return NextResponse.json({ success: true, action: 'approve', automated: true });

        } catch (paypalError: any) {
          console.error('PayPal Payout Failed:', paypalError);
          // Revert to pending if PayPal fails or mark as failed for manual review
          await withdrawalRef.update({
            status: 'failed',
            error: paypalError.message || 'PayPal Payout Failed',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          return NextResponse.json({ 
            success: false, 
            error: `PayPal Error: ${paypalError.message}`,
            action: 'approve'
          }, { status: 500 });
        }
      }

      // Manual Approval for other methods (Interac, etc.)
      await adminDb.runTransaction(async (transaction) => {
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
        action: 'approve',
        automated: false
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

      const withdrawalDoc = await withdrawalRef.get();
      const withdrawalData = withdrawalDoc.data();
      if (withdrawalData?.payoutEmail) {
        await sendPayoutRejectedEmail(withdrawalData.payoutEmail, (withdrawalData.amountCents || 0) / 100, body.adminNote);
      }

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