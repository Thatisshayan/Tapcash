import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { getClientIp } from "@/lib/antiFraud";
import { logAdminAction } from "@/lib/audit";

const RAPIDOREACH_IPS = [
  "161.97.78.55",
  "173.212.227.149",
  "75.119.139.250",
  "75.119.139.251",
  "127.0.0.1",
  "::1",
];

function parseAmountCoins(rawAmount: string | null): number {
  if (!rawAmount) return NaN;

  const trimmed = rawAmount.trim();
  if (!trimmed) return NaN;

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric <= 0) {
    return NaN;
  }

  // RapidoReach may send either a whole-number currency amount or a dollar amount.
  // Prefer whole-number currency values, otherwise convert dollars to cents.
  return Number.isInteger(numeric) ? numeric : Math.round(numeric * 100);
}

function isCompletedStatus(rawStatus: string | null): boolean {
  if (!rawStatus) return true;

  const normalized = rawStatus.trim().toLowerCase();
  return ["c", "complete", "completed", "approved", "success"].includes(normalized);
}

async function handlePostback(
  uid: string,
  txId: string,
  offerId: string,
  amountCoins: number,
  ip: string,
  userAgent: string,
  callbackStatus: string | null
) {
  const postbackRef = adminDb.collection("offer_postbacks").doc(txId);
  const pendingLedgerRef = adminDb.collection("ledger_transactions").doc(`pending_${txId}`);
  const approvedLedgerRef = adminDb.collection("ledger_transactions").doc(`approved_${txId}`);
  const clickSnap = await adminDb
    .collection("offer_clicks")
    .where("userId", "==", uid)
    .where("offerId", "==", offerId)
    .where("timestamp", ">=", Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
    .limit(1)
    .get();

  await adminDb.runTransaction(async (transaction) => {
    const existing = await transaction.get(postbackRef);
    if (existing.exists) {
      throw new Error("DUPLICATE");
    }

    const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("USER_NOT_FOUND");
      }

      const userData = userDoc.data()!;
      const approved = isCompletedStatus(callbackStatus) && !clickSnap.empty && userData.status !== "banned" && userData.isFlagged !== true;
      const status = approved ? "approved" : "pending_review";

      transaction.set(postbackRef, {
        id: txId,
        userId: uid,
        offerId,
        provider: "rapidoreach",
        amountCoins,
        ip,
        userAgent,
        clickVerified: !clickSnap.empty,
        callbackStatus,
        status,
        source: "rapidoreach",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { txId },
    });

    transaction.set(pendingLedgerRef, {
      id: pendingLedgerRef.id,
      userId: uid,
      type: "pending_credit",
      amountCoins,
      balanceEffectCoins: 0,
      status: "pending",
      source: "rapidoreach_postback",
      referenceId: txId,
      metadata: { offerId, provider: "rapidoreach" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (approved) {
      transaction.set(approvedLedgerRef, {
        id: approvedLedgerRef.id,
        userId: uid,
        type: "approved_credit",
        amountCoins,
        balanceEffectCoins: amountCoins,
        status: "approved",
        source: "rapidoreach_postback",
        referenceId: txId,
        metadata: { offerId, provider: "rapidoreach" },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    });

    await logAdminAction({
      action: "rapidoreach_postback",
      actorUserId: uid,
      targetType: "offer",
      targetId: offerId,
      metadata: { txId, amountCoins, ip, approved: isCompletedStatus(callbackStatus) },
    });
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  if (!RAPIDOREACH_IPS.includes(ip) && process.env.NODE_ENV === "production") {
    return new NextResponse("Unauthorized IP", { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get("uid") || searchParams.get("userId") || searchParams.get("user_id");
    const rewardStr = searchParams.get("currencyAmt") || searchParams.get("reward") || searchParams.get("amt") || searchParams.get("amount");
    const txId = searchParams.get("transactionId") || searchParams.get("txnId") || searchParams.get("tx_id") || searchParams.get("transaction_id") || searchParams.get("id");
    const offerId = searchParams.get("offerInvitationId") || searchParams.get("offer_id") || searchParams.get("offerId") || "rapidoreach";
    const callbackStatus = searchParams.get("status") || searchParams.get("cmd");

    if (!uid || !rewardStr || !txId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const amountCoins = parseAmountCoins(rewardStr);
    if (Number.isNaN(amountCoins) || amountCoins <= 0) {
      return new NextResponse("Invalid reward", { status: 400 });
    }

    await handlePostback(uid, txId, offerId, amountCoins, ip, userAgent, callbackStatus);
    return new NextResponse("1", { status: 200 });
  } catch (error: any) {
    if (error.message === "DUPLICATE") return new NextResponse("1", { status: 200 });
    if (error.message === "USER_NOT_FOUND") return new NextResponse("User not found", { status: 404 });
    console.error("[RapidoReach Postback] Error processing request:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  if (!RAPIDOREACH_IPS.includes(ip) && process.env.NODE_ENV === "production") {
    return new NextResponse("Unauthorized IP", { status: 403 });
  }

  try {
    const body = await request.json();
    const uid = body.uid || body.userId || body.user_id;
    const txId = body.txId || body.tx_id || body.transactionId || body.transaction_id || body.id;
    const amountCoins = parseAmountCoins(String(body.currencyAmt || body.reward || body.amount || body.coins || body.amt || ""));
    const offerId = body.offerId || body.offer_id || body.offerInvitationId || "rapidoreach";
    const callbackStatus = body.status || body.cmd || null;

    if (!uid || !txId || Number.isNaN(amountCoins) || amountCoins <= 0) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    await handlePostback(uid, txId, offerId, amountCoins, ip, userAgent, callbackStatus);

    await adminDb.collection("webhook_logs").add({
      provider: "rapidoreach",
      method: "POST",
      ip,
      body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return new NextResponse("1", { status: 200 });
  } catch (error: any) {
    if (error.message === "DUPLICATE") return new NextResponse("1", { status: 200 });
    console.error("[RapidoReach Postback] Error processing POST:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
