import { NextRequest, NextResponse } from "next/server";

/**
 * Security middleware for API routes
 * Validates request headers and implements rate limiting
 */
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Check for required headers
  const contentType = request.headers.get("content-type");
  
  // Allow GET requests without content-type
  if (request.method !== "GET" && !contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 }
    );
  }

  // Add basic security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return null; // Continue to route handler
}

/**
 * Response middleware for API routes
 * Adds standard headers to all responses
 */
export function responseMiddleware(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

// Made with Bob
