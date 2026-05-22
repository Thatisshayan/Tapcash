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
    const userRef = adminDb.collection("users").doc(uid);
    const transactionRef = adminDb.collection("transactions").doc();

    const result = await adminDb.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) {
        throw new Error("User profile not found in database.");
      }

      const userData = userSnap.data()!;
      const lastSpin = userData.lastDailySpin;

      if (lastSpin) {
        const lastSpinDate = lastSpin.toDate ? lastSpin.toDate() : new Date(lastSpin);
        const now = new Date();
        const diffMs = now.getTime() - lastSpinDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
          const remainingMs = (24 * 60 * 60 * 1000) - diffMs;
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          throw new Error(`Daily spin already claimed! Please wait ${remainingHours}h ${remainingMins}m before spinning again.`);
        }
      }

      // 4. Secure Weighted Reward Roller
      // Slices:
      // Sector 0: 10 Coins (40%)
      // Sector 1: 25 Coins (30%)
      // Sector 2: 50 Coins (20%)
      // Sector 3: 100 Coins (8%)
      // Sector 4: 500 Coins (2%) -- JACKPOT
      const roll = Math.random() * 100;
      let rewardCoins = 10;
      let sectorIndex = 0;

      if (roll < 40) {
        rewardCoins = 10;
        sectorIndex = 0;
      } else if (roll < 70) {
        rewardCoins = 25;
        sectorIndex = 1;
      } else if (roll < 90) {
        rewardCoins = 50;
        sectorIndex = 2;
      } else if (roll < 98) {
        rewardCoins = 100;
        sectorIndex = 3;
      } else {
        rewardCoins = 500;
        sectorIndex = 4;
      }

      const centsEquivalent = Math.floor(rewardCoins / 10);

      // 5. Atomic Update
      transaction.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(rewardCoins),
        "wallet.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
        lastDailySpin: admin.firestore.FieldValue.serverTimestamp(),
        walletBalanceCents: admin.firestore.FieldValue.increment(centsEquivalent),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log credit transaction
      transaction.set(transactionRef, {
        id: transactionRef.id,
        userId: uid,
        type: "daily_spin",
        amount: rewardCoins,
        payoutCents: centsEquivalent,
        method: "Daily Wheel",
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { rewardCoins, sectorIndex };
    });

    return NextResponse.json({
      success: true,
      rewardCoins: result.rewardCoins,
      sectorIndex: result.sectorIndex,
    });

  } catch (error: any) {
    console.error("Daily Spin API transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Daily Spin failed" },
      { status: 400 }
    );
  }
}
