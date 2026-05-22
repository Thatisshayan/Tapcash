import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user authentication
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 2. Sniff out Headless Automation Tools/Scrapers on Cashout
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

    // 3. Parse and validate request body
    const body = await request.json();
    const { amountCoins, method, destination } = body;

    if (!amountCoins || !method || !destination) {
      return NextResponse.json(
        { error: "Missing required fields: amountCoins, method, or destination" },
        { status: 400 }
      );
    }

    const coinsNum = parseInt(amountCoins, 10);
    if (isNaN(coinsNum) || coinsNum < 2000) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum cashout is 2,000 coins ($2.00)." },
        { status: 400 }
      );
    }

    const allowedMethods = ["paypal", "litecoin", "bitcoin", "visa", "steam", "roblox"];
    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: `Invalid payout method: ${method}` },
        { status: 400 }
      );
    }

    if (typeof destination !== "string" || destination.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid payment destination is required." },
        { status: 400 }
      );
    }

    const cleanDest = destination.trim().toLowerCase();

    // 4. Verify user exists and status checks (flagged/banned)
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
      return NextResponse.json(
        { error: "Your account is currently locked or flagged for review. Withdrawals disabled." },
        { status: 403 }
      );
    }

    // 5. Perform VPN/Proxy checking via ProxyCheck.io on Cashouts
    const ipCheck = await isIpSuspicious(ip, "PAYOUT_BLOCKED_VPN", uid, userData.email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ 
        error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on requesting payouts." 
      }, { status: 403 });
    }

    // 6. ENFORCE: Single Active Pending Withdrawal Limit
    const pendingSnap = await adminDb
      .collection("withdrawals")
      .where("userId", "==", uid)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (!pendingSnap.empty) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal request. Please wait until it is processed before submitting another." },
        { status: 400 }
      );
    }

    // 7. ENFORCE: Minimum Engagement Lock (At least 2 real offer completions)
    const offerCompletionsSnap = await adminDb
      .collection("transactions")
      .where("userId", "==", uid)
      .where("type", "in", ["offer", "postback"])
      .count()
      .get();

    const offerCount = offerCompletionsSnap.data().count;
    if (offerCount < 2) {
      return NextResponse.json(
        { error: "Engagement Lock: To cash out, you must complete at least 2 active offers/surveys on our offerwall first. This verifies you are a real user and prevents automated reward farming." },
        { status: 400 }
      );
    }

    // 8. ENFORCE: Unique Payment Destination Link Check (Prevent Multi-Account Sybil Cashouts)
    const duplicateDestSnap = await adminDb
      .collection("withdrawals")
      .where("destination", "==", cleanDest)
      .limit(1)
      .get();

    if (!duplicateDestSnap.empty) {
      const duplicateRecord = duplicateDestSnap.docs[0].data();
      
      // If the destination belongs to a different user, flag both accounts immediately!
      if (duplicateRecord.userId !== uid) {
        // Flag current user
        await userRef.update({
          status: "flagged",
          isFlagged: true,
          flaggedReason: `Attempted to cash out to payment address (${cleanDest}) already linked to user: ${duplicateRecord.userId}`,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Flag the linked user as well
        const linkedUserRef = adminDb.collection("users").doc(duplicateRecord.userId);
        await linkedUserRef.update({
          status: "flagged",
          isFlagged: true,
          flaggedReason: `Linked payment address (${cleanDest}) was inputted in withdrawal request by user: ${uid}`,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Log critical fraud alert
        await logFraudAttempt({
          ip,
          userId: uid,
          email: userData.email,
          action: "SYBIL_ACCOUNT_LINKED",
          reason: `Linked payment address (${cleanDest}) found across accounts: ${uid} and ${duplicateRecord.userId}. Both accounts auto-flagged.`,
          userAgent,
          createdAt: new Date(),
          details: {
            cleanDest,
            suspectUserId: uid,
            linkedUserId: duplicateRecord.userId,
          }
        });

        return NextResponse.json(
          { error: "Security Alert: This payment address is already linked to another active account. Both accounts have been flagged for administrator investigation." },
          { status: 403 }
        );
      }
    }

    // 9. Database Execution: Atomic Transaction
    const withdrawalRef = adminDb.collection("withdrawals").doc();
    const transactionRef = adminDb.collection("transactions").doc();

    const result = await adminDb.runTransaction(async (transaction) => {
      const freshUserSnap = await transaction.get(userRef);
      if (!freshUserSnap.exists) {
        throw new Error("User profile not found in database.");
      }

      const freshUserData = freshUserSnap.data()!;
      
      // Double check status again inside transaction block
      if (freshUserData.status === "banned" || freshUserData.isFlagged === true) {
        throw new Error("Withdrawals disabled for flagged or locked accounts.");
      }
      
      const currentBalance = freshUserData.wallet?.balance ?? freshUserData.walletBalanceCoins ?? 0;
      
      if (currentBalance < coinsNum) {
        throw new Error("Insufficient balance for this cashout.");
      }

      const centsEquivalent = Math.floor(coinsNum / 10);

      // Atomic Balance Deductions
      transaction.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(-coinsNum),
        "wallet.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
        walletBalanceCents: admin.firestore.FieldValue.increment(-centsEquivalent),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log withdrawal request
      transaction.set(withdrawalRef, {
        id: withdrawalRef.id,
        userId: uid,
        amount: coinsNum,
        amountCents: centsEquivalent,
        method: method,
        destination: cleanDest, // save lowercase clean destination
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log user ledger transaction entry
      transaction.set(transactionRef, {
        id: transactionRef.id,
        userId: uid,
        type: "withdrawal",
        amount: -coinsNum,
        payoutCents: centsEquivalent,
        method: method,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { coinsNum, centsEquivalent, withdrawalId: withdrawalRef.id };
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawalId: result.withdrawalId,
      deducted: result.coinsNum,
    });

  } catch (error: any) {
    console.error("Withdrawal API transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Internal transaction failed" },
      { status: 500 }
    );
  }
}
