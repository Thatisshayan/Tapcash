import * as functions from "firebase-functions/v1";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();

// 1. Auth Hook: Initialize user profile on new signup
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  const batch = db.batch();

  batch.set(userRef, {
      email: user.email,
      createdAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
    });

  await batch.commit();
  console.log(`User ${user.uid} created.`);
});

// 2. Task Completion (Callable from client for MVP, eventually from Webhook)
export const completeTask = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { taskId, offerId, rewardCents } = data;
  if (!taskId || !offerId || !rewardCents || rewardCents <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Missing task data.");
  }

  const uid = context.auth.uid;
  const taskRef = db.collection("tasks").doc(taskId);
  const ledgerRef = db.collection("ledger_transactions").doc();

  try {
    await db.runTransaction(async (transaction: any) => {
      const taskDoc = await transaction.get(taskRef);
      if (taskDoc.exists && taskDoc.data()?.status === "completed") {
        throw new functions.https.HttpsError("already-exists", "Task already completed.");
      }

      transaction.set(taskRef, {
        userId: uid,
        offerId,
        rewardCents,
        status: "completed",
        completedAt: FieldValue.serverTimestamp()
      });

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
  } catch (error: any) {
    console.error("Error in completeTask:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Failed to complete task");
  }
});

// 3. Request Payout (Callable)
export const requestPayout = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { amountCents, method, payoutAddress } = data;
  if (!amountCents || amountCents <= 0 || !payoutAddress) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid payout request.");
  }

  const uid = context.auth.uid;
  const withdrawalRef = db.collection("cashout_requests").doc();
  const ledgerRef = db.collection("ledger_transactions").doc();

  try {
    const ledgerSnap = await db.collection("ledger_transactions").where("userId", "==", uid).get();
    let currentBalance = 0;
    ledgerSnap.forEach((doc: any) => {
      currentBalance += Number(doc.data().balanceEffectCoins || 0);
    });

    await db.runTransaction(async (transaction: any) => {
      if (currentBalance < amountCents) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient funds.");
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
  } catch (error: any) {
    console.error("Error in requestPayout:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Failed to process payout");
  }
});
