import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const ledgerSnap = await adminDb
      .collection("ledger_transactions")
      .where("userId", "==", uid)
      .limit(100)
      .get();

    const transactions = ledgerSnap.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        type: data.type || null,
        status: data.status || null,
        amountCoins: Number(data.amountCoins || 0),
        balanceEffectCoins: Number(data.balanceEffectCoins || 0),
        source: data.source || null,
        referenceId: data.referenceId || null,
        createdAt: data.createdAt || null,
      };
    });

    const balanceCoins = transactions.reduce((sum, tx) => sum + Number(tx.balanceEffectCoins || 0), 0);
    const pendingCoins = transactions
      .filter((tx) => tx.status === "pending")
      .reduce((sum, tx) => sum + Number(tx.amountCoins || 0), 0);
    const approvedCoins = transactions
      .filter((tx) => tx.status === "approved")
      .reduce((sum, tx) => sum + Number(tx.balanceEffectCoins || 0), 0);

    return NextResponse.json({
      uid,
      balanceCoins,
      pendingCoins,
      approvedCoins,
      transactionCount: transactions.length,
      transactions,
    });
  } catch (error: any) {
    const message = error?.message || "Failed to load ledger summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
