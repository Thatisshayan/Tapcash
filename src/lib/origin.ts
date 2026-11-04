import { NextRequest } from "next/server";

// Production origins allowed to send state-changing requests (POST/PUT/...).
// tapcash-rose.vercel.app is the canonical project's public production alias;
// it is the only working public URL while tapcash.online DNS is unresolved.
const PRODUCTION_ORIGINS = [
  "https://tapcash.online",
  "https://www.tapcash.online",
  "https://tapcash-rose.vercel.app",
];

const DEVELOPMENT_ORIGINS = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"];

/**
 * Read per request (not at module load) so NODE_ENV and the optional
 * ALLOWED_ORIGINS env var (comma-separated exact origins, e.g.
 * "https://staging.tapcash.online") are always honoured.
 */
export function getAllowedOrigins(): string[] {
  const base = process.env.NODE_ENV === "production" ? PRODUCTION_ORIGINS : DEVELOPMENT_ORIGINS;
  const extra = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter((value) => /^https?:\/\/[^/\s]+$/.test(value));
  return [...base, ...extra];
}

const SERVER_TO_SERVER_EXEMPT = [
  "/api/postback/",
  "/api/postbacks/",
  "/api/health",
];

function isExempt(pathname: string): boolean {
  return SERVER_TO_SERVER_EXEMPT.some((route) => pathname.startsWith(route));
}

export function validateOrigin(request: NextRequest): { valid: boolean; error?: string } {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return { valid: true };
  }

  if (isExempt(request.nextUrl.pathname)) {
    return { valid: true };
  }

  const origin = request.headers.get("origin");

  if (!origin) {
    if (process.env.NODE_ENV === "production") {
      return { valid: false, error: "Missing Origin header" };
    }
    return { valid: true };
  }

  if (!getAllowedOrigins().includes(origin)) {
    return { valid: false, error: "Origin not allowed" };
  }

  return { valid: true };
}
