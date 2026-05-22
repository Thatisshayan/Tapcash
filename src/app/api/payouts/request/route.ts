import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";

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

    // 2. Parse and validate request body
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

    // 3. Database Execution: Atomic Transaction
    const userRef = adminDb.collection("users").doc(uid);
    const withdrawalRef = adminDb.collection("withdrawals").doc();
    const transactionRef = adminDb.collection("transactions").doc();

    const result = await adminDb.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) {
        throw new Error("User profile not found in database.");
      }

      const userData = userSnap.data()!;
      
      // Support both structure models for maximum flexibility
      const currentBalance = userData.wallet?.balance ?? userData.walletBalanceCoins ?? 0;
      
      if (currentBalance < coinsNum) {
        throw new Error("Insufficient balance for this cashout.");
      }

      const centsEquivalent = Math.floor(coinsNum / 10); // 1000 coins = $1.00 = 100 cents, so 2000 coins = 200 cents

      // Atomic Balance Deductions
      transaction.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(-coinsNum),
        "wallet.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
        // Also update legacy/admin back-compat field
        walletBalanceCents: admin.firestore.FieldValue.increment(-centsEquivalent),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log withdrawal request
      transaction.set(withdrawalRef, {
        id: withdrawalRef.id,
        userId: uid,
        amount: coinsNum,
        amountCents: centsEquivalent, // Legacy field for /admin page to read
        method: method,
        destination: destination,
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
