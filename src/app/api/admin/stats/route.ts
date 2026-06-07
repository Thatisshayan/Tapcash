import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'view_stats',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Fetch platform statistics
    const [usersSnapshot, transactionsSnapshot, offersSnapshot] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('transactions').get(),
      adminDb.collection('offers').get()
    ]);

    // Calculate user stats
    const users = usersSnapshot.docs.map(doc => doc.data());
    const totalUsers = users.length;
    const activeUsers = users.filter(u => {
      const lastActive = u.lastActive?.toDate();
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastActive && lastActive > dayAgo;
    }).length;

    // Calculate transaction stats
    const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    const completedTransactions = transactions.filter((t: any) => t.status === 'completed');
    const totalRevenue = completedTransactions
      .filter((t: any) => t.type === 'earning')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const totalPayouts = completedTransactions
      .filter((t: any) => t.type === 'payout')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const pendingPayouts = transactions.filter((t: any) => t.type === 'payout' && t.status === 'pending').length;

    // Calculate offer stats
    const offers = offersSnapshot.docs.map(doc => doc.data());
    const activeOffers = offers.filter(o => o.status === 'active').length;
    const totalClicks = offers.reduce((sum, o) => sum + (o.clicks || 0), 0);
    const totalConversions = offers.reduce((sum, o) => sum + (o.conversions || 0), 0);
    const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;

    // Get fraud alerts
    const fraudAlertsSnapshot = await adminDb.collection('fraud_alerts')
      .where('status', '==', 'pending')
      .get();
    const fraudAlerts = fraudAlertsSnapshot.size;

    // Get recent transactions (last 10)
    const recentTransactionsSnapshot = await adminDb.collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const recentTransactions = await Promise.all(
      recentTransactionsSnapshot.docs.map(async (doc) => {
        const txData = doc.data();
        const userDoc = await adminDb.collection('users').doc(txData.userId).get();
        const userData = userDoc.data();
        
        return {
          id: doc.id,
          userId: txData.userId,
          userName: userData?.displayName || 'Unknown',
          amount: txData.amount,
          type: txData.type,
          status: txData.status,
          timestamp: txData.timestamp?.toDate() || new Date()
        };
      })
    );

    const stats = {
      totalUsers,
      activeUsers,
      totalRevenue,
      totalPayouts,
      activeOffers,
      pendingPayouts,
      fraudAlerts,
      conversionRate
    };

    return NextResponse.json({
      stats,
      recentTransactions
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}

// Made with Bob
