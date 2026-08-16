import { getClientIp, isBotAgent, calculateFraudScore } from "../antiFraud";
import type { NextRequest } from "next/server";

jest.mock("@/lib/audit", () => ({
  logFraudFlag: jest.fn().mockResolvedValue(undefined),
}));

function mockRequest(headers: Record<string, string> = {}): NextRequest {
  return {
    headers: new Headers(headers),
  } as unknown as NextRequest;
}

describe("Anti-Fraud: getClientIp", () => {
  it("should extract IP from x-forwarded-for header", () => {
    const req = mockRequest({ "x-forwarded-for": "203.0.113.50, 10.0.0.1" });
    expect(getClientIp(req)).toBe("203.0.113.50");
  });

  it("should fall back to x-real-ip", () => {
    const req = mockRequest({ "x-real-ip": "198.51.100.1" });
    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("should return 127.0.0.1 when no headers present", () => {
    const req = mockRequest();
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("should trim whitespace from forwarded IP", () => {
    const req = mockRequest({ "x-forwarded-for": "  203.0.113.50 , 10.0.0.1  " });
    expect(getClientIp(req)).toBe("203.0.113.50");
  });
});

describe("Anti-Fraud: isBotAgent", () => {
  it("should detect headless Chrome", () => {
    const result = isBotAgent("Mozilla/5.0 HeadlessChrome/120.0");
    expect(result.isBot).toBe(true);
    expect(result.reason).toContain("headless");
  });

  it("should detect Puppeteer", () => {
    const result = isBotAgent("Mozilla/5.0 puppeteer/21.0");
    expect(result.isBot).toBe(true);
  });

  it("should detect Playwright", () => {
    const result = isBotAgent("Playwright/1.40.0");
    expect(result.isBot).toBe(true);
  });

  it("should detect curl", () => {
    const result = isBotAgent("curl/8.1.2");
    expect(result.isBot).toBe(true);
  });

  it("should detect python-requests", () => {
    const result = isBotAgent("python-requests/2.31.0");
    expect(result.isBot).toBe(true);
  });

  it("should allow normal Chrome browser", () => {
    const result = isBotAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");
    expect(result.isBot).toBe(false);
  });

  it("should allow normal Safari browser", () => {
    const result = isBotAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15");
    expect(result.isBot).toBe(false);
  });

  it("should allow normal mobile browser", () => {
    const result = isBotAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148");
    expect(result.isBot).toBe(false);
  });
});

describe("Anti-Fraud: calculateFraudScore", () => {
  it("should return 0 for a clean signup", () => {
    const result = calculateFraudScore({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
      deviceFingerprint: "abc123def456",
      emailDomain: "gmail.com",
      ip: "203.0.113.50",
    });
    expect(result.score).toBe(0);
    expect(result.riskFactors).toHaveLength(0);
    expect(result.disposableEmail).toBe(false);
    expect(result.botDetected).toBe(false);
  });

  it("should add 20 points for bot user agent", () => {
    const result = calculateFraudScore({
      userAgent: "HeadlessChrome/120.0",
      deviceFingerprint: "abc123",
      emailDomain: "gmail.com",
    });
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.botDetected).toBe(true);
  });

  it("should add 15 points for disposable email", () => {
    const result = calculateFraudScore({
      userAgent: "Mozilla/5.0 Chrome/120.0",
      deviceFingerprint: "abc123",
      emailDomain: "yopmail.com",
    });
    expect(result.score).toBeGreaterThanOrEqual(15);
    expect(result.disposableEmail).toBe(true);
  });

  it("should add 10 points for missing fingerprint", () => {
    const result = calculateFraudScore({
      userAgent: "Mozilla/5.0 Chrome/120.0",
      emailDomain: "gmail.com",
    });
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.riskFactors).toContain("Missing device fingerprint");
  });

  it("should cap score at 100", () => {
    const result = calculateFraudScore({
      userAgent: "HeadlessChrome puppeteer selenium",
      emailDomain: "mailinator.com",
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should combine multiple risk factors", () => {
    const result = calculateFraudScore({
      userAgent: "HeadlessChrome/120.0",
      emailDomain: "tempmail.com",
    });
    expect(result.score).toBeGreaterThanOrEqual(35);
    expect(result.riskFactors.length).toBeGreaterThanOrEqual(2);
  });
});
