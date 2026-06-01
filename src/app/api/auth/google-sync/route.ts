import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = auth.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    const body = await request.json().catch(() => ({}));
    const referredBy = body.referredBy || null;

    const userRef = adminDb.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      // New Google user — create profile
      const name = decoded.name || decoded.email?.split("@")[0] || "Earner";
      await userRef.set({
        uid: decoded.uid,
        email: decoded.email,
        displayName: name,
        status: "active",
        isFlagged: false,
        authProvider: "google",
        emailVerified: true,
        referredBy,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      try {
        await sendWelcomeEmail(decoded.email!, name);
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({ ok: true, isNew: !userSnap.exists });
  } catch (err: unknown) {
    console.error("[GOOGLE SYNC]", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
