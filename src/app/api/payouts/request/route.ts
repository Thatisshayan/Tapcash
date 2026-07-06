import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";
import { withRateLimit } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";
import { requireVerifiedUser } from "@/lib/verified-user";
import { sendPayoutSubmittedEmail } from "@/lib/email";
import { validateCsrf } from "@/lib/csrf";
import { validateOrigin } from "@/lib/origin";
import { checkIdempotency, storeIdempotencyResponse } from "@/lib/idempotency";
import { applyBonus, getGiftCardBonus } from "@/lib/giftCardBonus";

class RouteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RouteError";
    this.status = status;
  }
}

function getDestinationLockId(destination: string) {
  return createHash("sha256").update(destination).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, { limit: 3, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const originResult = validateOrigin(request);
    if (!originResult.valid) {
      return NextResponse.json({ error: `Origin validation failed: ${originResult.error}` }, { status: 403 });
    }

    const csrfResult = validateCsrf(request);
    if (!csrfResult.valid) {
      return NextResponse.json({ error: `CSRF validation failed: ${csrfResult.error}` }, { status: 403 });
    }

    const verifiedUser = await requireVerifiedUser(request);
    if ("response" in verifiedUser) return verifiedUser.response;
    const { uid, email: verifiedEmail, userData } = verifiedUser;

    const idempotency = await checkIdempotency(request, uid);
    if (idempotency.isDuplicate && idempotency.existingResponse) {
      return NextResponse.json(idempotency.existingResponse.body, { status: idempotency.existingResponse.status });
    }

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

    const MAX_PER_TRANSACTION = 50000;
    if (coinsNum > MAX_PER_TRANSACTION) {
      return NextResponse.json({ error: `Maximum cashout per transaction is ${MAX_PER_TRANSACTION.toLocaleString()} coins ($${MAX_PER_TRANSACTION / 1000}.00).` }, { status: 400 });
    }

    const userFraudScore = Number(userData.fraudScore || 0);
    if (userFraudScore > 50) {
      await logFraudAttempt({
        ip,
        userId: uid,
        email: verifiedEmail || userData.email,
        action: "PAYOUT_BLOCKED_FRAUD_SCORE",
        reason: `Cashout blocked: fraud score ${userFraudScore} exceeds threshold (50)`,
        userAgent,
        createdAt: new Date(),
        details: { fraudScore: userFraudScore, amountCoins: coinsNum },
      });
      return NextResponse.json({ error: "Withdrawal unavailable. Your account requires additional verification before withdrawals can be processed." }, { status: 403 });
    }

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const createdAtRaw = userData.createdAt;
    let accountCreatedAt: number | null = null;
    if (createdAtRaw) {
      if (typeof createdAtRaw === "object" && createdAtRaw !== null && "toDate" in createdAtRaw && typeof createdAtRaw.toDate === "function") {
        accountCreatedAt = createdAtRaw.toDate().getTime();
      } else if (createdAtRaw instanceof Date) {
        accountCreatedAt = createdAtRaw.getTime();
      } else if (typeof createdAtRaw === "string") {
        accountCreatedAt = new Date(createdAtRaw).getTime();
      }
    }
    if (accountCreatedAt && Date.now() - accountCreatedAt < SEVEN_DAYS_MS) {
      const daysRemaining = Math.ceil((SEVEN_DAYS_MS - (Date.now() - accountCreatedAt)) / (24 * 60 * 60 * 1000));
      return NextResponse.json({ error: `New accounts have a 7-day hold period before withdrawals. Please wait ${daysRemaining} more day(s).` }, { status: 400 });
    }

    const DAILY_LIMIT = 100000;
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayCashouts = await adminDb
      .collection("cashout_requests")
      .where("userId", "==", uid)
      .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(todayStart))
      .get();
    let todayTotal = 0;
    todayCashouts.forEach((doc) => {
      const data = doc.data();
      if (data.status !== "rejected" && data.status !== "cancelled") {
        todayTotal += Number(data.amountCoins || 0);
      }
    });
    if (todayTotal + coinsNum > DAILY_LIMIT) {
      return NextResponse.json({ error: `Daily withdrawal limit is ${DAILY_LIMIT.toLocaleString()} coins ($${DAILY_LIMIT / 1000}.00). You have already requested ${todayTotal.toLocaleString()} coins today.` }, { status: 400 });
    }

    const allowedMethods = ["paypal", "litecoin", "bitcoin", "visa", "steam", "roblox", "interac", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];
    if (!allowedMethods.includes(method)) {
      return NextResponse.json({ error: `Invalid payout method: ${method}` }, { status: 400 });
    }

    const cleanDest = String(destination).trim().toLowerCase();
    if (!cleanDest) {
      return NextResponse.json({ error: "A valid payment destination is required." }, { status: 400 });
    }

    const destinationLockId = getDestinationLockId(cleanDest);
    const userRef = adminDb.collection("users").doc(uid);
    const destinationLockRef = adminDb.collection("cashout_destination_locks").doc(destinationLockId);

    if (userData.status === "banned" || userData.isFlagged === true) {
      await logFraudAttempt({
        ip,
        userId: uid,
        email: verifiedEmail || userData.email,
        action: "PAYOUT_BLOCKED_LOCK",
        reason: `Banned/Flagged user attempted withdrawal. Status: ${userData.status}`,
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Your account is currently locked or flagged for review. Withdrawals disabled." }, { status: 403 });
    }

    const ipCheck = await isIpSuspicious(ip, "PAYOUT_BLOCKED_VPN", uid, verifiedEmail || userData.email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on requesting payouts." }, { status: 403 });
    }

    const cashoutRef = adminDb.collection("cashout_requests").doc();
    const ledgerRef = adminDb.collection("ledger_transactions").doc();
    let duplicateDestinationOwnerId: string | null = null;

    await adminDb.runTransaction(async (transaction) => {
      duplicateDestinationOwnerId = null;

      const freshUserSnap = await transaction.get(userRef);
      if (!freshUserSnap.exists) {
        throw new RouteError("User profile not found in database.", 500);
      }

      const freshUserData = freshUserSnap.data()!;
      if (freshUserData.status === "banned" || freshUserData.isFlagged === true) {
        throw new RouteError("Withdrawals disabled for flagged or locked accounts.", 403);
      }

      const activeCashoutRequestId =
        typeof freshUserData.activeCashoutRequestId === "string" && freshUserData.activeCashoutRequestId.trim().length > 0
          ? freshUserData.activeCashoutRequestId.trim()
          : null;

      if (activeCashoutRequestId) {
        const activeRequestRef = adminDb.collection("cashout_requests").doc(activeCashoutRequestId);
        const activeRequestSnap = await transaction.get(activeRequestRef);
        if (activeRequestSnap.exists && activeRequestSnap.data()?.status === "pending_review") {
          throw new RouteError("You already have a pending withdrawal request.", 400);
        }
      }

      const pendingSnap = await transaction.get(
        adminDb
          .collection("cashout_requests")
          .where("userId", "==", uid)
          .where("status", "==", "pending_review")
          .limit(1)
      );

      if (!pendingSnap.empty) {
        throw new RouteError("You already have a pending withdrawal request.", 400);
      }

      const offerCountSnap = await transaction.get(
        adminDb.collection("offer_postbacks").where("userId", "==", uid).where("status", "==", "approved")
      );

      if (offerCountSnap.size < 2) {
        throw new RouteError("Engagement Lock: complete at least 2 approved offers before cashing out.", 400);
      }

      const ledgerBalanceSnap = await transaction.get(adminDb.collection("ledger_transactions").where("userId", "==", uid));
      let ledgerBalance = 0;
      ledgerBalanceSnap.forEach((doc) => {
        const data = doc.data();
        ledgerBalance += Number(data.balanceEffectCoins || 0);
      });

      if (ledgerBalance < coinsNum) {
        throw new RouteError("Insufficient balance for this cashout.", 400);
      }

      const destinationLockSnap = await transaction.get(destinationLockRef);
      if (destinationLockSnap.exists) {
        const destinationLockData = destinationLockSnap.data();
        const destinationOwnerUserId = typeof destinationLockData?.ownerUserId === "string" ? destinationLockData.ownerUserId : null;

        if (destinationOwnerUserId && destinationOwnerUserId !== uid) {
          const linkedUserRef = adminDb.collection("users").doc(destinationOwnerUserId);
          const linkedUserSnap = await transaction.get(linkedUserRef);

          transaction.update(userRef, {
            status: "flagged",
            isFlagged: true,
            flaggedReason: "Attempted payout destination already linked to another account.",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          if (linkedUserSnap.exists) {
            transaction.update(linkedUserRef, {
              status: "flagged",
              isFlagged: true,
              flaggedReason: "Payment address linked to another account was reused.",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          duplicateDestinationOwnerId = destinationOwnerUserId;
          return;
        }
      } else {
        const duplicateDestSnap = await transaction.get(
          adminDb.collection("cashout_requests").where("destination", "==", cleanDest)
        );

        for (const duplicateDoc of duplicateDestSnap.docs) {
          const duplicateRecord = duplicateDoc.data();
          const duplicateUserId = typeof duplicateRecord.userId === "string" ? duplicateRecord.userId : null;

          if (duplicateUserId && duplicateUserId !== uid) {
            const linkedUserRef = adminDb.collection("users").doc(duplicateUserId);
            const linkedUserSnap = await transaction.get(linkedUserRef);

            transaction.update(userRef, {
              status: "flagged",
              isFlagged: true,
              flaggedReason: "Attempted payout destination already linked to another account.",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            if (linkedUserSnap.exists) {
              transaction.update(linkedUserRef, {
                status: "flagged",
                isFlagged: true,
                flaggedReason: "Payment address linked to another account was reused.",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }

            duplicateDestinationOwnerId = duplicateUserId;
            transaction.set(
              destinationLockRef,
              {
                destination: cleanDest,
                destinationKey: destinationLockId,
                ownerUserId: duplicateUserId,
                linkedCashoutRequestId: duplicateDoc.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
            return;
          }
        }
      }

      const bonusInfo = applyBonus(coinsNum, method);
      const bonusConfig = getGiftCardBonus(method);

      transaction.set(cashoutRef, {
        id: cashoutRef.id,
        userId: uid,
        amountCoins: coinsNum,
        amountCents: Math.floor(coinsNum / 10),
        method,
        destination: cleanDest,
        status: "pending_review",
        bonusCoins: bonusInfo.bonus,
        bonusPercent: bonusConfig?.bonusPercent ?? 0,
        totalValueCoins: bonusInfo.total,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ip,
        deviceFingerprint: deviceFingerprint || null,
      });

      transaction.set(
        destinationLockRef,
        {
          destination: cleanDest,
          destinationKey: destinationLockId,
          ownerUserId: uid,
          linkedCashoutRequestId: cashoutRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      transaction.update(userRef, {
        activeCashoutRequestId: cashoutRef.id,
        activeCashoutDestinationKey: cleanDest,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

    if (duplicateDestinationOwnerId) {
      await logFraudAttempt({
        ip,
        userId: uid,
        email: userData.email,
        action: "SYBIL_ACCOUNT_LINKED",
        reason: `Linked payment address (${cleanDest}) found across accounts: ${uid} and ${duplicateDestinationOwnerId}. Both accounts auto-flagged.`,
        userAgent,
        createdAt: new Date(),
        details: { cleanDest, suspectUserId: uid, linkedUserId: duplicateDestinationOwnerId },
      });

      return NextResponse.json({ error: "Security Alert: This payment address is already linked to another active account." }, { status: 403 });
    }

    await logAdminAction({
      action: "cashout_requested",
      actorUserId: uid,
      targetType: "cashout_request",
      targetId: cashoutRef.id,
      metadata: { amountCoins: coinsNum, method, destination: cleanDest },
    });

    if (userData.email && String(userData.email).includes("@")) {
      sendPayoutSubmittedEmail(userData.email, coinsNum, method).catch(() => {});
    }

    const responseBonus = applyBonus(coinsNum, method);
    const successBody = {
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawalId: cashoutRef.id,
      deducted: coinsNum,
      bonusCoins: responseBonus.bonus,
      totalValueCoins: responseBonus.total,
    };

    await storeIdempotencyResponse(uid, idempotency.key, 200, successBody);

    return NextResponse.json(successBody);
  } catch (error: unknown) {
    console.error("Withdrawal API transaction error:", error);
    if (error instanceof RouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal transaction failed" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal transaction failed" }, { status: 500 });
  }
}
