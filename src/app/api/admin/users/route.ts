import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// GET - Fetch all users
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
      action: 'view_users',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Fetch all users
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName || 'Unknown',
        balance: data.balance || 0,
        totalEarned: data.totalEarned || 0,
        totalWithdrawn: data.totalWithdrawn || 0,
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        lastActive: data.lastActive?.toDate() || new Date(),
        fraudFlags: data.fraudFlags || 0,
        tapScore: data.tapScore || 0
      };
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PATCH - Update user status
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

    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update user status
    await adminDb.collection('users').doc(userId).update({
      status,
      updatedAt: new Date()
    });

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'update_user_status',
      targetUserId: userId,
      details: { newStatus: status },
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// POST - Adjust user balance or perform actions
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

    const { userId, action, amount, reason } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'adjust_balance') {
      if (amount === undefined || !reason) {
        return NextResponse.json({ error: 'Amount and reason required for balance adjustment' }, { status: 400 });
      }

      const targetUserDoc = await adminDb.collection('users').doc(userId).get();
      const targetUserData = targetUserDoc.data();
      
      if (!targetUserData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const currentBalance = targetUserData.balance || 0;
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      // Update user balance
      await adminDb.collection('users').doc(userId).update({
        balance: newBalance,
        updatedAt: new Date()
      });

      // Create transaction record
      await adminDb.collection('transactions').add({
        userId,
        type: 'adjustment',
        amount: Math.abs(amount),
        status: 'completed',
        notes: reason,
        adjustedBy: decodedToken.uid,
        timestamp: new Date()
      });

      // Log admin action
      await adminDb.collection('admin_logs').add({
        adminId: decodedToken.uid,
        adminEmail: decodedToken.email,
        action: 'adjust_balance',
        targetUserId: userId,
        details: { amount, reason, oldBalance: currentBalance, newBalance },
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ success: true, newBalance });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Admin users POST error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

// Made with Bob
