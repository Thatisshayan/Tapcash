import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import { createPayPalPayout } from "@/lib/paypal";
import { createInteracTransfer } from "@/lib/interac";
import { createTremendousOrder } from "@/lib/tremendous";
import { logAdminAction } from "@/lib/audit";

const automatedProviders = ["paypal", "tremendous"];
const manualProviders = ["interac", "bitcoin", "litecoin", "visa", "steam", "roblox", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];
const FROZEN_PROVIDERS = ["interac"];

interface ProcessRequest {
  cashoutRequestId: string;
  adminNote?: string;
  interacSecurityQuestion?: string;
  interacSecurityAnswer?: string;
}

class ClaimError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ClaimError";
    this.status = status;
  }
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
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
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

    // Atomically read-check-claim: without a transaction, two concurrent
    // requests for the same cashoutRequestId could both pass the
    // status === "approved" check before either writes "processing",
    // resulting in duplicate payouts. The transaction below makes the
    // read + validation + claim a single atomic operation.
    let cashoutData: FirebaseFirestore.DocumentData;
    let provider: string;
    try {
      const result = await adminDb.runTransaction(async (transaction) => {
        const snap = await transaction.get(cashoutRef);
        if (!snap.exists) {
          throw new ClaimError("Cashout request not found", 404);
        }

        const data = snap.data()!;
        if (data.status !== "approved") {
          throw new ClaimError(`Cashout request is ${data.status}, expected "approved"`, 400);
        }

        const providerId = data.method as string;
        if (![...automatedProviders, ...manualProviders].includes(providerId)) {
          throw new ClaimError(`Provider "${providerId}" is not supported.`, 400);
        }

        if (FROZEN_PROVIDERS.includes(providerId)) {
          throw new ClaimError("This payout method is temporarily unavailable.", 400);
        }

        if (providerId === "interac") {
          if (!body.interacSecurityQuestion?.trim() || !body.interacSecurityAnswer?.trim()) {
            throw new ClaimError("Interac payouts require securityQuestion and securityAnswer", 400);
          }
        }

        transaction.update(cashoutRef, {
          status: "processing",
          updatedAt: FieldValue.serverTimestamp(),
        });

        return { data, providerId };
      });
      cashoutData = result.data;
      provider = result.providerId;
    } catch (error) {
      if (error instanceof ClaimError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }

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
        updatedAt: FieldValue.serverTimestamp(),
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
        processedAt: FieldValue.serverTimestamp(),
        adminNote: adminNote || null,
        updatedAt: FieldValue.serverTimestamp(),
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
      processedAt: FieldValue.serverTimestamp(),
      adminNote: adminNote || null,
      updatedAt: FieldValue.serverTimestamp(),
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
      createdAt: FieldValue.serverTimestamp(),
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
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
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
