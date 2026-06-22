import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { tapCashTrustPoints, rapidoReachTrustPoints } from "@shared/tapcash-content";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const snap = await adminDb.collection("trust_points").orderBy("order").get();

    if (!snap.empty) {
      const points = snap.docs.map((doc) => ({
        title: doc.data().title as string,
        description: doc.data().description as string,
      }));
      return NextResponse.json({ trustPoints: points, rapidoReachPoints: points, source: "firestore" });
    }

    return NextResponse.json({
      trustPoints: tapCashTrustPoints,
      rapidoReachPoints: rapidoReachTrustPoints,
      source: "seed",
    });
  } catch {
    return NextResponse.json({
      trustPoints: tapCashTrustPoints,
      rapidoReachPoints: rapidoReachTrustPoints,
      source: "seed",
    });
  }
}
