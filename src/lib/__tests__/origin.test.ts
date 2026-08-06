import { validateOrigin } from "../origin";
import type { NextRequest } from "next/server";
import { setNodeEnv } from "../testHelpers/testEnv";

function mockRequest(method: string, headers: Record<string, string> = {}, pathname = "/api/test"): NextRequest {
  return {
    method,
    headers: new Headers(headers),
    nextUrl: { pathname },
  } as unknown as NextRequest;
}

describe("Origin Validation", () => {
  it("should allow GET requests without origin", () => {
    const req = mockRequest("GET");
    expect(validateOrigin(req).valid).toBe(true);
  });

  it("should allow HEAD requests without origin", () => {
    const req = mockRequest("HEAD");
    expect(validateOrigin(req).valid).toBe(true);
  });

  it("should allow OPTIONS requests without origin", () => {
    const req = mockRequest("OPTIONS");
    expect(validateOrigin(req).valid).toBe(true);
  });

  it("should exempt postback routes", () => {
    const req = mockRequest("POST", {}, "/api/postback/rapidoreach");
    expect(validateOrigin(req).valid).toBe(true);
  });

  it("should exempt postbacks routes", () => {
    const req = mockRequest("POST", {}, "/api/postbacks/offerwall");
    expect(validateOrigin(req).valid).toBe(true);
  });

  it("should exempt health routes", () => {
    const req = mockRequest("POST", {}, "/api/health");
    expect(validateOrigin(req).valid).toBe(true);
  });

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    it("should allow localhost origin in development", () => {
      const req = mockRequest("POST", { origin: "http://localhost:3000" });
      expect(validateOrigin(req).valid).toBe(true);
    });

    it("should allow missing origin in development", () => {
      const req = mockRequest("POST");
      expect(validateOrigin(req).valid).toBe(true);
    });
  }

  it("should reject unknown origins in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    setNodeEnv("production");

    const req = mockRequest("POST", { origin: "https://evil.com" });
    const result = validateOrigin(req);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not allowed");

    setNodeEnv(originalEnv as string);
  });

  it("should reject missing origin in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    setNodeEnv("production");

    const req = mockRequest("POST", {}, "/api/payouts/request");
    const result = validateOrigin(req);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Missing Origin");

    setNodeEnv(originalEnv as string);
  });
});
