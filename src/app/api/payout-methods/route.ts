import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { tapCashPayoutMethods } from "@shared/tapcash-content";

export const runtime = "nodejs";
export const revalidate = 300;

let cache: { data: typeof tapCashPayoutMethods; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ methods: cache.data });
    }

    const snap = await adminDb.collection("payout_methods").orderBy("order").get();

    if (!snap.empty) {
      const methods = snap.docs.map((doc) => doc.data() as (typeof tapCashPayoutMethods)[number]);
      cache = { data: methods, ts: Date.now() };
      return NextResponse.json({ methods, source: "firestore" });
    }

    return NextResponse.json({ methods: tapCashPayoutMethods, source: "seed" });
  } catch {
    return NextResponse.json({ methods: tapCashPayoutMethods, source: "seed" });
  }
}
