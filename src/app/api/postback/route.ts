import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { getClientIp, logFraudAttempt } from "@/lib/antiFraud";
import { logAdminAction } from "@/lib/audit";

const LOOTABLY_IPS = ["54.210.231.13"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  const uid = searchParams.get("uid") || searchParams.get("user_id");
  const amountStr = searchParams.get("amount");
  const txId = searchParams.get("tx_id");
  const offerId = searchParams.get("offer_id");
  const sig = searchParams.get("sig");

  if (!uid || !amountStr || !txId || !offerId || !sig) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  const amountCoins = parseInt(amountStr, 10);
  if (Number.isNaN(amountCoins) || amountCoins <= 0) {
    return new NextResponse("Invalid amount", { status: 400 });
  }

  const allowedPostbackIps = process.env.ALLOWED_POSTBACK_IPS
    ? process.env.ALLOWED_POSTBACK_IPS.split(",").map((value) => value.trim())
    : LOOTABLY_IPS;

  const isDev = process.env.NODE_ENV === "development" || ip === "127.0.0.1" || ip === "::1";
  if (!isDev && !allowedPostbackIps.includes(ip)) {
    await logFraudAttempt({
      ip,
      userId: uid,
      action: "POSTBACK_IP_BLOCKED",
      reason: `Postback rejected from untrusted IP: ${ip}`,
      userAgent,
      createdAt: new Date(),
    });
    return new NextResponse("Forbidden IP origin", { status: 403 });
  }

  const secretKey = process.env.LOOTABLY_SECRET_KEY;
  if (secretKey) {
    const computedSig = crypto.createHash("md5").update(uid + amountCoins + txId + secretKey).digest("hex");
    if (computedSig.toLowerCase() !== sig.toLowerCase()) {
      await logFraudAttempt({
        ip,
        userId: uid,
        action: "POSTBACK_SIG_MISMATCH",
        reason: "Lootably signature validation failed",
        userAgent,
        createdAt: new Date(),
        details: { txId, offerId },
      });
      return new NextResponse("Invalid signature", { status: 403 });
    }
  }

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const clickSnap = await adminDb
      .collection("offer_clicks")
      .where("userId", "==", uid)
      .where("offerId", "==", offerId)
      .where("timestamp", ">=", Timestamp.fromDate(oneWeekAgo))
      .limit(1)
      .get();

    const postbackRef = adminDb.collection("offer_postbacks").doc(txId);
    const pendingLedgerRef = adminDb.collection("ledger_transactions").doc(`pending_${txId}`);
    const approvedLedgerRef = adminDb.collection("ledger_transactions").doc(`approved_${txId}`);

    await adminDb.runTransaction(async (transaction) => {
      const existingPostback = await transaction.get(postbackRef);
      if (existingPostback.exists) {
        throw new Error("DUPLICATE");
      }

      const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("USER_NOT_FOUND");
      }

      const userData = userDoc.data()!;
      const clickVerified = !clickSnap.empty;
      const shouldApprove = clickVerified && userData.status !== "banned" && userData.isFlagged !== true;
      const status = shouldApprove ? "approved" : "pending_review";

      transaction.set(postbackRef, {
        id: txId,
        userId: uid,
        offerId,
        provider: "lootably",
        amountCoins,
        ip,
        userAgent,
        clickVerified,
        status,
        source: "lootably",
        signatureValid: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          txId,
          sig,
        },
      });

      transaction.set(pendingLedgerRef, {
        id: pendingLedgerRef.id,
        userId: uid,
        type: "pending_credit",
        amountCoins,
        balanceEffectCoins: 0,
        status: "pending",
        source: "lootably_postback",
        referenceId: txId,
        metadata: { offerId, provider: "lootably", clickVerified },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (shouldApprove) {
        transaction.set(approvedLedgerRef, {
          id: approvedLedgerRef.id,
          userId: uid,
          type: "approved_credit",
          amountCoins,
          balanceEffectCoins: amountCoins,
          status: "approved",
          source: "lootably_postback",
          referenceId: txId,
          metadata: { offerId, provider: "lootably", clickVerified },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const auditRef = adminDb.collection("admin_actions").doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        action: "offerwall_postback",
        actorUserId: uid,
        targetType: "offer",
        targetId: offerId,
        metadata: { txId, amountCoins, provider: "lootably", status },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (!shouldApprove) {
        transaction.set(adminDb.collection("fraud_flags").doc(), {
          ip,
          userId: uid,
          email: userData.email || null,
          action: "POSTBACK_HELD_REVIEW",
          reason: clickVerified ? "Account flagged" : "No matching click in 7 days",
          userAgent,
          details: {
            amountCoins,
            txId,
            offerId,
            provider: "lootably",
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    await logAdminAction({
      action: "postback_received",
      actorUserId: uid,
      targetType: "offer",
      targetId: offerId,
      metadata: { txId, amountCoins, provider: "lootably" },
    });

    return new NextResponse("1", { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "DUPLICATE") {
      return new NextResponse("1", { status: 200 });
    }
    if (message === "USER_NOT_FOUND") {
      return new NextResponse("User not found", { status: 404 });
    }

    console.error("[Lootably] Error processing postback:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
