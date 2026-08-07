import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdminSession } from '@/lib/admin-session';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ("response" in auth) return auth.response;

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: auth.uid,
      adminEmail: auth.email,
      action: 'view_stats',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Fetch platform statistics
    const [usersSnapshot, transactionsSnapshot, offersSnapshot] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('transactions').orderBy('timestamp', 'desc').get(),
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
    const fraudAlertsSnapshot = await adminDb.collection('fraud_flags')
      .where('status', '==', 'pending')
      .get();
    const fraudAlerts = fraudAlertsSnapshot.size;

    // Get recent transactions (last 10) - already sorted by query
    const recentTransactions = await Promise.all(
      transactionsSnapshot.docs.slice(0, 10).map(async (doc) => {
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