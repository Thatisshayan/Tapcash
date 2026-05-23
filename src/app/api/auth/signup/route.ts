// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from "@/lib/antiFraud";
import { sendWelcomeEmail } from "@/lib/email";
import { FieldValue } from "firebase-admin/firestore";
import { promises as dnsPromises } from "dns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, deviceFingerprint } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields: email, password, name" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Anti-Sybil: Check for duplicate device fingerprint across accounts
    if (deviceFingerprint && typeof deviceFingerprint === "string" && deviceFingerprint.trim().length > 0) {
      const dupeQuery = await adminDb.collection("users")
        .where("deviceFingerprint", "==", deviceFingerprint)
        .limit(1)
        .get();

      if (!dupeQuery.empty) {
        const existingUser = dupeQuery.docs[0].data();
        
        // Flag the existing user's account immediately
        const existingUserRef = adminDb.collection("users").doc(existingUser.uid);
        await existingUserRef.update({
          status: "flagged",
          isFlagged: true,
          flaggedReason: `Device fingerprint collision during registration of a new user: ${email}`,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Log critical fraud attempt
        await logFraudAttempt({
          ip,
          email,
          action: "SIGNUP_BLOCKED_FINGERPRINT_COLLISION",
          reason: `Device fingerprint duplicate detected. Collided with user ID: ${existingUser.uid}`,
          userAgent,
          createdAt: new Date(),
          details: { deviceFingerprint, collidedWith: existingUser.uid }
        });

        return NextResponse.json({ 
          error: "Registration denied. Multiple accounts detected on this device. TapCash operates a strict one-account-per-device policy." 
        }, { status: 403 });
      }
    }

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

    // 2.5. Prevent fake-email signup vulnerabilities (DNS MX-record check + disposable list)
    const emailParts = email.split("@");
    if (emailParts.length !== 2) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }
    const domain = emailParts[1].toLowerCase().trim();

    // Block Disposable domains
    const DISPOSABLE_DOMAINS = [
      "yopmail.com", "tempmail.com", "mailinator.com", "guerrillamail.com", 
      "sharklasers.com", "dispostable.com", "10minutemail.com", "trashmail.com", 
      "getairmail.com", "temp-mail.org", "guerrillamail.de", "guerrillamailblock.com",
      "guerrillamail.net", "guerrillamail.org", "pokemail.net"
    ];

    if (DISPOSABLE_DOMAINS.includes(domain)) {
      await logFraudAttempt({
        ip,
        email,
        action: "SIGNUP_BLOCKED_DISPOSABLE_EMAIL",
        reason: `Disposable email domain detected: ${domain}`,
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ 
        error: "Registration failed. Disposable or temporary email addresses are strictly prohibited. Please use a legitimate personal email provider." 
      }, { status: 400 });
    }

    // Check MX Records for non-trusted domains
    const TRUSTED_DOMAINS = [
      "gmail.com", "yahoo.com", "ymail.com", "outlook.com", "hotmail.com", 
      "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", 
      "protonmail.com", "proton.me", "zoho.com", "gmx.com", "mail.com"
    ];

    if (!TRUSTED_DOMAINS.includes(domain)) {
      try {
        const mxRecords = await dnsPromises.resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
          throw new Error("No MX records found");
        }
      } catch (dnsErr) {
        console.warn(`DNS MX lookup failed for domain: ${domain}`, dnsErr);
        await logFraudAttempt({
          ip,
          email,
          action: "SIGNUP_BLOCKED_INVALID_DOMAIN",
          reason: `Invalid email domain (No active mail server/MX record): ${domain}`,
          userAgent,
          createdAt: new Date(),
        });
        return NextResponse.json({ 
          error: "Registration failed. The email domain provided does not have any active mail servers (invalid MX records). Please register with a real email address." 
        }, { status: 400 });
      }
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
      deviceFingerprint: deviceFingerprint || "",
      createdAt: FieldValue.serverTimestamp(),
      wallet: {
        balance: 0,
        lastUpdated: FieldValue.serverTimestamp(),
      },
      walletBalanceCents: 0, // Backward compatibility schema support
    });

    // 5. Send Welcome Email
    await sendWelcomeEmail(email, name);

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
