"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
// src/app/api/auth/signup/route.ts
const server_1 = require("next/server");
const firebaseAdmin_1 = require("@/lib/firebaseAdmin");
const antiFraud_1 = require("@/lib/antiFraud");
const email_1 = require("@/lib/email");
const firestore_1 = require("firebase-admin/firestore");
const dns_1 = require("dns");
const error_1 = require("@/lib/error");
const middleware_1 = require("@/middleware");
const signupSchema_1 = require("@/lib/validation/signupSchema");
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        // Apply security middleware
        const securityResponse = yield (0, middleware_1.securityMiddleware)(request);
        if (securityResponse)
            return securityResponse;
        try {
            // Validate request body with Zod schema
            const body = yield request.json();
            const validationResult = signupSchema_1.signupSchema.safeParse(body);
            if (!validationResult.success) {
                const zodError = validationResult.error;
                const rawResponse = server_1.NextResponse.json({
                    error: "Validation failed",
                    details: zodError.errors.map(err => `${err.path.join(".")}: ${err.message}`)
                }, { status: 400 });
                return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
            }
            const { email, password, name, deviceFingerprint } = validationResult.data;
            const ip = (0, antiFraud_1.getClientIp)(request);
            const userAgent = request.headers.get("user-agent") || "unknown";
            // Anti-Sybil: Check for duplicate device fingerprint across accounts
            if (deviceFingerprint && typeof deviceFingerprint === "string" && deviceFingerprint.trim().length > 0) {
                const dupeQuery = yield firebaseAdmin_1.adminDb.collection("users")
                    .where("deviceFingerprint", "==", deviceFingerprint)
                    .limit(1)
                    .get();
                if (!dupeQuery.empty) {
                    const existingUser = dupeQuery.docs[0].data();
                    // Flag the existing user's account immediately
                    const existingUserRef = firebaseAdmin_1.adminDb.collection("users").doc(existingUser.uid);
                    yield existingUserRef.update({
                        status: "flagged",
                        isFlagged: true,
                        flaggedReason: `Device fingerprint collision during registration of a new user: ${email}`,
                        updatedAt: firestore_1.FieldValue.serverTimestamp(),
                    });
                    // Log critical fraud attempt
                    yield (0, antiFraud_1.logFraudAttempt)({
                        ip,
                        email,
                        action: "SIGNUP_BLOCKED_FINGERPRINT_COLLISION",
                        reason: `Device fingerprint duplicate detected. Collided with user ID: ${existingUser.uid}`,
                        userAgent,
                        createdAt: new Date(),
                        details: { deviceFingerprint, collidedWith: existingUser.uid }
                    });
                    const rawResponse = server_1.NextResponse.json({
                        error: "Registration denied. Multiple accounts detected on this device. TapCash operates a strict one-account-per-device policy."
                    }, { status: 403 });
                    return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
                }
            }
            // 1. Sniff out Headless Automation Tools/Scrapers
            const botCheck = (0, antiFraud_1.isBotAgent)(userAgent);
            if (botCheck.isBot) {
                yield (0, antiFraud_1.logFraudAttempt)({
                    ip,
                    email,
                    action: "SIGNUP_BLOCKED_BOT",
                    reason: botCheck.reason || "Bot User-Agent detected",
                    userAgent,
                    createdAt: new Date(),
                });
                const rawResponse = server_1.NextResponse.json({ error: "Access denied. Automation/Headless browsers are strictly prohibited." }, { status: 403 });
                return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
            }
            // 2. Perform ProxyCheck.io validation
            const ipCheck = yield (0, antiFraud_1.isIpSuspicious)(ip, "SIGNUP_BLOCKED_VPN", undefined, email, userAgent);
            if (ipCheck.suspicious) {
                const rawResponse = server_1.NextResponse.json({
                    error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on registration to prevent multiple accounts farming."
                }, { status: 403 });
                return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
            }
            // 2.5. Prevent fake-email signup vulnerabilities (DNS MX-record check + disposable list)
            const emailParts = email.split("@");
            if (emailParts.length !== 2) {
                const rawResponse = server_1.NextResponse.json({ error: "Invalid email format." }, { status: 400 });
                return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
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
                yield (0, antiFraud_1.logFraudAttempt)({
                    ip,
                    email,
                    action: "SIGNUP_BLOCKED_DISPOSABLE_EMAIL",
                    reason: `Disposable email domain detected: ${domain}`,
                    userAgent,
                    createdAt: new Date(),
                });
                const rawResponse = server_1.NextResponse.json({
                    error: "Registration failed. Disposable or temporary email addresses are strictly prohibited. Please use a legitimate personal email provider."
                }, { status: 400 });
                return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
            }
            // Check MX Records for non-trusted domains
            const TRUSTED_DOMAINS = [
                "gmail.com", "yahoo.com", "ymail.com", "outlook.com", "hotmail.com",
                "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com",
                "protonmail.com", "proton.me", "zoho.com", "gmx.com", "mail.com"
            ];
            if (!TRUSTED_DOMAINS.includes(domain)) {
                try {
                    const mxRecords = yield dns_1.promises.resolveMx(domain);
                    if (!mxRecords || mxRecords.length === 0) {
                        throw new Error("No MX records found");
                    }
                }
                catch (dnsErr) {
                    console.warn(`DNS MX lookup failed for domain: ${domain}`, dnsErr);
                    yield (0, antiFraud_1.logFraudAttempt)({
                        ip,
                        email,
                        action: "SIGNUP_BLOCKED_INVALID_DOMAIN",
                        reason: `Invalid email domain (No active mail server/MX record): ${domain}`,
                        userAgent,
                        createdAt: new Date(),
                    });
                    const rawResponse = server_1.NextResponse.json({
                        error: "Registration failed. The email domain provided does not have any active mail servers (invalid MX records). Please register with a real email address."
                    }, { status: 400 });
                    return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
                }
            }
            // 3. Create user securely in Firebase Auth
            let userRecord;
            try {
                userRecord = yield firebaseAdmin_1.adminAuth.createUser({
                    email,
                    password,
                    displayName: name,
                });
            }
            catch (err) {
                console.error("Firebase Admin Auth createUser error:", err);
                // Map common errors into elegant readable prompts
                const authError = err;
                let friendlyMessage = authError.message || "Registration failed.";
                if (authError.code === "auth/email-already-exists") {
                    friendlyMessage = "An account with this email address already exists.";
                }
                else if (authError.code === "auth/invalid-password") {
                    friendlyMessage = "Password must be at least 6 characters.";
                }
                const rawResponse = server_1.NextResponse.json({ error: friendlyMessage }, { status: 400 });
                return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
            }
            // Read the referral cookie
            const refCookie = request.cookies.get("tapcash_ref");
            const referredBy = (refCookie === null || refCookie === void 0 ? void 0 : refCookie.value) || null;
            // 4. Initialize Profile entry in Firestore
            const userRef = firebaseAdmin_1.adminDb.collection("users").doc(userRecord.uid);
            yield userRef.set({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: name,
                status: "active", // Possible: active, flagged, banned
                isFlagged: false,
                authProvider: "email",
                emailVerified: false,
                registrationIp: ip,
                userAgent,
                deviceFingerprint: deviceFingerprint || "",
                referredBy: referredBy,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            // 5. Send Welcome Email
            yield (0, email_1.sendWelcomeEmail)(email, name);
            const rawResponse = server_1.NextResponse.json({
                success: true,
                message: "Account created successfully.",
                uid: userRecord.uid,
            }, { status: 200 });
            return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
        }
        catch (error) {
            console.error("Signup API root handler crash:", error);
            const rawResponse = server_1.NextResponse.json({ error: (0, error_1.getErrorMessage)(error, "Internal server registration failure.") }, { status: 500 });
            return yield (0, middleware_1.responseMiddleware)(request, rawResponse);
        }
    });
}
