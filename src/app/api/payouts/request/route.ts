import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../lib/firebaseAdmin";
import * as admin from "firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await request.json();
    const { amountCents, method, payoutAddress } = body;

    if (!amountCents || amountCents <= 0 || !payoutAddress) {
      return NextResponse.json({ error: "Invalid payout request" }, { status: 400 });
    }

    const walletRef = adminDb.collection("users").doc(uid).collection("wallet").doc("balance");

    await adminDb.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists) {
        throw new Error("Wallet not found.");
      }

      const currentBalance = walletDoc.data()?.balanceCents || 0;
      if (currentBalance < amountCents) {
        throw new Error("Insufficient funds.");
      }

      // Deduct balance
      transaction.update(walletRef, {
        balanceCents: admin.firestore.FieldValue.increment(-amountCents),
        pendingCents: admin.firestore.FieldValue.increment(amountCents),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Request withdrawal
      const withdrawalRef = adminDb.collection("users").doc(uid).collection("withdrawals").doc();
      transaction.set(withdrawalRef, {
        amountCents,
        method,
        payoutAddress,
        status: "pending",
        requestedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit
      const auditRef = adminDb.collection("audit").doc();
      transaction.set(auditRef, {
        action: "payout_requested",
        uid,
        amountCents,
        method,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return NextResponse.json({ success: true, message: "Payout request submitted." });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process payout" }, { status: 500 });
  }
}
