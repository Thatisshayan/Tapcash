import { NextRequest, NextResponse } from "next/server";

interface AdminSessionPayload {
  uid: string;
  email: string;
}

type AdminSessionResult =
  | AdminSessionPayload
  | {
      response: NextResponse;
    };

/**
 * Verifies the `admin_session` cookie minted by POST /api/auth/session.
 * This is the API-route equivalent of middleware.ts's verifySession() —
 * middleware.ts only protects page routes (its config.matcher does not
 * include /api/admin/:path*), so every /api/admin/* route must call this
 * directly instead of relying on middleware to have already checked.
 */
export async function requireAdminSession(request: NextRequest): Promise<AdminSessionResult> {
  const SESSION_SECRET = process.env.SESSION_SECRET;

  if (!SESSION_SECRET) {
    return {
      response: NextResponse.json({ error: "Server misconfigured: SESSION_SECRET not set" }, { status: 500 }),
    };
  }

  const cookieValue = request.cookies.get("admin_session")?.value;
  if (!cookieValue) {
    return {
      response: NextResponse.json({ error: "Unauthorized: Missing admin session" }, { status: 401 }),
    };
  }

  try {
    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(cookieValue, secret);

    if (typeof payload.uid !== "string") {
      return {
        response: NextResponse.json({ error: "Unauthorized: Invalid admin session" }, { status: 401 }),
      };
    }

    if (payload.admin !== true) {
      return {
        response: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 }),
      };
    }

    return {
      uid: payload.uid,
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    return {
      response: NextResponse.json({ error: "Unauthorized: Invalid or expired admin session" }, { status: 401 }),
    };
  }
}
