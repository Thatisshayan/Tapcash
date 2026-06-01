import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = auth.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    const body = await request.json();
    const { subscription } = body;
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
    }

    await adminDb.collection("push_subscriptions").doc(decoded.uid).set(
      {
        userId: decoded.uid,
        subscription,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[PUSH SUBSCRIBE]", err);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = auth.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    await adminDb.collection("push_subscriptions").doc(decoded.uid).delete();
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[PUSH UNSUBSCRIBE]", err);
    return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 });
  }
}
