import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const body = await request.json();
    const { pushToken } = body;

    if (!pushToken || typeof pushToken !== "string") {
      return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    
    await userRef.set(
      {
        pushToken: pushToken,
        pushTokenUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await adminDb
      .collection("users")
      .doc(uid)
      .collection("pushTokens")
      .add({
        token: pushToken,
        createdAt: FieldValue.serverTimestamp(),
        platform: "expo",
      });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save push token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}