import { HttpsError, auth as authV1, https as httpsV1 } from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

admin.initializeApp();

const db = getFirestore();

// 1. Auth Hook: Initialize user profile on new signup
export const onUserCreated = authV1.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  const batch = db.batch();

  // Create base user document
  batch.set(userRef, {
      email: user.email,
      createdAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
    });

  await batch.commit();
  console.log(`User ${user.uid} created.`);
});

// 2. Task Completion (Callable from client for MVP, eventually from Webhook)
export const completeTask = httpsV1.onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { taskId, offerId, rewardCents } = request.data;
  if (!taskId || !offerId || !rewardCents || rewardCents <= 0) {
    throw new HttpsError("invalid-argument", "Missing task data.");
  }

  const uid = request.auth.uid;
  const taskRef = db.collection("tasks").doc(taskId);
  const ledgerRef = db.collection("ledger_transactions").doc();

  try {
    await db.runTransaction(async (transaction) => {
      // Idempotency check: see if task already exists
      const taskDoc = await transaction.get(taskRef);
      if (taskDoc.exists && taskDoc.data()?.status === "completed") {
        throw new HttpsError("already-exists", "Task already completed.");
      }

      // Record the task
      transaction.set(taskRef, {
        userId: uid,
        offerId,
        rewardCents,
        status: "completed",
        completedAt: FieldValue.serverTimestamp()
      });

      // Append to the ledger
      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: uid,
        type: "approved_credit",
        amountCoins: rewardCents,
        balanceEffectCoins: rewardCents,
        status: "approved",
        source: "cloud_function_task",
        referenceId: taskId,
        metadata: { offerId, rewardCents },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Write an audit log
      const auditRef = db.collection("audit").doc();
      transaction.set(auditRef, {
        action: "task_completed",
        uid,
        taskId,
        offerId,
        rewardCents,
        timestamp: FieldValue.serverTimestamp()
      });
    });

    return { success: true, rewardCents };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete task";
    console.error("Error in completeTask:", error);
    throw new HttpsError("internal", message);
  }
});

// 3. Request Payout (Callable)
export const requestPayout = httpsV1.onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { amountCents, method, payoutAddress } = request.data as {
    amountCents: number;
    method: string;
    payoutAddress: string;
  };
  if (!amountCents || amountCents <= 0 || !payoutAddress) {
    throw new HttpsError("invalid-argument", "Invalid payout request.");
  }

  const uid = request.auth.uid;
  const withdrawalRef = db.collection("cashout_requests").doc();
  const ledgerRef = db.collection("ledger_transactions").doc();

  try {
    const ledgerSnap = await db.collection("ledger_transactions").where("userId", "==", uid).get();
    let currentBalance = 0;
    ledgerSnap.forEach((doc) => {
      currentBalance += Number(doc.data().balanceEffectCoins || 0);
    });

    await db.runTransaction(async (transaction) => {
      if (currentBalance < amountCents) {
        throw new HttpsError("failed-precondition", "Insufficient funds.");
      }

      transaction.set(withdrawalRef, {
        id: withdrawalRef.id,
        userId: uid,
        amountCents,
        amountCoins: amountCents,
        method,
        payoutAddress,
        status: "pending_review",
        requestedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: uid,
        type: "cashout_requested",
        amountCoins: amountCents,
        balanceEffectCoins: -Math.abs(amountCents),
        status: "pending",
        source: "cloud_function_cashout",
        referenceId: withdrawalRef.id,
        metadata: { method, payoutAddress },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      // Write audit
      const auditRef = db.collection("audit").doc();
      transaction.set(auditRef, {
        action: "payout_requested",
        uid,
        amountCents,
        method,
        timestamp: FieldValue.serverTimestamp()
      });
    });

    return { success: true, message: "Payout request submitted." };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process payout";
    console.error("Error in requestPayout:", error);
    throw new HttpsError("internal", message);
  }
});
