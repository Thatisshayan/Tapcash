import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { createPayPalPayout } from "@/lib/paypal";
import { createInteracTransfer } from "@/lib/interac";
import { createTremendousOrder } from "@/lib/tremendous";
import { logAdminAction } from "@/lib/audit";
import * as admin from "firebase-admin";

const automatedProviders = ["paypal", "tremendous"];
const manualProviders = ["interac", "bitcoin", "litecoin", "visa", "steam", "roblox", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];

interface ProcessRequest {
  cashoutRequestId: string;
  adminNote?: string;
  interacSecurityQuestion?: string;
  interacSecurityAnswer?: string;
}

function coinsToDollars(coins: number): number {
  return coins / 1000;
}

async function processPayoutWithProvider(
  provider: string,
  amountCoins: number,
  destination: string,
  userId: string,
  interacSecurityQuestion?: string,
  interacSecurityAnswer?: string,
): Promise<{ success: boolean; transactionId: string }> {
  const amountDollars = coinsToDollars(amountCoins);
  const batchId = `TC-${provider.toUpperCase()}-${Date.now()}-${userId.substring(0, 8)}`;

  if (manualProviders.includes(provider)) {
    return {
      success: true,
      transactionId: `manual-${Date.now()}-${userId.substring(0, 8)}`,
    };
  }

  switch (provider) {
    case "paypal": {
      const result = await createPayPalPayout({
        amount: amountDollars,
        currency: "USD",
        recipientEmail: destination,
        note: `TapCash payout - ${amountCoins} coins`,
        senderBatchId: batchId,
      });
      return {
        success: true,
        transactionId: result.batch_header?.payout_batch_id || batchId,
      };
    }

    case "tremendous": {
      const result = await createTremendousOrder({
        recipientEmail: destination,
        amount: amountDollars,
        currency: "USD",
        externalId: batchId,
      });
      return {
        success: true,
        transactionId: result.id,
      };
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const body = (await req.json()) as ProcessRequest;
    const { cashoutRequestId, adminNote } = body;

    if (!cashoutRequestId) {
      return NextResponse.json({ error: "cashoutRequestId is required" }, { status: 400 });
    }

    const cashoutRef = adminDb.collection("cashout_requests").doc(cashoutRequestId);
    const cashoutSnap = await cashoutRef.get();

    if (!cashoutSnap.exists) {
      return NextResponse.json({ error: "Cashout request not found" }, { status: 404 });
    }

    const cashoutData = cashoutSnap.data()!;
    if (cashoutData.status !== "approved") {
      return NextResponse.json({ error: `Cashout request is ${cashoutData.status}, expected "approved"` }, { status: 400 });
    }

    const provider = cashoutData.method as string;

    if (![...automatedProviders, ...manualProviders].includes(provider)) {
      return NextResponse.json({
        error: `Provider "${provider}" is not supported.`,
      }, { status: 400 });
    }

    if (provider === "interac") {
      if (!body.interacSecurityQuestion?.trim() || !body.interacSecurityAnswer?.trim()) {
        return NextResponse.json({
          error: "Interac payouts require securityQuestion and securityAnswer",
        }, { status: 400 });
      }
    }

    await cashoutRef.update({
      status: "processing",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    let payoutResult: { success: boolean; transactionId: string };
    try {
      payoutResult = await processPayoutWithProvider(
        provider,
        cashoutData.amountCoins,
        cashoutData.destination,
        cashoutData.userId,
        body.interacSecurityQuestion,
        body.interacSecurityAnswer,
      );
    } catch (error) {
      await cashoutRef.update({
        status: "approved",
        processingError: (error as Error).message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await logAdminAction({
        action: "cashout_processing_failed",
        actorUserId: decodedToken.uid,
        targetType: "cashout_request",
        targetId: cashoutRequestId,
        metadata: { error: (error as Error).message },
      });

      const available = {
        paypal: !!process.env.PAYPAL_CLIENT_ID,
        interac: !!process.env.INTERAC_API_KEY,
        tremendous: !!process.env.TREMENDOUS_API_KEY,
      };

      return NextResponse.json({
        error: "Failed to process payout through provider",
        message: (error as Error).message,
        hint: "Provider credentials may not be configured. Mark the request as sent manually.",
        configured: available,
      }, { status: 502 });
    }

    if (manualProviders.includes(provider)) {
      const updateData: Record<string, unknown> = {
        status: "manual_required",
        transactionId: payoutResult.transactionId,
        processedBy: decodedToken.uid,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        adminNote: adminNote || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (provider === "interac") {
        updateData.interacSecurityQuestion = body.interacSecurityQuestion || null;
        updateData.interacSecurityAnswer = body.interacSecurityAnswer || null;
      }

      await cashoutRef.update(updateData);

      await logAdminAction({
        action: "cashout_manual_required",
        actorUserId: decodedToken.uid,
        targetType: "cashout_request",
        targetId: cashoutRequestId,
        metadata: {
          provider,
          transactionId: payoutResult.transactionId,
          amountCoins: cashoutData.amountCoins,
        },
      });

      return NextResponse.json({
        success: true,
        transactionId: payoutResult.transactionId,
        status: "manual_required",
        message: `${provider} payout requires manual processing. Admin must send and mark as sent.`,
      });
    }

    await cashoutRef.update({
      status: "sent",
      transactionId: payoutResult.transactionId,
      processedBy: decodedToken.uid,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      adminNote: adminNote || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const ledgerRef = adminDb.collection("ledger_transactions").doc();
    await ledgerRef.set({
      id: ledgerRef.id,
      userId: cashoutData.userId,
      type: "cashout_paid",
      amountCoins: cashoutData.amountCoins,
      balanceEffectCoins: 0,
      status: "paid",
      source: provider,
      referenceId: payoutResult.transactionId,
      metadata: {
        cashoutRequestId,
        method: cashoutData.method,
        destination: cashoutData.destination,
        adminNote: adminNote || null,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logAdminAction({
      action: "cashout_sent",
      actorUserId: decodedToken.uid,
      targetType: "cashout_request",
      targetId: cashoutRequestId,
      metadata: {
        provider,
        transactionId: payoutResult.transactionId,
        amountCoins: cashoutData.amountCoins,
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: payoutResult.transactionId,
      status: "sent",
    });
  } catch (error) {
    console.error("[Payout API Error]", error);
    return NextResponse.json({
      error: "Failed to process payout",
      message: (error as Error).message,
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const status = searchParams.get("status");

    let query: FirebaseFirestore.Query = adminDb
      .collection("cashout_requests")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (status) {
      query = adminDb
        .collection("cashout_requests")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    const snap = await query.get();
    const requests = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[Payout History API Error]", error);
    return NextResponse.json({
      error: "Failed to fetch payout requests",
      message: (error as Error).message,
    }, { status: 500 });
  }
}
