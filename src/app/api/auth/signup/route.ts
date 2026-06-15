import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, firebaseAdminMode, firebaseAdminReady } from "@/lib/firebaseAdmin";
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt, calculateFraudScore } from "@/lib/antiFraud";
import { sendWelcomeEmail } from "@/lib/email";
import { FieldValue } from "firebase-admin/firestore";
import { promises as dnsPromises } from "dns";
import { getErrorMessage } from "@/lib/error";
import { securityMiddleware, responseMiddleware } from "@/middleware";
import { signupSchema } from "@/lib/validation/signupSchema";
import type { ZodIssue } from "zod";
import type { FraudScore } from "@/lib/antiFraud";

export async function POST(request: NextRequest) {
  const { response: securityResponse, rateLimit } = await securityMiddleware(request);
  if (securityResponse) return responseMiddleware(securityResponse, rateLimit);

  try {
    const body = await request.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      const zodError = validationResult.error;
      const rawResponse = NextResponse.json(
        {
          error: "Validation failed",
          details: zodError.issues.map((err: ZodIssue) => `${err.path.join(".")}: ${err.message}`),
        },
        { status: 400 }
      );
      return responseMiddleware(rawResponse, rateLimit);
    }

    const { email, password, displayName } = validationResult.data;
    const deviceFingerprint = body.deviceFingerprint;

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (deviceFingerprint && typeof deviceFingerprint === "string" && deviceFingerprint.trim().length > 0) {
      const dupeQuery = await adminDb
        .collection("users")
        .where("deviceFingerprint", "==", deviceFingerprint)
        .limit(1)
        .get();

      if (!dupeQuery.empty) {
        const existingUser = dupeQuery.docs[0].data();

        const existingUserRef = adminDb.collection("users").doc(existingUser.uid);
        await existingUserRef.update({
          status: "flagged",
          isFlagged: true,
          flaggedReason: `Device fingerprint collision during registration of a new user: ${email}`,
          updatedAt: FieldValue.serverTimestamp(),
        });

        await logFraudAttempt({
          ip,
          email,
          action: "SIGNUP_BLOCKED_FINGERPRINT_COLLISION",
          reason: `Device fingerprint duplicate detected. Collided with user ID: ${existingUser.uid}`,
          userAgent,
          createdAt: new Date(),
          details: { deviceFingerprint, collidedWith: existingUser.uid },
        });

        const rawResponse = NextResponse.json(
          {
            error: "Registration denied. Multiple accounts detected on this device. TapCash operates a strict one-account-per-device policy.",
          },
          { status: 403 }
        );
        return responseMiddleware(rawResponse, rateLimit);
      }
    }

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

      const rawResponse = NextResponse.json(
        { error: "Access denied. Automation/Headless browsers are strictly prohibited." },
        { status: 403 }
      );
      return responseMiddleware(rawResponse, rateLimit);
    }

    const ipCheck = await isIpSuspicious(ip, "SIGNUP_BLOCKED_VPN", undefined, email, userAgent);
    if (ipCheck.suspicious) {
      const rawResponse = NextResponse.json(
        {
          error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on registration to prevent multiple accounts farming.",
        },
        { status: 403 }
      );
      return responseMiddleware(rawResponse, rateLimit);
    }

    const emailParts = email.split("@");
    if (emailParts.length !== 2) {
      const rawResponse = NextResponse.json({ error: "Invalid email format." }, { status: 400 });
      return responseMiddleware(rawResponse, rateLimit);
    }

    const domain = emailParts[1].toLowerCase().trim();

    const DISPOSABLE_DOMAINS = [
      "yopmail.com", "tempmail.com", "mailinator.com", "guerrillamail.com",
      "sharklasers.com", "dispostable.com", "10minutemail.com", "trashmail.com",
      "getairmail.com", "temp-mail.org", "guerrillamail.de",
      "guerrillamailblock.com", "guerrillamail.net", "guerrillamail.org", "pokemail.net",
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

      const rawResponse = NextResponse.json(
        {
          error: "Registration failed. Disposable or temporary email addresses are strictly prohibited.",
        },
        { status: 400 }
      );
      return responseMiddleware(rawResponse, rateLimit);
    }

    const TRUSTED_DOMAINS = [
      "gmail.com", "yahoo.com", "ymail.com", "outlook.com", "hotmail.com",
      "live.com", "msn.com", "icloud.com", "me.com", "mac.com",
      "aol.com", "protonmail.com", "proton.me", "zoho.com", "gmx.com", "mail.com",
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

        const rawResponse = NextResponse.json(
          {
            error: "Registration failed. The email domain provided does not have any active mail servers.",
          },
          { status: 400 }
        );
        return responseMiddleware(rawResponse, rateLimit);
      }
    }

    if (!firebaseAdminReady) {
      const rawResponse = NextResponse.json(
        {
          error: "Firebase Admin Auth is not configured. Enable Firebase Admin credentials or the Identity Toolkit API before signup can work.",
          mode: firebaseAdminMode,
        },
        { status: 503 }
      );
      return responseMiddleware(rawResponse, rateLimit);
    }

    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: displayName,
      });
    } catch (err: unknown) {
      console.error("Firebase Admin Auth createUser error:", err);

      const authError = err as Error & { code?: string };
      let friendlyMessage = authError.message || "Registration failed.";

      if (authError.code === "auth/email-already-exists") {
        friendlyMessage = "An account with this email address already exists.";
      } else if (authError.code === "auth/invalid-password") {
        friendlyMessage = "Password must be at least 6 characters.";
      } else if (authError.message?.includes("Identity Toolkit API")) {
        friendlyMessage = "Firebase Identity Toolkit API is disabled or not enabled for this project. Enable it in Google Cloud Console and retry.";
      } else if (authError.message?.includes("PERMISSION_DENIED")) {
        friendlyMessage = "Firebase Admin Auth permission denied. Check service account permissions and Identity Toolkit API access.";
      }

      const rawResponse = NextResponse.json({ error: friendlyMessage }, { status: 400 });
      return responseMiddleware(rawResponse, rateLimit);
    }

    const refCookie = request.cookies.get("tapcash_ref");
    const referredBy = refCookie?.value || null;

    const userRef = adminDb.collection("users").doc(userRecord.uid);
    const fraudScore: FraudScore = calculateFraudScore({
      userAgent,
      deviceFingerprint: body.deviceFingerprint,
      emailDomain: domain,
      ip,
    });
    
    await userRef.set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName,
      status: "active",
      isFlagged: fraudScore.score > 25,
      fraudScore: fraudScore.score,
      fraudFlags: fraudScore.riskFactors,
      authProvider: "email",
      emailVerified: false,
      registrationIp: ip,
      userAgent,
      deviceFingerprint: deviceFingerprint || "",
      referredBy,
      createdAt: FieldValue.serverTimestamp(),
    });

    await sendWelcomeEmail(email, displayName || email);

    const rawResponse = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        uid: userRecord.uid,
        fraudScore: fraudScore.score,
      },
      { status: 200 }
    );

    return responseMiddleware(rawResponse, rateLimit);
  } catch (error: unknown) {
    console.error("Signup API root handler crash:", error);

    const rawResponse = NextResponse.json(
      { error: getErrorMessage(error, "Internal server registration failure.") },
      { status: 500 }
    );

    return responseMiddleware(rawResponse, { remaining: 60, resetTime: 0, limit: 60 });
  }
}