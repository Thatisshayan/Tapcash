"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPayout = exports.completeTask = exports.onUserCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// 1. Auth Hook: Initialize user profile on new signup
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const userRef = db.collection("users").doc(user.uid);
    const batch = db.batch();
    // Create base user document
    batch.set(userRef, {
        email: user.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    console.log(`User ${user.uid} created.`);
});
// 2. Task Completion (Callable from client for MVP, eventually from Webhook)
exports.completeTask = functions.https.onCall(async (data, context) => {
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
        await db.runTransaction(async (transaction) => {
            var _a;
            // Idempotency check: see if task already exists
            const taskDoc = await transaction.get(taskRef);
            if (taskDoc.exists && ((_a = taskDoc.data()) === null || _a === void 0 ? void 0 : _a.status) === "completed") {
                throw new functions.https.HttpsError("already-exists", "Task already completed.");
            }
            // Record the task
            transaction.set(taskRef, {
                userId: uid,
                offerId,
                rewardCents,
                status: "completed",
                completedAt: admin.firestore.FieldValue.serverTimestamp()
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
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Write an audit log
            const auditRef = db.collection("audit").doc();
            transaction.set(auditRef, {
                action: "task_completed",
                uid,
                taskId,
                offerId,
                rewardCents,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        return { success: true, rewardCents };
    }
    catch (error) {
        console.error("Error in completeTask:", error);
        throw new functions.https.HttpsError("internal", error.message || "Failed to complete task");
    }
});
// 3. Request Payout (Callable)
exports.requestPayout = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }
    const { amountCents, method, payoutAddress } = data; // method: 'paypal' | 'stripe'
    if (!amountCents || amountCents <= 0 || !payoutAddress) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid payout request.");
    }
    const uid = context.auth.uid;
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
                requestedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Write audit
            const auditRef = db.collection("audit").doc();
            transaction.set(auditRef, {
                action: "payout_requested",
                uid,
                amountCents,
                method,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        // NOTE: In production, this is where we would enqueue a Cloud Task 
        // to process the payout via Stripe/PayPal sandbox asynchronously.
        return { success: true, message: "Payout request submitted." };
    }
    catch (error) {
        console.error("Error in requestPayout:", error);
        throw new functions.https.HttpsError("internal", error.message || "Failed to process payout");
    }
});
//# sourceMappingURL=index.js.map