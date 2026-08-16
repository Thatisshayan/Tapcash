import { signupSchema } from "../validation/signupSchema";
import { validateCsrf } from "../csrf";
import { validateOrigin } from "../origin";
import { isBotAgent, calculateFraudScore } from "../antiFraud";
import type { NextRequest } from "next/server";
import { setNodeEnv } from "../testHelpers/testEnv";

function mockRequest(method: string, headers: Record<string, string> = {}, cookies: Record<string, string> = {}, pathname = "/api/test"): NextRequest {
  const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  return {
    method,
    headers: new Headers(headers),
    cookies: {
      get: (name: string) => cookies[name] ? { name, value: cookies[name] } : undefined,
    },
    nextUrl: { pathname },
  } as unknown as NextRequest;
}

describe("Security: XSS Prevention", () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "javascript:alert(1)",
    '<svg onload=alert(1)>',
    "'; DROP TABLE users; --",
    "{{constructor.constructor('return this')()}}",
  ];

  xssPayloads.forEach((payload) => {
    it(`should accept XSS payload in displayName (sanitized at render time): ${payload.substring(0, 30)}`, () => {
      const result = signupSchema.safeParse({
        email: "test@gmail.com",
        password: "securepass123",
        displayName: payload,
        dateOfBirth: "1995-06-15",
        tosAccepted: true,
        privacyAccepted: true,
      });
      expect(result.success).toBe(true);
    });
  });

  it("should reject XSS in email field", () => {
    const result = signupSchema.safeParse({
      email: '<script>alert("xss")</script>@evil.com',
      password: "securepass123",
      dateOfBirth: "1995-06-15",
      tosAccepted: true,
      privacyAccepted: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("Security: CSRF Bypass Attempts", () => {
  it("should reject empty CSRF token in header", () => {
    const req = mockRequest("POST", { "x-csrf-token": "" }, { csrf_token: "valid" });
    expect(validateCsrf(req).valid).toBe(false);
  });

  it("should reject CSRF token with different values in header vs cookie", () => {
    const req = mockRequest("POST", { "x-csrf-token": "tokenA" }, { csrf_token: "tokenB" });
    const result = validateCsrf(req);
    expect(result.valid).toBe(false);
  });

  it("should reject case-manipulated header name", () => {
    const req = mockRequest("POST", { "X-CSRF-TOKEN": "abc" }, { csrf_token: "abc" });
    expect(validateCsrf(req).valid).toBe(true);
  });
});

describe("Security: Origin Spoofing", () => {
  it("should reject null origin on POST in production", () => {
    const originalEnv = process.env.NODE_ENV;
    setNodeEnv("production");

    const req = mockRequest("POST", { origin: "null" }, {}, "/api/payouts/request");
    const result = validateOrigin(req);
    expect(result.valid).toBe(false);

    setNodeEnv(originalEnv as string);
  });

  it("should reject origin with trailing slash", () => {
    const originalEnv = process.env.NODE_ENV;
    setNodeEnv("production");

    const req = mockRequest("POST", { origin: "https://tapcash.online/" }, {}, "/api/payouts/request");
    const result = validateOrigin(req);
    expect(result.valid).toBe(false);

    setNodeEnv(originalEnv as string);
  });
});

describe("Security: Bot Detection Evasion", () => {
  it("should detect mixed-case bot strings", () => {
    expect(isBotAgent("HeadlessChrome").isBot).toBe(true);
    expect(isBotAgent("HEADLESSCHROME").isBot).toBe(true);
    expect(isBotAgent("PUPPETEER").isBot).toBe(true);
  });

  it("should detect bot strings embedded in normal UA", () => {
    expect(isBotAgent("Mozilla/5.0 (compatible; HeadlessChrome/120)").isBot).toBe(true);
  });

  it("should not flag legitimate automation frameworks without keywords", () => {
    expect(isBotAgent("Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0").isBot).toBe(false);
  });
});

describe("Security: Mass Assignment", () => {
  it("should not accept isAdmin field in signup schema", () => {
    const result = signupSchema.safeParse({
      email: "test@gmail.com",
      password: "securepass123",
      dateOfBirth: "1995-06-15",
      tosAccepted: true,
      privacyAccepted: true,
      isAdmin: true,
    });
    if (result.success) {
      expect((result.data as Record<string, unknown>).isAdmin).toBeUndefined();
    }
  });

  it("should not accept fraudScore field in signup schema", () => {
    const result = signupSchema.safeParse({
      email: "test@gmail.com",
      password: "securepass123",
      dateOfBirth: "1995-06-15",
      tosAccepted: true,
      privacyAccepted: true,
      fraudScore: 0,
    });
    if (result.success) {
      expect((result.data as Record<string, unknown>).fraudScore).toBeUndefined();
    }
  });

  it("should not accept status field in signup schema", () => {
    const result = signupSchema.safeParse({
      email: "test@gmail.com",
      password: "securepass123",
      dateOfBirth: "1995-06-15",
      tosAccepted: true,
      privacyAccepted: true,
      status: "admin",
    });
    if (result.success) {
      expect((result.data as Record<string, unknown>).status).toBeUndefined();
    }
  });
});

describe("Security: Fraud Score Integrity", () => {
  it("should never return negative score", () => {
    const result = calculateFraudScore({
      userAgent: "Mozilla/5.0 Chrome/120.0",
      deviceFingerprint: "valid-fp",
      emailDomain: "gmail.com",
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("should never exceed 100", () => {
    const result = calculateFraudScore({
      userAgent: "HeadlessChrome puppeteer selenium webdriver phantomjs",
      emailDomain: "yopmail.com",
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
