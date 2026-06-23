import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

async function checkPendingCashout(uid: string): Promise<boolean> {
  const pendingSnap = await adminDb
    .collection("cashout_requests")
    .where("userId", "==", uid)
    .where("status", "in", ["pending_review", "processing"])
    .limit(1)
    .get();
  return !pendingSnap.empty;
}

async function softDeleteUser(uid: string): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);

  await adminDb.runTransaction(async (transaction) => {
    transaction.update(userRef, {
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      email: FieldValue.delete(),
      pushToken: FieldValue.delete(),
      displayName: FieldValue.delete(),
      status: "deleted",
    });

    const ledgerSnap = await transaction.get(
      adminDb.collection("ledger_transactions").where("userId", "==", uid)
    );
    ledgerSnap.forEach((doc) => {
      transaction.update(doc.ref, {
        deleted: true,
        deletedAt: FieldValue.serverTimestamp(),
      });
    });

    const clicksSnap = await transaction.get(
      adminDb.collection("offer_clicks").where("userId", "==", uid)
    );
    clicksSnap.forEach((doc) => {
      transaction.update(doc.ref, {
        deleted: true,
        deletedAt: FieldValue.serverTimestamp(),
      });
    });

    const postbacksSnap = await transaction.get(
      adminDb.collection("offer_postbacks").where("userId", "==", uid)
    );
    postbacksSnap.forEach((doc) => {
      transaction.update(doc.ref, {
        deleted: true,
        deletedAt: FieldValue.serverTimestamp(),
      });
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const hasPending = await checkPendingCashout(uid);
    if (hasPending) {
      return NextResponse.json(
        { error: "You have a pending cashout. Please wait for it to be processed before deleting your account." },
        { status: 400 }
      );
    }

    await softDeleteUser(uid);

    await adminDb.collection("admin_logs").add({
      action: "gdpr_delete_requested",
      userId: uid,
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: "Account marked for deletion. You have been signed out." });
  } catch (error: unknown) {
    console.error("GDPR delete error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}