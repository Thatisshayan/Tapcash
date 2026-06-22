import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { tapCashActivity } from "@shared/tapcash-content";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const snap = await adminDb
      .collection("activity_feed")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    if (!snap.empty) {
      const activities = snap.docs.map((doc) => ({
        label: doc.data().label as string,
        detail: doc.data().detail as string,
        value: doc.data().value as string,
      }));
      return NextResponse.json({ activities, source: "firestore" });
    }

    return NextResponse.json({ activities: tapCashActivity, source: "seed" });
  } catch {
    return NextResponse.json({ activities: tapCashActivity, source: "seed" });
  }
}
