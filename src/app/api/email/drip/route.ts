import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendStreakReminderEmail, sendCashoutNudgeEmail } from "@/lib/email";

const DRIP_SECRET = process.env.DRIP_CRON_SECRET || "";

// Called by Vercel Cron (daily). Sends streak reminders + cashout nudges.
// Authorization: Bearer <DRIP_CRON_SECRET>
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!DRIP_SECRET || auth !== `Bearer ${DRIP_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  let streakSent = 0;
  let nudgeSent = 0;

  try {
    const usersSnap = await adminDb
      .collection("users")
      .where("status", "==", "active")
      .where("emailVerified", "==", true)
      .get();

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const email = data.email as string;
      const name = (data.displayName as string) || "Earner";
      const lastLogin = data.lastLoginAt?.toMillis?.() ?? 0;
      const streakDay = data.streakCount ?? 0;
      const lastDripAt = data.lastDripAt?.toMillis?.() ?? 0;

      if (now - lastDripAt < threeDaysMs) continue;

      // Streak reminder: active streak that hasn't been claimed today
      if (streakDay >= 2 && now - lastLogin < sevenDaysMs) {
        await sendStreakReminderEmail(email, name, streakDay);
        await adminDb.collection("users").doc(doc.id).update({ lastDripAt: new Date() });
        streakSent++;
        continue;
      }

      // Cashout nudge: balance >= 5000 coins and hasn't cashed out in 7 days
      const txSnap = await adminDb
        .collection("ledger_transactions")
        .where("userId", "==", doc.id)
        .get();
      const balance = txSnap.docs.reduce((s, d) => s + (d.data().balanceEffectCoins || 0), 0);
      if (balance >= 5000) {
        await sendCashoutNudgeEmail(email, name, balance);
        await adminDb.collection("users").doc(doc.id).update({ lastDripAt: new Date() });
        nudgeSent++;
      }
    }

    return NextResponse.json({ ok: true, streakSent, nudgeSent });
  } catch (err: any) {
    console.error("[DRIP]", err);
    return NextResponse.json({ error: "Drip run failed" }, { status: 500 });
  }
}
