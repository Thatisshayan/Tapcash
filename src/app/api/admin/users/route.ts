import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';
import { appendLedgerTransaction, computeLedgerBalance } from '@/lib/ledger';
import { logAdminAction } from '@/lib/audit';

/**
 * GET /api/admin/users
 * List and search users
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Admin Verification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminSnap = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!adminSnap.exists || !adminSnap.data()?.admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 2. Query Params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limitCount = parseInt(searchParams.get('limit') || '20');

    let q: any = adminDb.collection('users').orderBy('createdAt', 'desc').limit(limitCount);

    if (email) {
      q = adminDb.collection('users')
        .orderBy('email')
        .startAt(email)
        .endAt(email + '\uf8ff')
        .limit(limitCount);
    }

    const snapshot = await q.get();
    const users = await Promise.all(snapshot.docs.map(async (doc: any) => ({
      uid: doc.id,
      ...doc.data(),
      ledgerBalanceCoins: await computeLedgerBalance(doc.id),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
    })));

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Perform administrative actions
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Admin Verification (Strict)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!adminDoc.exists || !adminDoc.data()?.admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { targetUid, action, value } = body;

    if (!targetUid || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const userRef = adminDb.collection('users').doc(targetUid);
    const adminEmail = decodedToken.email;

    switch (action) {
      case 'ban':
        await userRef.update({ 
          status: 'banned', 
          bannedAt: admin.firestore.FieldValue.serverTimestamp(),
          bannedBy: adminEmail 
        });
        // Optionally disable account in Firebase Auth
        await admin.auth().updateUser(targetUid, { disabled: true });
        break;

      case 'unban':
        await userRef.update({ 
          status: 'active', 
          bannedAt: admin.firestore.FieldValue.delete(),
          bannedBy: admin.firestore.FieldValue.delete()
        });
        await admin.auth().updateUser(targetUid, { disabled: false });
        break;

      case 'adjust_balance':
        const amountCents = parseInt(value);
        if (isNaN(amountCents)) throw new Error('Invalid amount');
        await appendLedgerTransaction({
          userId: targetUid,
          type: amountCents >= 0 ? 'approved_credit' : 'reversed_credit',
          amountCoins: Math.abs(amountCents),
          balanceEffectCoins: amountCents,
          status: amountCents >= 0 ? 'approved' : 'reversed',
          source: 'admin_adjustment',
          referenceId: decodedToken.uid,
          metadata: { amountCents, note: 'Admin adjustment' },
        });
        break;

      case 'toggle_admin':
        const isAdmin = !!value;
        await userRef.update({ admin: isAdmin });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the action
    await adminDb.collection('adminLogs').add({
      type: `user_${action}`,
      targetUid,
      adminEmail,
      value: value || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    await logAdminAction({
      action: `user_${action}`,
      actorUserId: decodedToken.uid,
      actorEmail: adminEmail,
      targetType: "user",
      targetId: targetUid,
      metadata: { value: value || null },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin User Action Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
