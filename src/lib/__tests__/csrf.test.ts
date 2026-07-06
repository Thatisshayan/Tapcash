import { generateCsrfToken, validateCsrf } from "../csrf";
import type { NextRequest } from "next/server";

function mockRequest(method: string, headers: Record<string, string> = {}, cookies: Record<string, string> = {}): NextRequest {
  const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  return {
    method,
    headers: new Headers(headers),
    cookies: {
      get: (name: string) => cookies[name] ? { name, value: cookies[name] } : undefined,
    },
  } as unknown as NextRequest;
}

describe("CSRF Protection", () => {
  describe("generateCsrfToken", () => {
    it("should generate a token and hash", () => {
      const { token, hash } = generateCsrfToken();
      expect(token).toBeTruthy();
      expect(token.length).toBe(64);
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(64);
    });

    it("should generate unique tokens each time", () => {
      const a = generateCsrfToken();
      const b = generateCsrfToken();
      expect(a.token).not.toBe(b.token);
    });
  });

  describe("validateCsrf", () => {
    it("should skip validation for GET requests", () => {
      const req = mockRequest("GET");
      const result = validateCsrf(req);
      expect(result.valid).toBe(true);
    });

    it("should skip validation for HEAD requests", () => {
      const req = mockRequest("HEAD");
      const result = validateCsrf(req);
      expect(result.valid).toBe(true);
    });

    it("should skip validation for OPTIONS requests", () => {
      const req = mockRequest("OPTIONS");
      const result = validateCsrf(req);
      expect(result.valid).toBe(true);
    });

    it("should reject POST without CSRF header", () => {
      const req = mockRequest("POST", {}, { csrf_token: "abc" });
      const result = validateCsrf(req);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Missing CSRF token header");
    });

    it("should reject POST without CSRF cookie", () => {
      const req = mockRequest("POST", { "x-csrf-token": "abc" });
      const result = validateCsrf(req);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Missing CSRF cookie");
    });

    it("should reject when header and cookie don't match", () => {
      const req = mockRequest("POST", { "x-csrf-token": "abc" }, { csrf_token: "xyz" });
      const result = validateCsrf(req);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("mismatch");
    });

    it("should accept when header and cookie match", () => {
      const token = "matching-token-123";
      const req = mockRequest("POST", { "x-csrf-token": token }, { csrf_token: token });
      const result = validateCsrf(req);
      expect(result.valid).toBe(true);
    });

    it("should reject PUT without CSRF token", () => {
      const req = mockRequest("PUT");
      const result = validateCsrf(req);
      expect(result.valid).toBe(false);
    });

    it("should reject DELETE without CSRF token", () => {
      const req = mockRequest("DELETE");
      const result = validateCsrf(req);
      expect(result.valid).toBe(false);
    });
  });
});
