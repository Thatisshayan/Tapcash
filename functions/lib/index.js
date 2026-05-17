"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPayout = exports.completeTask = exports.onUserCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// 1. Auth Hook: Initialize wallet on new user signup
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const userRef = db.collection("users").doc(user.uid);
    const batch = db.batch();
    // Create base user document
    batch.set(userRef, {
        email: user.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Create initial wallet document
    const walletRef = userRef.collection("wallet").doc("balance");
    batch.set(walletRef, {
        balanceCents: 0,
        pendingCents: 0,
        totalEarnedCents: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();
    console.log(`User ${user.uid} created and wallet initialized.`);
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
    const walletRef = db.collection("users").doc(uid).collection("wallet").doc("balance");
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
            // Update the wallet balance
            transaction.update(walletRef, {
                balanceCents: admin.firestore.FieldValue.increment(rewardCents),
                totalEarnedCents: admin.firestore.FieldValue.increment(rewardCents),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    const walletRef = db.collection("users").doc(uid).collection("wallet").doc("balance");
    try {
        await db.runTransaction(async (transaction) => {
            var _a;
            const walletDoc = await transaction.get(walletRef);
            if (!walletDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Wallet not found.");
            }
            const currentBalance = ((_a = walletDoc.data()) === null || _a === void 0 ? void 0 : _a.balanceCents) || 0;
            if (currentBalance < amountCents) {
                throw new functions.https.HttpsError("failed-precondition", "Insufficient funds.");
            }
            // Deduct balance and increase pending
            transaction.update(walletRef, {
                balanceCents: admin.firestore.FieldValue.increment(-amountCents),
                pendingCents: admin.firestore.FieldValue.increment(amountCents),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // Record the withdrawal request (simulating sending to a Cloud Task queue later)
            const withdrawalRef = db.collection("users").doc(uid).collection("withdrawals").doc();
            transaction.set(withdrawalRef, {
                amountCents,
                method,
                payoutAddress,
                status: "pending",
                requestedAt: admin.firestore.FieldValue.serverTimestamp()
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