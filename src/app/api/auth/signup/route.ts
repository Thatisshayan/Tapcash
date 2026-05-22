// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields: email, password, name" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 1. Sniff out Headless Automation Tools/Scrapers
    const botCheck = isBotAgent(userAgent);
    if (botCheck.isBot) {
      await logFraudAttempt({
        ip,
        email,
        action: "SIGNUP_BLOCKED_BOT",
        reason: botCheck.reason || "Bot User-Agent detected",
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Access denied. Automation/Headless browsers are strictly prohibited." }, { status: 403 });
    }

    // 2. Perform ProxyCheck.io validation
    const ipCheck = await isIpSuspicious(ip, "SIGNUP_BLOCKED_VPN", undefined, email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ 
        error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on registration to prevent multiple accounts farming." 
      }, { status: 403 });
    }

    // 3. Create user securely in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (err: any) {
      console.error("Firebase Admin Auth createUser error:", err);
      // Map common errors into elegant readable prompts
      let friendlyMessage = err.message || "Registration failed.";
      if (err.code === "auth/email-already-exists") {
        friendlyMessage = "An account with this email address already exists.";
      } else if (err.code === "auth/invalid-password") {
        friendlyMessage = "Password must be at least 6 characters.";
      }
      return NextResponse.json({ error: friendlyMessage }, { status: 400 });
    }

    // 4. Initialize Profile entry in Firestore
    const userRef = adminDb.collection("users").doc(userRecord.uid);
    await userRef.set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: name,
      status: "active", // Possible: active, flagged, banned
      isFlagged: false,
      registrationIp: ip,
      userAgent,
      createdAt: FieldValue.serverTimestamp(),
      wallet: {
        balance: 0,
        lastUpdated: FieldValue.serverTimestamp(),
      },
      walletBalanceCents: 0, // Backward compatibility schema support
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      uid: userRecord.uid,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Signup API root handler crash:", error);
    return NextResponse.json({ error: "Internal server registration failure." }, { status: 500 });
  }
}
