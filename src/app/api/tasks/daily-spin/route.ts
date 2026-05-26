import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";
import { withRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, { limit: 3, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

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

    // 2. Sniff out Headless Automation Tools/Scrapers on Daily Spin
    const botCheck = isBotAgent(userAgent);
    if (botCheck.isBot) {
      await logFraudAttempt({
        ip,
        userId: uid,
        action: "SPIN_BLOCKED_BOT",
        reason: botCheck.reason || "Bot User-Agent detected on daily spin",
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Access denied. Automation is strictly prohibited." }, { status: 403 });
    }

    // 3. Verify user exists and status checks (flagged/banned)
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User profile not found in database." }, { status: 404 });
    }

    const userData = userSnap.data()!;
    if (userData.status === "banned" || userData.isFlagged === true) {
      await logFraudAttempt({
        ip,
        userId: uid,
        email: userData.email,
        action: "SPIN_BLOCKED_LOCK",
        reason: `Banned/Flagged user attempted daily spin. Status: ${userData.status}`,
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json(
        { error: "Your account is currently locked or flagged. Rewards disabled." },
        { status: 403 }
      );
    }

    // 4. Perform VPN/Proxy checking via ProxyCheck.io on Spins
    const ipCheck = await isIpSuspicious(ip, "SPIN_BLOCKED_VPN", uid, userData.email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ 
        error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on Daily Reward claims." 
      }, { status: 403 });
    }

    const result = await adminDb.runTransaction(async (transaction) => {
      // Re-read inside transaction for race conditions safety
      const freshUserSnap = await transaction.get(userRef);
      if (!freshUserSnap.exists) {
        throw new Error("User profile not found in database.");
      }

      const freshUserData = freshUserSnap.data()!;
      const lastSpin = freshUserData.lastDailySpin;

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

      // Secure Weighted Reward Roller
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

      // Atomic Update
      transaction.update(userRef, {
        lastDailySpin: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const ledgerRef = adminDb.collection("ledger_transactions").doc();
      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: uid,
        type: "approved_credit",
        amountCoins: rewardCoins,
        balanceEffectCoins: rewardCoins,
        method: "Daily Wheel",
        status: "approved",
        source: "daily_spin",
        referenceId: null,
        metadata: { sectorIndex: rewardCoins === 10 ? 0 : rewardCoins === 25 ? 1 : rewardCoins === 50 ? 2 : rewardCoins === 100 ? 3 : 4 },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const auditRef = adminDb.collection("admin_actions").doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        action: "daily_spin_award",
        actorUserId: uid,
        targetType: "user",
        targetId: uid,
        metadata: { rewardCoins, sectorIndex },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
