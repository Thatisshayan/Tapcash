import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// GET - Fetch all transactions
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
      action: 'view_transactions',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Fetch all transactions
    const transactionsSnapshot = await adminDb.collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const transactions = await Promise.all(
      transactionsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          userId: data.userId,
          userName: userData?.displayName || 'Unknown',
          userEmail: userData?.email || 'Unknown',
          type: data.type,
          amount: data.amount || 0,
          status: data.status,
          method: data.method,
          offerId: data.offerId,
          offerName: data.offerName,
          timestamp: data.timestamp?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
          notes: data.notes,
          metadata: data.metadata
        };
      })
    );

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Admin transactions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - Approve, reject, or refund transactions
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

    const { transactionId, action, reason } = await request.json();

    if (!transactionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const txDoc = await adminDb.collection('transactions').doc(transactionId).get();
    const txData = txDoc.data();

    if (!txData) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (txData.status !== 'pending') {
        return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 });
      }

      // Update transaction status
      await adminDb.collection('transactions').doc(transactionId).update({
        status: 'completed',
        completedAt: new Date(),
        approvedBy: decodedToken.uid
      });

      // Process payout (in real implementation, this would trigger actual payment)
      // For now, we just mark it as completed

      // Log admin action
      await adminDb.collection('admin_logs').add({
        adminId: decodedToken.uid,
        adminEmail: decodedToken.email,
        action: 'approve_transaction',
        targetTransactionId: transactionId,
        details: { userId: txData.userId, amount: txData.amount },
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ success: true });

    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Reason required for rejection' }, { status: 400 });
      }

      if (txData.status !== 'pending') {
        return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 });
      }

      // Update transaction status
      await adminDb.collection('transactions').doc(transactionId).update({
        status: 'failed',
        failureReason: reason,
        rejectedBy: decodedToken.uid,
        rejectedAt: new Date()
      });

      // Refund balance to user if it was deducted
      if (txData.type === 'payout') {
        const userDoc = await adminDb.collection('users').doc(txData.userId).get();
        const userData = userDoc.data();
        
        if (userData) {
          await adminDb.collection('users').doc(txData.userId).update({
            balance: (userData.balance || 0) + txData.amount
          });
        }
      }

      // Log admin action
      await adminDb.collection('admin_logs').add({
        adminId: decodedToken.uid,
        adminEmail: decodedToken.email,
        action: 'reject_transaction',
        targetTransactionId: transactionId,
        details: { userId: txData.userId, amount: txData.amount, reason },
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ success: true });

    } else if (action === 'refund') {
      if (!reason) {
        return NextResponse.json({ error: 'Reason required for refund' }, { status: 400 });
      }

      if (txData.status !== 'completed') {
        return NextResponse.json({ error: 'Can only refund completed transactions' }, { status: 400 });
      }

      // Create refund transaction
      await adminDb.collection('transactions').add({
        userId: txData.userId,
        type: 'refund',
        amount: txData.amount,
        status: 'completed',
        originalTransactionId: transactionId,
        notes: reason,
        refundedBy: decodedToken.uid,
        timestamp: new Date()
      });

      // Add balance back to user
      const userDoc = await adminDb.collection('users').doc(txData.userId).get();
      const userData = userDoc.data();
      
      if (userData) {
        await adminDb.collection('users').doc(txData.userId).update({
          balance: (userData.balance || 0) + txData.amount
        });
      }

      // Mark original transaction as refunded
      await adminDb.collection('transactions').doc(transactionId).update({
        refunded: true,
        refundedAt: new Date(),
        refundReason: reason
      });

      // Log admin action
      await adminDb.collection('admin_logs').add({
        adminId: decodedToken.uid,
        adminEmail: decodedToken.email,
        action: 'refund_transaction',
        targetTransactionId: transactionId,
        details: { userId: txData.userId, amount: txData.amount, reason },
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Admin transactions POST error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

// Made with Bob
