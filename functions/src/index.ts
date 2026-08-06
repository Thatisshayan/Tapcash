import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();

async function sendExpoPush(token: string, title: string, body: string, data: Record<string, string> = {}) {
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        data,
        sound: "default",
        priority: "high",
      }),
    });

    if (!response.ok) {
      console.error("Expo push failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Expo push error:", error);
  }
}

async function getUserPushTokens(uid: string): Promise<string[]> {
  const tokens: string[] = [];
  const snapshot = await db.collection("users").doc(uid).collection("pushTokens").get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (typeof data.token === "string") {
      tokens.push(data.token);
    }
  });
  return tokens;
}

// 1. Auth Hook: Initialize user profile on new signup.
// v2 has no direct non-blocking onCreate-equivalent for Auth users — the
// closest v2 primitive is beforeUserCreated (firebase-functions/v2/identity),
// a blocking function that runs synchronously during signup and can reject
// it by throwing. It runs before the Auth user record is fully committed,
// so this write happens inline with the signup flow rather than as an
// async fire-and-forget trigger the way the v1 version did — that is an
// intentional, documented behavior change of this migration, not a bug.
export const onUserCreated = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user) return;

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
export const completeTask = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { taskId, offerId, rewardCents } = request.data as {
    taskId?: string;
    offerId?: string;
    rewardCents?: number;
  };
  if (!taskId || !offerId || !rewardCents || rewardCents <= 0) {
    throw new HttpsError("invalid-argument", "Missing task data.");
  }

  const uid = request.auth.uid;
  const taskRef = db.collection("tasks").doc(taskId);
  const ledgerRef = db.collection("ledger_transactions").doc();

  try {
    await db.runTransaction(async (transaction: any) => {
      const taskDoc = await transaction.get(taskRef);
      if (taskDoc.exists && taskDoc.data()?.status === "completed") {
        throw new HttpsError("already-exists", "Task already completed.");
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
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message || "Failed to complete task");
  }
});

// 3. Request Payout (Callable)
export const requestPayout = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { amountCents, method, payoutAddress } = request.data as {
    amountCents?: number;
    method?: string;
    payoutAddress?: string;
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
    ledgerSnap.forEach((doc: any) => {
      currentBalance += Number(doc.data().balanceEffectCoins || 0);
    });

    await db.runTransaction(async (transaction: any) => {
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
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message || "Failed to process payout");
  }
});

// 4. Push notification on offer approval (ledger transaction status change to approved)
export const onOfferApproved = onDocumentCreated("ledger_transactions/{transactionId}", async (event) => {
  const snap = event.data;
  const data = snap?.data();
  if (!data || data.type !== "approved_credit" || data.status !== "approved") return;

  const uid = data.userId;
  const amountCoins = Number(data.amountCoins || 0);

  const tokens = await getUserPushTokens(uid);
  if (tokens.length === 0) return;

  await Promise.all(
    tokens.map((token) =>
      sendExpoPush(
        token,
        "🎉 You earned coins!",
        `You earned ${amountCoins} coins from an offer!`,
        { screen: "activity" }
      )
    )
  );
});

// 5. Push notification on cashout sent
export const onCashoutSent = onDocumentUpdated("cashout_requests/{requestId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  if (before.status !== "pending_review" && before.status !== "processing" && after.status !== "sent") return;

  const uid = after.userId;
  const amountCoins = Number(after.amountCoins || 0);
  const method = after.method || "your account";

  const tokens = await getUserPushTokens(uid);
  if (tokens.length === 0) return;

  await Promise.all(
    tokens.map((token) =>
      sendExpoPush(
        token,
        "💸 Payout on the way!",
        `Your ${method} payout of ${amountCoins} coins is on the way!`,
        { screen: "cashout" }
      )
    )
  );
});

// 6. Push notification on cashout rejected
export const onCashoutRejected = onDocumentUpdated("cashout_requests/{requestId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  if (before.status === after.status) return;

  const wasApproved = before.status === "pending_review" || before.status === "processing";
  const isRejected = after.status === "rejected" || after.status === "failed";

  if (!wasApproved || !isRejected) return;

  const uid = after.userId;

  const tokens = await getUserPushTokens(uid);
  if (tokens.length === 0) return;

  await Promise.all(
    tokens.map((token) =>
      sendExpoPush(
        token,
        "Update on your cashout request",
        "Your cashout was rejected. Tap to see details.",
        { screen: "cashout" }
      )
    )
  );
});