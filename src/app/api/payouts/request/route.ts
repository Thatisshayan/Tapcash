import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";
import { withRateLimit } from "@/lib/rate-limit";
import { computeLedgerBalance } from "@/lib/ledger";
import { logAdminAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, { limit: 3, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing authorization header" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    const botCheck = isBotAgent(userAgent);
    if (botCheck.isBot) {
      await logFraudAttempt({
        ip,
        userId: uid,
        action: "PAYOUT_BLOCKED_BOT",
        reason: botCheck.reason || "Bot User-Agent detected on withdrawal",
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Access denied. Automated web requests are prohibited." }, { status: 403 });
    }

    const body = await request.json();
    const { amountCoins, method, destination, deviceFingerprint } = body;

    if (!amountCoins || !method || !destination) {
      return NextResponse.json({ error: "Missing required fields: amountCoins, method, or destination" }, { status: 400 });
    }

    const coinsNum = parseInt(amountCoins, 10);
    if (Number.isNaN(coinsNum) || coinsNum < 2000) {
      return NextResponse.json({ error: "Invalid amount. Minimum cashout is 2,000 coins ($2.00)." }, { status: 400 });
    }

    const allowedMethods = ["paypal", "litecoin", "bitcoin", "visa", "steam", "roblox", "interac", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];
    if (!allowedMethods.includes(method)) {
      return NextResponse.json({ error: `Invalid payout method: ${method}` }, { status: 400 });
    }

    const cleanDest = String(destination).trim().toLowerCase();
    if (!cleanDest) {
      return NextResponse.json({ error: "A valid payment destination is required." }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const userData = userSnap.data()!;
    if (userData.status === "banned" || userData.isFlagged === true) {
      await logFraudAttempt({
        ip,
        userId: uid,
        email: userData.email,
        action: "PAYOUT_BLOCKED_LOCK",
        reason: `Banned/Flagged user attempted withdrawal. Status: ${userData.status}`,
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Your account is currently locked or flagged for review. Withdrawals disabled." }, { status: 403 });
    }

    const ipCheck = await isIpSuspicious(ip, "PAYOUT_BLOCKED_VPN", uid, userData.email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on requesting payouts." }, { status: 403 });
    }

    const ledgerBalance = await computeLedgerBalance(uid);
    if (ledgerBalance < coinsNum) {
      return NextResponse.json({ error: "Insufficient balance for this cashout." }, { status: 400 });
    }

    const pendingSnap = await adminDb
      .collection("cashout_requests")
      .where("userId", "==", uid)
      .where("status", "==", "pending_review")
      .limit(1)
      .get();

    if (!pendingSnap.empty) {
      return NextResponse.json({ error: "You already have a pending withdrawal request." }, { status: 400 });
    }

    const offerCountSnap = await adminDb
      .collection("offer_postbacks")
      .where("userId", "==", uid)
      .where("status", "==", "approved")
      .get();

    if (offerCountSnap.size < 2) {
      return NextResponse.json({ error: "Engagement Lock: complete at least 2 approved offers before cashing out." }, { status: 400 });
    }

    const duplicateDestSnap = await adminDb
      .collection("cashout_requests")
      .where("destination", "==", cleanDest)
      .limit(1)
      .get();

    if (!duplicateDestSnap.empty) {
      const duplicateRecord = duplicateDestSnap.docs[0].data();
      if (duplicateRecord.userId !== uid) {
        await userRef.update({
          status: "flagged",
          isFlagged: true,
          flaggedReason: `Attempted payout destination already linked to another account.`,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await adminDb.collection("users").doc(duplicateRecord.userId).update({
          status: "flagged",
          isFlagged: true,
          flaggedReason: `Payment address linked to another account was reused.`,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await logFraudAttempt({
          ip,
          userId: uid,
          email: userData.email,
          action: "SYBIL_ACCOUNT_LINKED",
          reason: `Linked payment address (${cleanDest}) found across accounts: ${uid} and ${duplicateRecord.userId}. Both accounts auto-flagged.`,
          userAgent,
          createdAt: new Date(),
          details: { cleanDest, suspectUserId: uid, linkedUserId: duplicateRecord.userId },
        });

        return NextResponse.json({ error: "Security Alert: This payment address is already linked to another active account." }, { status: 403 });
      }
    }

    const cashoutRef = adminDb.collection("cashout_requests").doc();
    const ledgerRef = adminDb.collection("ledger_transactions").doc();

    await adminDb.runTransaction(async (transaction) => {
      const freshUserSnap = await transaction.get(userRef);
      if (!freshUserSnap.exists) {
        throw new Error("User profile not found in database.");
      }

      const freshUserData = freshUserSnap.data()!;
      if (freshUserData.status === "banned" || freshUserData.isFlagged === true) {
        throw new Error("Withdrawals disabled for flagged or locked accounts.");
      }

      transaction.set(cashoutRef, {
        id: cashoutRef.id,
        userId: uid,
        amountCoins: coinsNum,
        amountCents: Math.floor(coinsNum / 10),
        method,
        destination: cleanDest,
        status: "pending_review",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ip,
        deviceFingerprint: deviceFingerprint || null,
      });

      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: uid,
        type: "cashout_requested",
        amountCoins: coinsNum,
        balanceEffectCoins: -Math.abs(coinsNum),
        status: "pending",
        source: "cashout_request",
        referenceId: cashoutRef.id,
        metadata: { method, destination: cleanDest },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await logAdminAction({
      action: "cashout_requested",
      actorUserId: uid,
      targetType: "cashout_request",
      targetId: cashoutRef.id,
      metadata: { amountCoins: coinsNum, method, destination: cleanDest },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawalId: cashoutRef.id,
      deducted: coinsNum,
    });
  } catch (error: any) {
    console.error("Withdrawal API transaction error:", error);
    return NextResponse.json({ error: error.message || "Internal transaction failed" }, { status: 500 });
  }
}
