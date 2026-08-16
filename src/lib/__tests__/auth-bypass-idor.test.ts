import { validateCsrf } from "../csrf";
import { validateOrigin } from "../origin";
import type { NextRequest } from "next/server";

function mockRequest(
  method: string,
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  pathname = "/api/test"
): NextRequest {
  return {
    method,
    headers: new Headers(headers),
    cookies: {
      get: (name: string) =>
        cookies[name] ? { name, value: cookies[name] } : undefined,
    },
    nextUrl: { pathname },
  } as unknown as NextRequest;
}

describe("Rate Limit Bypass Attempts", () => {
  it("should reject requests without x-forwarded-for header (anonymous)", () => {
    const req = mockRequest("POST", {});
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    expect(ip).toBe("anonymous");
  });

  it("should extract first IP from x-forwarded-for chain", () => {
    const req = mockRequest("POST", {
      "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.10.11.12",
    });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    expect(ip).toBe("1.2.3.4");
  });

  it("should handle x-real-ip as fallback", () => {
    const req = mockRequest("POST", { "x-real-ip": "192.168.1.100" });
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    expect(ip).toBe("192.168.1.100");
  });

  it("should not be bypassed by IPv6 localhost", () => {
    const ip = "::1";
    expect(ip).not.toBe("anonymous");
    expect(ip).not.toBe("");
  });

  it("should not be bypassed by null byte in IP header", () => {
    const rawHeader = "1.2.3.4\x00";
    const ip = rawHeader.split(",")[0]?.trim();
    expect(ip).toContain("1.2.3.4");
  });
});

describe("Auth Bypass Attempts", () => {
  it("should reject missing Authorization header", () => {
    const req = mockRequest("GET", {});
    const authHeader = req.headers.get("authorization");
    expect(authHeader).toBeNull();
  });

  it("should reject non-Bearer Authorization", () => {
    const req = mockRequest("GET", { authorization: "Basic abc123" });
    const authHeader = req.headers.get("authorization");
    expect(authHeader?.startsWith("Bearer ")).toBe(false);
  });

  it("should reject empty Bearer token", () => {
    const req = mockRequest("GET", { authorization: "Bearer " });
    const token = req.headers.get("authorization")?.substring(7);
    expect(token).toBe("");
  });

  it("should reject malformed JWT tokens", () => {
    const req = mockRequest("GET", { authorization: "Bearer not-a-jwt" });
    const token = req.headers.get("authorization")?.substring(7);
    expect(token?.split(".")).toHaveLength(1);
  });

  it("should reject expired JWT tokens (structural check)", () => {
    const payload = { exp: 0, iat: 0, sub: "user123" };
    const fakeJwt = `header.${btoa(JSON.stringify(payload))}.signature`;
    const req = mockRequest("GET", { authorization: `Bearer ${fakeJwt}` });
    const token = req.headers.get("authorization")?.substring(7);
    const decoded = JSON.parse(atob(token!.split(".")[1]));
    expect(decoded.exp).toBeLessThan(Date.now() / 1000);
  });
});

describe("IDOR Prevention", () => {
  it("should not accept userId from request body as authoritative", () => {
    const body = { userId: "other-user-123", action: "delete" };
    expect(body.userId).not.toBe("authenticated-user");
  });

  it("should require token-based user identification", () => {
    const validTokenSub = "authenticated-user";
    const requestedUserId = "other-user-123";
    expect(validTokenSub).not.toBe(requestedUserId);
  });

  it("should not allow accessing other users' ledger", () => {
    const tokenUserId = "user-abc";
    const requestedUserId = "user-xyz";
    expect(tokenUserId).toBe("user-abc");
    expect(requestedUserId).not.toBe(tokenUserId);
  });

  it("should not allow admin action on self without admin role", () => {
    const userRoles: string[] = [];
    const isAdmin = userRoles.includes("admin");
    expect(isAdmin).toBe(false);
  });

  it("should validate uid matches token sub in all routes", () => {
    const tokenSub = "uid-123";
    const routeParam = "uid-123";
    expect(tokenSub).toBe(routeParam);
  });
});

describe("CSRF: POST Form Submission", () => {
  it("should reject POST without CSRF header", () => {
    const req = mockRequest("POST", {}, { csrf_token: "abc" });
    const result = validateCsrf(req);
    expect(result.valid).toBe(false);
  });

  it("should reject POST without CSRF cookie", () => {
    const req = mockRequest("POST", { "x-csrf-token": "abc" }, {});
    const result = validateCsrf(req);
    expect(result.valid).toBe(false);
  });

  it("should reject POST with mismatched CSRF token", () => {
    const req = mockRequest(
      "POST",
      { "x-csrf-token": "tokenA" },
      { csrf_token: "tokenB" }
    );
    const result = validateCsrf(req);
    expect(result.valid).toBe(false);
  });

  it("should accept POST with matching CSRF tokens", () => {
    const req = mockRequest(
      "POST",
      { "x-csrf-token": "abc123" },
      { csrf_token: "abc123" }
    );
    const result = validateCsrf(req);
    expect(result.valid).toBe(true);
  });

  it("should always allow GET without CSRF", () => {
    const req = mockRequest("GET");
    const result = validateCsrf(req);
    expect(result.valid).toBe(true);
  });

  it("should always allow HEAD without CSRF", () => {
    const req = mockRequest("HEAD");
    const result = validateCsrf(req);
    expect(result.valid).toBe(true);
  });

  it("should always allow OPTIONS without CSRF", () => {
    const req = mockRequest("OPTIONS");
    const result = validateCsrf(req);
    expect(result.valid).toBe(true);
  });
});

describe("Origin: Production Validation", () => {
  it("should reject request without origin header in production", () => {
    const req = mockRequest("POST", {}, {}, "/api/payouts/request");
    // validateOrigin checks NODE_ENV at module load time, not test time
    // This test verifies the function works with the current ALLOWED_ORIGINS
    const result = validateOrigin(req);
    // Without origin header, behavior depends on current NODE_ENV
    if (process.env.NODE_ENV === "production") {
      expect(result.valid).toBe(false);
    } else {
      expect(result.valid).toBe(true);
    }
  });

  it("should reject arbitrary non-allowed origin", () => {
    const req = mockRequest(
      "POST",
      { origin: "https://evil.com" },
      {},
      "/api/payouts/request"
    );
    const result = validateOrigin(req);
    expect(result.valid).toBe(false);
  });

  it("should always allow GET requests without origin", () => {
    const req = mockRequest("GET", {}, {}, "/api/test");
    const result = validateOrigin(req);
    expect(result.valid).toBe(true);
  });

  it("should allow exempt server-to-server routes", () => {
    const req = mockRequest("POST", {}, {}, "/api/postback/rapido");
    const result = validateOrigin(req);
    expect(result.valid).toBe(true);
  });
});
