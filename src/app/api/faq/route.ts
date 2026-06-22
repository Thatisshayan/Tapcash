import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { tapCashFaqs } from "@shared/tapcash-content";

export const runtime = "nodejs";
export const revalidate = 300;

let cache: { data: typeof tapCashFaqs; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ faqs: cache.data });
    }

    const snap = await adminDb.collection("faq").orderBy("order").get();

    if (!snap.empty) {
      const faqs = snap.docs.map((doc) => ({
        question: doc.data().question as string,
        answer: doc.data().answer as string,
      }));
      cache = { data: faqs, ts: Date.now() };
      return NextResponse.json({ faqs, source: "firestore" });
    }

    return NextResponse.json({ faqs: tapCashFaqs, source: "seed" });
  } catch {
    return NextResponse.json({ faqs: tapCashFaqs, source: "seed" });
  }
}
