import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdminSession } from '@/lib/admin-session';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ("response" in auth) return auth.response;

    await adminDb.collection('admin_logs').add({
      adminId: auth.uid,
      adminEmail: auth.email,
      action: 'view_fraud_flags',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

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

    const totalAlerts = alerts.length;
    const pendingAlerts = alerts.filter(a => a.status === 'pending').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'pending').length;

    const bannedUsersSnapshot = await adminDb.collection('users')
      .where('status', '==', 'banned')
      .get();
    const bannedUsers = bannedUsersSnapshot.size;

    const blockedIPsSnapshot = await adminDb.collection('blocked_ips')
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();
    const blockedIPs = blockedIPsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
    }));
    const blockedIPsCount = blockedIPsSnapshot.size;

    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
    const detectionRate = totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0;

    const stats = {
      totalAlerts,
      pendingAlerts,
      criticalAlerts,
      bannedUsers,
      blockedIPs: blockedIPsCount,
      detectionRate
    };

    return NextResponse.json({ alerts, stats, blockedIPs });

  } catch (error) {
    console.error('Admin fraud GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fraud data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ("response" in auth) return auth.response;

    const { alertId, status, notes, action, ipId } = await request.json();

    // Handle unflag_user action
    if (action === 'unflag_user') {
      if (!alertId) {
        return NextResponse.json({ error: 'Missing alertId for unflag_user' }, { status: 400 });
      }
      const alertDoc = await adminDb.collection('fraud_flags').doc(alertId).get();
      const alertData = alertDoc.data();
      if (!alertData) {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
      }

      await adminDb.collection('fraud_flags').doc(alertId).update({
        status: 'resolved',
        notes: notes || 'Unflagged by admin',
        reviewedBy: auth.uid,
        reviewedAt: new Date()
      });

      const targetUser = await adminDb.collection('users').doc(alertData.userId).get();
      if (targetUser.exists && targetUser.data()?.status === 'banned') {
        await adminDb.collection('users').doc(alertData.userId).update({
          status: 'active',
          updatedAt: new Date(),
          actionReason: notes || 'Unflagged by admin',
          actionBy: auth.uid
        });
      }

      await adminDb.collection('admin_logs').add({
        adminId: auth.uid,
        adminEmail: auth.email,
        action: 'unflag_user',
        targetAlertId: alertId,
        targetUserId: alertData.userId,
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ success: true });
    }

    // Handle unblock_ip action
    if (action === 'unblock_ip') {
      if (!ipId) {
        return NextResponse.json({ error: 'Missing ipId for unblock_ip' }, { status: 400 });
      }
      await adminDb.collection('blocked_ips').doc(ipId).delete();

      await adminDb.collection('admin_logs').add({
        adminId: auth.uid,
        adminEmail: auth.email,
        action: 'unblock_ip',
        targetId: ipId,
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ success: true });
    }

    // Standard alert review
    if (!alertId || !status || !notes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const alertDoc = await adminDb.collection('fraud_flags').doc(alertId).get();
    const alertData = alertDoc.data();

    if (!alertData) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await adminDb.collection('fraud_flags').doc(alertId).update({
      status,
      notes,
      reviewedBy: auth.uid,
      reviewedAt: new Date()
    });

    if (action === 'ban' || action === 'suspend') {
      await adminDb.collection('users').doc(alertData.userId).update({
        status: action === 'ban' ? 'banned' : 'suspended',
        updatedAt: new Date(),
        actionReason: notes,
        actionBy: auth.uid
      });

      if (action === 'ban' && alertData.metadata?.ip) {
        await adminDb.collection('blocked_ips').add({
          ip: alertData.metadata.ip,
          reason: notes,
          blockedBy: auth.uid,
          timestamp: new Date()
        });
      }
    }

    await adminDb.collection('admin_logs').add({
      adminId: auth.uid,
      adminEmail: auth.email,
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
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
