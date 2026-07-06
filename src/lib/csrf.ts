import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

export function generateCsrfToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearCsrfCookie(response: NextResponse): void {
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: "",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function validateCsrf(request: NextRequest, sessionCsrfHash?: string): { valid: boolean; error?: string } {
  if (SAFE_METHODS.includes(request.method)) {
    return { valid: true };
  }

  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken) {
    return { valid: false, error: "Missing CSRF token header" };
  }

  if (!cookieToken) {
    return { valid: false, error: "Missing CSRF cookie" };
  }

  if (headerToken !== cookieToken) {
    return { valid: false, error: "CSRF token mismatch" };
  }

  if (sessionCsrfHash) {
    const headerHash = createHash("sha256").update(headerToken).digest("hex");
    if (headerHash !== sessionCsrfHash) {
      return { valid: false, error: "CSRF token invalid" };
    }
  }

  return { valid: true };
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
