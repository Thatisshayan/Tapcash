import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export interface IdempotencyResult {
  isDuplicate: boolean;
  existingResponse?: { status: number; body: unknown };
  key?: string;
}

export async function checkIdempotency(request: NextRequest, userId: string): Promise<IdempotencyResult> {
  const key = request.headers.get("Idempotency-Key")?.trim();
  if (!key) {
    return { isDuplicate: false };
  }

  if (key.length > 255 || !/^[\w-]+$/.test(key)) {
    return { isDuplicate: false };
  }

  const docId = `${userId}_${key}`;
  const ref = adminDb.collection("idempotency_keys").doc(docId);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data()!;
    const createdAt = data.createdAt?.toDate?.()?.getTime?.() ?? 0;

    if (Date.now() - createdAt > IDEMPOTENCY_TTL_MS) {
      await ref.delete();
      return { isDuplicate: false, key };
    }

    if (data.responseBody) {
      return {
        isDuplicate: true,
        existingResponse: { status: data.responseStatus || 200, body: data.responseBody },
        key,
      };
    }

    return {
      isDuplicate: true,
      existingResponse: { status: 409, body: { error: "Request is still being processed. Please wait." } },
      key,
    };
  }

  await ref.set({
    userId,
    key,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { isDuplicate: false, key };
}

export async function storeIdempotencyResponse(userId: string, key: string | undefined, status: number, body: unknown): Promise<void> {
  if (!key) return;
  const docId = `${userId}_${key}`;
  try {
    await adminDb.collection("idempotency_keys").doc(docId).update({
      responseStatus: status,
      responseBody: body,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch {
    // non-critical
  }
}
