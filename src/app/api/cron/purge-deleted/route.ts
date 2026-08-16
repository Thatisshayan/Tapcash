import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { createHash } from "crypto";

const CRON_SECRET = process.env.CRON_SECRET || "";
const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const cutoff = new Date(now - GRACE_PERIOD_MS);
  let purged = 0;
  let skipped = 0;

  try {
    const deletedSnap = await adminDb
      .collection("users")
      .where("status", "==", "deleted")
      .where("deleted", "==", true)
      .get();

    for (const doc of deletedSnap.docs) {
      const data = doc.data();
      const deletedAt = data.deletedAt;

      if (!deletedAt) {
        skipped++;
        continue;
      }

      const deletedAtMs = deletedAt instanceof Timestamp
        ? deletedAt.toMillis()
        : deletedAt.toDate?.()?.getTime?.() ?? 0;

      if (now - deletedAtMs < GRACE_PERIOD_MS) {
        skipped++;
        continue;
      }

      const uid = doc.id;
      const email = data.email || "";
      const emailHash = email ? createHash("sha256").update(email).digest("hex") : null;

      await adminDb.runTransaction(async (transaction) => {
        const userRef = adminDb.collection("users").doc(uid);

        transaction.update(userRef, {
          email: emailHash ? `deleted_${emailHash.substring(0, 12)}@purged.local` : FieldValue.delete(),
          displayName: FieldValue.delete(),
          deviceFingerprint: FieldValue.delete(),
          registrationIp: FieldValue.delete(),
          pushToken: FieldValue.delete(),
          referredBy: FieldValue.delete(),
          dateOfBirth: FieldValue.delete(),
          consent: FieldValue.delete(),
          fraudFlags: FieldValue.delete(),
          flaggedReason: FieldValue.delete(),
          purgedAt: FieldValue.serverTimestamp(),
          status: "purged",
        });

        const clicksSnap = await transaction.get(
          adminDb.collection("offer_clicks").where("userId", "==", uid)
        );
        clicksSnap.forEach((clickDoc) => {
          transaction.update(clickDoc.ref, {
            userId: `purged_${uid.substring(0, 8)}`,
            ip: FieldValue.delete(),
            userAgent: FieldValue.delete(),
          });
        });

        const postbacksSnap = await transaction.get(
          adminDb.collection("offer_postbacks").where("userId", "==", uid)
        );
        postbacksSnap.forEach((pbDoc) => {
          transaction.update(pbDoc.ref, {
            userId: `purged_${uid.substring(0, 8)}`,
            ip: FieldValue.delete(),
            userAgent: FieldValue.delete(),
            endUserId: `purged_${uid.substring(0, 8)}`,
          });
        });
      });

      try {
        await adminAuth.deleteUser(uid);
      } catch {
        // User may already be deleted from Firebase Auth
      }

      await adminDb.collection("admin_logs").add({
        action: "gdpr_permanent_purge",
        userId: uid,
        reason: "30-day grace period expired",
        deletedAt: deletedAt,
        purgedAt: FieldValue.serverTimestamp(),
      });

      purged++;
    }

    return NextResponse.json({
      ok: true,
      purged,
      skipped,
      cutoffDate: cutoff.toISOString(),
    });
  } catch (error: unknown) {
    console.error("[PURGE CRON]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Purge failed" },
      { status: 500 }
    );
  }
}
