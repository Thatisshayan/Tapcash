import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";
import { withRateLimit } from "@/lib/rate-limit";
import { requireVerifiedUser } from "@/lib/verified-user";

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const verifiedUser = await requireVerifiedUser(request);
    if ("response" in verifiedUser) return verifiedUser.response;
    const { uid, email: verifiedEmail, userData } = verifiedUser;
    const body = await request.json();
    const { missionId } = body;

    if (!missionId || !["survey_explorer", "poll_connoisseur", "high_earner"].includes(missionId)) {
      return NextResponse.json(
        { error: "Invalid mission identifier" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 2. Sniff out Headless Automation Tools/Scrapers
    const botCheck = isBotAgent(userAgent);
    if (botCheck.isBot) {
      return NextResponse.json(
        { error: "Access denied. Automation is strictly prohibited." },
        { status: 403 }
      );
    }

    // 3. Verify user profile status
    const userRef = adminDb.collection("users").doc(uid);
    if (userData.status === "banned" || userData.isFlagged === true) {
      return NextResponse.json(
        { error: "Your account is currently locked or flagged. Rewards disabled." },
        { status: 403 }
      );
    }

    // 4. Perform IP Suspicion checks
    const ipCheck = await isIpSuspicious(ip, "MISSION_BLOCKED_VPN", uid, verifiedEmail || userData.email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ 
        error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on Daily Reward claims." 
      }, { status: 403 });
    }

    // 5. Date computation for today's reset
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // 6. Pre-check if already claimed
    const claimedMissions = userData.claimedMissions || {};
    if (claimedMissions[todayStr]?.[missionId] === true) {
      return NextResponse.json(
        { error: "This daily mission has already been claimed for today." },
        { status: 400 }
      );
    }

    // 7. Verify task progress via actual transactions
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const txSnap = await adminDb.collection("transactions")
      .where("userId", "==", uid)
      .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(todayStart))
      .get();

    const todayTxs = txSnap.docs.map(doc => doc.data());

    let isCompleted = false;
    let rewardCoins = 0;
    let missionName = "";

    if (missionId === "poll_connoisseur") {
      isCompleted = todayTxs.some(tx => tx.type === "community_poll");
      rewardCoins = 10;
      missionName = "Poll Connoisseur";
    } else if (missionId === "survey_explorer") {
      isCompleted = todayTxs.some(tx => ["task_completed", "offer", "survey", "offerwall", "daily_spin"].includes(tx.type));
      rewardCoins = 50;
      missionName = "Daily Survey Explorer";
    } else if (missionId === "high_earner") {
      const totalCoinsEarnedToday = todayTxs
        .filter(tx => tx.status === "completed" && tx.amount > 0)
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      isCompleted = totalCoinsEarnedToday >= 1000;
      rewardCoins = 200;
      missionName = "High Earner Boost";
    }

    if (!isCompleted) {
      return NextResponse.json(
        { error: `You have not met the requirements for the ${missionName} mission yet.` },
        { status: 400 }
      );
    }

    // 8. DB Transaction to prevent double claiming under high concurrent clicks
    await adminDb.runTransaction(async (transaction) => {
      const freshUserSnap = await transaction.get(userRef);
      if (!freshUserSnap.exists) {
        throw new Error("User profile not found.");
      }

      const freshUserData = freshUserSnap.data()!;
      const freshClaimedMissions = freshUserData.claimedMissions || {};
      if (freshClaimedMissions[todayStr]?.[missionId] === true) {
        throw new Error("This daily mission has already been claimed for today.");
      }

      const updatedClaimsForDay = {
        ...(freshClaimedMissions[todayStr] || {}),
        [missionId]: true
      };

      transaction.update(userRef, {
        [`claimedMissions.${todayStr}`]: updatedClaimsForDay,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Register completion ledger transaction
      const ledgerRef = adminDb.collection("ledger_transactions").doc();
      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: uid,
        type: "approved_credit",
        amountCoins: rewardCoins,
        balanceEffectCoins: rewardCoins,
        method: `${missionName} Daily Bonus`,
        status: "approved",
        source: "daily_mission",
        referenceId: missionId,
        metadata: { missionId, missionName },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const auditRef = adminDb.collection("admin_actions").doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        action: "mission_reward",
        actorUserId: uid,
        targetType: "user",
        targetId: uid,
        metadata: { missionId, missionName, rewardCoins },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      success: true,
      rewardCoins,
      message: `🎉 Success! +${rewardCoins} Coins claimed for ${missionName}!`
    });

  } catch (error: any) {
    console.error("Daily Mission claiming route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to claim daily mission." },
      { status: 400 }
    );
  }
}
