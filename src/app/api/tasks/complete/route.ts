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
    const { taskId, offerId, rewardCents } = body;

    if (!taskId || !offerId || !rewardCents || rewardCents <= 0) {
      return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
    }

    const taskRef = adminDb.collection("tasks").doc(taskId);
    const walletRef = adminDb.collection("users").doc(uid).collection("wallet").doc("balance");

    await adminDb.runTransaction(async (transaction) => {
      const taskDoc = await transaction.get(taskRef);
      if (taskDoc.exists && taskDoc.data()?.status === "completed") {
        throw new Error("Task already completed.");
      }

      // Record task
      transaction.set(taskRef, {
        userId: uid,
        offerId,
        rewardCents,
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update wallet
      transaction.set(walletRef, {
        balanceCents: admin.firestore.FieldValue.increment(rewardCents),
        totalEarnedCents: admin.firestore.FieldValue.increment(rewardCents),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Audit log
      const auditRef = adminDb.collection("audit").doc();
      transaction.set(auditRef, {
        action: "task_completed",
        uid,
        taskId,
        offerId,
        rewardCents,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return NextResponse.json({ success: true, rewardCents });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete task" }, { status: 500 });
  }
}
