import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function logFraudFlag(entry: Record<string, unknown>) {
  await adminDb.collection("fraud_flags").add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function logAdminAction(entry: Record<string, unknown>) {
  await adminDb.collection("admin_actions").add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
