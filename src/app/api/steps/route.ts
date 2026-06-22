import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { tapCashSteps } from "@shared/tapcash-content";

export const runtime = "nodejs";
export const revalidate = 300;

let cache: { data: typeof tapCashSteps; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ steps: cache.data });
    }

    const snap = await adminDb.collection("steps").orderBy("id").get();

    if (!snap.empty) {
      const steps = snap.docs.map((doc) => ({
        id: doc.data().id as string,
        title: doc.data().title as string,
        description: doc.data().description as string,
      }));
      cache = { data: steps, ts: Date.now() };
      return NextResponse.json({ steps, source: "firestore" });
    }

    return NextResponse.json({ steps: tapCashSteps, source: "seed" });
  } catch {
    return NextResponse.json({ steps: tapCashSteps, source: "seed" });
  }
}
