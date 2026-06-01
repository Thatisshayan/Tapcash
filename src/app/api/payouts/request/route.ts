import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";
import { withRateLimit } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";
import { requireVerifiedUser } from "@/lib/verified-user";

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

    const verifiedUser = await requireVerifiedUser(request);
    if ("response" in verifiedUser) return verifiedUser.response;
    const { uid, email: verifiedEmail, userData } = verifiedUser;

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

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawalId: cashoutRef.id,
      deducted: coinsNum,
    });
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
