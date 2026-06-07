/**
 * Unified Payout API Endpoint
 * Routes payout requests to appropriate payment provider (PayPal, Interac, Tremendous)
 * Handles balance validation, ledger entries, and error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { computeLedgerBalance, appendLedgerTransaction } from "@/lib/ledger";
import { createPayPalPayout } from "@/lib/paypal";
import { createInteracTransfer } from "@/lib/interac";
import { createTremendousOrder } from "@/lib/tremendous";

// Minimum payout amounts per provider (in coins, 100 coins = $1)
const MIN_PAYOUT_AMOUNTS = {
  paypal: 500,      // $5 minimum
  interac: 1000,    // $10 minimum
  tremendous: 500,  // $5 minimum
};

// Maximum payout amounts per provider (in coins)
const MAX_PAYOUT_AMOUNTS = {
  paypal: 1000000,  // $10,000 maximum
  interac: 300000,  // $3,000 maximum (Interac limit)
  tremendous: 500000, // $5,000 maximum
};

type PayoutProvider = "paypal" | "interac" | "tremendous";

interface PayoutRequest {
  provider: PayoutProvider;
  amountCoins: number;
  recipientEmail: string;
  recipientName?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  productId?: string;
}

/**
 * Convert coins to dollars
 */
function coinsToDollars(coins: number): number {
  return coins / 100;
}

/**
 * Validate payout request
 */
function validatePayoutRequest(request: PayoutRequest): { valid: boolean; error?: string } {
  if (!request.provider || !["paypal", "interac", "tremendous"].includes(request.provider)) {
    return { valid: false, error: "Invalid payment provider" };
  }

  if (!request.amountCoins || request.amountCoins <= 0) {
    return { valid: false, error: "Invalid payout amount" };
  }

  if (request.amountCoins < MIN_PAYOUT_AMOUNTS[request.provider]) {
    const minDollars = coinsToDollars(MIN_PAYOUT_AMOUNTS[request.provider]);
    return { valid: false, error: `Minimum payout for ${request.provider} is $${minDollars}` };
  }

  if (request.amountCoins > MAX_PAYOUT_AMOUNTS[request.provider]) {
    const maxDollars = coinsToDollars(MAX_PAYOUT_AMOUNTS[request.provider]);
    return { valid: false, error: `Maximum payout for ${request.provider} is $${maxDollars}` };
  }

  if (!request.recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.recipientEmail)) {
    return { valid: false, error: "Valid recipient email is required" };
  }

  // Interac-specific validation
  if (request.provider === "interac") {
    if (!request.securityQuestion || request.securityQuestion.length < 10) {
      return { valid: false, error: "Security question is required for Interac (min 10 characters)" };
    }
    if (!request.securityAnswer || request.securityAnswer.length < 6) {
      return { valid: false, error: "Security answer is required for Interac (min 6 characters)" };
    }
  }

  return { valid: true };
}

/**
 * Process payout through appropriate provider
 */
async function processPayoutWithProvider(
  provider: PayoutProvider,
  request: PayoutRequest,
  userId: string
): Promise<{ success: boolean; transactionId: string; details: unknown }> {
  const amountDollars = coinsToDollars(request.amountCoins);
  const batchId = `TC-${provider.toUpperCase()}-${Date.now()}-${userId.substring(0, 8)}`;

  switch (provider) {
    case "paypal": {
      const result = await createPayPalPayout({
        amount: amountDollars,
        currency: "USD",
        recipientEmail: request.recipientEmail,
        note: `TapCash payout - ${request.amountCoins} coins`,
        senderBatchId: batchId,
      });

      return {
        success: true,
        transactionId: result.batch_header?.payout_batch_id || batchId,
        details: result,
      };
    }

    case "interac": {
      const result = await createInteracTransfer({
        email: request.recipientEmail,
        recipientName: request.recipientName,
        amount: amountDollars,
        securityQuestion: request.securityQuestion!,
        securityAnswer: request.securityAnswer!,
        referenceNumber: batchId,
      });

      return {
        success: true,
        transactionId: result.transferId,
        details: result,
      };
    }

    case "tremendous": {
      const result = await createTremendousOrder({
        recipientEmail: request.recipientEmail,
        recipientName: request.recipientName,
        amount: amountDollars,
        currency: "USD",
        productId: request.productId,
        externalId: batchId,
      });

      return {
        success: true,
        transactionId: result.id,
        details: result,
      };
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * POST /api/payout
 * Create a new payout request
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Parse request body
    const body = await req.json() as PayoutRequest;

    // Validate request
    const validation = validatePayoutRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check user balance
    const currentBalance = await computeLedgerBalance(userId);
    if (currentBalance < body.amountCoins) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          currentBalance,
          requestedAmount: body.amountCoins,
        },
        { status: 400 }
      );
    }

    // Create ledger entry for cashout request (deducts from balance)
    const ledgerTransactionId = await appendLedgerTransaction({
      userId,
      type: "cashout_requested",
      amountCoins: body.amountCoins,
      balanceEffectCoins: -body.amountCoins,
      status: "pending",
      source: body.provider,
      metadata: {
        provider: body.provider,
        recipientEmail: body.recipientEmail,
        requestedAt: new Date().toISOString(),
      },
    });

    // Process payout with provider
    let payoutResult;
    try {
      payoutResult = await processPayoutWithProvider(body.provider, body, userId);
    } catch (error) {
      // Rollback ledger entry if payout fails
      await appendLedgerTransaction({
        userId,
        type: "cashout_rejected",
        amountCoins: body.amountCoins,
        balanceEffectCoins: body.amountCoins, // Refund
        status: "rejected",
        source: body.provider,
        referenceId: ledgerTransactionId,
        metadata: {
          error: (error as Error).message,
          rejectedAt: new Date().toISOString(),
        },
      });

      throw error;
    }

    // Update ledger entry with success
    await appendLedgerTransaction({
      userId,
      type: "cashout_paid",
      amountCoins: body.amountCoins,
      balanceEffectCoins: 0, // Already deducted
      status: "paid",
      source: body.provider,
      referenceId: payoutResult.transactionId,
      metadata: {
        provider: body.provider,
        transactionId: payoutResult.transactionId,
        paidAt: new Date().toISOString(),
      },
    });

    // Update user document with payout info
    await adminDb.collection("users").doc(userId).update({
      lastPayoutAt: new Date().toISOString(),
      totalPayouts: (await adminDb.collection("users").doc(userId).get()).data()?.totalPayouts || 0 + 1,
      updatedAt: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Payout processed successfully",
      payout: {
        provider: body.provider,
        amountCoins: body.amountCoins,
        amountDollars: coinsToDollars(body.amountCoins),
        transactionId: payoutResult.transactionId,
        status: "processing",
        createdAt: new Date().toISOString(),
      },
      newBalance: await computeLedgerBalance(userId),
    });

  } catch (error) {
    console.error("[Payout API Error]", error);
    
    return NextResponse.json(
      {
        error: "Failed to process payout",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payout
 * Get user's payout history
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Get payout history from ledger
    const payoutTransactions = await adminDb
      .collection("ledger_transactions")
      .where("userId", "==", userId)
      .where("type", "in", ["cashout_requested", "cashout_paid", "cashout_rejected"])
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const payouts = payoutTransactions.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        amountCoins: data.amountCoins,
        amountDollars: coinsToDollars(data.amountCoins),
        status: data.status,
        provider: data.source,
        transactionId: data.referenceId,
        createdAt: data.createdAt,
        metadata: data.metadata,
      };
    });

    return NextResponse.json({
      success: true,
      payouts,
      total: payouts.length,
    });

  } catch (error) {
    console.error("[Payout History API Error]", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch payout history",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// Made with Bob
