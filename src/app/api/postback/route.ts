import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import * as admin from "firebase-admin";

// GET handler because most offerwalls send postbacks via Server-to-Server GET requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Standard offerwall parameters
    const uid = searchParams.get("uid"); // User ID
    const amount = searchParams.get("amount"); // Amount in cents or points
    const txId = searchParams.get("tx_id"); // Unique transaction ID from offerwall
    const offerId = searchParams.get("offer_id");
    const signature = searchParams.get("sig"); // Security signature
    
    // Fraud Control v1: Log IP Address
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    if (!uid || !amount || !txId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const rewardCents = parseInt(amount, 10);
    if (isNaN(rewardCents) || rewardCents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // TODO: Verify signature using offerwall secret key
    // if (!verifySignature(searchParams, secret)) { return 401 }

    const txRef = adminDb.collection("transactions").doc(txId);
    const userRef = adminDb.collection("users").doc(uid);
    const walletRef = userRef.collection("wallet").doc("balance");

    let success = false;

    await adminDb.runTransaction(async (transaction) => {
      const txDoc = await transaction.get(txRef);
      if (txDoc.exists) {
        throw new Error("Transaction already processed");
      }

      // Fraud checks v1: Check if IP is blacklisted or has too many recent hits
      // (Simplified for v1: just logging it in the transaction for manual review)

      // 1. Record the transaction
      transaction.set(txRef, {
        userId: uid,
        offerId: offerId || "unknown",
        amountCents: rewardCents,
        ipAddress: ip,
        type: "offerwall_postback",
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Update wallet
      transaction.set(walletRef, {
        balanceCents: admin.firestore.FieldValue.increment(rewardCents),
        totalEarnedCents: admin.firestore.FieldValue.increment(rewardCents),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 3. Referral Commission (20%)
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
      // Return 1 to acknowledge successful postback (most offerwalls require '1' or 'OK')
      return new NextResponse("1", { status: 200 });
    }

    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  } catch (error: any) {
    console.error("Postback Error:", error);
    // If it's a duplicate, we return 200 so the offerwall stops retrying
    if (error.message === "Transaction already processed") {
      return new NextResponse("1", { status: 200 }); 
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
