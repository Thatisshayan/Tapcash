import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { tapCashStats } from "@shared/tapcash-content";

export const runtime = "nodejs";
export const revalidate = 300;

let cache: { data: typeof tapCashStats; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ stats: cache.data });
    }

    const snap = await adminDb.collection("site_stats").orderBy("order").get();

    if (!snap.empty) {
      const stats = snap.docs.map((doc) => ({
        value: doc.data().value as string,
        label: doc.data().label as string,
        detail: doc.data().detail as string,
      }));
      cache = { data: stats, ts: Date.now() };
      return NextResponse.json({ stats, source: "firestore" });
    }

    return NextResponse.json({ stats: tapCashStats, source: "seed" });
  } catch {
    return NextResponse.json({ stats: tapCashStats, source: "seed" });
  }
}
