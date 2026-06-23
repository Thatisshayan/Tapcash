import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendPayoutApprovedEmail, sendPayoutRejectedEmail, sendPayoutSentEmail } from "@/lib/email";
import { logAdminAction } from "@/lib/audit";

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 }) } as const;
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();

  if (!userDoc.exists || !userDoc.data()?.isAdmin) {
    return { error: NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 }) } as const;
  }

  return { uid: decodedToken.uid, email: decodedToken.email || userDoc.data()?.email || null } as const;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) return auth.error;

    const oneDayAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const [
      withdrawalsSnap,
      postbacksSnap,
      flagsSnap,
      usersCountSnap,
      pendingCountSnap,
      manualCountSnap,
      postbacks24hCountSnap,
    ] = await Promise.all([
      adminDb.collection("cashout_requests").where("status", "in", ["pending_review", "manual_required", "approved"]).orderBy("createdAt", "desc").limit(50).get(),
      adminDb.collection("offer_postbacks").orderBy("createdAt", "desc").limit(20).get(),
      adminDb.collection("fraud_flags").orderBy("createdAt", "desc").limit(10).get(),
      adminDb.collection("users").count().get(),
      adminDb.collection("cashout_requests").where("status", "==", "pending_review").count().get(),
      adminDb.collection("cashout_requests").where("status", "==", "manual_required").count().get(),
      adminDb.collection("offer_postbacks").where("createdAt", ">=", oneDayAgo).count().get(),
    ]);

    const stats = {
      users: Number(usersCountSnap.data().count || 0),
      pending: Number(pendingCountSnap.data().count || 0) + Number(manualCountSnap.data().count || 0),
      postbacks24h: Number(postbacks24hCountSnap.data().count || 0),
    };

    return NextResponse.json({
      withdrawals: withdrawalsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      postbacks: postbacksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      flagged: flagsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      stats,
    });
  } catch (error: unknown) {
    console.error("Admin withdrawal GET error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load admin data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) return auth.error;

    const adminUid = auth.uid;
    const adminEmail = auth.email;
    const body = await request.json();
    const { withdrawalId, action, adminNote, referenceNumber } = body as {
      withdrawalId: string;
      action: "approve" | "reject" | "mark_sent";
      adminNote?: string;
      referenceNumber?: string;
    };

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing required fields: withdrawalId and action" }, { status: 400 });
    }

    if (!["approve", "reject", "mark_sent"].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve", "reject", or "mark_sent"' }, { status: 400 });
    }

    const withdrawalRef = adminDb.collection("cashout_requests").doc(withdrawalId);
    const withdrawalSnap = await withdrawalRef.get();
    if (!withdrawalSnap.exists) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    const withdrawalData = withdrawalSnap.data()!;
    if (action === "mark_sent") {
      if (withdrawalData.status !== "manual_required") {
        return NextResponse.json({ error: `Cannot mark as sent. Current status: ${withdrawalData.status}` }, { status: 400 });
      }
    } else if (withdrawalData.status !== "pending_review") {
      return NextResponse.json({ error: `Withdrawal already ${withdrawalData.status}` }, { status: 400 });
    }

    const ledgerRef = adminDb.collection("ledger_transactions").doc();

    if (action === "mark_sent") {
      await adminDb.runTransaction(async (transaction) => {
        transaction.update(withdrawalRef, {
          status: "sent",
          referenceNumber: referenceNumber || null,
          processedBy: adminUid,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        transaction.set(ledgerRef, {
          id: ledgerRef.id,
          userId: withdrawalData.userId,
          type: "cashout_paid",
          amountCoins: withdrawalData.amountCoins,
          balanceEffectCoins: 0,
          status: "paid",
          source: "cashout_admin_manual",
          referenceId: withdrawalId,
          metadata: {
            method: withdrawalData.method,
            destination: withdrawalData.destination,
            referenceNumber: referenceNumber || null,
            adminNote: adminNote || null,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await logAdminAction({
        action: "cashout_marked_sent",
        actorUserId: adminUid,
        actorEmail: adminEmail,
        targetType: "cashout_request",
        targetId: withdrawalId,
        metadata: { referenceNumber: referenceNumber || null, amountCoins: withdrawalData.amountCoins },
      });

      if (withdrawalData.destination && String(withdrawalData.destination).includes("@")) {
        await sendPayoutSentEmail(withdrawalData.destination, (withdrawalData.amountCents || withdrawalData.amountCoins / 10) / 100, withdrawalData.method, referenceNumber);
      }

      return NextResponse.json({ success: true, action: "mark_sent" });
    }

    if (action === "approve") {
      await adminDb.runTransaction(async (transaction) => {
        transaction.update(withdrawalRef, {
          status: "approved",
          reviewedBy: adminEmail,
          reviewedByUid: adminUid,
          reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
          adminNote: adminNote || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        transaction.set(ledgerRef, {
          id: ledgerRef.id,
          userId: withdrawalData.userId,
          type: "cashout_paid",
          amountCoins: withdrawalData.amountCoins,
          balanceEffectCoins: 0,
          status: "paid",
          source: "cashout_admin",
          referenceId: withdrawalId,
          metadata: {
            method: withdrawalData.method,
            destination: withdrawalData.destination,
            adminNote: adminNote || null,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await logAdminAction({
        action: "cashout_approved",
        actorUserId: adminUid,
        actorEmail: adminEmail,
        targetType: "cashout_request",
        targetId: withdrawalId,
        metadata: { adminNote: adminNote || null, amountCoins: withdrawalData.amountCoins },
      });

      if (withdrawalData.destination && String(withdrawalData.destination).includes("@")) {
        await sendPayoutApprovedEmail(withdrawalData.destination, withdrawalData.amountCents / 100, withdrawalData.method, adminNote);
      }

      return NextResponse.json({ success: true, action: "approve", automated: false });
    }

    await adminDb.runTransaction(async (transaction) => {
      transaction.update(withdrawalRef, {
        status: "rejected",
        reviewedBy: adminEmail,
        reviewedByUid: adminUid,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        adminNote: adminNote || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: withdrawalData.userId,
        type: "cashout_rejected",
        amountCoins: withdrawalData.amountCoins,
        balanceEffectCoins: withdrawalData.amountCoins,
        status: "rejected",
        source: "cashout_admin",
        referenceId: withdrawalId,
        metadata: {
          method: withdrawalData.method,
          destination: withdrawalData.destination,
          adminNote: adminNote || null,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await logAdminAction({
      action: "cashout_rejected",
      actorUserId: adminUid,
      actorEmail: adminEmail,
      targetType: "cashout_request",
      targetId: withdrawalId,
      metadata: { adminNote: adminNote || null, amountCoins: withdrawalData.amountCoins },
    });

    if (withdrawalData.destination && String(withdrawalData.destination).includes("@")) {
      await sendPayoutRejectedEmail(withdrawalData.destination, withdrawalData.amountCents / 100, adminNote);
    }

    return NextResponse.json({ success: true, action: "reject" });
  } catch (error: unknown) {
    console.error("Admin withdrawal processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("not found") ? 404 : 500 });
  }
}
