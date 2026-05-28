import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// 2-min cache
export const revalidate = 120;

const METHOD_LABELS: Record<string, string> = {
  generic_offerwall: "an Offerwall Offer",
  rapidoreach: "a RapidoReach Survey",
  referral_commission: "a Referral Commission",
  promo_code: "a Promo Code",
  daily_spin: "the Daily Spin",
  mission: "a Daily Mission",
  daily_streak: "a Login Streak Bonus",
};

function maskedUid(uid: string) {
  return "User_***" + uid.slice(-3).toUpperCase();
}

export async function GET() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snap = await adminDb
      .collection("ledger_transactions")
      .where("type", "==", "approved_credit")
      .where("createdAt", ">=", Timestamp.fromDate(oneDayAgo))
      .orderBy("createdAt", "desc")
      .limit(40)
      .get();

    const items: string[] = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const coins = data.balanceEffectCoins as number;
      if (!coins || coins <= 0) continue;
      const user = maskedUid(data.userId as string);
      const source = (data.source as string) || "";
      const method = (data.method as string) || "";

      if (source === "referral_commission") {
        items.push(`${user} earned +${coins} coins from a referral`);
      } else if (source === "daily_spin") {
        items.push(`${user} won +${coins} coins on the Daily Spin`);
      } else if (source === "promo_code") {
        items.push(`${user} redeemed a promo code for +${coins} coins`);
      } else if (method.toLowerCase().includes("cashout") || source === "cashout") {
        items.push(`${user} cashed out ${coins} coins`);
      } else {
        const label = METHOD_LABELS[source] || "a task";
        items.push(`${user} earned +${coins} coins completing ${label}`);
      }
    }

    // Also grab recent sent payouts for variety
    const payoutSnap = await adminDb
      .collection("payouts")
      .where("status", "==", "sent")
      .orderBy("updatedAt", "desc")
      .limit(10)
      .get();

    for (const doc of payoutSnap.docs) {
      const data = doc.data();
      const cad = data.amountCad ?? (data.amountCoins / 1000);
      const user = maskedUid(data.userId as string);
      const method = data.method as string;
      const methodLabel = METHOD_LABELS[method] || method || "PayPal";
      items.push(`${user} cashed out $${Number(cad).toFixed(2)} CAD via ${methodLabel}`);
    }

    // Shuffle for variety
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    return NextResponse.json({ items: items.slice(0, 20) }, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[ACTIVITY]", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
