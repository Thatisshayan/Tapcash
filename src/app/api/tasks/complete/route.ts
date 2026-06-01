import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { withRateLimit } from "@/lib/rate-limit";
import { requireVerifiedUser } from "@/lib/verified-user";

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const verifiedUser = await requireVerifiedUser(request);
    if ("response" in verifiedUser) return verifiedUser.response;
    const { uid } = verifiedUser;

    const body = await request.json();
    const { taskId, offerId, rewardCents } = body;

    if (!taskId || !offerId || !rewardCents || rewardCents <= 0) {
      return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
    }

    const rewardCoins = Math.floor(Number(rewardCents));
    const taskRef = adminDb.collection("tasks").doc(taskId);
    const ledgerRef = adminDb.collection("ledger_transactions").doc();
    const auditRef = adminDb.collection("admin_actions").doc();

    await adminDb.runTransaction(async (transaction) => {
      const taskDoc = await transaction.get(taskRef);
      if (taskDoc.exists && taskDoc.data()?.status === "completed") {
        throw new Error("Task already completed.");
      }

      transaction.set(taskRef, {
        userId: uid,
        offerId,
        rewardCents,
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: uid,
        type: "approved_credit",
        amountCoins: rewardCoins,
        balanceEffectCoins: rewardCoins,
        method: "Task Completion",
        status: "approved",
        source: "task_completion",
        referenceId: taskId,
        metadata: { taskId, offerId, rewardCents },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.set(auditRef, {
        id: auditRef.id,
        action: "task_completed",
        actorUserId: uid,
        targetType: "task",
        targetId: taskId,
        metadata: { offerId, rewardCents },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true, rewardCents });
  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to complete task" }, { status: 500 });
  }
}
