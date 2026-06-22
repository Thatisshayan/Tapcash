import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// GET - Fetch fraud alerts and stats
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
      action: 'view_fraud_flags',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Fetch fraud alerts
    const alertsSnapshot = await adminDb.collection('fraud_flags')
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const alerts = await Promise.all(
      alertsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          userId: data.userId,
          userName: userData?.displayName || 'Unknown',
          userEmail: userData?.email || 'Unknown',
          type: data.type,
          severity: data.severity,
          description: data.description,
          metadata: data.metadata,
          status: data.status || 'pending',
          timestamp: data.timestamp?.toDate() || new Date(),
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt?.toDate(),
          notes: data.notes
        };
      })
    );

    // Calculate fraud stats
    const totalAlerts = alerts.length;
    const pendingAlerts = alerts.filter(a => a.status === 'pending').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'pending').length;

    // Get banned users count
    const bannedUsersSnapshot = await adminDb.collection('users')
      .where('status', '==', 'banned')
      .get();
    const bannedUsers = bannedUsersSnapshot.size;

    // Get blocked IPs count
    const blockedIPsSnapshot = await adminDb.collection('blocked_ips').get();
    const blockedIPs = blockedIPsSnapshot.size;

    // Calculate detection rate (resolved alerts / total alerts)
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
    const detectionRate = totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0;

    const stats = {
      totalAlerts,
      pendingAlerts,
      criticalAlerts,
      bannedUsers,
      blockedIPs,
      detectionRate
    };

    return NextResponse.json({ alerts, stats });

  } catch (error) {
    console.error('Admin fraud GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fraud data' }, { status: 500 });
  }
}

// POST - Review fraud alert
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

    const { alertId, status, notes, action } = await request.json();

    if (!alertId || !status || !notes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const alertDoc = await adminDb.collection('fraud_flags').doc(alertId).get();
    const alertData = alertDoc.data();

    if (!alertData) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Update alert status
    await adminDb.collection('fraud_flags').doc(alertId).update({
      status,
      notes,
      reviewedBy: decodedToken.uid,
      reviewedAt: new Date()
    });

    // Perform user action if specified
    if (action === 'ban' || action === 'suspend') {
      await adminDb.collection('users').doc(alertData.userId).update({
        status: action === 'ban' ? 'banned' : 'suspended',
        updatedAt: new Date(),
        actionReason: notes,
        actionBy: decodedToken.uid
      });

      // If banning, also block their IP
      if (action === 'ban' && alertData.metadata?.ip) {
        await adminDb.collection('blocked_ips').add({
          ip: alertData.metadata.ip,
          reason: notes,
          blockedBy: decodedToken.uid,
          timestamp: new Date()
        });
      }
    }

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'review_fraud_alert',
      targetAlertId: alertId,
      details: { 
        userId: alertData.userId, 
        status, 
        notes, 
        userAction: action 
      },
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin fraud POST error:', error);
    return NextResponse.json({ error: 'Failed to review alert' }, { status: 500 });
  }
}

// Made with Bob

