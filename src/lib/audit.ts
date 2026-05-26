import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function logFraudFlag(entry: Record<string, any>) {
  await adminDb.collection("fraud_flags").add({
    ...entry,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function logAdminAction(entry: Record<string, any>) {
  await adminDb.collection("admin_actions").add({
    ...entry,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
