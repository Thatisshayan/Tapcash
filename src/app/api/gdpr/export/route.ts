import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { securityMiddleware, responseMiddleware } from "@/middleware";

export async function GET(request: NextRequest) {
  const { response: securityResponse, rateLimit } = await securityMiddleware(request);
  if (securityResponse) return responseMiddleware(securityResponse, rateLimit);

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Collect all user data from related collections
    const [ledgerSnapshot, transactionsSnapshot, activitiesSnapshot] = await Promise.all([
      adminDb.collection("ledger").where("userId", "==", decodedToken.uid).get(),
      adminDb.collection("transactions").where("userId", "==", decodedToken.uid).get(),
      adminDb.collection("user_activities").where("userId", "==", decodedToken.uid).limit(100).get(),
    ]);

    const userData = userDoc.data();

    const exportData = {
      profile: {
        uid: userData?.uid,
        email: userData?.email,
        displayName: userData?.displayName,
        createdAt: userData?.createdAt,
        status: userData?.status,
      },
      ledger: ledgerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      transactions: transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      activities: activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      exportTimestamp: new Date().toISOString(),
    };

    // Log GDPR export action
    await adminDb.collection("admin_logs").add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: "gdpr_data_export",
      targetUserId: decodedToken.uid,
      timestamp: new Date(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    const response = NextResponse.json({ success: true, data: exportData });
    response.headers.set("Content-Disposition", "attachment; filename=tapcash-data-export.json");
    return responseMiddleware(response, rateLimit);
  } catch (error: unknown) {
    console.error("GDPR export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}