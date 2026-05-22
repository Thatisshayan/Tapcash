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

    // 2. Anti-fraud checks (Proxy & bot blockers)
    const botCheck = isBotAgent(userAgent);
    if (botCheck.isBot) {
      await logFraudAttempt({
        ip,
        userId: uid,
        action: "PROMO_BLOCKED_BOT",
        reason: botCheck.reason || "Bot User-Agent detected on promo redemption",
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Access denied. Automation is strictly prohibited." }, { status: 403 });
    }

    // 3. Verify user status
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
        action: "PROMO_BLOCKED_LOCK",
        reason: "Banned or flagged user attempted promo code claim",
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json(
        { error: "Your account is currently locked or flagged. Rewards disabled." },
        { status: 403 }
      );
    }

    const ipCheck = await isIpSuspicious(ip, "PROMO_BLOCKED_VPN", uid, userData.email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ 
        error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on promo redemptions." 
      }, { status: 403 });
    }

    // Parse and sanitize promo code
    const body = await request.json();
    const rawCode = body.code;
    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json({ error: "Promo code is required." }, { status: 400 });
    }

    const code = rawCode.trim().toUpperCase();

    // Define valid promo codes and their reward amounts
    const PROMO_CODES: Record<string, { coins: number; name: string }> = {
      WELCOME50: { coins: 50, name: "New User Welcome Bonus" },
      EMERALDNEW: { coins: 100, name: "Emerald Launch Celebrations" },
    };

    if (!PROMO_CODES[code]) {
      return NextResponse.json({ error: "Invalid promo code. Please double-check and try again." }, { status: 400 });
    }

    const promo = PROMO_CODES[code];
    const promoRef = userRef.collection("redeemedPromos").doc(code);

    const transactionRef = adminDb.collection("transactions").doc();

    await adminDb.runTransaction(async (transaction) => {
      // 1. Check if user already claimed this promo
      const promoSnap = await transaction.get(promoRef);
      if (promoSnap.exists) {
        throw new Error("You have already redeemed this promo code!");
      }

      const freshUserSnap = await transaction.get(userRef);
      if (!freshUserSnap.exists) {
        throw new Error("User profile not found.");
      }

      const centsEquivalent = Math.floor(promo.coins / 10);

      // 2. Claim lock
      transaction.set(promoRef, {
        code,
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
        rewardCoins: promo.coins,
      });

      // 3. Credit wallet and legacy schemas
      transaction.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(promo.coins),
        "wallet.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
        walletBalanceCents: admin.firestore.FieldValue.increment(centsEquivalent),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Log the transaction
      transaction.set(transactionRef, {
        id: transactionRef.id,
        userId: uid,
        type: "promo_code",
        amount: promo.coins,
        payoutCents: centsEquivalent,
        method: `Promo: ${code}`,
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed promo code ${code}!`,
      rewardCoins: promo.coins,
    });

  } catch (error: any) {
    console.error("Promo code claim error:", error);
    return NextResponse.json(
      { error: error.message || "Promo redemption failed." },
      { status: 400 }
    );
  }
}
