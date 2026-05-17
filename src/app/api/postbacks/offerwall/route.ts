import { NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebaseAdmin";
import * as admin from "firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const provider = searchParams.get("provider");
    const uid = searchParams.get("uid") || searchParams.get("subId");
    const amount = searchParams.get("amount") || searchParams.get("points");
    const txId = searchParams.get("tx_id") || searchParams.get("transactionId");
    const offerId = searchParams.get("offer_id");
    const signature = searchParams.get("sig") || searchParams.get("hash");
    
    // Fraud Control V1: Basic IP Logging
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (!uid || !amount || !txId || !provider) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const rewardCents = parseInt(amount, 10);
    if (isNaN(rewardCents) || rewardCents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // TODO: Verify signature using process.env.OFFERWALL_SECRET
    // if (!verifySignature(searchParams, process.env.OFFERWALL_SECRET)) { return 401 }

    const txRef = adminDb.collection("transactions").doc(txId);
    const userRef = adminDb.collection("users").doc(uid);
    const walletRef = userRef.collection("wallet").doc("balance");

    let success = false;

    await adminDb.runTransaction(async (transaction) => {
      const txDoc = await transaction.get(txRef);
      if (txDoc.exists) {
        throw new Error("Transaction already processed");
      }

      transaction.set(txRef, {
        userId: uid,
        provider,
        offerId: offerId || "unknown",
        amountCents: rewardCents,
        ipAddress: ip,
        userAgent: userAgent,
        type: "offerwall_postback",
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      transaction.set(walletRef, {
        balanceCents: admin.firestore.FieldValue.increment(rewardCents),
        totalEarnedCents: admin.firestore.FieldValue.increment(rewardCents),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      const userDoc = await transaction.get(userRef);
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.referredBy) {
          const referrerUid = userData.referredBy;
          const commissionCents = Math.floor(rewardCents * 0.20);
          
          if (commissionCents > 0) {
            const referrerWalletRef = adminDb.collection("users").doc(referrerUid).collection("wallet").doc("balance");
            const commissionTxRef = adminDb.collection("transactions").doc(`comm_${txId}`);
            
            transaction.set(commissionTxRef, {
              userId: referrerUid,
              sourceUserId: uid,
              amountCents: commissionCents,
              type: "referral_commission",
              status: "completed",
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            transaction.set(referrerWalletRef, {
              balanceCents: admin.firestore.FieldValue.increment(commissionCents),
              totalEarnedCents: admin.firestore.FieldValue.increment(commissionCents),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
        }
      }

      success = true;
    });

    if (success) {
      return new NextResponse("1", { status: 200 });
    }

    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  } catch (error: any) {
    console.error("Postback Error:", error);
    if (error.message === "Transaction already processed") {
      return new NextResponse("1", { status: 200 }); 
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
