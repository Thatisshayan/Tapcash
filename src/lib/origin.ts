import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = process.env.NODE_ENV === "production"
  ? ["https://tapcash.online", "https://www.tapcash.online"]
  : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"];

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

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return { valid: false, error: "Origin not allowed" };
  }

  return { valid: true };
}
